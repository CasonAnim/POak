import React, { useState } from 'react';
import { X, Calendar, FolderGit2, CheckCircle2 } from 'lucide-react';
import API from '../axios';

export default function BorrowModal({ item, onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [project, setProject] = useState('');
  const [purpose, setPurpose] = useState('');
  const [expectedReturnDate, setExpectedReturnDate] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [imgError, setImgError] = useState(false);

  // เช็คประเภทว่าเป็นวัสดุสิ้นเปลืองหรือไม่[cite: 2]
  const isConsumable = item?.type === 'วัสดุสิ้นเปลือง' || item?.category === 'วัสดุสิ้นเปลือง';

  const available = Number(item.availableQuantity) || 0;
  const isAvailable = available > 0;

  const getImageUrl = (img) => {
    if (!img) return null;
    if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('data:')) {
      return img;
    }
    const backendBaseUrl = (API.defaults.baseURL || 'http://localhost:5000').replace(/\/api\/?$/, '');
    return `${backendBaseUrl}/uploads/${img}`;
  };

  const imageSrc = getImageUrl(item.image);

  const handleSubmitBorrow = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const payload = {
        project,
        purpose,
        // ถ้าเป็นวัสดุสิ้นเปลือง ไม่ต้องมี deadline คืน ให้ใช้วันนี้เป็น default
        expectedReturnDate: isConsumable 
          ? new Date().toISOString().split('T')[0] 
          : expectedReturnDate,
        items: [
          {
            equipmentId: item._id,
            quantity: Number(quantity)
          }
        ]
      };

      await API.post('/transactions/request', payload);
      onSuccess();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'ส่งคำขอไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92dvh] overflow-y-auto shadow-2xl relative flex flex-col md:flex-row border border-gray-100">
        
        {/* ปุ่มปิด */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-20 text-gray-400 hover:text-black p-1 transition cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* ฝั่งซ้าย */}
        <div className="w-full md:w-5/12 bg-black text-white p-5 sm:p-8 flex flex-col justify-between items-center relative min-h-[200px] md:min-h-[380px]">
          <span className="self-end text-[10px] font-mono text-gray-400 tracking-wider">
            {item.equipCode || item.code || 'EQ-001'}
          </span>

          <div className="w-24 h-24 md:w-36 md:h-36 rounded-full bg-[#111111] border border-gray-800 flex items-center justify-center overflow-hidden my-auto p-2">
            {imageSrc && !imgError ? (
              <img
                src={imageSrc}
                alt={item.name}
                onError={() => setImgError(true)}
                className="w-full h-full object-contain"
              />
            ) : (
              <span className="text-4xl">{isConsumable ? '📦' : '🔬'}</span>
            )}
          </div>

          <div className="text-[11px] text-gray-500 font-mono tracking-wider">
            P.I.M EQUIPMENT SYSTEM
          </div>
        </div>

        {/* ฝั่งขวา */}
        <div className="w-full md:w-7/12 p-5 sm:p-8 flex flex-col justify-between bg-white">
          {step === 1 ? (
            <div className="space-y-6">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    {item.equipCode || item.code || 'ITEM'}
                  </span>
                  {/* Badge ประเภทอุปกรณ์ */}
                  {isConsumable ? (
                    <span className="text-[10px] bg-purple-50 text-purple-600 border border-purple-200 px-2 py-0.5 rounded-full font-semibold">
                      วัสดุสิ้นเปลือง (เบิกใช้)
                    </span>
                  ) : (
                    <span className="text-[10px] bg-blue-50 text-blue-600 border border-blue-200 px-2 py-0.5 rounded-full font-semibold">
                      ครุภัณฑ์ (ต้องคืน)
                    </span>
                  )}
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1 break-words">
                  {item.name}
                </h2>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                  {item.details || item.description || 'ไม่มีรายละเอียดเพิ่มเติม'}
                </p>

                <div className="mt-3">
                  {isAvailable ? (
                    <span className="inline-block bg-black text-white text-[10px] font-medium px-3 py-0.5 rounded-full">
                      Available ({available} in stock)
                    </span>
                  ) : (
                    <span className="inline-block bg-red-100 text-red-600 text-[10px] font-medium px-3 py-0.5 rounded-full">
                      Out of stock
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2 border-t border-gray-100 pt-4 text-xs">
                <div className="flex justify-between text-gray-500">
                  <span>Last checked</span>
                  <span className="text-gray-900 font-medium">
                    {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : '-'}
                  </span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Storage</span>
                  <span className="text-gray-900 font-medium">
                    {item.storageLocation || 'คลังอุปกรณ์กลาง'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!isAvailable}
                className="w-full bg-black hover:bg-gray-800 text-white py-3 rounded-xl text-xs font-semibold tracking-wide transition flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <span>{isConsumable ? 'ทำรายการขอเบิกใช้' : 'Add to active work'}</span>
                <span>&gt;</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitBorrow} className="space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase text-emerald-600">
                  {isConsumable ? 'Confirm Requisition' : 'Confirm Borrowing'}
                </span>
                <h3 className="text-lg font-bold text-gray-900">
                  {isConsumable ? 'ระบุรายละเอียดการเบิกใช้' : 'ระบุรายละเอียดการยืม'}
                </h3>
              </div>

              {errorMsg && (
                <div className="p-2.5 bg-red-50 text-red-600 text-xs rounded-xl border border-red-200">
                  {errorMsg}
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                    โปรเจกต์ / รายวิชา
                  </label>
                  <input
                    type="text"
                    required
                    value={project}
                    onChange={(e) => setProject(e.target.value)}
                    placeholder="เช่น โครงงานหุ่นยนต์, IoT Lab"
                    className="w-full bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div className={`grid ${isConsumable ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'} gap-2`}>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                      จำนวนที่{isConsumable ? 'เบิก' : 'ยืม'}
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={available}
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>

                  {/* ซ่อนช่องวันกำหนดคืนถ้าเป็นวัสดุสิ้นเปลือง */}
                  {!isConsumable && (
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                        กำหนดวันที่คืน
                      </label>
                      <input
                        type="date"
                        required
                        value={expectedReturnDate}
                        onChange={(e) => setExpectedReturnDate(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 px-2.5 py-2 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                    วัตถุประสงค์
                  </label>
                  <textarea
                    rows="2"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder={isConsumable ? 'เหตุผลการเบิกใช้คร่าวๆ' : 'เหตุผลการยืมคร่าวๆ'}
                    className="w-full bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-black resize-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  ย้อนกลับ
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-2/3 bg-black hover:bg-gray-800 text-white py-2.5 rounded-xl text-xs font-semibold transition disabled:opacity-50 cursor-pointer"
                >
                  {loading
                    ? 'กำลังบันทึก...'
                    : isConsumable
                    ? 'ยืนยันการขอเบิก'
                    : 'ยืนยันคำขอยืม'}
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
