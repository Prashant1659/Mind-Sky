const express = require('express');
const router  = express.Router();
const { v4: uuidv4 } = require('uuid');
const auth = require('../middleware/auth');
const { getDashboardInsights } = require('../services/aiGateway');

// ─── GET /api/dashboard ───────────────────────────────────────────────────
router.get('/', auth, async (req, res) => {
  try {
    const user          = req.user;
    const correlationId = uuidv4();

    const aiResult = await getDashboardInsights({
      sessionId:   user.sessionId,
      correlationId,
      lastInsight: user.lastAiInsight || null,
    });

    const insight = aiResult?.aiServiceResponse || {};

    res.json({
      correlationId,
      // Raw AI response
      aiServiceResponse: insight,

      // Dashboard-mapped fields
      emotionalScore:    user.emotionalScore || 75,
      summary:           insight.summary            || null,
      severityExplanation: insight.severityExplanation || null,
      keyFindings:       insight.keyFindings        || [],
      recommendations:   insight.recommendations    || [],
      reassurance:       insight.reassurance        || null,

      // Gamification from DB
      streak: user.streak || 0,
      level:  user.level  || 1,
      xp:     user.xp     || 0,
      mood:   user.mood   || '😊',
    });
  } catch (err) {
    console.error('[/api/dashboard]', err);
    res.status(500).json({ message: 'Dashboard error' });
  }
});

router.get('/fetch', auth, async (req, res) => {
  try {
    const user = req.user;
    res.json({
      assessments: user.assessments
    });
  } catch (err) {
    console.error('[/api/dashboard/fetch]', err);
    res.status(500).json({ message: 'Dashboard fetch error' });
  }
});


module.exports = router;
