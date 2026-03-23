import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import AuthPage from './pages/public/AuthPage';

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import UserVerification from './pages/admin/UserVerification';
import UserManagement from './pages/admin/UserManagement';
import CustomerSupport from './pages/admin/CustomerSupport';

// Seeker Pages
import SeekerLayout from './pages/seeker/SeekerLayout';
import SeekerProfile from './pages/seeker/SeekerProfile';
import SeekerExplore from './pages/seeker/SeekerExplore';

// Recruiter Pages
import RecruiterLayout from './pages/recruiter/RecruiterLayout';
import RecruiterExplore from './pages/recruiter/RecruiterExplore';
import RecruiterJobs from './pages/recruiter/RecruiterJobs';
import RecruiterVideoCall from './pages/recruiter/RecruiterVideoCall';

// Shared Pages
import VerificationPage from './pages/shared/VerificationPage';
import MessagesPage from './pages/shared/MessagesPage';
import PublicProfilePage from './pages/shared/PublicProfilePage';
import VideoCall from './pages/shared/VideoCall';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/verify" element={<VerificationPage />} />
        <Route path="/video-call/:roomId" element={<VideoCall />} />
        
        {/* Seeker Routes */}
        <Route path="/seeker" element={<SeekerLayout />}>
          <Route index element={<Navigate to="/seeker/explore" replace />} />
          <Route path="profile" element={<SeekerProfile />} />
          <Route path="explore" element={<SeekerExplore />} />
          <Route path="messages" element={<MessagesPage />} />
          <Route path="profile/:userId" element={<PublicProfilePage />} />
        </Route>

        {/* Recruiter Routes */}
        <Route path="/recruiter" element={<RecruiterLayout />}>
          <Route index element={<Navigate to="/recruiter/explore" replace />} />
          <Route path="explore" element={<RecruiterExplore />} />
          <Route path="jobs" element={<RecruiterJobs />} />
          <Route path="video-call" element={<RecruiterVideoCall />} />
          <Route path="messages" element={<MessagesPage />} />
          <Route path="profile/:userId" element={<PublicProfilePage />} />
        </Route>

        {/* Admin Routes */}
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
