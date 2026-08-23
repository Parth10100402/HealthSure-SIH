// HealthSure — Real MediaDevices Hook for Teleconsultation
// frontend/src/hooks/useMediaDevices.ts

import { useState, useEffect, useRef, useCallback } from 'react';

export type MediaPermissionStatus =
  | 'idle'
  | 'requesting'
  | 'granted'
  | 'denied'
  | 'unsupported'
  | 'error';

export interface UseMediaDevicesResult {
  permissionStatus: MediaPermissionStatus;
  stream: MediaStream | null;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isCameraOn: boolean;
  isMicOn: boolean;
  errorMessage: string | null;
  startMedia: () => Promise<void>;
  toggleCamera: () => void;
  toggleMic: () => void;
  stopMedia: () => void;
}

export function useMediaDevices(autoStart: boolean = true): UseMediaDevicesResult {
  const [permissionStatus, setPermissionStatus] = useState<MediaPermissionStatus>('idle');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraOn, setIsCameraOn] = useState<boolean>(true);
  const [isMicOn, setIsMicOn] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopMedia = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStream(null);
  }, []);

  const startMedia = useCallback(async () => {
    if (!navigator?.mediaDevices?.getUserMedia) {
      setPermissionStatus('unsupported');
      setErrorMessage('Camera and microphone are not supported on this browser or device.');
      return;
    }

    setPermissionStatus('requesting');
    setErrorMessage(null);

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
        audio: true,
      });

      streamRef.current = mediaStream;
      setStream(mediaStream);
      setPermissionStatus('granted');
      setIsCameraOn(true);
      setIsMicOn(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch(() => {
          // Auto-play was prevented; ignore
        });
      }
    } catch (err: unknown) {
      const error = err as Error & { name?: string };
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setPermissionStatus('denied');
        setErrorMessage(
          'Camera / microphone permission was denied. Please allow access in your browser site settings and refresh.'
        );
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        setPermissionStatus('unsupported');
        setErrorMessage('No camera or microphone hardware found on this computer.');
      } else {
        setPermissionStatus('error');
        setErrorMessage(error.message || 'Could not access audio/video hardware.');
      }
    }
  }, []);

  const toggleCamera = useCallback(() => {
    if (streamRef.current) {
      const videoTracks = streamRef.current.getVideoTracks();
      const nextState = !isCameraOn;
      videoTracks.forEach((track) => {
        track.enabled = nextState;
      });
      setIsCameraOn(nextState);
    }
  }, [isCameraOn]);

  const toggleMic = useCallback(() => {
    if (streamRef.current) {
      const audioTracks = streamRef.current.getAudioTracks();
      const nextState = !isMicOn;
      audioTracks.forEach((track) => {
        track.enabled = nextState;
      });
      setIsMicOn(nextState);
    }
  }, [isMicOn]);

  // Keep videoRef in sync with stream if element mounts later
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {});
    }
  }, [stream]);

  useEffect(() => {
    if (autoStart) {
      startMedia();
    }
    return () => {
      stopMedia();
    };
  }, [autoStart, startMedia, stopMedia]);

  return {
    permissionStatus,
    stream,
    videoRef,
    isCameraOn,
    isMicOn,
    errorMessage,
    startMedia,
    toggleCamera,
    toggleMic,
    stopMedia,
  };
}
