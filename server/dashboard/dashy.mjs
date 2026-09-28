import Equipment from '../models/Equipment.mjs';
import Transaction from '../models/Transaction.mjs';

export const getDashboardStats = async (req, res) => {
  try {
    // 1. ดึงอุปกรณ์ทั้งหมดเพื่อคำนวณ Stock
    const equipments = await Equipment.find({});
    let totalEquipments = 0;
    let totalAvailable = 0;

    equipments.forEach((eq) => {
      totalEquipments += Number(eq.totalQuantity || 0);
      totalAvailable += Number(eq.availableQuantity || 0);
    });
    const totalBorrowed = totalEquipments - totalAvailable;

    // 2. นับคำขอยืมที่ "รออนุมัติ"
    const pendingRequests = await Transaction.countDocuments({ status: 'รออนุมัติ' });

    // 3. นับรายการที่ "เกินกำหนดคืน"
    const today = new Date();
    const overdueTransactions = await Transaction.countDocuments({
      status: { $in: ['อนุมัติ', 'อนุมัติแล้ว'] },
      expectedReturnDate: { $lt: today }
    });

    // 4. ดึงประวัติ 5 รายการล่าสุด
    const recentTransactions = await Transaction.find({})
      .populate('items.equipmentId', 'name equipCode image')
      .sort({ createdAt: -1 })
      .limit(5);

    // 5. ส่งข้อมูลกลับ
    res.status(200).json({
      overview: {
        totalEquipments,
        totalAvailable,
        totalBorrowed
      },
      requests: {
        pending: pendingRequests,
        overdue: overdueTransactions
      },
      recentTransactions
    });
  } catch (error) {
    console.error('Dashboard Error:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลสถิติ' });
  }
};