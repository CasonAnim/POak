import mongoose from "mongoose";
import dns from "dns";

// ตั้งค่า DNS ไว้เหมือนเดิม (มักใช้แก้ปัญหาเวลาต่อ MongoDB Atlas ไม่ได้)
dns.setServers(['4.4.4.4', '1.1.1.1']);

const connectionString = process.env.ATLAS_URI || "";

try {
  // เชื่อมต่อผ่าน Mongoose และระบุชื่อ Database "POak" ใน options
  await mongoose.connect(connectionString, {
    dbName: "POak"
  });
  console.log("Connected to MongoDB via Mongoose");
} catch (e) {
  console.error(e);
  console.log("2");
}

// ปกติ Mongoose จะจัดการ Connection ให้แบบ Global 
// แต่สามารถ Export connection object ออกไปใช้เหมือนโครงสร้างเดิมได้
const db = mongoose.connection;

export default db;