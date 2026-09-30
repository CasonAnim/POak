import React from 'react';
import { Package, CheckCircle, Clock, AlertTriangle, Flame, AlertCircle } from 'lucide-react';

export default function DashboardStats({ equipments = [], requests = [] }) {
  // 1. คำนวณสถิติจากคลังอุปกรณ์ (Equipments)
  const totalItems = equipments.reduce((sum, item) => sum + (Number(item.totalQuantity) || 0), 0);
  const availableItems = equipments.reduce((sum, item) => sum + (Number(item.availableQuantity) || 0), 0);
  const defectiveItems = equipments.reduce((sum, item) => sum + (Number(item.defectiveQuantity) || 0), 0);
  const lostItems = equipments.reduce((sum, item) => sum + (Number(item.lostQuantity) || 0), 0);
  
  const borrowedItems = Math.max(0, totalItems - availableItems - defectiveItems - lostItems);

  // 2. คำนวณสถิติจากรายการคำขอ (Transactions)
  const now = new Date();
  const overdueRequestsCount = requests.filter((r) => {
    const isApproved = r.status === 'อนุมัติ' || r.status === 'อนุมัติแล้ว';
    return isApproved && r.expectedReturnDate && new Date(r.expectedReturnDate) < now;
  }).length;

  // 3. สถิติวัสดุสิ้นเปลืองที่ถูกเบิกจ่ายไปแล้ว (อัปเดตใหม่ 🌟)
  const consumableUsedCount = requests
    .filter((r) => r.status === 'คืนแล้ว' || r.status === 'อนุมัติแล้ว')
    .reduce((sum, r) => {
      const items = r.items || [];
      
      const consumableItems = items.filter((it) => {
        // ดึง ID ของอุปกรณ์ในคำขอนี้
        const eqId = it.equipmentId?._id || it.equipmentId;
        
        // วิ่งไปหาข้อมูลอุปกรณ์ชิ้นนี้ในคลัง (equipments) ว่าเป็นวัสดุสิ้นเปลืองหรือไม่
        const matchedEq = equipments.find(e => String(e._id) === String(eqId));
        
        // ตรวจสอบ type ว่าตรงกับวัสดุสิ้นเปลืองไหม
        return matchedEq?.type === 'วัสดุสิ้นเปลือง' || 
               matchedEq?.category === 'วัสดุสิ้นเปลือง' || 
               it.equipmentId?.type === 'วัสดุสิ้นเปลือง';
      });

      return sum + consumableItems.reduce((iSum, it) => iSum + (Number(it.quantity) || 0), 0);
    }, 0);

  // โครงสร้างข้อมูลการ์ดทั้ง 6 ใบ
  const stats = [
    {
      title: 'อุปกรณ์ทั้งหมด',
      value: totalItems,
      unit: 'ชิ้น',
      icon: Package,
      color: 'text-gray-900',
      bgColor: 'bg-gray-100',
      borderColor: 'border-gray-200'
    },
    {
      title: 'พร้อมใช้งาน',
      value: availableItems,
      unit: 'ชิ้น',
      icon: CheckCircle,
      color: 'text-emerald-700',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200'
    },
    {
      title: 'กำลังถูกยืม',
      value: borrowedItems,
      unit: 'ชิ้น',
      icon: Clock,
      color: 'text-blue-700',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      title: 'ชำรุด / สูญหาย',
      value: defectiveItems + lostItems,
      subDetail: `ชำรุด ${defectiveItems} • หาย ${lostItems}`,
      unit: 'ชิ้น',
      icon: AlertTriangle,
      color: 'text-amber-700',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200'
    },
    {
      title: 'เกินกำหนดส่งคืน',
      value: overdueRequestsCount,
      unit: 'รายการ',
      icon: AlertCircle,
      color: overdueRequestsCount > 0 ? 'text-red-700' : 'text-gray-600',
      bgColor: overdueRequestsCount > 0 ? 'bg-red-50' : 'bg-gray-50',
      borderColor: overdueRequestsCount > 0 ? 'border-red-200' : 'border-gray-200',
      highlight: overdueRequestsCount > 0
    },
    {
      title: 'วัสดุสิ้นเปลือง (เบิก)',
      value: consumableUsedCount,
      unit: 'ชิ้น',
      icon: Flame,
      color: 'text-purple-700',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
      {stats.map((card, index) => {
        const IconComponent = card.icon;
        return (
          <div
            key={index}
            className={`p-3 sm:p-4 rounded-2xl border transition-all duration-200 ${card.bgColor} ${card.borderColor} ${
              card.highlight ? 'ring-2 ring-red-400 animate-pulse' : 'hover:shadow-sm'
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className="text-[11px] font-semibold text-gray-500 line-clamp-2">
                {card.title}
              </span>
              <div className={`p-1.5 rounded-lg bg-white/80 shadow-2xs ${card.color}`}>
                <IconComponent size={14} />
              </div>
            </div>

            <div className="flex items-baseline gap-1.5">
              <span className={`text-2xl font-black tracking-tight ${card.color}`}>
                {card.value}
              </span>
              <span className="text-[10px] font-medium text-gray-400">
                {card.unit}
              </span>
            </div>

            {card.subDetail && (
              <p className="text-[10px] text-gray-500 font-medium mt-1 truncate">
                {card.subDetail}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
