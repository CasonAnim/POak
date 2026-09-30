import { LayoutDashboard, Calendar, Package, ShieldCheck, User, LogOut, X } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import AdminOnly from './AdminOnly.jsx';

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 px-3.5 py-3 rounded-xl font-semibold transition-all ${
    isActive ? 'bg-black text-white shadow-md' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
  }`;

// Below lg the sidebar is a slide-in drawer (opened from the Navbar menu button).
// From lg up it is the normal fixed-width sidebar.
export default function Sidebar({ open = false, onClose = () => {} }) {
  return (
    <>
      {/* Backdrop (drawer only) */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 z-30 bg-black/50 transition-opacity duration-200 lg:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-dvh w-64 max-w-[85vw] flex-col justify-between overflow-y-auto border-r border-gray-200 bg-[#F1F3F5] p-4 transition-transform duration-200 lg:sticky lg:top-0 lg:z-auto lg:shrink-0 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="absolute right-3 top-3 p-2 rounded-lg text-gray-500 hover:bg-gray-200 cursor-pointer lg:hidden"
        >
          <X size={18} />
        </button>

        <div>
          <div className="flex flex-col items-center justify-center mb-6 lg:mb-8 mt-4 px-2">
            <img
              src="/icon.png"
              alt="logo"
              className="w-24 lg:w-32 h-auto object-contain drop-shadow-sm transition-transform hover:scale-105 duration-300"
            />
          </div>

          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 px-3">
            Workspace
          </p>

          <nav className="space-y-1.5">
            <NavLink to="/dashboard" onClick={onClose} className={linkClass}>
              <LayoutDashboard size={18} /> Overview
            </NavLink>
            <NavLink to="/log" onClick={onClose} className={linkClass}>
              <Calendar size={18} /> Log
            </NavLink>
            <NavLink to="/item" onClick={onClose} className={linkClass}>
              <Package size={18} /> Items
            </NavLink>
            <NavLink to="/me" onClick={onClose} className={linkClass}>
              <User size={18} /> Profile
            </NavLink>
            <AdminOnly>
              <NavLink to="/users" onClick={onClose} className={linkClass}>
                <ShieldCheck size={18} /> จัดการผู้ใช้
              </NavLink>
            </AdminOnly>
          </nav>
        </div>

        <div className="space-y-4 pt-6">
          <NavLink
            to="/login"
            className="flex items-center gap-3 px-3.5 py-3 rounded-xl font-semibold transition-all text-gray-600 hover:text-white hover:bg-red-600 hover:shadow-md hover:shadow-red-600/20"
            onClick={() => {
              // เคลียร์ Storage ตอนกด Log out ให้เรียบร้อย
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              onClose();
            }}
          >
            <LogOut size={18} /> Log out
          </NavLink>
        </div>
      </aside>
    </>
  );
}
