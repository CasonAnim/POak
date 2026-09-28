// ไฟล์: LogBadge.jsx
import React from 'react';
import { Clock, FileText, CheckCircle2, XCircle, RotateCcw, AlertTriangle } from 'lucide-react';

export default function LogBadge({ status, issueDescription }) {
  const getActionConfig = () => {
    // ถ้ามีปัญหาตอนคืน (แจ้งเสีย/หาย)
    if (status === 'คืนแล้ว' && issueDescription && issueDescription !== 'อุปกรณ์สภาพปกติครบถ้วน') {
      return { label: 'คืนของชำรุด/สูญหาย', icon: AlertTriangle, color: 'bg-amber-50 text-amber-600 border-amber-200' };
    }

    switch (status) {
      case 'รออนุมัติ':
        return { label: 'ขอยืมอุปกรณ์', icon: FileText, color: 'bg-blue-50 text-blue-600 border-blue-200' };
      case 'อนุมัติ':
      case 'อนุมัติแล้ว':
        return { label: 'อนุมัติคำขอ', icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-600 border-emerald-200' };
      case 'ปฏิเสธ':
        return { label: 'ปฏิเสธคำขอ', icon: XCircle, color: 'bg-red-50 text-red-600 border-red-200' };
      case 'คืนแล้ว':
        return { label: 'คืนสำเร็จ', icon: RotateCcw, color: 'bg-purple-50 text-purple-600 border-purple-200' };
      default:
        return { label: status || 'ทั่วไป', icon: Clock, color: 'bg-gray-50 text-gray-600 border-gray-200' };
    }
  };

  const { label, icon: Icon, color } = getActionConfig();

  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium flex items-center gap-1 ${color}`}>
      <Icon size={12} />
      <span>{label}</span>
    </span>
  );
}