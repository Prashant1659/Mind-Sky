const express = require('express');
const router  = express.Router();
const { v4: uuidv4 } = require('uuid');
const auth = require('../middleware/auth');
const { sendChat, sendAssessment, getDashboardInsights } = require('../services/aiGateway');

// ─── POST /api/ai/chat ────────────────────────────────────────────────────
router.post('/chat', auth, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const user          = req.user;
    const correlationId = uuidv4();

    // Persist user message to chat history
    user.chatHistory.push({ role: 'user', content: message.trim() });

    const aiResult = await sendChat({
      sessionId:     user.sessionId,
      correlationId,
      message:       message.trim(),
      guideName:     user.selectedGuide || 'your guide',
    });

    const aiMessage = aiResult?.aiServiceResponse?.summary ||
                      aiResult?.aiServiceResponse?.reassurance ||
                      "I'm here with you. \uD83C\uDF1F";

    // Persist AI reply to chat history
    user.chatHistory.push({ role: 'assistant', content: aiMessage });

    // Keep chat history manageable (last 100 messages)
    if (user.chatHistory.length > 100) {
      user.chatHistory = user.chatHistory.slice(-100);
    }

    await user.save();

    res.json({
      reply:          aiMessage,
      aiFullResponse: aiResult,
      correlationId,
    });
  } catch (err) {
    console.error('[/api/ai/chat]', err);
    res.status(500).json({ message: 'AI chat error', reply: 'Something went wrong. Please try again.' });
  }
});

// ─── GET /api/ai/history ──────────────────────────────────────────────────
router.get('/history', auth, async (req, res) => {
  try {
    // Return last 50 messages for the chat panel
    const history = (req.user.chatHistory || []).slice(-50);
    res.json({ history });
  } catch (err) {
    console.error('[/api/ai/history]', err);
    res.status(500).json({ message: 'Could not load chat history' });
  }
});

module.exports = router;
