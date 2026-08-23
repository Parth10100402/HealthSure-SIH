import React from 'react';
import { 
  AlertTriangle, 
  Phone, 
  MapPin, 
  Heart, 
  ShieldAlert, 
  Share2, 
  X,
  Navigation
} from 'lucide-react';
import { MOCK_HOSPITALS } from '../data/mockData';
import type { FamilyMember } from '../types/health';

interface EmergencySOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeMember: FamilyMember;
}

export const EmergencySOSModal: React.FC<EmergencySOSModalProps> = ({
  isOpen,
  onClose,
  activeMember
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-red-950/80 backdrop-blur-xl animate-in fade-in">
      <div className="max-w-3xl w-full rounded-3xl bg-slate-900 border-2 border-red-500/80 text-white p-6 sm:p-8 space-y-6 max-h-[95vh] overflow-y-auto relative shadow-2xl shadow-red-500/30">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 hover:text-white font-bold"
        >
          <X className="w-5 h-5" />
        </button>

        {/* SOS Header Banner */}
        <div className="flex items-center space-x-4 bg-red-600/30 p-4 rounded-2xl border border-red-500/50 animate-pulse">
          <div className="w-14 h-14 rounded-2xl bg-red-600 flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-red-500/50">
            <AlertTriangle className="w-8 h-8 fill-white" />
          </div>
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-red-400">
              EMERGENCY MEDICAL SOS ACTIVATED
            </span>
            <h3 className="text-2xl font-black text-white">
              Dispatching Assistance & ER Routes
            </h3>
          </div>
        </div>

        {/* User Critical Health Data Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs font-semibold">
          <div>
            <span className="text-slate-400 block">Patient Name</span>
            <span className="text-white font-bold text-sm">{activeMember.name}</span>
          </div>
          <div>
            <span className="text-slate-400 block">Blood Group</span>
            <span className="text-red-400 font-black text-base">{activeMember.bloodGroup}</span>
          </div>
          <div>
            <span className="text-slate-400 block">Known Allergies</span>
            <span className="text-amber-300 font-bold">{activeMember.allergies.join(', ')}</span>
          </div>
          <div>
            <span className="text-slate-400 block">Current Location</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> Sector 1, Vaishali (GPS Lock)
            </span>
          </div>
        </div>

        {/* One-Touch Speed Dials */}
        <div className="space-y-3">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-red-400">
            1-Touch Emergency Speed Dials
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <a
              href="tel:102"
              className="p-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-center space-y-1 block shadow-lg shadow-red-600/30"
            >
              <div className="flex justify-center mb-1"><Phone className="w-6 h-6" /></div>
              <div className="text-lg">102</div>
              <div className="text-[11px] font-medium opacity-90">National Ambulance</div>
            </a>

            <a
              href="tel:112"
              className="p-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-center space-y-1 block shadow-lg shadow-red-600/30"
            >
              <div className="flex justify-center mb-1"><ShieldAlert className="w-6 h-6" /></div>
              <div className="text-lg">112</div>
              <div className="text-[11px] font-medium opacity-90">National Emergency</div>
            </a>

            <a
              href="tel:+919876543210"
              className="p-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-black text-center space-y-1 block border border-slate-700"
            >
              <div className="flex justify-center mb-1"><Heart className="w-6 h-6 text-red-400" /></div>
              <div className="text-sm truncate">Primary Family Contact</div>
              <div className="text-[11px] font-medium text-slate-400">+91 98765 43210</div>
            </a>
          </div>
        </div>

        {/* Nearest 24/7 ER Hospitals List */}
        <div className="space-y-3">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            Nearest 24/7 Emergency ER Hospitals
          </h4>

          <div className="space-y-2">
            {MOCK_HOSPITALS.filter(h => h.emergency24x7).map((hosp) => (
              <div
                key={hosp.id}
                className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700 flex items-center justify-between gap-4"
              >
                <div>
                  <h5 className="text-sm font-black text-white">{hosp.name}</h5>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-400" /> {hosp.location} • <strong className="text-emerald-400">{hosp.distanceKm} km</strong>
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <a
                    href={`tel:${hosp.phone}`}
                    className="px-3.5 py-2 rounded-xl bg-red-600 text-white font-bold text-xs flex items-center space-x-1"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call ER</span>
                  </a>

                  <button
                    onClick={() => alert(`Launching GPS turn-by-turn navigation to ${hosp.name}`)}
                    className="p-2 rounded-xl bg-slate-700 text-slate-200"
                    title="Get Directions"
                  >
                    <Navigation className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Location Sharing Widget */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium">
            GPS Location Beacon is active and broadcasting to emergency contacts.
          </span>
          <button
            onClick={() => alert("Emergency Live GPS Link copied to clipboard!")}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center space-x-1.5"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share GPS Link</span>
          </button>
        </div>

      </div>
    </div>
  );
};
