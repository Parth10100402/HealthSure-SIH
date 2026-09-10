// HealthSure — Voice Healthcare Agent Interactive Modal (Turn-Based Architecture)
// frontend/src/components/patient/VoiceAssistantModal.tsx
//
// ARCHITECTURE:
//   1. Discrete speech turn capture via MediaRecorder (speechRecorderService)
//   2. STT: POST /api/speech-to-text (Deepgram Nova-3) -> user transcript
//   3. Logic: voiceAgentService.processUserInput(transcript) -> HealthSure actions
//   4. TTS: POST /api/text-to-speech (Deepgram Aura) -> audio playback
//   5. Immediate hardware microphone track release on stop
//
// SECURITY: Zero API keys client-side. Server proxies STT and TTS securely.
// STATES: 'IDLE' | 'LISTENING' | 'TRANSCRIBING' | 'PROCESSING' | 'SPEAKING' | 'ERROR'

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
  Loader2,
} from 'lucide-react';
import { voiceAgent } from '../../services/voiceAgentService';
import { speechRecorder } from '../../services/speechRecorderService';
import { voicePipeline } from '../../services/voicePipelineService';
import type { VoiceConversationTurn } from '../../services/voiceAgentService';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export type UIAgentState =
  | 'IDLE'
  | 'LISTENING'
  | 'TRANSCRIBING'
  | 'PROCESSING'
  | 'SPEAKING'
  | 'ERROR';

const GREETING_HINDI =
  'Namaste! HealthSure Voice Agent mein aapka swagat hai. Bataiye, main aapki kaise seva kar sakta hoon?';
const GREETING_ENGLISH =
  'Welcome to HealthSure Voice Agent. How can I help you today?';

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  // Primary UI states
  const [uiState, setUiState] = useState<UIAgentState>('IDLE');
  const [liveTranscript, setLiveTranscript] = useState('');
  const [lastAgentResponse, setLastAgentResponse] = useState('');
  const [textInput, setTextInput] = useState('');
  const [turns, setTurns] = useState<VoiceConversationTurn[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<'hi' | 'en'>('hi');
  const [isMuted, setIsMuted] = useState(false);
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  const [audioVolume, setAudioVolume] = useState<number>(0);

  // Diagnostic state
  const [lastFunctionCall, setLastFunctionCall] = useState<string>('none');
  const [lastFunctionResult, setLastFunctionResult] = useState<string>('');
  const [showDiagnostics, setShowDiagnostics] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Refs for stale closure safety in async handlers
  const turnsEndRef = useRef<HTMLDivElement>(null);
  const selectedLanguageRef = useRef<'hi' | 'en'>('hi');
  const isMutedRef = useRef<boolean>(false);
  const isOpenRef = useRef<boolean>(false);
  const isGreetingPlayedRef = useRef<boolean>(false);

  useEffect(() => {
    selectedLanguageRef.current = selectedLanguage;
  }, [selectedLanguage]);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    turnsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [turns, liveTranscript, uiState]);

  // ── Stop all active recording & audio safely ────────────────────────────────
  const stopAllOperations = useCallback(() => {
    speechRecorder.cancel();
    voicePipeline.stopSpeaking();
    setIsAgentSpeaking(false);
    setAudioVolume(0);
  }, []);

  // ── Close handler ───────────────────────────────────────────────────────────
  const handleClose = useCallback(() => {
    console.log('[VoiceModal] Closing voice assistant modal');
    stopAllOperations();
    setUiState('IDLE');
    setLiveTranscript('');
    setErrorMsg('');
    isGreetingPlayedRef.current = false;
    onClose();
  }, [onClose, stopAllOperations]);

  // ── Execute agent logic on a recognized text turn ──────────────────────────
  const executeAgentTurn = useCallback(
    async (userInputText: string) => {
      const clean = userInputText.trim();
      if (!clean) return;

      console.log('[VoiceModal] Processing user input:', clean);
      setUiState('PROCESSING');
      setErrorMsg('');

      try {
        voiceAgent.setLanguage(selectedLanguageRef.current);
        const result = await voiceAgent.processUserInput(clean);

        // Update conversation turns from voiceAgent
        setTurns([...result.state.history]);
        setLastAgentResponse(result.spokenResponse);

        if (result.actionCard) {
          setLastFunctionCall(result.actionCard.type);
          setLastFunctionResult(JSON.stringify(result.actionCard.data).slice(0, 100));
        }

        // Handle text-to-speech
        if (result.spokenResponse && !isMutedRef.current) {
          setUiState('SPEAKING');
          setIsAgentSpeaking(true);

          await voicePipeline.speakText(
            result.spokenResponse,
            selectedLanguageRef.current,
            () => {
              if (isOpenRef.current) {
                setUiState('SPEAKING');
                setIsAgentSpeaking(true);
              }
            },
            () => {
              if (isOpenRef.current) {
                setIsAgentSpeaking(false);
                setUiState('IDLE');
              }
            }
          );
        } else {
          setUiState('IDLE');
          setIsAgentSpeaking(false);
        }

        // Automatic navigation if intent warrants it
        if (result.navigateUrl) {
          setTimeout(() => {
            if (isOpenRef.current) {
              handleClose();
              navigate(result.navigateUrl!);
            }
          }, 2400);
        }
      } catch (err: any) {
        console.error('[VoiceModal] Error processing turn:', err);
        setUiState('ERROR');
        setErrorMsg(err.message || 'Kripya dobara koshish karein.');
        setIsAgentSpeaking(false);
      }
    },
    [handleClose, navigate]
  );

  // ── Text input query handler (and chips/buttons) ───────────────────────────
  const handleTextQuery = useCallback(
    async (queryText: string) => {
      const clean = queryText.trim();
      if (!clean) return;

      // Stop any speaking audio
      voicePipeline.stopSpeaking();
      setIsAgentSpeaking(false);
      setTextInput('');

      await executeAgentTurn(clean);
    },
    [executeAgentTurn]
  );

  // ── Discrete Voice Turn Capture ───────────────────────────────────────────
  const startListeningTurn = useCallback(async () => {
    // If currently speaking, stop audio
    voicePipeline.stopSpeaking();
    setIsAgentSpeaking(false);
    setErrorMsg('');
    setLiveTranscript('');
    setUiState('LISTENING');

    try {
      console.log('[VoiceModal] Starting single-turn speech recording...');
      const recordingResult = await speechRecorder.start({
        maxDurationMs: 15000,
        silenceThresholdMs: 2200,
        onVolumeChange: (vol) => {
          if (isOpenRef.current) {
            setAudioVolume(vol);
          }
        },
        onSilenceDetected: () => {
          console.log('[VoiceModal] Silence detected, finalizing speech turn.');
        },
      });

      setAudioVolume(0);

      if (!isOpenRef.current) {
        console.log('[VoiceModal] Modal closed while recording, discarding.');
        return;
      }

      if (recordingResult.durationMs < 400 || recordingResult.blob.size < 800) {
        // Ignored accidental tap or empty audio
        console.log('[VoiceModal] Audio clip too short or silent.');
        setUiState('IDLE');
        return;
      }

      // Step 2: Transcribe via Deepgram Nova-3 STT
      setUiState('TRANSCRIBING');
      console.log('[VoiceModal] Transcribing audio blob...');

      const transcript = await voicePipeline.transcribeAudio(
        recordingResult.blob,
        selectedLanguageRef.current
      );

      if (!isOpenRef.current) return;

      if (!transcript || !transcript.trim()) {
        console.log('[VoiceModal] No speech detected in audio.');
        setUiState('IDLE');
        setLiveTranscript(
          selectedLanguageRef.current === 'hi'
            ? 'Aapki aawaz sunayi nahi di. Kripya dobara bolein.'
            : 'No speech detected. Please tap mic and speak clearly.'
        );
        setTimeout(() => {
          if (isOpenRef.current) setLiveTranscript('');
        }, 3000);
        return;
      }

      // Step 3: Run transcript through existing Voice Agent
      setLiveTranscript('');
      await executeAgentTurn(transcript);
    } catch (err: any) {
      console.error('[VoiceModal] Speech turn error:', err);
      if (isOpenRef.current) {
        setUiState('ERROR');
        setErrorMsg(err.message || 'Microphone recording failed.');
        setAudioVolume(0);
      }
    }
  }, [executeAgentTurn]);

  // ── Mic button click ────────────────────────────────────────────────────────
  const handleMicButton = useCallback(() => {
    // 1. If agent is currently speaking -> Barge-in (interrupt)
    if (uiState === 'SPEAKING' || isAgentSpeaking) {
      console.log('[VoiceModal] Barge-in: interrupting agent speaking.');
      voicePipeline.stopSpeaking();
      setIsAgentSpeaking(false);
      setUiState('IDLE');
      return;
    }

    // 2. If currently recording -> Stop recording early & proceed to transcribe
    if (uiState === 'LISTENING') {
      console.log('[VoiceModal] User stopped recording manually.');
      speechRecorder.stop();
      return;
    }

    // 3. If in error or idle state -> Start listening
    if (uiState === 'IDLE' || uiState === 'ERROR') {
      startListeningTurn();
      return;
    }

    // 4. In transcribing or processing -> Busy, do nothing
  }, [uiState, isAgentSpeaking, startListeningTurn]);

  // ── Open / Close lifecycle ─────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      voiceAgent.setLanguage(selectedLanguage);

      // Initialize greeting if fresh conversation
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
        setLastAgentResponse(greeting);

        // Speak greeting once on initial fresh open if not muted
        if (!isGreetingPlayedRef.current && !isMutedRef.current) {
          isGreetingPlayedRef.current = true;
          setUiState('SPEAKING');
          setIsAgentSpeaking(true);

          voicePipeline
            .speakText(
              greeting,
              selectedLanguage,
              () => {
                if (isOpenRef.current) {
                  setUiState('SPEAKING');
                  setIsAgentSpeaking(true);
                }
              },
              () => {
                if (isOpenRef.current) {
                  setIsAgentSpeaking(false);
                  setUiState('IDLE');
                }
              }
            )
            .catch(() => {
              if (isOpenRef.current) {
                setIsAgentSpeaking(false);
                setUiState('IDLE');
              }
            });
        }
      } else {
        setTurns([...state.history]);
        setUiState('IDLE');
      }
    } else {
      // Modal closed
      stopAllOperations();
      setUiState('IDLE');
      setLiveTranscript('');
    }

    return () => {
      stopAllOperations();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // ── Language switch ────────────────────────────────────────────────────────
  const handleLanguageSwitch = useCallback(() => {
    const nextLang = selectedLanguage === 'hi' ? 'en' : 'hi';
    setSelectedLanguage(nextLang);
    voiceAgent.setLanguage(nextLang);
    // If agent is speaking, stop current speech
    voicePipeline.stopSpeaking();
    setIsAgentSpeaking(false);
    setUiState('IDLE');
  }, [selectedLanguage]);

  // ── Mute toggle ────────────────────────────────────────────────────────────
  const handleMuteToggle = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      if (next) {
        voicePipeline.stopSpeaking();
        setIsAgentSpeaking(false);
        if (uiState === 'SPEAKING') setUiState('IDLE');
      }
      return next;
    });
  }, [uiState]);

  // ── Status label helper ────────────────────────────────────────────────────
  const getStatusLabel = (): string => {
    if (uiState === 'LISTENING') {
      return selectedLanguage === 'hi'
        ? 'Sun raha hoon... (बोलिए / Tap to finish)'
        : 'Listening... (Speak now / Tap to stop)';
    }
    if (uiState === 'TRANSCRIBING') {
      return selectedLanguage === 'hi'
        ? 'Aapki aawaz samajh rahe hain (Nova-3)...'
        : 'Transcribing speech (Nova-3)...';
    }
    if (uiState === 'PROCESSING') {
      return selectedLanguage === 'hi'
        ? 'HealthSure data check ho raha hai...'
        : 'Checking real health data...';
    }
    if (uiState === 'SPEAKING' || isAgentSpeaking) {
      return selectedLanguage === 'hi'
        ? 'Bol raha hoon... (Tap mic to interrupt)'
        : 'Speaking response... (Tap to interrupt)';
    }
    if (uiState === 'ERROR') {
      return selectedLanguage === 'hi'
        ? 'Tap Mic to Retry (दोबारा बोलें)'
        : 'Tap Mic to Retry';
    }
    // IDLE
    return selectedLanguage === 'hi'
      ? 'Tap Mic to Speak (बोलने के लिए माइक दबाएं)'
      : 'Tap Mic to Speak';
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="voice-assistant-title"
    >
      <div className="w-full max-w-lg bg-white dark:bg-[#072020] rounded-3xl border border-[#DDE8E4] dark:border-[#1A3A3A] shadow-2xl overflow-hidden flex flex-col max-h-[94vh] animate-in fade-in zoom-in-95 duration-150 relative">

        {/* ── Header ────────────────────────────────────────────────────────── */}
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
                <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full border shrink-0 bg-[#4FD1C5]/20 text-[#A7D9CE] border-[#4FD1C5]/30">
                  NOVA-3 &amp; AURA
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
            {/* Engine status indicator */}
            <div
              className="p-1.5 flex items-center gap-1 text-[11px] text-[#A7D9CE]"
              title="Turn-Based Voice Architecture: STT -> Agent -> TTS"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="hidden sm:inline font-mono text-[10px]">READY</span>
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

        {/* ── Conversation History ──────────────────────────────────────────── */}
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
                          <span>
                            {t.actionCard.data.dateDisplay || t.actionCard.data.date} at{' '}
                            {t.actionCard.data.time}
                          </span>
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
                        Doctor: <strong>{t.actionCard.data.doctorName}</strong> (
                        {t.actionCard.data.speciality})
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
                            onClick={() =>
                              handleTextQuery(`${doc.name} ke saath 11 baje book kar do`)
                            }
                            className="p-2 rounded-xl bg-[#F5F9F7] dark:bg-[#051818] hover:bg-emerald-100/50 flex items-center justify-between cursor-pointer text-xs"
                          >
                            <div>
                              <div className="font-bold text-[#17324D] dark:text-[#E2EEF4]">
                                {doc.name}
                              </div>
                              <div className="text-[11px] text-[#64748B] dark:text-[#7B9EA8]">
                                {doc.speciality}
                              </div>
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
                        Department: {t.actionCard.data.department} | Priority:{' '}
                        {t.actionCard.data.priority}
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
                        <div
                          key={r.id}
                          className="p-2 rounded-xl bg-white dark:bg-[#0A2020] border border-blue-100"
                        >
                          <div className="font-bold">
                            {r.diagnosis} • {r.date}
                          </div>
                          <div className="text-[11px] text-[#64748B]">
                            {r.doctorName} ({r.speciality})
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Live transcript or status feedback */}
          {liveTranscript && (
            <div className="flex items-start">
              <div className="max-w-[85%] rounded-2xl p-3 bg-emerald-100/70 dark:bg-emerald-950/50 text-[#087F6D] dark:text-[#4FD1C5] text-xs sm:text-sm italic animate-pulse">
                &ldquo;{liveTranscript}&rdquo;
              </div>
            </div>
          )}

          {uiState === 'TRANSCRIBING' && (
            <div className="flex items-center gap-2 text-xs font-semibold text-[#087F6D] dark:text-[#4FD1C5] p-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl">
              <Loader2 className="w-4 h-4 animate-spin text-[#087F6D]" />
              <span>Transcribing audio via Deepgram Nova-3...</span>
            </div>
          )}

          {uiState === 'PROCESSING' && (
            <div className="flex items-center gap-2 text-xs font-semibold text-[#087F6D] dark:text-[#4FD1C5] p-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl">
              <div className="w-2 h-2 rounded-full bg-[#087F6D] animate-ping" />
              <span>Checking real HealthSure database &amp; doctor schedules...</span>
            </div>
          )}

          <div ref={turnsEndRef} />
        </div>

        {/* ── Controls ──────────────────────────────────────────────────────── */}
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
              {/* Audio volume visualizer rings when listening */}
              {uiState === 'LISTENING' && (
                <>
                  <div
                    className="absolute rounded-full bg-emerald-500/20 transition-all duration-75"
                    style={{
                      width: `${64 + Math.round(audioVolume * 36)}px`,
                      height: `${64 + Math.round(audioVolume * 36)}px`,
                    }}
                  />
                  <div className="absolute w-20 h-20 rounded-full bg-emerald-500/25 animate-ping" />
                </>
              )}

              {(uiState === 'SPEAKING' || isAgentSpeaking) && (
                <div className="absolute w-18 h-18 rounded-full bg-blue-500/25 animate-pulse" />
              )}

              <button
                type="button"
                onClick={handleMicButton}
                disabled={uiState === 'TRANSCRIBING' || uiState === 'PROCESSING'}
                className={`relative z-10 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95 cursor-pointer disabled:cursor-not-allowed ${
                  uiState === 'LISTENING'
                    ? 'bg-rose-500 hover:bg-rose-600 text-white ring-4 ring-rose-300 animate-pulse'
                    : uiState === 'SPEAKING' || isAgentSpeaking
                    ? 'bg-blue-600 hover:bg-blue-700 text-white ring-4 ring-blue-300'
                    : uiState === 'ERROR'
                    ? 'bg-amber-600 hover:bg-amber-700 text-white ring-4 ring-amber-300'
                    : uiState === 'TRANSCRIBING' || uiState === 'PROCESSING'
                    ? 'bg-[#087F6D]/70 text-white ring-4 ring-emerald-200'
                    : 'bg-[#087F6D] hover:bg-[#073B3A] text-white ring-4 ring-emerald-300/40'
                }`}
                aria-label={
                  uiState === 'LISTENING'
                    ? 'Stop listening'
                    : uiState === 'SPEAKING'
                    ? 'Tap to interrupt'
                    : 'Tap to speak'
                }
                title={
                  uiState === 'LISTENING'
                    ? 'Tap to stop'
                    : uiState === 'SPEAKING'
                    ? 'Tap to interrupt'
                    : 'Tap to speak'
                }
              >
                {uiState === 'LISTENING' ? (
                  <MicOff className="w-6 h-6 text-white" />
                ) : uiState === 'TRANSCRIBING' || uiState === 'PROCESSING' ? (
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
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
              disabled={!textInput.trim() || uiState === 'PROCESSING'}
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
                <span>Architecture Diagnostics</span>
                <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[9px] font-mono uppercase">
                  {uiState}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900 text-[9px] font-mono uppercase text-emerald-700 dark:text-emerald-300">
                  TURN-BASED REST
                </span>
              </div>
              {showDiagnostics ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>

            {showDiagnostics && (
              <div className="mt-2 p-3 rounded-2xl bg-[#0C1E1E] text-[#A7D9CE] font-mono text-[10px] space-y-1 border border-[#1A3A3A] shadow-inner">
                <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                  <div>
                    <span className="text-[#64748B]">State:</span>{' '}
                    <span className="text-emerald-400 font-bold">{uiState}</span>
                  </div>
                  <div>
                    <span className="text-[#64748B]">Pipeline:</span>{' '}
                    <span className="text-cyan-400 font-bold">Nova-3 STT + Aura TTS</span>
                  </div>
                  <div>
                    <span className="text-[#64748B]">Lang:</span>{' '}
                    <span className="text-white">
                      {selectedLanguage === 'hi' ? 'hi-IN' : 'en-IN'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#64748B]">Muted:</span>{' '}
                    <span className={isMuted ? 'text-rose-400' : 'text-emerald-400'}>
                      {isMuted ? 'yes' : 'no'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#64748B]">Speaking:</span>{' '}
                    <span className={isAgentSpeaking ? 'text-blue-400' : 'text-white'}>
                      {isAgentSpeaking ? 'yes' : 'no'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#64748B]">Mic Active:</span>{' '}
                    <span className={speechRecorder.isActive() ? 'text-rose-400' : 'text-slate-400'}>
                      {speechRecorder.isActive() ? 'recording' : 'released'}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[#64748B]">Last Fn Call:</span>{' '}
                    <span className="text-white truncate">{lastFunctionCall}</span>
                  </div>
                </div>
                {lastAgentResponse && (
                  <div className="pt-1 text-cyan-300 border-t border-[#1A3A3A] truncate">
                    <span className="text-[#64748B]">Last Response:</span> &ldquo;
                    {lastAgentResponse.slice(0, 80)}&rdquo;
                  </div>
                )}
                {lastFunctionResult && (
                  <div className="pt-1 text-green-300 border-t border-[#1A3A3A] truncate">
                    <span className="text-[#64748B]">Fn Result:</span> &ldquo;{lastFunctionResult}
                    &rdquo;
                  </div>
                )}
                {errorMsg && (
                  <div className="pt-1 text-rose-400 border-t border-rose-900/50">
                    <span className="text-rose-300 font-bold">Error:</span> {errorMsg}
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
