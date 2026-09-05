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
  Stethoscope,
  ShieldCheck,
} from 'lucide-react';
import { useWebRTC } from '../../hooks/useWebRTC';

export const DoctorTeleconsultPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('id') || 'tele-001';

  const [hasJoinedCall, setHasJoinedCall] = useState<boolean>(false);
  const [isPatientInRoom, setIsPatientInRoom] = useState<boolean>(false);
  const [liveNotes, setLiveNotes] = useState(
    'Patient reports reduced exertional breathlessness with current medication. Compliant with diet. Advised follow-up 2D-Echo.'
  );
  const [notesSynced, setNotesSynced] = useState(false);

  React.useEffect(() => {
    let mounted = true;
    const checkPresence = async () => {
      try {
        const res = await fetch(`/api/teleconsultations/${sessionId}/session`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data && mounted) {
            setIsPatientInRoom(json.data.patientJoined);
          }
        }
      } catch {}
    };
    checkPresence();
    const interval = setInterval(checkPresence, 3000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [sessionId]);

  const {
    connectionState,
    iceConnectionState,
    signalingState,
    localVideoRef,
    remoteVideoRef,
    isCameraOn,
    isMicOn,
    isRemoteVideoActive,
    isLowBandwidthMode,
    callDuration,
    errorMessage,
    localTracks,
    remoteTracks,
    isRemoteAttached,
    candidateStats,
    toggleCamera,
    toggleMic,
    toggleLowBandwidth,
    endCall,
    startCall,
    retryConnection,
  } = useWebRTC({
    sessionId,
    role: 'doctor',
    autoStart: false, // Explicit Join Call required before accessing camera/mic
  });

  const handleJoinCall = async () => {
    setHasJoinedCall(true);
    await startCall();
  };

  const handleEndCall = () => {
    endCall();
    setHasJoinedCall(false);
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
              <span
                className={`w-2 h-2 rounded-full ${
                  connectionState === 'connected'
                    ? 'bg-emerald-500 animate-ping'
                    : hasJoinedCall
                    ? 'bg-amber-500 animate-pulse'
                    : 'bg-slate-400'
                }`}
              />
              <span>
                {connectionState === 'connected'
                  ? 'LIVE TELECONSULTATION SESSION (WebRTC P2P)'
                  : hasJoinedCall
                  ? (isPatientInRoom ? 'PATIENT JOINED — CONNECTING…' : 'CONNECTING TO PATIENT…')
                  : (isPatientInRoom ? 'PATIENT WAITING IN ROOM' : 'PRE-CALL WAITING ROOM')}
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

      {/* Real-time WebRTC Diagnostics Overlay */}
      <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-700/80 text-slate-300 font-mono text-[11px] flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`px-2 py-0.5 rounded-md font-bold ${connectionState === 'connected' ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' : 'bg-amber-950 text-amber-300 border border-amber-700'}`}>
            SESSION: {connectionState === 'connected' ? 'LIVE' : connectionState.toUpperCase()}
          </span>
          <span className="px-2 py-0.5 rounded-md font-bold bg-blue-950 text-blue-300 border border-blue-700">
            APPOINTMENT: CONFIRMED
          </span>
          <span>•</span>
          <span className="text-emerald-400 font-semibold">P2P: {connectionState}</span>
          <span>•</span>
          <span>ICE: {iceConnectionState} (Host:{candidateStats.host} Srflx:{candidateStats.srflx} Relay:{candidateStats.relay})</span>
          <span>•</span>
          <span>Sig: {signalingState}</span>
          <span>•</span>
          <span>Timer: {formatTimer(callDuration)}</span>
        </div>
        <div className="flex items-center gap-3">
          <span>Local: Audio {localTracks.audio ? 'ON' : 'OFF'} • Video {localTracks.video ? 'ON' : 'OFF'}</span>
          <span>•</span>
          <span>Remote: Audio {remoteTracks.audio ? 'ON' : 'OFF'} • Video {remoteTracks.video ? 'ON' : 'OFF'}</span>
          <span>•</span>
          <span>Attached: {isRemoteAttached ? 'YES' : 'PENDING'}</span>
        </div>
      </div>

      {/* ── PRE-CALL SCREEN (Before Join Call) ─────────────────────────── */}
      {!hasJoinedCall ? (
        <div className="max-w-xl mx-auto rounded-3xl bg-slate-950 border border-slate-800 p-8 text-center space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          <div className="w-20 h-20 rounded-full bg-[#087F6D]/20 border-2 border-[#087F6D] text-[#4FD1C5] font-bold text-2xl flex items-center justify-center mx-auto shadow-lg">
            <Stethoscope className="w-10 h-10" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-white">Dr. Ananya Mehta</h2>
            <p className="text-sm text-emerald-400 font-semibold">Cardiology Specialist • District Hospital Ratnagiri</p>
            <div className="mt-3 p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-2">
              <p className="font-bold text-white">Teleconsultation Ready:</p>
              <p>Patient: <strong className="text-emerald-300">Parth Sharma</strong> (ABHA: 91-4589-2041-8890)</p>
              <p>PHC Sub-Centre: Khed Rural Health Kiosk (Token: HS-TKN-102)</p>
              <div className="pt-2 border-t border-slate-800 flex items-center justify-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${isPatientInRoom ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
                <span className={`font-bold text-xs ${isPatientInRoom ? 'text-emerald-300' : 'text-amber-300'}`}>
                  {isPatientInRoom ? '🟢 Patient is waiting in room — Ready to connect' : '🟡 Waiting for Patient to enter room…'}
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-200 text-left space-y-2">
            <div className="font-bold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Ready to Connect:</span>
            </div>
            <p className="text-slate-300">
              Camera and microphone permissions will be requested only when you click <strong>Join Call</strong>.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={handleEndCall}
              className="w-full sm:w-1/3 py-3.5 px-4 rounded-2xl border border-slate-700 hover:bg-slate-900 text-slate-300 text-xs font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleJoinCall}
              className="w-full sm:w-2/3 py-3.5 px-6 rounded-2xl bg-[#087F6D] hover:bg-[#073B3A] text-white text-sm font-bold shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02]"
            >
              <Video className="w-5 h-5" />
              <span>Join Call</span>
            </button>
          </div>
        </div>
      ) : (
        /* ── ACTIVE IN-CALL ROOM ────────────────────────────────────────── */
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

                <div className="flex items-center gap-2">
                  {connectionState === 'failed' && (
                    <button
                      type="button"
                      onClick={retryConnection}
                      className="px-2.5 py-1 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] cursor-pointer transition-all"
                    >
                      Retry Connection
                    </button>
                  )}
                  <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-[11px] font-mono">
                    Duration: {formatTimer(callDuration)}
                  </div>
                </div>
              </div>

              {/* Main Remote Patient Video Stream */}
              <div className="flex-1 flex items-center justify-center relative overflow-hidden">
                {/* Remote Patient Video Stream — ALWAYS in DOM, never hidden/display:none */}
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className={`w-full h-full object-cover absolute inset-0 z-10 transition-opacity duration-300 ${isRemoteVideoActive && !isLowBandwidthMode ? 'opacity-100' : 'opacity-0'}`}
                />

                {(!isRemoteVideoActive || isLowBandwidthMode) && (
                  <div className="text-center space-y-2 z-0">
                    <div className="w-24 h-24 rounded-full bg-[#087F6D]/40 border-2 border-[#4FD1C5] mx-auto flex items-center justify-center text-white text-3xl font-bold">
                      PS
                    </div>
                    <div className="text-white font-bold text-sm">Parth Sharma (Patient)</div>
                    <div className="text-slate-400 text-xs">
                      {isLowBandwidthMode
                        ? '🎙️ Audio Priority Mode Active (2G)'
                        : connectionState === 'connected'
                        ? 'Media connected • Streaming video'
                        : connectionState === 'connecting'
                        ? 'Connecting to Patient…'
                        : 'Waiting for Patient to join…'}
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
                  aria-label={isCameraOn ? 'Turn Off Video' : 'Turn On Video'}
                  title={isCameraOn ? 'Turn Off Video' : 'Turn On Video'}
                >
                  {isCameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                </button>

                <button
                  type="button"
                  onClick={handleEndCall}
                  className="px-5 py-3 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-transform active:scale-95 cursor-pointer"
                >
                  <PhoneOff className="w-4 h-4" />
                  <span>End Consultation</span>
                </button>
              </div>
            </div>

            {/* Doctor WebRTC Diagnostics Bar */}
            <div className="px-4 py-2 rounded-2xl bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-300 flex flex-wrap items-center justify-between gap-2 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">P2P: {connectionState}</span>
                <span>•</span>
                <span>ICE: {iceConnectionState} (H:{candidateStats.host} S:{candidateStats.srflx} R:{candidateStats.relay})</span>
                <span>•</span>
                <span>Sig: {signalingState}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>Local: {localTracks.audio ? '🎤' : '❌'}{localTracks.video ? '📹' : '❌'}</span>
                <span>•</span>
                <span>Remote: {remoteTracks.audio ? '🔊' : '❌'}{remoteTracks.video ? '📺' : '❌'}</span>
                <span>•</span>
                <span>Attached: {isRemoteAttached ? '✓' : '…'}</span>
              </div>
            </div>
          </div>

          {/* ── RIGHT PANEL: CLINICAL EHR & PRESCRIPTION ───────────────────── */}
          <div className="space-y-4">
            <div className="rounded-3xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-white dark:bg-[#0A2020] p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#DDE8E4] dark:border-[#1A3A3A] pb-3">
                <h3 className="font-bold text-[#17324D] dark:text-[#E2EEF4] text-sm">
                  Clinical EHR Sync (ABHA Connected)
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                  Live
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#64748B] dark:text-[#7B9EA8] mb-1.5">
                  Real-time Clinical Findings & Prescription:
                </label>
                <textarea
                  value={liveNotes}
                  onChange={(e) => setLiveNotes(e.target.value)}
                  rows={7}
                  className="w-full rounded-2xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-[#F8FAFC] dark:bg-[#071818] p-3 text-xs text-[#17324D] dark:text-[#E2EEF4] focus:outline-none focus:ring-2 focus:ring-[#087F6D] transition-all resize-none font-sans"
                  placeholder="Record diagnosis, Rx dosages, and advice..."
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-[#64748B] dark:text-[#7B9EA8]">
                  Token: <strong className="text-[#087F6D]">HS-TKN-102</strong>
                </span>
                <button
                  type="button"
                  onClick={handleSyncNotes}
                  className="px-4 py-2 rounded-xl bg-[#087F6D] hover:bg-[#073B3A] text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {notesSynced ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Synced</span>
                    </>
                  ) : (
                    <span>Sync to EHR</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
