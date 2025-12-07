import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import VideoRoom from './pages/VideoRoom';

// Patient Pages
import {
  PatientDashboard,
  BookAppointment,
  PatientAppointments,
  Prescriptions,
  PatientProfile,
  PatientSupport
} from './pages/patient';

// Doctor Pages
import {
  DoctorDashboard,
  DoctorAppointments,
  DoctorAvailability,
  DoctorEarnings,
  DoctorProfile,
  DoctorPatients,
  DoctorPrescriptions,
  DoctorSupport
} from './pages/doctor';

// Admin Pages
import {
  AdminDashboard,
  AdminVerification,
  AdminUsers,
  AdminAppointments,
  AdminPayments,
  AdminSupport,
  AdminAnalytics,
  AdminSettings
} from './pages/admin';

import './App.css';

// Protected Route Component
function ProtectedRoute({ children, allowedRoles }) {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const token = localStorage.getItem('token');

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    if (user.role === 'patient') return <Navigate to="/patient" replace />;
    if (user.role === 'doctor') return <Navigate to="/doctor" replace />;
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
  }

  return children;
}

// Redirect based on role
function RoleBasedRedirect() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  
  if (!user) return <Navigate to="/login" replace />;
  
  switch (user.role) {
    case 'patient': return <Navigate to="/patient" replace />;
    case 'doctor': return <Navigate to="/doctor" replace />;
    case 'admin': return <Navigate to="/admin" replace />;
    default: return <Navigate to="/login" replace />;
  }
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Root redirect */}
        <Route path="/" element={<RoleBasedRedirect />} />
        <Route path="/dashboard" element={<RoleBasedRedirect />} />

        {/* Patient Routes */}
        <Route path="/patient" element={
          <ProtectedRoute allowedRoles={['patient']}>
            <PatientDashboard />
          </ProtectedRoute>
        } />
        <Route path="/patient/book" element={
          <ProtectedRoute allowedRoles={['patient']}>
            <BookAppointment />
          </ProtectedRoute>
        } />
        <Route path="/patient/appointments" element={
          <ProtectedRoute allowedRoles={['patient']}>
            <PatientAppointments />
          </ProtectedRoute>
        } />
        <Route path="/patient/prescriptions" element={
          <ProtectedRoute allowedRoles={['patient']}>
            <Prescriptions />
          </ProtectedRoute>
        } />
        <Route path="/patient/profile" element={
          <ProtectedRoute allowedRoles={['patient']}>
            <PatientProfile />
          </ProtectedRoute>
        } />
        <Route path="/patient/support" element={
          <ProtectedRoute allowedRoles={['patient']}>
            <PatientSupport />
          </ProtectedRoute>
        } />

        {/* Doctor Routes */}
        <Route path="/doctor" element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <DoctorDashboard />
          </ProtectedRoute>
        } />
        <Route path="/doctor/appointments" element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <DoctorAppointments />
          </ProtectedRoute>
        } />
        <Route path="/doctor/availability" element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <DoctorAvailability />
          </ProtectedRoute>
        } />
        <Route path="/doctor/earnings" element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <DoctorEarnings />
          </ProtectedRoute>
        } />
        <Route path="/doctor/profile" element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <DoctorProfile />
          </ProtectedRoute>
        } />
        <Route path="/doctor/patients" element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <DoctorPatients />
          </ProtectedRoute>
        } />
        <Route path="/doctor/prescriptions" element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <DoctorPrescriptions />
          </ProtectedRoute>
        } />
        <Route path="/doctor/support" element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <DoctorSupport />
          </ProtectedRoute>
        } />

        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/verification" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminVerification />
          </ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminUsers />
          </ProtectedRoute>
        } />
        <Route path="/admin/appointments" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminAppointments />
          </ProtectedRoute>
        } />
        <Route path="/admin/payments" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminPayments />
          </ProtectedRoute>
        } />
        <Route path="/admin/support" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminSupport />
          </ProtectedRoute>
        } />
        <Route path="/admin/analytics" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminAnalytics />
          </ProtectedRoute>
        } />
        <Route path="/admin/settings" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminSettings />
          </ProtectedRoute>
        } />

        {/* Video Room - accessible by both patients and doctors */}
        <Route path="/room/:id" element={
          <ProtectedRoute allowedRoles={['patient', 'doctor']}>
            <VideoRoom />
          </ProtectedRoute>
        } />

        {/* Catch all - redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
