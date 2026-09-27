import React, { useState } from 'react';
import { X, UploadCloud, Image as ImageIcon } from 'lucide-react';
import API from '../axios';

export default function UploadModal({ onClose, onSuccess }) {
  // ตั้งค่าเริ่มต้นตามฟิลด์ Schema ที่ Controller ต้องการ
  const [formData, setFormData] = useState({
    equipCode: '',
    name: '',
    type: 'ครุภัณฑ์', // 'ครุภัณฑ์' หรือ 'วัสดุสิ้นเปลือง'
    totalQuantity: 1,
    details: ''
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const data = new FormData();
      // append ชื่อฟิลด์ให้ตรงกับที่ Controller destructure ออกมา
      data.append('equipCode', formData.equipCode.trim());
      data.append('name', formData.name.trim());
      data.append('type', formData.type);
      data.append('totalQuantity', Number(formData.totalQuantity));
      data.append('details', formData.details.trim());

      // แนบไฟล์รูปผ่าน multer (upload.single('image'))
      if (imageFile) {
        data.append('image', imageFile);
      }

      await API.post('/equipments', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (typeof onSuccess === 'function') onSuccess();
      onClose();
    } catch (err) {
      console.error('Add Equipment Error:', err);
      setErrorMsg(err.response?.data?.message || 'เกิดข้อผิดพลาดในการเพิ่มอุปกรณ์');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-gray-100 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        {/* ปุ่มกากบาทปิด */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-gray-400 hover:text-black p-1 transition cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="mb-5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
            Admin Workspace
          </span>
          <h2 className="text-xl font-bold text-gray-900 mt-0.5">เพิ่มอุปกรณ์ใหม่เข้าคลัง</h2>
          <p className="text-xs text-gray-500">กรอกข้อมูลครุภัณฑ์หรือวัสดุเพื่อบันทึกเข้าสู่ระบบ</p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-200">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ช่องอัปโหลดและ Preview รูป */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              รูปภาพอุปกรณ์
            </label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon size={26} className="text-gray-300" />
                )}
              </div>

              <label className="flex-1 flex flex-col items-center justify-center p-3.5 border border-gray-200 rounded-2xl bg-gray-50/50 hover:bg-gray-100/60 transition cursor-pointer">
                <UploadCloud size={18} className="text-gray-500 mb-1" />
                <span className="text-xs font-semibold text-gray-700">คลิกเพื่อเลือกไฟล์รูป</span>
                <span className="text-[10px] text-gray-400">PNG, JPG หรือ WEBP</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* equipCode & name */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                รหัสอุปกรณ์ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="equipCode"
                required
                value={formData.equipCode}
                onChange={handleChange}
                placeholder="เช่น EQ-001"
                className="w-full bg-gray-50 border border-gray-200 px-3.5 py-2 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                ชื่ออุปกรณ์ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="เช่น Digital pH meter"
                className="w-full bg-gray-50 border border-gray-200 px-3.5 py-2 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>

          {/* type & totalQuantity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                ประเภทอุปกรณ์ <span className="text-red-500">*</span>
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="ครุภัณฑ์">ครุภัณฑ์</option>
                <option value="วัสดุสิ้นเปลือง">วัสดุสิ้นเปลือง</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                จำนวนทั้งหมด <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="totalQuantity"
                min="1"
                required
                value={formData.totalQuantity}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 px-3.5 py-2 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>

          {/* details */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              รายละเอียด / หมายเหตุ
            </label>
            <textarea
              name="details"
              rows="3"
              value={formData.details}
              onChange={handleChange}
              placeholder="ระบุรายละเอียดเพิ่มเติมของอุปกรณ์ (ถ้ามี)"
              className="w-full bg-gray-50 border border-gray-200 px-3.5 py-2 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-black resize-none"
            />
          </div>

          {/* ปุ่ม Action */}
          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-black hover:bg-gray-800 text-white py-2.5 rounded-xl text-xs font-semibold transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'กำลังบันทึก...' : 'บันทึกอุปกรณ์'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}