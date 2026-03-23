import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Public Pages
import LandingPage from './pages/public/LandingPage';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import UserVerification from './pages/admin/UserVerification';
import UserManagement from './pages/admin/UserManagement';
import CustomerSupport from './pages/admin/CustomerSupport';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/verification" replace />} />
          <Route path="verification" element={<UserVerification />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="support" element={<CustomerSupport />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
