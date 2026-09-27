import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import db from '../db/conn.mjs';
import { ObjectId } from 'mongodb';

// ฟังก์ชัน Login
export const login = async (req, res) => {
    try {
        const { studentId, password } = req.body;

        if (!studentId || !password) {
            return res.status(400).json({ message: 'กรุณากรอกรหัสประจำตัวและรหัสผ่าน' });
        }

        const usersCollection = db.collection('users');
        const user = await usersCollection.findOne({ studentOrStaffId: studentId.trim() });

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
                studentOrStaffId: user.studentOrStaffId
            }
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์' });
    }
};

// ฟังก์ชัน Register (บังคับกรอกรหัสนักศึกษา/บุคลากรจริง)
export const register = async (req, res) => {
    try {
        const { password, name, role, department, phone } = req.body;
        const studentOrStaffId = (req.body.studentOrStaffId || req.body.studentId || req.body.staffstudentId || '').trim();

        // 1. ตรวจสอบฟิลด์สำคัญ (ตัด email ออกแล้ว)
        if (!password || !name || !studentOrStaffId) {
            return res.status(400).json({ 
                message: 'กรุณากรอกข้อมูลให้ครบถ้วน: ชื่อ, รหัสนักศึกษา/บุคลากร และรหัสผ่าน' 
            });
        }

        const usersCollection = db.collection('users');

        // 2. เช็คว่ารหัสนักศึกษา/บุคลากรนี้มีในระบบหรือยัง (ใช้เป็นตัวระบุตัวตนหลัก ห้ามซ้ำ)
        const existingStudentId = await usersCollection.findOne({ studentOrStaffId });
        if (existingStudentId) {
            return res.status(400).json({ message: 'รหัสนักศึกษา/บุคลากรนี้มีในระบบแล้ว' });
        }

        // 3. แฮชรหัสผ่าน
        const hashedPassword = await bcrypt.hash(password, 10);

        // 4. บันทึกข้อมูลลง Database
        const newUser = {
            studentOrStaffId: studentOrStaffId,
            name: name.trim(),
            department: department || '',
            phone: phone || '',
            password: hashedPassword,
            role: role || 'นักศึกษา',
            createdAt: new Date()
        };

        const result = await usersCollection.insertOne(newUser);
        res.status(201).json({ 
            message: 'ลงทะเบียนสำเร็จเรียบร้อย', 
            userId: result.insertedId 
        });

    } catch (error) {
        console.error('Register Error:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการลงทะเบียน' });
    }
};


export const me = async (req, res) => {
    try {
        const userCollection = db.collection('users')
        const user = await userCollection.findOne(
            {
                _id :  new ObjectId(req.user.userId)
            },
            {
                projection : {password : 0}
            }
        )

        if (!user) {
            return res.status(404).json({message : "Not found"})
        }

        res.status(200).json(
            {
                user : { 
                    id : user._id,
                    name: user.name,
                    studentOrStaffId: user.studentOrStaffId,
                    department: user.department,
                    phone: user.phone,
                    role: user.role
                }
            }
        )
    } catch (error) {
        console.error('Register Error:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    }
}