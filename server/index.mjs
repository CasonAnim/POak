import "./loadEnvironment.mjs";
import express from "express";
import cors from "cors";
import db from "./db/conn.mjs";

// 1. นำเข้า Routes ต่างๆ ด้วยคำสั่ง import (ไม่ใช่การกำหนดค่าเป็น String)
import authRoutes from "./routes/authRoute.mjs";
import equipmentRoutes from "./routes/equipmentRoute.mjs";
import transactionRoutes from "./routes/transac.mjs";
import dash from "./routes/dashRoute.mjs";

const PORT = process.env.PORT || 5050;
const app = express();

app.use(cors());
app.use(express.json());

// 2. กำหนด Base Path ให้กับแต่ละกลุ่ม API (เปิดใช้งาน authRoutes กลับมา)
app.use('/uploads', express.static('uploads'));
app.use('/api/auth', authRoutes);
app.use('/api/equipments', equipmentRoutes);       // ระบบจัดการอุปกรณ์และ Stock
app.use('/api/transactions', transactionRoutes);   // ระบบยืม–คืน
app.use('/api/dashboard', dash);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});