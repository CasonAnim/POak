import express from "express";
import {verifyToken} from "../middle/authMiddleware.mjs"
import {me, login, register } from "../auth/auth.mjs"; // นำเข้า register เพิ่ม

const router = express.Router();

router.post('/login', login);
router.post('/register', register); // เพิ่ม Route นี้

router.get('/me' , verifyToken , me )
export default router;