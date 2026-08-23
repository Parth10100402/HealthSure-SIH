import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  MapPin, 
  PhoneCall, 
  Star, 
  Clock, 
  Navigation, 
  Search, 
  X,
  Calendar,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import type { Hospital } from '../types/health';
import { MOCK_HOSPITALS, MOCK_DOCTORS } from '../data/mockData';
import { getUserLocation, calculateDistanceKm, getGoogleMapsDirectionsUrl } from '../services/locationService';

interface HospitalHubProps {
  onNavigateCost?: () => void;
  onNavigateDoctors?: (specialty?: string) => void;
}

export const HospitalHub: React.FC<HospitalHubProps> = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState('');

  // Modal States
  const [selectedHospitalForDetails, setSelectedHospitalForDetails] = useState<Hospital | null>(null);
  const [selectedHospitalForBooking, setSelectedHospitalForBooking] = useState<Hospital | null>(null);

  // Appointment Form States
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('10:30 AM');
  const [patientName, setPatientName] = useState<string>('Parth Sharma');
  const [isBookedSuccess, setIsBookedSuccess] = useState<boolean>(false);

  // Cities List
  const citiesList = useMemo(() => {
    const set = new Set(MOCK_HOSPITALS.map(h => h.city));
    return ['All', ...Array.from(set)];
  }, []);

  const handleUseMyLocation = async () => {
    setIsLocating(true);
    setLocationError('');
    try {
      const coords = await getUserLocation();
      setUserCoords(coords);
    } catch (err: any) {
      setLocationError(err?.message || 'Unable to fetch location permission.');
    } finally {
      setIsLocating(false);
    }
  };

  // Filter & Distance Calculation
  const filteredHospitals = useMemo(() => {
    return MOCK_HOSPITALS.map((hosp) => {
      let computedDist = hosp.distanceKm;
      if (userCoords && hosp.latitude && hosp.longitude) {
        computedDist = calculateDistanceKm(userCoords.latitude, userCoords.longitude, hosp.latitude, hosp.longitude);
      }
      return { ...hosp, distanceKm: computedDist };
    }).filter((hosp) => {
      const matchesSearch = hosp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            hosp.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            hosp.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCity = selectedCity === 'All' || hosp.city === selectedCity;
      const matchesType = selectedType === 'All' || hosp.hospitalType === selectedType;
      return matchesSearch && matchesCity && matchesType;
    }).sort((a, b) => a.distanceKm - b.distanceKm);
  }, [searchTerm, selectedCity, selectedType, userCoords]);

  const handleOpenBookingModal = (hosp: Hospital) => {
    setSelectedHospitalForBooking(hosp);
    setIsBookedSuccess(false);
    const doctorAtHosp = MOCK_DOCTORS.find(d => d.hospitalName.toLowerCase().includes(hosp.name.toLowerCase()));
    if (doctorAtHosp) setSelectedDoctorId(doctorAtHosp.id);
  };

  const handleConfirmAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsBookedSuccess(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* 1. HEADER & SEARCH BAR */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-400 font-bold text-xs uppercase tracking-wider mb-2 border border-teal-500/20">
              <Building2 className="w-3.5 h-3.5" /> Find Care • Hospital Directory
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Discover & Book <span className="text-teal-600 dark:text-teal-400">Hospitals</span>
            </h1>
          </div>

          <button
            onClick={handleUseMyLocation}
            disabled={isLocating}
            className="px-5 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 flex items-center space-x-2 transition-all shrink-0"
          >
            <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Locating...' : 'Use My Location'}</span>
          </button>
        </div>

        {locationError && (
          <div className="p-3 rounded-xl bg-rose-500/10 text-rose-600 text-xs font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> {locationError}
          </div>
        )}

        {/* SEARCH & FILTER CONTROLS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by hospital name, city, specialty..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>

          <div>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-bold outline-none"
            >
              {citiesList.map((c) => (
                <option key={c} value={c}>{c === 'All' ? 'All Cities' : `City: ${c}`}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-bold outline-none"
            >
              <option value="All">All Hospital Types</option>
              <option value="Super Speciality">Super Speciality</option>
              <option value="Government">Government</option>
              <option value="Private Multi-Speciality">Private Multi-Speciality</option>
            </select>
          </div>

        </div>
      </div>

      {/* 2. HOSPITAL CARDS GRID (WITH COVER PHOTO & 2 ACTION BUTTONS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHospitals.map((hosp) => (
          <div
            key={hosp.id}
            className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow group"
          >
            {/* HOSPITAL COVER PHOTO */}
            <div className="relative h-48 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <img
                src={hosp.image}
                alt={hosp.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-xs text-amber-400 font-black text-xs flex items-center space-x-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{hosp.rating} ({hosp.reviewCount.toLocaleString()})</span>
              </div>

              {hosp.emergency24x7 && (
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-rose-600 text-white font-extrabold text-[10px] uppercase tracking-wider shadow">
                  24/7 ICU & Emergency
                </div>
              )}
            </div>

            {/* CARD CONTENT BODY */}
            <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug">{hosp.name}</h3>
                  <span className="text-xs font-bold text-teal-600 dark:text-teal-400 shrink-0">~{hosp.distanceKm.toFixed(1)} km</span>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-teal-500 shrink-0" /> {hosp.location}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {hosp.specialties.slice(0, 3).map((spec, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold">
                      {spec}
                    </span>
                  ))}
                  {hosp.specialties.length > 3 && (
                    <span className="text-[10px] text-slate-400 font-bold self-center">+{hosp.specialties.length - 3} more</span>
                  )}
                </div>
              </div>

              {/* ACTION BUTTONS: VIEW DETAILS & BOOK APPOINTMENT */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSelectedHospitalForDetails(hosp)}
                  className="py-2.5 px-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors text-center"
                >
                  View Details
                </button>

                <button
                  onClick={() => handleOpenBookingModal(hosp)}
                  className="py-2.5 px-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow shadow-teal-600/20 transition-colors text-center"
                >
                  Book Appointment
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 3. COMPREHENSIVE HOSPITAL DETAILS MODAL */}
      {selectedHospitalForDetails && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-2xl w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden relative space-y-6 my-8">
            
            {/* MODAL BANNER IMAGE & CLOSE BUTTON */}
            <div className="relative h-64 w-full bg-slate-100 dark:bg-slate-800">
              <img src={selectedHospitalForDetails.image} alt={selectedHospitalForDetails.name} className="w-full h-full object-cover" />
              <button
                onClick={() => setSelectedHospitalForDetails(null)}
                className="absolute top-4 right-4 p-2.5 rounded-full bg-slate-950/80 text-white hover:bg-slate-950 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-4 left-4 right-4 bg-slate-950/80 backdrop-blur-xs p-4 rounded-2xl text-white space-y-1">
                <h3 className="text-xl font-extrabold">{selectedHospitalForDetails.name}</h3>
                <p className="text-xs text-slate-300 font-medium">{selectedHospitalForDetails.address}</p>
              </div>
            </div>

            {/* DETAILS BODY CONTENT */}
            <div className="p-6 space-y-6 text-xs">
              
              {/* CONTACT, MAPS & RATINGS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <a
                  href={`tel:${selectedHospitalForDetails.phone}`}
                  className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-700 dark:text-teal-400 font-bold flex items-center space-x-3 hover:bg-teal-500/20 transition-colors"
                >
                  <PhoneCall className="w-5 h-5" />
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-normal">Direct Hospital Line</span>
                    <span>{selectedHospitalForDetails.phone}</span>
                  </div>
                </a>

                <a
                  href={getGoogleMapsDirectionsUrl(selectedHospitalForDetails.name, selectedHospitalForDetails.address, selectedHospitalForDetails.latitude, selectedHospitalForDetails.longitude)}
                  target="_blank"
                  rel="noreferrer"
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-bold flex items-center space-x-3 hover:border-teal-500 transition-colors"
                >
                  <Navigation className="w-5 h-5 text-teal-600" />
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-normal">Google Maps</span>
                    <span>Get Directions →</span>
                  </div>
                </a>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-bold flex items-center space-x-3">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-normal">Patient Rating</span>
                    <span>{selectedHospitalForDetails.rating} ★ ({selectedHospitalForDetails.reviewCount.toLocaleString()} reviews)</span>
                  </div>
                </div>
              </div>

              {/* INSURANCES ACCEPTED */}
              <div className="space-y-2">
                <span className="font-extrabold text-slate-900 dark:text-white uppercase block text-[11px]">Insurances & Cashless TPA Accepted</span>
                <div className="flex flex-wrap gap-2">
                  {selectedHospitalForDetails.insuranceAccepted.map((ins, i) => (
                    <span key={i} className="px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-500/20">
                      ✓ {ins}
                    </span>
                  ))}
                </div>
              </div>

              {/* SPECIALISTS & DEPARTMENTS */}
              <div className="space-y-2">
                <span className="font-extrabold text-slate-900 dark:text-white uppercase block text-[11px]">Available Specialists & Clinical Departments</span>
                <div className="flex flex-wrap gap-2">
                  {selectedHospitalForDetails.departments.map((dept, i) => (
                    <span key={i} className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                      {dept}
                    </span>
                  ))}
                </div>
              </div>

              {/* BEST RESERVED FOR */}
              <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/30 space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-teal-600 dark:text-teal-400 block">Key Clinical Strengths & Reserved Specialty</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  Best reserved for {selectedHospitalForDetails.popularDiseases.join(', ')} with 24/7 ICU trauma care support.
                </p>
              </div>

              {/* ACTIONS */}
              <div className="flex items-center justify-end space-x-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setSelectedHospitalForDetails(null)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const hosp = selectedHospitalForDetails;
                    setSelectedHospitalForDetails(null);
                    handleOpenBookingModal(hosp);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-teal-600 text-white font-bold shadow-md shadow-teal-600/20"
                >
                  Book Appointment Now
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* 4. DOCTOR APPOINTMENT BOOKING MODAL (WITH OPD EXPECTED WAITING TIME) */}
      {selectedHospitalForBooking && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-6 relative">
            <button
              onClick={() => setSelectedHospitalForBooking(null)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-teal-600 dark:text-teal-400" /> Hospital Doctor Appointment
              </h3>
              <p className="text-xs text-slate-500 font-medium">Book consultation at {selectedHospitalForBooking.name}.</p>
            </div>

            {isBookedSuccess ? (
              <div className="p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-4">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
                <div className="space-y-1">
                  <h4 className="text-lg font-extrabold text-slate-900 dark:text-white">Appointment Confirmed!</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                    Confirmed for {patientName} at {selectedHospitalForBooking.name} on {selectedDate} ({selectedTimeSlot}).
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 text-xs font-bold text-teal-600 dark:text-teal-400 border border-emerald-500/20">
                  ⏱ Expected OPD Queue Wait Time: 15–20 minutes
                </div>
                <button
                  onClick={() => setSelectedHospitalForBooking(null)}
                  className="w-full py-3 rounded-2xl bg-teal-600 text-white font-bold text-xs shadow-md shadow-teal-600/20"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleConfirmAppointment} className="space-y-4 text-xs font-bold">
                <div>
                  <label className="text-slate-400 block mb-1">Patient Name</label>
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Select Attending Doctor / Specialist</label>
                  <select
                    value={selectedDoctorId}
                    onChange={(e) => setSelectedDoctorId(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none"
                  >
                    {MOCK_DOCTORS.map((doc) => (
                      <option key={doc.id} value={doc.id}>{doc.name} — {doc.specialty} (₹{doc.consultationFee})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1">Date</label>
                    <input
                      type="date"
                      required
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Time Slot</label>
                    <select
                      value={selectedTimeSlot}
                      onChange={(e) => setSelectedTimeSlot(e.target.value)}
                      className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none"
                    >
                      <option value="10:00 AM">10:00 AM</option>
                      <option value="11:30 AM">11:30 AM</option>
                      <option value="02:00 PM">02:00 PM</option>
                      <option value="04:30 PM">04:30 PM</option>
                    </select>
                  </div>
                </div>

                {/* EXPECTED WAITING TIME DISPLAY */}
                <div className="p-3.5 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Estimated OPD Queue Wait Time: <strong>15–20 minutes</strong></span>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 transition-all"
                >
                  Confirm Hospital Appointment
                </button>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
