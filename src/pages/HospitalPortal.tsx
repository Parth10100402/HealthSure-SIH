import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PortalPlaceholder } from './PatientPortal';

export const HospitalPortal: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <PortalPlaceholder
      icon={<Building2 className="w-8 h-8 text-[#087F6D]" />}
      title="Hospital Staff Portal"
      subtitle="Manage hospital operations and referrals"
      user={user?.fullName}
      onLogout={handleLogout}
      phase="Phase 2"
    />
  );
};
