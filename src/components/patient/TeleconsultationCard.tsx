// HealthSure — Teleconsultation & Follow-up Components (Fully Localized)
// frontend/src/components/patient/TeleconsultationCard.tsx

import React, { useState } from 'react';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Signal,
  X,
  FileText,
} from 'lucide-react';
import type { Teleconsultation, FollowUp } from '../../types/patient';
import { StatusBadge } from './StatusBadge';
import { useWebRTC } from '../../hooks/useWebRTC';
import { useTranslation } from '../../lib/i18n/useTranslation';

export const TeleconsultationCard: React.FC<{ teleconsult: Teleconsultation }> = ({ teleconsult }) => {
  const t = useTranslation();
  const [roomOpen, setRoomOpen] = useState(false);
  const [liveStatus, setLiveStatus] = useState<string>(teleconsult.status || 'upcoming');
  const [doctorPresent, setDoctorPresent] = useState<boolean>(false);

  React.useEffect(() => {
    let mounted = true;
    const checkSession = async () => {
      try {
        const res = await fetch(`/api/teleconsultations/${teleconsult.id || 'tele-001'}/session`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data && mounted) {
            setLiveStatus(json.data.status);
            setDoctorPresent(json.data.doctorJoined);
          }
        }
      } catch {}
    };
    checkSession();
    const interval = setInterval(checkSession, 3000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [teleconsult.id]);

  const isEnterable = ['upcoming', 'scheduled', 'waiting', 'waiting_for_doctor', 'waiting_for_patient', 'connecting', 'live', 'in_consultation', 'confirmed'].includes(
    liveStatus.toLowerCase()
  );

  return (
    <>
      <div className="rounded-2xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-white dark:bg-[#0A2020] p-4 sm:p-5 space-y-4 hover:border-[#087F6D]/50 transition-all shadow-xs flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[11px] font-bold text-[#087F6D] dark:text-[#4FD1C5] uppercase tracking-wider">
                {teleconsult.speciality} {t.navTeleconsult}
              </span>
              <h4 className="text-base font-bold text-[#17324D] dark:text-[#E2EEF4] mt-0.5">
                {teleconsult.doctorName}
              </h4>
              <p className="text-xs text-[#64748B] dark:text-[#7B9EA8]">
                {teleconsult.hospital}
              </p>
            </div>
            <StatusBadge status={liveStatus} />
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-[#17324D] dark:text-[#D1E8E2]">
            <div className="bg-[#F5F9F7] dark:bg-[#0F2929] p-2.5 rounded-xl">
              <div className="text-[10px] text-[#64748B] dark:text-[#7B9EA8]">{t.preferredDateLabel}</div>
              <div className="font-bold">{teleconsult.date} • {teleconsult.time}</div>
            </div>
            <div className="bg-[#F5F9F7] dark:bg-[#0F2929] p-2.5 rounded-xl">
              <div className="text-[10px] text-[#64748B] dark:text-[#7B9EA8]">Live Presence</div>
              <div className={`font-bold ${doctorPresent ? 'text-emerald-500' : 'text-[#087F6D] dark:text-[#4FD1C5]'}`}>
                {doctorPresent ? '🟢 Doctor in Room' : '🟡 ' + t.audio2gMode}
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#EAF7F2]/50 dark:bg-[#073B3A]/30 border border-[#087F6D]/20 text-xs text-[#64748B] dark:text-[#7B9EA8]">
            <p>{teleconsult.instructions}</p>
          </div>
        </div>

        <div className="pt-2 border-t border-[#DDE8E4]/60 dark:border-[#1A3A3A] flex items-center gap-2">
          {isEnterable && (
            <button
              type="button"
              onClick={() => setRoomOpen(true)}
              className={`w-full py-2.5 px-4 rounded-xl text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer ${
                doctorPresent ? 'bg-emerald-600 hover:bg-emerald-700 animate-pulse' : 'bg-[#087F6D] hover:bg-[#073B3A]'
              }`}
            >
              <Video className="w-4 h-4" />
              <span>{doctorPresent ? 'Doctor Ready — Enter Video Room' : t.enterRoomBtn}</span>
            </button>
          )}

          {['completed', 'ended'].includes(liveStatus.toLowerCase()) && (
            <button
              type="button"
              onClick={() => alert(`Teleconsultation ${teleconsult.id} completed. Digital prescription is stored in Health Records.`)}
              className="w-full py-2 px-3 rounded-xl border border-[#DDE8E4] dark:border-[#1A3A3A] text-xs font-semibold text-[#17324D] dark:text-[#D1E8E2] hover:bg-[#F5F9F7] cursor-pointer"
            >
              {t.viewConsultationSummary}
            </button>
          )}
        </div>
      </div>

      {/* Real Media Teleconsultation Video Room Modal */}
      {roomOpen && (
        <TeleconsultRoomMock
          teleconsult={teleconsult}
          onClose={() => setRoomOpen(false)}
        />
      )}
    </>
  );
};

export const TeleconsultRoomMock: React.FC<{
  teleconsult: Teleconsultation;
  onClose: () => void;
}> = ({ teleconsult, onClose }) => {
  const t = useTranslation();
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
    peerJoined,
    candidateStats,
    toggleCamera,
    toggleMic,
    toggleLowBandwidth,
    endCall,
    retryConnection,
  } = useWebRTC({
    sessionId: teleconsult.id || 'tele-001',
    role: 'patient',
    autoStart: true,
  });

  const handleEndCall = () => {
    endCall();
    onClose();
  };

  const formatTimer = (s: number) => {
    const min = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
  };

  const getStatusText = () => {
    if (connectionState === 'connected') return 'LIVE CONSULTATION (WebRTC P2P)';
    if (connectionState === 'connecting') return 'Doctor in Room — Connecting...';
    if (connectionState === 'signaling') {
      return peerJoined ? 'Doctor in Room — Establishing Link…' : 'Waiting for Doctor to join…';
    }
    if (connectionState === 'failed') return 'Connection Failed — Retry';
    if (connectionState === 'ended') return 'Consultation Completed';
    return peerJoined ? 'Doctor in Room — Connecting...' : 'Waiting for Doctor to join…';
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-3xl bg-[#072424] text-white rounded-3xl border border-[#087F6D]/40 shadow-2xl overflow-hidden flex flex-col h-[88vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Room Header */}
        <div className="px-5 py-3.5 bg-[#051818] border-b border-[#087F6D]/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  connectionState === 'connected'
                    ? 'bg-emerald-400 animate-ping'
                    : connectionState === 'failed'
                    ? 'bg-rose-500'
                    : 'bg-amber-400 animate-pulse'
                }`}
              />
              <span className="text-xs font-bold tracking-wider uppercase text-emerald-400">
                {getStatusText()}
              </span>
            </div>
            <span className="text-xs text-[#A7D9CE] font-mono">({formatTimer(callDuration)})</span>
          </div>

          <div className="flex items-center gap-3">
            {connectionState === 'failed' && (
              <button
                type="button"
                onClick={retryConnection}
                className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer transition-all"
              >
                Retry
              </button>
            )}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#087F6D]/30 text-xs text-[#4FD1C5] border border-[#087F6D]/40">
              <Signal className="w-3.5 h-3.5" />
              <span>{isLowBandwidthMode ? t.audio2gMode : connectionState === 'connected' ? 'WebRTC P2P (Live)' : t.hdVideoActive}</span>
            </div>
            <button
              type="button"
              onClick={handleEndCall}
              className="p-1 rounded-lg text-[#A7D9CE] hover:text-white cursor-pointer"
              aria-label={t.endConsultation}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Feeds Area */}
        <div className="flex-1 p-4 grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#051818] min-h-0">
          {/* Main Remote Feed (Doctor) */}
          <div className="md:col-span-2 relative rounded-2xl bg-[#092B2B] border border-[#087F6D]/30 overflow-hidden flex items-center justify-center">
            {/* Live remote video element */}
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className={`w-full h-full object-cover relative z-10 transition-opacity duration-300 ${isRemoteVideoActive && !isLowBandwidthMode ? 'opacity-100 block' : 'opacity-0 hidden'}`}
            />

            {/* Doctor placeholder when remote video is not yet transmitting or in low bandwidth mode */}
            {(!isRemoteVideoActive || isLowBandwidthMode) && (
              <div className="text-center p-6 space-y-3 z-0">
                <div className="w-20 h-20 rounded-full bg-[#087F6D] text-white font-bold text-2xl flex items-center justify-center mx-auto shadow-lg">
                  AM
                </div>
                <div>
                  <h4 className="font-bold text-base">{teleconsult.doctorName}</h4>
                  <p className="text-xs text-[#A7D9CE]">{teleconsult.speciality}</p>
                </div>
                <div className="inline-block px-3 py-1 rounded-full bg-emerald-950/60 text-emerald-300 text-[11px] font-semibold border border-emerald-800">
                  {isLowBandwidthMode
                    ? `🎙️ ${t.audio2gMode}`
                    : connectionState === 'connected'
                    ? 'Media connected • Streaming video'
                    : connectionState === 'connecting'
                    ? 'Connecting to Doctor…'
                    : 'Waiting for Doctor to join…'}
                </div>
              </div>
            )}
          </div>

          {/* Side: Patient Real Self Video Feed */}
          <div className="space-y-3 flex flex-col min-h-0">
            <div className="h-44 rounded-2xl bg-[#092B2B] border border-[#087F6D]/30 relative overflow-hidden flex items-center justify-center">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover transform -scale-x-100 ${isCameraOn && !isLowBandwidthMode ? 'block' : 'hidden'}`}
              />

              {(!isCameraOn || isLowBandwidthMode) && (
                <div className="text-xs text-[#A7D9CE] flex flex-col items-center gap-1">
                  <VideoOff className="w-5 h-5 text-rose-400" />
                  <span>{isLowBandwidthMode ? 'Camera Off (2G Mode)' : 'Camera Off'}</span>
                </div>
              )}

              {/* Patient Name Badge Overlay */}
              <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-[10px] text-white backdrop-blur-xs flex items-center gap-1">
                <span>Self Preview</span>
                {!isMicOn && <MicOff className="w-3 h-3 text-rose-400" />}
              </div>
            </div>

            {/* Live Consultation Notes Box */}
            <div className="flex-1 bg-[#092B2B] border border-[#087F6D]/30 rounded-2xl p-3.5 space-y-2 text-xs overflow-y-auto">
              <div className="font-bold text-[#4FD1C5] flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                {t.clinicalNotesSync}:
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                Dr. Mehta: Blood pressure 138/88 mmHg. Continuing Amlodipine 5mg regimen.
              </p>
              <div className="p-2 rounded-lg bg-[#073B3A] border border-[#087F6D]/30 text-[11px]">
                <strong className="text-white block">{t.step4Title}:</strong>
                {t.phcKhedVenue}
              </div>
            </div>
          </div>
        </div>

        {/* Room Controls Bar */}
        <div className="p-4 bg-[#051818] border-t border-[#087F6D]/30 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={toggleLowBandwidth}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              isLowBandwidthMode
                ? 'bg-[#087F6D] border-[#4FD1C5] text-white'
                : 'border-[#087F6D]/40 text-[#A7D9CE] hover:text-white'
            }`}
          >
            {isLowBandwidthMode ? `✓ ${t.audio2gMode}` : t.lowBandwidthExplainTitle}
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleMic}
              className={`p-3 rounded-full transition-colors cursor-pointer ${
                isMicOn ? 'bg-[#087F6D] text-white hover:bg-[#073B3A]' : 'bg-rose-600 text-white hover:bg-rose-700'
              }`}
              aria-label="Mute/Unmute Mic"
            >
              {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>

            <button
              type="button"
              onClick={toggleCamera}
              className={`p-3 rounded-full transition-colors cursor-pointer ${
                isCameraOn ? 'bg-[#087F6D] text-white hover:bg-[#073B3A]' : 'bg-rose-600 text-white hover:bg-rose-700'
              }`}
              aria-label="Camera Toggle"
            >
              {isCameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>

            <button
              type="button"
              onClick={handleEndCall}
              className="p-3 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-lg font-bold cursor-pointer"
              aria-label={t.endConsultation}
              title={t.endConsultation}
            >
              <PhoneOff className="w-5 h-5" />
            </button>
          </div>

          <div className="text-[11px] text-[#A7D9CE] hidden sm:block">
            {errorMessage ? (
              <span className="text-amber-300 font-semibold">{errorMessage}</span>
            ) : (
              <span>WebRTC Peer-to-Peer Protocol Active</span>
            )}
          </div>

          {/* WebRTC Diagnostics Bar */}
          <div className="w-full pt-1">
            <div className="px-3 py-1.5 rounded-xl bg-black/70 border border-[#087F6D]/40 text-[10px] font-mono text-slate-300 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-1.5 py-0.5 rounded font-bold ${connectionState === 'connected' ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' : 'bg-amber-950 text-amber-300 border border-amber-700'}`}>
                  SESSION: {connectionState === 'connected' ? 'LIVE' : connectionState.toUpperCase()}
                </span>
                <span className="px-1.5 py-0.5 rounded font-bold bg-blue-950 text-blue-300 border border-blue-700">
                  APPOINTMENT: CONFIRMED
                </span>
                <span>•</span>
                <span className="text-emerald-400 font-bold">P2P: {connectionState}</span>
                <span>•</span>
                <span>ICE: {iceConnectionState} (H:{candidateStats.host} S:{candidateStats.srflx} R:{candidateStats.relay})</span>
                <span>•</span>
                <span>SIGNAL: {signalingState}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>LOCAL: {localTracks.audio ? '🎤' : '❌'}{localTracks.video ? '📹' : '❌'}</span>
                <span>•</span>
                <span>REMOTE: {remoteTracks.audio ? '🔊' : '❌'}{remoteTracks.video ? '📺' : '❌'}</span>
                <span>•</span>
                <span>ATTACHED: {isRemoteAttached ? '✓' : '…'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const FollowUpCard: React.FC<{ followUp: FollowUp }> = ({ followUp }) => {
  const t = useTranslation();

  return (
    <div className="p-4 sm:p-5 rounded-2xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-white dark:bg-[#0A2020] space-y-3 shadow-xs hover:border-[#087F6D]/50 transition-all">
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-[11px] font-bold text-[#087F6D] dark:text-[#4FD1C5] uppercase tracking-wider">
            {followUp.speciality} {t.navFollowups}
          </span>
          <h4 className="text-base font-bold text-[#17324D] dark:text-[#E2EEF4] mt-0.5">
            {followUp.doctorName}
          </h4>
          <p className="text-xs text-[#64748B] dark:text-[#7B9EA8]">
            {followUp.facility}
          </p>
        </div>
        <StatusBadge status={followUp.status} />
      </div>

      <div className="p-3 rounded-xl bg-[#F5F9F7] dark:bg-[#0F2929] border border-[#DDE8E4]/60 dark:border-[#1A3A3A] text-xs space-y-1">
        <div className="flex items-center justify-between text-[#17324D] dark:text-[#E2EEF4]">
          <span className="text-[#64748B]">{t.preferredDateLabel}:</span>
          <strong>{followUp.dueDate}</strong>
        </div>
        <div className="flex items-center justify-between text-[#17324D] dark:text-[#E2EEF4]">
          <span className="text-[#64748B]">{t.consultModeLabel}:</span>
          <span className="capitalize">{followUp.mode === 'in-person' ? t.inPersonMode : t.teleconsultMode}</span>
        </div>
      </div>

      <div className="text-xs text-[#64748B] dark:text-[#7B9EA8] space-y-1">
        <span className="font-semibold text-[#17324D] dark:text-[#E2EEF4]">{followUp.title}</span>
        <p className="bg-[#EAF7F2]/40 dark:bg-[#073B3A]/20 p-2.5 rounded-xl border border-[#087F6D]/15">
          {followUp.instructions}
        </p>
      </div>
    </div>
  );
};
