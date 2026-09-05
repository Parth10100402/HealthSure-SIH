// HealthSure — Production WebRTC Engine with Explicit End-Call Lifecycle & Multi-Tier Signaling
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
  toggleCamera: () => void;
  toggleMic: () => void;
  toggleLowBandwidth: () => void;
  endCall: () => void;
  startCall: () => Promise<void>;
  retryConnection: () => Promise<void>;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Dynamic ICE Server Configuration with Google STUN + OpenRelay TURN fallback + custom env
function getIceServers(): RTCConfiguration {
  const iceServers: RTCIceServer[] = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
    { urls: 'stun:stun.cloudflare.com:3478' },
    // Public OpenRelay TURN fallback for Carrier-Grade Symmetric NAT (Cellular / 4G / 5G)
    {
      urls: [
        'turn:openrelay.metered.ca:80',
        'turn:openrelay.metered.ca:443',
        'turn:openrelay.metered.ca:443?transport=tcp',
        'turns:openrelay.metered.ca:443?transport=tcp',
      ],
      username: 'openrelay',
      credential: 'openrelay',
    },
  ];

  const customTurnUrl = import.meta.env.VITE_TURN_URL;
  const customTurnUsername = import.meta.env.VITE_TURN_USERNAME;
  const customTurnCredential = import.meta.env.VITE_TURN_CREDENTIAL;

  if (customTurnUrl) {
    iceServers.unshift({
      urls: customTurnUrl,
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
  const isStartedRef = useRef<boolean>(false);
  const isStartingRef = useRef<boolean>(false);
  const isExplicitlyEndedRef = useRef<boolean>(false);

  // Pending ICE candidates queue (buffered until remoteDescription is set)
  const pendingCandidatesQueueRef = useRef<RTCIceCandidateInit[]>([]);
  const processedMessageIdsRef = useRef<Set<string>>(new Set());
  const lastSignalTimestampRef = useRef<number>(0);

  const log = useCallback(
    (action: string, detail: any = '') => {
      const now = new Date().toISOString().substring(11, 23);
      console.log(`[${now}][${role.toUpperCase()}][${canonicalSessionId}][${pcIdRef.current}] ${action}`, detail);
    },
    [role, canonicalSessionId]
  );

  // 1. Drift-Free Call Duration Timer (Starts strictly on connection)
  useEffect(() => {
    const isConnected = connectionState === 'connected' || iceConnectionState === 'connected' || iceConnectionState === 'completed';

    if (isConnected) {
      if (!connectedAtRef.current) {
        connectedAtRef.current = Date.now();
        log('CALL_TIMER_STARTED', { connectedAt: connectedAtRef.current });
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
  }, [connectionState, iceConnectionState, log]);

  // 2. Persistent Remote Video Element Attachment
  useEffect(() => {
    const videoEl = remoteVideoRef.current;
    const stream = remoteStreamRef.current;

    if (videoEl && stream) {
      if (videoEl.srcObject !== stream) {
        log('ATTACH_REMOTE_STREAM_TO_VIDEO_ELEMENT', { trackCount: stream.getTracks().length });
        videoEl.srcObject = stream;
        setIsRemoteAttached(true);
      }
      videoEl
        .play()
        .then(() => {
          log('VIDEO_PLAY_SUCCESS');
        })
        .catch((err) => {
          log('VIDEO_PLAY_WAITING_OR_AUTOPLAY', err.message);
        });
    }
  }, [remoteStream, isRemoteVideoActive, connectionState, log]);

  // Send signal message to backend mailbox
  const sendSignalMessage = useCallback(
    async (type: string, payload: any) => {
      try {
        log(`SIGNAL_DISPATCH -> ${type}`);
        await fetch(`${API_BASE_URL}/teleconsultations/${canonicalSessionId}/signal`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ senderRole: role, type, payload }),
        });
      } catch (e) {
        log(`SIGNAL_SEND_ERROR -> ${type}`, e);
      }
    },
    [canonicalSessionId, role, log]
  );

  // Helper to flush queued ICE candidates once remote description exists
  const flushQueuedCandidates = useCallback(
    async (pc: RTCPeerConnection) => {
      const queue = pendingCandidatesQueueRef.current;
      if (queue.length === 0) return;
      log(`FLUSH_ICE_QUEUE (${queue.length} items)`);
      while (queue.length > 0) {
        const candidate = queue.shift();
        if (candidate && candidate.candidate) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
            log('CANDIDATE_APPLIED_FROM_QUEUE', { sdpMid: candidate.sdpMid });
          } catch (e) {
            log('QUEUE_CANDIDATE_ERROR', e);
          }
        }
      }
    },
    [log]
  );

  // Teardown local media, timers, and peer connection WITHOUT sending /leave to backend
  const cleanupLocalResources = useCallback(() => {
    log('CLEANUP_LOCAL_RESOURCES');
    isStartedRef.current = false;
    isStartingRef.current = false;

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
      peerConnectionRef.current.close();
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
    log('EXPLICIT_END_CALL_INVOKED_BY_USER');
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
      log('START_CALL_SKIPPED (Already started or in-flight)');
      return;
    }
    isStartingRef.current = true;
    isExplicitlyEndedRef.current = false;
    pcIdRef.current = `pc-${Math.random().toString(36).substring(2, 7)}`;

    log('START_CALL_INITIATED');
    setConnectionState('requesting_media');
    setErrorMessage(null);

    // 1. Join Presence on Backend
    fetch(`${API_BASE_URL}/teleconsultations/${canonicalSessionId}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, explicit: true }),
    }).catch(() => {});

    // 2. Secure Context Check
    if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      log('GET_USER_MEDIA_UNAVAILABLE (Insecure Context / HTTPS required)');
      setConnectionState('failed');
      setErrorMessage('Camera and microphone require HTTPS or localhost.');
      isStartingRef.current = false;
      return;
    }

    // 3. Request Camera + Mic Media Stream
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      log('GET_USER_MEDIA_SUCCESS (Audio + Video)');
      setIsCameraOn(true);
      setIsMicOn(true);
      setLocalTracks({ audio: true, video: true });
    } catch (mediaErr: any) {
      log('GET_USER_MEDIA_VIDEO_AUDIO_FAILED, retrying audio only...', mediaErr.message);
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: false,
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        });
        log('GET_USER_MEDIA_SUCCESS (Audio Only)');
        setIsCameraOn(false);
        setIsMicOn(true);
        setLocalTracks({ audio: true, video: false });
      } catch (audioErr: any) {
        log('GET_USER_MEDIA_FATAL_DENIED', audioErr.message);
        setConnectionState('failed');
        setErrorMessage('Microphone / Camera access was denied. Please allow permissions in browser site settings.');
        isStartingRef.current = false;
        return;
      }
    }

    localStreamRef.current = stream;
    setLocalStream(stream);

    // Attach local stream to preview element
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
      localVideoRef.current.muted = true;
    }

    // 4. Instantiate WebRTC Peer Connection
    const config = getIceServers();
    log('INSTANTIATING_PEER_CONNECTION', { iceServerCount: config.iceServers?.length });
    const pc = new RTCPeerConnection(config);
    peerConnectionRef.current = pc;

    // Attach local media tracks
    stream.getTracks().forEach((track) => {
      pc.addTrack(track, stream);
      log(`LOCAL_TRACK_ADDED -> ${track.kind}`);
    });

    // Create remote media stream container
    const inboundStream = new MediaStream();
    remoteStreamRef.current = inboundStream;
    setRemoteStream(inboundStream);

    // Handle inbound remote media tracks
    pc.ontrack = (event) => {
      log(`ONTRACK_RECEIVED -> ${event.track.kind}`, { id: event.track.id });
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
        remoteVideoRef.current.play().catch(() => {});
      }
    };

    // Candidate gathering handler
    pc.onicecandidate = (event) => {
      if (event.candidate && event.candidate.candidate) {
        const typeMatch = event.candidate.candidate.match(/typ\s+(\w+)/);
        const candType = typeMatch ? typeMatch[1] : 'host';

        setCandidateStats((prev) => ({
          ...prev,
          [candType as keyof typeof prev]: (prev[candType as keyof typeof prev] || 0) + 1,
        }));

        log(`ICE_CANDIDATE_GATHERED (typ=${candType})`, {
          sdpMid: event.candidate.sdpMid,
          candidate: event.candidate.candidate.substring(0, 60),
        });

        sendSignalMessage('candidate', event.candidate.toJSON());
      } else {
        log('ICE_GATHERING_COMPLETED_OR_NULL');
      }
    };

    // ICE Connection State Change
    pc.oniceconnectionstatechange = () => {
      const state = pc.iceConnectionState;
      log(`ICE_CONNECTION_STATE_CHANGE -> ${state}`);
      setIceConnectionState(state);

      if (state === 'connected' || state === 'completed') {
        if (disconnectGraceTimerRef.current) {
          clearTimeout(disconnectGraceTimerRef.current);
          disconnectGraceTimerRef.current = null;
        }
        setConnectionState('connected');

        // Notify backend of confirmed LIVE state
        fetch(`${API_BASE_URL}/teleconsultations/${canonicalSessionId}/live`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role, connected: true }),
        }).catch(() => {});
      } else if (state === 'disconnected') {
        log('ICE_TRANSIENT_DISCONNECTED (Starting 20s grace period)');
        if (!disconnectGraceTimerRef.current) {
          disconnectGraceTimerRef.current = setTimeout(() => {
            if (peerConnectionRef.current && peerConnectionRef.current.iceConnectionState === 'disconnected') {
              log('ICE_DISCONNECT_GRACE_EXPIRED -> FAILED');
              setConnectionState('failed');
            }
          }, 20000);
        }
      }
    };

    // Peer Connection State Change
    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;
      log(`PC_CONNECTION_STATE_CHANGE -> ${state}`);

      if (state === 'connected') {
        if (disconnectGraceTimerRef.current) {
          clearTimeout(disconnectGraceTimerRef.current);
          disconnectGraceTimerRef.current = null;
        }
        setConnectionState('connected');

        // Atomically transition backend to LIVE
        fetch(`${API_BASE_URL}/teleconsultations/${canonicalSessionId}/live`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role, connected: true }),
        }).catch(() => {});
      } else if (state === 'connecting') {
        setConnectionState('connecting');
      } else if (state === 'failed') {
        log('PC_CONNECTION_STATE_FAILED');
        setConnectionState('failed');
      }
    };

    pc.onsignalingstatechange = () => {
      log(`SIGNALING_STATE_CHANGE -> ${pc.signalingState}`);
      setSignalingState(pc.signalingState);
    };

    // 5. Patient initiates SDP Offer
    if (role === 'patient') {
      try {
        log('PATIENT_CREATING_OFFER');
        setConnectionState('signaling');
        const offer = await pc.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
        });
        await pc.setLocalDescription(offer);
        log('PATIENT_LOCAL_DESCRIPTION_SET (Offer)');
        await sendSignalMessage('offer', offer);
      } catch (offerErr) {
        log('PATIENT_OFFER_CREATION_FAILED', offerErr);
        setConnectionState('failed');
        isStartingRef.current = false;
        return;
      }
    } else {
      setConnectionState('signaling');
      log('DOCTOR_WAITING_FOR_OFFER');
    }

    isStartedRef.current = true;
    isStartingRef.current = false;

    // 6. Start Multi-Tier Signaling Polling Loop
    if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);

    pollingTimerRef.current = setInterval(async () => {
      const currentPC = peerConnectionRef.current;
      if (!currentPC || isExplicitlyEndedRef.current) return;

      // Periodic check to ensure remote video attachment
      if (remoteStreamRef.current && remoteVideoRef.current) {
        const vTracks = remoteStreamRef.current.getVideoTracks();
        const hasLiveVideo = vTracks.some((t) => t.readyState === 'live');
        if (hasLiveVideo && !isRemoteVideoActive) {
          setIsRemoteVideoActive(true);
        }
        if (remoteVideoRef.current.srcObject !== remoteStreamRef.current) {
          remoteVideoRef.current.srcObject = remoteStreamRef.current;
          setIsRemoteAttached(true);
          remoteVideoRef.current.play().catch(() => {});
        }
      }

      try {
        const since = lastSignalTimestampRef.current;
        const res = await fetch(`${API_BASE_URL}/teleconsultations/${canonicalSessionId}/signal?role=${role}&since=${since}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            for (const msg of json.data) {
              if (processedMessageIdsRef.current.has(msg.id)) continue;
              processedMessageIdsRef.current.add(msg.id);

              log(`SIGNAL_RECEIVED -> ${msg.type} from ${msg.senderRole} (id=${msg.id})`);

              // Peer presence
              if (msg.type === 'presence') {
                setPeerJoined(true);
              }

              // Doctor receives Offer
              if (msg.type === 'offer' && role === 'doctor') {
                try {
                  log('DOCTOR_PROCESSING_OFFER', { signalingState: currentPC.signalingState });
                  if (currentPC.signalingState !== 'stable') {
                    log('DOCTOR_ROLLBACK_BEFORE_OFFER');
                    await currentPC.setRemoteDescription(new RTCSessionDescription(msg.payload));
                  } else {
                    await currentPC.setRemoteDescription(new RTCSessionDescription(msg.payload));
                  }
                  log('DOCTOR_REMOTE_DESCRIPTION_SET (Offer)');

                  // Flush queued candidates
                  await flushQueuedCandidates(currentPC);

                  const answer = await currentPC.createAnswer();
                  await currentPC.setLocalDescription(answer);
                  log('DOCTOR_LOCAL_DESCRIPTION_SET (Answer)');
                  await sendSignalMessage('answer', answer);
                  setConnectionState('connecting');
                } catch (offerErr) {
                  log('DOCTOR_OFFER_HANDLING_ERROR', offerErr);
                }
              }
              // Patient receives Answer
              else if (msg.type === 'answer' && role === 'patient') {
                if (currentPC.signalingState === 'have-local-offer') {
                  try {
                    log('PATIENT_PROCESSING_ANSWER');
                    await currentPC.setRemoteDescription(new RTCSessionDescription(msg.payload));
                    log('PATIENT_REMOTE_DESCRIPTION_SET (Answer)');

                    // Flush queued candidates
                    await flushQueuedCandidates(currentPC);
                    setConnectionState('connecting');
                  } catch (answerErr) {
                    log('PATIENT_ANSWER_HANDLING_ERROR', answerErr);
                  }
                } else {
                  log('PATIENT_ANSWER_IGNORED (signalingState is not have-local-offer)', currentPC.signalingState);
                }
              }
              // Either party receives Candidate
              else if (msg.type === 'candidate') {
                if (msg.payload && (msg.payload.candidate || msg.payload.sdpMid !== undefined)) {
                  if (currentPC.remoteDescription && currentPC.remoteDescription.type) {
                    try {
                      await currentPC.addIceCandidate(new RTCIceCandidate(msg.payload));
                      log('ICE_CANDIDATE_APPLIED_IMMEDIATELY', { sdpMid: msg.payload.sdpMid });
                    } catch (candErr) {
                      log('ICE_CANDIDATE_IMMEDIATE_ERROR', candErr);
                    }
                  } else {
                    log('ICE_CANDIDATE_QUEUED (Waiting for remoteDescription)', { sdpMid: msg.payload.sdpMid });
                    pendingCandidatesQueueRef.current.push(msg.payload);
                  }
                }
              }
              // Peer confirmed LIVE
              else if (msg.type === 'live') {
                log('REMOTE_PEER_CONFIRMED_LIVE');
              }
              // Peer left (ONLY if explicit)
              else if (msg.type === 'leave') {
                if (msg.payload && msg.payload.explicit === true) {
                  log('PEER_EXPLICITLY_ENDED_CALL');
                  setConnectionState('ended');
                  cleanupLocalResources();
                } else {
                  log('IGNORED_STALE_OR_IMPLICIT_LEAVE_SIGNAL', msg.payload);
                }
              }
            }
            // Advance the since cursor to avoid re-fetching processed signals
            if (json.timestamp && json.timestamp > lastSignalTimestampRef.current) {
              lastSignalTimestampRef.current = json.timestamp;
            }
          }
        }
      } catch (pollErr) {
        // Polling network warning
      }
    }, 1000);
  }, [canonicalSessionId, role, sendSignalMessage, flushQueuedCandidates, isRemoteVideoActive, cleanupLocalResources, log]);

  const retryConnection = useCallback(async () => {
    log('RETRY_CONNECTION_REQUESTED');
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
        log(`TOGGLE_CAMERA -> ${videoTrack.enabled}`);
      }
    }
  }, [log]);

  const toggleMic = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicOn(audioTrack.enabled);
        log(`TOGGLE_MIC -> ${audioTrack.enabled}`);
      }
    }
  }, [log]);

  const toggleLowBandwidth = useCallback(() => {
    setIsLowBandwidthMode((prev) => {
      const next = !prev;
      log(`TOGGLE_LOW_BANDWIDTH -> ${next}`);
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

  // React Lifecycle: Start on autoStart, Clean up local resources on unmount (WITHOUT /leave)
  useEffect(() => {
    if (autoStart) {
      startCall();
    }
    return () => {
      // Clean up local hardware & sockets ONLY, do NOT send /leave to backend on unmount
      cleanupLocalResources();
    };
  }, [autoStart, startCall, cleanupLocalResources]);

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
    toggleCamera,
    toggleMic,
    toggleLowBandwidth,
    endCall,
    startCall,
    retryConnection,
  };
}
