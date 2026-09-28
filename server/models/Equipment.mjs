import mongoose from 'mongoose';

const equipmentSchema = new mongoose.Schema(
  {
    equipCode: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['ครุภัณฑ์', 'วัสดุสิ้นเปลือง'],
      required: true
    },
    totalQuantity: {
      type: Number,
      required: true,
      min: 0
    },
    availableQuantity: {
      type: Number,
      required: true,
      min: 0
    },
    defectiveQuantity: { 
      type: Number, 
      default: 0 
    }, // จำนวนที่ชำรุด/เสีย
    lostQuantity: { 
      type: Number, 
      default: 0 
    },
    image: {
      type: String,
      default: ''
    },
    details: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['พร้อมใช้งาน', 'ชำรุด', 'สูญหาย'],
      default: 'พร้อมใช้งาน'
    }
  },
  { 
    timestamps: true,
    collection: 'equipments' // บังคับให้ใช้ชื่อคอลเลกชัน 'equipments' ของเดิม
  }
);

// หรือใส่เป็น argument ตัวที่ 3: mongoose.model('Equipment', equipmentSchema, 'equipments')
export default mongoose.models.Equipment || mongoose.model('Equipment', equipmentSchema, 'equipments');