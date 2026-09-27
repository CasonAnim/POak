import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import API from '../axios';
import Sidebar from '../components/sidebar'
import Navbar from '../components/Navbar'
import StatCards from '../components/StatsCards'
import RequestTable from '../components/RequestTable'


export default function Dashboard() {
  const [stats, setStats] = useState({ totalBorrowed: 0 });
  const [requests, setRequests] = useState([]);
  const [name , setName] = useState()

  const fetchData = async () => {
      try {
        const dashRes = await API.get('/dashboard');
        setName(Userres.data.user.name)
        setStats(dashRes.data.overview);
        
        
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
      try {
        const trans = await API.get('/transactions')
        console.log("trans")
        console.log(trans.data)
        setRequests(trans.data)
      } catch (error) {
        console.error("Error fetching transaction data:", error);
      }
      try {
        const Userres = await API.get('/auth/me')
        setName(Userres.data.user.name)
      } catch (error) {
        console.error("Error fetching userData data:", error);
      }
    };
  useEffect(() => {
    
    fetchData();
  }, []);

  return (
    <div className="flex h-screen bg-[#F8F9FA] text-[#1E1E1E] font-sans">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-y-auto">
        <Navbar />
        <div className="p-8 max-w-7xl w-full mx-auto">
          <div className="flex justify-between items-end mb-8">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1">Today Today Today</p>
              <h1 className="text-3xl font-extrabold text-gray-900 italic font-serif">สวัสดี , {name}</h1>
              <p className="text-sm text-gray-500 mt-1">วันนี้ยืมอะไรดีครับ ?</p>
            </div>
            <Link to={"/item"} className="flex items-center gap-2 bg-black text-white px-5 py-3 rounded-xl font-medium shadow-lg hover:bg-gray-800 transition cursor-pointer">
              <Plus size={18} /> ขอยืมอุปกรณ์ใหม่
            </Link>
          </div>

          <StatCards stats={stats} />

          <div className="grid grid-cols-2 gap-8">
            <div className="col-span-2">
              <RequestTable requests={requests} onRefresh={fetchData}  />
            </div>
            
          </div>
        </div>
      </main>
    </div>
  );
}