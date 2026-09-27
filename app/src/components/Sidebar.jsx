
import { LayoutDashboard, FileText, Calendar, Package, Settings, User, LogOut } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export default function Sidebar() {
  return (
    <aside className="w-64 bg-[#F1F3F5] border-r border-gray-200 flex flex-col justify-between p-4 h-screen sticky top-0">
      <div>
        <div className="flex items-center gap-2 mb-8 px-2">
          <span className="font-bold text-lg text-gray-800">P.I.M Equipment borrow</span>
        </div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">Workspace</p>
        <nav className="space-y-1">
          <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition ${
                  isActive ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-200'
                }`
              }
            >
            <LayoutDashboard size={18} /> Overview
          </NavLink>
          <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition ${
                  isActive ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-200'
                }`
              }
            >
            <FileText size={18} /> Request
          </NavLink>
          <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition ${
                  isActive ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-200'
                }`
              }
            >
            <Calendar size={18} /> Schedule
          </NavLink>
          <NavLink
              to="/item"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition ${
                  isActive ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-200'
                }`
              }
            >
            <Package size={18} /> Items
          </NavLink>
          <NavLink
              to="/me"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition ${
                  isActive ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-200'
                }`
              }
            >
            <User size={18} /> Profile
          </NavLink>
          
        </nav>
      </div>
      <div className="space-y-4">
        <div className="bg-white p-3 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 mb-1">✨ One clear place.</div>
          <p className="text-xs text-gray-500">Keep your next move visible.</p>
        </div>
        <NavLink
              to="/login"
              className={
                'flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition text-gray-600 hover:text-white hover:bg-red-900'
                  
              }
            >
            <LogOut size={18} /> Log out
          </NavLink>
      </div>
    </aside>
  );
}