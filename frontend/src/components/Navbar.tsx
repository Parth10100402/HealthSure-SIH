import React from 'react';
import { 
  Heart, 
  Search, 
  FileText, 
  Calendar, 
  LayoutDashboard, 
  AlertTriangle, 
  Sun, 
  Moon, 
  Stethoscope, 
  Users, 
  Calculator, 
  Activity,
  BellRing,
  Sparkles
} from 'lucide-react';
import type { FamilyMember } from '../types/health';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  activeFamilyMember: FamilyMember;
  onOpenSOS: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  darkMode,
  setDarkMode,
  activeFamilyMember,
  onOpenSOS
}) => {
  
  // Categorized Navigation Groups for clean top-to-bottom structure
  const navCategories = [
    {
      group: 'Overview',
      items: [
        { id: 'home', label: 'Home', icon: Heart, theme: 'hover:text-blue-500' },
        { id: 'dashboard', label: 'Health Dashboard', icon: LayoutDashboard, theme: 'hover:text-cyan-500' },
      ]
    },
    {
      group: 'Doctor & Hospital Finder',
      items: [
        { id: 'doctors', label: 'Find Doctors', icon: Stethoscope, theme: 'hover:text-emerald-500' },
        { id: 'hospitals', label: 'Smart Hospital Finder', icon: Search, theme: 'hover:text-indigo-500' },
        { id: 'appointments', label: 'Book Appointment', icon: Calendar, theme: 'hover:text-blue-500' },
      ]
    },
    {
      group: 'AI Diagnostics & Costs',
      items: [
        { id: 'reports', label: 'AI Report Analyzer', icon: FileText, theme: 'hover:text-rose-500' },
        { id: 'symptoms', label: 'Symptom Checker', icon: Activity, theme: 'hover:text-violet-500' },
        { id: 'cost', label: 'Cost Estimator', icon: Calculator, theme: 'hover:text-purple-500' },
      ]
    },
    {
      group: 'Personal & Family Care',
      items: [
        { id: 'medicines', label: 'Medicine Reminders', icon: BellRing, theme: 'hover:text-amber-500' },
        { id: 'family', label: 'Family Vault', icon: Users, theme: 'hover:text-teal-500' },
      ]
    }
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200/60 dark:border-slate-800/80 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 space-y-3">
        
        {/* TOP ROW: Brand Header & Global Action Controls */}
        <div className="flex items-center justify-between">
          
          {/* Brand Logo Title */}
          <div 
            onClick={() => setActiveTab('home')}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform duration-300">
              <Heart className="w-7 h-7 fill-white/20 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                  Health<span className="text-blue-600 dark:text-blue-400">Sure</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-emerald-500/10 to-blue-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[11px] font-black uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-500" /> AI 2.0 Super App
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Your AI Healthcare Companion • Smart Triage, Reports, Doctors & Cost Engine
              </p>
            </div>
          </div>

          {/* Right Actions: Dark Mode, Active Profile, SOS Emergency */}
          <div className="flex items-center space-x-3">
            
            {/* SOS Emergency Button */}
            <button
              onClick={onOpenSOS}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-lg shadow-red-500/30 hover:shadow-red-500/50 transition-all animate-bounce hover:animate-none"
              title="Activate Emergency Mode"
            >
              <AlertTriangle className="w-4 h-4 fill-white" />
              <span>SOS Emergency</span>
            </button>

            {/* Dark Mode Switcher */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </button>

            {/* Active Family Member Chip */}
            <button 
              onClick={() => setActiveTab('family')}
              className="hidden md:flex items-center space-x-2.5 p-1.5 pr-3.5 rounded-full bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 hover:border-emerald-400 transition-all shadow-sm"
            >
              <img
                src={activeFamilyMember.avatar}
                alt={activeFamilyMember.name}
                className="w-7 h-7 rounded-full object-cover border-2 border-emerald-500"
              />
              <div className="text-left">
                <span className="text-[10px] text-slate-400 font-bold block leading-none">ACTIVE PROFILE</span>
                <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                  {activeFamilyMember.name}
                </span>
              </div>
            </button>

          </div>
        </div>

        {/* BOTTOM ROW: Navigation Options Stacked Top-to-Bottom directly below HealthSure Name */}
        <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
          
          <div className="flex flex-wrap items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
            {navCategories.flatMap(cat => cat.items).map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              let activeBg = 'bg-blue-600 text-white shadow-md shadow-blue-500/20';
              if (item.id === 'hospitals') activeBg = 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20';
              if (item.id === 'doctors') activeBg = 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20';
              if (item.id === 'reports') activeBg = 'bg-rose-600 text-white shadow-md shadow-rose-500/20';
              if (item.id === 'cost') activeBg = 'bg-purple-600 text-white shadow-md shadow-purple-500/20';
              if (item.id === 'symptoms') activeBg = 'bg-violet-600 text-white shadow-md shadow-violet-500/20';
              if (item.id === 'dashboard') activeBg = 'bg-cyan-600 text-white shadow-md shadow-cyan-500/20';
              if (item.id === 'medicines') activeBg = 'bg-amber-600 text-white shadow-md shadow-amber-500/20';
              if (item.id === 'family') activeBg = 'bg-teal-600 text-white shadow-md shadow-teal-500/20';

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all duration-200 whitespace-nowrap ${
                    isActive
                      ? `${activeBg} scale-[1.03]`
                      : `bg-slate-100/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 ${item.theme} hover:bg-slate-200 dark:hover:bg-slate-700/80`
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

        </div>

      </div>
    </header>
  );
};
