import React, { useState, useEffect } from 'react';
import { Pill, Users, Syringe } from 'lucide-react';
import { MedicineReminder } from './MedicineReminder';
import { FamilyProfiles } from './FamilyProfiles';
import { PreventiveCareTracker } from './PreventiveCareTracker';
import type { FamilyMember } from '../types/health';

interface PersonalFamilyCareProps {
  initialSubTab?: 'family' | 'medicines' | 'preventive';
  activeMember?: FamilyMember;
  onSelectMember?: (member: FamilyMember) => void;
}

export const PersonalFamilyCare: React.FC<PersonalFamilyCareProps> = ({
  initialSubTab = 'family'
}) => {
  const [subTab, setSubTab] = useState<'family' | 'medicines' | 'preventive'>(initialSubTab);

  useEffect(() => {
    if (initialSubTab) {
      setSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  return (
    <div className="space-y-6">
      
      {/* Sub-Tab Selector Header */}
      <div className="p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center space-x-2 shadow-xs">
        <button
          onClick={() => setSubTab('family')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-extrabold text-xs transition-all ${
            subTab === 'family'
              ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Family Health Vault</span>
        </button>

        <button
          onClick={() => setSubTab('medicines')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-extrabold text-xs transition-all ${
            subTab === 'medicines'
              ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Pill className="w-4 h-4" />
          <span>Medicine Schedule</span>
        </button>

        <button
          onClick={() => setSubTab('preventive')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-extrabold text-xs transition-all ${
            subTab === 'preventive'
              ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Syringe className="w-4 h-4" />
          <span>Preventive & ABHA Card</span>
        </button>
      </div>

      {subTab === 'family' && <FamilyProfiles />}
      {subTab === 'medicines' && <MedicineReminder />}
      {subTab === 'preventive' && <PreventiveCareTracker />}

    </div>
  );
};
