import Transaction from '../models/Transaction.mjs';
import Equipment from '../models/Equipment.mjs';

// ฟังก์ชันสำหรับนักศึกษา: ส่งคำขอยืมอุปกรณ์
export const requestBorrow = async (req, res) => {
  try {
    const { project, purpose, expectedReturnDate, items } = req.body;

    if (!project || !items || items.length === 0) {
      return res.status(400).json({ message: 'กรุณาระบุโปรเจกต์และรายการอุปกรณ์ที่ต้องการยืม' });
    }

    // สร้าง Transaction ใหม่ผ่าน Mongoose
    const newBorrowRequest = new Transaction({
      userId: req.user.userId || req.user.id || req.user._id,
      userName: req.user.name,
      role: req.user.role,
      project,
      purpose: purpose || '',
      borrowDate: new Date(),
      expectedReturnDate: new Date(expectedReturnDate),
      items, // อาร์เรย์ [{ equipmentId, quantity }]
      status: 'รออนุมัติ'
    });

    const savedTransaction = await newBorrowRequest.save();
    res.status(201).json({ 
      message: 'ส่งคำขอยืมสำเร็จ รอผู้ดูแลระบบอนุมัติ', 
      transactionId: savedTransaction._id 
    });
  } catch (error) {
    console.error('Request Borrow Error:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการส่งคำขอยืม' });
  }
};

// ฟังก์ชันดึงรายการยืมทั้งหมด (Admin ดูทั้งหมด, นักศึกษาดูเฉพาะของตนเอง)
export const getAllTransactions = async (req, res) => {
  try {
    console.log('req.user payload:', req.user); // ดูว่า Token ส่งอะไรมาบ้าง

    const currentUserId = (req.user?.id || req.user?._id || req.user?.userId || '').toString();
    const userRole = (req.user?.role || '').toLowerCase();
    
    // เติมบทบาทให้ครอบคลุม (รวมถึง 'อาจารย์')
    const isAdmin = 
      userRole === 'admin' || 
      userRole === 'แอดมิน' || 
      userRole === 'อาจารย์' || 
      userRole === 'เจ้าหน้าที่';


    let queryFilter = {};
    if (!isAdmin) {
      queryFilter = { userId: currentUserId };
    }

   

    const transactions = await Transaction.find(queryFilter)
      .populate('userId', 'name studentOrStaffId department phone role email')
      .populate('items.equipmentId', 'name code image')
      .sort({ createdAt: -1 });


    res.status(200).json(transactions);
  } catch (error) {
    console.error('Get Transactions Error:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลรายการ' });
  }
};

export const approveTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 1. ดึง Transaction พร้อม Populate ข้อมูลอุปกรณ์
    const transaction = await Transaction.findById(id).populate('items.equipmentId');
    if (!transaction) {
      return res.status(404).json({ message: 'ไม่พบรายการคำขอนี้' });
    }

    if (transaction.status !== 'รออนุมัติ') {
      return res.status(400).json({ message: 'รายการนี้ได้รับการดำเนินการไปแล้ว' });
    }

    let hasConsumableOnly = true;

    // 2. วนลูปตัด Stock
    for (let item of transaction.items) {
      const eq = item.equipmentId;
      const quantity = Number(item.quantity) || 1;

      // ตรวจสอบว่า populate ติดหรือไม่ (ถ้าติด eq ต้องเป็น Object และมี _id)
      if (!eq || !eq._id) {
        console.log("⚠️ ข้ามรายการ: ดึงข้อมูลอุปกรณ์ไม่สำเร็จ (Populate ไม่ติด)");
        continue;
      }

      // ดึง type หรือ category ออกมาเช็คให้ชัวร์ (ใช้ .trim() ตัดช่องว่างทิ้ง)
      const eqType = (eq.type || eq.category || '').trim();
      
      console.log(`📦 กำลังประมวลผล: ${eq.name} | ประเภท: [${eqType}] | จำนวน: ${quantity}`);

      if (eqType === 'วัสดุสิ้นเปลือง') {
        console.log(`🔥 ตัดสต็อกวัสดุสิ้นเปลือง ถาวร: -${quantity}`);
        await Equipment.findByIdAndUpdate(eq._id, {
          $inc: {
            availableQuantity: -quantity,
            totalQuantity: -quantity
          }
        });
      } else {
        console.log(`🔬 ตัดสต็อกครุภัณฑ์ (ยืม): -${quantity}`);
        hasConsumableOnly = false;
        await Equipment.findByIdAndUpdate(eq._id, {
          $inc: { availableQuantity: -quantity }
        });
      }
    }

    // 3. กำหนดสถานะคำขอ
    if (hasConsumableOnly) {
      transaction.status = 'คืนแล้ว'; // เปลี่ยนเป็นจบกระบวนการทันที
      transaction.actualReturnDate = new Date();
      transaction.issueDescription = 'เบิกใช้วัสดุสิ้นเปลือง (ตัดสต็อกแล้ว)';
    } else {
      transaction.status = 'อนุมัติแล้ว'; // รอคืน
    }

    await transaction.save();

    res.status(200).json({ 
      message: hasConsumableOnly ? 'อนุมัติการเบิกจ่ายวัสดุสิ้นเปลืองเรียบร้อย' : 'อนุมัติการยืมเรียบร้อย', 
      transaction 
    });
  } catch (error) {
    console.error('❌ Approve error:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอนุมัติ' });
  }
};
// 2. ปฏิเสธพร้อมเหตุผล (Admin Only)
export const rejectTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({ message: 'กรุณาระบุเหตุผลในการปฏิเสธ' });
    }

    const transaction = await Transaction.findById(id);
    if (!transaction) {
      return res.status(404).json({ message: 'ไม่พบรายการคำขอยืมนี้' });
    }
    if (transaction.status !== 'รออนุมัติ') {
      return res.status(400).json({ message: 'ปฏิเสธได้เฉพาะรายการที่รออนุมัติเท่านั้น' });
    }

    transaction.status = 'ปฏิเสธ';
    transaction.rejectReason = reason.trim();
    await transaction.save();

    res.status(200).json({ message: 'ปฏิเสธคำขอยืมสำเร็จ' });
  } catch (error) {
    console.error('Reject Error:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการปฏิเสธ' });
  }
};
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findByIdAndUpdate(
      id,
      { isReadByStudent: true },
      { new: true }
    );

    if (!transaction) {
      return res.status(404).json({ message: 'ไม่พบรายการคำขอ' });
    }

    res.status(200).json({ message: 'รับทราบรายการแล้ว', transaction });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
  }
};

export const returnEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    // รับทั้ง itemsReturnStatus หรือข้อความ issueDescription ตรงๆ จาก req.body
    const { itemsReturnStatus, issueDescription: directIssueDesc } = req.body;

    // 1. ค้นหารายการคำขอยืม
    const transaction = await Transaction.findById(id);
    if (!transaction) {
      return res.status(404).json({ message: 'ไม่พบรายการยืมนี้' });
    }

    // 2. เช็คสิทธิ์ (เจ้าของรายการ หรือ Admin)
    const currentUserId = (req.user?.userId || req.user?.id || req.user?._id || '').toString();
    const userRole = (req.user?.role || '').toLowerCase();
    const isAdmin = userRole === 'admin' || userRole === 'แอดมิน' || userRole === 'เจ้าหน้าที่';

    const transactionUserId = (transaction.userId?._id || transaction.userId || '').toString();
    if (!isAdmin && transactionUserId !== currentUserId) {
      return res.status(403).json({ message: 'คุณไม่มีสิทธิ์คืนรายการยืมของผู้อื่น' });
    }

    if (transaction.status !== 'อนุมัติ' && transaction.status !== 'อนุมัติแล้ว') {
      return res.status(400).json({ message: 'รายการนี้ยังไม่ได้ถูกอนุมัติ หรือถูกคืนไปแล้ว' });
    }

    let compiledDescriptions = [];

    // 3. วนลูปปรับปรุง Stock ของอุปกรณ์แต่ละรายการ
    if (Array.isArray(transaction.items)) {
      for (let item of transaction.items) {
        const eqId = item.equipmentId?._id || item.equipmentId;
        const totalBorrowed = Number(item.quantity) || 1;

        // ค้นหาข้อมูลสภาพของชิ้นนี้ที่ส่งมาจาก Modal
        const statusItem = itemsReturnStatus?.find(
          (s) => String(s.equipmentId) === String(eqId)
        );

        const defectiveAmount = statusItem ? Number(statusItem.defectiveAmount || 0) : 0;
        const issueType = statusItem?.issueType; // 'ชำรุด' หรือ 'สูญหาย'
        const note = statusItem?.note?.trim() || '';

        // ชิ้นส่วนปกติที่จะนำกลับเข้าคลัง = จำนวนที่ยืม - จำนวนที่เสีย
        const goodQuantity = Math.max(0, totalBorrowed - defectiveAmount);

        const incOperations = {};

        // บวกของดีกลับเข้าสต็อกพร้อมใช้
        if (goodQuantity > 0) {
          incOperations.availableQuantity = goodQuantity;
        }

        // ถ้ามีชำรุดหรือสูญหาย ให้บวกเข้า defectiveQuantity หรือ lostQuantity
        if (defectiveAmount > 0 && issueType) {
          const field = issueType === 'ชำรุด' ? 'defectiveQuantity' : 'lostQuantity';
          incOperations[field] = defectiveAmount;

          compiledDescriptions.push(
            `[${issueType} ${defectiveAmount} ชิ้น] ${note ? `อาการ: ${note}` : 'ไม่ระบุรายละเอียด'}`
          );
        }

        // อัปเดตลงตาราง equipments
        if (Object.keys(incOperations).length > 0) {
          await Equipment.findByIdAndUpdate(eqId, { $inc: incOperations });
        }
      }
    }

    // 4. บันทึก Transaction
    transaction.status = 'คืนแล้ว';
    transaction.actualReturnDate = new Date(); // บันทึกวัน-เวลาที่ส่งคืนจริง

    // รวมข้อความอาการชำรุด/สูญหาย หรือใช้ข้อความที่แนบมา
    if (compiledDescriptions.length > 0) {
      transaction.issueDescription = compiledDescriptions.join(' | ');
    } else if (directIssueDesc) {
      transaction.issueDescription = directIssueDesc;
    } else {
      transaction.issueDescription = 'อุปกรณ์สภาพปกติครบถ้วน';
    }

    await transaction.save();

    res.status(200).json({ message: 'บันทึกการคืนอุปกรณ์เรียบร้อยแล้ว', transaction });
  } catch (error) {
    console.error('Return error:', error);
    res.status(500).json({ message: error.message || 'เกิดข้อผิดพลาดในการคืนอุปกรณ์' });
  }
};