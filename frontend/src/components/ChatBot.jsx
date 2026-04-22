import React, { useState, useEffect, useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { guides } from '../utils/constants';
import * as FiIcons from 'react-icons/fi';

/* ─────────────────────────────────────────────────────────────────────────────
   ChatBot.jsx
   Full-screen chat panel matching the MindSky glassmorphism / F0F7FF theme.
   Props:
     user        — current user object (from localStorage / parent state)
     onClose     — callback to close the chat panel
───────────────────────────────────────────────────────────────────────────── */

const API = (path) => `/api${path}`;

/* Typing indicator */
function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 px-5 py-3">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-2.5 h-2.5 rounded-full bg-[#0D1B2A]/30 animate-bounce"
          style={{ animationDelay: `${i * 150}ms`, animationDuration: '1s' }}
        />
      ))}
    </div>
  );
}

/* Compact session result card shown inside the chat bubble */
function SessionResultCard({ aiResponse, chatSessionId, completedAt }) {
  const [expanded, setExpanded] = useState(false);
  const date = completedAt ? new Date(completedAt).toLocaleString() : 'Just now';

  return (
    <div className="w-full mt-3 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 overflow-hidden shadow-sm">
      {/* Header bar */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-blue-100 bg-white/60">
        <FiIcons.FiCheckCircle size={13} className="text-emerald-500" />
        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Session Complete</span>
      </div>

      {/* Summary row */}
      <div className="px-4 py-3">
        {aiResponse?.summary && (
          <p className="text-xs font-medium text-[#0D1B2A]/80 leading-relaxed mb-2">{aiResponse.summary}</p>
        )}
        {aiResponse?.severityExplanation && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-wide mb-2">
            <FiIcons.FiAlertTriangle size={10} />
            {aiResponse.severityExplanation}
          </div>
        )}

        {/* Expandable detail */}
        {expanded && (
          <div className="mt-3 space-y-3 text-xs text-[#0D1B2A]/70 leading-relaxed">
            {aiResponse?.insights && (
              <div>
                <div className="font-black uppercase tracking-widest text-[9px] text-[#0D1B2A]/40 mb-1">Insights</div>
                <p>{aiResponse.insights}</p>
              </div>
            )}
            {aiResponse?.recommendations?.length > 0 && (
              <div>
                <div className="font-black uppercase tracking-widest text-[9px] text-[#0D1B2A]/40 mb-1">Recommendations</div>
                <ul className="space-y-1">
                  {aiResponse.recommendations.map((r, i) => (
                    <li key={i} className="flex items-start gap-1.5"><span className="text-blue-400 mt-0.5">•</span>{r}</li>
                  ))}
                </ul>
              </div>
            )}
            {aiResponse?.keyFindings?.length > 0 && (
              <div>
                <div className="font-black uppercase tracking-widest text-[9px] text-[#0D1B2A]/40 mb-1">Key Findings</div>
                <ul className="space-y-1">
                  {aiResponse.keyFindings.map((f, i) => (
                    <li key={i} className="flex items-start gap-1.5"><span className="text-indigo-400 mt-0.5">•</span>{f}</li>
                  ))}
                </ul>
              </div>
            )}
            {aiResponse?.reassurance && (
              <div className="px-3 py-2 bg-emerald-50 rounded-xl border border-emerald-100 italic text-emerald-700">
                {aiResponse.reassurance}
              </div>
            )}
            <div className="text-[9px] text-[#0D1B2A]/30 pt-1">Completed: {date}</div>
          </div>
        )}

        <button
          onClick={() => setExpanded(e => !e)}
          className="mt-2 text-[10px] font-black uppercase tracking-widest text-blue-400 hover:text-blue-600 flex items-center gap-1 transition-colors cursor-pointer"
        >
          {expanded ? <><FiIcons.FiChevronUp size={11} /> Show Less</> : <><FiIcons.FiChevronDown size={11} /> Full Report</>}
        </button>
      </div>
    </div>
  );
}

export default function ChatBot({ user, onClose, onUpdateUser }) {
  const guide     = guides.find((g) => g.id === user?.selectedGuide) || guides[0];
  const firstName = user?.fullName?.split(' ')[0] || 'Friend';

  const [messages,        setMessages]        = useState([]);
  const [input,           setInput]           = useState('');
  const [isTyping,        setIsTyping]        = useState(false);
  const isTypingRef                           = useRef(false);
  const [isLoading,       setIsLoading]       = useState(true);
  const [error,           setError]           = useState(null);
  const [sessionResult,   setSessionResult]   = useState(null); // { aiResponse, chatSessionId, completedAt }
  const [currentQuestion, setCurrentQuestion] = useState(null);

  // Docker Gateway integration states
  const [correlationId,   setCorrelationId]   = useState('');
  const [sessionId,       setSessionId]       = useState('');
  const [phase,           setPhase]           = useState('');
  const [questionId,      setQuestionId]      = useState('');
  const [questionnaireId, setQuestionnaireId] = useState('');
  const [dualSelections,  setDualSelections]  = useState({});

  const bottomRef = useRef(null);

  // ── Start / restart a session ──────────────────────────────────────────────
  const startSession = useCallback(async () => {
    setIsLoading(true);
    setMessages([]);
    setError(null);
    setSessionResult(null);
    setPhase('');
    setSessionId('');
    setQuestionId('');
    setQuestionnaireId('');
    setCurrentQuestion(null);
    setDualSelections({});

    try {
      const newCorrelationId = uuidv4();
      setCorrelationId(newCorrelationId);

      const token = localStorage.getItem('token');
      const res = await fetch(API('/ai/start'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Correlation-ID': newCorrelationId
        },
        body: JSON.stringify({ message: null })
      });

      if (!res.ok) throw new Error('Fallback required');

      const data = await res.json();
      setSessionId(data.sessionId);
      setPhase(data.phase);

      if (data.question?.text) {
        if (data.question.id) {
          setQuestionId(data.question.id);
          setQuestionnaireId(data.question.id.split('_')[0]);
        }
        if (data.phase === 'QUESTIONNAIRE') {
          setCurrentQuestion(data.question);
        } else {
          setMessages([{ role: 'assistant', content: data.question.text }]);
        }
      } else {
        setMessages([{
          role: 'assistant',
          content: `${guide.greeting} I'm ${guide.name}, your personal guide on Mind Sky. How are you feeling today, ${firstName}? 💙`,
        }]);
      }
    } catch {
      setMessages([{
        role: 'assistant',
        content: `${guide.greeting} I'm ${guide.name}. It seems my advanced systems are offline. I'm here to listen, ${firstName}.`,
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [guide, firstName]);

  // Load on mount
  useEffect(() => { startSession(); }, []);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Handle Crisis auto-trigger
  useEffect(() => {
    if (phase === 'CRISIS') {
      const dispatchCrisisAlert = async (lat, lng) => {
        try {
          const token = localStorage.getItem('token');
          await fetch('/api/crisis/trigger', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
              userId: user?._id || user?.id,
              userName: user?.fullName || 'User',
              crisisType: 'ai_detected',
              latitude: lat,
              longitude: lng
            })
          });
        } catch (err) {
          console.error('Crisis auto-trigger failed:', err);
        }
      };

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => dispatchCrisisAlert(pos.coords.latitude, pos.coords.longitude),
          () => dispatchCrisisAlert(null, null),
          { timeout: 5000 }
        );
      } else {
        dispatchCrisisAlert(null, null);
      }
    }
  }, [phase, user]);

  // ── Send message ────────────────────────────────────────────────────────────
  const handleSend = async (textOverride = null) => {
    if (isTypingRef.current) return;
    const text = textOverride !== null ? textOverride : input.trim();
    if (text === '' || text === null) return;

    if (textOverride === null) setInput('');
    setError(null);
    
    let displayAnswer = text;
    if (typeof text === 'object' && text !== null) {
      displayAnswer = Object.entries(text).map(([k, v]) => `${k.charAt(0).toUpperCase() + k.slice(1)}: ${v}`).join(' | ');
    }
    
    if (phase === 'QUESTIONNAIRE' && currentQuestion) {
      setMessages((prev) => [
        ...prev, 
        { role: 'assistant', content: currentQuestion.text },
        { role: 'user', content: displayAnswer.toString() }
      ]);
    } else {
      setMessages((prev) => [...prev, { role: 'user', content: displayAnswer.toString() }]);
    }
    
    isTypingRef.current = true;
    setIsTyping(true);

    try {
      const token = localStorage.getItem('token');

      let reqBody = { sessionId };
      if (phase === 'QUESTIONNAIRE') {
        reqBody.questionnaireId = questionnaireId;
        reqBody.questionId      = questionId;
        
        const answerTests = ['asrs', 'gad7', 'pcl5', 'phq9', 'pss10'];
        if (answerTests.includes(questionnaireId)) {
          reqBody.answer = text;
        } else {
          if (typeof text === 'object') {
            reqBody.responses = text;
          } else {
            const rKey = currentQuestion?.response_format?.response_key || 'value';
            reqBody.responses = { [rKey]: text };
          }
        }
      } else {
        reqBody.message = text;
      }

      const res = await fetch(API('/ai/answer'), {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Correlation-ID': correlationId
        },
        body: JSON.stringify(reqBody),
      });

      if (!res.ok) throw new Error('Connection issue');

      const data = await res.json();

      if (data.phase) {
        if (data.phase === 'QUESTIONNAIRE' && phase !== 'QUESTIONNAIRE') {
          setMessages((prev) => [
            ...prev,
            { role: 'system', content: 'CLINICAL ASSESSMENT STARTING' }
          ]);
        }
        setPhase(data.phase);
      }

      const questionObj = data.question || data.nextQuestion;
      if (questionObj?.id) {
        setQuestionId(questionObj.id);
        setQuestionnaireId(questionObj.id.split('_')[0]);
        setDualSelections({});
      }

      if (data.phase === 'COMPLETED') {
        setCurrentQuestion(null);
        // Save result for in-chat card + for assessments tab
        const result = {
          aiResponse:     data.aiServiceResponse,
          chatSessionId:  data.chatSessionId,
          completedAt:    new Date().toISOString()
        };
        setSessionResult(result);

        if (onUpdateUser && data.result?.finalScore !== undefined) {
          const rawUser = localStorage.getItem('user');
          if (rawUser) {
            try {
              const parsedUser = JSON.parse(rawUser);
              parsedUser.emotionalScore = data.result.finalScore;
              onUpdateUser(parsedUser);
            } catch (e) {}
          }
        }

        // Short confirmation message — result card is shown separately
        setMessages((prev) => [...prev, {
          role: 'assistant',
          content: `✅ Assessment complete! Your results have been saved securely. See your full report below.`,
          sessionResult: result
        }]);
      } else if (questionObj?.text) {
        if (data.phase === 'QUESTIONNAIRE') {
          setCurrentQuestion(questionObj);
        } else {
          setMessages((prev) => [...prev, { role: 'assistant', content: questionObj.text }]);
        }
      }
    } catch {
      setError('Connection issue. Please try again.');
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `I'm here, ${firstName}. It seems there was a connection issue — please try again in a moment. 💙` },
      ]);
    } finally {
      isTypingRef.current = false;
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (phase !== 'QUESTIONNAIRE' && phase !== 'COMPLETED' && phase !== 'CRISIS') handleSend();
    }
  };

  const confirmSafe = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/crisis/confirm-safe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
      });
      startSession();
    } catch(err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-transparent relative overflow-hidden">

      {/* Ambient glow */}
      <div className="absolute top-0 right-0 w-[50%] h-[40%] bg-blue-200/20 blur-[100px] rounded-full -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[40%] h-[30%] bg-indigo-200/20 blur-[80px] rounded-full -z-10 pointer-events-none" />

      {/* ── Header ── */}
      <header className="flex items-center gap-4 px-8 py-5 bg-white/60 backdrop-blur-xl border-b border-white/50 shrink-0">
        <div className="relative">
          <img
            src={guide.image}
            alt={guide.name}
            className="w-14 h-14 object-contain drop-shadow-lg"
            style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.12))' }}
          />
          <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white shadow" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-serif font-black text-[#0D1B2A] leading-tight">{guide.name}</h2>
          <p className="text-[10px] font-black uppercase tracking-widest text-[#0D1B2A]/40">
            {guide.tag} · AI Guide
          </p>
        </div>



        {/* Completed badge */}
        {phase === 'COMPLETED' && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full border border-emerald-100">
            <FiIcons.FiCheckCircle size={11} className="text-emerald-500" />
            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Done</span>
          </div>
        )}

        {/* AI-Powered pill */}
        <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full border border-blue-100">
          <FiIcons.FiCpu size={14} className="text-blue-400" />
          <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">AI-Powered</span>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer ml-2"
            aria-label="Close chat"
          >
            <FiIcons.FiX size={20} />
          </button>
        )}
      </header>

      {/* ── Message list ── */}
      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">

        {isLoading && (
          <div className="flex justify-center py-16">
            <div className="flex items-center gap-3 text-[#0D1B2A]/40">
              <FiIcons.FiLoader size={18} className="animate-spin" />
              <span className="text-sm font-medium">Starting secure session…</span>
            </div>
          </div>
        )}

        {!isLoading && messages.map((msg, i) => {
          if (msg.role === 'system') {
            return (
              <div key={i} className="flex items-center justify-center w-full py-4 my-2 opacity-80">
                <div className="h-px bg-blue-200/50 flex-1"></div>
                <span className="px-4 text-[10px] font-black uppercase tracking-widest text-blue-400">{msg.content}</span>
                <div className="h-px bg-blue-200/50 flex-1"></div>
              </div>
            );
          }
          return (
          <div
            key={i}
            className={`flex items-end gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {/* Avatar */}
            {msg.role === 'assistant' && (
              <img
                src={guide.image}
                alt={guide.name}
                className="w-9 h-9 object-contain shrink-0"
                style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.1))' }}
              />
            )}
            {msg.role === 'user' && (
              <div className="w-9 h-9 rounded-full bg-[#0D1B2A] flex items-center justify-center text-white text-sm font-black shrink-0">
                {firstName[0]}
              </div>
            )}

            {/* Bubble + optional result card */}
            <div className={`max-w-[72%] flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div
                className={`rounded-3xl px-5 py-4 text-sm leading-relaxed font-medium transition-all
                  ${msg.role === 'user'
                    ? 'bg-[#0D1B2A] text-white rounded-br-md shadow-lg'
                    : 'bg-white/80 backdrop-blur-md border border-white text-[#0D1B2A] rounded-bl-md shadow-sm'
                  }`}
                style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}
              >
                {msg.content}
              </div>

              {/* Inline session result card on the COMPLETED message */}
              {msg.sessionResult && (
                <SessionResultCard
                  aiResponse={msg.sessionResult.aiResponse}
                  chatSessionId={msg.sessionResult.chatSessionId}
                  completedAt={msg.sessionResult.completedAt}
                />
              )}
            </div>
          </div>
        )})}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-end gap-3">
            <img
              src={guide.image}
              alt={guide.name}
              className="w-9 h-9 object-contain shrink-0"
              style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.1))' }}
            />
            <div className="bg-white/80 backdrop-blur-md border border-white rounded-3xl rounded-bl-md shadow-sm">
              <TypingDots />
            </div>
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-100 rounded-2xl text-red-400 text-xs font-bold">
            <FiIcons.FiAlertCircle size={14} />
            {error}
          </div>
        )}

        <div ref={bottomRef} />

        {/* POP-UP OVERLAY FOR QUESTIONNAIRE */}
        {phase === 'QUESTIONNAIRE' && currentQuestion && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 md:p-12 bg-white/40 backdrop-blur-md">
            <div className="w-full max-w-lg bg-white rounded-[32px] border border-blue-100 shadow-[0_20px_60px_rgba(0,0,0,0.08)] p-8 text-center flex flex-col">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 mx-auto mb-6 shrink-0 shadow-inner">
                <FiIcons.FiClipboard size={28} />
              </div>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-3">Assessment Question</h3>
              <p className="text-xl md:text-2xl font-serif font-black text-[#0D1B2A] leading-relaxed mb-10">{currentQuestion.text}</p>
              
              {(() => {
                const format = currentQuestion.response_format || { type: 'scale', scale: 'likert_0_3' };
                
                if (format.type === 'scale') {
                  const parts = format.scale ? format.scale.split('_') : [];
                  let max = parseInt(parts[parts.length - 1]);
                  let min = parseInt(parts[parts.length - 2]);
                  
                  if (isNaN(max)) max = 3;
                  if (isNaN(min)) min = 0;
                  
                  const options = Array.from({length: (max - min) + 1}, (_, i) => i + min);
                  
                  return (
                    <>
                      <div className="flex flex-wrap justify-center gap-2">
                        {options.map((val) => (
                          <button
                            key={val}
                            onClick={() => handleSend(val)}
                            disabled={isTyping || isLoading}
                            className="w-11 h-11 md:w-12 md:h-12 bg-white hover:bg-blue-50 border-2 border-blue-100 text-blue-600 font-black text-lg md:text-xl rounded-xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer shrink-0"
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                      <div className="w-full text-center mt-6 text-[10px] uppercase font-black tracking-widest text-[#0D1B2A]/30">
                        {min} = Not at all &nbsp;&middot;&nbsp; {max} = Very much Likely
                      </div>
                    </>
                  );
                }

                if (format.type === 'number') {
                    return (
                        <div className="w-full flex flex-col items-center gap-4">
                          <div className="flex items-center gap-2">
                            <input 
                              type="number" 
                              id="number-input"
                              min={format.min ?? 0}
                              max={format.max ?? 100}
                              step={format.step ?? 1}
                              className="w-32 h-16 text-center text-2xl font-black text-[#0D1B2A] bg-white border-2 border-blue-100 rounded-2xl focus:border-blue-400 focus:outline-none"
                            />
                            {format.unit && <span className="text-sm font-bold text-[#0D1B2A]/50 uppercase">{format.unit}</span>}
                          </div>
                          <button
                            onClick={() => {
                                const val = document.getElementById('number-input').value;
                                if(val !== '') handleSend(format.allow_decimal ? parseFloat(val) : parseInt(val));
                            }}
                            disabled={isTyping || isLoading}
                            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm uppercase tracking-widest rounded-2xl transition-all cursor-pointer"
                          >
                            Submit
                          </button>
                        </div>
                    );
                }

                if (format.type === 'time') {
                    return (
                        <div className="w-full flex flex-col items-center gap-4">
                          <input 
                            type="time" 
                            id="time-input"
                            className="w-48 h-16 text-center text-xl font-black text-[#0D1B2A] bg-white border-2 border-blue-100 rounded-2xl focus:border-blue-400 focus:outline-none"
                          />
                          <button
                            onClick={() => {
                                const val = document.getElementById('time-input').value;
                                if(val) handleSend(val);
                            }}
                            disabled={isTyping || isLoading}
                            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm uppercase tracking-widest rounded-2xl transition-all cursor-pointer"
                          >
                            Submit
                          </button>
                        </div>
                    );
                }

                if (format.type === 'dual_scale') {
                     const scale1 = Object.keys(format.response_keys)[0];
                     const scale2 = Object.keys(format.response_keys)[1];
                     
                     const max1 = parseInt(format.response_keys[scale1].split('_').pop()) || 3;
                     const max2 = parseInt(format.response_keys[scale2].split('_').pop()) || 3;

                     return (
                        <div className="w-full flex flex-col gap-6">
                           <div>
                               <div className="text-[10px] font-black uppercase tracking-widest text-[#0D1B2A]/50 mb-2">{scale1}</div>
                               <div className="flex justify-center gap-2">
                                   {Array.from({length: max1 + 1}, (_, i) => i).map((val) => (
                                       <button
                                           key={`s1-${val}`}
                                           onClick={() => setDualSelections(prev => ({ ...prev, [scale1]: val }))}
                                           className={`w-12 h-12 bg-white border-2 text-blue-600 font-black text-lg rounded-xl transition-all cursor-pointer ${dualSelections[scale1] === val ? 'ring-4 ring-blue-400 bg-blue-50 border-blue-100' : 'border-blue-100 hover:bg-blue-50'}`}
                                       >
                                           {val}
                                       </button>
                                   ))}
                               </div>
                           </div>
                           <div>
                               <div className="text-[10px] font-black uppercase tracking-widest text-[#0D1B2A]/50 mb-2">{scale2}</div>
                               <div className="flex justify-center gap-2">
                                   {Array.from({length: max2 + 1}, (_, i) => i).map((val) => (
                                       <button
                                           key={`s2-${val}`}
                                           onClick={() => setDualSelections(prev => ({ ...prev, [scale2]: val }))}
                                           className={`w-12 h-12 bg-white border-2 text-blue-600 font-black text-lg rounded-xl transition-all cursor-pointer ${dualSelections[scale2] === val ? 'ring-4 ring-blue-400 bg-blue-50 border-blue-100' : 'border-blue-100 hover:bg-blue-50'}`}
                                       >
                                           {val}
                                       </button>
                                   ))}
                               </div>
                           </div>
                           
                           <button
                            disabled={dualSelections[scale1] === undefined || dualSelections[scale2] === undefined || isTyping || isLoading}
                            onClick={() => {
                                handleSend({ [scale1]: dualSelections[scale1], [scale2]: dualSelections[scale2] });
                            }}
                            className="mt-2 text-center py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm uppercase tracking-widest rounded-2xl transition-all w-full max-w-[200px] mx-auto disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                          >
                            Submit
                          </button>
                        </div>
                     );
                }
                
                return null;
              })()}

            </div>
          </div>
        )}
      </div>

      {/* ── Input / Action bar ── */}
      <div className="px-6 py-4 bg-white/60 backdrop-blur-xl border-t border-white/50 shrink-0">

        {phase === 'CRISIS' ? (
          /* ── CRISIS MODE UI ── */
          <div className="flex flex-col items-center gap-3 py-2 animate-pulse-slow">
            <div className="flex items-center gap-2 text-red-500 font-bold">
              <FiIcons.FiAlertCircle size={20} />
              <span className="text-sm font-black uppercase tracking-widest">CRISIS PROTOCOL ACTIVE</span>
            </div>
            <div className="text-center">
              <p className="text-xs font-medium text-[#0D1B2A]/70 leading-relaxed mb-1">
                Your emergency contacts have been notified. Priority help is available.
              </p>
              <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-2 mt-2 inline-block">
                <span className="text-red-600 font-black tracking-widest">DIAL 988 FOR IMMEDIATE HELP</span>
              </div>
            </div>
            <button
               onClick={confirmSafe}
               disabled={isLoading}
               className="mt-2 flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-[0_5px_15px_rgba(16,185,129,0.4)] hover:bg-emerald-600 hover:-translate-y-0.5 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
             >
               <FiIcons.FiShield size={16} />
               {isLoading ? 'Updating...' : "I'M SAFE NOW"}
             </button>
          </div>

        ) : phase === 'COMPLETED' ? (
          /* ── SESSION ENDED UI ── */
          <div className="flex flex-col items-center gap-3 py-2">
            <div className="flex items-center gap-2 text-[#0D1B2A]/50">
              <FiIcons.FiCheckCircle size={15} className="text-emerald-400" />
              <span className="text-xs font-black uppercase tracking-widest">Session Completed</span>
            </div>
            <button
              id="new-session-btn"
              onClick={startSession}
              className="flex items-center gap-2 px-6 py-3 bg-[#0D1B2A] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-black hover:-translate-y-0.5 active:scale-95 transition-all cursor-pointer"
            >
              <FiIcons.FiRefreshCw size={14} />
              Start New Session
            </button>
          </div>

        ) : phase === 'QUESTIONNAIRE' ? (
          /* ── QUESTIONNAIRE BUTTONS MOVED TO OVERLAY ── */
          <div className="flex justify-center w-full h-12 items-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#0D1B2A]/30 flex items-center gap-2">
              <FiIcons.FiLoader className="animate-spin" /> Assessment in progress...
            </span>
          </div>

        ) : (
          /* ── FREE TEXT INPUT ── */
          <div className="flex items-end gap-3 bg-white rounded-[24px] border border-white/80 shadow-sm px-4 py-2 focus-within:shadow-md focus-within:border-blue-100 transition-all">
            <textarea
              id="chat-input"
              rows={1}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
              }}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${guide.name}…`}
              disabled={isTyping || isLoading}
              className="flex-1 resize-none bg-transparent outline-none text-sm font-medium text-[#0D1B2A] placeholder:text-[#0D1B2A]/30 py-1.5 min-h-[28px] max-h-[120px] disabled:opacity-50"
              style={{ lineHeight: '1.5' }}
            />
            <button
              onClick={() => handleSend(null)}
              disabled={!input.trim() || isTyping || isLoading}
              id="chat-send-btn"
              className="w-10 h-10 bg-[#0D1B2A] hover:bg-black text-white rounded-full flex items-center justify-center transition-all shrink-0 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 active:scale-95 cursor-pointer shadow-md mb-0.5"
            >
              {isTyping
                ? <FiIcons.FiLoader size={16} className="animate-spin" />
                : <FiIcons.FiSend size={16} />
              }
            </button>
          </div>
        )}

        {phase !== 'QUESTIONNAIRE' && phase !== 'COMPLETED' && (
          <p className="text-center text-[9px] font-black uppercase tracking-widest text-[#0D1B2A]/20 mt-2">
            AI · Emotional Analysis · Mind Sky
          </p>
        )}
      </div>
    </div>
  );
}
