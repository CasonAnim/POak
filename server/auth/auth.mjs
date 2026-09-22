import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import 'dotenv/config'; // โหลดตัวแปรจากไฟล์ .env
import db from '../db/conn.mjs'; // นำเข้า db จากไฟล์ conn.mjs

// ใช้คำสั่ง export const ตรงนี้แทน module.exports ด้านล่าง
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // ตรวจสอบว่าส่งข้อมูลมาครบหรือไม่
        if (!email || !password) {
            return res.status(400).json({ message: 'กรุณากรอกอีเมลและรหัสผ่านให้ครบถ้วน' });
        }

        // 1. เลือก Collection 'users' (ใช้ตัวแปร db ที่ import มาได้เลย)
        const usersCollection = db.collection('users');

        // 2. ค้นหาผู้ใช้จาก Email
        const user = await usersCollection.findOne({ email: email });
        
        if (!user) {
            return res.status(401).json({ message: 'อีเมล หรือ รหัสผ่านไม่ถูกต้อง' });
        }

        // 3. เปรียบเทียบรหัสผ่าน (ที่ผู้ใช้พิมพ์มา) กับรหัสผ่านที่เข้ารหัสไว้ใน Database
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        
        if (!isPasswordMatch) {
            return res.status(401).json({ message: 'อีเมล หรือ รหัสผ่านไม่ถูกต้อง' });
        }

        // 4. สร้าง JWT Token 
        const payload = {
            userId: user._id,
            role: user.role, // สิทธิ์: Admin, อาจารย์, หรือ นักศึกษา
            name: user.name,
            studentOrStaffId: user.studentOrStaffId
        };

        const secretKey = process.env.JWT_SECRET || 'your_secret_key_here';
        const token = jwt.sign(payload, secretKey, { expiresIn: '1d' }); // Token หมดอายุใน 1 วัน

        // 5. ส่ง Response กลับไปยังหน้าเว็บ
        res.status(200).json({
            message: 'เข้าสู่ระบบสำเร็จ',
            token: token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์' });
    }
};

// ฟังก์ชันสำหรับสร้างผู้ใช้ใหม่ (เพื่อใช้ทดสอบ)
export const register = async (req, res) => {
    try {
        const { email, password, name, role } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
        }

        const usersCollection = db.collection('users');
        
        // เช็คว่ามีอีเมลนี้หรือยัง
        const existingUser = await usersCollection.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'อีเมลนี้ถูกใช้งานแล้ว' });
        }

        // เข้ารหัสผ่านก่อนบันทึกลง Database
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = {
            email,
            password: hashedPassword,
            name: name || "User Test",
            role: role || "นักศึกษา",
            studentOrStaffId: "STD" + Math.floor(Math.random() * 10000)
        };

        const result = await usersCollection.insertOne(newUser);
        res.status(201).json({ message: 'สร้างผู้ใช้สำเร็จ', userId: result.insertedId });

    } catch (error) {
        console.error('Register Error:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
};