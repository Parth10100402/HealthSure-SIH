import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PortalPlaceholder } from './PatientPortal';

export const AdminPortal: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <PortalPlaceholder
      icon={<BarChart3 className="w-8 h-8 text-[#087F6D]" />}
      title="Government Admin Portal"
      subtitle="Monitor public healthcare services"
      user={user?.fullName}
      onLogout={handleLogout}
      phase="Phase 2"
    />
  );
};
