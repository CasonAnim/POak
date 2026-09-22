import jwt from 'jsonwebtoken';
import 'dotenv/config';

// 1. ฟังก์ชันตรวจว่ามีการ Login (มี Token) หรือไม่
export const verifyToken = (req, res, next) => {
    // ดึง Token จาก Header ที่ส่งมา
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
        return res.status(403).json({ message: 'ไม่มี Token สำหรับเข้าถึงข้อมูล' });
    }

    // รูปแบบ Header จะเป็น "Bearer <token>" เราต้องตัดเอาเฉพาะ token
    const token = authHeader.split(' ')[1]; 
    if (!token) {
        return res.status(403).json({ message: 'รูปแบบ Token ไม่ถูกต้อง' });
    }

    try {
        const secretKey = process.env.JWT_SECRET || 'your_secret_key_here';
        // ถอดรหัส Token
        const decoded = jwt.verify(token, secretKey);
        
        // เอาข้อมูลที่ถอดรหัสได้ (เช่น userId, role) ฝากไว้ใน req.user เพื่อให้ Controller เอาไปใช้ต่อ
        req.user = decoded; 
        next(); // ผ่านด่าน! ให้ไปทำฟังก์ชันต่อไปได้
    } catch (err) {
        return res.status(401).json({ message: 'Token หมดอายุหรือไม่ถูกต้อง' });
    }
};

// 2. ฟังก์ชันตรวจว่าเป็น Admin หรือไม่ (ต้องใช้คู่กับ verifyToken เสมอ)
export const verifyAdmin = (req, res, next) => {
    // เช็ค role จากข้อมูลที่เราฝากไว้ใน req.user
    if (req.user && req.user.role === 'Admin') {
        next(); // เป็น Admin ผ่านได้!
    } else {
        return res.status(403).json({ message: 'สิทธิ์ถูกปฏิเสธ: เฉพาะ Admin เท่านั้น' });
    }
};