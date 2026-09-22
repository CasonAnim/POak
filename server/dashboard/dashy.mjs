import db from '../db/conn.mjs';

export const getDashboardStats = async (req, res) => {
    try {
        const equipmentCollection = db.collection('equipments');
        const transactionCollection = db.collection('transactions');

        // 1. คำนวณภาพรวมอุปกรณ์
        const equipments = await equipmentCollection.find({}).toArray();
        let totalEquipments = 0;
        let totalAvailable = 0;
        
        equipments.forEach(eq => {
            totalEquipments += Number(eq.totalQuantity || 0);
            totalAvailable += Number(eq.availableQuantity || 0);
        });
        const totalBorrowed = totalEquipments - totalAvailable;

        // 2. นับรายการคำขอยืมที่ "รออนุมัติ"
        const pendingRequests = await transactionCollection.countDocuments({ status: 'รออนุมัติ' });

        // 3. นับรายการที่ "เกินกำหนดคืน" (สถานะอนุมัติแล้ว แต่วันที่คืนน้อยกว่าวันปัจจุบัน)
        const today = new Date();
        const overdueTransactions = await transactionCollection.countDocuments({
            status: 'อนุมัติ',
            expectedReturnDate: { $lt: today }
        });

        // 4. ดึงประวัติการเคลื่อนไหวล่าสุด 5 รายการ (จัดเรียงตามวันที่สร้างล่าสุด)[cite: 8]
        const recentTransactions = await transactionCollection
            .find({})
            .sort({ createdAt: -1 })
            .limit(5)
            .toArray();

        // 5. ส่งข้อมูลทั้งหมดกลับไปเป็นก้อนเดียว
        res.status(200).json({
            overview: {
                totalEquipments,    // อุปกรณ์ทั้งหมด
                totalAvailable,     // คงเหลือในคลัง
                totalBorrowed       // ถูกยืมไป
            },
            requests: {
                pending: pendingRequests, // รออนุมัติ
                overdue: overdueTransactions // เกินกำหนดคืน
            },
            recentTransactions
        });

    } catch (error) {
        console.error('Dashboard Error:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลสถิติ' });
    }
};