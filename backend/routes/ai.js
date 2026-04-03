const express = require('express');
const router  = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const { startSession, sendMessage } = require('../services/aiGateway');

// ─── POST /api/ai/start ──────────────────────────────────────────────────
router.post('/start', auth, async (req, res) => {
  try {
    const correlationId = req.headers['x-correlation-id'];
    if (!correlationId) {
      return res.status(400).json({ error: 'X-Correlation-ID header missing' });
    }

    const aiResult = await startSession(correlationId);
    if (!aiResult) {
      // Failsafe format recognized by frontend
      return res.status(503).json({ error: 'AI unavailable' });
    }

    res.json(aiResult);
  } catch (err) {
    console.error('[/api/ai/start] Base error:', err);
    res.status(500).json({ error: 'AI start error' });
  }
});

// ─── POST /api/ai/answer ─────────────────────────────────────────────────
router.post('/answer', auth, async (req, res) => {
  try {
    const correlationId = req.headers['x-correlation-id'];
    const { sessionId, message, questionnaireId, questionId, answer } = req.body;

    if (!correlationId || !sessionId) {
      return res.status(400).json({ error: 'Missing headers or session details' });
    }

    const payload = { sessionId, message, questionnaireId, questionId, answer };
    const aiResult = await sendMessage(correlationId, payload);

    if (!aiResult) {
      return res.status(503).json({ error: 'AI unavailable' });
    }

    // Handle COMPLETED phase interception
    if (aiResult.phase === 'COMPLETED') {
        const user = req.user;
        // Save full object to MongoDB
        if (!user.assessments) {
            user.assessments = [];
        }
        user.assessments.push(aiResult);

        // Map latest insights for dashboard
        if (aiResult.aiServiceResponse) {
            user.lastAiInsight = aiResult.aiServiceResponse;
            if (aiResult.aiServiceResponse.recommendations?.length > 0) {
                user.suggestedActivity = aiResult.aiServiceResponse.recommendations[0];
            }
        }
        await user.save();

        // Strip payload for frontend
        return res.json({
            aiServiceResponse: aiResult.aiServiceResponse,
            result: aiResult.result,
            phase: aiResult.phase,
            sessionId: aiResult.sessionId
        });
    }

    // Normal progression format
    res.json(aiResult);

  } catch (err) {
    console.error('[/api/ai/answer] Base error:', err);
    res.status(500).json({ error: 'AI answer error' });
  }
});

// ─── GET /api/ai/history ──────────────────────────────────────────────────
// Kept just in case the app breaks without it during page transitions
router.get('/history', auth, async (req, res) => {
  try {
    const history = (req.user.chatHistory || []).slice(-50);
    res.json({ history });
  } catch (err) {
    console.error('[/api/ai/history]', err);
    res.status(500).json({ message: 'Could not load chat history' });
  }
});

module.exports = router;
