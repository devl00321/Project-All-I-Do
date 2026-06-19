import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export default function AdminLayout() {
  const isAuthenticated = localStorage.getItem('adminAuth') === 'true';

  if (!isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafa' }}>
      <Outlet />
    </div>
  );
}
