import "./loadEnvironment.mjs";
import express from "express";
import cors from "cors";
import db from "./db/conn.mjs";

// 1. นำเข้า Routes ต่างๆ
import authRoutes from "./routes/authRoute.mjs";
import equipmentRoutes from "./routes/equipmentRoute.mjs";
import transactionRoutes from "./routes/transac.mjs";
import dash from "./routes/dashRoute.mjs";
import userRoutes from "./routes/userRoute.mjs";

// Render จะกำหนดค่า process.env.PORT มาให้เองอัตโนมัติ (ปกติคือ 10000)
const PORT = process.env.PORT || 5050;
const app = express();

// ตั้งค่า CORS (ระบุ Origin จาก Env หรือจะอนุญาตทั้งหมดเพื่อความสะดวกตอนแรกก็ได้)
const allowedOrigins = [
  'http://localhost:5173',
  process.env.CLIENT_URL // URL ของ Frontend บน Render (เช่น https://my-frontend.onrender.com)
].filter(Boolean);

app.use(cors({
  origin: process.env.CLIENT_URL ? allowedOrigins : '*',
  credentials: true
}));

app.use(express.json());

// ให้บริการ Static Files สำหรับรูปภาพ uploads
app.use('/uploads', express.static('uploads'));

// 2. กำหนด Base Path ให้กับแต่ละกลุ่ม API
app.use('/api/auth', authRoutes);
app.use('/api/equipments', equipmentRoutes);       // ระบบจัดการอุปกรณ์และ Stock
app.use('/api/transactions', transactionRoutes);   // ระบบยืม–คืน
app.use('/api/dashboard', dash);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.send('API Server is running!');
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});