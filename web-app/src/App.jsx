import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import CustomerApp from './pages/customer/CustomerApp';
import AdminAuth from './pages/admin/AdminAuth';
import AdminRegister from './pages/admin/AdminRegister';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Profile from './pages/admin/Profile';
import HqAuth from './pages/hq/HqAuth';
import HqDashboard from './pages/hq/HqDashboard';
import { ThemeProvider } from './context/ThemeContext';
import './index.css';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
      <Routes>
        {/* Customer Portal as Landing Page */}
        <Route path="/*" element={<CustomerApp />} />
        
        {/* Admin/Dealer Portal */}
        <Route path="/admin/login" element={<AdminAuth />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
        </Route>
        <Route path="/admin/register" element={<AdminRegister />} />

        {/* HQ Portal */}
        <Route path="/hq" element={<HqAuth />} />
        <Route path="/hq/dashboard" element={<HqDashboard />} />
      </Routes>
    </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
