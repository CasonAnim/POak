import React, { useState, useEffect } from 'react';
import { LogOut, Bell, Calendar, Sliders, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API from '../axios';

export default function Profile() {
  const navigate = useNavigate();

  // ดึงข้อมูลผู้ใช้จาก localStorage หรือ fallback ค่าเริ่มต้น
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const [user, setUser] = useState({
    name: storedUser.name || 'Taigoonstar',
    studentOrStaffId: storedUser.studentOrStaffId || '123',
    department: storedUser.department || 'วิทยาศาสตร์และเทคโนโลยี',
    role: storedUser.role || 'นักศึกษา',
    email: storedUser.email || `${storedUser.studentOrStaffId || 'user'}@pim.ac.th`
  });

  // State สำหรับการตั้งค่าสวิตช์ Toggle
  const [settings, setSettings] = useState({
    workspaceUpdates: true,
    weeklyDigest: false,
    compactDensity: false
  });

  // ดึงข้อมูล profile ล่าสุดจาก backend /me
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await API.get('/auth/me');
        if (res.data?.user) {
          setUser((prev) => ({
            ...prev,
            ...res.data.user,
            email: res.data.user.email || `${res.data.user.studentOrStaffId}@pim.ac.th`
          }));
        }
      } catch (err) {
        console.error('Fetch me error:', err);
      }
    };
    fetchUserData();
  }, []);

  const handleToggle = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSignOut = () => {
    if (window.confirm('คุณต้องการออกจากระบบใช่หรือไม่?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  return (
    <div className="p-8 max-w-4xl w-full mx-auto space-y-6">
      {/* 1. ส่วน Profile Card */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              YOUR IDENTITY
            </p>
            <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            <span className="text-xs font-medium text-gray-500">Connected</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xl overflow-hidden border border-gray-200 shadow-xs">
              {user.name ? user.name.slice(0, 2).toUpperCase() : 'US'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-gray-900">{user.name}</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600 border border-gray-200">
                  {user.role}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                รหัส: {user.studentOrStaffId} • สาขา: {user.department || '-'}
              </p>
              <p className="text-xs text-gray-400">{user.email}</p>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-black transition cursor-pointer shadow-xs"
          >
            <LogOut size={14} />
            <span>Sign out</span>
          </button>
        </div>
        </div>
        </div>

      
      
  );
}