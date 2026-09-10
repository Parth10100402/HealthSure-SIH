/**
 * HealthSure — Turn-Based Speech Recorder Service
 * src/services/speechRecorderService.ts
 *
 * Captures user speech for a single discrete turn via MediaRecorder.
 * Enforces strict microphone lifecycle: opens mic on demand, captures audio,
 * automatically detects silence or allows manual stop, and immediately
 * releases all microphone hardware tracks on completion.
 */

export interface RecordingResult {
  blob: Blob;
  mimeType: string;
  durationMs: number;
}

export interface RecorderOptions {
  maxDurationMs?: number;      // Default 15 seconds
  silenceThresholdMs?: number; // Silence duration before auto-stop (default 2000ms)
  onVolumeChange?: (volume: number) => void;
  onSilenceDetected?: () => void;
}

export class SpeechRecorderService {
  private mediaStream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private animFrameId: number | null = null;
  private maxDurationTimer: any = null;
  private isRecording = false;
  private startTime = 0;

  /**
   * Best supported audio mime type across desktop Chrome, Edge, Firefox, and mobile Safari/Chrome.
   */
  public static getSupportedMimeType(): string {
    if (typeof MediaRecorder === 'undefined') return 'audio/webm';

    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/aac',
      'audio/ogg;codecs=opus',
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }

    return ''; // Browser default
  }

  /**
   * Check if microphone capture is supported in the current browser.
   */
  public static isSupported(): boolean {
    return !!(
      typeof navigator !== 'undefined' &&
      navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === 'function' &&
      typeof MediaRecorder !== 'undefined'
    );
  }

  /**
   * Start recording user speech.
   * Returns a promise that resolves with the recorded audio Blob when recording stops.
   */
  public async start(options: RecorderOptions = {}): Promise<RecordingResult> {
    if (this.isRecording) {
      this.stop();
    }

    if (!SpeechRecorderService.isSupported()) {
      throw new Error(
        'Aapke browser mein microphone recording supported nahi hai. Kripya text input use karein ya modern browser use karein.'
      );
    }

    const {
      maxDurationMs = 15000,
      silenceThresholdMs = 2200,
      onVolumeChange,
      onSilenceDetected,
    } = options;

    // 1. Request microphone access
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
    } catch (err: any) {
      console.error('[SpeechRecorder] Mic access error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        throw new Error(
          'Microphone access allow karna zaroori hai. Please browser settings mein microphone permission allow karke dobara try karein.'
        );
      }
      if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        throw new Error('Aapke device par koi microphone nahi mila. Kripya microphone connect karein.');
      }
      throw new Error(`Microphone error: ${err.message || 'Access failed'}`);
    }

    this.audioChunks = [];
    this.isRecording = true;
    this.startTime = Date.now();

    // 2. Setup MediaRecorder with best supported mimeType
    const mimeType = SpeechRecorderService.getSupportedMimeType();
    const recorderOptions: MediaRecorderOptions = mimeType ? { mimeType } : {};

    try {
      this.mediaRecorder = new MediaRecorder(this.mediaStream, recorderOptions);
    } catch (e) {
      // Fallback to browser default if mimeType failed
      this.mediaRecorder = new MediaRecorder(this.mediaStream);
    }

    const effectiveMimeType = this.mediaRecorder.mimeType || mimeType || 'audio/webm';

    this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
      if (event.data && event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    };

    // 3. Setup silence detection via AnalyserNode
    this._setupSilenceDetection(silenceThresholdMs, onVolumeChange, onSilenceDetected);

    // 4. Setup max duration safety timer
    this.maxDurationTimer = setTimeout(() => {
      console.log('[SpeechRecorder] Max duration reached, stopping recording.');
      this.stop();
    }, maxDurationMs);

    // Start recording (gather chunks every 250ms)
    this.mediaRecorder.start(250);
    console.log('[SpeechRecorder] Recording started. MimeType:', effectiveMimeType);

    // 5. Return promise that resolves when onstop fires
    return new Promise<RecordingResult>((resolve, reject) => {
      if (!this.mediaRecorder) {
        this._cleanup();
        reject(new Error('MediaRecorder initialization failed.'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const durationMs = Date.now() - this.startTime;
        const blob = new Blob(this.audioChunks, { type: effectiveMimeType });
        console.log(`[SpeechRecorder] Recording stopped. Duration: ${durationMs}ms, Size: ${blob.size} bytes`);
        this._cleanup();
        resolve({
          blob,
          mimeType: effectiveMimeType,
          durationMs,
        });
      };

      this.mediaRecorder.onerror = (event: any) => {
        console.error('[SpeechRecorder] MediaRecorder error:', event.error);
        this._cleanup();
        reject(new Error(event.error?.message || 'Recording error occurred.'));
      };
    });
  }

  /**
   * Stop the current recording manually (e.g. user clicked stop mic button).
   */
  public stop(): void {
    if (!this.isRecording) return;
    this.isRecording = false;

    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch (err) {
        console.warn('[SpeechRecorder] Error stopping MediaRecorder:', err);
      }
    }
  }

  /**
   * Cancel recording without resolving data.
   */
  public cancel(): void {
    this.isRecording = false;
    this.audioChunks = [];
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.onstop = null;
        this.mediaRecorder.stop();
      } catch {}
    }
    this._cleanup();
  }

  public isActive(): boolean {
    return this.isRecording;
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private _setupSilenceDetection(
    silenceThresholdMs: number,
    onVolumeChange?: (volume: number) => void,
    onSilenceDetected?: () => void
  ): void {
    if (!this.mediaStream) return;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      this.audioContext = new AudioCtx();
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 512;
      this.analyser.smoothingTimeConstant = 0.4;
      source.connect(this.analyser);

      const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      let speechStarted = false;
      let silenceStartTime = 0;

      const checkVolume = () => {
        if (!this.isRecording || !this.analyser) return;

        this.analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        const normalizedVolume = Math.min(1, average / 80);

        if (onVolumeChange) {
          onVolumeChange(normalizedVolume);
        }

        const now = Date.now();
        // Threshold for human speech volume
        const isSpeaking = average > 12;

        if (isSpeaking) {
          speechStarted = true;
          silenceStartTime = 0;
        } else if (speechStarted) {
          if (silenceStartTime === 0) {
            silenceStartTime = now;
          } else if (now - silenceStartTime >= silenceThresholdMs) {
            console.log(`[SpeechRecorder] ${silenceThresholdMs}ms silence detected after speech. Auto-stopping.`);
            if (onSilenceDetected) onSilenceDetected();
            this.stop();
            return;
          }
        }

        this.animFrameId = requestAnimationFrame(checkVolume);
      };

      this.animFrameId = requestAnimationFrame(checkVolume);
    } catch (err) {
      console.warn('[SpeechRecorder] Silence detection setup skipped:', err);
    }
  }

  private _cleanup(): void {
    if (this.maxDurationTimer) {
      clearTimeout(this.maxDurationTimer);
      this.maxDurationTimer = null;
    }

    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    if (this.audioContext && this.audioContext.state !== 'closed') {
      try {
        this.audioContext.close();
      } catch {}
      this.audioContext = null;
    }

    this.analyser = null;

    // CRITICAL: Immediately release all microphone hardware tracks
    if (this.mediaStream) {
      console.log('[SpeechRecorder] Releasing all microphone tracks.');
      this.mediaStream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {}
      });
      this.mediaStream = null;
    }

    this.mediaRecorder = null;
  }
}

export const speechRecorder = new SpeechRecorderService();
