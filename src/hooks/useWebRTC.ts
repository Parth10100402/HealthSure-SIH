// HealthSure — Rebuilt Production WebRTC Hook
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
  toggleCamera: () => void;
  toggleMic: () => void;
  toggleLowBandwidth: () => void;
  endCall: () => void;
  startCall: () => Promise<void>;
  retryConnection: () => Promise<void>;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Dynamic ICE Server Configuration (STUN + TURN fallback)
function getIceServers(): RTCConfiguration {
  const iceServers: RTCIceServer[] = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
    { urls: 'stun:stun.cloudflare.com:3478' },
    { urls: 'stun:global.stun.twilio.com:3478' },
  ];

  const turnUrl = import.meta.env.VITE_TURN_URL;
  const turnUsername = import.meta.env.VITE_TURN_USERNAME;
  const turnCredential = import.meta.env.VITE_TURN_CREDENTIAL;

  if (turnUrl) {
    console.log('[WebRTC] Configuring custom TURN relay server');
    iceServers.push({
      urls: turnUrl,
      username: turnUsername || undefined,
      credential: turnCredential || undefined,
    });
  }

  return { iceServers, iceCandidatePoolSize: 10 };
}

export function useWebRTC({ sessionId, role, autoStart = false }: UseWebRTCOptions): UseWebRTCResult {
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

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);

  const pollingTimerRef = useRef<any>(null);
  const durationTimerRef = useRef<any>(null);
  const connectedAtRef = useRef<number | null>(null);
  const lastProcessedSignalTimeRef = useRef<number>(0);
  const isStartedRef = useRef<boolean>(false);

  // Pending ICE candidates queue (buffered until remoteDescription is set)
  const pendingCandidatesQueueRef = useRef<RTCIceCandidateInit[]>([]);
  const processedMessageIdsRef = useRef<Set<string>>(new Set());

  // 1. Drift-Free Call Duration Timer
  useEffect(() => {
    const isConnected = connectionState === 'connected' || iceConnectionState === 'connected' || iceConnectionState === 'completed';

    if (isConnected) {
      if (!connectedAtRef.current) {
        connectedAtRef.current = Date.now();
        console.log(`[WebRTC - ${role} - ${sessionId}] P2P Connection Live. Timestamp timer started.`);
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
  }, [connectionState, iceConnectionState, role, sessionId]);

  // 2. Persistent Remote Video Element Attachment
  useEffect(() => {
    const videoEl = remoteVideoRef.current;
    const stream = remoteStreamRef.current;

    if (videoEl && stream) {
      if (videoEl.srcObject !== stream) {
        console.log(`[WebRTC - ${role} - ${sessionId}] [Effect] Attaching remote MediaStream to video element`);
        videoEl.srcObject = stream;
        setIsRemoteAttached(true);
      }
      videoEl.play().catch(() => {
        // Auto-play policy warning
      });
    }
  }, [remoteStream, isRemoteVideoActive, connectionState, role, sessionId]);

  // Send signal message to backend mailbox
  const sendSignalMessage = useCallback(
    async (type: string, payload: any) => {
      try {
        console.log(`[WebRTC - ${role} - ${sessionId}] SIGNAL_SENT -> ${type}`);
        await fetch(`${API_BASE_URL}/teleconsultations/${sessionId}/signal`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ senderRole: role, type, payload }),
        });
      } catch (e) {
        console.warn(`[WebRTC - ${role} - ${sessionId}] Signaling send error:`, e);
      }
    },
    [sessionId, role]
  );

  // Helper to flush queued ICE candidates once remote description exists
  const flushQueuedCandidates = useCallback(
    async (pc: RTCPeerConnection) => {
      const queue = pendingCandidatesQueueRef.current;
      if (queue.length === 0) return;
      console.log(`[WebRTC - ${role} - ${sessionId}] Flushing ${queue.length} queued ICE candidate(s)`);
      while (queue.length > 0) {
        const candidate = queue.shift();
        if (candidate) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
            console.log(`[WebRTC - ${role} - ${sessionId}] ICE_CANDIDATE_ADDED (from queue)`);
          } catch (e) {
            console.warn(`[WebRTC - ${role} - ${sessionId}] Failed to apply queued candidate:`, e);
          }
        }
      }
    },
    [role, sessionId]
  );

  // Stop all media tracks and tear down peer connection
  const endCall = useCallback(() => {
    console.log(`[WebRTC - ${role} - ${sessionId}] Ending teleconsultation session`);
    isStartedRef.current = false;
    connectedAtRef.current = null;

    if (pollingTimerRef.current) {
      clearInterval(pollingTimerRef.current);
      pollingTimerRef.current = null;
    }
    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
      durationTimerRef.current = null;
    }

    // Inform backend
    fetch(`${API_BASE_URL}/teleconsultations/${sessionId}/leave`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    }).catch(() => {});

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
    setConnectionState('ended');
    setIsRemoteVideoActive(false);
    setIsRemoteAudioActive(false);
    setIsRemoteAttached(false);
    setCallDuration(0);
    pendingCandidatesQueueRef.current = [];
  }, [sessionId, role]);

  // Main startup routine
  const startCall = useCallback(async () => {
    if (isStartedRef.current) return;
    isStartedRef.current = true;

    console.log(`[WebRTC - ${role} - ${sessionId}] Starting call session`);
    setConnectionState('requesting_media');
    setErrorMessage(null);

    // 1. Join Presence on Backend
    fetch(`${API_BASE_URL}/teleconsultations/${sessionId}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    }).catch(() => {});

    // 2. Secure Context Check for Mobile / Remote Browsers
    if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error(`[WebRTC - ${role} - ${sessionId}] navigator.mediaDevices is unavailable (Insecure Context or unsupported)`);
      setConnectionState('failed');
      setErrorMessage('Camera and microphone require HTTPS or localhost.');
      isStartedRef.current = false;
      return;
    }

    // 3. Request Camera + Mic Media Stream
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      setIsCameraOn(true);
      setIsMicOn(true);
      setLocalTracks({ audio: true, video: true });
    } catch (mediaErr: any) {
      console.warn(`[WebRTC - ${role} - ${sessionId}] Video+Audio getUserMedia failed, retrying audio only...`, mediaErr);
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: false,
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        });
        setIsCameraOn(false);
        setIsMicOn(true);
        setLocalTracks({ audio: true, video: false });
      } catch (audioErr: any) {
        console.error(`[WebRTC - ${role} - ${sessionId}] Microphone / Camera permission denied:`, audioErr);
        setConnectionState('failed');
        setErrorMessage('Microphone / Camera access was denied. Please allow permissions in browser site settings.');
        isStartedRef.current = false;
        return;
      }
    }

    localStreamRef.current = stream;
    setLocalStream(stream);

    // Attach local stream to preview element
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
      localVideoRef.current.play().catch(() => {});
    }

    // 4. Create Inbound Remote Stream container
    const inboundStream = new MediaStream();
    remoteStreamRef.current = inboundStream;
    setRemoteStream(inboundStream);

    // 5. Create RTCPeerConnection with STUN + TURN config
    const rtcConfig = getIceServers();
    const pc = new RTCPeerConnection(rtcConfig);
    peerConnectionRef.current = pc;

    // Add local tracks to peer connection
    stream.getTracks().forEach((track) => {
      pc.addTrack(track, stream);
      console.log(`[WebRTC - ${role} - ${sessionId}] Local track added: ${track.kind}`);
    });

    // 6. Handle incoming remote media tracks (ontrack)
    pc.ontrack = (event) => {
      console.log(`[WebRTC - ${role} - ${sessionId}] ontrack fired: ${event.track?.kind} (${event.track?.readyState})`);
      const track = event.track;
      if (track) {
        if (!inboundStream.getTracks().some((t) => t.id === track.id)) {
          inboundStream.addTrack(track);
          console.log(`[WebRTC - ${role} - ${sessionId}] Remote track registered: ${track.kind}`);
        }

        if (track.kind === 'video') {
          setIsRemoteVideoActive(true);
          setRemoteTracks((prev) => ({ ...prev, video: true }));
        }
        if (track.kind === 'audio') {
          setIsRemoteAudioActive(true);
          setRemoteTracks((prev) => ({ ...prev, audio: true }));
        }

        track.onunmute = () => {
          console.log(`[WebRTC - ${role} - ${sessionId}] Track unmuted: ${track.kind}`);
          if (track.kind === 'video') {
            setIsRemoteVideoActive(true);
            setRemoteTracks((prev) => ({ ...prev, video: true }));
          }
          if (track.kind === 'audio') {
            setIsRemoteAudioActive(true);
            setRemoteTracks((prev) => ({ ...prev, audio: true }));
          }
        };
      }

      // Attach immediately to video element
      if (remoteVideoRef.current) {
        if (remoteVideoRef.current.srcObject !== inboundStream) {
          remoteVideoRef.current.srcObject = inboundStream;
          setIsRemoteAttached(true);
        }
        remoteVideoRef.current.play().catch(() => {});
      }
    };

    // 7. ICE Candidate Gathering
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log(`[WebRTC - ${role} - ${sessionId}] Local ICE candidate -> ${event.candidate.type || 'candidate'}`);
        sendSignalMessage('candidate', event.candidate);
      }
    };

    // 8. Monitor Connection States
    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;
      console.log(`[WebRTC - ${role} - ${sessionId}] PEER_CONNECTION_STATE -> ${state}`);
      if (state === 'connected') {
        setConnectionState('connected');
      } else if (state === 'connecting') {
        setConnectionState('connecting');
      } else if (state === 'disconnected') {
        setConnectionState('disconnected');
      } else if (state === 'failed') {
        setConnectionState('failed');
      }
    };

    pc.oniceconnectionstatechange = () => {
      const iceState = pc.iceConnectionState;
      setIceConnectionState(iceState);
      console.log(`[WebRTC - ${role} - ${sessionId}] ICE_CONNECTION_STATE -> ${iceState}`);
      if (iceState === 'connected' || iceState === 'completed') {
        setConnectionState('connected');
      } else if (iceState === 'failed') {
        console.warn(`[WebRTC - ${role} - ${sessionId}] ICE Connection Failed`);
      }
    };

    pc.onsignalingstatechange = () => {
      setSignalingState(pc.signalingState);
      console.log(`[WebRTC - ${role} - ${sessionId}] SIGNALING_STATE -> ${pc.signalingState}`);
    };

    setConnectionState('signaling');

    // 9. Deterministic Role Negotiation: Patient = Offerer
    if (role === 'patient') {
      try {
        console.log(`[WebRTC - ${role} - ${sessionId}] Patient creating SDP Offer...`);
        const offer = await pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true });
        await pc.setLocalDescription(offer);
        console.log(`[WebRTC - ${role} - ${sessionId}] OFFER_CREATED and dispatched`);
        await sendSignalMessage('offer', offer);
      } catch (e) {
        console.error(`[WebRTC - ${role} - ${sessionId}] Patient Offer creation failed:`, e);
      }
    }

    // 10. Multi-Tier Signaling Polling Loop
    pollingTimerRef.current = setInterval(async () => {
      if (!peerConnectionRef.current) return;
      const currentPC = peerConnectionRef.current;

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
        const res = await fetch(
          `${API_BASE_URL}/teleconsultations/${sessionId}/signal?role=${role}&since=${lastProcessedSignalTimeRef.current}`
        );
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            for (const msg of json.data) {
              if (processedMessageIdsRef.current.has(msg.id)) continue;
              processedMessageIdsRef.current.add(msg.id);

              lastProcessedSignalTimeRef.current = Math.max(
                lastProcessedSignalTimeRef.current,
                msg.timestamp
              );

              console.log(`[WebRTC - ${role} - ${sessionId}] SIGNAL_RECEIVED -> ${msg.type} from ${msg.senderRole}`);

              // Peer presence
              if (msg.type === 'presence') {
                setPeerJoined(true);
              }

              // Doctor receives Offer
              if (msg.type === 'offer' && role === 'doctor') {
                try {
                  console.log(`[WebRTC - ${role} - ${sessionId}] Setting remote description (Offer)...`);
                  await currentPC.setRemoteDescription(new RTCSessionDescription(msg.payload));
                  console.log(`[WebRTC - ${role} - ${sessionId}] REMOTE_DESCRIPTION_SET (Offer)`);
                  
                  // Flush any queued ICE candidates
                  await flushQueuedCandidates(currentPC);

                  const answer = await currentPC.createAnswer();
                  await currentPC.setLocalDescription(answer);
                  console.log(`[WebRTC - ${role} - ${sessionId}] ANSWER_CREATED and dispatched`);
                  await sendSignalMessage('answer', answer);
                  setConnectionState('connecting');
                } catch (offerErr) {
                  console.error(`[WebRTC - ${role} - ${sessionId}] Error handling Offer:`, offerErr);
                }
              }
              // Patient receives Answer
              else if (msg.type === 'answer' && role === 'patient') {
                if (currentPC.signalingState === 'have-local-offer') {
                  try {
                    console.log(`[WebRTC - ${role} - ${sessionId}] Setting remote description (Answer)...`);
                    await currentPC.setRemoteDescription(new RTCSessionDescription(msg.payload));
                    console.log(`[WebRTC - ${role} - ${sessionId}] REMOTE_DESCRIPTION_SET (Answer)`);
                    
                    // Flush any queued ICE candidates
                    await flushQueuedCandidates(currentPC);
                    setConnectionState('connecting');
                  } catch (answerErr) {
                    console.error(`[WebRTC - ${role} - ${sessionId}] Error handling Answer:`, answerErr);
                  }
                }
              }
              // Either party receives Candidate
              else if (msg.type === 'candidate') {
                if (currentPC.remoteDescription && currentPC.remoteDescription.type) {
                  try {
                    await currentPC.addIceCandidate(new RTCIceCandidate(msg.payload));
                    console.log(`[WebRTC - ${role} - ${sessionId}] ICE_CANDIDATE_ADDED immediately`);
                  } catch (candErr) {
                    console.warn(`[WebRTC - ${role} - ${sessionId}] Immediate candidate warning:`, candErr);
                  }
                } else {
                  console.log(`[WebRTC - ${role} - ${sessionId}] ICE_CANDIDATE_QUEUED (buffering for remoteDescription)`);
                  pendingCandidatesQueueRef.current.push(msg.payload);
                }
              }
              // Peer left
              else if (msg.type === 'leave') {
                console.log(`[WebRTC - ${role} - ${sessionId}] Peer left the session`);
                setConnectionState('ended');
              }
            }
          }
        }
      } catch (pollErr) {
        // Polling network warning
      }
    }, 1000);
  }, [sessionId, role, sendSignalMessage, flushQueuedCandidates, isRemoteVideoActive]);

  const retryConnection = useCallback(async () => {
    console.log(`[WebRTC - ${role} - ${sessionId}] Retrying connection`);
    endCall();
    setTimeout(() => {
      startCall();
    }, 500);
  }, [endCall, startCall, role, sessionId]);

  const toggleCamera = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOn(videoTrack.enabled);
      }
    }
  }, []);

  const toggleMic = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicOn(audioTrack.enabled);
      }
    }
  }, []);

  const toggleLowBandwidth = useCallback(() => {
    setIsLowBandwidthMode((prev) => {
      const next = !prev;
      if (localStreamRef.current) {
        const videoTrack = localStreamRef.current.getVideoTracks()[0];
        if (videoTrack) {
          videoTrack.enabled = !next;
          setIsCameraOn(!next);
        }
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (autoStart) {
      startCall();
    }
    return () => {
      endCall();
    };
  }, [autoStart, startCall, endCall]);

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
    toggleCamera,
    toggleMic,
    toggleLowBandwidth,
    endCall,
    startCall,
    retryConnection,
  };
}
