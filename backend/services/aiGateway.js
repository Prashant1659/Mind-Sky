/**
 * AI Gateway Service — Mind Sky
 * Replaces old placeholder logic. Hits local Docker container (localhost:8080).
 */

const AI_URL_START = 'http://localhost:8080/api/gateway/start';
const AI_URL_ANSWER = 'http://localhost:8080/api/gateway/answer';

async function startSession(correlationId) {
  try {
    const response = await fetch(AI_URL_START, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Correlation-ID': correlationId
      },
      body: JSON.stringify({ message: null })
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`[AI Gateway] /start error: ${response.status} ${text}`);
      return null;
    }

    return await response.json();
  } catch (err) {
    console.error(`[AI Gateway] startSession fetch error:`, err.message);
    return null;
  }
}

async function sendMessage(correlationId, payload) {
  try {
    let requestBody = {
      sessionId: payload.sessionId,
      correlationId: correlationId
    };

    if (payload.answer !== undefined) {
      requestBody.questionnaireId = payload.questionnaireId;
      requestBody.questionId = payload.questionId;
      requestBody.answer = payload.answer;
    } else {
      requestBody.message = payload.message;
    }

    const response = await fetch(AI_URL_ANSWER, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Correlation-ID': correlationId
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`[AI Gateway] /answer error: ${response.status} ${text}`);
      return null;
    }

    return await response.json();
  } catch (err) {
    console.error(`[AI Gateway] sendMessage fetch error:`, err.message);
    return null;
  }
}

// Dummy functions to prevent server crash from other routes
async function sendAssessment() { return null; }
async function getDashboardInsights() { return null; }
async function sendChat() { return null; }

module.exports = { 
  startSession, 
  sendMessage,
  sendAssessment,
  getDashboardInsights,
  sendChat
};
