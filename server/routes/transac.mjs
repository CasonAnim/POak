import express from "express";
// นำเข้าฟังก์ชัน updateTransactionStatus เพิ่มเข้ามา
import { requestBorrow, getAllTransactions, approveTransaction , returnEquipment ,rejectTransaction, markAsRead } from "../transac/transac.mjs";
import { verifyToken, verifyAdmin } from "../middle/authMiddleware.mjs";

const router = express.Router();

// POST /api/transactions/request - นักศึกษาส่งคำขอยืม
router.post('/request', verifyToken, requestBorrow);

// GET /api/transactions - ดูประวัติการยืมทั้งหมด (Admin)
router.get('/', verifyToken,  getAllTransactions);

// PUT /api/transactions/:id/status - อนุมัติ/ไม่อนุมัติ คำขอยืม (Admin เท่านั้น)
router.put('/:id/approve', verifyToken, verifyAdmin, approveTransaction);
router.put('/:id/reject', verifyToken, verifyAdmin, rejectTransaction);
router.put('/:id/read', verifyToken, markAsRead);
router.put('/:id/return', verifyToken,  returnEquipment);

export default router;