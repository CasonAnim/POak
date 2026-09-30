import express from 'express';
import { getAllUsers, updateUserRole } from '../user/user.mjs';
import { verifyToken, verifyAdmin } from '../middle/authMiddleware.mjs';

const router = express.Router();

// ต้องผ่านการตรวจ Token และต้องเป็น Admin เท่านั้น
router.get('/', verifyToken, verifyAdmin, getAllUsers);
router.put('/:id/role', verifyToken, verifyAdmin, updateUserRole);

export default router;