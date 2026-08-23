import React, { useState, useMemo } from 'react';
import { 
  Stethoscope, 
  Search, 
  Star, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  PhoneCall
} from 'lucide-react';
import type { Doctor } from '../types/health';
import { MOCK_DOCTORS } from '../data/mockData';

interface DoctorDiscoveryProps {
  onSelectDoctorToBook?: (doctor: Doctor) => void;
  recommendedSpecialty?: string;
}

export const DoctorDiscovery: React.FC<DoctorDiscoveryProps> = ({
  recommendedSpecialty
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState(recommendedSpecialty || 'All');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  const specialties = [
    'All',
    'Cardiology',
    'Neurology',
    'Orthopedics',
    'General Physician',
    'Gastroenterology',
    'Ophthalmology',
    'Gynecology'
  ];

  const filteredDoctors = useMemo(() => {
    return MOCK_DOCTORS.filter((doc) => {
      const matchesQuery = 
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.hospitalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.specialty.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSpecialty = 
        selectedSpecialty === 'All' || 
        doc.specialty.toLowerCase().includes(selectedSpecialty.toLowerCase());

      return matchesQuery && matchesSpecialty;
    });
  }, [searchQuery, selectedSpecialty]);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* HEADER & SEARCH FILTERS */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex items-center space-x-3 text-teal-600 dark:text-teal-400">
          <Stethoscope className="w-8 h-8" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Find Doctors</h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
          <div className="sm:col-span-8 relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by doctor name, specialty, or hospital..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>

          <div className="sm:col-span-4">
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="w-full py-3 px-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-bold outline-none focus:ring-2 focus:ring-teal-500"
            >
              {specialties.map((s) => (
                <option key={s} value={s}>Specialty: {s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* DOCTORS CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDoctors.map((doc) => (
          <div
            key={doc.id}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <img
                  src={doc.avatar}
                  alt={doc.name}
                  className="w-14 h-14 rounded-2xl object-cover shrink-0 border border-slate-200 dark:border-slate-800"
                />
                <div className="space-y-1">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white line-clamp-1">{doc.name}</h3>
                  <p className="text-xs font-extrabold text-teal-600 dark:text-teal-400">{doc.specialty}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="line-clamp-1">{doc.hospitalName}</span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center text-[10px] font-bold">
                <div>
                  <span className="text-slate-400 block uppercase">Exp</span>
                  <span className="text-slate-900 dark:text-white">{doc.experienceYears} Yrs</span>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase">Rating</span>
                  <span className="text-amber-500 flex items-center justify-center gap-0.5">
                    <Star className="w-3 h-3 fill-amber-500" /> {doc.patientRating}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase">Fee</span>
                  <span className="text-teal-600 dark:text-teal-400">₹{doc.consultationFee}</span>
                </div>
              </div>
            </div>

            {/* ACTIONS: CALL DOCTOR & BOOK SLOT */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <a
                href="tel:+911126588500"
                className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors flex items-center justify-center space-x-1.5"
              >
                <PhoneCall className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>Call Doctor Clinic</span>
              </a>

              <button
                onClick={() => setSelectedDoctor(doc)}
                className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm shadow-teal-600/20 transition-colors flex items-center justify-center space-x-1.5"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Book Consultation</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* APPOINTMENT MODAL */}
      {selectedDoctor && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-6">
            {!bookingConfirmed ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <img src={selectedDoctor.avatar} alt={selectedDoctor.name} className="w-12 h-12 rounded-xl object-cover" />
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">{selectedDoctor.name}</h3>
                    <p className="text-xs text-teal-600 dark:text-teal-400 font-bold">{selectedDoctor.specialty} • ₹{selectedDoctor.consultationFee}</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                  <p className="font-bold text-slate-800 dark:text-slate-200">Available Slots Today:</p>
                  <div className="flex flex-wrap gap-2">
                    {['10:30 AM', '02:00 PM', '05:30 PM'].map((slot) => (
                      <span key={slot} className="px-3 py-1.5 rounded-xl bg-teal-600 text-white font-bold text-xs cursor-pointer">
                        {slot}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button onClick={() => setSelectedDoctor(null)} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold">
                    Cancel
                  </button>
                  <button onClick={() => setBookingConfirmed(true)} className="px-5 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold">
                    Confirm Booking
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 space-y-4">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Consultation Scheduled!</h3>
                <p className="text-xs text-slate-500">Your appointment token with {selectedDoctor.name} is confirmed.</p>
                <button onClick={() => { setSelectedDoctor(null); setBookingConfirmed(false); }} className="px-6 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs">
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
