import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CustomerApp from './pages/customer/CustomerApp';
import DealerDashboard from './pages/dealer/Dashboard';
import Auth from './components/Auth';
import { useAuth } from './context/AuthContext';

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
        <Route path="/dealer" element={<DealerDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
