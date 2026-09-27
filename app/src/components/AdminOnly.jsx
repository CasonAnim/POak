import React from 'react';

export default function AdminOnly({ children }) {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'Admin' || user.role === 'เจ้าหน้าที่';

  if (!isAdmin) return null;

  return <>{children}</>;
}