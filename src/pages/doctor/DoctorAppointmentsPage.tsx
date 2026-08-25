// HealthSure — Doctor Appointments & Patient Queue Page (Fully Localized)
// frontend/src/pages/doctor/DoctorAppointmentsPage.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Video,
  Stethoscope,
  Search,
} from 'lucide-react';
import type { DoctorAppointmentSummary } from '../../types/doctor';
import { doctorService } from '../../services/doctorService';
import { useTranslation } from '../../lib/i18n/useTranslation';
import { ConsultationModal } from '../../components/doctor/ConsultationModal';

export const DoctorAppointmentsPage: React.FC = () => {
  const t = useTranslation();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<DoctorAppointmentSummary[]>([]);
  const [activeTab, setActiveTab] = useState<'today' | 'upcoming' | 'completed'>('today');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApt, setSelectedApt] = useState<DoctorAppointmentSummary | null>(null);

  const loadData = async () => {
    const data = await doctorService.getAppointments();
    setAppointments(data);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const filtered = appointments.filter((apt) => {
    const matchesTab =
      activeTab === 'today'
        ? apt.status === 'confirmed' || apt.status === 'waiting'
        : activeTab === 'completed'
        ? apt.status === 'completed'
        : true;

    const matchesSearch =
      apt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.tokenNumber.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DDE8E4] dark:border-[#1A3A3A] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#17324D] dark:text-[#E2EEF4]">
            {t.navTodayPatients}
          </h1>
        </div>
      </div>

      {/* Tabs and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Status Tabs */}
        <div className="flex rounded-xl border border-[#DDE8E4] dark:border-[#1A3A3A] p-1 bg-white dark:bg-[#0A2020] gap-1 self-start">
          <button
            type="button"
            onClick={() => setActiveTab('today')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'today'
                ? 'bg-[#087F6D] text-white shadow-xs'
                : 'text-[#64748B] dark:text-[#7B9EA8]'
            }`}
          >
            {t.todaysAppointments} ({appointments.filter((a) => a.status === 'confirmed' || a.status === 'waiting').length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('completed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'completed'
                ? 'bg-[#087F6D] text-white shadow-xs'
                : 'text-[#64748B] dark:text-[#7B9EA8]'
            }`}
          >
            {t.completed} ({appointments.filter((a) => a.status === 'completed').length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('upcoming')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'upcoming'
                ? 'bg-[#087F6D] text-white shadow-xs'
                : 'text-[#64748B] dark:text-[#7B9EA8]'
            }`}
          >
            {t.tabAll} ({appointments.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#64748B] dark:text-[#7B9EA8] absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-white dark:bg-[#0A2020] text-xs font-medium text-[#17324D] dark:text-[#E2EEF4] focus:outline-none focus:ring-2 focus:ring-[#087F6D]"
          />
        </div>
      </div>

      {/* Queue Table */}
      <div className="rounded-2xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-white dark:bg-[#0A2020] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5F9F7] dark:bg-[#0F2929] border-b border-[#DDE8E4] dark:border-[#1A3A3A] text-[#64748B] dark:text-[#7B9EA8]">
              <tr>
                <th className="p-3 font-bold">{t.token}</th>
                <th className="p-3 font-bold">{t.fullName}</th>
                <th className="p-3 font-bold">{t.age} / {t.gender}</th>
                <th className="p-3 font-bold">{t.registeredPHC}</th>
                <th className="p-3 font-bold">{t.consultModeLabel}</th>
                <th className="p-3 font-bold">{t.reasonSymptomsLabel}</th>
                <th className="p-3 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDE8E4] dark:divide-[#1A3A3A]">
              {filtered.map((apt) => (
                <tr key={apt.id} className="hover:bg-[#F5F9F7]/60 dark:hover:bg-[#0F2929]/50 transition-colors">
                  <td className="p-3 font-mono font-bold text-[#087F6D] dark:text-[#4FD1C5]">
                    {apt.tokenNumber}
                  </td>
                  <td className="p-3">
                    <div className="font-bold text-[#17324D] dark:text-[#E2EEF4]">{apt.patientName}</div>
                    <div className="text-[10px] text-[#64748B] dark:text-[#7B9EA8]">{t.idLabel}: {apt.patientId}</div>
                  </td>
                  <td className="p-3 text-[#64748B] dark:text-[#7B9EA8]">
                    {apt.patientAge}y / {apt.patientGender}
                  </td>
                  <td className="p-3 text-[#17324D] dark:text-[#D1E8E2]">
                    {apt.referringPHC}
                  </td>
                  <td className="p-3">
                    {apt.mode === 'teleconsultation' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold">
                        <Video className="w-3 h-3" /> {t.navTeleconsult}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                        <Stethoscope className="w-3 h-3" /> {t.inPersonMode}
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-[#64748B] dark:text-[#7B9EA8] max-w-xs truncate">
                    {apt.reasonForVisit}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        if (apt.mode === 'teleconsultation') {
                          const sessionId = (apt as any).teleconsultId || apt.id || 'tele-001';
                          navigate(`/doctor/teleconsultation?id=${encodeURIComponent(sessionId)}`);
                        } else {
                          setSelectedApt(apt);
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#087F6D] hover:bg-[#073B3A] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      {apt.mode === 'teleconsultation' ? t.joinVideo : t.startConsultation}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Consultation Modal */}
      {selectedApt && (
        <ConsultationModal
          appointment={selectedApt}
          isOpen={!!selectedApt}
          onClose={() => setSelectedApt(null)}
          onConsultationCompleted={() => {
            setSelectedApt(null);
            loadData();
          }}
        />
      )}
    </div>
  );
};
