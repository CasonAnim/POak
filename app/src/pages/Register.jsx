import React, { useState } from 'react';
import API from '../axios';
import { useNavigate, Link } from 'react-router-dom';
export default function Register({}) {
  const [formData, setFormData] = useState({
    studentId: '',
    name: '',
    department: '',
    phone: '',
    password: '',
    role: 'นักศึกษา'
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate()
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      await API.post('/auth/register', formData);
      setSuccessMsg('ลงทะเบียนสำเร็จแล้ว! กำลังพากลับไปหน้าเข้าสู่ระบบ...');
      setTimeout(() => onSwitchToLogin(), 1500);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'ลงทะเบียนไม่สำเร็จ โปรดตรวจสอบข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg p-8 rounded-2xl border border-gray-200 shadow-sm">
        <div className="mb-6 text-center">
          <span className="text-xs font-semibold text-green-600 uppercase tracking-wider">
            P.I.M Equipment Borrow System
          </span>
          <h2 className="text-2xl font-bold text-gray-900 mt-1">สมัครสมาชิก</h2>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">รหัสประจำตัว (นศ./บุคลากร)</label>
              <input
                type="text"
                name="studentId"
                required
                value={formData.studentId}
                onChange={handleChange}
                placeholder="6501xxxx"
                className="w-full bg-gray-50 border border-gray-200 px-3.5 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">ชื่อ - นามสกุล</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="สมชาย ใจดี"
                className="w-full bg-gray-50 border border-gray-200 px-3.5 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">สาขา / สังกัด</label>
              <input
                type="text"
                name="department"
                required
                value={formData.department}
                onChange={handleChange}
                placeholder="วิศวกรรมคอมพิวเตอร์"
                className="w-full bg-gray-50 border border-gray-200 px-3.5 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">เบอร์โทรศัพท์</label>
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                placeholder="081xxxxxxx"
                className="w-full bg-gray-50 border border-gray-200 px-3.5 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">รหัสผ่าน (Password)</label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full bg-gray-50 border border-gray-200 px-3.5 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">บทบาท (Role)</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="นักศึกษา">นักศึกษา</option>
              <option value="อาจารย์">อาจารย์</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-2.5 rounded-xl font-medium text-sm hover:bg-gray-800 transition disabled:opacity-50 mt-2 cursor-pointer"
          >
            {loading ? 'กำลังบันทึกข้อมูล...' : 'ลงทะเบียน'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-500 mt-5">
          มีบัญชีอยู่แล้ว?{' '}
          <Link to="/login" className="text-black font-semibold hover:underline">
            เข้าสู่ระบบ
            </Link>
        </p>
      </div>
    </div>
  );
}