import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import API from '../axios';

// นำเข้า Components ที่แยกไว้เพื่อให้โค้ดอ่านง่าย
import DashboardStats from '../components/DashboardStats';
import RequestTable from '../components/RequestTable';

export default function Dashboard() {
  const [requests, setRequests] = useState([]);
  const [equipments, setEquipments] = useState([]);
  const [name, setName] = useState('...');
  const [isLoading, setIsLoading] = useState(true);

  // ฟังก์ชันดึงข้อมูลทั้งหมดพร้อมกัน (Parallel Fetching) เพื่อความรวดเร็ว
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [userRes, transRes, equipRes] = await Promise.all([
        API.get('/auth/me').catch(() => null),
        API.get('/transactions').catch(() => ({ data: [] })),
        API.get('/equipments').catch(() => ({ data: [] }))
      ]);

      // เซ็ตชื่อผู้ใช้
      if (userRes?.data?.user?.name) {
        setName(userRes.data.user.name);
      }

      // เซ็ตข้อมูล Transactions และ Equipments เพื่อส่งให้ Component ลูกนำไปคำนวณสถิติ
      setRequests(transRes.data || []);
      setEquipments(equipRes.data || []);

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-8 max-w-7xl w-full mx-auto">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1">
            P.I.M Equipment System
          </p>
          <h1 className="text-3xl font-extrabold text-gray-900 italic font-serif">
            สวัสดี, {name}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            วันนี้ต้องการเบิก หรือยืมอุปกรณ์อะไรดีครับ?
          </p>
        </div>

        <Link 
          to="/item" 
          className="flex items-center gap-2 bg-black text-white px-5 py-3 rounded-xl font-medium shadow-lg hover:bg-gray-800 transition cursor-pointer"
        >
          <Plus size={18} /> ขอยืมอุปกรณ์ใหม่
        </Link>
      </div>

      {/* สถิติภาพรวม 5 สถานะ และวัสดุสิ้นเปลือง (Requirement ข้อ 5) */}
      {!isLoading && (
        <DashboardStats equipments={equipments} requests={requests} />
      )}

      {/* ตารางจัดการคำขอ */}
      <div className="grid grid-cols-1 gap-8 mt-2">
        <div className="col-span-1">
          <RequestTable requests={requests} onRefresh={fetchData} />
        </div>
      </div>

    </div>
  );
}