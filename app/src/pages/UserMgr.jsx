import React, { useState, useEffect } from 'react';
import API from '../axios';
import AdminOnly from '../components/AdminOnly';
import UserMgrTable from '../components/UserMgrTable';

export default function UserMgr() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    API.get('/auth/me')
      .then((res) => setProfile(res.data?.user))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="p-8 max-w-6xl w-full mx-auto space-y-6">
      {/* ข้อมูลโปรไฟล์ผู้ใช้งานปัจจุบัน */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs">
        <h2 className="text-xl font-bold text-gray-900 mb-2">ข้อมูลโปรไฟล์</h2>
        <div className="text-xs text-gray-600 space-y-1">
          <p><span className="text-gray-400">ชื่อ:</span> {profile?.name || '-'}</p>
          <p><span className="text-gray-400">รหัสประจำตัว:</span> {profile?.studentOrStaffId || '-'}</p>
          <p><span className="text-gray-400">บทบาท:</span> <strong className="text-black">{profile?.role || '-'}</strong></p>
          <p><span className="text-gray-400">คณะ/สาขา:</span> {profile?.department || '-'}</p>
        </div>
      </div>

      {/* ควบคุมการแสดงผลด้วย AdminOnly */}
      <AdminOnly>
        <UserMgrTable />
      </AdminOnly>
    </div>
  );
}