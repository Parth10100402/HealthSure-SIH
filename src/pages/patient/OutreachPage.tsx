// HealthSure — Specialist Outreach Weekly Schedule Page (8 Specialists Demo)
// frontend/src/pages/patient/OutreachPage.tsx

import React, { useState, useEffect } from 'react';
import { Filter, Users } from 'lucide-react';
import type { SpecialistOutreach } from '../../types/patient';
import { patientService } from '../../services/patientService';
import { useTranslation } from '../../lib/i18n/useTranslation';
import { OutreachCard } from '../../components/patient/OutreachCard';

interface DayScheduleTab {
  dayName: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  shortDay: string;
  dateStr: string;
  displayDate: string;
}

const WEEK_DAYS: DayScheduleTab[] = [
  { dayName: 'Friday', shortDay: 'Fri', dateStr: '2026-08-28', displayDate: '28 Aug' },
  { dayName: 'Saturday', shortDay: 'Sat', dateStr: '2026-08-29', displayDate: '29 Aug' },
  { dayName: 'Sunday' as any, shortDay: 'Sun', dateStr: '2026-08-30', displayDate: '30 Aug' },
  { dayName: 'Monday', shortDay: 'Mon', dateStr: '2026-08-31', displayDate: '31 Aug' },
  { dayName: 'Tuesday', shortDay: 'Tue', dateStr: '2026-09-01', displayDate: '01 Sep' },
  { dayName: 'Wednesday', shortDay: 'Wed', dateStr: '2026-09-02', displayDate: '02 Sep' },
];

export const OutreachPage: React.FC = () => {
  const t = useTranslation();
  const [outreachEvents, setOutreachEvents] = useState<SpecialistOutreach[]>([]);
  const [selectedDayFilter, setSelectedDayFilter] = useState<string>('all');
  const [specialityFilter, setSpecialityFilter] = useState('all');

  const loadData = async () => {
    const data = await patientService.getOutreachEvents();
    setOutreachEvents(data);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredEvents = outreachEvents.filter((ev) => {
    const matchesDay =
      selectedDayFilter === 'all' ||
      ev.date === selectedDayFilter ||
      ev.dayOfWeek?.toLowerCase() === selectedDayFilter.toLowerCase();
    const matchesSpec =
      specialityFilter === 'all' || ev.speciality.toLowerCase().includes(specialityFilter.toLowerCase());
    return matchesDay && matchesSpec;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div className="border-b border-[#DDE8E4] dark:border-[#1A3A3A] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#17324D] dark:text-[#E2EEF4]">
            {t.outreachPageTitle}
          </h1>
          <p className="text-xs text-[#64748B] dark:text-[#7B9EA8] mt-0.5">
            Specialist doctors visiting PHC Khed and affiliated outreach centers
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF7F2] dark:bg-[#073B3A]/40 text-[#087F6D] dark:text-[#4FD1C5] text-xs font-bold self-start">
          <Users className="w-3.5 h-3.5" />
          <span>{outreachEvents.length} Specialists Available</span>
        </div>
      </div>

      {/* Weekday & Specialty Filters */}
      <div className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs font-bold text-[#17324D] dark:text-[#E2EEF4] uppercase tracking-wider">
            {t.outreachNotice}
          </span>

          <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
            <Filter className="w-3.5 h-3.5 text-[#087F6D]" />
            <select
              value={specialityFilter}
              onChange={(e) => setSpecialityFilter(e.target.value)}
              className="rounded-xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-white dark:bg-[#0A2020] text-xs font-semibold text-[#17324D] dark:text-[#E2EEF4] px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#087F6D]"
            >
              <option value="all">All Specialties ({outreachEvents.length})</option>
              <option value="Cardiology">Cardiology</option>
              <option value="General Medicine">General Medicine</option>
              <option value="Gynecology">Gynecology</option>
              <option value="Pediatrics">Pediatrics</option>
              <option value="Dermatology">Dermatology</option>
              <option value="Orthopedics">Orthopedics</option>
              <option value="ENT">ENT</option>
              <option value="Neurology">Neurology</option>
            </select>
          </div>
        </div>

        {/* Date Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setSelectedDayFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              selectedDayFilter === 'all'
                ? 'bg-[#087F6D] text-white shadow-xs'
                : 'border border-[#DDE8E4] dark:border-[#1A3A3A] bg-white dark:bg-[#0A2020] text-[#17324D] dark:text-[#E2EEF4] hover:border-[#087F6D]'
            }`}
          >
            All Dates ({outreachEvents.length})
          </button>

          {WEEK_DAYS.map((day) => {
            const isSelected = selectedDayFilter === day.dateStr;
            const countForDay = outreachEvents.filter((e) => e.date === day.dateStr).length;
            return (
              <button
                key={day.dateStr}
                type="button"
                onClick={() => setSelectedDayFilter(day.dateStr)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#087F6D] text-white shadow-xs'
                    : 'border border-[#DDE8E4] dark:border-[#1A3A3A] bg-white dark:bg-[#0A2020] text-[#17324D] dark:text-[#E2EEF4] hover:border-[#087F6D]'
                }`}
              >
                <span>{day.shortDay}, {day.displayDate}</span>
                {countForDay > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/25 text-white' : 'bg-[#EAF7F2] text-[#087F6D]'}`}>
                    {countForDay}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Events Grid */}
      <div className="space-y-4">
        {filteredEvents.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#DDE8E4] dark:border-[#1A3A3A] bg-white dark:bg-[#0A2020] p-8 text-center space-y-2">
            <p className="text-sm font-bold text-[#17324D] dark:text-[#E2EEF4]">
              {t.noData}
            </p>
            <p className="text-xs text-[#64748B]">No specialist sessions found for the selected filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredEvents.map((ev) => (
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
    </div>
  );
};
