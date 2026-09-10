/**
 * HealthSure — Turn-Based Voice Pipeline Service (STT + TTS)
 * src/services/voicePipelineService.ts
 *
 * Implements discrete turn-based voice operations:
 *   1. Transcribe recorded audio blob -> POST /api/speech-to-text -> transcript string
 *   2. Synthesize speech -> POST /api/text-to-speech -> MP3 Audio playback
 *   3. Fallback to browser window.speechSynthesis if network audio is unavailable
 *
 * Strict security: Zero API keys client-side. All calls authenticate via HealthSure JWT.
 */

import { getStoredToken } from './authService';

export interface TranscribeResponse {
  success: boolean;
  transcript: string;
  confidence?: number;
}

export class VoicePipelineService {
  private currentAudio: HTMLAudioElement | null = null;
  private currentAudioUrl: string | null = null;

  /**
   * Upload recorded audio blob to /api/speech-to-text and retrieve transcription.
   */
  public async transcribeAudio(
    audioBlob: Blob,
    language: 'hi' | 'en'
  ): Promise<string> {
    const token = getStoredToken();
    const langParam = language === 'hi' ? 'hi' : 'en';

    console.log(
      `[VoicePipeline] Uploading audio (${audioBlob.size} bytes, type: ${audioBlob.type}, lang: ${langParam})...`
    );

    const response = await fetch(`/api/speech-to-text?lang=${langParam}`, {
      method: 'POST',
      headers: {
        'Content-Type': audioBlob.type || 'audio/webm',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: audioBlob,
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error('[VoicePipeline] STT HTTP error:', response.status, errBody);
      throw new Error(
        response.status === 401
          ? 'Voice transcription ke liye session expired ho gaya hai. Please sign in again.'
          : 'Voice transcription failed. Please try speaking again or use text input.'
      );
    }

    const result = (await response.json()) as TranscribeResponse;
    const transcript = (result.transcript || '').trim();
    console.log(`[VoicePipeline] Transcription result: "${transcript}"`);
    return transcript;
  }

  /**
   * Synthesize text to speech via /api/text-to-speech and play back the audio.
   * If the network audio fails, gracefully falls back to browser SpeechSynthesis.
   */
  public async speakText(
    text: string,
    language: 'hi' | 'en',
    onPlaybackStart?: () => void,
    onPlaybackEnd?: () => void
  ): Promise<void> {
    this.stopSpeaking();

    const cleanText = text.trim();
    if (!cleanText) {
      if (onPlaybackEnd) onPlaybackEnd();
      return;
    }

    console.log(`[VoicePipeline] Speaking text (${cleanText.length} chars, lang: ${language})...`);

    try {
      // 1. Attempt server-side high quality TTS first
      const token = getStoredToken();
      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          text: cleanText,
          language,
        }),
      });

      if (response.ok && response.headers.get('content-type')?.includes('audio')) {
        const audioBlob = await response.blob();
        if (audioBlob.size > 200) {
          try {
            await this._playAudioBlob(audioBlob, onPlaybackStart, onPlaybackEnd);
            return;
          } catch (playbackErr) {
            console.warn('[VoicePipeline] Server audio playback failed, falling back to browser synthesis:', playbackErr);
          }
        }
      }
    } catch (netErr) {
      console.warn('[VoicePipeline] Server TTS network error, falling back to browser synthesis:', netErr);
    }

    // 2. Fallback: Browser native SpeechSynthesis (guarantees user always hears audio)
    this._speakBrowserFallback(cleanText, language, onPlaybackStart, onPlaybackEnd);
  }

  /**
   * Stop any actively playing audio or speech synthesis immediately.
   */
  public stopSpeaking(): void {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch {}
      this.currentAudio = null;
    }

    if (this.currentAudioUrl) {
      try {
        URL.revokeObjectURL(this.currentAudioUrl);
      } catch {}
      this.currentAudioUrl = null;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private async _playAudioBlob(
    blob: Blob,
    onStart?: () => void,
    onEnd?: () => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      this.currentAudioUrl = URL.createObjectURL(blob);
      const audio = new Audio(this.currentAudioUrl);
      this.currentAudio = audio;

      let started = false;

      audio.onplay = () => {
        started = true;
        if (onStart) onStart();
      };

      const cleanup = () => {
        if (this.currentAudioUrl) {
          URL.revokeObjectURL(this.currentAudioUrl);
          this.currentAudioUrl = null;
        }
        this.currentAudio = null;
      };

      audio.onended = () => {
        cleanup();
        if (onEnd) onEnd();
        resolve();
      };

      audio.onerror = (_e) => {
        cleanup();
        if (!started) {
          reject(new Error('Audio element failed to load or decode audio stream.'));
        } else {
          if (onEnd) onEnd();
          resolve();
        }
      };

      audio.play().catch((playErr) => {
        cleanup();
        reject(playErr);
      });
    });
  }

  private _speakBrowserFallback(
    text: string,
    language: 'hi' | 'en',
    onStart?: () => void,
    onEnd?: () => void
  ): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      return;
    }

    try {
      window.speechSynthesis.cancel();
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      const pickVoice = () => {
        const voices = window.speechSynthesis.getVoices();
        if (!voices || voices.length === 0) return;

        if (language === 'hi') {
          const hindiVoice = voices.find(
            (v) =>
              v.lang.toLowerCase().startsWith('hi') ||
              v.name.toLowerCase().includes('hindi') ||
              v.lang.toLowerCase().includes('in')
          );
          if (hindiVoice) utterance.voice = hindiVoice;
        } else {
          const engVoice = voices.find(
            (v) =>
              v.lang.toLowerCase() === 'en-in' ||
              v.name.toLowerCase().includes('india') ||
              v.lang.toLowerCase().startsWith('en')
          );
          if (engVoice) utterance.voice = engVoice;
        }
      };

      pickVoice();

      let hasEnded = false;
      const finish = () => {
        if (!hasEnded) {
          hasEnded = true;
          if (onEnd) onEnd();
        }
      };

      utterance.onstart = () => {
        if (onStart) onStart();
      };

      utterance.onend = finish;
      utterance.onerror = finish;

      // Safety timeout: Chrome sometimes fails to fire onend for long utterances
      const safetyTimeoutMs = Math.max(3000, (text.length / 10) * 1000 + 4000);
      setTimeout(() => {
        if (!hasEnded && window.speechSynthesis.speaking) {
          finish();
        }
      }, safetyTimeoutMs);

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('[VoicePipeline] Browser fallback synthesis exception:', e);
      if (onEnd) onEnd();
    }
  }
}

export const voicePipeline = new VoicePipelineService();
