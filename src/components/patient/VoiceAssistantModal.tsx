// HealthSure — Voice Healthcare Agent Interactive Modal (Deepgram-powered)
// frontend/src/components/patient/VoiceAssistantModal.tsx
//
// PRIMARY voice engine: Deepgram Voice Agent API (WebSocket)
// Fallback: Text input (always available)
//
// SECURITY: No API keys in this file. Deepgram token fetched server-side via /api/deepgram-token.
// ARCHITECTURE: DeepgramVoiceProvider handles mic + STT + LLM + TTS.
//               voiceAgentService handles all HealthSure business logic via function calls.

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
  Wifi,
  WifiOff,
} from 'lucide-react';
import { voiceAgent } from '../../services/voiceAgentService';
import { DeepgramVoiceProvider } from '../../services/deepgramVoiceProvider';
import type { DeepgramAgentState } from '../../services/deepgramVoiceProvider';
import type { VoiceConversationTurn } from '../../services/voiceAgentService';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Extended UI states that map onto Deepgram agent states
type UIAgentState = DeepgramAgentState | 'PROCESSING';

const GREETING_HINDI =
  'Namaste! HealthSure Voice Agent mein aapka swagat hai. Bataiye, main aapki kaise seva kar sakta hoon?';
const GREETING_ENGLISH =
  'Welcome to HealthSure Voice Agent. How can I help you today?';

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  // Primary UI state
  const [uiState, setUiState] = useState<UIAgentState>('IDLE');
  const [liveTranscript, setLiveTranscript] = useState('');
  const [lastAgentResponse, setLastAgentResponse] = useState('');
  const [textInput, setTextInput] = useState('');
  const [turns, setTurns] = useState<VoiceConversationTurn[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<'hi' | 'en'>('hi');
  const [isMuted, setIsMuted] = useState(false);
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);

  // Diagnostic state
  const [lastFunctionCall, setLastFunctionCall] = useState<string>('none');
  const [lastFunctionResult, setLastFunctionResult] = useState<string>('');
  const [showDiagnostics, setShowDiagnostics] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Refs
  const turnsEndRef = useRef<HTMLDivElement>(null);
  const providerRef = useRef<DeepgramVoiceProvider | null>(null);
  const selectedLanguageRef = useRef<'hi' | 'en'>('hi');
  const isMutedRef = useRef<boolean>(false);
  const isOpenRef = useRef<boolean>(false);

  // Sync refs with state
  useEffect(() => {
    selectedLanguageRef.current = selectedLanguage;
  }, [selectedLanguage]);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  // Auto-scroll
  useEffect(() => {
    turnsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [turns, liveTranscript]);

  // ── Close handler ──────────────────────────────────────────────────────────

  const handleClose = useCallback(() => {
    console.log('[VoiceModal] Closing modal');
    if (providerRef.current) {
      providerRef.current.stop();
      providerRef.current = null;
    }
    setUiState('IDLE');
    setLiveTranscript('');
    setIsAgentSpeaking(false);
    onClose();
  }, [onClose]);

  // ── Text-based query (fallback + confirmation buttons) ────────────────────

  const handleTextQuery = useCallback(async (queryText: string) => {
    const clean = queryText.trim();
    if (!clean) return;

    console.log('[VoiceModal] Text query:', clean);
    setTextInput('');
    setUiState('PROCESSING');

    try {
      voiceAgent.setLanguage(selectedLanguageRef.current);
      const result = await voiceAgent.processUserInput(clean);
      setTurns([...result.state.history]);
      setUiState('IDLE');
      setLastAgentResponse(result.spokenResponse);

      if (result.navigateUrl) {
        setTimeout(() => {
          handleClose();
          navigate(result.navigateUrl!);
        }, 2000);
      }
    } catch (err: any) {
      console.error('[VoiceModal] Text query error:', err);
      setUiState('ERROR');
      setErrorMsg(err.message || 'Error processing your request');
    }
  }, [handleClose, navigate]);

  // ── Deepgram Voice Agent lifecycle ────────────────────────────────────────

  const createProvider = useCallback((): DeepgramVoiceProvider => {
    const provider = new DeepgramVoiceProvider({
      language: selectedLanguageRef.current,
      callbacks: {
        onStateChange: (state) => {
          console.log('[VoiceModal] Agent state:', state);
          if (!isOpenRef.current) return;
          setUiState(state);
          if (state === 'ERROR') {
            setIsAgentSpeaking(false);
          }
          if (state === 'IDLE') {
            setIsAgentSpeaking(false);
          }
        },

        onTranscript: (text, isFinal) => {
          if (!isOpenRef.current) return;
          setLiveTranscript(text);
          if (isFinal) {
            // Add user turn to local display
            setTurns((prev) => [
              ...prev,
              {
                id: 'turn-' + Date.now(),
                sender: 'user',
                text,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ]);
            setTimeout(() => setLiveTranscript(''), 500);
          }
        },

        onAgentResponse: (text) => {
          if (!isOpenRef.current) return;
          console.log('[VoiceModal] Agent response:', text);
          setLastAgentResponse(text);
          // Update local conversation history from voiceAgent service
          const state = voiceAgent.getState();
          setTurns([...state.history]);
        },

        onAgentSpeaking: (playing) => {
          if (!isOpenRef.current) return;
          // If muted, don't update the visual speaking state from audio
          if (!isMutedRef.current) {
            setIsAgentSpeaking(playing);
          }
        },

        onFunctionResult: (fnName, result) => {
          if (!isOpenRef.current) return;
          console.log('[VoiceModal] Function result:', fnName);
          setLastFunctionCall(fnName);
          setLastFunctionResult(result.slice(0, 100));
          // Update turns from voiceAgentService state after function execution
          const state = voiceAgent.getState();
          setTurns([...state.history]);
        },

        onError: (msg) => {
          if (!isOpenRef.current) return;
          console.error('[VoiceModal] Provider error:', msg);
          setErrorMsg(msg);
          setUiState('ERROR');
          setIsAgentSpeaking(false);
        },

        onNavigate: (url) => {
          if (!isOpenRef.current) return;
          handleClose();
          navigate(url);
        },
      },
    });

    return provider;
  }, [handleClose, navigate]);

  // ── Open / close session lifecycle ────────────────────────────────────────

  useEffect(() => {
    if (isOpen) {
      voiceAgent.setLanguage(selectedLanguage);

      // Seed greeting if fresh conversation
      const state = voiceAgent.getState();
      const greeting = selectedLanguage === 'hi' ? GREETING_HINDI : GREETING_ENGLISH;
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
      } else {
        setTurns([...state.history]);
      }

      // Start Deepgram provider
      if (!providerRef.current) {
        console.log('[VoiceModal] Creating new DeepgramVoiceProvider');
        const provider = createProvider();
        providerRef.current = provider;
        provider.start().catch((err) => {
          console.error('[VoiceModal] Provider start error:', err);
          setErrorMsg(err.message || 'Failed to start voice agent');
          setUiState('ERROR');
        });
      }
    } else {
      // Stop provider when modal closes
      if (providerRef.current) {
        providerRef.current.stop();
        providerRef.current = null;
      }
      setUiState('IDLE');
      setLiveTranscript('');
      setIsAgentSpeaking(false);
    }

    return () => {
      // Cleanup on unmount
      if (providerRef.current && !isOpen) {
        providerRef.current.stop();
        providerRef.current = null;
      }
    };
    // Only re-run when isOpen changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // ── Language switch ────────────────────────────────────────────────────────

  const handleLanguageSwitch = useCallback(() => {
    const nextLang = selectedLanguage === 'hi' ? 'en' : 'hi';
    setSelectedLanguage(nextLang);
    voiceAgent.setLanguage(nextLang);
    if (providerRef.current) {
      providerRef.current.setLanguage(nextLang);
    }
  }, [selectedLanguage]);

  // ── Mic button ─────────────────────────────────────────────────────────────

  const handleMicButton = useCallback(() => {
    if (uiState === 'SPEAKING' || isAgentSpeaking) {
      // Barge-in: interrupt agent
      providerRef.current?.interruptSpeaking();
      return;
    }

    if (uiState === 'ERROR') {
      // Retry: destroy old provider and start new one
      if (providerRef.current) {
        providerRef.current.stop();
        providerRef.current = null;
      }
      setErrorMsg('');
      setUiState('IDLE');
      const provider = createProvider();
      providerRef.current = provider;
      provider.start().catch((err) => {
        setErrorMsg(err.message || 'Failed to start voice agent');
        setUiState('ERROR');
      });
      return;
    }

    if (uiState === 'IDLE' || uiState === 'RECONNECTING') {
      // If no provider, create one
      if (!providerRef.current) {
        const provider = createProvider();
        providerRef.current = provider;
        provider.start().catch((err) => {
          setErrorMsg(err.message || 'Failed to start voice agent');
          setUiState('ERROR');
        });
      }
      // Provider is running — mic is streaming continuously, nothing more to do
      return;
    }

    // LISTENING / CONNECTING / PROCESSING — pressing mic has no action (agent is working)
  }, [uiState, isAgentSpeaking, createProvider]);

  // ── Mute toggle ─────────────────────────────────────────────────────────────

  const handleMuteToggle = useCallback(() => {
    setIsMuted((prev) => !prev);
    // If muting while speaking, interrupt audio playback
    if (!isMuted && isAgentSpeaking) {
      providerRef.current?.interruptSpeaking();
      setIsAgentSpeaking(false);
    }
  }, [isMuted, isAgentSpeaking]);

  // ── Status label ─────────────────────────────────────────────────────────────

  const getStatusLabel = (): string => {
    if (uiState === 'CONNECTING') return 'Connecting to Voice Agent...';
    if (uiState === 'RECONNECTING') return 'Reconnecting...';
    if (uiState === 'LISTENING') {
      return selectedLanguage === 'hi'
        ? 'Sun raha hoon... (Listening — bolte rahiye)'
        : 'Listening... (speak naturally)';
    }
    if (uiState === 'PROCESSING') return 'Processing your request...';
    if (uiState === 'SPEAKING') {
      return selectedLanguage === 'hi'
        ? 'Bol raha hoon... (tap to interrupt)'
        : 'Speaking response... (tap to interrupt)';
    }
    if (uiState === 'ERROR') return 'Tap Mic to Retry';
    // IDLE
    return selectedLanguage === 'hi'
      ? 'Tap Mic to Speak (बोलने के लिए माइक दबाएं)'
      : 'Tap Mic to Speak';
  };

  if (!isOpen) return null;

  const isConnected = uiState !== 'IDLE' && uiState !== 'ERROR' && uiState !== 'CONNECTING';

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="voice-assistant-title"
    >
      <div className="w-full max-w-lg bg-white dark:bg-[#072020] rounded-3xl border border-[#DDE8E4] dark:border-[#1A3A3A] shadow-2xl overflow-hidden flex flex-col max-h-[94vh] animate-in fade-in zoom-in-95 duration-150 relative">

        {/* ── Header ──────────────────────────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-[#073B3A] via-[#094840] to-[#087F6D] text-white px-4 py-3.5 sm:px-5 sm:py-4 flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-[#4FD1C5] ring-2 ring-white/20 shrink-0">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h2 id="voice-assistant-title" className="text-sm sm:text-base font-bold truncate">
                  HealthSure Voice Agent
                </h2>
                <span className={`text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full border shrink-0 ${
                  isConnected
                    ? 'bg-[#4FD1C5]/20 text-[#A7D9CE] border-[#4FD1C5]/30'
                    : 'bg-white/10 text-white/60 border-white/20'
                }`}>
                  {isConnected ? 'LIVE' : uiState === 'CONNECTING' ? 'CONNECTING' : 'DEEPGRAM'}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-[#A7D9CE] truncate">
                {selectedLanguage === 'hi'
                  ? 'Hindi & English AI Healthcare Voice Agent'
                  : 'Natural Language AI Healthcare Voice Agent'}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 ml-2">
            {/* Connection indicator */}
            <div className="p-2" title={isConnected ? 'Connected to Deepgram' : 'Disconnected'}>
              {isConnected ? (
                <Wifi className="w-3.5 h-3.5 text-[#4FD1C5]" />
              ) : (
                <WifiOff className="w-3.5 h-3.5 text-white/40" />
              )}
            </div>

            {/* Language Switch */}
            <button
              type="button"
              onClick={handleLanguageSwitch}
              className="px-2.5 py-1 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all cursor-pointer border border-white/20"
              title="Switch Language"
            >
              {selectedLanguage === 'hi' ? 'English' : 'हिंदी'}
            </button>

            {/* Mute Toggle */}
            <button
              type="button"
              onClick={handleMuteToggle}
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

            {/* Close Button */}
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

        {/* ── Conversation History ────────────────────────────────────────────── */}
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

              {/* Action Cards */}
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
                          onClick={() => handleTextQuery('Haan, book kar do')}
                          className="flex-1 py-2 px-3 rounded-xl bg-[#087F6D] hover:bg-[#073B3A] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                          <span>Haan / Confirm</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleTextQuery('Nahi, cancel karo')}
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
                          onClick={() => handleTextQuery('Haan, cancel kar do')}
                          className="flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                          <span>Haan / Cancel Appointment</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleTextQuery('Nahi, mat karo')}
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
                            onClick={() => handleTextQuery(`${doc.name} ke saath 11 baje book kar do`)}
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

          {/* Live transcript preview */}
          {liveTranscript && uiState === 'LISTENING' && (
            <div className="flex items-start">
              <div className="max-w-[85%] rounded-2xl p-3 bg-emerald-100/70 dark:bg-emerald-950/50 text-[#087F6D] dark:text-[#4FD1C5] text-xs sm:text-sm italic animate-pulse">
                &ldquo;{liveTranscript}&rdquo;
              </div>
            </div>
          )}

          {uiState === 'PROCESSING' && (
            <div className="flex items-center gap-2 text-xs font-semibold text-[#087F6D] dark:text-[#4FD1C5] p-2">
              <div className="w-2 h-2 rounded-full bg-[#087F6D] animate-ping" />
              <span>Checking real health data...</span>
            </div>
          )}

          {(uiState === 'CONNECTING' || uiState === 'RECONNECTING') && (
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-400 p-2">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <span>{uiState === 'CONNECTING' ? 'Connecting to Deepgram Voice Agent...' : 'Reconnecting...'}</span>
            </div>
          )}

          <div ref={turnsEndRef} />
        </div>

        {/* ── Controls ─────────────────────────────────────────────────────────── */}
        <div className="p-3.5 sm:p-4 bg-white dark:bg-[#072020] border-t border-[#DDE8E4] dark:border-[#1A3A3A] space-y-3 shrink-0">

          {/* Error Banner */}
          {uiState === 'ERROR' && errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
              <button
                type="button"
                onClick={handleMicButton}
                className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold text-[11px] hover:bg-rose-700 cursor-pointer shrink-0"
              >
                Retry
              </button>
            </div>
          )}

          {/* Center Voice Button */}
          <div className="flex flex-col items-center justify-center space-y-1.5">
            <div className="relative flex items-center justify-center">
              {/* Pulsing rings based on state */}
              {uiState === 'LISTENING' && (
                <>
                  <div className="absolute w-20 h-20 rounded-full bg-emerald-500/20 animate-ping" />
                  <div className="absolute w-16 h-16 rounded-full bg-emerald-500/30 animate-pulse" />
                </>
              )}
              {(uiState === 'SPEAKING' || isAgentSpeaking) && (
                <div className="absolute w-18 h-18 rounded-full bg-blue-500/25 animate-pulse" />
              )}
              {(uiState === 'CONNECTING' || uiState === 'RECONNECTING') && (
                <div className="absolute w-18 h-18 rounded-full bg-amber-500/25 animate-ping" />
              )}

              <button
                type="button"
                onClick={handleMicButton}
                className={`relative z-10 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer ${
                  uiState === 'LISTENING'
                    ? 'bg-rose-500 hover:bg-rose-600 text-white ring-4 ring-rose-300'
                    : uiState === 'SPEAKING' || isAgentSpeaking
                    ? 'bg-blue-600 hover:bg-blue-700 text-white ring-4 ring-blue-300'
                    : uiState === 'ERROR'
                    ? 'bg-amber-600 hover:bg-amber-700 text-white ring-4 ring-amber-300'
                    : uiState === 'CONNECTING' || uiState === 'RECONNECTING'
                    ? 'bg-amber-500 text-white ring-4 ring-amber-300 opacity-75'
                    : 'bg-[#087F6D] hover:bg-[#073B3A] text-white ring-4 ring-emerald-300/40'
                }`}
                aria-label={uiState === 'LISTENING' ? 'Stop listening' : 'Start voice agent'}
                title={uiState === 'LISTENING' ? 'Tap to interrupt' : uiState === 'SPEAKING' ? 'Tap to interrupt' : 'Tap to speak'}
              >
                {uiState === 'LISTENING' ? (
                  <MicOff className="w-6 h-6 text-white" />
                ) : uiState === 'CONNECTING' || uiState === 'RECONNECTING' ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Mic className="w-6 h-6 text-white" />
                )}
              </button>
            </div>

            <div className="text-center">
              <span className="text-xs font-bold text-[#17324D] dark:text-[#E2EEF4]">
                {getStatusLabel()}
              </span>
            </div>
          </div>

          {/* Quick Voice Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-xs no-scrollbar">
            <button
              type="button"
              onClick={() => handleTextQuery('Mujhe Wednesday ko available doctors batao')}
              className="px-2.5 py-1 rounded-full bg-[#F5F9F7] dark:bg-[#0F2929] border border-[#DDE8E4] dark:border-[#1A3A3A] hover:border-[#087F6D] text-[#087F6D] dark:text-[#4FD1C5] font-semibold whitespace-nowrap cursor-pointer transition-colors"
            >
              Wednesday Doctors
            </button>
            <button
              type="button"
              onClick={() => handleTextQuery('Meri next appointment kab hai?')}
              className="px-2.5 py-1 rounded-full bg-[#F5F9F7] dark:bg-[#0F2929] border border-[#DDE8E4] dark:border-[#1A3A3A] hover:border-[#087F6D] text-[#087F6D] dark:text-[#4FD1C5] font-semibold whitespace-nowrap cursor-pointer transition-colors"
            >
              My Next Appointment
            </button>
            <button
              type="button"
              onClick={() => handleTextQuery('Doctor se video consultation start karni hai')}
              className="px-2.5 py-1 rounded-full bg-[#F5F9F7] dark:bg-[#0F2929] border border-[#DDE8E4] dark:border-[#1A3A3A] hover:border-[#087F6D] text-[#087F6D] dark:text-[#4FD1C5] font-semibold whitespace-nowrap cursor-pointer transition-colors"
            >
              Start Teleconsult
            </button>
            <button
              type="button"
              onClick={() => handleTextQuery('Meri health records dikhao')}
              className="px-2.5 py-1 rounded-full bg-[#F5F9F7] dark:bg-[#0F2929] border border-[#DDE8E4] dark:border-[#1A3A3A] hover:border-[#087F6D] text-[#087F6D] dark:text-[#4FD1C5] font-semibold whitespace-nowrap cursor-pointer transition-colors"
            >
              Health Records
            </button>
          </div>

          {/* Text Input Fallback */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleTextQuery(textInput);
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

          {/* Developer Diagnostics (Collapsible) */}
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
                  {uiState}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900 text-[9px] font-mono uppercase text-emerald-700 dark:text-emerald-300">
                  DEEPGRAM
                </span>
              </div>
              {showDiagnostics ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showDiagnostics && (
              <div className="mt-2 p-3 rounded-2xl bg-[#0C1E1E] text-[#A7D9CE] font-mono text-[10px] space-y-1 border border-[#1A3A3A] shadow-inner">
                <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                  <div>
                    <span className="text-[#64748B]">State:</span>{' '}
                    <span className="text-emerald-400 font-bold">{uiState}</span>
                  </div>
                  <div>
                    <span className="text-[#64748B]">Engine:</span>{' '}
                    <span className="text-cyan-400 font-bold">Deepgram VA</span>
                  </div>
                  <div>
                    <span className="text-[#64748B]">Lang:</span>{' '}
                    <span className="text-white">{selectedLanguage === 'hi' ? 'hi-IN' : 'en-IN'}</span>
                  </div>
                  <div>
                    <span className="text-[#64748B]">Muted:</span>{' '}
                    <span className={isMuted ? 'text-rose-400' : 'text-emerald-400'}>{isMuted ? 'yes' : 'no'}</span>
                  </div>
                  <div>
                    <span className="text-[#64748B]">Agent Speaking:</span>{' '}
                    <span className={isAgentSpeaking ? 'text-blue-400' : 'text-white'}>{isAgentSpeaking ? 'yes' : 'no'}</span>
                  </div>
                  <div>
                    <span className="text-[#64748B]">Connected:</span>{' '}
                    <span className={isConnected ? 'text-emerald-400' : 'text-amber-400'}>{isConnected ? 'yes' : 'no'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[#64748B]">Last Fn Call:</span>{' '}
                    <span className="text-white truncate">{lastFunctionCall}</span>
                  </div>
                </div>
                {lastAgentResponse && (
                  <div className="pt-1 text-cyan-300 border-t border-[#1A3A3A] truncate">
                    <span className="text-[#64748B]">Last Response:</span> &ldquo;{lastAgentResponse.slice(0, 80)}&rdquo;
                  </div>
                )}
                {lastFunctionResult && (
                  <div className="pt-1 text-green-300 border-t border-[#1A3A3A] truncate">
                    <span className="text-[#64748B]">Fn Result:</span> &ldquo;{lastFunctionResult}&rdquo;
                  </div>
                )}
                {errorMsg && (
                  <div className="pt-1 text-rose-400 border-t border-rose-900/50">
                    <span className="text-rose-300 font-bold">Error:</span> {errorMsg}
                  </div>
                )}
                {liveTranscript && (
                  <div className="pt-1 text-yellow-300 border-t border-[#1A3A3A] truncate">
                    <span className="text-[#64748B]">Live:</span> &ldquo;{liveTranscript}&rdquo;
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
