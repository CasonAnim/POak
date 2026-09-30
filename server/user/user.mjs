import User from '../models/User.mjs';

// GET /api/users - ดึงรายชื่อผู้ใช้ทั้งหมด (ยกเว้นรหัสผ่าน)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json(users);
  } catch (error) {
    console.error('Fetch users error:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้' });
  }
};

// PUT /api/users/:id/role - เลื่อนขั้น / ปรับระดับสิทธิ์
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const allowedRoles = ['นักศึกษา', 'admin'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: 'บทบาท (Role) ที่ระบุไม่ถูกต้อง' });
    }

    // ดึง ID ของคนที่กำลังล็อกอินอยู่แบบปลอดภัย (รองรับทั้ง _id และ id)
    const currentUserId = req.user?._id?.toString() || req.user?.id?.toString();

    // ป้องกันไม่ให้ Admin เผลอลดสิทธิ์ตัวเอง
    if (currentUserId && currentUserId === id && role !== 'admin') {
      return res.status(400).json({ message: 'ไม่สามารถลดระดับสิทธิ์บัญชีของตัวเองได้' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'ไม่พบผู้ใช้งานนี้ในระบบ' });
    }

    res.status(200).json({
      message: `ปรับบทบาทของ ${updatedUser.name} เป็น "${role}" เรียบร้อยแล้ว`,
      user: updatedUser
    });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการปรับเปลี่ยนบทบาทผู้ใช้' });
  }
};