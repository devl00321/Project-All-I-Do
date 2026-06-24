import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CustomerApp from './pages/customer/CustomerApp';
import DealerDashboard from './pages/dealer/Dashboard';
import Auth from './components/Auth';
import { useAuth } from './context/AuthContext';
import AdminAuth from './pages/admin/AdminAuth';
import AdminRegister from './pages/admin/AdminRegister';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Profile from './pages/admin/Profile';
import HqAuth from './pages/hq/HqAuth';
import HqDashboard from './pages/hq/HqDashboard';
import './index.css';

function App() {
  const { session } = useAuth();

  if (!session) {
    return <Auth />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CustomerApp />} />
        <Route path="/admin" element={<AdminAuth />} />
        <Route path="/admin/register" element={<AdminRegister />} />
        
        {/* Admin/Dealer Portal */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* HQ Portal */}
        <Route path="/hq" element={<HqAuth />} />
        <Route path="/hq/dashboard" element={<HqDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
