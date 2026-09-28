import React, { useState } from 'react';
import API from '../axios';
import { useNavigate, Link } from 'react-router-dom';
export default function Register() {
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
      setTimeout(() => navigate('/login'), 1500); // แก้เป็นใช้ navigate โดยตรง
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'ลงทะเบียนไม่สำเร็จ โปรดตรวจสอบข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-4">
      
      {/* โลโก้ใหญ่แบบสวยๆ วางเหนือกล่อง Register */}
        <div className="mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <img 
            src="/icon.png"
            alt="logo" 
            className="h-20 sm:h-28 object-contain drop-shadow-xl hover:scale-105 transition-transform duration-300" 
          />
        </div>

      <div className="bg-white w-full max-w-lg p-8 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 relative z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="mb-6 text-center">
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
            Equipment Borrow System
          </span>
          <h2 className="text-2xl font-extrabold text-gray-900 mt-1">สมัครสมาชิก</h2>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl font-medium text-center">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl font-medium text-center flex justify-center items-center gap-2">
            <span className="animate-pulse">✨</span> {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 ml-1">รหัสประจำตัว</label>
              <input
                type="text"
                name="studentId"
                required
                value={formData.studentId}
                onChange={handleChange}
                placeholder="6501xxxx"
                className="w-full bg-gray-50 border border-gray-200 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 ml-1">ชื่อ - นามสกุล</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="สมชาย ใจดี"
                className="w-full bg-gray-50 border border-gray-200 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 ml-1">สาขา / สังกัด</label>
              <input
                type="text"
                name="department"
                required
                value={formData.department}
                onChange={handleChange}
                placeholder="วิศวกรรมคอมพิวเตอร์"
                className="w-full bg-gray-50 border border-gray-200 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 ml-1">เบอร์โทรศัพท์</label>
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                placeholder="081xxxxxxx"
                className="w-full bg-gray-50 border border-gray-200 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1 ml-1">รหัสผ่าน (Password)</label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full bg-gray-50 border border-gray-200 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1 ml-1">บทบาท (Role)</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-gray-200 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black cursor-pointer"
            >
              <option value="นักศึกษา">นักศึกษา</option>
              <option value="อาจารย์">อาจารย์</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3.5 rounded-xl font-bold text-sm hover:bg-gray-800 transition disabled:opacity-50 mt-4 cursor-pointer shadow-md"
          >
            {loading ? 'กำลังบันทึกข้อมูล...' : 'ลงทะเบียนบัญชีใหม่'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-500 mt-6 font-medium">
          มีบัญชีอยู่แล้ว?{' '}
          <Link to="/login" className="text-emerald-600 font-bold hover:underline hover:text-emerald-700 transition">
            เข้าสู่ระบบ
          </Link>
        </p>
      </div>
    </div>
  );
}