// HealthSure — Appointments Management Page
// frontend/src/pages/patient/AppointmentsPage.tsx

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Plus,
  Filter,
} from 'lucide-react';
import type { Appointment } from '../../types/patient';
import { patientService } from '../../services/patientService';
import { useTranslation } from '../../lib/i18n/useTranslation';
import { AppointmentCard, AppointmentBookingModal } from '../../components/patient/AppointmentCard';
import { EmptyState } from '../../components/patient/EmptyState';

export const AppointmentsPage: React.FC = () => {
  const t = useTranslation();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'all'>('upcoming');
  const [specialityFilter, setSpecialityFilter] = useState('all');
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  const loadAppointments = async () => {
    const data = await patientService.getAppointments();
    setAppointments(data);
  };

  useEffect(() => {
    loadAppointments();
    const interval = setInterval(loadAppointments, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredAppointments = appointments.filter((apt) => {
    const isUpcoming = apt.status === 'confirmed' || apt.status === 'pending';
    const isPast = apt.status === 'completed' || apt.status === 'cancelled';

    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'upcoming' && isUpcoming) ||
      (activeTab === 'past' && isPast);

    const matchesSpeciality =
      specialityFilter === 'all' || apt.speciality.toLowerCase() === specialityFilter.toLowerCase();

    return matchesTab && matchesSpeciality;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header (No subline description) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DDE8E4] dark:border-[#1A3A3A] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#17324D] dark:text-[#E2EEF4]">
            {t.appointmentsPageTitle}
          </h1>
        </div>

        <button
          type="button"
          onClick={() => setBookingModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#087F6D] hover:bg-[#073B3A] text-white text-xs sm:text-sm font-bold px-4 py-2.5 transition-all shadow-xs shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t.bookNewAptBtn}</span>
        </button>
      </div>

      {/* Tabs & Filters bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Status Tabs */}
        <div className="flex rounded-xl border border-[#DDE8E4] dark:border-[#1A3A3A] p-1 bg-white dark:bg-[#0A2020] gap-1 self-start">
          <button
            type="button"
            onClick={() => setActiveTab('upcoming')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'upcoming'
                ? 'bg-[#087F6D] text-white shadow-xs'
                : 'text-[#64748B] dark:text-[#7B9EA8] hover:text-[#17324D]'
            }`}
          >
            {t.tabUpcoming} ({appointments.filter((a) => a.status === 'confirmed' || a.status === 'pending').length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('past')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'past'
                ? 'bg-[#087F6D] text-white shadow-xs'
                : 'text-[#64748B] dark:text-[#7B9EA8] hover:text-[#17324D]'
            }`}
          >
            {t.tabPast} ({appointments.filter((a) => a.status === 'completed' || a.status === 'cancelled').length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'all'
                ? 'bg-[#087F6D] text-white shadow-xs'
                : 'text-[#64748B] dark:text-[#7B9EA8] hover:text-[#17324D]'
            }`}
          >
            {t.tabAll} ({appointments.length})
          </button>
        </div>

        {/* Speciality Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[#64748B] dark:text-[#7B9EA8]" />
          <select
            value={specialityFilter}
            onChange={(e) => setSpecialityFilter(e.target.value)}
            className="rounded-xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-white dark:bg-[#0A2020] text-xs font-semibold text-[#17324D] dark:text-[#E2EEF4] px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#087F6D]"
          >
            <option value="all">{t.filterSpeciality}</option>
            <option value="Cardiology">{t.cardiology}</option>
            <option value="Orthopaedics">{t.orthopaedics}</option>
            <option value="Dermatology">{t.dermatology}</option>
            <option value="General Medicine">{t.generalMedicine}</option>
          </select>
        </div>
      </div>

      {/* Appointments List Grid */}
      {filteredAppointments.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title={activeTab === 'upcoming' ? t.emptyTitle : t.noData}
          description={
            activeTab === 'upcoming'
              ? t.emptyDesc
              : t.noData
          }
          actionLabel={t.bookNewAptBtn}
          onAction={() => setBookingModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAppointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              onCancelled={loadAppointments}
            />
          ))}
        </div>
      )}

      {/* Booking Modal */}
      <AppointmentBookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        onBooked={loadAppointments}
      />
    </div>
  );
};
