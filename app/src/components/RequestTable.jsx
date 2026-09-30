import React, { useState } from 'react';
import { Search, ChevronRight, RotateCcw, Info, CheckCheck } from 'lucide-react';
import ApproveModal from './ApproveModal';
import API from '../axios';
import ReturnIssueModal from './ReturnIssueModal';
import DescriptionModal from './DescriptionModal';

export default function RequestTable({ requests = [], onRefresh }) {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [viewDetailRequest, setViewDetailRequest] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTab, setFilterTab] = useState('All');
  const [returnModalRequest, setReturnModalRequest] = useState(null);
  const [markingReadId, setMarkingReadId] = useState(null);

  // ตรวจสอบสิทธิ์ Admin ครอบคลุมทุกรูปแบบตัวอักษร
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = (currentUser.role || '').toLowerCase();
  const isAdmin = userRole === 'admin' || userRole === 'แอดมิน' || userRole === 'เจ้าหน้าที่';

  // จัดการกด Mark as read (รับทราบคำขอที่ปฏิเสธ)
  const handleMarkAsRead = async (e, id) => {
    e.stopPropagation();
    setMarkingReadId(id);
    try {
      await API.put(`/transactions/${id}/read`);
      if (typeof onRefresh === 'function') {
        onRefresh();
      }
    } catch (err) {
      console.error('Mark read failed:', err);
      alert(err.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึกการรับทราบ');
    } finally {
      setMarkingReadId(null);
    }
  };

  const filteredRequests = requests.filter((item) => {
    // 1. ซ่อนรายการที่คืนแล้วออกจาก Overview
    if (item.status === 'คืนแล้ว') return false;

    // 2. ถ้านักศึกษากดรับทราบรายการที่ปฏิเสธแล้ว ให้ซ่อนออกทันที
    if (!isAdmin && item.status === 'ปฏิเสธ' && item.isReadByStudent) {
      return false;
    }

    // 3. กรองค้นหาตามชื่อโปรเจกต์ หรือชื่อผู้ยืม
    const borrowerName = item.userId?.name || item.userName || '';
    const projectName = item.project || '';
    const matchesSearch =
      projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      borrowerName.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    // 4. กรองตามแท็บ
    if (filterTab === 'In review') return item.status === 'รออนุมัติ';
    if (filterTab === 'Ready') return item.status === 'อนุมัติ' || item.status === 'อนุมัติแล้ว';

    return true;
  });

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 shadow-xs">
      <div className="flex justify-between items-center gap-3 mb-4 sm:mb-6">
        <div>
          <p className="text-xs text-gray-400 uppercase font-semibold">Current Work</p>
          <h3 className="text-xl font-bold text-gray-900">Requests</h3>
        </div>
        <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full shrink-0 whitespace-nowrap">
          ค้างอยู่ {filteredRequests.length} รายการ
        </span>
      </div>

      {/* ค้นหา และ ตัวกรองแท็บ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3 sm:gap-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by project or borrower..."
            className="w-full bg-gray-50 border border-gray-200 pl-9 pr-4 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl text-xs font-semibold overflow-x-auto">
          {['All', 'In review', 'Ready'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilterTab(tab)}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer whitespace-nowrap flex-1 sm:flex-none ${
                filterTab === tab
                  ? 'bg-black text-white shadow-xs'
                  : 'text-gray-600 hover:bg-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* รายการคำขอ */}
      <div className="space-y-3">
        {filteredRequests.length === 0 ? (
          <p className="text-center text-xs text-gray-400 py-8">
            ไม่พบรายการคำขอยืมตามเงื่อนไขที่เลือก
          </p>
        ) : (
          filteredRequests.map((item) => {
            const borrowerName = item.userId?.name || item.userName || 'ไม่ระบุชื่อ';
            const isApproved = item.status === 'อนุมัติ' || item.status === 'อนุมัติแล้ว';
            const isPending = item.status === 'รออนุมัติ';
            const isRejected = item.status === 'ปฏิเสธ';

            // ตรวจสอบสถานะเกินกำหนดส่งคืนในระดับแถวของแต่ละคำขอ[cite: 6]
            const isOverdue =
              isApproved &&
              item.expectedReturnDate &&
              new Date(item.expectedReturnDate) < new Date();

            return (
              <div
                key={item._id}
                onClick={() => {
                  if (isAdmin) {
                    setSelectedRequest(item);
                  } else {
                    setViewDetailRequest(item);
                  }
                }}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 bg-gray-50 border border-gray-100 rounded-xl transition hover:bg-gray-100/70 hover:border-gray-200 cursor-pointer"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-gray-900 break-words">
                      {item.project || 'ไม่มีชื่อโปรเจกต์'}
                    </p>

                    {/* ป้ายเตือนเกินกำหนดส่งคืน[cite: 6] */}
                    {isOverdue && (
                      <span className="text-[10px] font-bold text-red-600 bg-red-100 border border-red-200 px-2 py-0.5 rounded-md flex items-center gap-1 animate-pulse">
                        ⚠️ เกินกำหนดคืน
                      </span>
                    )}

                    {isRejected && item.rejectReason && (
                      <span className="text-[10px] text-red-500 bg-red-50 border border-red-100 px-2 py-0.5 rounded-md font-medium">
                        มีเหตุผลชี้แจง
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-500 mt-0.5">
                    ผู้ยืม: {borrowerName} • กำหนดคืน:{' '}
                    <span className={isOverdue ? 'text-red-600 font-bold' : ''}>
                      {item.expectedReturnDate
                        ? new Date(item.expectedReturnDate).toLocaleDateString('th-TH')
                        : '-'}
                    </span>
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 sm:shrink-0">
                  {/* ปุ่ม คืน/แจ้งปัญหา สำหรับนักศึกษาเมื่อได้รับการอนุมัติ */}
                  {!isAdmin && isApproved && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setReturnModalRequest(item);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition cursor-pointer"
                    >
                      <RotateCcw size={13} />
                      <span>คืน / แจ้งปัญหา</span>
                    </button>
                  )}

                  {/* ปุ่ม รับทราบ/ซ่อน สำหรับนักศึกษาเมื่อถูกปฏิเสธ */}
                  {!isAdmin && isRejected && !item.isReadByStudent && (
                    <button
                      type="button"
                      disabled={markingReadId === item._id}
                      onClick={(e) => handleMarkAsRead(e, item._id)}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition cursor-pointer disabled:opacity-50"
                      title="กดรับทราบเพื่อซ่อนออกจาก Overview"
                    >
                      <CheckCheck size={13} />
                      <span>{markingReadId === item._id ? 'กำลังซ่อน...' : 'รับทราบ / ซ่อน'}</span>
                    </button>
                  )}

                  {/* Badge สถานะ */}
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      isPending
                        ? 'bg-amber-50 text-amber-600 border border-amber-200'
                        : isApproved
                        ? 'bg-blue-50 text-blue-600 border border-blue-200'
                        : 'bg-red-50 text-red-600 border border-red-200'
                    }`}
                  >
                    {item.status}
                  </span>

                  {/* ไอคอนนำทาง */}
                  {isAdmin ? (
                    <ChevronRight size={16} className="text-gray-400" />
                  ) : (
                    <Info size={16} className="text-gray-400 hover:text-gray-600" />
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal อนุมัติ/ปฏิเสธ สำหรับ Admin */}
      {selectedRequest && (
        <ApproveModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onUpdated={() => {
            if (typeof onRefresh === 'function') onRefresh();
          }}
        />
      )}

      {/* Modal คืนของ/แจ้งเสีย สำหรับ Student */}
      {returnModalRequest && (
        <ReturnIssueModal
          request={returnModalRequest}
          onClose={() => setReturnModalRequest(null)}
          onSuccess={() => {
            if (typeof onRefresh === 'function') onRefresh();
          }}
        />
      )}

      {/* Modal รายละเอียดคำขอ สำหรับ Student */}
      {viewDetailRequest && (
        <DescriptionModal
          request={viewDetailRequest}
          onClose={() => setViewDetailRequest(null)}
        />
      )}
    </div>
  );
}
