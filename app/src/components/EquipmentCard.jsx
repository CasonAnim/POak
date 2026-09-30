import React, { useState } from 'react';
import { ArrowRight, Pencil, AlertTriangle, ShieldAlert } from 'lucide-react';
import API from '../axios';
import EditEquipmentModal from './EditEquipmentModal';

export default function EquipmentCard({ item, onBorrowClick, onUpdated }) {
  const [isEditOpen, setIsEditOpen] = useState(false);

  // เช็ค Role จาก LocalStorage
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = (currentUser.role || '').toLowerCase();
  const isAdmin = userRole === 'admin' || userRole === 'แอดมิน' || userRole === 'อาจารย์' || userRole === 'เจ้าหน้าที่';

  const available = Number(item.availableQuantity) || 0;
  const total = Number(item.totalQuantity) || 0;
  const defective = Number(item.defectiveQuantity) || 0;
  const lost = Number(item.lostQuantity) || 0;
  // คำนวณจำนวนที่กำลังถูกยืมอยู่
  const borrowed = Math.max(0, total - available - defective - lost);

  const isConsumable = item.type === 'วัสดุสิ้นเปลือง' || item.category === 'วัสดุสิ้นเปลือง';
  const isAvailable = available > 0;

  const getImageUrl = (img) => {
    if (!img) return null;
    if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('data:')) {
      return img;
    }
    const backendBaseUrl = (API.defaults.baseURL || 'http://localhost:5050').replace(/\/api\/?$/, '');
    return `${backendBaseUrl}/uploads/${img}`;
  };

  const imageSrc = getImageUrl(item.image);

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between relative group">
        
        {/* รูปภาพและส่วนหัวการ์ด */}
        <div className="relative h-44 bg-[#234229] flex items-center justify-center p-4">
          
          {/* ปุ่ม Edit สำหรับ Admin (มุมบนซ้าย) */}
          {isAdmin && (
            <button
              onClick={() => setIsEditOpen(true)}
              className="absolute top-3 left-3 bg-black/50 hover:bg-black/80 text-white p-1.5 rounded-lg backdrop-blur-xs transition cursor-pointer flex items-center gap-1 text-[10px] z-10"
              title="แก้ไขข้อมูลอุปกรณ์"
            >
              <Pencil size={12} />
              <span>Edit</span>
            </button>
          )}

          <span className="absolute top-3 right-3 text-[10px] font-mono text-emerald-200/80">
            {item.code || item.equipCode || 'EQ-001'}
          </span>

          <div className="w-28 h-28 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border border-white/20">
            {item.image ? (
              <img src={imageSrc} alt={item.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl text-emerald-100">{isConsumable ? '📦' : '🔬'}</span>
            )}
          </div>
        </div>

        {/* เนื้อหาอุปกรณ์ */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
                {item.type || item.category || 'ครุภัณฑ์'}
              </span>
              
              <div className="flex flex-wrap items-center gap-1.5">
                {/* Badge ชนิดวัสดุ */}
                {isConsumable ? (
                  <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">
                    วัสดุสิ้นเปลือง
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                    ครุภัณฑ์
                  </span>
                )}

                {/* Badge สถานะความพร้อม */}
                {isAvailable ? (
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    พร้อมใช้
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                    ของหมด
                  </span>
                )}
              </div>
            </div>

            <h3 className="text-base font-bold text-gray-900 break-words">{item.name}</h3>
            <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
              {item.details || 'ไม่มีรายละเอียดเพิ่มเติม'}
            </p>

            {/* ส่วนแสดงรายละเอียดสต็อกแบบจัดเต็มสำหรับ Admin */}
            {isAdmin && (
              <div className="mt-3.5 pt-3 border-t border-gray-100">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  สถานะสต็อกในระบบ
                </p>
                <div className="grid grid-cols-4 gap-1.5 text-center">
                  <div className="bg-emerald-50/70 border border-emerald-100 rounded-lg p-1.5">
                    <p className="text-[10px] text-emerald-600 font-medium">พร้อมใช้</p>
                    <p className="text-xs font-bold text-emerald-800">{available}</p>
                  </div>
                  <div className="bg-blue-50/70 border border-blue-100 rounded-lg p-1.5">
                    <p className="text-[10px] text-blue-600 font-medium">ถูกยืม</p>
                    <p className="text-xs font-bold text-blue-800">{borrowed}</p>
                  </div>
                  <div className="bg-amber-50/70 border border-amber-100 rounded-lg p-1.5">
                    <p className="text-[10px] text-amber-600 font-medium">ชำรุด</p>
                    <p className="text-xs font-bold text-amber-800">{defective}</p>
                  </div>
                  <div className="bg-red-50/70 border border-red-100 rounded-lg p-1.5">
                    <p className="text-[10px] text-red-600 font-medium">สูญหาย</p>
                    <p className="text-xs font-bold text-red-800">{lost}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ยอดคงเหลือ และ ปุ่มเปิดยืม */}
          <div className="pt-2 flex items-center justify-between gap-2 border-t border-gray-100">
            <span className="text-xs text-gray-500">
              คงเหลือ: <strong className="text-gray-900">{available}</strong> / {total} ชิ้น
            </span>
            <button
              onClick={() => onBorrowClick(item)}
              disabled={!isAvailable}
              className={`inline-flex items-center gap-1 text-xs font-semibold transition cursor-pointer ${
                isAvailable
                  ? 'text-black hover:text-gray-600'
                  : 'text-gray-300 cursor-not-allowed'
              }`}
            >
              <span>{isAvailable ? (isConsumable ? 'ขอเบิกใช้' : 'ขอยืม') : 'ของหมด'}</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Modal แก้ไขข้อมูลอุปกรณ์สำหรับ Admin */}
      {isEditOpen && (
        <EditEquipmentModal
          item={item}
          onClose={() => setIsEditOpen(false)}
          onSuccess={() => {
            if (typeof onUpdated === 'function') onUpdated();
          }}
        />
      )}
    </>
  );
}
