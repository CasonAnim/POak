
import { ArrowRight } from 'lucide-react';
import API from '../axios'

export default function EquipmentCard({ item, onBorrowClick }) {
  const available = Number(item.availableQuantity) || 0;
  const isAvailable = available > 0;
  const getImageUrl = (img) => {
    if (!img) return null;
    // ถ้าเป็น Full URL (http:// หรือ https://) หรือ data:image ให้ใช้ค่านั้นตรงๆ
    if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('data:')) {
      return img;
    }
    // ดึง base URL ของเซิร์ฟเวอร์ (ปรับพอร์ตให้ตรงกับ Backend ของคุณ เช่น http://localhost:5000)
    const backendBaseUrl = (API.defaults.baseURL || 'http://localhost:5000').replace(/\/api\/?$/, '');
    return `${backendBaseUrl}/uploads/${img}`;
  };
  const imageSrc = getImageUrl(item.image);
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between">
      {/* รูปภาพและรหัสอุปกรณ์ */}
      <div className="relative h-44 bg-[#234229] flex items-center justify-center p-4">
        <span className="absolute top-3 right-3 text-[10px] font-mono text-emerald-200/80">
          {item.code || item.equipCode || 'EQ-001'}
        </span>
        <div className="w-28 h-28 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border border-white/20">
          {item.image ? (
            
            <img src={imageSrc} alt={item.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-3xl text-emerald-100">🔬</span>
          )}
        </div>
      </div>

      {/* เนื้อหาอุปกรณ์ */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
              {item.category || item.type || 'LAB EQUIPMENT'}
            </span>
            {isAvailable ? (
              <span className="text-[10px] font-semibold text-sky-600 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-full">
                Available
              </span>
            ) : (
              <span className="text-[10px] font-semibold text-white bg-black px-2 py-0.5 rounded-full">
                Already been using
              </span>
            )}
          </div>
          <h3 className="text-base font-bold text-gray-900">{item.name}</h3>
          <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
            {item.description || 'Compound optics for close observation and sample documentation.'}
          </p>
        </div>

        {/* ยอดคงเหลือ และ ปุ่มเปิดยืม */}
        <div className="pt-2 flex items-center justify-between border-t border-gray-100">
          <span className="text-xs text-gray-500">
            คงเหลือ: <strong>{available}</strong> / {item.totalQuantity ?? 0}
          </span>
          <button
            onClick={() => onBorrowClick(item)}
            disabled={!isAvailable}
            className={`inline-flex items-center gap-1 text-xs font-semibold transition cursor-pointer ${
              isAvailable
                ? 'text-blue-600 hover:text-blue-800'
                : 'text-gray-300 cursor-not-allowed'
            }`}
          >
            <span>{isAvailable ? 'Open item' : 'ของหมด'}</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}