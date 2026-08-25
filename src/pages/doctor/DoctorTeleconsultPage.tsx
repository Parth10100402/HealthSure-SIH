import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Signal,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import { useWebRTC } from '../../hooks/useWebRTC';

export const DoctorTeleconsultPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('id') || 'tele-001';

  const [liveNotes, setLiveNotes] = useState(
    'Patient reports reduced exertional breathlessness with current medication. Compliant with diet. Advised follow-up 2D-Echo.'
  );
  const [notesSynced, setNotesSynced] = useState(false);

  const {
    connectionState,
    localVideoRef,
    remoteVideoRef,
    isCameraOn,
    isMicOn,
    isRemoteVideoActive,
    isLowBandwidthMode,
    callDuration,
    errorMessage,
    toggleCamera,
    toggleMic,
    toggleLowBandwidth,
    endCall,
  } = useWebRTC({
    sessionId,
    role: 'doctor',
    autoStart: true,
  });

  const handleEndCall = () => {
    endCall();
    navigate('/doctor/appointments');
  };

  const handleSyncNotes = () => {
    setNotesSynced(true);
    setTimeout(() => setNotesSynced(false), 3000);
  };

  const formatTimer = (s: number) => {
    const min = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DDE8E4] dark:border-[#1A3A3A] pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleEndCall}
            className="p-2 rounded-xl border border-[#DDE8E4] dark:border-[#1A3A3A] text-[#64748B] hover:text-[#17324D] dark:hover:text-white cursor-pointer"
            aria-label="Back to appointments"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold mb-1">
              <span className={`w-2 h-2 rounded-full ${connectionState === 'connected' ? 'bg-emerald-500 animate-ping' : 'bg-amber-500 animate-pulse'}`} />
              <span>
                {connectionState === 'connected' ? 'LIVE TELECONSULTATION SESSION (WebRTC P2P)' : connectionState === 'connecting' ? 'CONNECTING TO PATIENT…' : 'WAITING FOR PATIENT CALL LINK…'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#17324D] dark:text-[#E2EEF4]">
              Remote Rural Tele-Clinic
            </h1>
          </div>
        </div>

        {/* Low-Bandwidth Mode Switch */}
        <button
          type="button"
          onClick={toggleLowBandwidth}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
            isLowBandwidthMode
              ? 'bg-[#EAF7F2] dark:bg-[#073B3A] border-[#087F6D] text-[#087F6D] dark:text-[#4FD1C5]'
              : 'bg-white dark:bg-[#0A2020] border-[#DDE8E4] text-[#64748B]'
          }`}
        >
          <Signal className="w-4 h-4" />
          <span>2G Low-Bandwidth Mode: {isLowBandwidthMode ? 'ON' : 'OFF'}</span>
        </button>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs font-semibold">
          ⚠️ {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── VIDEO FEED AREA ────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-3xl bg-slate-950 border border-slate-800 p-4 relative overflow-hidden aspect-video flex flex-col justify-between shadow-xl">
            {/* Top Overlay */}
            <div className="flex items-center justify-between text-xs text-white/90 z-10">
              <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                <span className={`w-2 h-2 rounded-full ${connectionState === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                <span className="font-bold">PHC Khed Kiosk Feed</span>
                <span className="text-emerald-400 font-mono text-[10px]">
                  {isLowBandwidthMode ? 'Adaptive Audio Priority (24 kbps)' : 'HD 720p WebRTC'}
                </span>
              </div>

              <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-[11px] font-mono">
                Duration: {formatTimer(callDuration)}
              </div>
            </div>

            {/* Main Remote Patient Video Stream */}
            <div className="flex-1 flex items-center justify-center relative overflow-hidden">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className={`w-full h-full object-cover ${isRemoteVideoActive && !isLowBandwidthMode ? 'block' : 'hidden'}`}
              />

              {(!isRemoteVideoActive || isLowBandwidthMode) && (
                <div className="text-center space-y-2">
                  <div className="w-24 h-24 rounded-full bg-[#087F6D]/40 border-2 border-[#4FD1C5] mx-auto flex items-center justify-center text-white text-3xl font-bold">
                    RS
                  </div>
                  <div className="text-white font-bold text-sm">Parth Sharma (Patient)</div>
                  <div className="text-slate-400 text-xs">
                    {isLowBandwidthMode ? '🎙️ Audio Priority Mode Active (2G)' : 'Facilitated by Sister Anjali (ANM, PHC Khed)'}
                  </div>
                </div>
              )}
            </div>

            {/* Doctor PIP Mini-feed with local camera */}
            <div className="absolute right-4 bottom-18 w-36 aspect-video rounded-xl bg-slate-900 border border-slate-700 overflow-hidden shadow-lg flex items-center justify-center">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover transform -scale-x-100 ${isCameraOn && !isLowBandwidthMode ? 'block' : 'hidden'}`}
              />

              {(!isCameraOn || isLowBandwidthMode) && (
                <div className="text-center text-[10px] text-white p-1">
                  <div className="font-bold">Dr. Ananya Mehta</div>
                  <div className="text-emerald-400">Cardiology OPD 104</div>
                  <div className="text-[9px] text-rose-400">Camera Off</div>
                </div>
              )}
            </div>

            {/* Call Controls Bar */}
            <div className="z-10 flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={toggleMic}
                className={`p-3 rounded-full transition-colors cursor-pointer ${
                  isMicOn ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-rose-600 text-white'
                }`}
                aria-label={isMicOn ? 'Mute Mic' : 'Unmute Mic'}
                title={isMicOn ? 'Mute Mic' : 'Unmute Mic'}
              >
                {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>

              <button
                type="button"
                onClick={toggleCamera}
                className={`p-3 rounded-full transition-colors cursor-pointer ${
                  isCameraOn ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-rose-600 text-white'
                }`}
                aria-label={isCameraOn ? 'Turn Off Camera' : 'Turn On Camera'}
                title={isCameraOn ? 'Turn Off Camera' : 'Turn On Camera'}
              >
                {isCameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>

              <button
                type="button"
                onClick={handleEndCall}
                className="px-5 py-3 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-2 transition-colors shadow-lg cursor-pointer"
                aria-label="End Teleconsultation"
              >
                <PhoneOff className="w-4 h-4" />
                <span>End Teleconsultation</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── CLINICAL SIDEBAR & NOTES ───────────────────────────────────── */}
        <div className="space-y-4">
          {/* Patient Quick Vitals Card */}
          <div className="rounded-2xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-white dark:bg-[#0A2020] p-4 space-y-3 shadow-xs">
            <h3 className="text-xs font-bold text-[#17324D] dark:text-[#E2EEF4] uppercase tracking-wider">
              Patient Clinical Snapshot
            </h3>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-xl bg-[#F5F9F7] dark:bg-[#0F2929]">
                <span className="text-[10px] text-[#64748B]">Recorded BP</span>
                <div className="font-bold text-[#087F6D] dark:text-[#4FD1C5]">134/86 mmHg</div>
              </div>

              <div className="p-2 rounded-xl bg-[#F5F9F7] dark:bg-[#0F2929]">
                <span className="text-[10px] text-[#64748B]">Pulse Rate</span>
                <div className="font-bold text-[#17324D] dark:text-[#E2EEF4]">76 bpm</div>
              </div>

              <div className="p-2 rounded-xl bg-[#F5F9F7] dark:bg-[#0F2929]">
                <span className="text-[10px] text-[#64748B]">SpO2</span>
                <div className="font-bold text-[#17324D] dark:text-[#E2EEF4]">98%</div>
              </div>

              <div className="p-2 rounded-xl bg-[#F5F9F7] dark:bg-[#0F2929]">
                <span className="text-[10px] text-[#64748B]">Blood Sugar</span>
                <div className="font-bold text-[#17324D] dark:text-[#E2EEF4]">112 mg/dL</div>
              </div>
            </div>
          </div>

          {/* Live Clinical Notes */}
          <div className="rounded-2xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-white dark:bg-[#0A2020] p-4 space-y-2.5 shadow-xs">
            <h3 className="text-xs font-bold text-[#17324D] dark:text-[#E2EEF4] uppercase tracking-wider">
              Live Consultation Notes
            </h3>

            <textarea
              rows={4}
              value={liveNotes}
              onChange={(e) => setLiveNotes(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-[#F5F9F7] dark:bg-[#0F2929] text-[#17324D] dark:text-[#E2EEF4]"
            />

            <button
              type="button"
              onClick={handleSyncNotes}
              className="w-full py-2.5 rounded-xl bg-[#087F6D] hover:bg-[#073B3A] text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              {notesSynced ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Notes Synced with PHC Record!</span>
                </>
              ) : (
                <span>Sync Notes to PHC Record</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
