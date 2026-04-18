import React, { useEffect, useState } from 'react';
import Logo from './Logo';
import ChatBot from './ChatBot';
import Journal from './Journal';
import Games from './Games';
import Activities from './Activities';
import EmergencyContactModal from './EmergencyContactModal';
import CrisisButton from './CrisisButton';
import AmbientPlayer from './AmbientPlayer';
import LevelUpCelebration from './LevelUpCelebration';
import Profile from './Profile';
import Insights from './Insights';
import { guides, sidebarItems } from '../utils/constants';
import * as FiIcons from 'react-icons/fi';

const Dashboard = ({ onLogout }) => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedMood, setSelectedMood] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [assessmentsLoading, setAssessmentsLoading] = useState(false);
  const [expandedAssessment, setExpandedAssessment] = useState(null);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [moodXPPops, setMoodXPPops] = useState([]);
  const moodXPPopId = React.useRef(0);

  const spawnMoodXP = () => {
    const id = moodXPPopId.current++;
    setMoodXPPops(prev => [...prev, { id }]);
    setTimeout(() => setMoodXPPops(prev => prev.filter(p => p.id !== id)), 2000);
  };

  useEffect(() => {
    const rawUser = localStorage.getItem('user');
    if (rawUser) {
      try {
        const parsedUser = JSON.parse(rawUser);
        setUser(parsedUser);
        setSelectedMood(parsedUser.mood || '😊');
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Fetch assessments when switching to the assessments tab
  useEffect(() => {
    if (activeTab !== 'assessments') return;
    const fetchAssessments = async () => {
      setAssessmentsLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/ai/assessments', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setAssessments(data.assessments || []);
        }
      } catch (err) {
        console.error('Failed to load assessments:', err);
      } finally {
        setAssessmentsLoading(false);
      }
    };
    fetchAssessments();
  }, [activeTab]);

  const updateRemoteProfile = async (updates) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/auth/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });
      const updatedUser = await res.json();
      if (res.ok) {
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };

  const addXP = async (amount, extras = {}) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/auth/add-xp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ amount, ...extras })
      });
      if (res.ok) {
        const updatedUser = await res.json();
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (err) {
      console.error('Failed to add XP:', err);
    }
  };

  const handleMoodSelect = (emoji) => {
    setSelectedMood(emoji);
    addXP(100, { mood: emoji }); // single atomic request: mood + XP together
    spawnMoodXP();
  };

  if (!user) return null;

  const selectedGuide = guides.find(g => g.id === user.selectedGuide) || guides[0];
  const firstName = user.fullName ? user.fullName.split(' ')[0] : 'Friend';
  const focusAreas = user.goals && user.goals.length > 0
    ? user.goals.slice(0, 2).map(g => g.toUpperCase()).join(' + ')
    : 'ANXIETY + OVERTHINKING';
  const isCritical = user.screening && Object.values(user.screening).some(val => val === true);
  const statusColor = isCritical ? 'text-red-500 bg-red-50' : 'text-green-500 bg-green-50';
  const statusLabel = isCritical ? 'CRITICAL' : 'STABLE';

  const renderIcon = (iconName, size = 20) => {
    const IconComponent = FiIcons[iconName];
    return IconComponent ? <IconComponent size={size} /> : null;
  };

  // Mood dial config
  const moodSegments = [
    { emoji: '😰', color: '#EF4444', start: -162, end: -126 },
    { emoji: '😔', color: '#F59E0B', start: -126, end: -90  },
    { emoji: '😐', color: '#EAB308', start: -90,  end: -54  },
    { emoji: '😊', color: '#10B981', start: -54,  end: -18  },
    { emoji: '😴', color: '#6366F1', start: -18,  end: 18   },
  ];

  // Needle rotation: needle tip starts straight UP (-90° SVG).
  // To point at segment midpoint angle θ, CSS rotate = θ + 90°
  const needleAngle =
    selectedMood === '😰' ? -144 + 90 :  // -54°
    selectedMood === '😔' ? -108 + 90 :  // -18°
    selectedMood === '😐' ?  -72 + 90 :  // +18°
    selectedMood === '😊' ?  -36 + 90 :  // +54°
    selectedMood === '😴' ?    0 + 90 :  // +90°
    -72 + 90;                             // default: 😐 center

  const moodLabel =
    selectedMood === '😰' ? 'I Feel Anxious' :
    selectedMood === '😔' ? 'I Feel Sad'     :
    selectedMood === '😐' ? 'I Feel Neutral'  :
    selectedMood === '😊' ? 'I Feel Happy'    :
    selectedMood === '😴' ? 'I Feel Tired'    : 'Pick a mood';

  const moodBg =
    selectedMood === '😰' ? 'bg-red-500/10'     :
    selectedMood === '😔' ? 'bg-orange-500/10'  :
    selectedMood === '😐' ? 'bg-yellow-500/10'  :
    selectedMood === '😊' ? 'bg-emerald-500/10' :
    selectedMood === '😴' ? 'bg-indigo-500/10'  :
    'bg-white/60';

  // SVG dial constants: arc centered at (100, 115), radius 72
  const CX = 100, CY = 115, R = 72, RLABEL = 53;

  // ─── Mood-reactive aurora theme ───────────────────────────────
  const MOOD_THEME = {
    '😊': {
      bg:     'linear-gradient(135deg, #FFF9F0 0%, #F0FFF4 40%, #EFF6FF 100%)',
      orb1:   'rgba(251,191,36,0.18)',
      orb2:   'rgba(16,185,129,0.12)',
      orb3:   'rgba(96,165,250,0.10)',
      sidebar: 'rgba(254,243,199,0.5)',
    },
    '😔': {
      bg:     'linear-gradient(135deg, #EFF6FF 0%, #EEF2FF 50%, #F3F4F6 100%)',
      orb1:   'rgba(99,102,241,0.15)',
      orb2:   'rgba(148,163,184,0.12)',
      orb3:   'rgba(59,130,246,0.10)',
      sidebar: 'rgba(224,231,255,0.5)',
    },
    '😰': {
      bg:     'linear-gradient(135deg, #FFF5F5 0%, #FFF7ED 50%, #F5F3FF 100%)',
      orb1:   'rgba(239,68,68,0.13)',
      orb2:   'rgba(249,115,22,0.10)',
      orb3:   'rgba(139,92,246,0.08)',
      sidebar: 'rgba(254,226,226,0.5)',
    },
    '😐': {
      bg:     'linear-gradient(135deg, #F0F7FF 0%, #EFF6FF 50%, #F5F3FF 100%)',
      orb1:   'rgba(56,189,248,0.13)',
      orb2:   'rgba(99,102,241,0.10)',
      orb3:   'rgba(16,185,129,0.07)',
      sidebar: 'rgba(224,242,254,0.5)',
    },
    '😴': {
      bg:     'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 40%, #EFF6FF 100%)',
      orb1:   'rgba(139,92,246,0.18)',
      orb2:   'rgba(99,102,241,0.13)',
      orb3:   'rgba(167,139,250,0.10)',
      sidebar: 'rgba(237,233,254,0.5)',
    },
  };
  const theme = MOOD_THEME[selectedMood] || MOOD_THEME['😐'];

  return (
    <>
      {/* Aurora animated background */}
      <style>{`
        @keyframes auroraOrb1 {
          0%,100% { transform: translate(0, 0) scale(1); }
          33%      { transform: translate(6%, 4%) scale(1.08); }
          66%      { transform: translate(-4%, 6%) scale(0.95); }
        }
        @keyframes auroraOrb2 {
          0%,100% { transform: translate(0, 0) scale(1); }
          40%      { transform: translate(-8%, -5%) scale(1.1); }
          70%      { transform: translate(5%, -3%) scale(0.92); }
        }
        @keyframes auroraOrb3 {
          0%,100% { transform: translate(0, 0) scale(1); }
          50%      { transform: translate(4%, -6%) scale(1.06); }
        }
        .aurora-bg { transition: background 1.2s ease; }
      `}</style>

    <div className="aurora-bg flex h-screen font-sans text-[#0D1B2A] overflow-hidden relative" style={{ background: theme.bg }}>
      {/* Animated aurora orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div style={{ position:'absolute', top:'-10%', left:'-5%', width:'55%', height:'60%', borderRadius:'50%', background: theme.orb1, filter:'blur(80px)', animation:'auroraOrb1 14s ease-in-out infinite', transition:'background 1.2s ease' }} />
        <div style={{ position:'absolute', bottom:'-15%', right:'-10%', width:'60%', height:'65%', borderRadius:'50%', background: theme.orb2, filter:'blur(90px)', animation:'auroraOrb2 18s ease-in-out infinite', transition:'background 1.2s ease' }} />
        <div style={{ position:'absolute', top:'35%', left:'40%', width:'40%', height:'40%', borderRadius:'50%', background: theme.orb3, filter:'blur(70px)', animation:'auroraOrb3 22s ease-in-out infinite', transition:'background 1.2s ease' }} />
      </div>

      {(!user.hasEmergencyContacts || showEmergencyModal) && (
        <EmergencyContactModal 
          userId={user._id || user.id} 
          onComplete={() => {
            if (!user.hasEmergencyContacts) {
              const updatedUser = { ...user, hasEmergencyContacts: true };
              setUser(updatedUser);
              localStorage.setItem('user', JSON.stringify(updatedUser));
            }
            setShowEmergencyModal(false);
          }}
          onClose={user.hasEmergencyContacts ? () => setShowEmergencyModal(false) : undefined}
        />
      )}

      {/* Pinned SOS Button — hidden on chat tab to avoid covering the send button */}
      {activeTab !== 'chat' && <CrisisButton user={user} />}

      {/* Level-up celebration */}
      <LevelUpCelebration level={user.level || 1} />

      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-white/40 backdrop-blur-xl border-r border-white/50 flex flex-col z-30">
        <div className="p-8">
          <Logo className="scale-90 origin-left" />
        </div>
        <nav className="flex-1 px-4 space-y-2">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl font-bold transition-all duration-300 cursor-pointer ${
                activeTab === item.id
                  ? 'bg-white shadow-[0_4px_20px_rgba(0,0,0,0.05)] text-[#0D1B2A]'
                  : 'text-[#0D1B2A]/40 hover:text-[#0D1B2A] hover:bg-white/30'
              }`}
            >
              <span className={activeTab === item.id ? 'text-[#F5A623]' : ''}>{renderIcon(item.icon)}</span>
              <span className="text-[15px]">{item.label}</span>
            </button>
          ))}
        </nav>
        {/* Ambient player — sits just above logout, aligned with nav */}
        <div className="px-4 mb-2">
          <AmbientPlayer />
        </div>
        <div className="p-4 pt-0">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl font-bold text-red-400 hover:bg-red-50 transition-all cursor-pointer"
          >
            <FiIcons.FiLogOut size={20} />
            <span className="text-[15px]">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative p-8 lg:p-12">
        {/* Chat tab — full-panel, no padding wrapper */}
        {activeTab === 'chat' && (
          <div className="absolute inset-0">
            <ChatBot user={user} onClose={() => setActiveTab('dashboard')} />
          </div>
        )}

        {/* ── Journal Tab ── */}
        {activeTab === 'journal' && (
          <Journal user={user} onUpdate={setUser} />
        )}

        {/* ── Games Tab ── */}
        {activeTab === 'games' && (
          <Games user={user} addXP={addXP} />
        )}

        {/* ── Activities Tab ── */}
        {activeTab === 'activities' && (
          <Activities user={user} onUpdateUser={(updated) => {
            setUser(updated);
            localStorage.setItem('user', JSON.stringify(updated));
          }} />
        )}

        {/* ── Assessments Tab ── */}
        {activeTab === 'assessments' && (
          <div className="max-w-3xl mx-auto">
            <header className="mb-8">
              <h1 className="text-4xl font-serif font-black tracking-tight mb-1">Assessments</h1>
              <p className="text-xs font-black uppercase tracking-widest text-[#0D1B2A]/40">Last 5 completed sessions</p>
            </header>

            {assessmentsLoading && (
              <div className="flex items-center justify-center py-24 gap-3 text-[#0D1B2A]/40">
                <FiIcons.FiLoader size={20} className="animate-spin" />
                <span className="text-sm font-medium">Loading your assessments…</span>
              </div>
            )}

            {!assessmentsLoading && assessments.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
                <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center text-blue-300">
                  <FiIcons.FiFileText size={36} />
                </div>
                <div>
                  <p className="text-lg font-bold text-[#0D1B2A]/70 mb-1">No assessments yet</p>
                  <p className="text-xs font-medium text-[#0D1B2A]/40">Complete an assessment session with your AI guide to see your results here.</p>
                </div>
                <button
                  onClick={() => setActiveTab('chat')}
                  className="mt-2 px-6 py-3 bg-[#0D1B2A] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-md cursor-pointer"
                >
                  Start AI ASSESSMENT →
                </button>
              </div>
            )}

            {!assessmentsLoading && assessments.length > 0 && (
              <div className="space-y-4">
                {assessments.map((a, idx) => {
                  // Handle both new format { chatSessionId, completedAt, data: aiResult }
                  // and old flat format where aiServiceResponse is at top level
                  const ai = a.data?.aiServiceResponse ?? a.aiServiceResponse ?? {};
                  const sessionId = a.chatSessionId || `session-${idx + 1}`;
                  const rawDate = a.completedAt || a.data?.completedAt || null;
                  const date = rawDate ? new Date(rawDate).toLocaleString() : 'Unknown';
                  const isCrit = ai.severityExplanation?.toLowerCase().includes('severe') ||
                                 ai.severityExplanation?.toLowerCase().includes('critical');
                  const isExpanded = expandedAssessment === idx;

                  return (
                    <div
                      key={sessionId}
                      className="bg-white/60 backdrop-blur-xl border border-white rounded-[28px] overflow-hidden shadow-sm hover:shadow-md transition-all"
                    >
                      {/* Card header — always visible */}
                      <button
                        onClick={() => setExpandedAssessment(isExpanded ? null : idx)}
                        className="w-full flex items-start gap-4 p-6 text-left cursor-pointer group"
                      >
                        {/* Index badge */}
                        <div className="w-10 h-10 shrink-0 rounded-xl bg-blue-50 flex items-center justify-center text-blue-400 font-black text-sm">
                          #{assessments.length - idx}
                        </div>

                        <div className="flex-1 min-w-0">
                          {/* Summary */}
                          {ai.summary ? (
                            <p className="text-sm font-medium text-[#0D1B2A]/80 leading-snug line-clamp-2">{ai.summary}</p>
                          ) : (
                            <p className="text-sm font-medium text-[#0D1B2A]/40 italic">No summary available</p>
                          )}

                          {/* Chips row */}
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            {ai.severityExplanation && (
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wide ${
                                isCrit ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'
                              }`}>
                                <FiIcons.FiAlertTriangle size={9} />
                                {ai.severityExplanation}
                              </span>
                            )}
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-[9px] font-black uppercase tracking-wide text-[#0D1B2A]/50">
                              <FiIcons.FiClock size={9} />
                              {date}
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-[9px] font-black uppercase tracking-wide text-emerald-600">
                              <FiIcons.FiCheckCircle size={9} />
                              Completed
                            </span>
                          </div>
                        </div>

                        <FiIcons.FiChevronDown
                          size={18}
                          className={`shrink-0 text-[#0D1B2A]/30 transition-transform duration-300 mt-1 ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                      {/* Expanded content */}
                      {isExpanded && (
                        <div className="px-6 pb-6 space-y-4 border-t border-gray-100/80 pt-4">

                          {ai.insights && (
                            <div>
                              <div className="text-[9px] font-black uppercase tracking-widest text-[#0D1B2A]/30 mb-1.5">Insights</div>
                              <p className="text-sm font-medium text-[#0D1B2A]/70 leading-relaxed">{ai.insights}</p>
                            </div>
                          )}

                          {ai.recommendations?.length > 0 && (
                            <div>
                              <div className="text-[9px] font-black uppercase tracking-widest text-[#0D1B2A]/30 mb-1.5">Recommendations</div>
                              <ul className="space-y-1.5">
                                {ai.recommendations.map((r, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm font-medium text-[#0D1B2A]/70">
                                    <span className="w-5 h-5 shrink-0 rounded-full bg-blue-50 text-blue-400 flex items-center justify-center text-[10px] font-black mt-0.5">{i + 1}</span>
                                    {r}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {ai.keyFindings?.length > 0 && (
                            <div>
                              <div className="text-[9px] font-black uppercase tracking-widest text-[#0D1B2A]/30 mb-1.5">Key Findings</div>
                              <ul className="space-y-1">
                                {ai.keyFindings.map((f, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm font-medium text-[#0D1B2A]/70">
                                    <span className="text-indigo-400 mt-1">•</span>{f}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {ai.reassurance && (
                            <div className="px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-2xl text-sm font-medium text-emerald-700 italic leading-relaxed">
                              {ai.reassurance}
                            </div>
                          )}

                          {ai.disclaimer && (
                            <div className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-[10px] font-medium text-[#0D1B2A]/40 leading-relaxed">
                              {ai.disclaimer}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && <Profile user={user} onUpdate={updateRemoteProfile} onOpenEmergencyModal={() => setShowEmergencyModal(true)} />}
        
        {activeTab === 'insights' && <Insights user={user} />}

        {activeTab !== 'chat' && activeTab !== 'assessments' && activeTab !== 'journal' && activeTab !== 'games' && activeTab !== 'activities' && activeTab !== 'profile' && activeTab !== 'insights' && (
          <>
        <div className="absolute top-0 right-0 w-[60%] h-[40%] bg-blue-200/20 blur-[120px] rounded-full -z-10 pointer-events-none"></div>

        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h1 className="text-4xl lg:text-5xl font-serif font-black tracking-tight mb-2">
              Welcome, <span className="text-[#F5A623]">{firstName}</span>
            </h1>
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-[0.2em] ${statusColor}`}>
              <FiIcons.FiShield size={14} />
              <span>{statusLabel} Status</span>
            </div>
          </div>
          <div className="bg-white/40 backdrop-blur-md px-6 py-4 rounded-3xl border border-white shadow-sm flex items-center gap-4">
            <div className="text-right">
              <div className="text-[10px] font-black uppercase tracking-widest text-[#0D1B2A]/40 mb-1">Emotional Score</div>
              <div className="text-2xl font-serif font-black text-[#F5A623]">{user.emotionalScore || 75}</div>
            </div>
            <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#F5A623] transition-all duration-500" style={{ width: `${user.emotionalScore || 75}%` }}></div>
            </div>
          </div>
        </header>

        {/* Hero Character */}
        <section className="bg-white/40 backdrop-blur-2xl rounded-[48px] border border-white p-8 md:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.03)] flex flex-col md:flex-row items-center gap-10 mb-12 relative overflow-hidden">
          <div className="absolute top-8 right-12 h-8 px-4 bg-[#D1E5F4] rounded-full flex items-center justify-center text-[11px] font-black uppercase tracking-widest text-[#0D1B2A]/60 border border-white/50">
            Focus: {focusAreas}
          </div>
          <div className="w-56 h-56 lg:w-64 lg:h-64 shrink-0 animate-bounce" style={{ animationDuration: '4s' }}>
            <img src={selectedGuide.image} alt={selectedGuide.name} className="w-full h-full object-contain drop-shadow-2xl" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-4xl lg:text-5xl font-serif font-black mb-4 leading-tight">{selectedGuide.quote}</h2>
            <p className="text-[#0D1B2A]/40 font-black uppercase tracking-[0.2em] mb-8">— {selectedGuide.name.toUpperCase()}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <button
                onClick={() => setActiveTab('chat')}
                className="px-8 py-4 bg-white text-[#0D1B2A] rounded-2xl font-black shadow-lg hover:-translate-y-1 transition-all text-sm active:scale-95 cursor-pointer">Take Assessment</button>

            </div>
          </div>
        </section>

        {/* 3-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20 items-start">

          {/* Col 1: Streak + Assessment */}
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-orange-400 to-amber-500 rounded-[32px] p-8 text-white shadow-xl h-[200px] flex flex-col justify-between overflow-hidden relative">
              <div className="absolute top-[-20%] right-[-10%] w-36 h-36 bg-white/20 blur-3xl rounded-full pointer-events-none"></div>
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Your Fire</div>
                  <h4 className="text-2xl font-black">Daily Streak</h4>
                </div>
                <div className="p-3 bg-white/20 rounded-2xl">
                  <FiIcons.FiZap size={24} className="fill-current" />
                </div>
              </div>
              <div className="relative z-10">
                <div className="text-6xl font-black mb-1">{user.streak || 0}</div>
                <div className="text-xs font-bold opacity-70 uppercase tracking-widest">Days Strong</div>
              </div>
            </div>
            <div className="bg-white/60 backdrop-blur-xl border border-white p-8 rounded-[32px] shadow-sm hover:shadow-md transition-all group cursor-pointer">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                <FiIcons.FiFileText size={24} />
              </div>
              <h4 className="text-xl font-bold mb-2">Assessment</h4>
              <p className="text-xs font-bold text-[#0D1B2A]/40 uppercase tracking-widest mb-2">Next Step</p>
              <p className="text-sm font-medium text-[#0D1B2A]/70 italic">"Let's explore your anxiety triggers based on your profile."</p>
            </div>
          </div>

          {/* Col 2: Level + Journal */}
          <div className="space-y-8">
            <div className="bg-[#0D1B2A] rounded-[32px] p-8 text-white shadow-xl h-[200px] flex flex-col justify-between overflow-hidden relative">
              <div className="absolute bottom-[-20%] left-[-10%] w-44 h-44 bg-blue-400/20 blur-3xl rounded-full pointer-events-none"></div>
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1">Growth Progress</div>
                  <h4 className="text-2xl font-black">Level {user.level || 1}</h4>
                </div>
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                  <FiIcons.FiAward size={24} className="text-blue-400" />
                </div>
              </div>
              <div className="relative z-10">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2 opacity-60">
                  <span>Rank: Novice</span>
                  <span>{user.xp || 0}/1000 XP</span>
                </div>
                <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.6)] transition-all duration-500"
                    style={{ width: `${((user.xp || 0) / 1000) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('journal')}
              className="w-full bg-white/60 backdrop-blur-xl border border-white p-8 rounded-[32px] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col items-center text-center cursor-pointer"
            >
              <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 mb-5 group-hover:scale-110 transition-transform">
                <FiIcons.FiBookOpen size={28} />
              </div>
              <h4 className="text-xl font-bold mb-1">Today's Journal</h4>
              <p className="text-sm font-medium text-[#0D1B2A]/40 uppercase tracking-widest">Write Your Feelings</p>
            </button>
          </div>

          {/* Col 3: Mood Dial */}
          <div className="relative">
            <style>{`
              @keyframes moodXPFloat {
                0%   { transform: translate(-50%, 0);     opacity: 0; scale: 0.5; }
                15%  { transform: translate(-50%, -24px);  opacity: 1; scale: 1.3; }
                75%  { transform: translate(-50%, -80px);  opacity: 1; scale: 1; }
                100% { transform: translate(-50%, -130px); opacity: 0; scale: 0.85; }
              }
              .mood-xp-float { animation: moodXPFloat 2s ease-out forwards; }
            `}</style>
            {moodXPPops.map(p => (
              <div key={p.id} className="mood-xp-float absolute top-1/2 left-1/2 pointer-events-none z-50 whitespace-nowrap">
                <div className="px-5 py-2.5 bg-gradient-to-r from-emerald-400 to-teal-500 text-white font-black text-xl rounded-full shadow-2xl border-4 border-white/50">
                  😊 +100 XP
                </div>
              </div>
            ))}
            <div className={`backdrop-blur-xl border border-white rounded-[48px] shadow-sm flex flex-col items-center overflow-hidden transition-all duration-700 ${moodBg}`}>
              <div className="px-8 pt-8 pb-2 w-full flex flex-col items-center">
                <h4 className="text-xl font-serif font-black text-[#0D1B2A] mb-5 text-center">How's your mood?</h4>
                <div className="text-[10px] font-black uppercase tracking-[0.25em] text-[#0D1B2A]/40 mb-3">{moodLabel}</div>
                <div className="text-7xl drop-shadow-lg" style={{ transition: 'transform 0.4s' }}>{selectedMood || '😊'}</div>
              </div>

              {/* SVG Dial — viewBox cropped to show only the top half of the arc + labels */}
              <svg
                viewBox="28 20 144 100"
                className="w-full"
                style={{ display: 'block', overflow: 'hidden' }}
              >
                {moodSegments.map((seg) => {
                  const x1 = CX + R * Math.cos((seg.start * Math.PI) / 180);
                  const y1 = CY + R * Math.sin((seg.start * Math.PI) / 180);
                  const x2 = CX + R * Math.cos((seg.end * Math.PI) / 180);
                  const y2 = CY + R * Math.sin((seg.end * Math.PI) / 180);
                  const mid = (seg.start + seg.end) / 2;
                  const lx = CX + RLABEL * Math.cos((mid * Math.PI) / 180);
                  const ly = CY + RLABEL * Math.sin((mid * Math.PI) / 180);
                  const isSelected = selectedMood === seg.emoji;
                  return (
                    <g key={seg.emoji} onClick={() => handleMoodSelect(seg.emoji)} style={{ cursor: 'pointer' }}>
                      <path
                        d={`M ${x1} ${y1} A ${R} ${R} 0 0 1 ${x2} ${y2}`}
                        fill="none"
                        stroke={seg.color}
                        strokeWidth={isSelected ? 16 : 10}
                        strokeLinecap="round"
                        opacity={isSelected ? 1 : 0.45}
                        style={{ transition: 'stroke-width 0.4s, opacity 0.4s' }}
                      />
                      <text
                        x={lx} y={ly}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize={isSelected ? 13 : 10}
                        opacity={isSelected ? 1 : 0.4}
                        style={{ transition: 'font-size 0.4s, opacity 0.4s', userSelect: 'none' }}
                      >{seg.emoji}</text>
                    </g>
                  );
                })}

                {/* Needle — CSS transform so transition works properly in SVG */}
                <g style={{
                  transformOrigin: `${CX}px ${CY}px`,
                  transform: `rotate(${needleAngle}deg)`,
                  transition: 'transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}>
                  <path d={`M ${CX - 1.5} ${CY} L ${CX} ${CY - 68} L ${CX + 1.5} ${CY} Z`} fill="#1a1a2e" opacity="0.9" />
                  <circle cx={CX} cy={CY} r="9" fill="#1a1a2e" />
                  <circle cx={CX} cy={CY} r="4" fill="white" />
                </g>
              </svg>
            </div>
          </div>

        </div>
        </>
        )}
      </main>
    </div>
    </>
  );
};

export default Dashboard;
