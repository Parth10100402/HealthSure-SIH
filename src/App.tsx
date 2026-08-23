import React, { useEffect } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginView } from './components/LoginView';

// ── Patient Portal ──────────────────────────────────────────────────────────
import { PatientLayout } from './components/patient/PatientLayout';
import { PatientOverviewPage } from './pages/patient/PatientOverviewPage';
import { AppointmentsPage } from './pages/patient/AppointmentsPage';
import { OutreachPage } from './pages/patient/OutreachPage';
import { HealthRecordsPage } from './pages/patient/HealthRecordsPage';
import { ReferralsPage } from './pages/patient/ReferralsPage';
import { DiagnosticsPage } from './pages/patient/DiagnosticsPage';
import { MedicinesPage } from './pages/patient/MedicinesPage';
import { TeleconsultationPage } from './pages/patient/TeleconsultationPage';
import { FollowUpsPage } from './pages/patient/FollowUpsPage';
import { ProfilePage } from './pages/patient/ProfilePage';
import { HelpSupportPage } from './pages/patient/HelpSupportPage';

// ── Doctor Portal ───────────────────────────────────────────────────────────
import { DoctorLayout } from './components/doctor/DoctorLayout';
import { DoctorOverviewPage } from './pages/doctor/DoctorOverviewPage';
import { DoctorAppointmentsPage } from './pages/doctor/DoctorAppointmentsPage';
import { DoctorReferralsPage } from './pages/doctor/DoctorReferralsPage';
import { DoctorTeleconsultPage } from './pages/doctor/DoctorTeleconsultPage';
import { DoctorRecordsPage } from './pages/doctor/DoctorRecordsPage';
import { DoctorFollowUpsPage } from './pages/doctor/DoctorFollowUpsPage';
import { DoctorOutreachPage } from './pages/doctor/DoctorOutreachPage';
import { DoctorProfilePage } from './pages/doctor/DoctorProfilePage';

// ── Hospital Staff Portal ───────────────────────────────────────────────────
import { HospitalLayout } from './components/hospital/HospitalLayout';
import { HospitalOverviewPage } from './pages/hospital/HospitalOverviewPage';
import { HospitalReferralsPage } from './pages/hospital/HospitalReferralsPage';
import { HospitalAppointmentsPage } from './pages/hospital/HospitalAppointmentsPage';
import { HospitalOutreachPage } from './pages/hospital/HospitalOutreachPage';
import { HospitalDiagnosticsPage } from './pages/hospital/HospitalDiagnosticsPage';
import { HospitalCapacityPage } from './pages/hospital/HospitalCapacityPage';
import { HospitalPatientsPage } from './pages/hospital/HospitalPatientsPage';
import { HospitalReportsPage } from './pages/hospital/HospitalReportsPage';
import { HospitalProfilePage } from './pages/hospital/HospitalProfilePage';

// ── Government Admin Portal ────────────────────────────────────────────────
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminOverviewPage } from './pages/admin/AdminOverviewPage';
import { AdminFacilitiesPage } from './pages/admin/AdminFacilitiesPage';
import { AdminReferralsPage } from './pages/admin/AdminReferralsPage';
import { AdminOutreachPage } from './pages/admin/AdminOutreachPage';
import { AdminAppointmentsPage } from './pages/admin/AdminAppointmentsPage';
import { AdminTeleconsultPage } from './pages/admin/AdminTeleconsultPage';
import { AdminFollowUpsPage } from './pages/admin/AdminFollowUpsPage';
import { AdminDiagnosticsPage } from './pages/admin/AdminDiagnosticsPage';
import { AdminReportsPage } from './pages/admin/AdminReportsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

// ─── Protected Route ─────────────────────────────────────────────────────────

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return null;
  return <>{children}</>;
}

// ─── Public Route (redirect if already logged in) ─────────────────────────────

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      // Redirect to the right portal based on role
      const routes: Record<string, string> = {
        patient: '/patient',
        doctor: '/doctor',
        hospital_staff: '/hospital',
        government_admin: '/admin',
      };
      const dest = routes[user.role] ?? '/patient';
      navigate(dest, { replace: true });
    }
  }, [isAuthenticated, isLoading, user, navigate]);

  if (isLoading) return <LoadingScreen />;
  if (isAuthenticated) return null;
  return <>{children}</>;
}

// ─── Loading screen ───────────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#F5F9F7] dark:bg-[#051818] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <img
          src="/healthsure-logo.png"
          alt="HealthSure"
          className="h-10 w-auto object-contain animate-pulse"
        />
        <div className="flex items-center gap-2 text-sm text-[#64748B] dark:text-[#7B9EA8]">
          <svg className="w-4 h-4 animate-spin text-[#087F6D]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          Loading HealthSure…
        </div>
      </div>
    </div>
  );
}

// ─── App Shell ────────────────────────────────────────────────────────────────

function AppRoutes() {
  return (
    <Routes>
      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Public auth route */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginView />
          </PublicRoute>
        }
      />

      {/* ── Phase 2: Patient Portal ──────────────────────────────────────── */}
      <Route
        path="/patient"
        element={
          <ProtectedRoute>
            <PatientLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<PatientOverviewPage />} />
        <Route path="appointments" element={<AppointmentsPage />} />
        <Route path="outreach" element={<OutreachPage />} />
        <Route path="records" element={<HealthRecordsPage />} />
        <Route path="referrals" element={<ReferralsPage />} />
        <Route path="diagnostics" element={<DiagnosticsPage />} />
        <Route path="medicines" element={<MedicinesPage />} />
        <Route path="teleconsultation" element={<TeleconsultationPage />} />
        <Route path="follow-ups" element={<FollowUpsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="help" element={<HelpSupportPage />} />
      </Route>

      {/* ── Phase 3: Doctor Portal ───────────────────────────────────────── */}
      <Route
        path="/doctor"
        element={
          <ProtectedRoute>
            <DoctorLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DoctorOverviewPage />} />
        <Route path="appointments" element={<DoctorAppointmentsPage />} />
        <Route path="referrals" element={<DoctorReferralsPage />} />
        <Route path="teleconsultation" element={<DoctorTeleconsultPage />} />
        <Route path="records" element={<DoctorRecordsPage />} />
        <Route path="follow-ups" element={<DoctorFollowUpsPage />} />
        <Route path="outreach" element={<DoctorOutreachPage />} />
        <Route path="profile" element={<DoctorProfilePage />} />
      </Route>

      {/* ── Phase 3: Hospital Staff Portal ───────────────────────────────── */}
      <Route
        path="/hospital"
        element={
          <ProtectedRoute>
            <HospitalLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<HospitalOverviewPage />} />
        <Route path="referrals" element={<HospitalReferralsPage />} />
        <Route path="appointments" element={<HospitalAppointmentsPage />} />
        <Route path="outreach" element={<HospitalOutreachPage />} />
        <Route path="diagnostics" element={<HospitalDiagnosticsPage />} />
        <Route path="capacity" element={<HospitalCapacityPage />} />
        <Route path="patients" element={<HospitalPatientsPage />} />
        <Route path="reports" element={<HospitalReportsPage />} />
        <Route path="profile" element={<HospitalProfilePage />} />
      </Route>

      {/* ── Phase 4: Government Admin Portal ───────────────────────────── */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminOverviewPage />} />
        <Route path="facilities" element={<AdminFacilitiesPage />} />
        <Route path="referrals" element={<AdminReferralsPage />} />
        <Route path="outreach" element={<AdminOutreachPage />} />
        <Route path="appointments" element={<AdminAppointmentsPage />} />
        <Route path="teleconsultations" element={<AdminTeleconsultPage />} />
        <Route path="follow-ups" element={<AdminFollowUpsPage />} />
        <Route path="diagnostics" element={<AdminDiagnosticsPage />} />
        <Route path="reports" element={<AdminReportsPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
      </Route>

      {/* 404 fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
