import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import User from '../models/User.mjs';

// ฟังก์ชัน Login
export const login = async (req, res) => {
  try {
    const { studentId, password } = req.body;

    if (!studentId || !password) {
      return res.status(400).json({ message: 'กรุณากรอกรหัสประจำตัวและรหัสผ่าน' });
    }

    // Mongoose: findOne
    const user = await User.findOne({ studentOrStaffId: studentId.trim() });

    if (!user) {
      return res.status(401).json({ message: 'รหัสประจำตัว หรือ รหัสผ่านไม่ถูกต้อง' });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'รหัสประจำตัว หรือ รหัสผ่านไม่ถูกต้อง' });
    }

    const payload = {
      userId: user._id,
      role: user.role,
      name: user.name,
      studentOrStaffId: user.studentOrStaffId
    };

    const secretKey = process.env.JWT_SECRET || 'your_secret_key_here';
    const token = jwt.sign(payload, secretKey, { expiresIn: '1d' });

    res.status(200).json({
      message: 'เข้าสู่ระบบสำเร็จ',
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        studentOrStaffId: user.studentOrStaffId,
        email: user.email || ''
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์' });
  }
};

// ฟังก์ชัน Register
export const register = async (req, res) => {
  try {
    // ไม่รับ role จาก request เด็ดขาด — กันคนสมัครเป็น admin/อาจารย์เองได้
    const { password, name, department, phone } = req.body;
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const studentOrStaffId = (req.body.studentOrStaffId || req.body.studentId || req.body.staffstudentId || '').trim();

    if (!password || !name || !studentOrStaffId) {
      return res.status(400).json({
        message: 'กรุณากรอกข้อมูลให้ครบถ้วน: ชื่อ, รหัสนักศึกษา/บุคลากร และรหัสผ่าน'
      });
    }

    // Mongoose: เช็คซ้ำ
    const existingStudentId = await User.findOne({ studentOrStaffId });
    if (existingStudentId) {
      return res.status(400).json({ message: 'รหัสนักศึกษา/บุคลากรนี้มีในระบบแล้ว' });
    }

    // อีเมลไม่บังคับ แต่ถ้ากรอกต้องถูกรูปแบบและไม่ซ้ำกับคนอื่น
    if (email) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ message: 'รูปแบบอีเมลไม่ถูกต้อง' });
      }
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({ message: 'อีเมลนี้มีในระบบแล้ว' });
      }
    }

    // บัญชีแรกของระบบ (ฐานข้อมูลยังว่าง) จะเป็น admin อัตโนมัติ เพื่อให้มีคนเริ่มจัดการระบบได้
    // ทุกบัญชีหลังจากนั้นจะเป็น 'นักศึกษา' เสมอ — แอดมินเป็นคนเลื่อนบทบาทให้เองที่หน้า "จัดการผู้ใช้"
    const hasUsers = await User.exists({});
    const assignedRole = hasUsers ? 'นักศึกษา' : 'admin';

    const hashedPassword = await bcrypt.hash(password, 10);

    // Mongoose: สร้าง Document และบันทึก
    const newUser = new User({
      studentOrStaffId,
      name: name.trim(),
      // ใส่ฟิลด์ email เฉพาะตอนที่มีค่า (กัน '' ไปชนกับ unique index)
      ...(email && { email }),
      department: department || '',
      phone: phone || '',
      password: hashedPassword,
      role: assignedRole
    });

    const savedUser = await newUser.save();
    res.status(201).json({
      message: 'ลงทะเบียนสำเร็จเรียบร้อย',
      userId: savedUser._id
    });
  } catch (error) {
    console.error('Register Error:', error);
    // กรณี 2 คนสมัครด้วยอีเมลเดียวกันพร้อมกัน (ชน unique index)
    if (error.code === 11000) {
      return res.status(400).json({ message: 'รหัสประจำตัวหรืออีเมลนี้มีในระบบแล้ว' });
    }
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการลงทะเบียน' });
  }
};

// ฟังก์ชัน Me (ดึงข้อมูลผู้ใช้ปัจจุบัน)
export const me = async (req, res) => {
  try {
    // Mongoose: findById พร้อมตัด password ทิ้ง
    const user = await User.findById(req.user.userId).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Not found' });
    }

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        studentOrStaffId: user.studentOrStaffId,
        email: user.email || '',
        department: user.department,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Me Error:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
  }
};
