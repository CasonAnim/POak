import React, { useState } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import API from '../axios';

export default function EditEquipmentModal({ item, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: item.name || '',
    type: item.type || item.category || 'ครุภัณฑ์',
    totalQuantity: item.totalQuantity ?? 0,
    availableQuantity: item.availableQuantity ?? 0,
    defectiveQuantity: item.defectiveQuantity ?? 0,
    lostQuantity: item.lostQuantity ?? 0,
    storageLocation: item.storageLocation || '',
    details: item.details || ''
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      await API.put(`/equipments/${item._id}`, {
        ...formData,
        totalQuantity: Number(formData.totalQuantity),
        availableQuantity: Number(formData.availableQuantity),
        defectiveQuantity: Number(formData.defectiveQuantity),
        lostQuantity: Number(formData.lostQuantity)
      });
      if (typeof onSuccess === 'function') onSuccess();
      onClose();
    } catch (err) {
      console.error('Update Error:', err);
      setErrorMsg(err.response?.data?.message || 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative border border-gray-100 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-gray-400 hover:text-black p-1 transition cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="mb-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
            Admin Management
          </span>
          <h2 className="text-xl font-bold text-gray-900 mt-0.5">แก้ไขและตรวจนับสต็อกอุปกรณ์</h2>
          <p className="text-xs text-gray-500">รหัสอุปกรณ์: {item.equipCode || item.code}</p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-200 flex items-center gap-2">
            <AlertCircle size={14} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">ชื่ออุปกรณ์</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">ประเภท</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="ครุภัณฑ์">ครุภัณฑ์ (ยืม-คืน)</option>
                <option value="วัสดุสิ้นเปลือง">วัสดุสิ้นเปลือง (เบิกใช้)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">สถานที่จัดเก็บ</label>
              <input
                type="text"
                name="storageLocation"
                value={formData.storageLocation}
                onChange={handleChange}
                placeholder="เช่น ตู้ A ชั้น 2"
                className="w-full bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>

          {/* สต็อก 4 สถานะ */}
          <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 space-y-2.5">
            <p className="font-semibold text-gray-700 text-[11px]">จัดการจำนวนสต็อก</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <label className="block text-gray-500 text-[10px] mb-1">ทั้งหมด (Total)</label>
                <input
                  type="number"
                  min="0"
                  name="totalQuantity"
                  value={formData.totalQuantity}
                  onChange={handleChange}
                  required
                  className="w-full bg-white border border-gray-200 px-2 py-1.5 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-emerald-600 text-[10px] mb-1 font-medium">พร้อมใช้</label>
                <input
                  type="number"
                  min="0"
                  name="availableQuantity"
                  value={formData.availableQuantity}
                  onChange={handleChange}
                  required
                  className="w-full bg-white border border-emerald-200 px-2 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-amber-600 text-[10px] mb-1 font-medium">ชำรุด</label>
                <input
                  type="number"
                  min="0"
                  name="defectiveQuantity"
                  value={formData.defectiveQuantity}
                  onChange={handleChange}
                  className="w-full bg-white border border-amber-200 px-2 py-1.5 rounded-lg text-xs font-semibold text-amber-700 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-red-600 text-[10px] mb-1 font-medium">สูญหาย</label>
                <input
                  type="number"
                  min="0"
                  name="lostQuantity"
                  value={formData.lostQuantity}
                  onChange={handleChange}
                  className="w-full bg-white border border-red-200 px-2 py-1.5 rounded-lg text-xs font-semibold text-red-700 focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">รายละเอียด</label>
            <textarea
              name="details"
              rows="3"
              value={formData.details}
              onChange={handleChange}
              placeholder="รายละเอียดสเปก หรือคุณสมบัติ..."
              className="w-full bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-black resize-none"
            />
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl font-semibold transition cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-black hover:bg-gray-800 text-white py-2.5 rounded-xl font-semibold transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Save size={14} />
              <span>{loading ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 