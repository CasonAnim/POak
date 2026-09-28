import React from 'react';
import { Search } from 'lucide-react';

const FILTER_TABS = ['All', 'ขอยืม', 'อนุมัติ', 'ปฏิเสธ', 'คืนสำเร็จ', 'แจ้งปัญหา'];

export default function LogFilterBar({
  searchTerm,
  onSearchChange,
  searchType,       // 'all' | 'studentId' | 'name' | 'project'
  onSearchTypeChange,
  actionFilter,
  onFilterChange,
  isAdmin,
}) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4">
      {/* Search Input Group */}
      <div className="flex items-center gap-2 w-full sm:flex-1">
        {/* สำหรับอาจารย์/Admin: ให้มีเมนูล็อกว่าจะค้นด้วยอะไร */}
        {isAdmin && onSearchTypeChange && (
          <select
            value={searchType}
            onChange={(e) => onSearchTypeChange(e.target.value)}
            className="bg-gray-50 border border-gray-200 text-xs font-semibold rounded-xl px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-black shrink-0 cursor-pointer"
          >
            <option value="all">ค้นหาทั้งหมด</option>
            <option value="studentId">ล็อก: รหัสนักศึกษา</option>
            <option value="name">ล็อก: ชื่อนักศึกษา</option>
            <option value="project">ล็อก: ชื่อโปรเจกต์</option>
          </select>
        )}

        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={
              !isAdmin
                ? 'ค้นหาด้วยชื่อโปรเจกต์...'
                : searchType === 'studentId'
                ? 'พิมพ์รหัสนักศึกษา เช่น 684001...'
                : searchType === 'name'
                ? 'พิมพ์ชื่อ-นามสกุล...'
                : searchType === 'project'
                ? 'พิมพ์ชื่อโปรเจกต์...'
                : 'ค้นหาด้วยรหัสนักศึกษา, ชื่อ, หรือโปรเจกต์...'
            }
            className="w-full bg-gray-50 border border-gray-200 pl-9 pr-4 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl text-xs font-semibold overflow-x-auto w-full sm:w-auto">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => onFilterChange(tab)}
            className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap cursor-pointer ${
              actionFilter === tab
                ? 'bg-black text-white shadow-xs'
                : 'text-gray-600 hover:bg-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
}