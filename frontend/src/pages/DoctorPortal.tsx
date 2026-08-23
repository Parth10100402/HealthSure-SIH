import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Stethoscope } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PortalPlaceholder } from './PatientPortal';

export const DoctorPortal: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <PortalPlaceholder
      icon={<Stethoscope className="w-8 h-8 text-[#087F6D]" />}
      title="Doctor Portal"
      subtitle="Manage patients and consultations"
      user={user?.fullName}
      onLogout={handleLogout}
      phase="Phase 2"
    />
  );
};
