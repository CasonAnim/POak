
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import History from './pages/History';
import Sidebar from './components/Sidebar';
import AdminOnly from './components/AdminOnly';
import UserMgr from './pages/UserMgr';
import Navbar from './components/Navbar';
import ItemsToBorrow from './pages/ItemsToBorrowCason';
import ProtectedRoute from './components/ProtectedRoute';
import { Routes , Route , Navigate,  Outlet } from 'react-router-dom';
  
function AppLayout() {
  return (
    <div className="flex h-screen bg-[#F8F9FA] text-[#1E1E1E] font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <header className="w-full shrink-0 z-10 sticky top-0 bg-white">
          <Navbar />
        </header>
        <main className="flex-1 overflow-y-auto">
          {/* Outlet คือจุดที่หน้า Dashboard, Me, History, Item จะถูกเรนเดอร์ */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* 1. หน้าทั่วไป (Public Routes) เข้าได้อิสระ ไม่มี Sidebar/Navbar */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* 2. หน้าที่ต้องล็อกอิน (Protected Routes) */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/me" element={<Profile />} />
        <Route path="/log" element={<History />} />
        <Route path="/item" element={<ItemsToBorrow />} />
        <Route path="/users" element={
          <AdminOnly>
            <UserMgr />
          </AdminOnly>
        }
/>
      </Route>

      {/* 3. จัดการเส้นทางที่เหลือ */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}