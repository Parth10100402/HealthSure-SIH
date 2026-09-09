// HealthSure — Voice Healthcare Agent Interactive Modal
// frontend/src/components/patient/VoiceAssistantModal.tsx

import React, { useState, useEffect, useRef } from 'react';
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
} from 'lucide-react';
import { voiceAgent } from '../../services/voiceAgentService';
import type { VoiceConversationTurn } from '../../services/voiceAgentService';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AgentState = 'IDLE' | 'LISTENING' | 'PROCESSING' | 'SPEAKING';

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [agentState, setAgentState] = useState<AgentState>('IDLE');
  const [liveTranscript, setLiveTranscript] = useState('');
  const [textInput, setTextInput] = useState('');
  const [turns, setTurns] = useState<VoiceConversationTurn[]>([]);
  const [micPermissionDenied, setMicPermissionDenied] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'hi' | 'en'>('hi');
  const [isMuted, setIsMuted] = useState(false);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const turnsEndRef = useRef<HTMLDivElement>(null);

  // Initialize Speech Synthesis & Sync Turns
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      voiceAgent.setLanguage(selectedLanguage);
      const state = voiceAgent.getState();
      if (state.history.length === 0) {
        // Welcome greeting
        const welcome =
          selectedLanguage === 'hi'
            ? 'Namaste! Main aapka HealthSure Voice Assistant hoon. Aap bol sakte hain: "Wednesday ko available doctors batao", "Meri next appointment kab hai?", ya "Doctor se teleconsultation start karo".'
            : 'Hello! I am your HealthSure Voice Assistant. You can say: "Show available doctors for Wednesday", "When is my next appointment?", or "Start a teleconsultation".';
        
        voiceAgent.processUserInput('start_session_init').then(() => {
          // Replace greeting
          const s = voiceAgent.getState();
          s.history = [
            {
              id: 'turn-welcome',
              sender: 'agent',
              text: welcome,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ];
          setTurns([...s.history]);
          speakText(welcome);
        });
      } else {
        setTurns([...state.history]);
      }
    } else {
      stopListening();
      stopSpeaking();
    }
  }, [isOpen, selectedLanguage]);

  useEffect(() => {
    turnsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [turns, liveTranscript]);

  const speakText = (text: string) => {
    if (isMuted || !synthRef.current) return;
    try {
      synthRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = selectedLanguage === 'hi' ? 'hi-IN' : 'en-IN';
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      utterance.onstart = () => setAgentState('SPEAKING');
      utterance.onend = () => {
        setAgentState('IDLE');
        currentUtteranceRef.current = null;
      };
      utterance.onerror = () => {
        setAgentState('IDLE');
        currentUtteranceRef.current = null;
      };

      currentUtteranceRef.current = utterance;
      synthRef.current.speak(utterance);
    } catch {
      setAgentState('IDLE');
    }
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setAgentState('IDLE');
      currentUtteranceRef.current = null;
    }
  };

  const startListening = () => {
    stopSpeaking();
    setLiveTranscript('');
    setMicPermissionDenied(false);

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setMicPermissionDenied(true);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = selectedLanguage === 'hi' ? 'hi-IN' : 'en-IN';

      recognition.onstart = () => {
        setAgentState('LISTENING');
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        setLiveTranscript(transcript);
      };

      recognition.onerror = (event: any) => {
        if (event.error === 'not-allowed') {
          setMicPermissionDenied(true);
        }
        setAgentState('IDLE');
      };

      recognition.onend = () => {
        setAgentState('IDLE');
        if (liveTranscript.trim()) {
          handleSubmitQuery(liveTranscript);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setMicPermissionDenied(true);
      setAgentState('IDLE');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    if (agentState === 'LISTENING') {
      setAgentState('IDLE');
    }
  };

  const toggleMic = () => {
    if (agentState === 'LISTENING') {
      stopListening();
      if (liveTranscript.trim()) {
        handleSubmitQuery(liveTranscript);
      }
    } else {
      startListening();
    }
  };

  const handleSubmitQuery = async (queryText: string) => {
    if (!queryText.trim()) return;
    const userText = queryText.trim();
    setTextInput('');
    setLiveTranscript('');
    setAgentState('PROCESSING');
    stopSpeaking();

    try {
      const result = await voiceAgent.processUserInput(userText);
      setTurns([...result.state.history]);
      setAgentState('IDLE');

      if (result.spokenResponse) {
        speakText(result.spokenResponse);
      }

      if (result.navigateUrl) {
        setTimeout(() => {
          onClose();
          navigate(result.navigateUrl!);
        }, 1800);
      }
    } catch {
      setAgentState('IDLE');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div
        className="w-full max-w-lg bg-white dark:bg-[#072020] rounded-3xl border border-[#DDE8E4] dark:border-[#1A3A3A] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="voice-assistant-title"
      >
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-[#073B3A] via-[#094840] to-[#087F6D] text-white p-4 sm:p-5 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-[#4FD1C5] ring-2 ring-white/20">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="voice-assistant-title" className="text-base sm:text-lg font-bold">
                  HealthSure Voice Agent
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#4FD1C5]/20 text-[#A7D9CE] border border-[#4FD1C5]/30">
                  Real AI
                </span>
              </div>
              <p className="text-xs text-[#A7D9CE]">
                {selectedLanguage === 'hi' ? 'Hindi & English bolkar control karein' : 'Natural Spoken Healthcare Assistant'}
              </p>
            </div>
          </div>

          {/* Action buttons (Mute, Lang, Close) */}
          <div className="flex items-center gap-1.5">
            {/* Language Switch */}
            <button
              type="button"
              onClick={() => {
                const nextLang = selectedLanguage === 'hi' ? 'en' : 'hi';
                setSelectedLanguage(nextLang);
                voiceAgent.setLanguage(nextLang);
              }}
              className="px-2.5 py-1 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all cursor-pointer"
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
              className="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-colors cursor-pointer"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-300" /> : <Volume2 className="w-4 h-4 text-[#4FD1C5]" />}
            </button>

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-colors cursor-pointer"
              aria-label="Close Voice Assistant"
            >
              <X className="w-5 h-5" />
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

        {/* ── Microphone / Visualizer / Voice Controls ─────────────────────── */}
        <div className="p-4 sm:p-5 bg-white dark:bg-[#072020] border-t border-[#DDE8E4] dark:border-[#1A3A3A] space-y-3">
          {/* Permission warning if microphone blocked */}
          {micPermissionDenied && (
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Microphone access not available in this browser. Please use the text input below.</span>
            </div>
          )}

          {/* Center Voice Button & Visualizer */}
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="relative flex items-center justify-center">
              {/* Outer Pulsing Waves */}
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
                    ? 'bg-rose-500 text-white animate-bounce'
                    : agentState === 'SPEAKING'
                    ? 'bg-blue-600 text-white'
                    : 'bg-[#087F6D] hover:bg-[#073B3A] text-white'
                }`}
                aria-label={agentState === 'LISTENING' ? 'Stop listening' : 'Start speaking'}
              >
                {agentState === 'LISTENING' ? (
                  <MicOff className="w-6 h-6" />
                ) : (
                  <Mic className="w-6 h-6" />
                )}
              </button>
            </div>

            <div className="text-center">
              <span className="text-xs font-bold text-[#17324D] dark:text-[#E2EEF4]">
                {agentState === 'LISTENING'
                  ? 'Sun raha hoon... (Listening)'
                  : agentState === 'SPEAKING'
                  ? 'Speaking response...'
                  : agentState === 'PROCESSING'
                  ? 'Processing query...'
                  : 'Tap Mic to Speak (या नीचे टाइप करें)'}
              </span>
            </div>
          </div>

          {/* Quick Voice Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            <button
              type="button"
              onClick={() => handleSubmitQuery('Mujhe Wednesday ko available doctors batao')}
              className="px-2.5 py-1 rounded-full bg-[#F5F9F7] dark:bg-[#0F2929] border border-[#DDE8E4] dark:border-[#1A3A3A] hover:border-[#087F6D] text-[#087F6D] dark:text-[#4FD1C5] font-semibold whitespace-nowrap cursor-pointer"
            >
              Wednesday Doctors
            </button>
            <button
              type="button"
              onClick={() => handleSubmitQuery('Meri next appointment kab hai?')}
              className="px-2.5 py-1 rounded-full bg-[#F5F9F7] dark:bg-[#0F2929] border border-[#DDE8E4] dark:border-[#1A3A3A] hover:border-[#087F6D] text-[#087F6D] dark:text-[#4FD1C5] font-semibold whitespace-nowrap cursor-pointer"
            >
              My Next Appointment
            </button>
            <button
              type="button"
              onClick={() => handleSubmitQuery('Doctor se video consultation start karni hai')}
              className="px-2.5 py-1 rounded-full bg-[#F5F9F7] dark:bg-[#0F2929] border border-[#DDE8E4] dark:border-[#1A3A3A] hover:border-[#087F6D] text-[#087F6D] dark:text-[#4FD1C5] font-semibold whitespace-nowrap cursor-pointer"
            >
              Start Teleconsult
            </button>
          </div>

          {/* Text input Fallback */}
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
        </div>
      </div>
    </div>
  );
};
