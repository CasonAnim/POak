import express from "express";
import { getAllEquipments, addEquipment, updateEquipment ,deleteEquipment, reportIssue} from "../equipment/equipment.mjs";
// นำเข้า Middleware ที่เราเพิ่งสร้าง
import { verifyToken, verifyAdmin } from "../middle/authMiddleware.mjs";
import { upload } from "../middle/uploadMiddleware.mjs";

const router = express.Router();

// GET: ดูอุปกรณ์
router.get('/', verifyToken, getAllEquipments);

// POST: เพิ่มอุปกรณ์ (เพิ่ม upload.single('image') เพื่อรับไฟล์รูป 1 ไฟล์)
router.post('/', verifyToken, verifyAdmin, upload.single('image'), addEquipment);

// PUT: แก้ไขข้อมูล
router.put('/:id', verifyToken, verifyAdmin, updateEquipment);

// DELETE: ลบอุปกรณ์
router.delete('/:id', verifyToken, verifyAdmin, deleteEquipment);

// POST: แจ้งอุปกรณ์เสีย/สูญหาย
router.post('/:id/issue', verifyToken, verifyAdmin, reportIssue);

export default router;