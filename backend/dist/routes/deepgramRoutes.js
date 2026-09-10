// HealthSure — Deepgram Voice Agent Token Route
// backend/src/routes/deepgramRoutes.ts
//
// Security: This endpoint authenticates the HealthSure JWT and returns a
// short-lived Deepgram access token. The master DEEPGRAM_API_KEY NEVER
// leaves the server. Only the short-lived token (30s TTL) is sent to the browser.
import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
const router = Router();
// GET /api/deepgram-token
// Requires valid HealthSure JWT (Bearer token) in Authorization header
// Returns: plain text short-lived Deepgram token
router.get('/', authenticate, async (req, res) => {
    const apiKey = process.env.DEEPGRAM_API_KEY;
    if (!apiKey) {
        console.error('[DeepgramToken] DEEPGRAM_API_KEY env variable is not set on server.');
        res.status(503).json({
            success: false,
            message: 'Voice Agent service is not configured. Please contact support.',
        });
        return;
    }
    try {
        console.log(`[DeepgramToken] Generating short-lived token for user: ${req.user?.userId} (${req.user?.role})`);
        // Call Deepgram's token grant endpoint to get a short-lived JWT
        const response = await fetch('https://api.deepgram.com/v1/auth/grant', {
            method: 'POST',
            headers: {
                Authorization: `Token ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({}),
        });
        if (!response.ok) {
            const errorBody = await response.text();
            console.error('[DeepgramToken] Deepgram API error:', response.status, errorBody);
            res.status(502).json({
                success: false,
                message: 'Failed to obtain voice agent token from upstream service.',
            });
            return;
        }
        const data = await response.json();
        if (!data.access_token) {
            console.error('[DeepgramToken] No access_token in Deepgram response:', data);
            res.status(502).json({
                success: false,
                message: 'Invalid response from voice agent upstream.',
            });
            return;
        }
        console.log(`[DeepgramToken] Token issued successfully for user: ${req.user?.userId}`);
        // Return ONLY the token string (not the raw API key, never the raw API key)
        res.status(200).send(data.access_token);
    }
    catch (err) {
        console.error('[DeepgramToken] Exception fetching token:', err.message);
        res.status(500).json({
            success: false,
            message: 'Internal error generating voice agent token.',
        });
    }
});
export default router;
