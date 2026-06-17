const express = require('express');
const router  = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const { startSession, sendMessage } = require('../services/aiGateway');

const analyzeForCrisis = (text = '') => {
  if (!text) return false;
  const t = text.toLowerCase();
  const keywords = [
    "suicide", "kill myself", "end it all", "want to die",
    "no reason to live", "better off dead", "goodbye forever",
    "self harm", "cut myself", "hurt myself", "overdose"
  ];
  return keywords.some(k => t.includes(k));
};

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
    const { sessionId, message, questionnaireId, questionId, answer, responses } = req.body;
    // console.log('req.body : ',req.body);

    if (!correlationId || !sessionId) {
      return res.status(400).json({ error: 'Missing headers or session details' });
    }

    // 🚨 CRISIS CHECK - FIRST PRIORITY
    if (message && analyzeForCrisis(message)) {
      return res.json({
        phase: 'CRISIS',
        crisisDetected: true,
        sessionId
      });
    }

    const payload = { sessionId, message, questionnaireId, questionId, answer, responses };
    const aiResult = await sendMessage(correlationId, payload);

    if (!aiResult) {
      return res.status(503).json({ error: 'AI unavailable' });
    }

    // Handle COMPLETED phase interception
    if (aiResult.phase === 'COMPLETED') {
        const user = req.user;
        const chatSessionId = `session_${Date.now()}_${correlationId.slice(0, 8)}`;

        const newAssessment = {
            chatSessionId,
            completedAt: new Date(),
            data: aiResult
        };

        const updateData = {
            $push: {
                assessments: {
                    $each: [newAssessment],
                    $slice: -20
                },
                chatHistory: {
                    $each: [
                        { role: 'user', content: responses !== undefined ? (typeof responses === 'object' ? Object.values(responses).join(' | ') : String(responses)) : (answer !== undefined ? String(answer) : message) },
                        { role: 'assistant', content: aiResult.aiServiceResponse?.summary || 'Assessment Complete' }
                    ],
                    $slice: -50
                }
            }
        };

        if (aiResult.aiServiceResponse) {
            updateData.$set = {
                lastAiInsight: aiResult.aiServiceResponse
            };
            if (aiResult.result?.finalScore !== undefined) {
                updateData.$set.emotionalScore = aiResult.result.finalScore;
            }
            if (aiResult.aiServiceResponse.recommendations?.length > 0) {
                updateData.$set.suggestedActivity = aiResult.aiServiceResponse.recommendations[0];
            }
        }
        await User.findByIdAndUpdate(req.user._id, updateData);

        return res.json({
            aiServiceResponse: aiResult.aiServiceResponse,
            result: aiResult.result,
            phase: aiResult.phase,
            sessionId: aiResult.sessionId,
            chatSessionId
        });
    }

    // Normal progression format: persist history
    let aiText = '';
    if (aiResult.question?.text) aiText = aiResult.question.text;
    else if (aiResult.nextQuestion?.text) aiText = aiResult.nextQuestion.text;
    else if (aiResult.message) aiText = aiResult.message;

    if (aiText || answer !== undefined || responses !== undefined || message) {
        const historyPush = [];
        if (answer !== undefined || responses !== undefined || message) {
            historyPush.push({ role: 'user', content: responses !== undefined ? (typeof responses === 'object' ? Object.values(responses).join(' | ') : String(responses)) : (answer !== undefined ? String(answer) : message) });
        }
        if (aiText) {
            historyPush.push({ role: 'assistant', content: aiText });
        }
        if (historyPush.length > 0) {
            await User.findByIdAndUpdate(req.user._id, {
                $push: {
                    chatHistory: {
                        $each: historyPush,
                        $slice: -50
                    }
                }
            });
        }
    }

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

// ─── GET /api/ai/assessments ────────────────────────────────────────────────
// Returns the last 5 completed assessments for the Assessments tab
router.get('/assessments', auth, async (req, res) => {
  try {
    const all = req.user.assessments || [];
    // Return last 5, most recent first
    const last5 = all.slice(-5).reverse();
    res.json({ assessments: last5 });
  } catch (err) {
    console.error('[/api/ai/assessments]', err);
    res.status(500).json({ message: 'Could not load assessments' });
  }
});

module.exports = router;
