import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const PatientPortal: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <PortalPlaceholder
      icon={<User className="w-8 h-8 text-[#087F6D]" />}
      title="Patient Portal"
      subtitle="Your healthcare journey"
      user={user?.fullName}
      onLogout={handleLogout}
      phase="Phase 2"
    />
  );
};

// ─── Shared placeholder layout ────────────────────────────────────────────────

interface PortalPlaceholderProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  user?: string;
  onLogout: () => void;
  phase?: string;
}

export function PortalPlaceholder({
  icon,
  title,
  subtitle,
  user,
  onLogout,
  phase = 'Phase 2',
}: PortalPlaceholderProps) {
  return (
    <div className="min-h-screen bg-[#F5F9F7] dark:bg-[#051818] flex flex-col font-sans transition-colors">
      {/* Header */}
      <header className="flex items-center justify-between px-5 sm:px-8 py-4 bg-white dark:bg-[#0A2020] border-b border-[#DDE8E4] dark:border-[#1A3A3A]">
        <div className="flex items-center">
          <img
            src="/healthsure-logo.png"
            alt="HealthSure"
            className="h-8 w-auto object-contain max-w-[160px]"
          />
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="flex items-center gap-1.5 text-sm text-[#64748B] dark:text-[#7B9EA8] hover:text-red-600 dark:hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="text-center space-y-5 max-w-sm">
          <div className="w-20 h-20 rounded-2xl bg-[#EAF7F2] dark:bg-[#073B3A]/60 flex items-center justify-center mx-auto">
            {icon}
          </div>

          <div>
            {user && (
              <p className="text-sm text-[#087F6D] dark:text-[#4FD1C5] font-medium mb-1">
                Welcome, {user}
              </p>
            )}
            <h1 className="text-2xl font-bold text-[#17324D] dark:text-[#D1E8E2]">{title}</h1>
            <p className="text-[#64748B] dark:text-[#7B9EA8] mt-1">{subtitle}</p>
          </div>

          <div className="bg-white dark:bg-[#0A2020] rounded-xl border border-[#DDE8E4] dark:border-[#1A3A3A] p-5 text-left space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#17324D] dark:text-[#D1E8E2]">
              <Clock className="w-4 h-4 text-[#087F6D]" />
              {phase} — Coming Soon
            </div>
            <p className="text-sm text-[#64748B] dark:text-[#7B9EA8] leading-relaxed">
              The full {title} dashboard will be built in {phase}. Authentication is complete and working. 
              This placeholder confirms successful login and role-based routing.
            </p>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 rounded-lg border border-[#DDE8E4] dark:border-[#1A3A3A] bg-white dark:bg-[#0A2020] text-[#17324D] dark:text-[#D1E8E2] text-sm font-medium py-2.5 hover:border-[#087F6D] hover:text-[#087F6D] dark:hover:border-[#087F6D] dark:hover:text-[#4FD1C5] transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </main>
    </div>
  );
}
