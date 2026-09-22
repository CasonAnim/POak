import db from '../db/conn.mjs';
import { ObjectId } from 'mongodb'; // ต้องใช้ ObjectId ในการค้นหา _id ของ MongoDB

// 1. ดึงข้อมูลอุปกรณ์ทั้งหมด (GET)
export const getAllEquipments = async (req, res) => {
    try {
        const collection = db.collection('equipments');
        const equipments = await collection.find({}).toArray();
        res.status(200).json(equipments);
    } catch (error) {
        console.error('Get Equipments Error:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลอุปกรณ์' });
    }
};

// 2. เพิ่มอุปกรณ์ใหม่ (POST)
export const addEquipment = async (req, res) => {
    try {
        const { equipCode, name, type, totalQuantity, image, details } = req.body;

        // ตรวจสอบข้อมูลเบื้องต้น
        if (!equipCode || !name || !type || totalQuantity === undefined) {
            return res.status(400).json({ message: 'กรุณากรอก รหัสอุปกรณ์, ชื่อ, ประเภท และจำนวนให้ครบถ้วน' });
        }

        const collection = db.collection('equipments');
        
        // เช็คว่ารหัสอุปกรณ์ซ้ำไหม
        const existingEquip = await collection.findOne({ equipCode });
        if (existingEquip) {
            return res.status(400).json({ message: 'รหัสอุปกรณ์นี้มีอยู่ในระบบแล้ว' });
        }

        // โครงสร้างข้อมูลอุปกรณ์ตาม Requirement
        const newEquipment = {
            equipCode, // รหัสอุปกรณ์
            name, // ชื่ออุปกรณ์
            type, // ประเภท: 'ครุภัณฑ์' หรือ 'วัสดุสิ้นเปลือง'
            totalQuantity: Number(totalQuantity), // จำนวนทั้งหมด
            availableQuantity: Number(totalQuantity), // จำนวนคงเหลือ (เริ่มต้นจะเท่ากับจำนวนทั้งหมด)
            image: req.file ? req.file.filename : (image || ''), // รูปภาพ (เก็บเป็น URL หรือชื่อไฟล์)
            details: details || '', // รายละเอียด
            status: 'พร้อมใช้งาน', // สถานะเริ่มต้น
            createdAt: new Date()
        };

        const result = await collection.insertOne(newEquipment);
        res.status(201).json({ message: 'เพิ่มอุปกรณ์สำเร็จ', equipmentId: result.insertedId });

    } catch (error) {
        console.error('Add Equipment Error:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเพิ่มอุปกรณ์' });
    }
};

// 3. อัปเดตข้อมูลอุปกรณ์ (PUT)
export const updateEquipment = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const collection = db.collection('equipments');
        
        // ใช้ $set เพื่ออัปเดตเฉพาะฟิลด์ที่ส่งมา
        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'ไม่พบอุปกรณ์ที่ต้องการแก้ไข' });
        }

        res.status(200).json({ message: 'อัปเดตข้อมูลอุปกรณ์สำเร็จ' });
    } catch (error) {
        console.error('Update Equipment Error:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล' });
    }
};


// ฟังก์ชันลบอุปกรณ์
export const deleteEquipment = async (req, res) => {
    try {
        const { id } = req.params;
        const collection = db.collection('equipments');
        
        const result = await collection.deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'ไม่พบอุปกรณ์ที่ต้องการลบ' });
        }
        res.status(200).json({ message: 'ลบอุปกรณ์สำเร็จ' });
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการลบอุปกรณ์' });
    }
};

// ฟังก์ชันแจ้งอุปกรณ์เสีย/ชำรุด/สูญหาย
export const reportIssue = async (req, res) => {
    try {
        const { id } = req.params;
        const { issueType, quantity } = req.body; // issueType: 'ชำรุด' หรือ 'สูญหาย'

        if (!issueType || !quantity) {
            return res.status(400).json({ message: 'กรุณาระบุประเภทปัญหาและจำนวน' });
        }

        const collection = db.collection('equipments');
        
        // ลดจำนวน availableQuantity และไปเพิ่มจำนวนในฟิลด์ชำรุดหรือสูญหาย
        const updateQuery = {
            $inc: { 
                availableQuantity: -Number(quantity),
                [issueType === 'ชำรุด' ? 'defectiveQuantity' : 'lostQuantity']: Number(quantity)
            }
        };

        const result = await collection.updateOne({ _id: new ObjectId(id) }, updateQuery);
        
        if (result.matchedCount === 0) return res.status(404).json({ message: 'ไม่พบอุปกรณ์' });
        res.status(200).json({ message: `บันทึกสถานะ ${issueType} จำนวน ${quantity} รายการสำเร็จ` });
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการแจ้งปัญหา' });
    }
};