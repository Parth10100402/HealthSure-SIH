// HealthSure — Production WebRTC Engine with Stable Lifecycle, Real-Media Timer & Persistent Signaling
// src/hooks/useWebRTC.ts

import { useState, useEffect, useRef, useCallback } from 'react';

export type WebRTCConnectionState =
  | 'idle'
  | 'pre_call'
  | 'requesting_media'
  | 'signaling'
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'failed'
  | 'ended';

export interface UseWebRTCOptions {
  sessionId: string;
  role: 'patient' | 'doctor';
  autoStart?: boolean;
}

export interface CandidatePairDiagnostics {
  state: string;
  localCandidateType: string;
  remoteCandidateType: string;
  protocol?: string;
  currentRoundTripTime?: number;
  bytesSent?: number;
  bytesReceived?: number;
}

export interface UseWebRTCResult {
  connectionState: WebRTCConnectionState;
  iceConnectionState: string;
  signalingState: string;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  localVideoRef: React.RefObject<HTMLVideoElement | null>;
  remoteVideoRef: React.RefObject<HTMLVideoElement | null>;
  isCameraOn: boolean;
  isMicOn: boolean;
  isRemoteVideoActive: boolean;
  isRemoteAudioActive: boolean;
  isLowBandwidthMode: boolean;
  callDuration: number;
  errorMessage: string | null;
  localTracks: { audio: boolean; video: boolean };
  remoteTracks: { audio: boolean; video: boolean };
  isRemoteAttached: boolean;
  peerJoined: boolean;
  candidateStats: { host: number; srflx: number; relay: number };
  candidatePairStats: CandidatePairDiagnostics | null;
  toggleCamera: () => void;
  toggleMic: () => void;
  toggleLowBandwidth: () => void;
  endCall: () => void;
  startCall: () => Promise<void>;
  retryConnection: () => Promise<void>;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Reliable Base ICE Server Configuration
 * STUN: Google STUN cluster + Cloudflare + Mozilla (All verified high availability)
 * TURN: Configured strictly via environment variables (VITE_TURN_URL or dynamic API)
 * Note: Broken/untrusted static openrelay endpoints with certificate mismatches are strictly excluded.
 */
function getIceServers(): RTCConfiguration {
  const iceServers: RTCIceServer[] = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
    { urls: 'stun:stun.cloudflare.com:3478' },
    { urls: 'stun:stun.services.mozilla.com' },
  ];

  const customTurnUrl = import.meta.env.VITE_TURN_URL;
  const customTurnUsername = import.meta.env.VITE_TURN_USERNAME;
  const customTurnCredential = import.meta.env.VITE_TURN_CREDENTIAL;

  if (customTurnUrl) {
    const urls = customTurnUrl.includes(',') ? customTurnUrl.split(',').map((s: string) => s.trim()) : customTurnUrl;
    iceServers.unshift({
      urls,
      username: customTurnUsername || undefined,
      credential: customTurnCredential || undefined,
    });
  }

  return {
    iceServers,
    iceCandidatePoolSize: 10,
    bundlePolicy: 'max-bundle',
    rtcpMuxPolicy: 'require',
  };
}

/**
 * Dynamically resolves ICE configuration from backend `/api/teleconsultations/ice-servers`
 * with automatic fallback to client-side STUN/TURN configuration.
 */
async function fetchIceConfiguration(): Promise<RTCConfiguration> {
  const fallback = getIceServers();
  try {
    const res = await fetch(`${API_BASE_URL}/teleconsultations/ice-servers`, {
      signal: (AbortSignal as any).timeout ? (AbortSignal as any).timeout(3000) : undefined,
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data && Array.isArray(json.data.iceServers) && json.data.iceServers.length > 0) {
        return json.data;
      }
    }
  } catch {
    // Network fallback to getIceServers()
  }
  return fallback;
}


export function useWebRTC({ sessionId, role, autoStart = false }: UseWebRTCOptions): UseWebRTCResult {
  // Canonical session ID resolution
  const canonicalSessionId = (!sessionId || sessionId === 'apt-001' || sessionId === 'apt1' || sessionId === 'HS-APT-1001' || sessionId === 'HS-APT-3012')
    ? 'tele-001'
    : sessionId;

  const [connectionState, setConnectionState] = useState<WebRTCConnectionState>('idle');
  const [iceConnectionState, setIceConnectionState] = useState<string>('new');
  const [signalingState, setSignalingState] = useState<string>('stable');

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const [isCameraOn, setIsCameraOn] = useState<boolean>(true);
  const [isMicOn, setIsMicOn] = useState<boolean>(true);
  const [isRemoteVideoActive, setIsRemoteVideoActive] = useState<boolean>(false);
  const [isRemoteAudioActive, setIsRemoteAudioActive] = useState<boolean>(false);
  const [isLowBandwidthMode, setIsLowBandwidthMode] = useState<boolean>(false);
  const [callDuration, setCallDuration] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [localTracks, setLocalTracks] = useState<{ audio: boolean; video: boolean }>({ audio: false, video: false });
  const [remoteTracks, setRemoteTracks] = useState<{ audio: boolean; video: boolean }>({ audio: false, video: false });
  const [isRemoteAttached, setIsRemoteAttached] = useState<boolean>(false);
  const [peerJoined, setPeerJoined] = useState<boolean>(false);
  const [candidateStats, setCandidateStats] = useState<{ host: number; srflx: number; relay: number }>({
    host: 0,
    srflx: 0,
    relay: 0,
  });
  const [candidatePairStats, setCandidatePairStats] = useState<CandidatePairDiagnostics | null>(null);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  const pcIdRef = useRef<string>(`pc-${Math.random().toString(36).substring(2, 7)}`);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);

  const pollingTimerRef = useRef<any>(null);
  const durationTimerRef = useRef<any>(null);
  const disconnectGraceTimerRef = useRef<any>(null);
  const connectedAtRef = useRef<number | null>(null);
  const sessionStartTimeRef = useRef<number>(Date.now());
  const isStartedRef = useRef<boolean>(false);
  const isStartingRef = useRef<boolean>(false);
  const isExplicitlyEndedRef = useRef<boolean>(false);
  const hasHandledOfferRef = useRef<boolean>(false);

  // Pending ICE candidates queue (buffered until remoteDescription is set)
  const pendingCandidatesQueueRef = useRef<RTCIceCandidateInit[]>([]);
  const processedMessageIdsRef = useRef<Set<string>>(new Set());
  const lastSignalTimestampRef = useRef<number>(0);

  // Prefixed diagnostic logging conforming to specification
  const log = useCallback(
    (category: string, message: string, detail: any = '') => {
      const rolePrefix = role.toUpperCase();
      const prefix = `[WEBRTC][${rolePrefix}][${category.toUpperCase()}]`;
      if (detail !== '' && detail !== undefined && detail !== null) {
        console.log(`${prefix} ${message}`, detail);
      } else {
        console.log(`${prefix} ${message}`);
      }
    },
    [role]
  );

  // 1. Strict Two-Way Media Timer: Starts ONLY when PC is connected AND real media tracks are present
  useEffect(() => {
    const hasLocalMedia = localTracks.audio || localTracks.video;
    const hasRemoteMedia = remoteTracks.audio || remoteTracks.video;
    const isActuallyConnected = connectionState === 'connected' && hasLocalMedia && hasRemoteMedia;

    if (isActuallyConnected) {
      if (!connectedAtRef.current) {
        connectedAtRef.current = Date.now();
        log('TIMER', 'Call timer STARTED — two-way media confirmed', {
          connectedAt: connectedAtRef.current,
          localTracks,
          remoteTracks,
        });
      }

      if (!durationTimerRef.current) {
        durationTimerRef.current = setInterval(() => {
          if (connectedAtRef.current) {
            const elapsed = Math.floor((Date.now() - connectedAtRef.current) / 1000);
            setCallDuration(elapsed);
          }
        }, 1000);
      }
    } else {
      if (durationTimerRef.current) {
        log('TIMER', 'Call timer PAUSED/STOPPED — connection state or media interrupted', {
          connectionState,
          hasLocalMedia,
          hasRemoteMedia,
        });
        clearInterval(durationTimerRef.current);
        durationTimerRef.current = null;
      }
    }

    return () => {
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
        durationTimerRef.current = null;
      }
    };
  }, [connectionState, localTracks, remoteTracks, log]);

  // 2. Persistent Local Video Element Attachment (runs whenever localStream OR ref changes)
  useEffect(() => {
    const videoEl = localVideoRef.current;
    const stream = localStreamRef.current;
    if (videoEl && stream) {
      if (videoEl.srcObject !== stream) {
        log('MEDIA', 'Binding local preview stream to video element', { tracks: stream.getTracks().length });
        videoEl.srcObject = stream;
        videoEl.muted = true;
        videoEl.play().catch(() => {});
      }
    }
  }, [localStream, log]);

  // 3. Persistent Remote Video Element Attachment with Autoplay Guard
  useEffect(() => {
    const videoEl = remoteVideoRef.current;
    const stream = remoteStreamRef.current;
    if (videoEl && stream && stream.getTracks().length > 0) {
      if (videoEl.srcObject !== stream) {
        log('MEDIA', 'Binding remote inbound stream to video element', { tracks: stream.getTracks().length });
        videoEl.srcObject = stream;
        setIsRemoteAttached(true);
      }
      videoEl
        .play()
        .then(() => {
          log('MEDIA', 'Remote video element playback started');
        })
        .catch((err) => {
          log('MEDIA', 'Remote video playback deferred / awaiting user gesture', err.message);
        });
    }
  }, [remoteStream, remoteTracks, connectionState, log]);

  // Send signal message to backend mailbox
  const sendSignalMessage = useCallback(
    async (type: string, payload: any) => {
      try {
        log('SIGNAL', `Dispatching outbound signal: ${type}`);
        await fetch(`${API_BASE_URL}/teleconsultations/${canonicalSessionId}/signal`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ senderRole: role, type, payload }),
        });
      } catch (e: any) {
        log('SIGNAL', `Outbound signal dispatch failed: ${type}`, e.message);
      }
    },
    [canonicalSessionId, role, log]
  );

  // Helper to flush queued ICE candidates once remote description exists
  const flushQueuedCandidates = useCallback(
    async (pc: RTCPeerConnection) => {
      const queue = pendingCandidatesQueueRef.current;
      if (queue.length === 0) return;
      log('SIGNAL', `Flushing ${queue.length} buffered ICE candidates`);
      while (queue.length > 0) {
        const candidate = queue.shift();
        if (candidate && candidate.candidate && candidate.candidate.trim() !== '') {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
            log('SIGNAL', 'Queued ICE candidate applied successfully', { sdpMid: candidate.sdpMid });
          } catch (e: any) {
            log('SIGNAL', 'Failed applying queued ICE candidate (ignoring stale)', e.message);
          }
        }
      }
    },
    [log]
  );

  // Helper to query RTCIceCandidatePairStats for verified media flow and active nominated pairs
  const queryCandidatePairStats = useCallback(
    async (activePC: RTCPeerConnection) => {
      try {
        const stats = await activePC.getStats();
        let selectedPair: any = null;
        let localCand: any = null;
        let remoteCand: any = null;

        stats.forEach((report) => {
          if (
            report.type === 'candidate-pair' &&
            (report.selected || report.nominated || report.state === 'succeeded')
          ) {
            selectedPair = report;
          }
        });

        if (selectedPair) {
          stats.forEach((report) => {
            if (report.id === selectedPair.localCandidateId) localCand = report;
            if (report.id === selectedPair.remoteCandidateId) remoteCand = report;
          });

          const localType = localCand?.candidateType || localCand?.type || 'unknown';
          const remoteType = remoteCand?.candidateType || remoteCand?.type || 'unknown';
          const protocol = selectedPair.protocol || localCand?.protocol || 'udp';

          setCandidatePairStats({
            state: selectedPair.state,
            localCandidateType: localType,
            remoteCandidateType: remoteType,
            protocol,
            currentRoundTripTime: selectedPair.currentRoundTripTime,
            bytesSent: selectedPair.bytesSent,
            bytesReceived: selectedPair.bytesReceived,
          });

          log(
            'ICE_PAIR',
            `Selected candidate pair [${selectedPair.state}]: ${localType} <-> ${remoteType} (${protocol}) rtt=${selectedPair.currentRoundTripTime ?? 0}s bytesSent=${selectedPair.bytesSent ?? 0} bytesRecv=${selectedPair.bytesReceived ?? 0}`
          );
        }
      } catch (err: any) {
        log('ICE_PAIR', 'Failed reading candidate pair stats:', err.message);
      }
    },
    [log]
  );

  // Attempt ICE restart upon connectivity failure
  const attemptIceRestart = useCallback(
    async (activePC: RTCPeerConnection) => {
      try {
        log('ICE', 'Triggering ICE restart recovery sequence...');
        if ('restartIce' in activePC && typeof (activePC as any).restartIce === 'function') {
          (activePC as any).restartIce();
        }
        if (role === 'patient') {
          const offer = await activePC.createOffer({ iceRestart: true });
          await activePC.setLocalDescription(offer);
          log('SIGNAL', 'Patient dispatched ICE restart Offer');
          await sendSignalMessage('offer', offer);
        }
      } catch (err: any) {
        log('ICE', 'ICE restart sequence failed:', err.message);
      }
    },
    [role, sendSignalMessage, log]
  );

  // Teardown local media, timers, and peer connection WITHOUT sending /leave to backend
  const cleanupLocalResources = useCallback(() => {
    log('STATE', 'Executing local resource teardown (preserving server session)');
    isStartedRef.current = false;
    isStartingRef.current = false;
    hasHandledOfferRef.current = false;

    if (pollingTimerRef.current) {
      clearInterval(pollingTimerRef.current);
      pollingTimerRef.current = null;
    }
    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
      durationTimerRef.current = null;
    }
    if (disconnectGraceTimerRef.current) {
      clearTimeout(disconnectGraceTimerRef.current);
      disconnectGraceTimerRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

    if (peerConnectionRef.current) {
      try {
        peerConnectionRef.current.close();
      } catch {}
      peerConnectionRef.current = null;
    }

    remoteStreamRef.current = null;
    setLocalStream(null);
    setRemoteStream(null);
    setIsRemoteVideoActive(false);
    setIsRemoteAudioActive(false);
    setIsRemoteAttached(false);
    pendingCandidatesQueueRef.current = [];
    processedMessageIdsRef.current = new Set();
    lastSignalTimestampRef.current = 0;
  }, [log]);

  // Explicit End Call (invoked ONLY on user click)
  const endCall = useCallback(() => {
    log('STATE', 'User explicitly clicked End Consultation');
    isExplicitlyEndedRef.current = true;
    connectedAtRef.current = null;
    setCallDuration(0);
    setConnectionState('ended');

    // Notify backend of explicit leave
    fetch(`${API_BASE_URL}/teleconsultations/${canonicalSessionId}/leave`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, explicit: true, reason: 'user_clicked_end_call' }),
    }).catch(() => {});

    cleanupLocalResources();
  }, [canonicalSessionId, role, cleanupLocalResources, log]);

  // Main startup routine
  const startCall = useCallback(async () => {
    if (isStartedRef.current || isStartingRef.current) {
      log('STATE', 'startCall() ignored — session already active or in-flight');
      return;
    }
    isStartingRef.current = true;
    isExplicitlyEndedRef.current = false;
    sessionStartTimeRef.current = Date.now() - 5000; // Allow 5s clock skew
    hasHandledOfferRef.current = false;
    pcIdRef.current = `pc-${Math.random().toString(36).substring(2, 7)}`;

    log('STATE', `Initiating WebRTC call session [${canonicalSessionId}] as role [${role}]`);
    setConnectionState('requesting_media');
    setErrorMessage(null);

    // 1. Join Presence on Backend
    fetch(`${API_BASE_URL}/teleconsultations/${canonicalSessionId}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, explicit: true }),
    }).catch(() => {});

    // 2. Secure Context & Device Availability Check
    if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      log('MEDIA', 'getUserMedia() unavailable — secure context (HTTPS/localhost) required');
      setConnectionState('failed');
      setErrorMessage('Camera and microphone access requires HTTPS or localhost.');
      isStartingRef.current = false;
      return;
    }

    // 3. Acquire Local Media (Audio + Video with audio-only fallback)
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      log('MEDIA', 'Acquired local audio + video tracks successfully');
      setIsCameraOn(true);
      setIsMicOn(true);
      setLocalTracks({ audio: true, video: true });
    } catch (mediaErr: any) {
      log('MEDIA', 'Video+Audio acquisition failed, attempting audio-only fallback', mediaErr.message);
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: false,
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        });
        log('MEDIA', 'Acquired local audio-only stream');
        setIsCameraOn(false);
        setIsMicOn(true);
        setLocalTracks({ audio: true, video: false });
      } catch (audioErr: any) {
        log('MEDIA', 'Media permissions denied by user or device busy', audioErr.message);
        setConnectionState('failed');
        setErrorMessage('Camera / Microphone permission was denied. Please enable access in browser site settings.');
        isStartingRef.current = false;
        return;
      }
    }

    localStreamRef.current = stream;
    setLocalStream(stream);

    // Attach local stream to preview element immediately if mounted
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
      localVideoRef.current.muted = true;
      localVideoRef.current.play().catch(() => {});
    }

    // 4. Instantiate Singleton RTCPeerConnection with dynamic/verified ICE servers
    const config = await fetchIceConfiguration();
    log('STATE', `Creating RTCPeerConnection (${config.iceServers?.length ?? 0} ICE servers configured)`, {
      servers: config.iceServers?.map((s) => ({ urls: s.urls })),
    });
    const pc = new RTCPeerConnection(config);
    peerConnectionRef.current = pc;

    // Attach local media tracks to peer connection
    stream.getTracks().forEach((track) => {
      pc.addTrack(track, stream);
      log('MEDIA', `Attached local track to RTCPeerConnection: ${track.kind} (${track.id})`);
    });

    // Inbound remote media stream container
    const inboundStream = new MediaStream();
    remoteStreamRef.current = inboundStream;
    setRemoteStream(inboundStream);

    // Handle incoming remote media tracks
    pc.ontrack = (event) => {
      log('MEDIA', `Inbound remote track received: ${event.track.kind} (id=${event.track.id})`);
      inboundStream.addTrack(event.track);

      setRemoteTracks((prev) => ({
        audio: prev.audio || event.track.kind === 'audio',
        video: prev.video || event.track.kind === 'video',
      }));

      if (event.track.kind === 'video') {
        setIsRemoteVideoActive(true);
      }
      if (event.track.kind === 'audio') {
        setIsRemoteAudioActive(true);
      }

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = inboundStream;
        setIsRemoteAttached(true);
        remoteVideoRef.current.play().catch((err) => {
          log('MEDIA', 'Remote video element play deferred:', err.message);
        });
      }
    };

    // ICE Gathering State Change
    pc.onicegatheringstatechange = () => {
      log('ICE', `ICE gathering state transitioned -> ${pc.iceGatheringState}`);
    };

    // ICE Candidate Error Handling (STUN vs TURN failure diagnostics)
    (pc as any).onicecandidateerror = (event: any) => {
      const url = event.url || 'unknown';
      const isTurn = url.startsWith('turn:');
      const isStun = url.startsWith('stun:');
      log(
        'ICE_ERROR',
        `${isTurn ? 'TURN allocate' : isStun ? 'STUN binding' : 'ICE'} failure on ${url} (code=${event.errorCode} text="${event.errorText}")`
      );
    };

    // Candidate gathering handler
    pc.onicecandidate = (event) => {
      if (event.candidate && event.candidate.candidate && event.candidate.candidate.trim() !== '') {
        const typeMatch = event.candidate.candidate.match(/typ\s+(\w+)/);
        const candType = typeMatch ? typeMatch[1] : 'host';
        const protoMatch = event.candidate.candidate.match(/\s(udp|tcp)\s/i);
        const candProto = protoMatch ? protoMatch[1].toLowerCase() : 'udp';

        setCandidateStats((prev) => ({
          ...prev,
          [candType as keyof typeof prev]: (prev[candType as keyof typeof prev] || 0) + 1,
        }));

        log('ICE', `Local ICE candidate gathered: typ=${candType} proto=${candProto}`, {
          sdpMid: event.candidate.sdpMid,
          candidate: event.candidate.candidate.substring(0, 60),
        });

        sendSignalMessage('candidate', event.candidate.toJSON());
      } else {
        log('ICE', `Local ICE gathering complete (gatheringState=${pc.iceGatheringState})`);
      }
    };

    // ICE Connection State Change
    pc.oniceconnectionstatechange = () => {
      const state = pc.iceConnectionState;
      log('ICE', `ICE connection state transitioned -> ${state} (gatheringState=${pc.iceGatheringState})`);
      setIceConnectionState(state);

      if (state === 'checking') {
        log('ICE', 'ICE connectivity checks in-progress across candidate pairs');
      } else if (state === 'connected' || state === 'completed') {
        log('ICE', `ICE connectivity SUCCEEDED (${state}) — active candidate pair nominated`);
        queryCandidatePairStats(pc);
        if (disconnectGraceTimerRef.current) {
          clearTimeout(disconnectGraceTimerRef.current);
          disconnectGraceTimerRef.current = null;
        }
      } else if (state === 'disconnected') {
        log('ICE', 'Transient ICE disconnection — starting 20s recovery grace period');
        if (!disconnectGraceTimerRef.current) {
          disconnectGraceTimerRef.current = setTimeout(() => {
            if (peerConnectionRef.current && peerConnectionRef.current.iceConnectionState === 'disconnected') {
              log('ICE', 'ICE recovery grace period expired — marking connection failed');
              setConnectionState('failed');
              setErrorMessage('Connection timed out. Please click Retry.');
            }
          }, 20000);
        }
      } else if (state === 'failed') {
        log('ICE', 'ICE connectivity checks FAILED — attempting automatic ICE restart');
        setErrorMessage('Media connectivity failed. Attempting ICE restart...');
        attemptIceRestart(pc);
      }
    };

    // Peer Connection State Change (The ONLY authoritative source of P2P connection)
    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;
      log('STATE', `RTCPeerConnection state transitioned -> ${state}`);

      if (state === 'connected') {
        if (disconnectGraceTimerRef.current) {
          clearTimeout(disconnectGraceTimerRef.current);
          disconnectGraceTimerRef.current = null;
        }
        setConnectionState('connected');
        setErrorMessage(null);
        queryCandidatePairStats(pc);

        // Confirm LIVE state to backend
        fetch(`${API_BASE_URL}/teleconsultations/${canonicalSessionId}/live`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role, connected: true }),
        }).catch(() => {});
      } else if (state === 'connecting') {
        setConnectionState('connecting');
      } else if (state === 'failed') {
        log('STATE', 'RTCPeerConnection failed');
        setConnectionState('failed');
        setErrorMessage('Peer connection failed. You can click Retry Connection.');
      } else if (state === 'disconnected') {
        setConnectionState('disconnected');
      }
    };

    pc.onsignalingstatechange = () => {
      log('STATE', `Signaling state transitioned -> ${pc.signalingState}`);
      setSignalingState(pc.signalingState);
    };

    // 5. Patient initiates SDP Offer
    if (role === 'patient') {
      try {
        log('SIGNAL', 'Patient creating initial SDP Offer');
        setConnectionState('signaling');
        const offer = await pc.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
        });
        await pc.setLocalDescription(offer);
        log('SIGNAL', 'Patient set local description (Offer)', { sdp: offer.sdp?.substring(0, 80) });
        await sendSignalMessage('offer', offer);
      } catch (offerErr: any) {
        log('SIGNAL', 'Patient offer generation failed', offerErr.message);
        setConnectionState('failed');
        isStartingRef.current = false;
        return;
      }
    } else {
      setConnectionState('signaling');
      log('SIGNAL', 'Doctor in room — awaiting Patient SDP Offer');
    }

    isStartedRef.current = true;
    isStartingRef.current = false;

    // 6. Start Multi-Tier Signaling Polling Loop
    if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);

    pollingTimerRef.current = setInterval(async () => {
      const currentPC = peerConnectionRef.current;
      if (!currentPC || isExplicitlyEndedRef.current) return;

      // Ensure remote video binding if tracks exist
      if (remoteStreamRef.current && remoteVideoRef.current) {
        const vTracks = remoteStreamRef.current.getVideoTracks();
        const hasLiveVideo = vTracks.some((t) => t.readyState === 'live');
        if (hasLiveVideo && !isRemoteVideoActive) {
          setIsRemoteVideoActive(true);
        }
        if (remoteVideoRef.current.srcObject !== remoteStreamRef.current && inboundStream.getTracks().length > 0) {
          remoteVideoRef.current.srcObject = remoteStreamRef.current;
          setIsRemoteAttached(true);
          remoteVideoRef.current.play().catch(() => {});
        }
      }

      // Continuously verify media flow & candidate pair stats when connection is connected
      if (currentPC && currentPC.connectionState === 'connected') {
        queryCandidatePairStats(currentPC);
      }

      try {
        const since = lastSignalTimestampRef.current;
        const res = await fetch(`${API_BASE_URL}/teleconsultations/${canonicalSessionId}/signal?role=${role}&since=${since}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            let maxProcessedTimestamp = lastSignalTimestampRef.current;

            for (const msg of json.data) {
              // Deduplicate by message ID
              if (processedMessageIdsRef.current.has(msg.id)) continue;
              processedMessageIdsRef.current.add(msg.id);

              // Ignore stale signals from earlier calls
              if (msg.timestamp < sessionStartTimeRef.current) {
                log('SIGNAL', `Discarding stale signal (${msg.type}) from earlier session`, { ts: msg.timestamp });
                continue;
              }

              if (msg.timestamp > maxProcessedTimestamp) {
                maxProcessedTimestamp = msg.timestamp;
              }

              log('SIGNAL', `Inbound signal received: ${msg.type} from ${msg.senderRole} (id=${msg.id})`);

              // Presence notice
              if (msg.type === 'presence') {
                setPeerJoined(true);
              }

              // Doctor receives Offer
              if (msg.type === 'offer' && role === 'doctor') {
                if (hasHandledOfferRef.current && currentPC.signalingState !== 'stable') {
                  log('SIGNAL', 'Doctor already handled an active offer — skipping duplicate');
                  continue;
                }

                try {
                  log('SIGNAL', 'Doctor processing Patient Offer', { signalingState: currentPC.signalingState });
                  if (currentPC.signalingState !== 'stable') {
                    log('SIGNAL', 'Doctor rolling back before applying new offer');
                    await currentPC.setLocalDescription({ type: 'rollback' });
                  }

                  await currentPC.setRemoteDescription(new RTCSessionDescription(msg.payload));
                  log('SIGNAL', 'Doctor remote description set (Offer)');
                  hasHandledOfferRef.current = true;

                  // Flush queued ICE candidates
                  await flushQueuedCandidates(currentPC);

                  const answer = await currentPC.createAnswer();
                  await currentPC.setLocalDescription(answer);
                  log('SIGNAL', 'Doctor set local description (Answer)');
                  await sendSignalMessage('answer', answer);
                  setConnectionState('connecting');
                } catch (offerErr: any) {
                  log('SIGNAL', 'Doctor offer handling error', offerErr.message);
                }
              }
              // Patient receives Answer
              else if (msg.type === 'answer' && role === 'patient') {
                if (currentPC.signalingState === 'have-local-offer') {
                  try {
                    log('SIGNAL', 'Patient processing Doctor Answer');
                    await currentPC.setRemoteDescription(new RTCSessionDescription(msg.payload));
                    log('SIGNAL', 'Patient remote description set (Answer)');

                    // Flush queued ICE candidates
                    await flushQueuedCandidates(currentPC);
                    setConnectionState('connecting');
                  } catch (answerErr: any) {
                    log('SIGNAL', 'Patient answer handling error', answerErr.message);
                  }
                } else {
                  log('SIGNAL', `Patient answer ignored: unexpected signalingState [${currentPC.signalingState}]`);
                }
              }
              // Either peer receives Candidate
              else if (msg.type === 'candidate') {
                if (msg.payload && msg.payload.candidate && msg.payload.candidate.trim() !== '') {
                  const typeMatch = msg.payload.candidate.match(/typ\s+(\w+)/);
                  const candType = typeMatch ? typeMatch[1] : 'unknown';
                  if (currentPC.remoteDescription && currentPC.remoteDescription.type) {
                    try {
                      await currentPC.addIceCandidate(new RTCIceCandidate(msg.payload));
                      log('ICE', `Inbound remote ICE candidate applied: typ=${candType}`, { sdpMid: msg.payload.sdpMid });
                    } catch (candErr: any) {
                      log('ICE', `Inbound candidate application non-fatal error: typ=${candType}`, candErr.message);
                    }
                  } else {
                    log('ICE', `Inbound remote ICE candidate queued: typ=${candType} (awaiting remoteDescription)`, { sdpMid: msg.payload.sdpMid });
                    pendingCandidatesQueueRef.current.push(msg.payload);
                  }
                }
              }
              // Peer confirmed LIVE
              else if (msg.type === 'live') {
                log('STATE', 'Remote peer confirmed live P2P status');
              }
              // Peer left (ONLY if explicit)
              else if (msg.type === 'leave') {
                if (msg.payload && msg.payload.explicit === true) {
                  log('STATE', 'Remote peer explicitly ended consultation');
                  setConnectionState('ended');
                  cleanupLocalResources();
                } else {
                  log('SIGNAL', 'Ignored implicit/stale leave signal');
                }
              }
            }

            // Advance cursor strictly to highest processed signal timestamp
            if (maxProcessedTimestamp > lastSignalTimestampRef.current) {
              lastSignalTimestampRef.current = maxProcessedTimestamp;
            }
          }
        }
      } catch (pollErr: any) {
        // Polling network warning
      }
    }, 1000);
  }, [canonicalSessionId, role, sendSignalMessage, flushQueuedCandidates, isRemoteVideoActive, cleanupLocalResources, log]);

  const retryConnection = useCallback(async () => {
    log('STATE', 'User requested connection retry');
    cleanupLocalResources();
    setTimeout(() => {
      startCall();
    }, 600);
  }, [cleanupLocalResources, startCall, log]);

  const toggleCamera = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOn(videoTrack.enabled);
        log('MEDIA', `Camera toggled -> ${videoTrack.enabled}`);
      }
    }
  }, [log]);

  const toggleMic = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicOn(audioTrack.enabled);
        log('MEDIA', `Microphone toggled -> ${audioTrack.enabled}`);
      }
    }
  }, [log]);

  const toggleLowBandwidth = useCallback(() => {
    setIsLowBandwidthMode((prev) => {
      const next = !prev;
      log('MEDIA', `2G low-bandwidth mode toggled -> ${next}`);
      if (localStreamRef.current) {
        const videoTrack = localStreamRef.current.getVideoTracks()[0];
        if (videoTrack) {
          videoTrack.enabled = !next;
          setIsCameraOn(!next);
        }
      }
      return next;
    });
  }, [log]);

  // STABLE MOUNT LIFECYCLE: Never re-triggers on render or state changes
  const startCallRef = useRef(startCall);
  startCallRef.current = startCall;
  const cleanupRef = useRef(cleanupLocalResources);
  cleanupRef.current = cleanupLocalResources;

  useEffect(() => {
    if (autoStart) {
      startCallRef.current();
    }
    return () => {
      cleanupRef.current();
    };
  }, [autoStart]);

  return {
    connectionState,
    iceConnectionState,
    signalingState,
    localStream,
    remoteStream,
    localVideoRef,
    remoteVideoRef,
    isCameraOn,
    isMicOn,
    isRemoteVideoActive,
    isRemoteAudioActive,
    isLowBandwidthMode,
    callDuration,
    errorMessage,
    localTracks,
    remoteTracks,
    isRemoteAttached,
    peerJoined,
    candidateStats,
    candidatePairStats,
    toggleCamera,
    toggleMic,
    toggleLowBandwidth,
    endCall,
    startCall,
    retryConnection,
  };
}

