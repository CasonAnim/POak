import multer from 'multer';
import path from 'path';

// ตั้งค่าที่เก็บไฟล์และชื่อไฟล์
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // เก็บไว้ในโฟลเดอร์ uploads
    },
    filename: function (req, file, cb) {
        // เปลี่ยนชื่อไฟล์เป็นตัวเลขเวลาปัจจุบัน (ป้องกันชื่อซ้ำ)
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

export const upload = multer({ storage: storage });