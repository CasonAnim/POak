import React from 'react';

export default function AdminOnly({ children }) {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const role = (user.role || '').toLowerCase();
  const isAdmin = role === 'admin' || role === 'แอดมิน' || role === 'เจ้าหน้าที่';

  if (!isAdmin) return null;

  return <>{children}</>;
}