import React, { useState, useEffect, useRef } from 'react';
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

// Typing indicator dots
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

export default function ChatBot({ user, onClose }) {
  const guide        = guides.find((g) => g.id === user?.selectedGuide) || guides[0];
  const firstName    = user?.fullName?.split(' ')[0] || 'Friend';

  const [messages,   setMessages]   = useState([]);
  const [input,      setInput]      = useState('');
  const [isTyping,   setIsTyping]   = useState(false);
  const [isLoading,  setIsLoading]  = useState(true);
  const [error,      setError]      = useState(null);
  const bottomRef = useRef(null);

  // ── Load chat history on mount ──────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem('token');
        const res   = await fetch(API('/ai/history'), {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.history && data.history.length > 0) {
            setMessages(data.history.map((m) => ({ role: m.role, content: m.content })));
          } else {
            // First-time greeting from guide
            setMessages([{
              role:    'assistant',
              content: `${guide.greeting} I'm ${guide.name}, your personal guide on Mind Sky. How are you feeling today, ${firstName}? 💙`,
            }]);
          }
        }
      } catch {
        setMessages([{
          role:    'assistant',
          content: `${guide.greeting} I'm ${guide.name}. How can I support you today, ${firstName}?`,
        }]);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // ── Auto-scroll to bottom ───────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // ── Send message ────────────────────────────────────────────────────────
  const handleSend = async () => {
    const text = input.trim();
    if (!text || isTyping) return;

    setInput('');
    setError(null);
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setIsTyping(true);

    try {
      const token = localStorage.getItem('token');
      const res   = await fetch(API('/ai/chat'), {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ message: text }),
      });

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.reply || data.message || 'I hear you. 🌟' },
      ]);
    } catch {
      setError('Connection issue. Please try again.');
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `I'm here, ${firstName}. It seems there was a connection issue — please try again in a moment. 💙` },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-[#F0F7FF] relative overflow-hidden">

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
        {/* Insight pill */}
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full border border-blue-100">
          <FiIcons.FiBrain size={14} className="text-blue-400" />
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
              <span className="text-sm font-medium">Loading your conversation…</span>
            </div>
          </div>
        )}

        {!isLoading && messages.map((msg, i) => (
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

            {/* Bubble */}
            <div
              className={`max-w-[72%] rounded-3xl px-5 py-4 text-sm leading-relaxed font-medium transition-all
                ${msg.role === 'user'
                  ? 'bg-[#0D1B2A] text-white rounded-br-md shadow-lg'
                  : 'bg-white/80 backdrop-blur-md border border-white text-[#0D1B2A] rounded-bl-md shadow-sm'
                }`}
              style={{ wordBreak: 'break-word' }}
            >
              {msg.content}
            </div>
          </div>
        ))}

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
      </div>

      {/* ── Suggested prompts (shown when empty-ish) ── */}
      {!isLoading && messages.length <= 1 && (
        <div className="px-8 pb-4 flex flex-wrap gap-2 shrink-0">
          {[
            "I'm feeling anxious today",
            "Help me breathe",
            "What should I focus on?",
            "I need some motivation",
          ].map((prompt) => (
            <button
              key={prompt}
              onClick={() => { setInput(prompt); }}
              className="px-4 py-2 bg-white/70 hover:bg-white border border-white rounded-full text-xs font-bold text-[#0D1B2A]/70 hover:text-[#0D1B2A] transition-all cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-0.5"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* ── Input bar ── */}
      <div className="px-6 py-4 bg-white/60 backdrop-blur-xl border-t border-white/50 shrink-0">
        <div className="flex items-end gap-3 bg-white rounded-[24px] border border-white/80 shadow-sm px-4 py-2 focus-within:shadow-md focus-within:border-blue-100 transition-all">
          <textarea
            id="chat-input"
            rows={1}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              // Auto-grow up to 5 rows
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
            onClick={handleSend}
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
        <p className="text-center text-[9px] font-black uppercase tracking-widest text-[#0D1B2A]/20 mt-2">
          AI · Emotional Analysis · Mind Sky
        </p>
      </div>
    </div>
  );
}
