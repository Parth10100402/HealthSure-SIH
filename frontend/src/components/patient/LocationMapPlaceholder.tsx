// HealthSure — Location Map Placeholder Component
// frontend/src/components/patient/LocationMapPlaceholder.tsx

import React from 'react';
import { MapPin, Navigation, Phone } from 'lucide-react';

interface LocationMapPlaceholderProps {
  facilityName: string;
  facilityType: string;
  villageOrTown: string;
  distanceKm?: number;
  contactNumber?: string;
  timing?: string;
  className?: string;
}

export const LocationMapPlaceholder: React.FC<LocationMapPlaceholderProps> = ({
  facilityName,
  facilityType,
  villageOrTown,
  distanceKm = 4.2,
  contactNumber = '+91 2356 261234',
  timing = 'OPD: Mon - Sat (08:00 AM - 02:00 PM)',
  className = '',
}) => {
  return (
    <div
      className={`rounded-xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-white dark:bg-[#0A2020] overflow-hidden shadow-xs ${className}`}
    >
      {/* Map visual placeholder */}
      <div className="relative h-36 sm:h-44 w-full bg-[#EAF7F2] dark:bg-[#073B3A]/60 flex items-center justify-center overflow-hidden border-b border-[#DDE8E4] dark:border-[#1A3A3A]">
        {/* Subtle grid pattern to resemble a map */}
        <div
          className="absolute inset-0 opacity-20 dark:opacity-10"
          style={{
            backgroundImage: `radial-gradient(#087F6D 1.5px, transparent 1.5px)`,
            backgroundSize: '16px 16px',
          }}
        />

        {/* Road vector lines mock */}
        <svg className="absolute inset-0 w-full h-full stroke-[#087F6D]/30 dark:stroke-[#4FD1C5]/20" fill="none">
          <path d="M-20 60 Q 150 40, 300 80 T 600 100" strokeWidth="4" strokeDasharray="6 6" />
          <path d="M80 0 Q 120 90, 260 140" strokeWidth="3" />
          <path d="M260 140 Q 380 120, 500 180" strokeWidth="3" />
        </svg>

        {/* Pin marker */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-[#087F6D] text-white flex items-center justify-center shadow-lg ring-4 ring-white/60 dark:ring-[#073B3A]/80 animate-bounce">
            <MapPin className="w-5 h-5" aria-hidden="true" />
          </div>
          <span className="mt-1 bg-white/90 dark:bg-[#0F2929]/90 backdrop-blur-xs text-[#073B3A] dark:text-[#E2EEF4] text-[11px] font-bold px-2 py-0.5 rounded-md shadow-xs border border-[#DDE8E4] dark:border-[#1A3A3A]">
            {facilityName}
          </span>
        </div>

        {/* API preparation watermark */}
        <div className="absolute top-2 right-2 bg-white/85 dark:bg-[#073B3A]/85 backdrop-blur-xs text-[10px] font-medium text-[#64748B] dark:text-[#A7D9CE] px-2 py-0.5 rounded border border-[#DDE8E4]/60 dark:border-[#087F6D]/30">
          Google Maps Ready
        </div>
      </div>

      {/* Facility info footer */}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#087F6D] dark:text-[#4FD1C5]">
                {facilityType}
              </span>
              <span className="text-xs text-[#64748B] dark:text-[#7B9EA8]">• Approx. {distanceKm} km away</span>
            </div>
            <h4 className="text-sm font-bold text-[#17324D] dark:text-[#E2EEF4]">{facilityName}</h4>
            <p className="text-xs text-[#64748B] dark:text-[#7B9EA8] mt-0.5">{villageOrTown}, Ratnagiri District</p>
          </div>
        </div>

        <div className="text-xs text-[#64748B] dark:text-[#7B9EA8] flex items-center gap-1.5 pt-1 border-t border-[#DDE8E4] dark:border-[#1A3A3A]">
          <span>{timing}</span>
        </div>

        <div className="flex items-center gap-2 pt-1">
          {contactNumber && (
            <a
              href={`tel:${contactNumber}`}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#DDE8E4] dark:border-[#1A3A3A] bg-[#F5F9F7] dark:bg-[#0F2929] hover:bg-[#EAF7F2] text-[#17324D] dark:text-[#D1E8E2] text-xs font-semibold py-2 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-[#087F6D]" />
              Call Facility
            </a>
          )}
          <button
            type="button"
            onClick={() => alert(`Directions to ${facilityName}: Route mapping will be enabled with Google Maps integration in Phase 4.`)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#087F6D] hover:bg-[#073B3A] text-white text-xs font-semibold py-2 transition-colors shadow-xs"
          >
            <Navigation className="w-3.5 h-3.5" />
            Get Directions
          </button>
        </div>
      </div>
    </div>
  );
};
