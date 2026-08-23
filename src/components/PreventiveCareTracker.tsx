import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Syringe, 
  QrCode, 
  Copy, 
  Check
} from 'lucide-react';
import { MOCK_FAMILY_MEMBERS } from '../data/mockData';

interface VaccineRecord {
  id: string;
  name: string;
  targetDisease: string;
  recommendedAge: string;
  status: 'Completed' | 'Due Soon' | 'Upcoming';
  dueDate: string;
}

const IMMUNIZATION_SCHEDULE: VaccineRecord[] = [
  { id: 'v1', name: 'Annual Influenza (Flu Shot)', targetDisease: 'Seasonal Flu', recommendedAge: 'Adults (Annual)', status: 'Due Soon', dueDate: 'Sep 2026' },
  { id: 'v2', name: 'Tdap Booster', targetDisease: 'Tetanus, Diphtheria, Pertussis', recommendedAge: 'Every 10 Years', status: 'Completed', dueDate: 'Mar 2024' },
  { id: 'v3', name: 'Hepatitis B Series', targetDisease: 'Hepatitis B Virus', recommendedAge: 'Adults', status: 'Completed', dueDate: 'Jan 2022' },
  { id: 'v4', name: 'Pneumococcal Vaccine', targetDisease: 'Pneumonia', recommendedAge: 'Age 50+', status: 'Upcoming', dueDate: 'Oct 2027' }
];

export const PreventiveCareTracker: React.FC = () => {
  const [selectedMember, setSelectedMember] = useState(MOCK_FAMILY_MEMBERS[0]);
  const [copiedAbha, setCopiedAbha] = useState(false);

  const abhaId = '91-8472-9102-4412';

  const copyAbhaToClipboard = () => {
    navigator.clipboard.writeText(abhaId);
    setCopiedAbha(true);
    setTimeout(() => setCopiedAbha(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* HEADER & DIGITAL ABHA CARD GENERATOR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Preventive Care Header (7 cols) */}
        <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-400 font-bold text-xs uppercase tracking-wider border border-teal-500/20">
              <Syringe className="w-3.5 h-3.5" /> Preventive Health Engine
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Preventive Care & <span className="text-teal-600 dark:text-teal-400">Vaccination Vault</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              Track adult and family immunization schedules, routine screening reminders, and ABHA digital health credentials.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-400 mr-1">Active Patient:</span>
            {MOCK_FAMILY_MEMBERS.map((mem) => {
              const isActive = selectedMember.id === mem.id;
              return (
                <button
                  key={mem.id}
                  onClick={() => setSelectedMember(mem)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {mem.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Digital ABHA Card (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-gradient-to-br from-teal-900 via-slate-950 to-slate-900 border border-teal-500/30 text-white space-y-4 shadow-lg relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-teal-500/30 pb-3">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-teal-400" />
              <span className="text-xs font-black tracking-widest uppercase text-teal-300">ABHA DIGITAL HEALTH CARD</span>
            </div>
            <span className="text-[10px] font-bold bg-teal-500/20 px-2 py-0.5 rounded text-teal-300 border border-teal-500/30">Verified</span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] text-teal-300 uppercase font-bold tracking-wider">Patient Name</span>
              <p className="text-base font-extrabold">{selectedMember.name}</p>
              
              <span className="text-[10px] text-teal-300 uppercase font-bold tracking-wider block pt-1">ABHA Number</span>
              <p className="text-sm font-mono font-bold tracking-wider text-teal-200">{abhaId}</p>
            </div>

            <div className="p-2 rounded-2xl bg-white text-slate-950 shrink-0 text-center space-y-1">
              <QrCode className="w-12 h-12 mx-auto" />
              <span className="text-[8px] font-bold uppercase block text-slate-500">Scan Card</span>
            </div>
          </div>

          <button
            onClick={copyAbhaToClipboard}
            className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow transition-colors flex items-center justify-center space-x-1.5"
          >
            {copiedAbha ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedAbha ? 'Copied ABHA Number!' : 'Copy ABHA Credentials'}</span>
          </button>
        </div>

      </div>

      {/* VACCINATION & IMMUNIZATION SCHEDULE TABLE */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Syringe className="w-5 h-5 text-teal-600 dark:text-teal-400" /> Immunization Schedule ({selectedMember.name})
          </h3>
          <span className="px-3 py-1 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-400 text-xs font-bold border border-teal-500/20">
            NTAGI / WHO Recommended
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 uppercase text-[10px] font-extrabold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3.5">Vaccine Name</th>
                <th className="p-3.5">Target Disease</th>
                <th className="p-3.5">Recommended Age</th>
                <th className="p-3.5">Target Date</th>
                <th className="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
              {IMMUNIZATION_SCHEDULE.map((vax) => (
                <tr key={vax.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/50">
                  <td className="p-3.5 font-bold text-slate-900 dark:text-white">{vax.name}</td>
                  <td className="p-3.5 text-slate-600 dark:text-slate-300">{vax.targetDisease}</td>
                  <td className="p-3.5 text-slate-500">{vax.recommendedAge}</td>
                  <td className="p-3.5 font-bold text-slate-900 dark:text-white">{vax.dueDate}</td>
                  <td className="p-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                      vax.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20' :
                      vax.status === 'Due Soon' ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20' :
                      'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}>
                      {vax.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
