import React, { useState } from 'react';
import { X, RotateCcw, AlertTriangle, CheckCircle, Package } from 'lucide-react';
import API from '../axios';

export default function ReturnIssueModal({ request, onClose, onSuccess }) {
  // ดึง ID ออกมาให้เป็น String ชัดเจนตั้งแต่เริ่ม
  const [itemsStatus, setItemsStatus] = useState(
    (request?.items || []).map((item) => {
      const rawId = item.equipmentId?._id || item.equipmentId;
      return {
        equipmentId: typeof rawId === 'object' ? rawId.toString() : rawId,
        name: item.equipmentId?.name || item.name || 'อุปกรณ์',
        totalQuantity: Number(item.quantity) || 1,
        hasIssue: false,
        issueType: 'ชำรุด',
        defectiveAmount: 0,
        note: ''
      };
    })
  );

  const [generalNote, setGeneralNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!request) return null;

  const handleItemChange = (index, field, value) => {
    setItemsStatus((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    // ตรวจสอบความถูกต้องของจำนวนที่แจ้งเสีย
    for (let item of itemsStatus) {
      const brokenCount = Number(item.defectiveAmount) || 0;
      if (item.hasIssue && (brokenCount <= 0 || brokenCount > item.totalQuantity)) {
        setErrorMsg(`จำนวน ${item.issueType} ของ "${item.name}" ต้องอยู่ระหว่าง 1 ถึง ${item.totalQuantity} ชิ้น`);
        setLoading(false);
        return;
      }
    }

    // รวมข้อความ issueDescription
    const issueTexts = itemsStatus
      .filter((i) => i.hasIssue && Number(i.defectiveAmount) > 0)
      .map((i) => `[${i.name}: ${i.issueType} ${i.defectiveAmount} ชิ้น${i.note ? ` (${i.note.trim()})` : ''}]`);

    if (generalNote.trim()) {
      issueTexts.push(`หมายเหตุเพิ่มเติม: ${generalNote.trim()}`);
    }

    const compiledIssueDescription = issueTexts.length > 0 
      ? issueTexts.join(' | ') 
      : 'อุปกรณ์สภาพปกติครบถ้วน';

    try {
      // ทำความสะอาด payload ก่อนส่ง
      const payload = {
        issueDescription: compiledIssueDescription,
        itemsReturnStatus: itemsStatus.map((item) => ({
          equipmentId: String(item.equipmentId),
          defectiveAmount: item.hasIssue ? Number(item.defectiveAmount) : 0,
          issueType: item.hasIssue ? item.issueType : null,
          note: item.note ? item.note.trim() : ''
        }))
      };

      await API.put(`/transactions/${request._id}/return`, payload);

      if (typeof onSuccess === 'function') onSuccess();
      onClose();
    } catch (err) {
      console.error('Return Error:', err);
      setErrorMsg(err.response?.data?.message || 'เกิดข้อผิดพลาดในการทำรายการ');
    } finally {
      setLoading(false);
    }
  };

  const hasAnyIssue = itemsStatus.some((i) => i.hasIssue);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-gray-400 hover:text-black p-1 transition cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="mb-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
            Equipment Return & Stock Inspection
          </span>
          <h2 className="text-xl font-bold text-gray-900 mt-0.5">คืนอุปกรณ์และบันทึกสภาพ</h2>
          <p className="text-xs text-gray-500">
            โปรเจกต์: <span className="font-semibold text-gray-800">{request.project || '-'}</span>
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-200">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
            {itemsStatus.map((item, idx) => {
              const brokenAmount = item.hasIssue ? Number(item.defectiveAmount || 0) : 0;
              const goodAmount = Math.max(0, item.totalQuantity - brokenAmount);

              return (
                <div key={item.equipmentId || idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-3 text-xs">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500">
                        <Package size={16} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{item.name}</p>
                        <p className="text-gray-400 text-[11px]">ยืมไป: {item.totalQuantity} ชิ้น</p>
                      </div>
                    </div>

                    <label className="flex items-center gap-1.5 cursor-pointer bg-white px-2.5 py-1.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:border-gray-300 transition">
                      <input
                        type="checkbox"
                        checked={item.hasIssue}
                        onChange={(e) => {
                          handleItemChange(idx, 'hasIssue', e.target.checked);
                          handleItemChange(idx, 'defectiveAmount', e.target.checked ? 1 : 0);
                        }}
                        className="rounded border-gray-300 text-red-600 focus:ring-0"
                      />
                      <span className="text-[11px]">มีชำรุด/สูญหาย</span>
                    </label>
                  </div>

                  {item.hasIssue && (
                    <div className="p-3 bg-red-50/70 border border-red-100 rounded-xl space-y-2 animate-in fade-in duration-100">
                      <div className="flex items-center gap-2">
                        <select
                          value={item.issueType}
                          onChange={(e) => handleItemChange(idx, 'issueType', e.target.value)}
                          className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs font-semibold text-gray-700 focus:outline-none"
                        >
                          <option value="ชำรุด">ชำรุด / เสีย</option>
                          <option value="สูญหาย">สูญหาย</option>
                        </select>

                        <div className="flex items-center gap-1.5 ml-auto">
                          <span className="text-gray-600 text-[11px]">จำนวนที่{item.issueType}:</span>
                          <input
                            type="number"
                            min="1"
                            max={item.totalQuantity}
                            value={item.defectiveAmount}
                            onChange={(e) => handleItemChange(idx, 'defectiveAmount', e.target.value)}
                            className="w-16 bg-white border border-red-300 rounded-lg px-2 py-1 text-center font-bold text-red-600 focus:outline-none focus:ring-1 focus:ring-red-400"
                          />
                          <span className="text-gray-500">ชิ้น</span>
                        </div>
                      </div>

                      <input
                        type="text"
                        placeholder="ระบุอาการเสีย หรือสาเหตุที่สูญหาย..."
                        value={item.note}
                        onChange={(e) => handleItemChange(idx, 'note', e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-red-400 placeholder:text-gray-400"
                      />
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2 border-t border-gray-200/60 text-[11px]">
                    <span className="text-gray-500">สภาพการคืน:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle size={12} /> คืนคลัง: {goodAmount} ชิ้น
                      </span>
                      {item.hasIssue && brokenAmount > 0 && (
                        <span className="text-red-600 font-semibold flex items-center gap-1">
                          <AlertTriangle size={12} /> {item.issueType}: {brokenAmount} ชิ้น
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {hasAnyIssue && (
            <div>
              <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                หมายเหตุเพิ่มเติมถึงเจ้าหน้าที่ (ถ้ามี)
              </label>
              <input
                type="text"
                value={generalNote}
                onChange={(e) => setGeneralNote(e.target.value)}
                placeholder="เช่น แจ้งเรื่องให้อาจารย์ที่ปรึกษาทราบแล้ว..."
                className="w-full bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          )}

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
              className={`flex-1 text-white py-2.5 rounded-xl text-xs font-semibold transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5 ${
                hasAnyIssue
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-black hover:bg-gray-800'
              }`}
            >
              <RotateCcw size={14} />
              <span>{loading ? 'กำลังบันทึก...' : hasAnyIssue ? 'ยืนยันคืนพร้อมแจ้งปัญหา' : 'ยืนยันการคืนของ'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}