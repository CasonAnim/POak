import React, { useState, useEffect } from 'react';
import { ShieldCheck, Search, RefreshCw, UserCheck, AlertCircle } from 'lucide-react';
import API from '../axios';

export default function UserMgrTable() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [msg, setMsg] = useState({ text: '', type: '' });

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await API.get('/users');
      setUsers(res.data || []);
    } catch (err) {
      console.error('Fetch users error:', err);
      setMsg({
        text: err.response?.data?.message || 'ไม่สามารถโหลดข้อมูลผู้ใช้ได้',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    setUpdatingId(userId);
    setMsg({ text: '', type: '' });

    try {
      const res = await API.put(`/users/${userId}/role`, { role: newRole });
      
      // อัปเดตข้อมูลใน State ทันที
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
      );

      setMsg({
        text: res.data?.message || 'อัปเดตสิทธิ์สำเร็จ',
        type: 'success'
      });
    } catch (err) {
      console.error('Update role error:', err);
      setMsg({
        text: err.response?.data?.message || 'เกิดข้อผิดพลาดในการเปลี่ยนสิทธิ์',
        type: 'error'
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const term = searchTerm.trim().toLowerCase();
    const name = (u.name || '').toLowerCase();
    const studentId = (u.studentOrStaffId || '').toLowerCase();
    const dept = (u.department || '').toLowerCase();
    return name.includes(term) || studentId.includes(term) || dept.includes(term);
  });

  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <ShieldCheck size={20} />
            </span>
            <h3 className="text-lg font-bold text-gray-900">จัดการสิทธิ์ผู้ใช้งาน (Role Management)</h3>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            เลื่อนขั้นหรือปรับบทบาทผู้ใช้งานระหว่าง นักศึกษา, อาจารย์ และ ผู้ดูแลระบบ
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search size={15} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหาชื่อ, รหัส, สาขา..."
              className="w-full bg-gray-50 border border-gray-200 pl-9 pr-3 py-1.5 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <button
            onClick={fetchUsers}
            disabled={loading}
            title="รีเฟรชข้อมูล"
            className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 transition cursor-pointer disabled:opacity-50 shrink-0"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Alert Message */}
      {msg.text && (
        <div
          className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
            msg.type === 'error'
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          }`}
        >
          {msg.type === 'error' ? <AlertCircle size={15} /> : <UserCheck size={15} />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="text-gray-400 font-semibold uppercase text-[10px] border-b border-gray-100">
              <th className="py-2.5 px-3">รหัสประจำตัว</th>
              <th className="py-2.5 px-3">ชื่อ - นามสกุล</th>
              <th className="py-2.5 px-3">คณะ / สาขาวิชา</th>
              <th className="py-2.5 px-3">เบอร์โทรศัพท์</th>
              <th className="py-2.5 px-3">สถานะปัจจุบัน</th>
              <th className="py-2.5 px-3 text-right">ปรับบทบาท</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-gray-400">
                  {loading ? 'กำลังโหลดข้อมูล...' : 'ไม่พบข้อมูลผู้ใช้งาน'}
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => {
                const isSelf = String(u._id) === String(currentUser._id || currentUser.id);
                return (
                  <tr key={u._id} className="hover:bg-gray-50/60 transition">
                    <td className="py-3 px-3 font-mono font-medium text-gray-700">
                      {u.studentOrStaffId || '-'}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-semibold text-gray-900 block">{u.name}</span>
                      {isSelf && (
                        <span className="text-[10px] text-emerald-600 font-medium">(บัญชีของคุณ)</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-gray-600 max-w-xs truncate" title={u.department}>
                      {u.department || '-'}
                    </td>
                    <td className="py-3 px-3 text-gray-600 font-mono">
                      {u.phone || '-'}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          u.role === 'admin'
                            ? 'bg-purple-100 text-purple-700'
                            : u.role === 'อาจารย์'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <select
                        value={u.role}
                        disabled={updatingId === u._id || isSelf}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        className="bg-gray-50 border border-gray-200 text-gray-800 text-xs font-semibold rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-black cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <option value="นักศึกษา">นักศึกษา</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}