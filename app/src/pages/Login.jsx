import React, { useState } from 'react';
import { useNavigate , Link } from 'react-router-dom';
import API from '../axios';

export default function Login({ }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ studentId: '', password: '' });
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await API.post('/auth/login', formData);
      const { token, user } = res.data;

      // บันทึกลง Storage
      localStorage.setItem('token', token);
      if (user) localStorage.setItem('user', JSON.stringify(user));

      navigate('/dashboard')
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'รหัสประจำตัวหรือรหัสผ่านไม่ถูกต้อง');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md p-8 rounded-2xl border border-gray-200 shadow-sm">
        <div className="mb-6 text-center">
          <span className="text-xs font-semibold text-green-600 uppercase tracking-wider">
            P.I.M Equipment Borrow System
          </span>
          <h2 className="text-2xl font-bold text-gray-900 mt-1">เข้าสู่ระบบ</h2>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              รหัสประจำตัว (นศ. / บุคลากร)
            </label>
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
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              รหัสผ่าน (Password)
            </label>
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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-2.5 rounded-xl font-medium text-sm hover:bg-gray-800 transition disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-500 mt-6">
          ยังไม่มีบัญชีใช้งาน?{' '}
          <Link to="/register" className="text-black font-semibold hover:underline">
            ลงทะเบียนที่นี่
          </Link>
        </p>
      </div>
    </div>
  );
}