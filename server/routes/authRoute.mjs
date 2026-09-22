import express from "express";
import { login, register } from "../auth/auth.mjs"; // นำเข้า register เพิ่ม

const router = express.Router();

router.post('/login', login);
router.post('/register', register); // เพิ่ม Route นี้

export default router;