
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import ItemsToBorrow from './pages/ItemsToBorrowCason';
import ProtectedRoute from './components/ProtectedRoute';
import { Routes , Route , Navigate } from 'react-router-dom';
  
export default function App() {
  return (
    <Routes>
      {/* หน้าทั่วไป (Public) */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* หน้าที่ต้องล็อกอินก่อน (Protected) */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
       <Route
        path="/me"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route path="/item" element = {
        <ProtectedRoute>
          <ItemsToBorrow/>
        </ProtectedRoute>
      } />

      {/* ถ้าเข้าหน้าแรกสุด (/) หรือพิมพ์มั่ว ให้ดีดไปที่ Dashboard (ซึ่งจะถูกเช็คต่อว่าล็อกอินยัง) */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
