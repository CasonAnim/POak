import React, { useState } from 'react';
import { Search, ChevronRight } from 'lucide-react';
import ApproveModal from './ApproveModal';
export default function RequestTable({ requests , onRefresh}) {

  console.log("REQ : " + requests)
  const [selectedRequest, setSelectedRequest] = useState(null)

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="text-xs text-gray-400 uppercase font-semibold">Current Work</p>
          <h3 className="text-xl font-bold text-gray-900">Requests</h3>
        </div>
        <button className="text-sm font-semibold text-blue-600 hover:underline">View all &gt;</button>
      </div>

      <div className="flex items-center justify-between mb-4 gap-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-3 text-gray-400" />
          <input type="text" placeholder="Search requests" className="w-full bg-gray-50 border border-gray-200 pl-9 pr-4 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black" />
        </div>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl text-xs font-semibold">
          <button className="px-3 py-1.5 bg-black text-white rounded-lg">All</button>
          <button className="px-3 py-1.5 text-gray-600 hover:bg-white rounded-lg">In review</button>
          <button className="px-3 py-1.5 text-gray-600 hover:bg-white rounded-lg">Ready</button>
        </div>
      </div>

      <div className="space-y-3">
        
        {requests.length === 0 ? (
        <p className="text-center text-xs text-gray-400 py-6">ยังไม่มีรายการคำขอยืมในระบบ</p>
      ) : (
        <div className="space-y-3">
          {requests.map((item) => (
            <div 
              key={item._id} 
              onClick={() => setSelectedRequest(item)}
              className="flex items-center justify-between p-3.5 bg-gray-50 border border-gray-100 rounded-xl"
            >
              <div>
                <p className="text-sm font-semibold text-gray-900">{item.project}</p>
                <p className="text-xs text-gray-500">ผู้ยืม: {item.userName}</p>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                item.status === 'รออนุมัติ' 
                  ? 'bg-amber-50 text-amber-600 border border-amber-200' 
                  : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
              }`}>
                {item.status}
              </span>
            </div>
          ))}
        </div>
        
      )}
      </div>
      {selectedRequest && (
        <ApproveModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onUpdated={() => {
            if (onRefresh) onRefresh();
          }}
        />
      )}
    </div>
  );
}