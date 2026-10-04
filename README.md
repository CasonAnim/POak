# P.I.M Equipment Borrow System

ระบบยืม-คืนอุปกรณ์และเบิกวัสดุสิ้นเปลือง สำหรับนักศึกษา/อาจารย์/เจ้าหน้าที่
นักศึกษาส่งคำขอยืม → แอดมินอนุมัติหรือปฏิเสธ → คืนอุปกรณ์/แจ้งปัญหา พร้อมประวัติการทำรายการ (Log)

## Tech Stack

| ส่วน | เทคโนโลยี |
|------|-----------|
| Frontend (`app/`) | React 19, Vite, Tailwind CSS 4, React Router, Axios |
| Backend (`server/`) | Node.js, Express 5, Mongoose (MongoDB Atlas), JWT, bcrypt, multer |

## สิ่งที่ต้องมีก่อนติดตั้ง

- Node.js เวอร์ชัน LTS ล่าสุด (แนะนำ 20.19 ขึ้นไป) และ npm
- ฐานข้อมูล MongoDB (เช่น MongoDB Atlas) และ connection string

## วิธีติดตั้ง

```bash
# 1) ติดตั้งแพ็กเกจ (ที่โฟลเดอร์ root ของโปรเจกต์)
npm install
npm install --prefix app
npm install --prefix server
```

สร้างไฟล์ `server/.env`

```env
ATLAS_URI=mongodb+srv://<user>:<password>@<cluster>/...
JWT_SECRET=ใส่ข้อความลับยาว ๆ ของคุณเอง
```

> ระบบจะใช้ฐานข้อมูลชื่อ `POak` และสร้างโฟลเดอร์ `server/uploads/` เก็บรูปอุปกรณ์ให้อัตโนมัติ

## วิธีรัน

```bash
# รัน backend + frontend พร้อมกัน (ที่โฟลเดอร์ root)
npm run dev

# หรือแยกรัน
npm run dev:server
npm run dev:app
```

- Frontend: `http://localhost:5173` (ค่าเริ่มต้นของ Vite)
- Backend: Frontend เรียก API ที่ `http://localhost:5050/api` (แก้ได้ที่ `app/src/axios.js`) ดังนั้นต้องให้ server รันที่พอร์ต 5050 ให้ตรงกัน

Build frontend สำหรับ production: `npm run build --prefix app`

## ตาราง API

Base URL: `/api` · ส่ง Token ใน header `Authorization: Bearer <token>` (Token หมดอายุใน 1 วัน)

| Method | Path | สิทธิ์ | คำอธิบาย |
|--------|------|--------|----------|
| POST | `/auth/login` | ทุกคน | เข้าสู่ระบบ (`studentId`, `password`) ได้ token |
| POST | `/auth/register` | ทุกคน | สมัครสมาชิก (`studentOrStaffId`, `name`, `password`, `email`, `department`, `phone`) |
| GET | `/auth/me` | ล็อกอิน | ข้อมูลผู้ใช้ปัจจุบัน |
| GET | `/equipments` | ล็อกอิน | รายการอุปกรณ์ทั้งหมด |
| POST | `/equipments` | แอดมิน | เพิ่มอุปกรณ์ (multipart, ไฟล์รูปชื่อ field `image`) |
| PUT | `/equipments/:id` | แอดมิน | แก้ไขข้อมูล/สต็อกอุปกรณ์ |
| DELETE | `/equipments/:id` | แอดมิน | ลบอุปกรณ์ถาวร |
| POST | `/equipments/:id/issue` | ล็อกอิน | แจ้งอุปกรณ์ชำรุด/สูญหาย (`issueType`, `quantity`) |
| POST | `/transactions/request` | ล็อกอิน | ส่งคำขอยืม/เบิก (`project`, `purpose`, `expectedReturnDate`, `items`) |
| GET | `/transactions` | ล็อกอิน | ประวัติรายการ (แอดมินเห็นทั้งหมด, ผู้ใช้ทั่วไปเห็นของตัวเอง) |
| PUT | `/transactions/:id/approve` | แอดมิน | อนุมัติคำขอ |
| PUT | `/transactions/:id/reject` | แอดมิน | ปฏิเสธคำขอ (ต้องส่ง `reason`) |
| PUT | `/transactions/:id/return` | ล็อกอิน | คืนอุปกรณ์ (`itemsReturnStatus` / `issueDescription`) ผู้ใช้คืนได้เฉพาะรายการของตัวเอง |
| PUT | `/transactions/:id/read` | ล็อกอิน | ทำเครื่องหมายว่าอ่านแล้ว |
| GET | `/users` | แอดมิน | รายชื่อผู้ใช้ทั้งหมด |
| PUT | `/users/:id/role` | แอดมิน | เปลี่ยนบทบาทผู้ใช้ (`role`) |
| GET | `/dashboard` | แอดมิน | สถิติภาพรวม |

รูปอุปกรณ์เปิดดูได้ที่ `/uploads/<ชื่อไฟล์>` (นอก `/api`)

## หมายเหตุ

- **บทบาทผู้ใช้:** `/auth/register` ไม่รับค่า `role` จากผู้สมัคร ทุกบัญชีที่สมัครใหม่จะเป็น "นักศึกษา" เสมอ
  ยกเว้น **บัญชีแรกของระบบ** (ฐานข้อมูลยังไม่มีผู้ใช้เลย) จะได้เป็น `admin` อัตโนมัติ
  จากนั้นแอดมินเลื่อนบทบาทให้คนอื่นได้ที่หน้า "จัดการผู้ใช้"
- อย่า commit ไฟล์ `server/.env` ขึ้น Git
