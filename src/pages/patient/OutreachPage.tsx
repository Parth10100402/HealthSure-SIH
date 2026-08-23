// HealthSure — Specialist Outreach Weekly Schedule Page (Fully Localized)
// frontend/src/pages/patient/OutreachPage.tsx

import React, { useState, useEffect } from 'react';
import {
  Activity,
  Filter,
} from 'lucide-react';
import type { SpecialistOutreach } from '../../types/patient';
import { patientService } from '../../services/patientService';
import { useTranslation } from '../../lib/i18n/useTranslation';
import { OutreachCard, OutreachBookingModal } from '../../components/patient/OutreachCard';

interface DayScheduleTab {
  dayName: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  shortDay: string;
  dateStr: string;
  displayDate: string;
}

const WEEK_DAYS: DayScheduleTab[] = [
  { dayName: 'Monday', shortDay: 'Mon', dateStr: '2026-08-24', displayDate: '24 Aug' },
  { dayName: 'Tuesday', shortDay: 'Tue', dateStr: '2026-08-25', displayDate: '25 Aug' },
  { dayName: 'Wednesday', shortDay: 'Wed', dateStr: '2026-08-26', displayDate: '26 Aug' },
  { dayName: 'Thursday', shortDay: 'Thu', dateStr: '2026-08-27', displayDate: '27 Aug' },
  { dayName: 'Friday', shortDay: 'Fri', dateStr: '2026-08-28', displayDate: '28 Aug' },
  { dayName: 'Saturday', shortDay: 'Sat', dateStr: '2026-08-29', displayDate: '29 Aug' },
];

export const OutreachPage: React.FC = () => {
  const t = useTranslation();
  const [outreachEvents, setOutreachEvents] = useState<SpecialistOutreach[]>([]);
  const [selectedDay, setSelectedDay] = useState<DayScheduleTab>(WEEK_DAYS[0]);
  const [specialityFilter, setSpecialityFilter] = useState('all');
  const [selectedForBooking, setSelectedForBooking] = useState<SpecialistOutreach | null>(null);

  const loadData = async () => {
    const data = await patientService.getOutreachEvents();
    setOutreachEvents(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter events for the currently selected day
  const dayEvents = outreachEvents.filter((ev) => {
    const matchesDay = ev.dayOfWeek === selectedDay.dayName || ev.date === selectedDay.dateStr;
    const matchesSpec =
      specialityFilter === 'all' || ev.speciality.toLowerCase().includes(specialityFilter.toLowerCase());
    return matchesDay && matchesSpec;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-200">
      {/* ── HEADER ───────────────────────────────────────────────────────── */}
      <div className="space-y-1 border-b border-[#DDE8E4] dark:border-[#1A3A3A] pb-4">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EAF7F2] dark:bg-[#073B3A] text-[#087F6D] dark:text-[#4FD1C5] text-xs font-bold mb-1">
          <Activity className="w-3.5 h-3.5" />
          <span>{t.phcKhedVenue}</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#17324D] dark:text-[#E2EEF4]">
          {t.outreachPageTitle}
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#7B9EA8]">
          {t.outreachPageDesc}
        </p>
      </div>

      {/* ── WEEKDAY SELECTOR TABS ─────────────────────────────────────────── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#17324D] dark:text-[#E2EEF4] uppercase tracking-wider">
            {t.outreachNotice}
          </span>
          
          {/* Compact Speciality Filter */}
          <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
            <Filter className="w-3.5 h-3.5 text-[#087F6D]" />
            <select
              value={specialityFilter}
              onChange={(e) => setSpecialityFilter(e.target.value)}
              className="rounded-lg border border-[#DDE8E4] dark:border-[#1A3A3A] bg-white dark:bg-[#0A2020] text-xs font-semibold text-[#17324D] dark:text-[#E2EEF4] px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-[#087F6D]"
            >
              <option value="all">{t.filterSpeciality}</option>
              <option value="Cardiology">{t.cardiology}</option>
              <option value="Dermatology">{t.dermatology}</option>
              <option value="Orthopaedics">{t.orthopaedics}</option>
              <option value="General Medicine">{t.generalMedicine}</option>
              <option value="Ophthalmology">{t.ophthalmology}</option>
              <option value="Paediatrics">{t.pediatrics}</option>
            </select>
          </div>
        </div>

        {/* 6 Weekday Buttons */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {WEEK_DAYS.map((day) => {
            const isSelected = selectedDay.dayName === day.dayName;
            return (
              <button
                key={day.dayName}
                type="button"
                onClick={() => setSelectedDay(day)}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                  isSelected
                    ? 'border-[#087F6D] bg-[#087F6D] text-white shadow-xs'
                    : 'border-[#DDE8E4] dark:border-[#1A3A3A] bg-white dark:bg-[#0A2020] text-[#17324D] dark:text-[#E2EEF4] hover:border-[#087F6D]'
                }`}
              >
                <span className={`text-[11px] uppercase font-bold tracking-wider ${isSelected ? 'text-white' : 'text-[#64748B] dark:text-[#7B9EA8]'}`}>
                  {day.shortDay}
                </span>
                <span className="text-sm sm:text-base font-bold">
                  {day.displayDate}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── EVENTS LIST FOR SELECTED DAY ──────────────────────────────────── */}
      <div className="space-y-4">
        {dayEvents.length === 0 ? (
          <div className="rounded-2xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-white dark:bg-[#0A2020] p-8 text-center space-y-2">
            <p className="text-sm font-bold text-[#17324D] dark:text-[#E2EEF4]">
              {t.noData}
            </p>
            <p className="text-xs text-[#64748B] dark:text-[#7B9EA8]">
              {t.emptyDesc}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dayEvents.map((ev) => (
              <OutreachCard
                key={ev.id}
                outreach={ev}
                onBookingSuccess={() => {
                  loadData();
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {selectedForBooking && (
        <OutreachBookingModal
          outreach={selectedForBooking}
          isOpen={!!selectedForBooking}
          onClose={() => setSelectedForBooking(null)}
          onSuccess={() => {
            setSelectedForBooking(null);
            loadData();
          }}
        />
      )}
    </div>
  );
};
