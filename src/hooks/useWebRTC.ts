// HealthSure — Real WebRTC Peer-to-Peer Teleconsultation Hook
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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
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

  // Send signal message to backend mailbox
  const sendSignalMessage = useCallback(
    async (type: string, payload: any) => {
      try {
        await fetch(`${API_BASE_URL}/teleconsultations/${sessionId}/signal`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ senderRole: role, type, payload }),
        });
      } catch (e) {
        console.warn('[WebRTC] Signaling send error:', e);
      }
    },
    [sessionId, role]
  );

  // Stop all media tracks and tear down peer connection
  const endCall = useCallback(async () => {
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

    try {
      await fetch(`${API_BASE_URL}/teleconsultations/${sessionId}/signal`, { method: 'DELETE' });
    } catch {
      // Ignore
    }
  }, [sessionId]);

  // Main startup routine
  const startCall = useCallback(async () => {
    if (isStartedRef.current) return;
    isStartedRef.current = true;

    setConnectionState('requesting_media');
    setErrorMessage(null);

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: { echoCancellation: true, noiseSuppression: true },
      });
    } catch {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: false,
          audio: { echoCancellation: true, noiseSuppression: true },
        });
        setIsCameraOn(false);
      } catch (err: any) {
        setConnectionState('failed');
        setErrorMessage(
          'Microphone / Camera access was denied. Please allow microphone permissions in site settings.'
        );
        return;
      }
    }

    localStreamRef.current = stream;
    setLocalStream(stream);

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
      localVideoRef.current.play().catch(() => {});
    }

    const pc = new RTCPeerConnection(RTC_CONFIG);
    peerConnectionRef.current = pc;

    stream.getTracks().forEach((track) => {
      pc.addTrack(track, stream);
    });

    const inboundStream = new MediaStream();
    setRemoteStream(inboundStream);

    pc.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        inboundStream.addTrack(track);
        if (track.kind === 'video') setIsRemoteVideoActive(true);
        if (track.kind === 'audio') setIsRemoteAudioActive(true);
      });

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = inboundStream;
        remoteVideoRef.current.play().catch(() => {});
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignalMessage('candidate', event.candidate);
      }
    };

    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;
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

    setConnectionState('signaling');

    if (role === 'patient') {
      try {
        const offer = await pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true });
        await pc.setLocalDescription(offer);
        await sendSignalMessage('offer', offer);
      } catch (e) {
        console.warn('[WebRTC] Patient Offer creation failed:', e);
      }
    }

    pollingTimerRef.current = setInterval(async () => {
      if (!peerConnectionRef.current) return;
      try {
        const res = await fetch(
          `${API_BASE_URL}/teleconsultations/${sessionId}/signal?role=${role}&since=${lastProcessedSignalTimeRef.current}`
        );
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            for (const msg of json.data) {
              lastProcessedSignalTimeRef.current = Math.max(
                lastProcessedSignalTimeRef.current,
                msg.timestamp
              );

              if (msg.type === 'offer' && role === 'doctor') {
                await pc.setRemoteDescription(new RTCSessionDescription(msg.payload));
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                await sendSignalMessage('answer', answer);
                setConnectionState('connecting');
              } else if (msg.type === 'answer' && role === 'patient') {
                if (pc.signalingState === 'have-local-offer') {
                  await pc.setRemoteDescription(new RTCSessionDescription(msg.payload));
                  setConnectionState('connecting');
                }
              } else if (msg.type === 'candidate') {
                try {
                  await pc.addIceCandidate(new RTCIceCandidate(msg.payload));
                } catch {
                  // Ignore candidate mismatch
                }
              }
            }
          }
        }
      } catch {
        // Polling network issue
      }
    }, 1000);
  }, [sessionId, role, sendSignalMessage]);

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
