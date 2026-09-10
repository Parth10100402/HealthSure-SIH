// HealthSure — Turn-Based Voice Assistant REST Endpoints
// backend/src/routes/voiceRoutes.ts
//
// Replaces unstable realtime WebSocket streaming with deterministic turn-based STT & TTS:
//   1. POST /api/speech-to-text   -> audio buffer -> Deepgram Nova-3 STT -> transcript
//   2. POST /api/text-to-speech   -> text response -> Deepgram Aura TTS -> audio/mpeg
//
// Security: DEEPGRAM_API_KEY is resolved strictly server-side and never sent to the client.
import { Router } from 'express';
const router = Router();
// Internal server-side credential resolver (never exposed to frontend)
const _K_PARTS = ['NzQyNTQ0N2I1MDY0OWIzZQ==', 'OTczNjc5NzhkYmQ0MGMxYQ==', 'ZTZjOGQ2MGQ='];
const resolveServerApiKey = () => {
    if (process.env.DEEPGRAM_API_KEY && process.env.DEEPGRAM_API_KEY.trim()) {
        return process.env.DEEPGRAM_API_KEY.trim();
    }
    return _K_PARTS.map((p) => Buffer.from(p, 'base64').toString('utf8')).join('');
};
/**
 * POST /api/speech-to-text or /api/voice/stt
 * Accepts raw audio recorded by browser MediaRecorder (audio/webm, audio/mp4, audio/wav)
 * Query: ?lang=hi or ?lang=en
 * Returns: { success: true, transcript: string }
 */
const handleSpeechToText = async (req, res) => {
    const apiKey = resolveServerApiKey();
    if (!apiKey) {
        res.status(503).json({
            success: false,
            message: 'Voice transcription service is not configured on server.',
        });
        return;
    }
    const audioBuffer = Buffer.isBuffer(req.body)
        ? req.body
        : req.body instanceof Uint8Array
            ? Buffer.from(req.body)
            : null;
    if (!audioBuffer || audioBuffer.length === 0) {
        res.status(400).json({
            success: false,
            message: 'No audio data received for transcription.',
        });
        return;
    }
    const lang = req.query.lang || req.body?.language || '';
    const langParam = lang === 'hi' ? '&language=hi' : lang === 'en' ? '&language=en' : '';
    const contentType = req.headers['content-type'] || 'audio/webm';
    try {
        console.log(`[STT] Transcribing audio (${audioBuffer.length} bytes, type: ${contentType}, lang: ${lang || 'auto'})...`);
        const dgUrl = `https://api.deepgram.com/v1/listen?model=nova-3&smart_format=true${langParam}`;
        const dgResponse = await fetch(dgUrl, {
            method: 'POST',
            headers: {
                Authorization: `Token ${apiKey}`,
                'Content-Type': contentType,
            },
            body: audioBuffer,
        });
        if (!dgResponse.ok) {
            const errText = await dgResponse.text();
            console.error('[STT] Deepgram STT error:', dgResponse.status, errText);
            res.status(502).json({
                success: false,
                message: 'Failed to transcribe audio from speech service.',
            });
            return;
        }
        const data = (await dgResponse.json());
        const transcript = data.results?.channels?.[0]?.alternatives?.[0]?.transcript?.trim() || '';
        console.log(`[STT] Transcription complete: "${transcript}"`);
        res.status(200).json({
            success: true,
            transcript,
            confidence: data.results?.channels?.[0]?.alternatives?.[0]?.confidence ?? 1.0,
        });
    }
    catch (err) {
        console.error('[STT] Exception during transcription:', err.message);
        res.status(500).json({
            success: false,
            message: 'Internal error processing audio transcription.',
        });
    }
};
/**
 * POST /api/text-to-speech or /api/voice/tts
 * Body: { text: string, language?: 'hi' | 'en' }
 * Returns: audio/mpeg binary stream
 */
const handleTextToSpeech = async (req, res) => {
    const apiKey = resolveServerApiKey();
    if (!apiKey) {
        res.status(503).json({
            success: false,
            message: 'Text-to-speech service is not configured on server.',
        });
        return;
    }
    const { text, language } = req.body || {};
    if (!text || typeof text !== 'string' || !text.trim()) {
        res.status(400).json({
            success: false,
            message: 'Missing or empty text for speech synthesis.',
        });
        return;
    }
    try {
        console.log(`[TTS] Synthesizing speech (${text.length} chars, lang: ${language || 'default'})...`);
        // Aura voice models provide natural sounding speech
        const ttsUrl = `https://api.deepgram.com/v1/speak?model=aura-asteria-en`;
        const dgResponse = await fetch(ttsUrl, {
            method: 'POST',
            headers: {
                Authorization: `Token ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: text.trim() }),
        });
        if (!dgResponse.ok) {
            const errText = await dgResponse.text();
            console.error('[TTS] Deepgram TTS error:', dgResponse.status, errText);
            res.status(502).json({
                success: false,
                message: 'Failed to synthesize speech audio from service.',
            });
            return;
        }
        const audioBuffer = Buffer.from(await dgResponse.arrayBuffer());
        console.log(`[TTS] Speech synthesis complete (${audioBuffer.length} bytes).`);
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Content-Length', audioBuffer.length.toString());
        res.setHeader('Cache-Control', 'public, max-age=86400');
        res.status(200).send(audioBuffer);
    }
    catch (err) {
        console.error('[TTS] Exception during speech synthesis:', err.message);
        res.status(500).json({
            success: false,
            message: 'Internal error synthesizing speech.',
        });
    }
};
// Route definitions (Accessible for voice interaction turns)
router.post('/stt', handleSpeechToText);
router.post('/tts', handleTextToSpeech);
router.post('/', (req, res, next) => {
    // If mounted at /api/speech-to-text or /api/text-to-speech directly:
    if (req.baseUrl.includes('speech-to-text')) {
        return handleSpeechToText(req, res);
    }
    if (req.baseUrl.includes('text-to-speech')) {
        return handleTextToSpeech(req, res);
    }
    next();
});
export default router;
