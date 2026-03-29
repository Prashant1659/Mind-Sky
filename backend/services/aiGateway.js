/**
 * AI Gateway Service — Mind Sky
 * Single source of intelligence for all AI interactions.
 * Set AI_GATEWAY_URL and AI_GATEWAY_KEY in your .env file.
 */

const AI_ENDPOINT = process.env.AI_GATEWAY_URL || null;
const AI_KEY      = process.env.AI_GATEWAY_KEY  || null;

// ─── Fallback responses ────────────────────────────────────────────────────

const FALLBACK_CHAT = (guideName = 'your guide') => ({
  aiServiceResponse: {
    summary: `${guideName} is here with you. The AI service is currently resting — but your feelings are always valid.`,
    severityExplanation: 'Unable to reach the AI at this time.',
    keyFindings: [],
    recommendations: [
      'Take three slow, deep breaths.',
      'Write a few thoughts in your journal.',
      'Reach out to someone you trust.',
    ],
    reassurance: "You're doing great just by showing up today. 🌟",
  },
  breakdown: {},
});

const FALLBACK_ASSESSMENT = {
  aiServiceResponse: {
    summary: 'Assessment received. AI analysis is temporarily unavailable.',
    severityExplanation: 'The AI service could not process your responses right now.',
    keyFindings: [],
    recommendations: [
      'Try submitting again in a few minutes.',
      'Your responses have been saved safely.',
    ],
    reassurance: 'Your mental health journey matters — we will get this analysed soon.',
  },
  breakdown: {},
};

const FALLBACK_DASHBOARD = {
  aiServiceResponse: {
    summary: 'AI insights are warming up. Check back shortly.',
    severityExplanation: '',
    keyFindings: [],
    recommendations: [
      'Practice mindful breathing.',
      'Stay consistent with your daily check-in.',
    ],
    reassurance: 'Small steps every day lead to big change.',
  },
  breakdown: {},
};

// ─── Core request helper ──────────────────────────────────────────────────

async function callAI(payload) {
  if (!AI_ENDPOINT) {
    console.warn('[AI Gateway] AI_GATEWAY_URL not set — using fallback.');
    return null; // caller decides which fallback to use
  }

  const headers = {
    'Content-Type': 'application/json',
    ...(AI_KEY ? { Authorization: `Bearer ${AI_KEY}` } : {}),
  };

  const response = await fetch(AI_ENDPOINT, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`AI Gateway returned ${response.status}: ${text}`);
  }

  return response.json();
}

// ─── Public API ───────────────────────────────────────────────────────────

/**
 * Send a chat message to the AI.
 * @param {{ sessionId, correlationId, message, guideName? }} payload
 */
async function sendChat(payload) {
  try {
    const result = await callAI({
      sessionId:     payload.sessionId,
      correlationId: payload.correlationId,
      message:       payload.message,
    });
    return result || FALLBACK_CHAT(payload.guideName);
  } catch (err) {
    console.error('[AI Gateway] sendChat error:', err.message);
    return FALLBACK_CHAT(payload.guideName);
  }
}

/**
 * Submit a completed questionnaire.
 * @param {{ sessionId, correlationId, questionnaireId, responses }} payload
 */
async function sendAssessment(payload) {
  try {
    const result = await callAI({
      sessionId:       payload.sessionId,
      correlationId:   payload.correlationId,
      questionnaireId: payload.questionnaireId,
      responses:       payload.responses,
    });
    return result || FALLBACK_ASSESSMENT;
  } catch (err) {
    console.error('[AI Gateway] sendAssessment error:', err.message);
    return FALLBACK_ASSESSMENT;
  }
}

/**
 * Fetch dashboard insights (uses last stored insight or re-requests from AI).
 * @param {{ sessionId, correlationId, lastInsight? }} payload
 */
async function getDashboardInsights(payload) {
  // If we have a cached insight, return it directly (no extra AI call)
  if (payload.lastInsight && payload.lastInsight.summary) {
    return { aiServiceResponse: payload.lastInsight, breakdown: {} };
  }

  try {
    const result = await callAI({
      sessionId:     payload.sessionId,
      correlationId: payload.correlationId,
      message:       'Provide a current mental health dashboard summary for this user.',
    });
    return result || FALLBACK_DASHBOARD;
  } catch (err) {
    console.error('[AI Gateway] getDashboardInsights error:', err.message);
    return FALLBACK_DASHBOARD;
  }
}

module.exports = { sendChat, sendAssessment, getDashboardInsights };
