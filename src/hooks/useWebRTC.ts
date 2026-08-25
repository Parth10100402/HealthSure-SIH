// HealthSure — Real WebRTC Peer-to-Peer Teleconsultation Hook (Robust & Queued)
// src/hooks/useWebRTC.ts

import { useState, useEffect, useRef, useCallback } from 'react';

export type WebRTCConnectionState =
  | 'idle'
  | 'requesting_media'
  | 'signaling'
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'failed';

export interface UseWebRTCOptions {
  sessionId: string;
  role: 'patient' | 'doctor';
  autoStart?: boolean;
}

export interface UseWebRTCResult {
  connectionState: WebRTCConnectionState;
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
  toggleCamera: () => void;
  toggleMic: () => void;
  toggleLowBandwidth: () => void;
  endCall: () => void;
  startCall: () => Promise<void>;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
  ],
};

export function useWebRTC({ sessionId, role, autoStart = true }: UseWebRTCOptions): UseWebRTCResult {
  const [connectionState, setConnectionState] = useState<WebRTCConnectionState>('idle');
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isCameraOn, setIsCameraOn] = useState<boolean>(true);
  const [isMicOn, setIsMicOn] = useState<boolean>(true);
  const [isRemoteVideoActive, setIsRemoteVideoActive] = useState<boolean>(false);
  const [isRemoteAudioActive, setIsRemoteAudioActive] = useState<boolean>(false);
  const [isLowBandwidthMode, setIsLowBandwidthMode] = useState<boolean>(false);
  const [callDuration, setCallDuration] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const pollingTimerRef = useRef<any>(null);
  const durationTimerRef = useRef<any>(null);
  const lastProcessedSignalTimeRef = useRef<number>(0);
  const isStartedRef = useRef<boolean>(false);
  
  // Pending ICE candidates queue (buffered until remoteDescription is set)
  const pendingCandidatesQueueRef = useRef<RTCIceCandidateInit[]>([]);
  const processedMessageIdsRef = useRef<Set<string>>(new Set());

  // Send signal message to backend mailbox
  const sendSignalMessage = useCallback(
    async (type: string, payload: any) => {
      try {
        console.log(`[WebRTC - ${role} - ${sessionId}] SIGNAL_SENT ->`, type);
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
  const flushQueuedCandidates = useCallback(async (pc: RTCPeerConnection) => {
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
  }, [role, sessionId]);

  // Stop all media tracks and tear down peer connection
  const endCall = useCallback(() => {
    console.log(`[WebRTC - ${role} - ${sessionId}] Ending call session`);
    isStartedRef.current = false;

    if (pollingTimerRef.current) {
      clearInterval(pollingTimerRef.current);
      pollingTimerRef.current = null;
    }
    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
      durationTimerRef.current = null;
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

    setLocalStream(null);
    setRemoteStream(null);
    setConnectionState('disconnected');
    setIsRemoteVideoActive(false);
    setIsRemoteAudioActive(false);
    pendingCandidatesQueueRef.current = [];
  }, [sessionId, role]);

  // Main startup routine
  const startCall = useCallback(async () => {
    if (isStartedRef.current) return;
    isStartedRef.current = true;

    console.log(`[WebRTC - ${role} - ${sessionId}] Initializing teleconsultation peer`);
    setConnectionState('requesting_media');
    setErrorMessage(null);

    // 1. Secure Context Check for Mobile / Remote Browsers
    if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error(`[WebRTC - ${role} - ${sessionId}] navigator.mediaDevices is undefined (Insecure Context or unsupported)`);
      setConnectionState('failed');
      setErrorMessage(
        'Camera and microphone require a secure connection. Please open HealthSure using HTTPS or localhost.'
      );
      isStartedRef.current = false;
      return;
    }

    // 2. Request Camera + Mic Media Stream
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      setIsCameraOn(true);
      setIsMicOn(true);
    } catch (mediaErr: any) {
      console.warn(`[WebRTC - ${role} - ${sessionId}] Video+Audio getUserMedia failed, retrying audio only...`, mediaErr);
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: false,
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        });
        setIsCameraOn(false);
        setIsMicOn(true);
      } catch (audioErr: any) {
        console.error(`[WebRTC - ${role} - ${sessionId}] Microphone / Camera access was denied:`, audioErr);
        setConnectionState('failed');
        setErrorMessage(
          'Microphone / Camera access was denied. Please allow permissions in browser site settings.'
        );
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

    // 3. Create RTCPeerConnection
    const pc = new RTCPeerConnection(RTC_CONFIG);
    peerConnectionRef.current = pc;

    // Add local tracks to peer connection
    stream.getTracks().forEach((track) => {
      pc.addTrack(track, stream);
    });

    // Inbound remote stream container
    const inboundStream = new MediaStream();
    setRemoteStream(inboundStream);

    // 4. Handle incoming remote media tracks
    pc.ontrack = (event) => {
      console.log(`[WebRTC - ${role} - ${sessionId}] TRACK_RECEIVED -> kind:`, event.track.kind);
      event.streams[0].getTracks().forEach((track) => {
        if (!inboundStream.getTracks().some((t) => t.id === track.id)) {
          inboundStream.addTrack(track);
        }
        if (track.kind === 'video') setIsRemoteVideoActive(true);
        if (track.kind === 'audio') setIsRemoteAudioActive(true);
      });

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = inboundStream;
        remoteVideoRef.current.play().catch((err) => {
          console.warn(`[WebRTC - ${role} - ${sessionId}] Remote video autoplay error:`, err);
        });
      }
    };

    // 5. ICE Candidate Gathering
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log(`[WebRTC - ${role} - ${sessionId}] Local ICE candidate generated ->`, event.candidate.type || 'candidate');
        sendSignalMessage('candidate', event.candidate);
      }
    };

    // 6. Monitor Connection States
    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;
      console.log(`[WebRTC - ${role} - ${sessionId}] PEER_CONNECTION_STATE ->`, state);
      if (state === 'connected') {
        setConnectionState('connected');
        if (!durationTimerRef.current) {
          durationTimerRef.current = setInterval(() => setCallDuration((d) => d + 1), 1000);
        }
      } else if (state === 'connecting') {
        setConnectionState('connecting');
      } else if (state === 'disconnected') {
        setConnectionState('disconnected');
      } else if (state === 'failed') {
        setConnectionState('failed');
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log(`[WebRTC - ${role} - ${sessionId}] ICE_CONNECTION_STATE ->`, pc.iceConnectionState);
      if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
        setConnectionState('connected');
      }
    };

    setConnectionState('signaling');

    // 7. Role-Specific Negotiation
    if (role === 'patient') {
      try {
        console.log(`[WebRTC - ${role} - ${sessionId}] Creating SDP Offer...`);
        const offer = await pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true });
        await pc.setLocalDescription(offer);
        console.log(`[WebRTC - ${role} - ${sessionId}] OFFER_CREATED and localDescription set`);
        await sendSignalMessage('offer', offer);
      } catch (e) {
        console.error(`[WebRTC - ${role} - ${sessionId}] Patient Offer creation failed:`, e);
      }
    }

    // 8. Signaling Polling Loop
    pollingTimerRef.current = setInterval(async () => {
      if (!peerConnectionRef.current) return;
      const currentPC = peerConnectionRef.current;

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
                // If remote description is already present, add candidate immediately
                if (currentPC.remoteDescription && currentPC.remoteDescription.type) {
                  try {
                    await currentPC.addIceCandidate(new RTCIceCandidate(msg.payload));
                    console.log(`[WebRTC - ${role} - ${sessionId}] ICE_CANDIDATE_ADDED immediately`);
                  } catch (candErr) {
                    console.warn(`[WebRTC - ${role} - ${sessionId}] Error adding immediate candidate:`, candErr);
                  }
                } else {
                  // Buffer candidate in queue until setRemoteDescription completes
                  console.log(`[WebRTC - ${role} - ${sessionId}] ICE_CANDIDATE_QUEUED (waiting for remoteDescription)`);
                  pendingCandidatesQueueRef.current.push(msg.payload);
                }
              }
            }
          }
        }
      } catch (pollErr) {
        // Polling network issue
      }
    }, 1000);
  }, [sessionId, role, sendSignalMessage, flushQueuedCandidates]);

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
    toggleCamera,
    toggleMic,
    toggleLowBandwidth,
    endCall,
    startCall,
  };
}
