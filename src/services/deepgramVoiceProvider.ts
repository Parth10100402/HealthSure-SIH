/**
 * HealthSure — Deepgram Voice Agent Provider
 * src/services/deepgramVoiceProvider.ts
 *
 * Production-grade voice agent using Deepgram's Voice Agent WebSocket API.
 * This completely replaces browser SpeechRecognition as the primary voice engine.
 *
 * Architecture:
 *   Browser microphone (PCM audio) → Deepgram Voice Agent WebSocket → STT + LLM + TTS
 *   ← Function calls (tool_call) → voiceAgentService.ts (real HealthSure data) ←
 *   ← TTS audio chunks → AudioContext playback ←
 *
 * Token security: The raw DEEPGRAM_API_KEY never reaches the browser.
 * The browser fetches a short-lived token from /api/deepgram-token.
 */

import { voiceAgent } from './voiceAgentService';
import { getStoredToken } from './authService';

// ─── Types ────────────────────────────────────────────────────────────────────

export type DeepgramAgentState =
  | 'IDLE'
  | 'CONNECTING'
  | 'LISTENING'
  | 'PROCESSING'
  | 'SPEAKING'
  | 'RECONNECTING'
  | 'ERROR';

export interface DeepgramAgentCallbacks {
  onStateChange: (state: DeepgramAgentState) => void;
  onTranscript: (text: string, isFinal: boolean) => void;
  onAgentResponse: (text: string) => void;
  onAgentSpeaking: (playing: boolean) => void;
  onFunctionResult: (fnName: string, result: string) => void;
  onError: (msg: string) => void;
  onNavigate?: (url: string) => void;
}

interface DeepgramAgentConfig {
  language: 'hi' | 'en';
  callbacks: DeepgramAgentCallbacks;
}

// ─── Audio constants ──────────────────────────────────────────────────────────

const MIC_SAMPLE_RATE = 16000;   // Deepgram STT prefers 16kHz linear16
const TTS_SAMPLE_RATE = 16000;   // Deepgram TTS output in linear16 16kHz
const AUDIO_CHUNK_MS = 100;      // Send audio every 100ms

// ─── HealthSure Voice Agent function definitions for Deepgram ────────────────
// These map to the tools that the Deepgram LLM can call

const HEALTHSURE_FUNCTIONS = [
  {
    name: 'get_my_appointments',
    description: 'Get the authenticated patient\'s upcoming appointments, including doctor name, date, time, facility, token number, and status.',
    parameters: { type: 'object', properties: {} },
  },
  {
    name: 'get_doctor_availability',
    description: 'Find available doctors and specialists. Returns list of doctors with their specialities and availability.',
    parameters: {
      type: 'object',
      properties: {
        speciality: { type: 'string', description: 'Medical speciality e.g. Cardiology, Orthopedics, Gynecology' },
        date: { type: 'string', description: 'Date string e.g. Wednesday, tomorrow, 2026-09-15' },
      },
    },
  },
  {
    name: 'get_health_records',
    description: 'Retrieve the patient\'s health records including diagnoses, prescriptions, and test results.',
    parameters: { type: 'object', properties: {} },
  },
  {
    name: 'get_referral_status',
    description: 'Check the status of the patient\'s medical referrals.',
    parameters: { type: 'object', properties: {} },
  },
  {
    name: 'start_teleconsultation',
    description: 'Check for and start an active teleconsultation/video doctor session.',
    parameters: { type: 'object', properties: {} },
  },
  {
    name: 'book_appointment',
    description: 'Book an appointment after getting explicit YES/HAAN confirmation from patient. REQUIRES confirmation before executing.',
    parameters: {
      type: 'object',
      properties: {
        doctor_name: { type: 'string', description: 'Full name of the doctor' },
        date: { type: 'string', description: 'Date of appointment' },
        time: { type: 'string', description: 'Time of appointment e.g. 10:00 AM' },
      },
      required: ['doctor_name', 'date', 'time'],
    },
  },
  {
    name: 'cancel_appointment',
    description: 'Cancel an existing appointment. REQUIRES explicit YES/HAAN confirmation from patient first.',
    parameters: {
      type: 'object',
      properties: {
        appointment_id: { type: 'string', description: 'ID of the appointment to cancel' },
      },
    },
  },
  {
    name: 'navigate_healthsure',
    description: 'Navigate to a section of the HealthSure application like appointments, records, referrals, teleconsultation.',
    parameters: {
      type: 'object',
      properties: {
        destination: {
          type: 'string',
          enum: ['appointments', 'records', 'referrals', 'teleconsultation', 'outreach', 'help'],
          description: 'The section to navigate to',
        },
      },
      required: ['destination'],
    },
  },
  {
    name: 'trigger_sos',
    description: 'Trigger emergency SOS alert and provide emergency contact numbers.',
    parameters: { type: 'object', properties: {} },
  },
];

// Navigation URL mapping
const NAV_URLS: Record<string, string> = {
  appointments: '/patient/appointments',
  records: '/patient/records',
  referrals: '/patient/referrals',
  teleconsultation: '/patient/teleconsultation',
  outreach: '/patient/outreach',
  help: '/patient/help',
};

// ─── DeepgramVoiceProvider class ─────────────────────────────────────────────

export class DeepgramVoiceProvider {
  private ws: WebSocket | null = null;
  private audioContext: AudioContext | null = null;
  private micStream: MediaStream | null = null;
  private micProcessor: ScriptProcessorNode | null = null;
  private micSource: MediaStreamAudioSourceNode | null = null;
  private audioQueue: ArrayBuffer[] = [];
  private isPlayingAudio = false;
  private audioPlayerNode: AudioBufferSourceNode | null = null;
  private state: DeepgramAgentState = 'IDLE';
  private language: 'hi' | 'en' = 'hi';
  private callbacks: DeepgramAgentCallbacks;
  private shouldReconnect = false;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 3;
  private isDestroyed = false;

  constructor(config: DeepgramAgentConfig) {
    this.language = config.language;
    this.callbacks = config.callbacks;
  }

  // ── Public API ──────────────────────────────────────────────────────────────

  public setLanguage(lang: 'hi' | 'en') {
    this.language = lang;
    voiceAgent.setLanguage(lang);
  }

  public getState(): DeepgramAgentState {
    return this.state;
  }

  /**
   * Start the Deepgram Voice Agent session.
   * Opens microphone, fetches short-lived token, connects WebSocket.
   */
  public async start(): Promise<void> {
    if (this.state !== 'IDLE' && this.state !== 'ERROR') {
      console.log('[DGAgent] start() called but state is', this.state, '— skipping');
      return;
    }

    this.isDestroyed = false;
    this.shouldReconnect = true;
    this.reconnectAttempts = 0;
    voiceAgent.setLanguage(this.language);

    await this._startSession();
  }

  /**
   * Stop the session entirely. Releases mic, closes WebSocket, stops audio.
   */
  public stop(): void {
    console.log('[DGAgent] stop() called');
    this.isDestroyed = true;
    this.shouldReconnect = false;
    this._cleanup();
    this._setState('IDLE');
  }

  /**
   * Interrupt agent speech (barge-in) — for when the user taps mic while agent speaks.
   */
  public interruptSpeaking(): void {
    this._stopAudioPlayback();
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      // Send an empty audio frame to signal barge-in
      try {
        this.ws.send(new ArrayBuffer(0));
      } catch {}
    }
  }

  // ── Session lifecycle ───────────────────────────────────────────────────────

  private async _startSession(): Promise<void> {
    try {
      this._setState('CONNECTING');

      // 1. Request microphone permission
      await this._openMicrophone();
      if (this.isDestroyed) return;

      // 2. Fetch short-lived token from backend
      const token = await this._fetchToken();
      if (this.isDestroyed) return;
      if (!token) {
        this._setState('ERROR');
        this.callbacks.onError('Failed to obtain voice agent authorization token. Please check your connection and try again.');
        return;
      }

      // 3. Connect WebSocket to Deepgram Voice Agent API
      this._connectWebSocket(token);
    } catch (err: any) {
      console.error('[DGAgent] _startSession error:', err);
      this._setState('ERROR');
      this.callbacks.onError(err.message || 'Failed to start voice session');
    }
  }

  private async _openMicrophone(): Promise<void> {
    console.log('[DGAgent] Opening microphone...');
    try {
      this.micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: MIC_SAMPLE_RATE,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      console.log('[DGAgent] Microphone opened');
    } catch (err: any) {
      console.error('[DGAgent] Microphone access denied:', err);
      throw new Error(`Microphone access denied: ${err.message || err.name}. Please allow microphone access in your browser settings.`);
    }
  }

  private async _fetchToken(): Promise<string | null> {
    console.log('[DGAgent] Fetching short-lived Deepgram token from backend...');
    try {
      const authToken = getStoredToken();
      const response = await fetch('/api/deepgram-token', {
        method: 'GET',
        headers: {
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
      });

      if (!response.ok) {
        const body = await response.text();
        console.error('[DGAgent] Token fetch failed:', response.status, body);

        // If unauthorized, it might be a demo/unauthenticated session
        // Try to provide a useful error
        if (response.status === 401) {
          throw new Error('You must be logged in to use the Voice Agent.');
        }
        if (response.status === 503) {
          throw new Error('Voice Agent service is not configured. Please contact support.');
        }
        throw new Error(`Voice token error (${response.status})`);
      }

      const token = await response.text();
      console.log('[DGAgent] Token received successfully');
      return token;
    } catch (err: any) {
      console.error('[DGAgent] _fetchToken error:', err.message);
      throw err;
    }
  }

  private _connectWebSocket(token: string): void {
    // Deepgram Voice Agent WebSocket URL (v1/agent/converse with Sec-WebSocket-Protocol)
    const wsUrl = 'wss://agent.deepgram.com/v1/agent/converse';

    console.log('[DGAgent] Connecting WebSocket to Deepgram Voice Agent at', wsUrl);

    try {
      this.ws = new WebSocket(wsUrl, ['bearer', token]);
      this.ws.binaryType = 'arraybuffer';

      this.ws.onopen = () => {
        console.log('[DGAgent] WebSocket connected');
        this._sendSettings();
      };

      this.ws.onmessage = (event) => {
        this._handleWsMessage(event);
      };

      this.ws.onerror = (event) => {
        console.error('[DGAgent] WebSocket error:', event);
        this.callbacks.onError('Voice agent connection error. Please try again.');
      };

      this.ws.onclose = (event) => {
        console.log('[DGAgent] WebSocket closed:', event.code, event.reason);
        this._onWebSocketClose(event);
      };
    } catch (err: any) {
      console.error('[DGAgent] Failed to create WebSocket:', err);
      this._setState('ERROR');
      this.callbacks.onError('Failed to connect to voice agent service.');
    }
  }

  private _sendSettings(): void {
    const greeting =
      this.language === 'hi'
        ? 'Namaste! Main HealthSure Voice Agent hoon. Aap mujhse Hindi ya English mein baat kar sakte hain. Bataiye, main aapki kaise seva kar sakta hoon?'
        : 'Welcome to HealthSure Voice Agent. I can help you with appointments, doctors, health records, and referrals. How can I help you today?';

    const systemPrompt =
      this.language === 'hi'
        ? `You are HealthSure Voice Agent — a compassionate, professional healthcare assistant for rural Indian patients. 
You speak Hindi and English naturally (Hinglish is fine).
You help patients with: finding doctors, booking/cancelling appointments, checking health records, referral status, teleconsultation, and emergency support.

CRITICAL RULES:
- For appointment booking and cancellation: ALWAYS ask for explicit YES (Haan/Yes/Confirm) before executing. Never skip confirmation.
- All patient data is scoped to the authenticated patient only.
- For emergencies, immediately provide 108 and HealthSure helpline 07314624692.
- Use the provided functions to get real data. Never make up doctor names, appointment times, or availability.
- Speak in a warm, simple manner that rural patients understand.
- Keep responses concise — 2-3 sentences max unless listing items.

Greeting to speak: "${greeting}"`
        : `You are HealthSure Voice Agent — a professional, empathetic healthcare assistant.
You speak English and understand Hinglish naturally.
Help patients with: doctors, appointments, health records, referrals, teleconsultation, and emergencies.

CRITICAL RULES:
- For booking/cancellation: ALWAYS require explicit YES/Confirm before executing. 
- All data is scoped to the authenticated patient.
- For emergencies: provide 108 and HealthSure helpline 07314624692.
- Use functions for real data. Never fabricate availability or appointments.
- Keep responses concise — 2-3 sentences max unless listing items.

Greeting to speak: "${greeting}"`;

    const settings = {
      type: 'Settings',
      audio: {
        input: {
          encoding: 'linear16',
          sample_rate: MIC_SAMPLE_RATE,
        },
        output: {
          encoding: 'linear16',
          sample_rate: TTS_SAMPLE_RATE,
          container: 'none',
        },
      },
      agent: {
        listen: {
          provider: {
            type: 'deepgram',
            model: 'nova-3',
          },
        },
        think: {
          provider: {
            type: 'open_ai',
            model: 'gpt-4o-mini',
          },
          prompt: systemPrompt,
          functions: HEALTHSURE_FUNCTIONS,
        },
        speak: {
          provider: {
            type: 'deepgram',
            model: this.language === 'hi' ? 'aura-asteria-en' : 'aura-asteria-en',
          },
        },
        greeting: greeting,
      },
    };

    console.log('[DGAgent] Sending Settings message');
    this.ws!.send(JSON.stringify(settings));
  }

  // ── WebSocket message handler ────────────────────────────────────────────────

  private _handleWsMessage(event: MessageEvent): void {
    // Binary data = audio chunk from TTS
    if (event.data instanceof ArrayBuffer) {
      this._handleAudioChunk(event.data);
      return;
    }

    // JSON message from agent
    try {
      const msg = JSON.parse(event.data as string);
      const type = msg.type as string;

      switch (type) {
        case 'SettingsApplied':
          console.log('[DGAgent] Settings applied. Starting mic stream...');
          this._startMicStream();
          this._setState('LISTENING');
          break;

        case 'UserStartedSpeaking':
          console.log('[DGAgent] User started speaking');
          this._stopAudioPlayback(); // Barge-in
          this._setState('LISTENING');
          this.callbacks.onAgentSpeaking(false);
          break;

        case 'AgentStartedSpeaking':
          console.log('[DGAgent] Agent started speaking');
          this._setState('SPEAKING');
          this.callbacks.onAgentSpeaking(true);
          break;

        case 'AgentAudioDone':
          console.log('[DGAgent] Agent audio done');
          this.callbacks.onAgentSpeaking(false);
          // Wait for queue to drain, then set LISTENING
          this._waitForAudioDone(() => {
            if (!this.isDestroyed && this.state === 'SPEAKING') {
              this._setState('LISTENING');
            }
          });
          break;

        case 'ConversationText': {
          // Transcript text from user or agent
          const role = msg.role as string;
          const content = msg.content as string;
          if (role === 'user') {
            console.log('[DGAgent] User said:', content);
            this.callbacks.onTranscript(content, true);
            this._setState('PROCESSING');
          } else if (role === 'assistant') {
            console.log('[DGAgent] Agent said:', content);
            this.callbacks.onAgentResponse(content);
          }
          break;
        }

        case 'FunctionCallRequest': {
          // Deepgram LLM wants to call a HealthSure tool
          const fnName = (msg.function_name || msg.name) as string;
          const fnCallId = (msg.function_call_id || msg.id || ('call_' + Date.now())) as string;
          const fnInput = (msg.input || msg.arguments || {}) as Record<string, any>;
          console.log('[DGAgent] Function call request:', fnName, fnInput);
          this._handleFunctionCall(fnName, fnInput, fnCallId);
          break;
        }

        case 'Error': {
          const errMsg = msg.description || msg.message || 'Voice agent error';
          console.error('[DGAgent] Server error:', errMsg);
          this.callbacks.onError(errMsg);
          break;
        }

        default:
          console.log('[DGAgent] Unhandled message type:', type, msg);
      }
    } catch (err) {
      // Not JSON — ignore (could be binary or other protocol)
    }
  }

  // ── Function call execution ──────────────────────────────────────────────────

  private async _handleFunctionCall(
    fnName: string,
    args: Record<string, any>,
    callId: string
  ): Promise<void> {
    let result = '';
    let navigateUrl: string | undefined;

    try {
      console.log(`[DGAgent] Executing function: ${fnName}`, args);

      // Route function calls to voiceAgentService (real data + business logic)
      switch (fnName) {
        case 'get_my_appointments': {
          const res = await voiceAgent.processUserInput('Meri next appointment kab hai?');
          result = res.spokenResponse;
          break;
        }

        case 'get_doctor_availability': {
          const query = args.speciality
            ? `${args.speciality} doctors ${args.date || 'available'} dikhao`
            : `${args.date || 'Wednesday'} ko available doctors batao`;
          const res = await voiceAgent.processUserInput(query);
          result = res.spokenResponse;
          break;
        }

        case 'get_health_records': {
          const res = await voiceAgent.processUserInput('Meri health records dikhao');
          result = res.spokenResponse;
          break;
        }

        case 'get_referral_status': {
          const res = await voiceAgent.processUserInput('Mera referral status kya hai?');
          result = res.spokenResponse;
          break;
        }

        case 'start_teleconsultation': {
          const res = await voiceAgent.processUserInput('Video consultation start karni hai');
          result = res.spokenResponse;
          navigateUrl = res.navigateUrl;
          break;
        }

        case 'book_appointment': {
          const query = `${args.doctor_name || 'Doctor'} ke saath ${args.date || 'kal'} ko ${args.time || '11 baje'} appointment book kar do`;
          const res = await voiceAgent.processUserInput(query);
          result = res.spokenResponse;
          navigateUrl = res.navigateUrl;
          break;
        }

        case 'cancel_appointment': {
          const res = await voiceAgent.processUserInput('Meri appointment cancel kar do');
          result = res.spokenResponse;
          break;
        }

        case 'navigate_healthsure': {
          const dest = args.destination as string;
          const url = NAV_URLS[dest] || '/patient';
          result = `Navigating to ${dest}.`;
          navigateUrl = url;
          break;
        }

        case 'trigger_sos': {
          const res = await voiceAgent.processUserInput('Emergency help chahiye, SOS');
          result = res.spokenResponse;
          break;
        }

        default:
          result = 'Function not available.';
      }

      console.log(`[DGAgent] Function result for ${fnName}:`, result.slice(0, 80));
      this.callbacks.onFunctionResult(fnName, result);

      // Handle navigation after function call
      if (navigateUrl && this.callbacks.onNavigate) {
        setTimeout(() => {
          this.callbacks.onNavigate!(navigateUrl!);
        }, 2500);
      }

      // Send result back to Deepgram
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({
          type: 'FunctionCallResponse',
          id: callId,
          function_call_id: callId,
          name: fnName,
          output: result,
          content: result,
        }));
      }
    } catch (err: any) {
      console.error(`[DGAgent] Function call error (${fnName}):`, err);
      result = `Error executing ${fnName}: ${err.message}`;

      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({
          type: 'FunctionCallResponse',
          id: callId,
          function_call_id: callId,
          name: fnName,
          output: result,
          content: result,
        }));
      }
    }
  }

  // ── Microphone streaming ─────────────────────────────────────────────────────

  private _startMicStream(): void {
    if (!this.micStream || !this.ws) return;

    try {
      console.log('[DGAgent] Starting microphone stream...');

      // Use AudioContext to capture and downsample mic audio
      this.audioContext = new AudioContext({ sampleRate: MIC_SAMPLE_RATE });
      this.micSource = this.audioContext.createMediaStreamSource(this.micStream);

      // ScriptProcessor captures audio frames (deprecated but universally supported)
      // In a future update, AudioWorklet would be preferable
      const bufferSize = Math.floor(MIC_SAMPLE_RATE * (AUDIO_CHUNK_MS / 1000));
      this.micProcessor = this.audioContext.createScriptProcessor(bufferSize, 1, 1);

      this.micProcessor.onaudioprocess = (event) => {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN || this.isDestroyed) return;
        if (this.state === 'IDLE' || this.state === 'CONNECTING' || this.state === 'ERROR') return;

        const pcmData = event.inputBuffer.getChannelData(0);
        const int16 = this._float32ToInt16(pcmData);
        try {
          this.ws.send(int16.buffer.slice(0) as ArrayBuffer);
        } catch (err) {
          // WebSocket might be closing — ignore
        }
      };

      this.micSource.connect(this.micProcessor);
      this.micProcessor.connect(this.audioContext.destination);

      console.log('[DGAgent] Mic stream started');
    } catch (err: any) {
      console.error('[DGAgent] Failed to start mic stream:', err);
      this.callbacks.onError('Failed to start microphone stream: ' + err.message);
    }
  }

  private _stopMicStream(): void {
    try {
      if (this.micProcessor) {
        this.micProcessor.disconnect();
        this.micProcessor.onaudioprocess = null;
        this.micProcessor = null;
      }
      if (this.micSource) {
        this.micSource.disconnect();
        this.micSource = null;
      }
      if (this.micStream) {
        this.micStream.getTracks().forEach((t) => t.stop());
        this.micStream = null;
      }
      if (this.audioContext && this.audioContext.state !== 'closed') {
        this.audioContext.close().catch(() => {});
        this.audioContext = null;
      }
    } catch (err) {
      console.warn('[DGAgent] Error stopping mic stream:', err);
    }
  }

  // ── Audio playback (TTS) ─────────────────────────────────────────────────────

  private _handleAudioChunk(buffer: ArrayBuffer): void {
    if (buffer.byteLength === 0) return;
    this.audioQueue.push(buffer);
    if (!this.isPlayingAudio) {
      this._drainAudioQueue();
    }
  }

  private _drainAudioQueue(): void {
    if (this.audioQueue.length === 0 || this.isDestroyed) {
      this.isPlayingAudio = false;
      return;
    }

    // Ensure AudioContext exists for playback
    if (!this.audioContext || this.audioContext.state === 'closed') {
      try {
        this.audioContext = new AudioContext({ sampleRate: TTS_SAMPLE_RATE });
      } catch {
        this.audioQueue = [];
        this.isPlayingAudio = false;
        return;
      }
    }

    // If AudioContext was suspended (e.g., first interaction), resume it
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume().then(() => this._drainAudioQueue()).catch(() => {});
      return;
    }

    this.isPlayingAudio = true;

    // Merge all queued chunks for smooth playback
    const totalBytes = this.audioQueue.reduce((sum, buf) => sum + buf.byteLength, 0);
    const merged = new Int16Array(totalBytes / 2);
    let offset = 0;
    for (const chunk of this.audioQueue) {
      const view = new Int16Array(chunk);
      merged.set(view, offset);
      offset += view.length;
    }
    this.audioQueue = [];

    // Convert Int16 to Float32 for AudioContext
    const float32 = this._int16ToFloat32(merged);
    const audioBuffer = this.audioContext.createBuffer(1, float32.length, TTS_SAMPLE_RATE);
    audioBuffer.getChannelData(0).set(float32);

    const source = this.audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.audioContext.destination);

    source.onended = () => {
      this.audioPlayerNode = null;
      // Check if more chunks arrived while playing
      if (this.audioQueue.length > 0) {
        this._drainAudioQueue();
      } else {
        this.isPlayingAudio = false;
      }
    };

    this.audioPlayerNode = source;
    source.start(0);
  }

  private _stopAudioPlayback(): void {
    this.audioQueue = [];
    if (this.audioPlayerNode) {
      try {
        this.audioPlayerNode.stop();
        this.audioPlayerNode.disconnect();
      } catch {}
      this.audioPlayerNode = null;
    }
    this.isPlayingAudio = false;
  }

  private _waitForAudioDone(callback: () => void): void {
    if (this.audioQueue.length === 0 && !this.isPlayingAudio) {
      callback();
    } else {
      // Poll until audio is drained
      const interval = setInterval(() => {
        if (this.audioQueue.length === 0 && !this.isPlayingAudio) {
          clearInterval(interval);
          callback();
        }
      }, 100);
      // Safety timeout
      setTimeout(() => {
        clearInterval(interval);
        callback();
      }, 10000);
    }
  }

  // ── WebSocket close / reconnect ──────────────────────────────────────────────

  private _onWebSocketClose(event: CloseEvent): void {
    if (this.isDestroyed) return;

    if (this.shouldReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(2000 * this.reconnectAttempts, 8000);
      console.log(`[DGAgent] Reconnecting (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms...`);
      this._setState('RECONNECTING');

      // Clean up mic before reconnect (will reopen in _startSession)
      this._stopMicStream();
      this.ws = null;

      setTimeout(async () => {
        if (!this.isDestroyed) {
          await this._startSession();
        }
      }, delay);
    } else if (event.code !== 1000) {
      // Abnormal close without reconnect
      this._setState('ERROR');
      this.callbacks.onError('Voice agent connection lost. Please try reopening the assistant.');
    } else {
      this._setState('IDLE');
    }
  }

  // ── Cleanup ──────────────────────────────────────────────────────────────────

  private _cleanup(): void {
    this._stopAudioPlayback();
    this._stopMicStream();

    if (this.ws) {
      try {
        this.ws.onopen = null;
        this.ws.onmessage = null;
        this.ws.onerror = null;
        this.ws.onclose = null;
        if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
          this.ws.close(1000, 'Session ended');
        }
      } catch {}
      this.ws = null;
    }
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────

  private _setState(newState: DeepgramAgentState): void {
    if (this.state === newState) return;
    console.log(`[DGAgent] State: ${this.state} → ${newState}`);
    this.state = newState;
    this.callbacks.onStateChange(newState);
  }

  private _float32ToInt16(buffer: Float32Array): Int16Array {
    const result = new Int16Array(buffer.length);
    for (let i = 0; i < buffer.length; i++) {
      const clamped = Math.max(-1, Math.min(1, buffer[i]));
      result[i] = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
    }
    return result;
  }

  private _int16ToFloat32(buffer: Int16Array): Float32Array {
    const result = new Float32Array(buffer.length);
    for (let i = 0; i < buffer.length; i++) {
      result[i] = buffer[i] / (buffer[i] < 0 ? 0x8000 : 0x7fff);
    }
    return result;
  }
}
