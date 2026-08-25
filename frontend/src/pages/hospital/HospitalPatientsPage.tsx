// HealthSure — Hospital Patients Directory & Search Page
// frontend/src/pages/hospital/HospitalPatientsPage.tsx

import React, { useState } from 'react';
import {
  Search,
  ShieldCheck,
} from 'lucide-react';

interface DirectoryPatient {
  id: string;
  name: string;
  age: number;
  gender: string;
  village: string;
  phc: string;
  referralId?: string;
  department: string;
  status: string;
}

const PATIENT_DIRECTORY: DirectoryPatient[] = [
  {
    id: 'HS-10248',
    name: 'Parth Sharma',
    age: 52,
    gender: 'Male',
    village: 'Khed',
    phc: 'PHC Khed',
    referralId: 'HS-REF-7821',
    department: 'Cardiology',
    status: 'Scheduled for 28 Aug',
  },
  {
    id: 'HS-10334',
    name: 'Suresh Bhosale',
    age: 49,
    gender: 'Male',
    village: 'Guhagar',
    phc: 'PHC Guhagar',
    referralId: 'HS-REF-7902',
    department: 'Cardiology',
    status: 'Referral New',
  },
  {
    id: 'HS-10255',
    name: 'Rukmini Ghorpade',
    age: 58,
    gender: 'Female',
    village: 'Chiplun',
    phc: 'Sub-Centre Chiplun Rural',
    referralId: 'HS-REF-7915',
    department: 'Cardiology',
    status: 'Accepted',
  },
  {
    id: 'HS-10112',
    name: 'Vijay Tawde',
    age: 44,
    gender: 'Male',
    village: 'Khed',
    phc: 'PHC Khed',
    referralId: 'HS-REF-7804',
    department: 'Orthopaedics',
    status: 'Scheduled for 25 Aug',
  },
  {
    id: 'HS-10045',
    name: 'Savita Jadhav',
    age: 62,
    gender: 'Female',
    village: 'Guhagar',
    phc: 'PHC Guhagar',
    referralId: 'HS-REF-7789',
    department: 'Ophthalmology',
    status: 'Consultation Done',
  },
];

export const HospitalPatientsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<DirectoryPatient | null>(PATIENT_DIRECTORY[0]);

  const filtered = PATIENT_DIRECTORY.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.referralId && p.referralId.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="border-b border-[#DDE8E4] dark:border-[#1A3A3A] pb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-[#17324D] dark:text-[#E2EEF4]">
          Hospital Patient Directory & PHC Transferred Patients
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#7B9EA8] mt-0.5">
          Unified index of rural patients connected through the HealthSure referral network.
        </p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-5 h-5 text-[#64748B] absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Search by Patient ID (HS-10248), Name (Parth Sharma), or Referral ID (HS-REF-7821)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-2.5 text-xs sm:text-sm rounded-2xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-white dark:bg-[#0A2020] text-[#17324D] dark:text-[#E2EEF4] focus:outline-none focus:ring-2 focus:ring-[#087F6D] shadow-xs"
        />
      </div>

      {/* Two Column Layout: Patient List & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Patient List */}
        <div className="lg:col-span-1 space-y-2">
          <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">
            Matching Patients ({filtered.length})
          </span>

          <div className="space-y-2 max-h-[650px] overflow-y-auto pr-1">
            {filtered.map((patient) => {
              const isSelected = selectedPatient?.id === patient.id;
              return (
                <button
                  key={patient.id}
                  type="button"
                  onClick={() => setSelectedPatient(patient)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all ${
                    isSelected
                      ? 'border-[#087F6D] bg-[#EAF7F2]/60 dark:bg-[#073B3A]/40 shadow-xs'
                      : 'border-[#DDE8E4] dark:border-[#1A3A3A] bg-white dark:bg-[#0A2020] hover:border-[#087F6D]/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[#17324D] dark:text-[#E2EEF4]">
                      {patient.name}
                    </span>
                    <span className="font-mono text-[10px] text-[#087F6D] dark:text-[#4FD1C5] font-bold">
                      {patient.id}
                    </span>
                  </div>

                  <div className="text-xs text-[#64748B] dark:text-[#7B9EA8] mt-0.5">
                    {patient.age}y • {patient.gender} • {patient.village}
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#DDE8E4]/60 dark:border-[#1A3A3A] text-[11px]">
                    <span className="text-[#087F6D] font-semibold">{patient.department}</span>
                    <span className="text-[#64748B]">{patient.phc}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Patient Clinical Summary */}
        <div className="lg:col-span-2">
          {selectedPatient ? (
            <div className="p-6 rounded-2xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-white dark:bg-[#0A2020] space-y-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-[#DDE8E4]/60 dark:border-[#1A3A3A] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#087F6D] text-white flex items-center justify-center text-lg font-bold">
                    {selectedPatient.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#17324D] dark:text-[#E2EEF4]">
                      {selectedPatient.name}
                    </h3>
                    <p className="text-xs text-[#64748B] dark:text-[#7B9EA8]">
                      Patient ID: <span className="font-mono font-bold text-[#087F6D]">{selectedPatient.id}</span> • Registered at: {selectedPatient.phc}
                    </p>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs">
                  {selectedPatient.status}
                </span>
              </div>

              {/* Demographics Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#F5F9F7] dark:bg-[#0F2929]">
                  <span className="text-[#64748B] block text-[10px] uppercase font-bold">Age / Gender</span>
                  <strong className="text-[#17324D] dark:text-[#E2EEF4]">{selectedPatient.age} Yrs • {selectedPatient.gender}</strong>
                </div>

                <div className="p-3 rounded-xl bg-[#F5F9F7] dark:bg-[#0F2929]">
                  <span className="text-[#64748B] block text-[10px] uppercase font-bold">Village / Origin</span>
                  <strong className="text-[#17324D] dark:text-[#E2EEF4]">{selectedPatient.village}</strong>
                </div>

                <div className="p-3 rounded-xl bg-[#F5F9F7] dark:bg-[#0F2929]">
                  <span className="text-[#64748B] block text-[10px] uppercase font-bold">Department</span>
                  <strong className="text-[#087F6D] dark:text-[#4FD1C5]">{selectedPatient.department}</strong>
                </div>

                <div className="p-3 rounded-xl bg-[#F5F9F7] dark:bg-[#0F2929]">
                  <span className="text-[#64748B] block text-[10px] uppercase font-bold">Referral Ref</span>
                  <strong className="font-mono text-[#17324D] dark:text-[#E2EEF4]">{selectedPatient.referralId || 'N/A'}</strong>
                </div>
              </div>

              {/* Active Care Continuity Summary */}
              <div className="p-4 rounded-xl border border-[#087F6D]/20 bg-[#EAF7F2]/40 dark:bg-[#073B3A]/20 space-y-2 text-xs">
                <div className="font-bold text-[#073B3A] dark:text-[#4FD1C5] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Care Continuity Route: {selectedPatient.phc} ➔ District Hospital Ratnagiri</span>
                </div>
                <p className="text-[#64748B] dark:text-[#7B9EA8]">
                  Assigned Specialist: <strong>Dr. Ananya Mehta (MD, DM Cardiology)</strong> • OPD Room 104 • Token: <strong>DH-CARD-14</strong>
                </p>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-[#64748B]">
              Select a patient from the list to view clinical history.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
