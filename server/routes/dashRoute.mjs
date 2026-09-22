import express from "express";
import { getDashboardStats } from "../dashboard/dashy.mjs";
import { verifyToken, verifyAdmin } from "../middle/authMiddleware.mjs";

const router = express.Router();

// GET /api/dashboard - ดึงข้อมูลสถิติ (เฉพาะ Admin เท่านั้นที่ดูภาพรวมได้)
router.get('/', verifyToken, verifyAdmin, getDashboardStats);

export default router;