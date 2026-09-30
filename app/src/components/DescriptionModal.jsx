import React from 'react';
import { X, Calendar, User, FileText, Package, AlertCircle, AlertTriangle } from 'lucide-react';

export default function DescriptionModal({ request, onClose }) {
  if (!request) return null;

  const borrowerName = request.userId?.name || request.userName || 'ไม่ระบุชื่อ';
  const items = request.items || request.equipmentList || [];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'รออนุมัติ':
        return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'อนุมัติ':
      case 'อนุมัติแล้ว':
        return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'คืนแล้ว':
        return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      default:
        return 'bg-red-50 text-red-600 border-red-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-start gap-3 px-4 sm:px-6 py-4 border-b border-gray-100">
          <div>
            <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getStatusBadge(request.status)}`}>
              {request.status}
            </span>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mt-1">รายละเอียดการยืม-เบิกอุปกรณ์</h3>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto">
          {/* ข้อมูลโปรเจกต์ */}
          <div>
            <span className="text-[11px] font-bold uppercase text-gray-400">Project / Subject</span>
            <p className="text-base font-bold text-gray-900">{request.project || '-'}</p>
          </div>

          {/* ข้อมูลผู้ยืม */}
          <div className="flex items-start gap-3">
            <User size={18} className="text-gray-400 mt-0.5 shrink-0" />
            <div className="w-full">
              <p className="text-xs text-gray-400 font-medium">ข้อมูลผู้ขอ</p>
              <p className="text-sm font-semibold text-gray-900">
                {borrowerName}
              </p>
              
              <div className="mt-1 grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                <p>
                  <span className="text-gray-400">รหัสประจำตัว:</span>{' '}
                  <span className="font-medium text-gray-800 font-mono">
                    {request.userId?.studentOrStaffId || '-'}
                  </span>
                </p>
                <p>
                  <span className="text-gray-400">สาขา/สังกัด:</span>{' '}
                  <span className="font-medium text-gray-800">
                    {request.userId?.department || '-'}
                  </span>
                </p>
                <p className="col-span-1 sm:col-span-2">
                  <span className="text-gray-400">เบอร์โทรศัพท์:</span>{' '}
                  <span className="font-medium text-gray-800 font-mono">
                    {request.userId?.phone || '-'}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* รายการอุปกรณ์ที่ยืม/เบิก */}
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1.5">
              <Package size={14} /> รายการอุปกรณ์
            </p>
            <div className="space-y-2">
              {items.map((it, idx) => {
                const eq = it.equipmentId || {};
                const isConsumable = eq.type === 'วัสดุสิ้นเปลือง' || it.type === 'วัสดุสิ้นเปลือง';
                return (
                  <div key={idx} className="flex justify-between items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100 text-xs">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-gray-800">{eq.name || it.name || 'อุปกรณ์'}</span>
                      {isConsumable ? (
                        <span className="text-[10px] bg-purple-50 text-purple-600 border border-purple-200 px-1.5 py-0.5 rounded font-medium">
                          วัสดุสิ้นเปลือง
                        </span>
                      ) : (
                        <span className="text-[10px] bg-blue-50 text-blue-600 border border-blue-200 px-1.5 py-0.5 rounded font-medium">
                          ครุภัณฑ์
                        </span>
                      )}
                    </div>
                    <span className="font-bold text-gray-900 font-mono">
                      x{it.quantity || 1} ชิ้น
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* วันที่และกำหนดคืน */}
          <div className="flex items-start gap-3">
            <Calendar size={18} className="text-gray-400 mt-0.5 shrink-0" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
              <div>
                <p className="text-[11px] text-gray-400 font-medium">วันที่ขอ</p>
                <p className="text-xs font-semibold text-gray-800">
                  {request.borrowDate || request.createdAt
                    ? new Date(request.borrowDate || request.createdAt).toLocaleDateString('th-TH')
                    : '-'}
                </p>
              </div>

              <div>
                <p className="text-[11px] text-gray-400 font-medium">กำหนดคืน (Deadline)</p>
                <p className="text-xs font-semibold text-gray-800">
                  {request.expectedReturnDate
                    ? new Date(request.expectedReturnDate).toLocaleDateString('th-TH')
                    : '-'}
                </p>
              </div>

              {request.status === 'คืนแล้ว' && (
                <div>
                  <p className="text-[11px] text-gray-400 font-medium">วันที่คืนจริง / ตัดสต็อก</p>
                  <p className="text-xs font-semibold text-gray-800">
                    {request.actualReturnDate
                      ? new Date(request.actualReturnDate).toLocaleDateString('th-TH')
                      : new Date(request.updatedAt).toLocaleDateString('th-TH')}
                  </p>
                  {request.actualReturnDate &&
                    request.expectedReturnDate &&
                    new Date(request.actualReturnDate) > new Date(request.expectedReturnDate) && (
                      <span className="text-[10px] text-red-500 font-bold block mt-0.5">
                        (ส่งคืนเกินกำหนด)
                      </span>
                    )}
                </div>
              )}
            </div>
          </div>

          {/* วัตถุประสงค์ */}
          {request.purpose && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1">วัตถุประสงค์</p>
              <p className="text-xs text-gray-700 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                {request.purpose}
              </p>
            </div>
          )}

          {/* เหตุผลที่ปฏิเสธ (ถ้ามี) */}
          {request.status === 'ปฏิเสธ' && request.rejectReason && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs space-y-1">
              <span className="font-bold text-red-600 flex items-center gap-1">
                <AlertCircle size={14} /> เหตุผลที่ปฏิเสธคำขอ:
              </span>
              <p className="text-red-700 font-medium">{request.rejectReason}</p>
            </div>
          )}

          {/* หมายเหตุ / รายละเอียดของเสีย / เบิกจ่าย */}
          {request.issueDescription && (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs space-y-1">
              <span className="font-bold text-gray-700 flex items-center gap-1">
                <AlertTriangle size={14} className="text-amber-500" /> บันทึกสภาพ / หมายเหตุ:
              </span>
              <p className="text-gray-800">{request.issueDescription}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
