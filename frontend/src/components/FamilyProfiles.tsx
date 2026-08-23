import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Check
} from 'lucide-react';
import type { FamilyMember } from '../types/health';
import { MOCK_FAMILY_MEMBERS } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { PremiumLockScreen } from './PremiumLockScreen';

interface MemberProfileData {
  bloodGroup: string;
  allergies: string[];
  medicalHistory: string[];
  reportsCount: number;
  medicinesCount: number;
  emergencyContact: string;
}

const MOCK_PROFILES_DATA: Record<string, MemberProfileData> = {
  'fam-1': {
    bloodGroup: 'O+ Positive',
    allergies: ['Penicillin'],
    medicalHistory: ['Asthma (Mild)', 'Mild Hypertension'],
    reportsCount: 4,
    medicinesCount: 2,
    emergencyContact: '+91 98110 12345 (Son - Parth)'
  },
  'fam-2': {
    bloodGroup: 'B+ Positive',
    allergies: ['Sulfa Drugs'],
    medicalHistory: ['Hypertension', 'Type-2 Diabetes'],
    reportsCount: 6,
    medicinesCount: 3,
    emergencyContact: '+91 98110 12345 (Son - Parth)'
  },
  'fam-3': {
    bloodGroup: 'A+ Positive',
    allergies: ['Pollen', 'Dust'],
    medicalHistory: ['Thyroid Stiffness'],
    reportsCount: 2,
    medicinesCount: 1,
    emergencyContact: '+91 98110 12345 (Son - Parth)'
  }
};

export const FamilyProfiles: React.FC = () => {
  const { user } = useAuth();
  const [members] = useState<FamilyMember[]>(MOCK_FAMILY_MEMBERS);
  const [selectedId, setSelectedId] = useState<string>('fam-1');

  // Premium feature guard
  if (!user?.isPremium) {
    return (
      <PremiumLockScreen
        featureName="Family Health"
        title="Family Health Vault is a Premium Feature"
        description="Upgrade your plan to manage independent medical records, Rx medicines, reports, and emergency contacts for your family."
      />
    );
  }

  const currentMember = members.find(m => m.id === selectedId) || members[0];
  const currentProfile = MOCK_PROFILES_DATA[selectedId] || MOCK_PROFILES_DATA['fam-1'];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* 1. HEADER & FAMILY MEMBER SWITCHER BAR */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-400 font-bold text-xs uppercase tracking-wider border border-teal-500/20">
              <Users className="w-3.5 h-3.5" /> Family Health Vault
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Family <span className="text-teal-600 dark:text-teal-400">Health Space</span>
            </h1>
          </div>

          <button
            className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm shadow-teal-600/20 flex items-center space-x-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Family Member</span>
          </button>
        </div>

        {/* MEMBER SWITCHER CHIPS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {members.map((mem) => {
            const isActive = selectedId === mem.id;
            return (
              <div
                key={mem.id}
                onClick={() => setSelectedId(mem.id)}
                className={`p-4 rounded-2xl border cursor-pointer flex items-center space-x-3 transition-all ${
                  isActive
                    ? 'bg-teal-500/10 border-teal-500 ring-2 ring-teal-500/20 scale-[1.01]'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <img
                  src={mem.avatar}
                  alt={mem.name}
                  className="w-12 h-12 rounded-xl object-cover shrink-0"
                />
                <div className="truncate">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[10px] font-extrabold uppercase text-teal-600 dark:text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded">
                      {mem.relation}
                    </span>
                    {isActive && <Check className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />}
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white truncate mt-0.5">{mem.name}</h3>
                  <p className="text-xs text-slate-500 font-medium">{mem.age} Yrs</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. ISOLATED MEMBER HEALTH DETAILS DISPLAY */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <img src={currentMember.avatar} alt={currentMember.name} className="w-12 h-12 rounded-full object-cover" />
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">{currentMember.name}'s Medical Context</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Independent profile data isolated to this family member.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Blood Group */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase">Blood Group</span>
            <p className="text-lg font-extrabold text-rose-600 dark:text-rose-400">{currentProfile.bloodGroup}</p>
          </div>

          {/* Allergies */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase">Known Allergies</span>
            <p className="text-sm font-extrabold text-slate-900 dark:text-white">{currentProfile.allergies.join(', ') || 'None Reported'}</p>
          </div>

          {/* Medical History */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase">Medical Conditions</span>
            <p className="text-sm font-extrabold text-slate-900 dark:text-white">{currentProfile.medicalHistory.join(', ') || 'Healthy'}</p>
          </div>

          {/* Emergency Contact */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase">Emergency Contact</span>
            <p className="text-xs font-bold text-teal-600 dark:text-teal-400 truncate">{currentProfile.emergencyContact}</p>
          </div>

        </div>
      </div>

    </div>
  );
};
