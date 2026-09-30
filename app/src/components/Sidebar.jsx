import { LayoutDashboard, FileText, Calendar, Package, ShieldCheck, User, LogOut } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import AdminOnly from './AdminOnly.jsx';

export default function Sidebar() {
  return (
    <aside className="w-64 bg-[#F1F3F5] border-r border-gray-200 flex flex-col justify-between p-4 h-screen sticky top-0">
      <div>
        {/* เปลี่ยนจาก Text เป็นรูป Logo ตรงกลางสวยๆ */}
        <div className="flex flex-col items-center justify-center mb-8 mt-4 px-2">
          <img 
            src="/icon.png"
            alt="logo" 
            className="w-32 h-auto object-contain drop-shadow-sm transition-transform hover:scale-105 duration-300" 
          />
        </div>
        
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 px-3">
          Workspace
        </p>
        
        <nav className="space-y-1.5">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-3 rounded-xl font-semibold transition-all ${
                isActive ? 'bg-black text-white shadow-md' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
              }`
            }
          >
            <LayoutDashboard size={18} /> Overview
          </NavLink>
          
          <NavLink
            to="/log"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-3 rounded-xl font-semibold transition-all ${
                isActive ? 'bg-black text-white shadow-md' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
              }`
            }
          >
            <Calendar size={18} /> Log
          </NavLink>
          <NavLink
            to="/item"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-3 rounded-xl font-semibold transition-all ${
                isActive ? 'bg-black text-white shadow-md' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
              }`
            }
          >
            <Package size={18} /> Items
          </NavLink>
          <NavLink
            to="/me"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-3 rounded-xl font-semibold transition-all ${
                isActive ? 'bg-black text-white shadow-md' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
              }`
            }
          >
            <User size={18} /> Profile
          </NavLink>
          <AdminOnly>
            <NavLink
              to="/users"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-3 rounded-xl font-semibold transition-all ${
                  isActive ? 'bg-black text-white shadow-md' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                }`
              }
            >
              <ShieldCheck size={18} /> จัดการผู้ใช้
            </NavLink>
          </AdminOnly>
        </nav>
      </div>

      <div className="space-y-4">
        
        
        <NavLink
          to="/login"
          className="flex items-center gap-3 px-3.5 py-3 rounded-xl font-semibold transition-all text-gray-600 hover:text-white hover:bg-red-600 hover:shadow-md hover:shadow-red-600/20"
          onClick={() => {
            // เคลียร์ Storage ตอนกด Log out ให้เรียบร้อย
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }}
        >
          <LogOut size={18} /> Log out
        </NavLink>

        
      </div>
    </aside>
  );
}