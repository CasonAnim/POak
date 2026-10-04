import React, { useState } from 'react';
import API from '../axios';
import { useNavigate, Link } from 'react-router-dom';
import picLogo from '/icon.png';

// ข้อมูล 11 คณะและทุกสาขาวิชาตามหลักสูตรระดับปริญญาตรี สถาบันการจัดการปัญญาภิวัฒน์ (PIM)
const PIM_FACULTIES = [
  {
    faculty: 'คณะบริหารธุรกิจ (BA)',
    majors: [
      'สาขาวิชาการจัดการธุรกิจการค้าสมัยใหม่ (MTM)',
      'สาขาวิชาการจัดการธุรกิจการค้าสมัยใหม่ ต่อเนื่อง (CMTM)',
      'สาขาวิชาการจัดการธุรกิจการค้าสมัยใหม่ เรียนออนไลน์ (IMM)',
      'สาขาวิชาการจัดการธุรกิจการค้าสมัยใหม่ ต่อเนื่อง/ออนไลน์ (CIMM)'
    ]
  },
  {
    faculty: 'คณะวิศวกรรมศาสตร์และเทคโนโลยี (ET)',
    majors: [
      'สาขาวิชาวิศวกรรมคอมพิวเตอร์และปัญญาประดิษฐ์ (CPE)',
      'สาขาวิชาเทคโนโลยีดิจิทัลและสารสนเทศ (DIT)',
      'สาขาวิชาเทคโนโลยีดิจิทัลและสารสนเทศ : Cybersecurity ต่อเนื่อง',
      'สาขาวิชาวิศวกรรมหุ่นยนต์และระบบอัตโนมัติ (RAE)',
      'สาขาวิชาวิศวกรรมการผลิตยานยนต์ (AME)',
      'สาขาวิชาวิศวกรรมอุตสาหการและการจัดการ / การผลิตอัจฉริยะ (IEM)'
    ]
  },
  {
    faculty: 'คณะการจัดการธุรกิจอาหาร (FBM)',
    majors: [
      'สาขาวิชาการจัดการธุรกิจอาหาร',
      'สาขาวิชาการจัดการธุรกิจค้าส่งอาหารสมัยใหม่',
      'สาขาวิชาศิลปะการประกอบอาหารและการจัดการร้านอาหาร (Chef)'
    ]
  },
  {
    faculty: 'คณะการจัดการธุรกิจบริการ โรงแรม และการบิน (HAM)',
    majors: [
      'สาขาวิชาการจัดการธุรกิจการบิน (AVI)',
      'สาขาวิชาอุตสาหกรรมการบริการและการท่องเที่ยว (HTM)'
    ]
  },
  {
    faculty: 'คณะวิทยาศาสตร์ เทคโนโลยีและการจัดการอาหาร (STM)',
    majors: [
      'สาขาวิชาการจัดการเทคโนโลยีแปรรูปอาหาร'
    ]
  },
  {
    faculty: 'คณะการจัดการโลจิสติกส์และการคมนาคมขนส่ง (LTM)',
    majors: [
      'สาขาวิชาการจัดการโลจิสติกส์และการคมนาคมขนส่ง'
    ]
  },
  {
    faculty: 'คณะศิลปศาสตร์ (LA)',
    majors: [
      'สาขาวิชาภาษาจีนธุรกิจ (BC)',
      'สาขาวิชาภาษาญี่ปุ่นธุรกิจ (BJ)',
      'สาขาวิชาภาษาอังกฤษเพื่อการสื่อสารทางธุรกิจ (CEB)'
    ]
  },
  {
    faculty: 'คณะครุศาสตร์ (EDU)',
    majors: [
      'สาขาวิชาการสอนภาษาจีน',
      'สาขาวิชาการสอนภาษาอังกฤษ'
    ]
  },
  {
    faculty: 'คณะนิเทศศาสตร์ (CA)',
    majors: [
      'วิชาเอกสาขาการสื่อสารดิจิทัลเพื่อองค์กรและแบรนด์',
      'วิชาเอกสาขาวารสารศาสตร์คอนเวอร์เจนท์และสื่อดิจิทัล'
    ]
  },
  {
    faculty: 'คณะเกษตรนวัตและการจัดการ (IAM)',
    majors: [
      'สาขาวิชานวัตกรรมการจัดการเกษตร'
    ]
  },
  {
    faculty: 'คณะพยาบาลศาสตร์ (NS)',
    majors: [
      'หลักสูตรพยาบาลศาสตรบัณฑิต (หลักสูตรทางวิชาชีพ 4 ปี)',
      'หลักสูตรพยาบาลศาสตรบัณฑิต (หลักสูตรทางวิชาชีพ 2.5 ปี สำหรับผู้จบ ป.ตรี สาขาอื่น)'
    ]
  }
];

export default function Register() {
  const [formData, setFormData] = useState({
    studentId: '',
    name: '',
    email: '',
    department: '',
    phone: '',
    password: '',
    role: 'นักศึกษา'
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!formData.department) {
      setErrorMsg('กรุณาเลือกคณะและสาขาวิชาของคุณ');
      return;
    }

    if (!/^\d{10}$/.test(formData.studentId.trim())) {
      setErrorMsg('กรุณากรอกรหัสนักศึกษาเป็นตัวเลข 10 หลักให้ถูกต้อง');
      return;
    }

    setLoading(true);

    try {
      await API.post('/auth/register', {
        ...formData,
        studentId: formData.studentId.trim(),
        email: formData.email.trim(),
        role: 'นักศึกษา'
      });
      setSuccessMsg('ลงทะเบียนนักศึกษาสำเร็จ! กำลังพากลับไปหน้าเข้าสู่ระบบ...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'ลงทะเบียนไม่สำเร็จ โปรดตรวจสอบข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-[#F8F9FA] flex flex-col items-center justify-center p-4 py-8">
      {/* โลโก้ */}
      <div className="mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <img
          src={picLogo}
          alt="logo"
          className="h-20 sm:h-28 object-contain drop-shadow-xl hover:scale-105 transition-transform duration-300"
        />
      </div>

      <div className="bg-white w-full max-w-xl p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 relative z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="mb-6 text-center">
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
            Student Registration
          </span>
          <h2 className="text-2xl font-extrabold text-gray-900 mt-1">สมัครสมาชิกนักศึกษา</h2>
          <p className="text-xs text-gray-400 mt-1">
            สถาบันการจัดการปัญญาภิวัฒน์ (PIM)
          </p>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 ml-1">
                รหัสนักศึกษา (10 หลัก)
              </label>
              <input
                type="text"
                name="studentId"
                required
                maxLength="10"
                value={formData.studentId}
                onChange={handleChange}
                placeholder="684001xxxx"
                className="w-full bg-gray-50 border border-gray-200 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 ml-1">
                ชื่อ - นามสกุล
              </label>
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

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1 ml-1">
              อีเมล (Email)
            </label>
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="name@example.com"
              className="w-full bg-gray-50 border border-gray-200 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1 ml-1">
              คณะ / สาขาวิชา
            </label>
            <select
              name="department"
              required
              value={formData.department}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-gray-200 px-3.5 py-2.5 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-black cursor-pointer truncate min-w-0"
            >
              <option value="" disabled>-- เลือกคณะและสาขาวิชา --</option>
              {PIM_FACULTIES.map((group, gIdx) => (
                <optgroup key={gIdx} label={`🏢 ${group.faculty}`}>
                  {group.majors.map((major, mIdx) => (
                    <option key={mIdx} value={`${group.faculty} - ${major}`}>
                      {major}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 ml-1">
                เบอร์โทรศัพท์
              </label>
              <input
                type="tel"
                name="phone"
                required
                maxLength="10"
                value={formData.phone}
                onChange={handleChange}
                placeholder="081xxxxxxx"
                className="w-full bg-gray-50 border border-gray-200 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 ml-1">
                รหัสผ่าน (Password)
              </label>
              <input
                type="password"
                name="password"
                required
                minLength="6"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-gray-50 border border-gray-200 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3.5 rounded-xl font-bold text-sm hover:bg-gray-800 transition disabled:opacity-50 mt-4 cursor-pointer shadow-md"
          >
            {loading ? 'กำลังบันทึกข้อมูล...' : 'ลงทะเบียนบัญชีนักศึกษา'}
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