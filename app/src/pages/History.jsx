import React, { useState, useEffect } from 'react';
import API from '../axios';
import LogFilterBar from '../components/LogFilterBar';
import LogItem from '../components/LogItem';
import AdminOnly from '../components/AdminOnly';
import DescriptionModal from '../components/DescriptionModal'; // 1. นำเข้า Modal
import Pagination from '../components/Pagination';
import usePagination from '../components/usePagination';

export default function History() {
    const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('all'); // เพิ่ม State นี้ ('all', 'studentId', 'name', 'project')
  const [actionFilter, setActionFilter] = useState('All');
  const [viewDetailLog, setViewDetailLog] = useState(null);

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = (currentUser.role || '').toLowerCase();
  const isAdmin = userRole === 'admin' || userRole === 'แอดมิน' || userRole === 'อาจารย์' || userRole === 'เจ้าหน้าที่';

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await API.get('/transactions');
      setLogs(res.data || []);
    } catch (err) {
      console.error('Error fetching logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    // ดึงข้อมูลที่ Populate มาจาก Backend
    const studentId = (log.userId?.studentOrStaffId || '').toLowerCase();
    const actorName = (log.userId?.name || log.userName || '').toLowerCase();
    const project = (log.project || '').toLowerCase();
    const status = log.status || '';
    const issueDesc = log.issueDescription || '';
    const term = searchTerm.trim().toLowerCase();

    // 1. ตรวจสอบเงื่อนไขตาม Search Type ที่ล็อกไว้
    let matchesSearch = true;
    if (term) {
      if (searchType === 'studentId') {
        matchesSearch = studentId.includes(term);
      } else if (searchType === 'name') {
        matchesSearch = actorName.includes(term);
      } else if (searchType === 'project') {
        matchesSearch = project.includes(term);
      } else {
        // โหมด 'all': เจอในรหัส, ชื่อ หรือโปรเจกต์ จุดใดจุดหนึ่งก็แสดงทันที
        matchesSearch =
          studentId.includes(term) ||
          actorName.includes(term) ||
          project.includes(term);
      }
    }

    // 2. ตรวจสอบเงื่อนไข Action Tab
    let matchesAction = false;
    if (actionFilter === 'All') {
      matchesAction = true;
    } else if (actionFilter === 'ขอยืม') {
      matchesAction = status === 'รออนุมัติ';
    } else if (actionFilter === 'อนุมัติ') {
      matchesAction = status === 'อนุมัติ' || status === 'อนุมัติแล้ว';
    } else if (actionFilter === 'ปฏิเสธ') {
      matchesAction = status === 'ปฏิเสธ';
    } else if (actionFilter === 'คืนสำเร็จ') {
      matchesAction = status === 'คืนแล้ว' && (!issueDesc || issueDesc === 'อุปกรณ์สภาพปกติครบถ้วน');
    } else if (actionFilter === 'แจ้งปัญหา') {
      matchesAction = status === 'คืนแล้ว' && issueDesc && issueDesc !== 'อุปกรณ์สภาพปกติครบถ้วน';
    }

    return matchesSearch && matchesAction;
  });

  // 10 logs per page; back to page 1 whenever search/filter changes
  const { pagedItems, currentPage, totalPages, totalItems, pageSize, goToPage, listRef } =
    usePagination(filteredLogs, 10, `${searchTerm}|${searchType}|${actionFilter}`);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
    <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 shadow-xs">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <div>
          <p className="text-xs text-gray-400 uppercase font-semibold">Audit Trail</p>
          <h3 className="text-base sm:text-xl font-bold text-gray-900 flex flex-wrap items-center gap-2">
            <AdminOnly>
              <span>System Activity Logs (ประวัติกิจกรรมระบบ)</span>
            </AdminOnly>
            {!isAdmin && (
              <span>My Activity Logs (ประวัติการทำรายการของฉัน)</span>
            )}
          </h3>
        </div>
      </div>

      {/* Filter Bar */}
      <LogFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchType={searchType}
        onSearchTypeChange={setSearchType}
        actionFilter={actionFilter}
        onFilterChange={setActionFilter}
        isAdmin={isAdmin}
      />

      {/* Content */}
      {loading ? (
        <div className="text-center py-10 text-xs text-gray-400">กำลังโหลดข้อมูลประวัติ...</div>
      ) : filteredLogs.length === 0 ? (
        <div className="text-center py-10 text-xs text-gray-400">ไม่พบประวัติการทำรายการ</div>
      ) : (
        <div ref={listRef} className="space-y-3 scroll-mt-4">
          {pagedItems.map((log) => (
            // 3. แนบ onClick ให้เปิด Modal และส่งข้อมูล log นั้นๆ ไป
            <LogItem 
              key={log._id || log.id} 
              log={log} 
              onClick={() => setViewDetailLog(log)} 
            />
          ))}

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={goToPage}
          />
        </div>
      )}

      {/* 4. ใส่ Component DescriptionModal ไว้ด้านล่างสุด */}
      {viewDetailLog && (
        <DescriptionModal 
          request={viewDetailLog} 
          onClose={() => setViewDetailLog(null)} 
        />
      )}
    </div>
    </div>
  );
}
