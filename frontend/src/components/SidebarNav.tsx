import React, { useState } from 'react';
import { 
  Heart, 
  FileText, 
  Calculator, 
  LayoutDashboard, 
  Users, 
  Menu,
  X,
  Moon,
  Sun,
  Crown,
  User,
  AlertTriangle,
  Stethoscope
} from 'lucide-react';
import type { FamilyMember } from '../types/health';
import { LogoIcon } from './LogoIcon';
import { useAuth } from '../context/AuthContext';

interface SidebarNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeFamilyMember: FamilyMember;
  onOpenSOS: () => void;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
  onOpenPremiumModal?: () => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenSOS,
  isDarkMode = true,
  onToggleTheme = () => {}
}) => {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);

  // Core Primary Navigation Items
  const navItems = [
    { id: 'home', label: 'Home', icon: Heart },
    { id: 'aimedical', label: 'Medical Suite', icon: FileText, isPremium: true },
    { id: 'dashboard', label: 'Health', icon: LayoutDashboard, isPremium: true },
    { id: 'clinical', label: 'Find Care', icon: Stethoscope },
    { id: 'cost', label: 'Cost Estimator', icon: Calculator },
    { id: 'care', label: 'Family', icon: Users, isPremium: true },
    { id: 'premium', label: 'Premium', icon: Crown },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  const handleSelectTab = (id: string) => {
    setActiveTab(id);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Top Navigation Bar */}
      <header className="lg:hidden sticky top-0 z-40 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between shadow-xs">
        <button 
          onClick={() => handleSelectTab('home')}
          className="flex items-center space-x-2.5 text-left"
        >
          <LogoIcon className="w-7 h-7" />
          <span className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
            Health<span className="text-teal-600 dark:text-teal-400">Sure</span>
          </span>
        </button>

        <div className="flex items-center space-x-2">
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium"
            aria-label="Toggle Theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-teal-600" />}
          </button>

          <button
            onClick={onOpenSOS}
            className="px-3.5 py-1.5 rounded-xl bg-rose-600 text-white font-bold text-xs"
          >
            SOS
          </button>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Overlay Backdrop for Mobile */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs"
        />
      )}

      {/* DESKTOP & MOBILE SIDEBAR NAVIGATION */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 lg:z-30 w-64 h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between p-5 transition-transform duration-200 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* BRAND HEADER */}
        <div className="space-y-6">
          
          <button 
            onClick={() => handleSelectTab('home')}
            className="w-full flex items-center space-x-3 text-left pb-4 border-b border-slate-200 dark:border-slate-800"
          >
            <LogoIcon className="w-8 h-8 shrink-0" />
            <div>
              <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white block leading-tight">
                Health<span className="text-teal-600 dark:text-teal-400">Sure</span>
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">
                Your health, explained simply
              </span>
            </div>
          </button>

          {/* SOS Emergency Trigger */}
          <button
            onClick={onOpenSOS}
            className="w-full py-2.5 px-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-between shadow-xs transition-colors"
          >
            <span className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 fill-white" />
              <span>EMERGENCY SOS</span>
            </span>
            <span className="bg-white/20 px-2 py-0.5 rounded-lg text-[9px] font-mono">24/7</span>
          </button>

          {/* NAVIGATION LIST */}
          <nav className="space-y-1" aria-label="Main Navigation">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 block mb-2">
              Navigation
            </span>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/20'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center space-x-3 truncate">
                    <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.isPremium && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[9px] font-black uppercase border border-amber-500/30 shrink-0">
                      PRO
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

        </div>

        {/* SIDEBAR FOOTER */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
          
          {/* User Profile Card */}
          <div 
            onClick={() => handleSelectTab('profile')}
            className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between cursor-pointer hover:border-teal-500 transition-colors"
          >
            <div className="flex items-center space-x-2.5 truncate">
              <div className="w-8 h-8 rounded-xl bg-teal-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                {user?.fullName ? user.fullName.charAt(0) : 'U'}
              </div>
              <div className="truncate">
                <span className="text-xs font-extrabold text-slate-900 dark:text-white truncate block">
                  {user?.fullName || 'HealthSure Patient'}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate block">
                  {user?.isPremium ? 'Premium Account' : 'Free Account'}
                </span>
              </div>
            </div>
          </div>

          {/* Theme & Logout Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onToggleTheme}
              className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center justify-center space-x-1.5"
            >
              {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-teal-600" />}
              <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </button>

            <button
              onClick={logout}
              className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 text-xs font-bold"
              title="Log Out"
            >
              Exit
            </button>
          </div>

        </div>

      </aside>
    </>
  );
};
