import React, { useState } from 'react';
import { Stethoscope, Building2 } from 'lucide-react';
import { DoctorDiscovery } from './DoctorDiscovery';
import { HospitalHub } from './HospitalHub';

interface DoctorHospitalHubProps {
  initialSubTab?: 'doctors' | 'hospitals';
  recommendedSpecialty?: string;
}

export const DoctorHospitalHub: React.FC<DoctorHospitalHubProps> = ({
  initialSubTab = 'doctors',
  recommendedSpecialty
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'doctors' | 'hospitals'>(initialSubTab);

  return (
    <div className="space-y-6">
      
      {/* COMBINED SUB-TAB HEADER: FIND CARE */}
      <div className="p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <button
            onClick={() => setActiveSubTab('doctors')}
            className={`flex-1 sm:flex-none flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl font-extrabold text-xs transition-all ${
              activeSubTab === 'doctors'
                ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>Doctors</span>
          </button>

          <button
            onClick={() => setActiveSubTab('hospitals')}
            className={`flex-1 sm:flex-none flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl font-extrabold text-xs transition-all ${
              activeSubTab === 'hospitals'
                ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Hospitals</span>
          </button>
        </div>

        <span className="hidden sm:block text-xs font-bold text-slate-400 pr-4">
          Find Care Healthcare Discovery
        </span>
      </div>

      {/* RENDER SUB-TAB CONTENT */}
      {activeSubTab === 'doctors' ? (
        <DoctorDiscovery 
          onSelectDoctorToBook={() => {
            // Action trigger for doctor booking modal
          }} 
          recommendedSpecialty={recommendedSpecialty} 
        />
      ) : (
        <HospitalHub />
      )}

    </div>
  );
};
