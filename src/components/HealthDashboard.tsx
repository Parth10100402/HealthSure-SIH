import React, { useState } from 'react';
import { 
  Activity, 
  Watch, 
  Sparkles, 
  User, 
  Flame,
  Clock,
  X,
  Smartphone,
  RefreshCw,
  BarChart3,
  Edit3,
  Heart,
  AlertCircle,
  CheckCircle2,
  Wifi,
  WifiOff
} from 'lucide-react';
import type { FamilyMember } from '../types/health';
import { MOCK_FAMILY_MEMBERS } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { PremiumLockScreen } from './PremiumLockScreen';

interface MemberHealthData {
  healthScore: number;
  bp: string;
  sugar: string;
  heartRate: string;
  spo2: string;
  weightKg: string;
  bmi: string;
  todaySteps: number;
  activeMins: number;
  caloriesBurned: number;
  alertMsg: string;
  alertType: 'optimal' | 'warning' | 'info';
  weeklyData: { day: string; steps: number }[];
  insights: { title: string; desc: string }[];
}

const INITIAL_MEMBER_HEALTH: Record<string, MemberHealthData> = {
  'mem-1': { // Parth Sharma (Self)
    healthScore: 94,
    bp: '120/80',
    sugar: '94',
    heartRate: '72',
    spo2: '99',
    weightKg: '72',
    bmi: '23.4',
    todaySteps: 8420,
    activeMins: 45,
    caloriesBurned: 420,
    alertMsg: 'Vitals Stable: Fasting Glucose (94 mg/dL) & Blood Pressure maintained within reference range for 30 consecutive days.',
    alertType: 'optimal',
    weeklyData: [
      { day: 'Mon', steps: 7200 },
      { day: 'Tue', steps: 9100 },
      { day: 'Wed', steps: 6500 },
      { day: 'Thu', steps: 10400 },
      { day: 'Fri', steps: 8420 },
      { day: 'Sat', steps: 5800 },
      { day: 'Sun', steps: 7900 }
    ],
    insights: [
      { title: '🏃 Activity Peak', desc: 'Today (8,420 steps) is 12% higher than your 7-day step average.' },
      { title: '❤️ Steady Cardiac Rhythms', desc: 'Resting heart rate remains stable at 72 BPM over the last 14 days.' },
      { title: '🩸 Glycemic Balance', desc: 'Fasting Glucose at 94 mg/dL shows optimal insulin sensitivity.' }
    ]
  },
  'mem-2': { // Rajesh Sharma (Father)
    healthScore: 88,
    bp: '130/85',
    sugar: '108',
    heartRate: '76',
    spo2: '97',
    weightKg: '78',
    bmi: '26.1',
    todaySteps: 5200,
    activeMins: 30,
    caloriesBurned: 310,
    alertMsg: 'Mild Alert: Blood Pressure (130/85 mmHg) is slightly elevated. A 20-minute morning walk and low sodium intake are advised.',
    alertType: 'warning',
    weeklyData: [
      { day: 'Mon', steps: 4800 },
      { day: 'Tue', steps: 5500 },
      { day: 'Wed', steps: 5100 },
      { day: 'Thu', steps: 6000 },
      { day: 'Fri', steps: 5200 },
      { day: 'Sat', steps: 4200 },
      { day: 'Sun', steps: 4900 }
    ],
    insights: [
      { title: '⚠️ Systolic BP Trend', desc: 'Systolic BP peaked at 130 mmHg. Consider scheduling a routine BP checkup.' },
      { title: '🚶 Daily Step Pacing', desc: 'Completed 5,200 steps out of 10,000 goal. 30 active mins completed.' },
      { title: '🩸 Pre-Prandial Glucose', desc: 'Fasting glucose at 108 mg/dL requires mild dietary monitoring.' }
    ]
  },
  'mem-3': { // Sunita Sharma (Mother)
    healthScore: 91,
    bp: '122/80',
    sugar: '98',
    heartRate: '74',
    spo2: '98',
    weightKg: '64',
    bmi: '24.2',
    todaySteps: 6800,
    activeMins: 40,
    caloriesBurned: 360,
    alertMsg: 'Vitals Normal: Blood pressure and heart rate telemetry are performing well within clinical reference limits.',
    alertType: 'optimal',
    weeklyData: [
      { day: 'Mon', steps: 6100 },
      { day: 'Tue', steps: 6900 },
      { day: 'Wed', steps: 7200 },
      { day: 'Thu', steps: 6400 },
      { day: 'Fri', steps: 6800 },
      { day: 'Sat', steps: 5900 },
      { day: 'Sun', steps: 6300 }
    ],
    insights: [
      { title: '❤️ Heart Rate Stability', desc: 'Resting pulse at 74 BPM shows healthy cardiac recovery.' },
      { title: '🏃 Daily Movement', desc: 'Consistent activity pattern with an average of 6,500 daily steps.' },
      { title: '✨ Balanced Telemetry', desc: 'No abnormal glucose or pulse spikes detected over the past 30 days.' }
    ]
  },
  'mem-4': { // Ananya Sharma (Daughter)
    healthScore: 98,
    bp: '110/70',
    sugar: '88',
    heartRate: '80',
    spo2: '99',
    weightKg: '38',
    bmi: '18.1',
    todaySteps: 9500,
    activeMins: 60,
    caloriesBurned: 510,
    alertMsg: 'Optimal Telemetry: Excellent juvenile cardiovascular fitness and high physical activity level.',
    alertType: 'optimal',
    weeklyData: [
      { day: 'Mon', steps: 8900 },
      { day: 'Tue', steps: 10200 },
      { day: 'Wed', steps: 9100 },
      { day: 'Thu', steps: 11000 },
      { day: 'Fri', steps: 9500 },
      { day: 'Sat', steps: 8400 },
      { day: 'Sun', steps: 9800 }
    ],
    insights: [
      { title: '⚡ Active Telemetry', desc: 'High active minutes (60 mins) recorded from sports and daily routine.' },
      { title: '🫀 Peak SpO2', desc: 'Blood Oxygen levels steady at 99% oxygen saturation.' },
      { title: '🎯 Step Goal Achieved', desc: 'Achieved 95% of daily 10,000 steps target.' }
    ]
  }
};

interface HealthDashboardProps {
  activeMember?: FamilyMember;
}

export const HealthDashboard: React.FC<HealthDashboardProps> = ({ activeMember }) => {
  const { user } = useAuth();
  const [selectedMember, setSelectedMember] = useState<FamilyMember>(activeMember || MOCK_FAMILY_MEMBERS[0]);

  // Per-Member State Store
  const [memberHealthStore, setMemberHealthStore] = useState<Record<string, MemberHealthData>>(INITIAL_MEMBER_HEALTH);

  // Active Member Current Health Data
  const currentHealth = memberHealthStore[selectedMember.id] || INITIAL_MEMBER_HEALTH['mem-1'];

  // Modal & Wearables States
  const [isWearableModalOpen, setIsWearableModalOpen] = useState<boolean>(false);
  const [isEditVitalsModalOpen, setIsEditVitalsModalOpen] = useState<boolean>(false);
  const [isWearableConnected, setIsWearableConnected] = useState<boolean>(true);
  const [connectedDevice, setConnectedDevice] = useState<string>('Google Fit / Health Connect');
  const [lastSyncedTime, setLastSyncedTime] = useState<string>('Today at 08:30 AM');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isRecalculating, setIsRecalculating] = useState<boolean>(false);

  // Form Temp States for Vitals Editing
  const [editBp, setEditBp] = useState(currentHealth.bp);
  const [editSugar, setEditSugar] = useState(currentHealth.sugar);
  const [editHeartRate, setEditHeartRate] = useState(currentHealth.heartRate);
  const [editWeight, setEditWeight] = useState(currentHealth.weightKg);

  // Premium feature guard
  if (!user?.isPremium) {
    return (
      <PremiumLockScreen
        featureName="Health Dashboard"
        title="Health Dashboard is a Premium Feature"
        description="Upgrade your plan to unlock complete vitals tracking, longitudinal trends, organ health scores, and wearable sensor sync."
      />
    );
  }

  const handleMemberChange = (mem: FamilyMember) => {
    setSelectedMember(mem);
    const targetData = memberHealthStore[mem.id] || INITIAL_MEMBER_HEALTH['mem-1'];
    setEditBp(targetData.bp);
    setEditSugar(targetData.sugar);
    setEditHeartRate(targetData.heartRate);
    setEditWeight(targetData.weightKg);
  };

  const handleSaveVitals = (e: React.FormEvent) => {
    e.preventDefault();
    setMemberHealthStore(prev => ({
      ...prev,
      [selectedMember.id]: {
        ...prev[selectedMember.id],
        bp: editBp,
        sugar: editSugar,
        heartRate: editHeartRate,
        weightKg: editWeight
      }
    }));
    setIsEditVitalsModalOpen(false);
  };

  const handleRecalculateVitals = () => {
    setIsRecalculating(true);
    setTimeout(() => {
      setMemberHealthStore(prev => ({
        ...prev,
        [selectedMember.id]: {
          ...prev[selectedMember.id],
          healthScore: Math.min(100, prev[selectedMember.id].healthScore + 1)
        }
      }));
      setIsRecalculating(false);
    }, 1000);
  };

  const handleConnectDevice = (deviceName: string) => {
    setIsSyncing(true);
    setTimeout(() => {
      setConnectedDevice(deviceName);
      setIsWearableConnected(true);
      setLastSyncedTime(`Today at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
      setIsSyncing(false);
      setIsWearableModalOpen(false);
    }, 1000);
  };

  const handleDisconnectDevice = () => {
    setIsWearableConnected(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* 1. TOP HEADER & INDEPENDENT FAMILY MEMBER SWITCHER */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-400 font-bold text-xs uppercase tracking-wider border border-teal-500/20 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Personal Health Command Center
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Health <span className="text-teal-600 dark:text-teal-400">Dashboard</span>
          </h1>

          {/* Family Member Profile Selector Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-teal-500" /> Active Profile:
            </span>
            {MOCK_FAMILY_MEMBERS.map((mem) => {
              const isMemActive = selectedMember.id === mem.id;
              return (
                <button
                  key={mem.id}
                  onClick={() => handleMemberChange(mem)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all ${
                    isMemActive
                      ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <img src={mem.avatar} alt={mem.name} className="w-4 h-4 rounded-full object-cover" />
                  <span>{mem.name} ({mem.relation})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Top Actions: Recalculate Vitals & Sync Wearables */}
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={handleRecalculateVitals}
            disabled={isRecalculating}
            className="px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center space-x-2 transition-all"
          >
            <RefreshCw className={`w-4 h-4 text-teal-600 dark:text-teal-400 ${isRecalculating ? 'animate-spin' : ''}`} />
            <span>{isRecalculating ? 'Recalculating...' : 'Recalculate Vitals'}</span>
          </button>

          <button 
            onClick={() => setIsWearableModalOpen(true)}
            className="px-5 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 flex items-center space-x-2 transition-all"
          >
            <Watch className="w-4 h-4" />
            <span>{isWearableConnected ? `Synced (${connectedDevice})` : 'Sync Wearable'}</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: HEALTH OVERVIEW (HEALTH SCORE & HEALTH ALERTS BANNER) */}
      <div className="space-y-6">
        <h2 className="text-lg font-extrabold text-slate-900 dark:text-white uppercase tracking-wider text-xs text-teal-600 dark:text-teal-400">
          Section 1 • Health Overview
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* AI Daily Health Score Ring (5 cols) */}
          <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">AI Daily Health Index ({selectedMember.name})</span>

              <div className="relative w-44 h-44 mx-auto flex items-center justify-center pt-2">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="88" cy="88" r="70" stroke="currentColor" strokeWidth="12" className="text-slate-200 dark:text-slate-800" fill="transparent" />
                  <circle 
                    cx="88" 
                    cy="88" 
                    r="70" 
                    stroke="currentColor" 
                    strokeWidth="12" 
                    strokeDasharray={440} 
                    strokeDashoffset={440 - (440 * currentHealth.healthScore) / 100} 
                    className="text-teal-500 transition-all duration-1000 ease-out" 
                    fill="transparent" 
                    strokeLinecap="round" 
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-4xl font-extrabold text-slate-900 dark:text-white">{currentHealth.healthScore}</span>
                  <span className="text-xs font-bold uppercase text-emerald-600 dark:text-emerald-400 mt-0.5">/ 100 Score</span>
                </div>
              </div>
            </div>

            <div className="inline-flex items-center justify-center space-x-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20 mx-auto">
              <CheckCircle2 className="w-4 h-4" />
              <span>Optimal Health Telemetry</span>
            </div>
          </div>

          {/* Health Alerts & Important Changes Banner (7 cols) */}
          <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-teal-600 dark:text-teal-400" /> Health Alerts & Telemetry Status
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  currentHealth.alertType === 'warning' ? 'bg-amber-500/20 text-amber-600' : 'bg-emerald-500/10 text-emerald-600'
                }`}>
                  {currentHealth.alertType === 'warning' ? 'Action Recommended' : 'Vitals Stable'}
                </span>
              </div>

              <div className={`p-5 rounded-2xl border text-xs leading-relaxed font-medium ${
                currentHealth.alertType === 'warning' 
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200' 
                  : 'bg-teal-500/10 border-teal-500/20 text-slate-800 dark:text-slate-200'
              }`}>
                "{currentHealth.alertMsg}"
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span>Patient Profile: <strong>{selectedMember.name}</strong></span>
              <span>Blood Group: <strong>{selectedMember.bloodGroup}</strong></span>
            </div>
          </div>

        </div>
      </div>

      {/* SECTION 2: VITALS (HEART RATE, BP, FASTING GLUCOSE, SPO2, WEIGHT/BMI) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-extrabold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
            Section 2 • Core Vitals Telemetry
          </h2>

          <button
            onClick={() => setIsEditVitalsModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-700 dark:text-teal-400 font-bold text-xs border border-teal-500/30 flex items-center space-x-1.5 transition-all"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Vitals ({selectedMember.name})</span>
          </button>
        </div>

        {/* 5 Vitals Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          
          {/* Heart Rate */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase text-slate-400">Heart Rate</span>
              <Heart className="w-4 h-4 text-rose-500" />
            </div>
            <div>
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{currentHealth.heartRate}</span>
              <span className="text-xs text-slate-400 font-medium ml-1">BPM</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold block w-fit">Optimal</span>
          </div>

          {/* Blood Pressure */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase text-slate-400">Blood Pressure</span>
              <Activity className="w-4 h-4 text-teal-500" />
            </div>
            <div>
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{currentHealth.bp}</span>
              <span className="text-xs text-slate-400 font-medium ml-1">mmHg</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold block w-fit">Reference Range</span>
          </div>

          {/* Fasting Blood Glucose */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase text-slate-400">Fasting Glucose</span>
              <Flame className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{currentHealth.sugar}</span>
              <span className="text-xs text-slate-400 font-medium ml-1">mg/dL</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold block w-fit">Normal</span>
          </div>

          {/* SpO2 Blood Oxygen */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase text-slate-400">SpO2 Oxygen</span>
              <Activity className="w-4 h-4 text-cyan-500" />
            </div>
            <div>
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{currentHealth.spo2}%</span>
              <span className="text-xs text-slate-400 font-medium ml-1">Sat</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold block w-fit">Optimal</span>
          </div>

          {/* Weight & BMI */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase text-slate-400">Weight / BMI</span>
              <User className="w-4 h-4 text-teal-600" />
            </div>
            <div>
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{currentHealth.weightKg} kg</span>
              <span className="text-xs text-slate-400 font-medium ml-1">BMI {currentHealth.bmi}</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold block w-fit">Healthy BMI</span>
          </div>

        </div>
      </div>

      {/* SECTION 3: ACTIVITY (STEPS TODAY, STEP GOAL PROGRESS, ACTIVE MINS, CALORIES, WEEKLY CHART) */}
      <div className="space-y-4">
        <h2 className="text-xs font-extrabold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
          Section 3 • Activity & Telemetry
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Steps Goal Progress (7 cols) */}
          <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-teal-600 dark:text-teal-400" /> Steps & Movement Telemetry
                </h3>
                <span className="px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-400 font-bold text-[10px] uppercase">
                  Goal: 10,000 Steps
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">
                    {currentHealth.todaySteps.toLocaleString()} <span className="text-xs text-slate-400 font-normal">/ 10,000 steps</span>
                  </span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {Math.round((currentHealth.todaySteps / 10000) * 100)}% Completed
                  </span>
                </div>

                <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div 
                    className="h-full bg-teal-600 rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, (currentHealth.todaySteps / 10000) * 100)}%` }} 
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center space-x-3">
                <Clock className="w-8 h-8 text-teal-600 dark:text-teal-400" />
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Active Minutes</span>
                  <span className="text-xl font-extrabold text-slate-900 dark:text-white">{currentHealth.activeMins} mins</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center space-x-3">
                <Flame className="w-8 h-8 text-amber-500" />
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Calories Burned</span>
                  <span className="text-xl font-extrabold text-slate-900 dark:text-white">{currentHealth.caloriesBurned} kcal</span>
                </div>
              </div>
            </div>
          </div>

          {/* Weekly Activity Bar Visualization (5 cols) */}
          <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-teal-600 dark:text-teal-400" /> Weekly Activity Chart
              </h3>
              <span className="text-xs font-bold text-slate-400">7-Day Pacing</span>
            </div>

            <div className="flex items-end justify-between gap-2 h-36 pt-4">
              {currentHealth.weeklyData.map((item, idx) => {
                const heightPercent = Math.min(100, Math.round((item.steps / 10000) * 100));
                const isToday = item.day === 'Fri';
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <div 
                      className={`w-full rounded-t-lg transition-all ${
                        isToday ? 'bg-teal-600' : 'bg-slate-200 dark:bg-slate-800'
                      }`} 
                      style={{ height: `${heightPercent}%` }} 
                    />
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{item.day}</span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* SECTION 4: WEARABLES (HONEST CONNECTION STATUS, DISCONNECTED FALLBACK, LAST SYNCED TIMESTAMP) */}
      <div className="space-y-4">
        <h2 className="text-xs font-extrabold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
          Section 4 • Wearables & Connected Sensors
        </h2>

        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className={`p-3 rounded-2xl ${isWearableConnected ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                {isWearableConnected ? <Wifi className="w-6 h-6" /> : <WifiOff className="w-6 h-6" />}
              </div>

              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {isWearableConnected ? `Connected to ${connectedDevice}` : 'No Wearable Connected'}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {isWearableConnected 
                    ? `Live steps and heart rate telemetry syncing. Last synced: ${lastSyncedTime}` 
                    : 'Connect a wearable to sync live health telemetry'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {isWearableConnected ? (
              <button
                onClick={handleDisconnectDevice}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors"
              >
                Disconnect Device
              </button>
            ) : (
              <button
                onClick={() => setIsWearableModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 transition-all"
              >
                Connect a Wearable
              </button>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 5: AI HEALTH INSIGHTS & DAILY RECOMMENDATIONS */}
      <div className="space-y-4">
        <h2 className="text-xs font-extrabold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
          Section 5 • AI Personal Health Insights
        </h2>

        <div className="p-6 sm:p-8 rounded-3xl bg-teal-500/10 border border-teal-500/30 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-teal-700 dark:text-teal-400">
            <Sparkles className="w-5 h-5" />
            <h3 className="text-base font-extrabold uppercase tracking-wider">PERSONALIZED TELEMETRY INSIGHTS ({selectedMember.name})</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            {currentHealth.insights.map((ins, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-teal-500/20 space-y-1 text-xs">
                <span className="font-extrabold text-slate-900 dark:text-white block">{ins.title}</span>
                <p className="text-slate-600 dark:text-slate-300 font-medium">{ins.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* EDIT VITALS MODAL */}
      {isEditVitalsModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-6 relative">
            <button
              onClick={() => setIsEditVitalsModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Edit Core Vitals ({selectedMember.name})</h3>
              <p className="text-xs text-slate-500 font-medium">Update vital readings specifically for {selectedMember.name}.</p>
            </div>

            <form onSubmit={handleSaveVitals} className="space-y-4 text-xs font-bold">
              <div>
                <label className="text-slate-400 block mb-1">Blood Pressure (mmHg)</label>
                <input
                  type="text"
                  value={editBp}
                  onChange={(e) => setEditBp(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Fasting Blood Glucose (mg/dL)</label>
                <input
                  type="text"
                  value={editSugar}
                  onChange={(e) => setEditSugar(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Heart Rate (BPM)</label>
                <input
                  type="text"
                  value={editHeartRate}
                  onChange={(e) => setEditHeartRate(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Weight (kg)</label>
                <input
                  type="text"
                  value={editWeight}
                  onChange={(e) => setEditWeight(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20"
              >
                Save Updated Vitals
              </button>
            </form>
          </div>
        </div>
      )}

      {/* WEARABLE CONNECT MODAL */}
      {isWearableModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-6 relative">
            <button
              onClick={() => setIsWearableModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Watch className="w-5 h-5 text-teal-600 dark:text-teal-400" /> Connect Wearable Sensor
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Sync live steps and heart rate telemetry.</p>
            </div>

            <div className="space-y-3">
              {['Apple Health', 'Google Fit / Health Connect', 'Smartwatch / Fitbit'].map((dev) => (
                <button
                  key={dev}
                  onClick={() => handleConnectDevice(dev)}
                  disabled={isSyncing}
                  className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-left flex items-center justify-between text-xs font-bold hover:border-teal-500 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Smartphone className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                    <span>{dev}</span>
                  </div>
                  {isWearableConnected && connectedDevice === dev ? (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase">Connected</span>
                  ) : (
                    <span className="text-teal-600 dark:text-teal-400">Connect →</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
