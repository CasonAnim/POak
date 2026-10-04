import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    studentOrStaffId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      // ไม่บังคับกรอก (ผู้ใช้เก่าไม่มีอีเมล) แต่ถ้ามีต้องรูปแบบถูกต้อง
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'รูปแบบอีเมลไม่ถูกต้อง'],
      // unique + sparse: อีเมลห้ามซ้ำ แต่ผู้ใช้ที่ยังไม่มีอีเมลหลายคนอยู่ร่วมกันได้
      unique: true,
      sparse: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      default: 'นักศึกษา'
    },
    department: {
      type: String,
      default: ''
    },
    phone: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model('User', userSchema);
