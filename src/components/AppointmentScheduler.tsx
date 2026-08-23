import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Video, 
  CheckCircle2, 
  Sparkles, 
  Ticket, 
  Building2, 
  ShieldCheck,
  Download
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { Doctor } from '../types/health';
import { MOCK_DOCTORS } from '../data/mockData';

interface AppointmentSchedulerProps {
  preselectedDoctor?: Doctor | null;
  onAppointmentBooked?: (appointment: any) => void;
}

export const AppointmentScheduler: React.FC<AppointmentSchedulerProps> = ({
  preselectedDoctor,
  onAppointmentBooked
}) => {
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor>(
    preselectedDoctor || MOCK_DOCTORS[0]
  );

  const [consultationType, setConsultationType] = useState<'In-Person' | 'Video'>('In-Person');
  const [selectedDate, setSelectedDate] = useState<string>('2026-08-08');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('10:15 AM');
  const [patientName, setPatientName] = useState<string>('Parth Sharma');
  const [patientPhone, setPatientPhone] = useState<string>('+91 98765 43210');
  const [bookingConfirmed, setBookingConfirmed] = useState<boolean>(false);
  const [bookingPass, setBookingPass] = useState<any>(null);

  // Time Slots Split
  const morningSlots = ['09:00 AM', '09:30 AM', '10:15 AM', '11:00 AM', '11:45 AM'];
  const afternoonSlots = ['02:00 PM', '02:30 PM', '03:15 PM', '04:00 PM'];

  // Dynamic Token & Wait Time Predictor Logic based on Doctor & Time Slot
  const dynamicPreview = useMemo(() => {
    let baseToken = 10;
    if (selectedTimeSlot.includes('09:00')) baseToken = 3;
    else if (selectedTimeSlot.includes('09:30')) baseToken = 6;
    else if (selectedTimeSlot.includes('10:15')) baseToken = 12;
    else if (selectedTimeSlot.includes('11:00')) baseToken = 18;
    else if (selectedTimeSlot.includes('11:45')) baseToken = 22;
    else if (selectedTimeSlot.includes('02:00')) baseToken = 27;
    else if (selectedTimeSlot.includes('02:30')) baseToken = 31;
    else if (selectedTimeSlot.includes('03:15')) baseToken = 36;
    else if (selectedTimeSlot.includes('04:00')) baseToken = 42;

    // Doctor queue modifier
    const docFactor = (selectedDoctor.experienceYears % 5) + 2;
    const computedWaitMins = Math.max(8, Math.round(baseToken * 2.2 + docFactor));

    return {
      tokenNumber: baseToken,
      estimatedWaitMins: computedWaitMins
    };
  }, [selectedTimeSlot, selectedDoctor]);

  // Real PDF / Printable Document File Downloader
  const handleDownloadPass = () => {
    if (!bookingPass) return;

    const htmlDocContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>HealthSure_Appointment_Pass_${bookingPass.tokenNumber}</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0b0f19; color: #ffffff; padding: 40px; }
    .card { background: #151d30; border: 2px solid #2563eb; border-radius: 20px; padding: 30px; max-width: 600px; margin: 0 auto; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
    .header { text-align: center; border-b: 1px solid #334155; padding-bottom: 20px; margin-bottom: 20px; }
    .title { color: #3b82f6; font-size: 24px; font-weight: bold; margin: 0; }
    .subtitle { color: #10b981; font-size: 14px; font-weight: bold; margin-top: 5px; }
    .token-box { background: #1e293b; border-radius: 12px; padding: 15px; text-align: center; margin: 20px 0; border: 1px solid #3b82f6; }
    .token-num { font-size: 42px; font-weight: 900; color: #3b82f6; }
    .wait-time { font-size: 16px; font-weight: bold; color: #10b981; margin-top: 5px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 14px; }
    .label { color: #94a3b8; font-size: 11px; text-transform: uppercase; font-weight: bold; }
    .val { color: #ffffff; font-weight: bold; margin-top: 2px; }
    .footer { border-top: 1px solid #334155; padding-top: 15px; margin-top: 20px; text-align: center; font-size: 12px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="title">HealthSure 2.0</div>
      <div class="subtitle">Official Digital Hospital Appointment Pass</div>
      <p style="font-size:12px; color:#94a3b8; margin-top:4px;">Pass ID: ${bookingPass.id}</p>
    </div>

    <div class="token-box">
      <div style="font-size:12px; color:#94a3b8; text-transform:uppercase; font-weight:bold;">Assigned Token Number</div>
      <div class="token-num">#${bookingPass.tokenNumber}</div>
      <div class="wait-time">⏱️ Dynamic Estimated Wait Time: ~${bookingPass.estimatedWaitMins} Mins</div>
    </div>

    <div class="grid">
      <div>
        <div class="label">Attending Specialist</div>
        <div class="val">${bookingPass.doctorName}</div>
        <div style="color:#3b82f6; font-size:12px;">${bookingPass.specialty}</div>
      </div>
      <div>
        <div class="label">Hospital / Facility</div>
        <div class="val">${bookingPass.hospitalName}</div>
      </div>
      <div>
        <div class="label">Appointment Date & Time</div>
        <div class="val">${bookingPass.date} at ${bookingPass.timeSlot}</div>
      </div>
      <div>
        <div class="label">Consultation Mode</div>
        <div class="val">${bookingPass.type} (Fee: ₹${bookingPass.fee})</div>
      </div>
      <div>
        <div class="label">Patient Name</div>
        <div class="val">${bookingPass.patientName}</div>
      </div>
      <div>
        <div class="label">Contact Phone</div>
        <div class="val">${bookingPass.phone}</div>
      </div>
    </div>

    <div class="footer">
      Verified by HealthSure AI Telemetry • Present this digital pass at the hospital reception counter.
    </div>
  </div>
</body>
</html>
    `.trim();

    // Trigger instant browser file download
    const blob = new Blob([htmlDocContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `HealthSure_Pass_${bookingPass.tokenNumber}_${bookingPass.patientName.replace(/\s+/g, '_')}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Handle Instant Booking Submission
  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newPass = {
      id: 'HEALTHSURE-APT-' + Math.floor(100000 + Math.random() * 900000),
      doctorName: selectedDoctor.name,
      specialty: selectedDoctor.specialty,
      hospitalName: selectedDoctor.hospitalName,
      date: selectedDate,
      timeSlot: selectedTimeSlot,
      type: consultationType,
      tokenNumber: dynamicPreview.tokenNumber,
      estimatedWaitMins: dynamicPreview.estimatedWaitMins,
      patientName: patientName,
      phone: patientPhone,
      fee: selectedDoctor.consultationFee
    };

    setBookingPass(newPass);
    setBookingConfirmed(true);

    // Trigger celebration confetti
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 }
    });

    if (onAppointmentBooked) {
      onAppointmentBooked(newPass);
    }
  };

  return (
    <section className="py-4 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 font-extrabold text-xs uppercase tracking-wider">
          <CalendarIcon className="w-3.5 h-3.5" />
          <span>Instant AI Appointment Engine</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-white">
          AI Appointment <span className="text-gradient-primary">Scheduler</span>
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm font-medium">
          Lock in your preferred doctor, receive real-time token numbers, and calculate dynamic waiting room queues.
        </p>
      </div>

      {!bookingConfirmed ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Form Panel */}
          <div className="lg:col-span-8 p-6 sm:p-8 rounded-3xl glass-card space-y-6">
            <form onSubmit={handleBooking} className="space-y-6">
              
              {/* Doctor Selector */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  Select Specialist Doctor
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1">
                  {MOCK_DOCTORS.map((doc) => (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDoctor(doc)}
                      className={`p-3.5 rounded-2xl border cursor-pointer flex items-center space-x-3 transition-all ${
                        selectedDoctor.id === doc.id
                          ? 'bg-blue-500/15 border-blue-500 ring-2 ring-blue-500/30'
                          : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <img
                        src={doc.avatar}
                        alt={doc.name}
                        className="w-11 h-11 rounded-xl object-cover border border-emerald-500"
                      />
                      <div className="truncate">
                        <h4 className="text-xs font-black text-white truncate">
                          {doc.name}
                        </h4>
                        <p className="text-[11px] text-blue-400 font-bold">
                          {doc.specialty}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {doc.hospitalName}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Consultation Type Selector */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  Consultation Mode
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setConsultationType('In-Person')}
                    className={`p-3.5 rounded-2xl border flex items-center justify-center space-x-2 text-xs font-black transition-all ${
                      consultationType === 'In-Person'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                        : 'bg-slate-900 border-slate-800 text-slate-300'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    <span>In-Person Visit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConsultationType('Video')}
                    className={`p-3.5 rounded-2xl border flex items-center justify-center space-x-2 text-xs font-black transition-all ${
                      consultationType === 'Video'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                        : 'bg-slate-900 border-slate-800 text-slate-300'
                    }`}
                  >
                    <Video className="w-4 h-4" />
                    <span>HD Tele-Video Consult</span>
                  </button>
                </div>
              </div>

              {/* Date Selection Picker */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  Preferred Appointment Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  min="2026-08-08"
                  max="2026-08-31"
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-white font-bold text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Live Slots Selector */}
              <div className="space-y-3">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Available Live Slots ({selectedDate})</span>
                  <span className="text-emerald-400 flex items-center gap-1 text-[10px] font-black">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> Real-time Availability
                  </span>
                </label>

                {/* Morning Slots */}
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Morning</span>
                  <div className="flex flex-wrap gap-2">
                    {morningSlots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedTimeSlot(slot)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all ${
                          selectedTimeSlot === slot
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Afternoon Slots */}
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Afternoon</span>
                  <div className="flex flex-wrap gap-2">
                    {afternoonSlots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedTimeSlot(slot)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all ${
                          selectedTimeSlot === slot
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Patient Information Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400">Patient Full Name</label>
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400">Mobile Phone</label>
                  <input
                    type="tel"
                    required
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-bold"
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-extrabold text-sm shadow-xl shadow-blue-500/25 transition-all"
              >
                Confirm Instant Booking • ₹{selectedDoctor.consultationFee}
              </button>

            </form>
          </div>

          {/* Right Dynamic Live Token & Queue Predictor Widget */}
          <div className="lg:col-span-4 space-y-6">
            
            <div className="p-6 rounded-3xl glass-card space-y-6 text-center border border-blue-500/30">
              <div className="w-16 h-16 rounded-3xl bg-blue-500/15 text-blue-400 flex items-center justify-center mx-auto">
                <Ticket className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Dynamic Queue Predictor</h3>
                <p className="text-xs text-slate-400 mt-1">Calculates waiting room pace based on slot & doctor load</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Estimated Token No.</span>
                <div className="text-4xl font-black text-blue-400">#{dynamicPreview.tokenNumber}</div>
                <p className="text-xs font-black text-emerald-400 flex items-center justify-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Dynamic wait time: ~{dynamicPreview.estimatedWaitMins} mins
                </p>
              </div>

              <div className="text-left space-y-2.5 pt-1 text-xs font-bold text-slate-300">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Free cancellation up to 2 hours prior</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <span>Instant digital pass download ready</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      ) : (
        /* Confirmed Digital Pass Display with REAL FILE DOWNLOAD */
        <div className="max-w-2xl mx-auto p-8 rounded-3xl glass-card border-2 border-emerald-500/40 text-center space-y-6 animate-in zoom-in-95">
          
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-wider">
              Booking Confirmed
            </span>
            <h3 className="text-3xl font-black text-white mt-2">
              Appointment Token #{bookingPass.tokenNumber}
            </h3>
            <p className="text-xs text-slate-400 font-bold mt-1">Pass ID: {bookingPass.id}</p>
          </div>

          {/* Ticket Card */}
          <div className="p-6 rounded-2xl bg-slate-900 text-left space-y-4 border border-slate-800">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h4 className="text-base font-black text-white">{bookingPass.doctorName}</h4>
                <p className="text-xs text-blue-400 font-bold">{bookingPass.specialty}</p>
              </div>
              <span className="px-3 py-1 rounded-xl bg-blue-600 text-white font-black text-xs">
                {bookingPass.type}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 font-black block text-[10px] uppercase">Hospital / Facility</span>
                <span className="font-black text-white">{bookingPass.hospitalName}</span>
              </div>
              <div>
                <span className="text-slate-400 font-black block text-[10px] uppercase">Date & Time</span>
                <span className="font-black text-white">{bookingPass.date} at {bookingPass.timeSlot}</span>
              </div>
              <div>
                <span className="text-slate-400 font-black block text-[10px] uppercase">Patient Name</span>
                <span className="font-black text-white">{bookingPass.patientName}</span>
              </div>
              <div>
                <span className="text-slate-400 font-black block text-[10px] uppercase">Dynamic Queue Time</span>
                <span className="font-black text-emerald-400">~{bookingPass.estimatedWaitMins} mins wait</span>
              </div>
            </div>

          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            
            {/* Real File Download Trigger */}
            <button
              onClick={handleDownloadPass}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-black text-xs shadow-lg shadow-blue-500/25 flex items-center justify-center space-x-2 transition-all hover:scale-105"
            >
              <Download className="w-4 h-4" />
              <span>Download Digital Pass (.HTML / PDF)</span>
            </button>

            <button
              onClick={() => {
                setBookingConfirmed(false);
                setBookingPass(null);
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-900 text-slate-300 font-black text-xs border border-slate-800 hover:bg-slate-800"
            >
              Book Another Appointment
            </button>
          </div>

        </div>
      )}

    </section>
  );
};
