import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CustomerApp from './pages/customer/CustomerApp';
import DealerDashboard from './pages/dealer/Dashboard';
import './index.css';

function App() {
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
