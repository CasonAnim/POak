import React from 'react';
import LogBadge from './LogBadge';
import AdminOnly from './AdminOnly';

// รับ props onClick เพิ่มเข้ามา
export default function LogItem({ log, onClick }) {
  const actorName = log.userId?.name || log.userName || 'ระบบ';
  const formattedDate = log.createdAt
    ? new Date(log.createdAt).toLocaleString('th-TH', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : '-';

  return (
    <div 
      onClick={onClick} // ใส่ฟังก์ชันคลิกที่นี่
      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-xl gap-3 hover:bg-gray-100/60 transition cursor-pointer"
    >
      <div className="flex items-start gap-3 w-full">
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-gray-900 break-words">
              {log.project || 'ทำรายการในระบบ'}
            </span>
            <LogBadge status={log.status} issueDescription={log.issueDescription} />
          </div>

          <p className="text-xs text-gray-500">
            <AdminOnly>
              <span className="block sm:inline font-medium text-gray-700 sm:mr-2">
                โดย: {actorName} ({log.role || 'นักศึกษา'})
              </span>
            </AdminOnly>
            <span>เวลา: {formattedDate}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
