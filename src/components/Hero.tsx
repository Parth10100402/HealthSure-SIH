import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Stethoscope, 
  Building2, 
  Calculator, 
  Activity, 
  Calendar, 
  Clock, 
  ChevronRight, 
  Users, 
  Sparkles, 
  ShieldCheck, 
  ArrowUpRight
} from 'lucide-react';
import { MOCK_FAMILY_MEMBERS } from '../data/mockData';

interface HeroProps {
  onNavigate: (tab: string) => void;
  activePatientName?: string;
}

export const Hero: React.FC<HeroProps> = ({
  onNavigate,
  activePatientName = 'Parth Sharma'
}) => {
  const [dashboard, setDashboard] = useState<any>(null);

  useEffect(() => {
    setDashboard({
      greetingTime: 'Good morning',
      healthScore: 94
    });
  }, [activePatientName]);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* 1. PERSONALIZED WELCOME & GREETING HEADER */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        
        {/* Patient ABHA & Status Metadata Strip */}
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs border-b border-slate-200 dark:border-slate-800 pb-4 text-slate-500 dark:text-slate-400 font-mono">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-2 text-slate-900 dark:text-white font-bold font-sans text-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Patient: {activePatientName}
            </span>
            <span>ID: HS-84920</span>
            <span>ABHA: 91-8472-9102-4412</span>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold border border-emerald-500/20">
              ABHA Connected
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <Clock className="w-3.5 h-3.5" /> Synced 2m ago
            </span>
          </div>
        </div>

        {/* Greeting Title */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {dashboard ? `${dashboard.greetingTime}, ` : 'Good morning, '}
            <span className="text-teal-600 dark:text-teal-400">{activePatientName}</span>
          </h1>
          <p className="text-base sm:text-lg font-bold text-slate-600 dark:text-slate-300">
            How can we help you today?
          </p>
        </div>

        {/* 4 PRIMARY ACTION CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          
          {/* Action 1: Analyze a Report */}
          <button
            onClick={() => onNavigate('aimedical')}
            className="p-5 rounded-2xl bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 text-left transition-all group flex flex-col justify-between space-y-4"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center justify-between">
                <span>Analyze a Report</span>
                <ArrowUpRight className="w-4 h-4 text-teal-600 dark:text-teal-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                Upload blood test, MRI, or X-Ray
              </p>
            </div>
          </button>

          {/* Action 2: Find a Doctor */}
          <button
            onClick={() => onNavigate('clinical')}
            className="p-5 rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-left transition-all group flex flex-col justify-between space-y-4"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center justify-between">
                <span>Find a Doctor</span>
                <ArrowUpRight className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                Search specialists & book slot
              </p>
            </div>
          </button>

          {/* Action 3: Find a Hospital */}
          <button
            onClick={() => onNavigate('hospitals')}
            className="p-5 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-left transition-all group flex flex-col justify-between space-y-4"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center justify-between">
                <span>Find a Hospital</span>
                <ArrowUpRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                24/7 ICU & emergency facilities
              </p>
            </div>
          </button>

          {/* Action 4: Estimate Treatment Cost */}
          <button
            onClick={() => onNavigate('cost')}
            className="p-5 rounded-2xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-left transition-all group flex flex-col justify-between space-y-4"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center justify-between">
                <span>Estimate Treatment Cost</span>
                <ArrowUpRight className="w-4 h-4 text-sky-600 dark:text-sky-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                Calculate insurance & payable
              </p>
            </div>
          </button>

        </div>

      </div>

      {/* 2. HEALTH SNAPSHOT BAR */}
      {dashboard && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-teal-600 dark:text-teal-400" /> Health Snapshot
            </h2>
            <button 
              onClick={() => onNavigate('dashboard')} 
              className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
            >
              <span>View Full Dashboard</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Overall Health Score</span>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-2xl font-black text-teal-600 dark:text-teal-400">{dashboard.healthScore}</span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Optimal</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Blood Pressure</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white block mt-1">120/80 <span className="text-xs font-normal text-slate-400">mmHg</span></span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Fasting Glucose</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white block mt-1">94 <span className="text-xs font-normal text-slate-400">mg/dL</span></span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Today's Activity</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white block mt-1">8,420 <span className="text-xs font-normal text-slate-400">steps</span></span>
            </div>

          </div>
        </div>
      )}

      {/* 3. RECENT REPORTS & UPCOMING HEALTH ACTIVITY GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Recent Reports (7 cols) */}
        <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-600 dark:text-teal-400" /> Recent Reports
            </h3>
            <button 
              onClick={() => onNavigate('aimedical')} 
              className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
            >
              <span>Analyze New</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white">Comprehensive CBC & Vitamin Profile</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold text-[10px]">Normal</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">AIIMS Delhi • Aug 05, 2026</p>
              </div>
              <button 
                onClick={() => onNavigate('aimedical')}
                className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold shrink-0 hover:bg-teal-600 hover:text-white transition-colors"
              >
                View
              </button>
            </div>
          </div>
        </div>

        {/* Upcoming Activity & Consultations (5 cols) */}
        <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Upcoming Consultations
            </h3>
            <button 
              onClick={() => onNavigate('clinical')} 
              className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
            >
              <span>Book</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-teal-700 dark:text-teal-400 uppercase">Quarterly Cardiology Review</span>
              <span className="px-2 py-0.5 rounded bg-teal-600 text-white font-bold text-[10px]">Tomorrow</span>
            </div>
            <div>
              <p className="text-sm font-extrabold text-slate-900 dark:text-white">Dr. K.S. Murthy</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Fortis Escorts Heart Institute • 10:30 AM</p>
            </div>
          </div>
        </div>

      </div>

      {/* 4. FAMILY HEALTH PREVIEW & PERSONALIZED HEALTH INSIGHT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Family Health (6 cols) */}
        <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> Family Health
            </h3>
            <button 
              onClick={() => onNavigate('care')} 
              className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
            >
              <span>Manage Family</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {MOCK_FAMILY_MEMBERS.map((mem) => (
              <div 
                key={mem.id}
                onClick={() => onNavigate('care')}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center space-y-2 cursor-pointer hover:border-teal-500 transition-colors"
              >
                <img src={mem.avatar} alt={mem.name} className="w-10 h-10 rounded-full mx-auto object-cover" />
                <div>
                  <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate">{mem.name}</p>
                  <p className="text-[10px] text-slate-500 font-medium">{mem.relation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Personalized Health Insight Card (6 cols) */}
        <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-teal-900/40 via-slate-900 to-slate-900 border border-teal-500/30 text-white space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 w-fit border border-teal-500/30">
              <Sparkles className="w-3.5 h-3.5" /> Personalized Health Insight
            </span>
            <h3 className="text-xl font-extrabold">Hydration & Electrolyte Balance</h3>
            <p className="text-xs text-slate-300 font-medium leading-relaxed">
              Your recent blood tests indicate optimal kidney filtration (Serum Creatinine 0.9 mg/dL). Maintaining 2.5L daily hydration will support cardio-renal function.
            </p>
          </div>

          <button 
            onClick={() => onNavigate('dashboard')}
            className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs w-fit transition-colors"
          >
            Learn More
          </button>
        </div>

      </div>

    </div>
  );
};
