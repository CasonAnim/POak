import express from "express";
// นำเข้าฟังก์ชัน updateTransactionStatus เพิ่มเข้ามา
import { requestBorrow, getAllTransactions, updateTransactionStatus , returnEquipment } from "../transac/transac.mjs";
import { verifyToken, verifyAdmin } from "../middle/authMiddleware.mjs";

const router = express.Router();

// POST /api/transactions/request - นักศึกษาส่งคำขอยืม
router.post('/request', verifyToken, requestBorrow);

// GET /api/transactions - ดูประวัติการยืมทั้งหมด (Admin)
router.get('/', verifyToken, verifyAdmin, getAllTransactions);

// PUT /api/transactions/:id/status - อนุมัติ/ไม่อนุมัติ คำขอยืม (Admin เท่านั้น)
router.put('/:id/status', verifyToken, verifyAdmin, updateTransactionStatus);

router.put('/:id/return', verifyToken, verifyAdmin, returnEquipment);

export default router;