import mongoose from 'mongoose';

const transactionItemSchema = new mongoose.Schema(
  {
    equipmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Equipment',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    }
  },
  { _id: false }
);

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    userName: {
      type: String,
      required: true
    },
    role: {
      type: String,
      default: 'student'
    },
    project: {
      type: String,
      required: true,
      trim: true
    },
    purpose: {
      type: String,
      default: ''
    },
    borrowDate: {
      type: Date,
      default: Date.now
    },
    expectedReturnDate: {
      type: Date,
      required: true
    },
    
    expectedReturnDate: {
       type: Date, 
       required: true 
      },          // กำหนดส่งคืน (Deadline)
    actualReturnDate: {
       type: Date, 
       default: null 
      },
    items: [transactionItemSchema],
    status: {
      type: String,
      enum: ['รออนุมัติ', 'อนุมัติ', 'อนุมัติแล้ว', 'ปฏิเสธ', 'คืนแล้ว'],
      default: 'รออนุมัติ'
    },
    rejectReason: {
      type: String,
      default: '' // เก็บเหตุผล เช่น "อุปกรณ์ถูกจองใช้ในวิชาปฏิบัติการวันดังกล่าว"
    },
    // ฟิลด์สำหรับเก็บประวัติการแจ้งเสีย/ชำรุด/สูญหาย ตอนคืนของ
    issueDescription: {
      type: String,
      default: ''
    },
    isReadByStudent: {
    type: Boolean,
    default: false
    },
    // เก็บรายละเอียดของที่เสียแยกชิ้นไว้ตรวจสอบย้อนหลัง
    issueDetails: [
      {
        equipmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipment' },
        issueType: { type: String, enum: ['ชำรุด', 'สูญหาย'] },
        defectiveAmount: { type: Number, default: 0 },
        note: { type: String, default: '' }
      }
    ]
  },
  { 
    timestamps: true,
    collection: 'transactions'
  }
);

export default mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema, 'transactions');