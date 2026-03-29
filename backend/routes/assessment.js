const express = require('express');
const router  = express.Router();
const { v4: uuidv4 } = require('uuid');
const auth = require('../middleware/auth');
const { sendAssessment } = require('../services/aiGateway');

// ─── POST /api/assessment/submit ──────────────────────────────────────────
router.post('/submit', auth, async (req, res) => {
  try {
    const { questionnaireId, responses } = req.body;
    if (!questionnaireId || !responses) {
      return res.status(400).json({ message: 'questionnaireId and responses are required' });
    }

    const user          = req.user;
    const correlationId = uuidv4();

    const aiResult = await sendAssessment({
      sessionId:       user.sessionId,
      correlationId,
      questionnaireId,
      responses,
    });

    // Persist the AI insight to the user record
    if (aiResult?.aiServiceResponse) {
      user.lastAiInsight = aiResult.aiServiceResponse;

      // Map AI fields to dashboard fields
      const rec = aiResult.aiServiceResponse.recommendations || [];
      if (rec.length > 0) {
        user.suggestedActivity = rec[0];
      }
      await user.save();
    }

    res.json({
      correlationId,
      result: aiResult,
    });
  } catch (err) {
    console.error('[/api/assessment/submit]', err);
    res.status(500).json({ message: 'Assessment submission error' });
  }
});

module.exports = router;
