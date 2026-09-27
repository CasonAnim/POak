import React, { useState } from 'react';
import { X, CheckCircle2, XCircle, Calendar, User, BookOpen } from 'lucide-react';
import API from '../axios';

export default function ApproveModal({ request, onClose, onUpdated }) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!request) return null;

  const handleUpdateStatus = async (newStatus) => {
    setLoading(true);
    setErrorMsg('');

    try {
      // 1. ส่งสถานะใหม่ไปอัปเดตที่หลังบ้าน
      await API.put(`/transactions/${request._id}/status`, { status: newStatus });

      // 2. ปิด Modal ทันทีเมื่ออัปเดตผ่าน
      onClose();

      // 3. แจ้งคอมโพเนนต์แม่ให้โหลดข้อมูลใหม่ (ครอบ try-catch ไว้ไม่ให้สะท้อน Error กลับมา)
      if (typeof onUpdated === 'function') {
        try {
          await onUpdated();
        } catch (refreshErr) {
          console.error('Refresh table error:', refreshErr);
        }
      }
    } catch (err) {
      console.error('Update Status Error:', err);
      setErrorMsg(err.response?.data?.message || 'เกิดข้อผิดพลาดในการอัปเดตสถานะ');
      setLoading(false); // ปลดล็อกปุ่มเฉพาะกรณีส่ง API ไม่สำเร็จ เพื่อให้ผู้ใช้กดซ้ำได้
    } 
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
        {/* ปุ่มกากบาทปิด */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-gray-400 hover:text-gray-700 p-1 cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="mb-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
            Transaction Details
          </span>
          <h2 className="text-xl font-bold text-gray-900 mt-0.5">
            {request.project || 'ไม่มีชื่อโปรเจกต์'}
          </h2>
          <p className="text-xs text-gray-500 font-mono">ID: {request._id}</p>
        </div>

        {errorMsg && (
          <div className="mb-3 p-2.5 bg-red-50 text-red-600 text-xs rounded-xl border border-red-200">
            {errorMsg}
          </div>
        )}

        {/* ข้อมูลคำขอ */}
        <div className="bg-gray-50 rounded-2xl p-4 space-y-3 mb-5 text-xs text-gray-700 border border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 flex items-center gap-1.5">
              <User size={14} /> ผู้ขอยืม:
            </span>
            <span className="font-semibold text-gray-900">
              {request.userName} ({request.role || 'นักศึกษา'})
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-400 flex items-center gap-1.5">
              <BookOpen size={14} /> วัตถุประสงค์:
            </span>
            <span className="font-medium text-gray-800">{request.purpose || '-'}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-400 flex items-center gap-1.5">
              <Calendar size={14} /> วันที่ยืม - กำหนดคืน:
            </span>
            <span className="font-medium text-gray-800">
              {new Date(request.borrowDate || request.createdAt).toLocaleDateString('th-TH')} -{' '}
              {new Date(request.expectedReturnDate).toLocaleDateString('th-TH')}
            </span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-200/60">
            <span className="text-gray-400">สถานะปัจจุบัน:</span>
            <span
              className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                request.status === 'รออนุมัติ'
                  ? 'bg-amber-100 text-amber-700'
                  : request.status === 'อนุมัติแล้ว' || request.status === 'อนุมัติ'
                  ? 'bg-blue-100 text-blue-700'
                  : request.status === 'คืนแล้ว'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {request.status}
            </span>
          </div>
        </div>

        {/* ปุ่มกดยืนยันแยกตามสถานะ */}
        <div className="flex gap-2">
          {request.status === 'รออนุมัติ' ? (
            <>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleUpdateStatus('ปฏิเสธ')}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition cursor-pointer disabled:opacity-50"
              >
                <XCircle size={15} />
                <span>ปฏิเสธคำขอ</span>
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleUpdateStatus('อนุมัติแล้ว')}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-black text-white hover:bg-gray-800 text-xs font-semibold transition cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 size={15} />
                <span>{loading ? 'กำลังบันทึก...' : 'อนุมัติคำขอ'}</span>
              </button>
            </>
          ) : request.status === 'อนุมัติแล้ว' || request.status === 'อนุมัติ' ? (
            <button
              type="button"
              disabled={loading}
              onClick={() => handleUpdateStatus('คืนแล้ว')}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-semibold transition cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 size={15} />
              <span>{loading ? 'กำลังบันทึก...' : 'บันทึกรับคืนอุปกรณ์'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-gray-100 text-gray-700 text-xs font-semibold hover:bg-gray-200 transition cursor-pointer"
            >
              ปิดหน้าต่าง
            </button>
          )}
        </div>
      </div>
    </div>
  );
}