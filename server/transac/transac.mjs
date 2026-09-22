import db from '../db/conn.mjs';
import { ObjectId } from 'mongodb';

// ฟังก์ชันสำหรับนักศึกษา: ส่งคำขอยืมอุปกรณ์
export const requestBorrow = async (req, res) => {
    try {
        // รับข้อมูลมาจาก Body ที่ฝั่งหน้าเว็บส่งมา
        const { project, purpose, expectedReturnDate, items } = req.body;

        if (!project || !items || items.length === 0) {
            return res.status(400).json({ message: 'กรุณาระบุโปรเจกต์และรายการอุปกรณ์ที่ต้องการยืม' });
        }

        const transactionCollection = db.collection('transactions');

        // สร้าง Object บันทึกการยืม
        const newBorrowRequest = {
            userId: new ObjectId(req.user.userId), // ดึงไอดีคนยืมมาจาก Token (Middleware)
            userName: req.user.name, 
            role: req.user.role,
            project: project, // โปรเจกต์/วิชา
            purpose: purpose || '', // วัตถุประสงค์[cite: 8]
            borrowDate: new Date(), // วันที่ทำเรื่องยืม[cite: 8]
            expectedReturnDate: new Date(expectedReturnDate), // กำหนดคืน[cite: 8]
            items: items, // รายการอุปกรณ์ (อาร์เรย์ของ { equipmentId, quantity })[cite: 8]
            status: 'รออนุมัติ', // สถานะเริ่มต้น รอ Admin มาตรวจ
            createdAt: new Date()
        };

        const result = await transactionCollection.insertOne(newBorrowRequest);
        res.status(201).json({ message: 'ส่งคำขอยืมสำเร็จ รอผู้ดูแลระบบอนุมัติ', transactionId: result.insertedId });

    } catch (error) {
        console.error('Request Borrow Error:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการส่งคำขอยืม' });
    }
};

// ฟังก์ชันดึงรายการยืมทั้งหมด (สำหรับ Admin ดู)
export const getAllTransactions = async (req, res) => {
    try {
        const transactionCollection = db.collection('transactions');
        const transactions = await transactionCollection.find({}).sort({ createdAt: -1 }).toArray();
        res.status(200).json(transactions);
    } catch (error) {
        console.error('Get Transactions Error:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลการยืม' });
    }
};

export const updateTransactionStatus = async (req, res) => {
    try {
        const { id } = req.params; // รับ ID ของรายการยืมจาก URL
        const { status } = req.body; // รับสถานะที่จะเปลี่ยน (เช่น 'อนุมัติ', 'ไม่อนุมัติ')

        if (!status) {
            return res.status(400).json({ message: 'กรุณาระบุสถานะ' });
        }

        const transactionCollection = db.collection('transactions');
        const equipmentCollection = db.collection('equipments');

        // 1. ค้นหารายการยืมจาก Database
        const transaction = await transactionCollection.findOne({ _id: new ObjectId(id) });
        if (!transaction) {
            return res.status(404).json({ message: 'ไม่พบรายการคำขอยืมนี้' });
        }

        // ป้องกันการกดอนุมัติซ้ำซ้อน (ถ้าไม่ใช่ 'รออนุมัติ' แปลว่าทำไปแล้ว)
        if (transaction.status !== 'รออนุมัติ') {
            return res.status(400).json({ message: 'รายการนี้ถูกดำเนินการไปแล้ว' });
        }

        // 2. ถ้า Admin กด "อนุมัติ" ให้ไปตัด Stock อุปกรณ์ (ลดจำนวน availableQuantity)
        if (status === 'อนุมัติ') {
            for (let item of transaction.items) {
                await equipmentCollection.updateOne(
                    { _id: new ObjectId(item.equipmentId) },
                    // $inc คือการเพิ่ม/ลดค่าตัวเลข ในที่นี้ใส่ค่าลบ (-) เพื่อลดจำนวน
                    { $inc: { availableQuantity: -Number(item.quantity) } } 
                );
            }
        }

        // 3. อัปเดตสถานะของรายการยืมนั้นๆ
        await transactionCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { status: status, updatedAt: new Date() } }
        );

        res.status(200).json({ message: `เปลี่ยนสถานะเป็น ${status} สำเร็จ` });

    } catch (error) {
        console.error('Update Status Error:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัปเดตสถานะ' });
    }
};

// ฟังก์ชันสำหรับ Admin: รับคืนอุปกรณ์และบวก Stock กลับเข้าคลัง
export const returnEquipment = async (req, res) => {
    try {
        const { id } = req.params; // รับ ID ของรายการยืม

        const transactionCollection = db.collection('transactions');
        const equipmentCollection = db.collection('equipments');

        // 1. ค้นหารายการยืม
        const transaction = await transactionCollection.findOne({ _id: new ObjectId(id) });
        if (!transaction) {
            return res.status(404).json({ message: 'ไม่พบรายการนี้' });
        }

        // ป้องกันการกดคืนซ้ำ หรือรายการที่ยังไม่ได้ยืม
        if (transaction.status !== 'อนุมัติ') {
            return res.status(400).json({ message: 'รายการนี้ยังไม่ได้ถูกอนุมัติ หรือถูกคืนไปแล้ว' });
        }

        // 2. คืนของเข้า Stock (เพิ่ม availableQuantity กลับเข้าไป)[cite: 8]
        for (let item of transaction.items) {
            await equipmentCollection.updateOne(
                { _id: new ObjectId(item.equipmentId) },
                { $inc: { availableQuantity: Number(item.quantity) } } // ใช้ค่าบวก เพื่อเพิ่มจำนวน
            );
        }

        // 3. อัปเดตสถานะว่า "คืนแล้ว" และเก็บวันที่คืนจริง[cite: 8]
        await transactionCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { 
                status: 'คืนแล้ว', 
                actualReturnDate: new Date(), 
                updatedAt: new Date() 
            } }
        );

        res.status(200).json({ message: 'รับคืนอุปกรณ์และปรับ Stock กลับเข้าคลังสำเร็จ' });

    } catch (error) {
        console.error('Return Error:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการคืนอุปกรณ์' });
    }
};