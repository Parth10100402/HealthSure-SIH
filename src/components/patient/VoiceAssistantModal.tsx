// HealthSure — Voice Healthcare Agent Interactive Modal
// frontend/src/components/patient/VoiceAssistantModal.tsx

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Send,
  Calendar,
  Clock,
  MapPin,
  Check,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Terminal,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { voiceAgent } from '../../services/voiceAgentService';
import type { VoiceConversationTurn } from '../../services/voiceAgentService';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AgentState = 'IDLE' | 'LISTENING' | 'PROCESSING' | 'SPEAKING' | 'ERROR';
type MicPermissionStatus = 'granted' | 'denied' | 'prompt' | 'unsupported';

const GREETING_HINDI =
  'Namaste! HealthSure Voice Command mein aapka swagat hai. Bataiye, main aapki kaise seva kar sakta hoon?';
const GREETING_ENGLISH =
  'Welcome to HealthSure Voice Command. How can I help you today?';

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  // Primary state
  const [agentState, setAgentState] = useState<AgentState>('IDLE');
  const [liveTranscript, setLiveTranscript] = useState('');
  const [textInput, setTextInput] = useState('');
  const [turns, setTurns] = useState<VoiceConversationTurn[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<'hi' | 'en'>('hi');
  const [isMuted, setIsMuted] = useState(false);

  // Diagnostic state
  const [micPermission, setMicPermission] = useState<MicPermissionStatus>('prompt');
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);
  const [speechProvider, setSpeechProvider] = useState<string>('Detecting...');
  const [lastEvent, setLastEvent] = useState<string>('idle');
  const [lastError, setLastError] = useState<string>('none');
  const [showDiagnostics, setShowDiagnostics] = useState<boolean>(false);

  // Refs for bulletproof lifecycle & zero stale closures
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const turnsEndRef = useRef<HTMLDivElement>(null);
  const isListeningRef = useRef<boolean>(false);
  const transcriptRef = useRef<string>('');
  const silenceTimerRef = useRef<any>(null);
  const selectedLanguageRef = useRef<'hi' | 'en'>('hi');
  const isMutedRef = useRef<boolean>(false);

  // Synchronize refs with state
  useEffect(() => {
    selectedLanguageRef.current = selectedLanguage;
  }, [selectedLanguage]);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  // Check Web Speech API support on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSpeechSupported(true);
        setSpeechProvider(
          (window as any).SpeechRecognition
            ? 'Standard SpeechRecognition'
            : 'webkitSpeechRecognition (Blink/WebKit)'
        );
      } else {
        setSpeechSupported(false);
        setSpeechProvider('Unsupported');
      }

      if ('speechSynthesis' in window) {
        synthRef.current = window.speechSynthesis;
      }
    }
  }, []);

  // Stop speaking cleanly
  const stopSpeaking = useCallback(() => {
    if (synthRef.current) {
      try {
        console.log('[VOICE][TTS] Cancelling speech synthesis');
        synthRef.current.cancel();
      } catch (err) {
        console.error('[VOICE][TTS] Error cancelling speech:', err);
      }
    }
    currentUtteranceRef.current = null;
    setAgentState((prev) => (prev === 'SPEAKING' ? 'IDLE' : prev));
  }, []);

  // Stop listening cleanly
  const stopListening = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    isListeningRef.current = false;

    if (recognitionRef.current) {
      try {
        console.log('[VOICE][RECOGNITION] Stopping recognition instance');
        recognitionRef.current.stop();
      } catch (err) {
        console.warn('[VOICE][RECOGNITION] Error stopping recognition:', err);
      }
      recognitionRef.current = null;
    }
    setAgentState((prev) => (prev === 'LISTENING' ? 'IDLE' : prev));
  }, []);

  // Speak text via SpeechSynthesis
  const speakText = useCallback(
    (text: string) => {
      if (isMutedRef.current || !synthRef.current) return;
      try {
        synthRef.current.cancel();
        console.log('[VOICE][TTS] Speaking:', text);
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = selectedLanguageRef.current === 'hi' ? 'hi-IN' : 'en-IN';
        utterance.rate = 0.95;
        utterance.pitch = 1.0;

        utterance.onstart = () => {
          console.log('[VOICE][TTS] onstart');
          setAgentState('SPEAKING');
          setLastEvent('tts:onstart');
        };

        utterance.onend = () => {
          console.log('[VOICE][TTS] onend');
          currentUtteranceRef.current = null;
          setAgentState((prev) => (prev === 'SPEAKING' ? 'IDLE' : prev));
          setLastEvent('tts:onend');
        };

        utterance.onerror = (e) => {
          console.warn('[VOICE][TTS] onerror:', e);
          currentUtteranceRef.current = null;
          setAgentState((prev) => (prev === 'SPEAKING' ? 'IDLE' : prev));
          setLastError(`tts: ${e.error}`);
        };

        currentUtteranceRef.current = utterance;
        synthRef.current.speak(utterance);
      } catch (err: any) {
        console.error('[VOICE][TTS] Exception:', err);
        setAgentState('IDLE');
      }
    },
    []
  );

  // Close handler: cancel everything cleanly and notify parent
  const handleClose = useCallback(() => {
    console.log('[VOICE][STATE] Modal close requested');
    stopListening();
    stopSpeaking();
    onClose();
  }, [onClose, stopListening, stopSpeaking]);

  // Submit query to voice agent service
  const handleSubmitQuery = useCallback(
    async (queryText: string) => {
      const clean = queryText.trim();
      if (!clean) return;

      console.log('[VOICE][STATE] Submitting query:', clean);
      stopSpeaking();
      stopListening();

      setTextInput('');
      setLiveTranscript('');
      transcriptRef.current = '';
      setAgentState('PROCESSING');
      setLastEvent('query:submitting');

      try {
        const result = await voiceAgent.processUserInput(clean);
        setTurns([...result.state.history]);
        setAgentState('IDLE');
        setLastEvent('query:processed');

        if (result.spokenResponse) {
          speakText(result.spokenResponse);
        }

        if (result.navigateUrl) {
          setTimeout(() => {
            handleClose();
            navigate(result.navigateUrl!);
          }, 2000);
        }
      } catch (err: any) {
        console.error('[VOICE][STATE] Error processing query:', err);
        setAgentState('ERROR');
        setLastError(err.message || 'Error processing speech');
      }
    },
    [handleClose, navigate, speakText, stopListening, stopSpeaking]
  );

  // Cross-device microphone permission pre-flight helper
  const requestMicrophonePermission = async (): Promise<boolean> => {
    if (typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        console.log('[VOICE][MIC] Requesting getUserMedia permission');
        setLastEvent('mic:requesting_permission');
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
        setMicPermission('granted');
        setLastEvent('mic:permission_granted');
        return true;
      } catch (err: any) {
        console.warn('[VOICE][MIC] getUserMedia denied or failed:', err);
        setMicPermission('denied');
        setLastError(err.name || 'Microphone access denied');
        setLastEvent('mic:permission_denied');
        return false;
      }
    }
    return true;
  };

  // Start speech recognition session
  const startListening = async () => {
    stopSpeaking();
    setLiveTranscript('');
    transcriptRef.current = '';
    setLastError('none');

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      setMicPermission('unsupported');
      setLastError('Web Speech API not supported in this browser');
      setAgentState('ERROR');
      return;
    }

    // Pre-flight permission (crucial for mobile Safari & Chrome)
    const hasPermission = await requestMicrophonePermission();
    if (!hasPermission) {
      setAgentState('ERROR');
      return;
    }

    // Clean up any existing recognition instance
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
      recognitionRef.current = null;
    }

    try {
      console.log('[VOICE][RECOGNITION] Initializing SpeechRecognition instance');
      const recognition = new SpeechRecognition();

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.lang = selectedLanguageRef.current === 'hi' ? 'hi-IN' : 'en-IN';

      recognition.onstart = () => {
        console.log('[VOICE][RECOGNITION] onstart fired');
        isListeningRef.current = true;
        setAgentState('LISTENING');
        setLastEvent('recognition:onstart');
      };

      recognition.onaudiostart = () => {
        console.log('[VOICE][MIC] onaudiostart');
        setLastEvent('mic:audiostart');
      };

      recognition.onsoundstart = () => {
        console.log('[VOICE][MIC] onsoundstart');
        setLastEvent('mic:soundstart');
      };

      recognition.onspeechstart = () => {
        console.log('[VOICE][RECOGNITION] onspeechstart');
        setLastEvent('recognition:speechstart');
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = 0; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            final += item[0].transcript + ' ';
          } else {
            interim += item[0].transcript;
          }
        }

        const combined = (final + interim).trim();
        console.log('[VOICE][RESULT]', combined);
        transcriptRef.current = combined;
        setLiveTranscript(combined);
        setLastEvent(`recognition:result ("${combined.slice(0, 24)}...")`);

        // Silence detection: when speech is recognized, schedule auto-submit after 1.8s silence
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }
        if (combined.length > 1) {
          silenceTimerRef.current = setTimeout(() => {
            console.log('[VOICE][STATE] Silence timer expired, auto-submitting:', transcriptRef.current);
            if (isListeningRef.current && transcriptRef.current.trim()) {
              const toSubmit = transcriptRef.current.trim();
              stopListening();
              handleSubmitQuery(toSubmit);
            }
          }, 1800);
        }
      };

      recognition.onspeechend = () => {
        console.log('[VOICE][RECOGNITION] onspeechend');
        setLastEvent('recognition:speechend');
      };

      recognition.onsoundend = () => {
        console.log('[VOICE][MIC] onsoundend');
        setLastEvent('mic:soundend');
      };

      recognition.onaudioend = () => {
        console.log('[VOICE][MIC] onaudioend');
        setLastEvent('mic:audioend');
      };

      recognition.onerror = (event: any) => {
        console.warn('[VOICE][ERROR]', event.error, event.message);
        setLastError(event.error + (event.message ? `: ${event.message}` : ''));
        setLastEvent(`recognition:error (${event.error})`);

        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setMicPermission('denied');
          isListeningRef.current = false;
          setAgentState('ERROR');
        } else if (event.error === 'no-speech') {
          console.log('[VOICE][RECOGNITION] no-speech detected (ignoring ambient pause)');
        } else if (event.error === 'network') {
          setLastError('Speech recognition network service error');
        }
      };

      recognition.onend = () => {
        console.log(
          '[VOICE][RECOGNITION] onend fired. isListening:',
          isListeningRef.current,
          'transcript:',
          transcriptRef.current
        );
        setLastEvent('recognition:onend');

        const pendingQuery = transcriptRef.current.trim();
        if (isListeningRef.current && pendingQuery) {
          isListeningRef.current = false;
          recognitionRef.current = null;
          setAgentState('PROCESSING');
          handleSubmitQuery(pendingQuery);
        } else {
          isListeningRef.current = false;
          recognitionRef.current = null;
          setAgentState((prev) => (prev === 'LISTENING' ? 'IDLE' : prev));
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error('[VOICE][RECOGNITION] Failed to start recognition:', err);
      setLastError(err.message || 'Failed to start recognition');
      setMicPermission('denied');
      setAgentState('ERROR');
    }
  };

  // Toggle mic button handler (works repeatedly across turns)
  const toggleMic = () => {
    if (agentState === 'LISTENING') {
      const pending = transcriptRef.current.trim();
      stopListening();
      if (pending) {
        handleSubmitQuery(pending);
      }
    } else {
      startListening();
    }
  };

  // Handle open & language greeting lifecycle
  useEffect(() => {
    if (isOpen) {
      voiceAgent.setLanguage(selectedLanguage);
      const state = voiceAgent.getState();

      const greeting = selectedLanguage === 'hi' ? GREETING_HINDI : GREETING_ENGLISH;

      // Only seed greeting if conversation is fresh or has only the previous welcome
      const isFresh =
        state.history.length === 0 ||
        (state.history.length === 1 && state.history[0].id === 'turn-welcome');

      if (isFresh) {
        const welcomeTurn: VoiceConversationTurn = {
          id: 'turn-welcome',
          sender: 'agent',
          text: greeting,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        state.history = [welcomeTurn];
        setTurns([welcomeTurn]);
        speakText(greeting);
      } else {
        setTurns([...state.history]);
      }
    } else {
      stopListening();
      stopSpeaking();
    }
  }, [isOpen, selectedLanguage, speakText, stopListening, stopSpeaking]);

  // Auto-scroll chat history
  useEffect(() => {
    turnsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [turns, liveTranscript]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="voice-assistant-title"
    >
      <div className="w-full max-w-lg bg-white dark:bg-[#072020] rounded-3xl border border-[#DDE8E4] dark:border-[#1A3A3A] shadow-2xl overflow-hidden flex flex-col max-h-[94vh] animate-in fade-in zoom-in-95 duration-150 relative">
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-[#073B3A] via-[#094840] to-[#087F6D] text-white px-4 py-3.5 sm:px-5 sm:py-4 flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-[#4FD1C5] ring-2 ring-white/20 shrink-0">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h2 id="voice-assistant-title" className="text-sm sm:text-base font-bold truncate">
                  HealthSure Voice Command
                </h2>
                <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-[#4FD1C5]/20 text-[#A7D9CE] border border-[#4FD1C5]/30 shrink-0">
                  LIVE
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-[#A7D9CE] truncate">
                {selectedLanguage === 'hi'
                  ? 'Hindi & English Spoken Healthcare Assistant'
                  : 'Natural Spoken Healthcare Assistant'}
              </p>
            </div>
          </div>

          {/* Action buttons (Mute, Lang, Standalone Close) */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 ml-2">
            {/* Language Switch */}
            <button
              type="button"
              onClick={() => {
                const nextLang = selectedLanguage === 'hi' ? 'en' : 'hi';
                setSelectedLanguage(nextLang);
                voiceAgent.setLanguage(nextLang);
              }}
              className="px-2.5 py-1 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all cursor-pointer border border-white/20"
              title="Switch Language"
            >
              {selectedLanguage === 'hi' ? 'English' : 'हिंदी'}
            </button>

            {/* Mute Toggle */}
            <button
              type="button"
              onClick={() => {
                if (!isMuted) stopSpeaking();
                setIsMuted(!isMuted);
              }}
              className="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-colors cursor-pointer border border-white/20"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
              title={isMuted ? 'Unmute Voice' : 'Mute Voice'}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-rose-300" />
              ) : (
                <Volume2 className="w-4 h-4 text-[#4FD1C5]" />
              )}
            </button>

            {/* Standalone, High-Contrast Top-Right Close Button */}
            <button
              type="button"
              onClick={handleClose}
              className="p-2 rounded-xl bg-white/20 hover:bg-white/30 active:bg-white/40 text-white transition-all ring-1 ring-white/30 cursor-pointer flex items-center justify-center"
              aria-label="Close Voice Assistant"
              title="Close Voice Assistant"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* ── Conversation History ────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 bg-[#F9FBFA] dark:bg-[#051818] min-h-[220px]">
          {turns.map((t) => (
            <div
              key={t.id}
              className={`flex flex-col ${t.sender === 'user' ? 'items-end' : 'items-start'} space-y-1.5`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm shadow-xs ${
                  t.sender === 'user'
                    ? 'bg-[#087F6D] text-white rounded-br-xs font-medium'
                    : 'bg-white dark:bg-[#0A2424] text-[#17324D] dark:text-[#E2EEF4] border border-[#DDE8E4] dark:border-[#1A3A3A] rounded-bl-xs leading-relaxed'
                }`}
              >
                {t.text}
              </div>

              {/* Action Card Render */}
              {t.actionCard && (
                <div className="w-full max-w-[90%] mt-2">
                  {/* Card 1: Confirm Booking */}
                  {t.actionCard.type === 'CONFIRM_BOOKING' && (
                    <div className="rounded-2xl border-2 border-[#087F6D] bg-emerald-50/80 dark:bg-emerald-950/40 p-4 space-y-3 shadow-md">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#087F6D] dark:text-[#4FD1C5]">
                        <Calendar className="w-4 h-4" />
                        <span>Confirm Appointment Booking</span>
                      </div>
                      <div className="space-y-1.5 text-xs text-[#17324D] dark:text-[#E2EEF4]">
                        <div className="font-bold text-sm">
                          {t.actionCard.data.doctorName} ({t.actionCard.data.speciality})
                        </div>
                        <div className="flex items-center gap-2 text-[#64748B] dark:text-[#7B9EA8]">
                          <Clock className="w-3.5 h-3.5 text-[#087F6D]" />
                          <span>{t.actionCard.data.dateDisplay || t.actionCard.data.date} at {t.actionCard.data.time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[#64748B] dark:text-[#7B9EA8]">
                          <MapPin className="w-3.5 h-3.5 text-[#087F6D]" />
                          <span>{t.actionCard.data.facility}</span>
                        </div>
                      </div>
                      <div className="pt-2 flex items-center gap-2 border-t border-emerald-200 dark:border-emerald-800">
                        <button
                          type="button"
                          onClick={() => handleSubmitQuery('Haan, book kar do')}
                          className="flex-1 py-2 px-3 rounded-xl bg-[#087F6D] hover:bg-[#073B3A] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                          <span>Haan / Confirm</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSubmitQuery('Nahi, cancel karo')}
                          className="py-2 px-3 rounded-xl bg-white dark:bg-[#0A2020] border border-[#DDE8E4] dark:border-[#1A3A3A] text-rose-600 dark:text-rose-400 text-xs font-bold hover:bg-rose-50 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Card 2: Confirm Cancellation */}
                  {t.actionCard.type === 'CONFIRM_CANCELLATION' && (
                    <div className="rounded-2xl border-2 border-rose-500 bg-rose-50/80 dark:bg-rose-950/40 p-4 space-y-3 shadow-md">
                      <div className="flex items-center gap-2 text-xs font-bold text-rose-700 dark:text-rose-400">
                        <AlertCircle className="w-4 h-4" />
                        <span>Confirm Appointment Cancellation</span>
                      </div>
                      <div className="text-xs text-[#17324D] dark:text-[#E2EEF4]">
                        Doctor: <strong>{t.actionCard.data.doctorName}</strong> ({t.actionCard.data.speciality})
                        <br />
                        Date: {t.actionCard.data.date} at {t.actionCard.data.time}
                        <br />
                        Token: <strong>{t.actionCard.data.tokenNumber}</strong>
                      </div>
                      <div className="pt-2 flex items-center gap-2 border-t border-rose-200 dark:border-rose-900">
                        <button
                          type="button"
                          onClick={() => handleSubmitQuery('Haan, cancel kar do')}
                          className="flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                          <span>Haan / Cancel Appointment</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSubmitQuery('Nahi, mat karo')}
                          className="py-2 px-3 rounded-xl bg-white dark:bg-[#0A2020] border border-[#DDE8E4] text-[#64748B] text-xs font-bold cursor-pointer"
                        >
                          Keep
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Card 3: Doctor List */}
                  {t.actionCard.type === 'DOCTOR_LIST' && (
                    <div className="rounded-2xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-white dark:bg-[#0A2020] p-3 space-y-2">
                      <div className="text-xs font-bold text-[#087F6D] dark:text-[#4FD1C5]">
                        Available Specialists:
                      </div>
                      <div className="space-y-1.5">
                        {t.actionCard.data.doctors?.map((doc: any) => (
                          <div
                            key={doc.id}
                            onClick={() => handleSubmitQuery(`${doc.name} ke saath 11 baje book kar do`)}
                            className="p-2 rounded-xl bg-[#F5F9F7] dark:bg-[#051818] hover:bg-emerald-100/50 flex items-center justify-between cursor-pointer text-xs"
                          >
                            <div>
                              <div className="font-bold text-[#17324D] dark:text-[#E2EEF4]">{doc.name}</div>
                              <div className="text-[11px] text-[#64748B] dark:text-[#7B9EA8]">{doc.speciality}</div>
                            </div>
                            <span className="text-[11px] font-bold text-[#087F6D] dark:text-[#4FD1C5] flex items-center gap-1">
                              Book <ArrowRight className="w-3 h-3" />
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Card 4: Referral Card */}
                  {t.actionCard.type === 'REFERRAL_CARD' && (
                    <div className="rounded-2xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 p-3.5 space-y-2 text-xs">
                      <div className="font-bold text-amber-800 dark:text-amber-300">
                        Referral: {t.actionCard.data.id} ({t.actionCard.data.status.toUpperCase()})
                      </div>
                      <div className="text-[#17324D] dark:text-[#E2EEF4]">
                        {t.actionCard.data.fromFacility} ➔ {t.actionCard.data.toFacility}
                        <br />
                        Department: {t.actionCard.data.department} | Priority: {t.actionCard.data.priority}
                      </div>
                    </div>
                  )}

                  {/* Card 5: Records Summary */}
                  {t.actionCard.type === 'RECORDS_SUMMARY' && (
                    <div className="rounded-2xl border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/40 p-3.5 space-y-2 text-xs">
                      <div className="font-bold text-blue-800 dark:text-blue-300">
                        Latest Health Records
                      </div>
                      {t.actionCard.data.records?.map((r: any) => (
                        <div key={r.id} className="p-2 rounded-xl bg-white dark:bg-[#0A2020] border border-blue-100">
                          <div className="font-bold">{r.diagnosis} • {r.date}</div>
                          <div className="text-[11px] text-[#64748B]">{r.doctorName} ({r.speciality})</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Live Audio Transcript Preview */}
          {agentState === 'LISTENING' && liveTranscript && (
            <div className="flex items-start">
              <div className="max-w-[85%] rounded-2xl p-3 bg-emerald-100/70 dark:bg-emerald-950/50 text-[#087F6D] dark:text-[#4FD1C5] text-xs sm:text-sm italic animate-pulse">
                &ldquo;{liveTranscript}&rdquo;
              </div>
            </div>
          )}

          {agentState === 'PROCESSING' && (
            <div className="flex items-center gap-2 text-xs font-semibold text-[#087F6D] dark:text-[#4FD1C5] p-2">
              <div className="w-2 h-2 rounded-full bg-[#087F6D] animate-ping" />
              <span>Thinking & checking real data...</span>
            </div>
          )}

          <div ref={turnsEndRef} />
        </div>

        {/* ── Microphone / Voice Visualizer / Controls ─────────────────────── */}
        <div className="p-3.5 sm:p-4 bg-white dark:bg-[#072020] border-t border-[#DDE8E4] dark:border-[#1A3A3A] space-y-3 shrink-0">
          {/* Permission / Support Warning */}
          {micPermission === 'denied' && (
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
                <span>Microphone access was denied. Please allow mic in browser settings or use text.</span>
              </div>
              <button
                type="button"
                onClick={() => startListening()}
                className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold text-[11px] hover:bg-rose-700 cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}

          {!speechSupported && (
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Speech Recognition not supported by this browser engine. Please type below.</span>
            </div>
          )}

          {/* Center Voice Button & Visualizer */}
          <div className="flex flex-col items-center justify-center space-y-1.5">
            <div className="relative flex items-center justify-center">
              {/* Pulsing waves */}
              {agentState === 'LISTENING' && (
                <>
                  <div className="absolute w-20 h-20 rounded-full bg-emerald-500/20 animate-ping" />
                  <div className="absolute w-16 h-16 rounded-full bg-emerald-500/30 animate-pulse" />
                </>
              )}
              {agentState === 'SPEAKING' && (
                <div className="absolute w-18 h-18 rounded-full bg-blue-500/25 animate-pulse" />
              )}

              <button
                type="button"
                onClick={toggleMic}
                className={`relative z-10 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer ${
                  agentState === 'LISTENING'
                    ? 'bg-rose-500 hover:bg-rose-600 text-white animate-bounce ring-4 ring-rose-300'
                    : agentState === 'SPEAKING'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white ring-4 ring-blue-300'
                    : agentState === 'ERROR'
                    ? 'bg-amber-600 hover:bg-amber-700 text-white ring-4 ring-amber-300'
                    : 'bg-[#087F6D] hover:bg-[#073B3A] text-white ring-4 ring-emerald-300/40'
                }`}
                aria-label={agentState === 'LISTENING' ? 'Stop listening' : 'Start speaking'}
                title={agentState === 'LISTENING' ? 'Tap to finish speaking' : 'Tap to speak'}
              >
                {agentState === 'LISTENING' ? (
                  <MicOff className="w-6 h-6 text-white" />
                ) : (
                  <Mic className="w-6 h-6 text-white" />
                )}
              </button>
            </div>

            <div className="text-center">
              <span className="text-xs font-bold text-[#17324D] dark:text-[#E2EEF4]">
                {agentState === 'LISTENING'
                  ? 'Sun raha hoon... (Listening — bolkar rukiye ya tap karein)'
                  : agentState === 'SPEAKING'
                  ? 'Speaking response...'
                  : agentState === 'PROCESSING'
                  ? 'Processing your request...'
                  : agentState === 'ERROR'
                  ? 'Tap Mic to Retry'
                  : 'Tap Mic to Speak (बोलने के लिए माइक दबाएं)'}
              </span>
            </div>
          </div>

          {/* Quick Voice Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-xs no-scrollbar">
            <button
              type="button"
              onClick={() => handleSubmitQuery('Mujhe Wednesday ko available doctors batao')}
              className="px-2.5 py-1 rounded-full bg-[#F5F9F7] dark:bg-[#0F2929] border border-[#DDE8E4] dark:border-[#1A3A3A] hover:border-[#087F6D] text-[#087F6D] dark:text-[#4FD1C5] font-semibold whitespace-nowrap cursor-pointer transition-colors"
            >
              Wednesday Doctors
            </button>
            <button
              type="button"
              onClick={() => handleSubmitQuery('Meri next appointment kab hai?')}
              className="px-2.5 py-1 rounded-full bg-[#F5F9F7] dark:bg-[#0F2929] border border-[#DDE8E4] dark:border-[#1A3A3A] hover:border-[#087F6D] text-[#087F6D] dark:text-[#4FD1C5] font-semibold whitespace-nowrap cursor-pointer transition-colors"
            >
              My Next Appointment
            </button>
            <button
              type="button"
              onClick={() => handleSubmitQuery('Doctor se video consultation start karni hai')}
              className="px-2.5 py-1 rounded-full bg-[#F5F9F7] dark:bg-[#0F2929] border border-[#DDE8E4] dark:border-[#1A3A3A] hover:border-[#087F6D] text-[#087F6D] dark:text-[#4FD1C5] font-semibold whitespace-nowrap cursor-pointer transition-colors"
            >
              Start Teleconsult
            </button>
          </div>

          {/* Text Input Fallback */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmitQuery(textInput);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder={
                selectedLanguage === 'hi'
                  ? 'Type karein: "Wednesday ko appointment book karo"...'
                  : 'Type: "Show available doctors on Wednesday"...'
              }
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#F5F9F7] dark:bg-[#0F2929] border border-[#DDE8E4] dark:border-[#1A3A3A] text-xs sm:text-sm text-[#17324D] dark:text-[#E2EEF4] placeholder-[#64748B] focus:outline-none focus:border-[#087F6D]"
            />
            <button
              type="submit"
              disabled={!textInput.trim()}
              className="p-2.5 rounded-xl bg-[#087F6D] hover:bg-[#073B3A] disabled:opacity-40 text-white transition-all shadow-xs cursor-pointer"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* ── Developer Diagnostic Area (Collapsible) ────────────────────── */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowDiagnostics(!showDiagnostics)}
              className="w-full flex items-center justify-between text-[11px] font-semibold text-[#64748B] dark:text-[#7B9EA8] hover:text-[#087F6D] dark:hover:text-[#4FD1C5] px-1 py-0.5 cursor-pointer"
            >
              <div className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-[#087F6D]" />
                <span>Developer Diagnostics</span>
                <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[9px] font-mono uppercase">
                  {agentState}
                </span>
              </div>
              {showDiagnostics ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showDiagnostics && (
              <div className="mt-2 p-3 rounded-2xl bg-[#0C1E1E] text-[#A7D9CE] font-mono text-[10px] space-y-1 border border-[#1A3A3A] shadow-inner">
                <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                  <div>
                    <span className="text-[#64748B]">State:</span>{' '}
                    <span className="text-emerald-400 font-bold">{agentState}</span>
                  </div>
                  <div>
                    <span className="text-[#64748B]">Lang:</span>{' '}
                    <span className="text-white">{selectedLanguage === 'hi' ? 'hi-IN' : 'en-IN'}</span>
                  </div>
                  <div>
                    <span className="text-[#64748B]">Mic Access:</span>{' '}
                    <span className={micPermission === 'granted' ? 'text-emerald-400' : 'text-amber-400'}>
                      {micPermission}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#64748B]">Speech Engine:</span>{' '}
                    <span className={speechSupported ? 'text-emerald-400' : 'text-rose-400'}>
                      {speechProvider}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#64748B]">TTS Engine:</span>{' '}
                    <span className="text-white">
                      {synthRef.current ? (currentUtteranceRef.current ? 'speaking' : 'ready') : 'none'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#64748B]">Last Event:</span>{' '}
                    <span className="text-white truncate">{lastEvent}</span>
                  </div>
                </div>
                {lastError !== 'none' && (
                  <div className="pt-1 text-rose-400 border-t border-rose-900/50">
                    <span className="text-rose-300 font-bold">Last Error:</span> {lastError}
                  </div>
                )}
                {transcriptRef.current && (
                  <div className="pt-1 text-cyan-300 border-t border-[#1A3A3A] truncate">
                    <span className="text-[#64748B]">Buffer:</span> &ldquo;{transcriptRef.current}&rdquo;
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
