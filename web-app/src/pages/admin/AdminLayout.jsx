import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export default function AdminLayout() {
  const isAuthenticated = !!localStorage.getItem('adminAuth');

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafa' }}>
      <Outlet />
    </div>
  );
}
