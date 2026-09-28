import React, { useState } from 'react';
import { X, CheckCircle2, XCircle, Calendar, User, BookOpen, AlertTriangle, Package } from 'lucide-react';
import API from '../axios';

export default function ApproveModal({ request, onClose, onUpdated }) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // State สำหรับโหมดกรอกเหตุผลปฏิเสธ
  const [isRejectMode, setIsRejectMode] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  if (!request) return null;

  // ตรวจสอบว่าในคำขอนี้มี "วัสดุสิ้นเปลือง" อยู่หรือไม่[cite: 8]
  const hasConsumable = request.items?.some(
    (it) => it.equipmentId?.type === 'วัสดุสิ้นเปลือง' || it.type === 'วัสดุสิ้นเปลือง'
  );
  
  // ตรวจสอบว่าเป็นคำขอที่มีแต่วัสดุสิ้นเปลืองล้วนๆ หรือไม่ (ถ้าใช่ ปุ่มจะเปลี่ยนเป็น "อนุมัติเบิกจ่าย")
  const isConsumableOnly = request.items?.every(
    (it) => it.equipmentId?.type === 'วัสดุสิ้นเปลือง' || it.type === 'วัสดุสิ้นเปลือง'
  );

  // 1. จัดการอนุมัติคำขอ
  const handleApprove = async () => {
    setLoading(true);
    setErrorMsg('');

    try {
      await API.put(`/transactions/${request._id}/approve`);
      onClose();
      if (typeof onUpdated === 'function') {
        await onUpdated();
      }
    } catch (err) {
      console.error('Approve Error:', err);
      setErrorMsg(err.response?.data?.message || 'เกิดข้อผิดพลาดในการอนุมัติคำขอ');
      setLoading(false);
    }
  };

  // 2. จัดการปฏิเสธคำขอพร้อมระบุเหตุผล
  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectReason.trim()) {
      setErrorMsg('กรุณากรอกเหตุผลในการปฏิเสธคำขอ เพื่อแจ้งให้นักศึกษาทราบ');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      await API.put(`/transactions/${request._id}/reject`, {
        reason: rejectReason.trim()
      });
      onClose();
      if (typeof onUpdated === 'function') {
        await onUpdated();
      }
    } catch (err) {
      console.error('Reject Error:', err);
      setErrorMsg(err.response?.data?.message || 'เกิดข้อผิดพลาดในการปฏิเสธคำขอ');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
        {/* ปุ่มปิด Modal */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-gray-400 hover:text-gray-700 p-1 cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="mb-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
            {isConsumableOnly ? 'Requisition Details' : 'Transaction Details'}
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
              <User size={14} /> ผู้ขอ{hasConsumable ? 'เบิก/ยืม' : 'ยืม'}:
            </span>
            <span className="font-semibold text-gray-900">
              {request.userId?.name || request.userName} ({request.role || 'นักศึกษา'})
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
              <Calendar size={14} /> วันที่ขอ - กำหนดคืน:
            </span>
            <span className="font-medium text-gray-800">
              {new Date(request.borrowDate || request.createdAt).toLocaleDateString('th-TH')} -{' '}
              {isConsumableOnly ? 'ไม่มีกำหนด (เบิกใช้)' : new Date(request.expectedReturnDate).toLocaleDateString('th-TH')}
            </span>
          </div>

          {/* รายการสิ่งของที่ยืม/เบิก */}
          {Array.isArray(request.items) && request.items.length > 0 && (
            <div className="pt-2 border-t border-gray-200/60">
              <span className="text-gray-400 block mb-1.5 flex items-center gap-1.5">
                <Package size={14} /> รายการอุปกรณ์:
              </span>
              <div className="space-y-1.5">
                {request.items.map((item, idx) => {
                  const eqType = item.equipmentId?.type || 'อุปกรณ์';
                  const isItemConsumable = eqType === 'วัสดุสิ้นเปลือง';
                  
                  return (
                    <div key={idx} className="flex justify-between items-center bg-white px-2.5 py-1.5 rounded-lg border border-gray-100">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-800">{item.equipmentId?.name || item.name || 'อุปกรณ์'}</span>
                        {/* แสดง Badge ชนิดของอุปกรณ์ใน Modal เลย */}
                        {isItemConsumable ? (
                          <span className="text-[9px] font-semibold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-100">
                            วัสดุสิ้นเปลือง
                          </span>
                        ) : (
                          <span className="text-[9px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                            ครุภัณฑ์
                          </span>
                        )}
                      </div>
                      <span className="font-bold text-gray-900">x{item.quantity}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* แจ้งเตือนอาจารย์หากมีวัสดุสิ้นเปลือง */}
          {hasConsumable && request.status === 'รออนุมัติ' && (
            <div className="mt-2 p-2.5 bg-purple-50 border border-purple-100 rounded-xl text-[11px] text-purple-700 flex items-start gap-1.5">
              <AlertTriangle size={14} className="shrink-0 mt-0.5" />
              <p>
                <strong>คำเตือน:</strong> รายการนี้มี <strong>"วัสดุสิ้นเปลือง"</strong> รวมอยู่ด้วย หากกดอนุมัติ ระบบจะตัดสต็อกถาวรทันทีและไม่ต้องส่งคืน[cite: 8]
              </p>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-gray-200/60 mt-2">
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

          {request.status === 'ปฏิเสธ' && request.rejectReason && (
            <div className="pt-2 border-t border-gray-200/60 text-red-600">
              <span className="font-semibold block mb-0.5">เหตุผลที่ปฏิเสธ:</span>
              <p className="bg-red-50 p-2 rounded-lg border border-red-100">{request.rejectReason}</p>
            </div>
          )}
        </div>

        {/* ส่วน Action Buttons */}
        {isRejectMode ? (
          <form onSubmit={handleRejectSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-red-600 mb-1 flex items-center gap-1">
                <AlertTriangle size={14} /> ระบุเหตุผลที่ปฏิเสธคำขอ
              </label>
              <textarea
                rows="3"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="เช่น อุปกรณ์มีตารางจองสำหรับคาบเรียนแล็บ..."
                className="w-full bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                required
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsRejectMode(false);
                  setErrorMsg('');
                }}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-xs font-semibold hover:bg-gray-200 transition cursor-pointer"
              >
                ย้อนกลับ
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition cursor-pointer disabled:opacity-50"
              >
                {loading ? 'กำลังบันทึก...' : 'ยืนยันการปฏิเสธ'}
              </button>
            </div>
          </form>
        ) : (
          <div className="flex gap-2">
            {request.status === 'รออนุมัติ' ? (
              <>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setIsRejectMode(true)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition cursor-pointer disabled:opacity-50"
                >
                  <XCircle size={15} />
                  <span>ปฏิเสธคำขอ</span>
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleApprove}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-black text-white hover:bg-gray-800 text-xs font-semibold transition cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 size={15} />
                  {/* เปลี่ยน Text ปุ่มให้ตรงกับพฤติกรรม Backend */}
                  <span>{loading ? 'กำลังบันทึก...' : isConsumableOnly ? 'อนุมัติเบิกจ่าย (ตัดสต็อก)' : 'อนุมัติคำขอยืม'}</span>
                </button>
              </>
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
        )}
      </div>
    </div>
  );
}