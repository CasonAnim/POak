import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    studentOrStaffId: {
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
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      default: 'นักศึกษา'
    },
    department: {
      type: String,
      default: ''
    },
    phone: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model('User', userSchema);