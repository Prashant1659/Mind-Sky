import React, { useEffect, useState } from 'react';
import Logo from './Logo';
import ChatBot from './ChatBot';
import { guides, sidebarItems } from '../utils/constants';
import * as FiIcons from 'react-icons/fi';

const Dashboard = ({ onLogout }) => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedMood, setSelectedMood] = useState(null);
  const [journalText, setJournalText] = useState('');
  const [isJournaling, setIsJournaling] = useState(false);
  const [isJournalModalOpen, setIsJournalModalOpen] = useState(false);

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

  const handleMoodSelect = (emoji) => {
    setSelectedMood(emoji);
    updateRemoteProfile({ mood: emoji });
  };

  const handleJournalSubmit = async (e) => {
    e.preventDefault();
    if (!journalText.trim()) return;
    setIsJournaling(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/auth/add-journal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: journalText })
      });
      const updatedUser = await res.json();
      if (res.ok) {
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setJournalText('');
        setIsJournalModalOpen(false);
      }
    } catch (err) {
      console.error('Failed to save journal:', err);
    } finally {
      setIsJournaling(false);
    }
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

  return (
    <div className="flex h-screen bg-[#F0F7FF] font-sans text-[#0D1B2A] overflow-hidden">

      {/* Pinned SOS Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <button className="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center text-white shadow-[0_10px_40px_rgba(239,68,68,0.5)] animate-pulse hover:scale-110 active:scale-95 transition-all cursor-pointer group relative">
          <FiIcons.FiAlertCircle size={26} />
          <span className="absolute right-16 bg-[#0D1B2A] text-white text-[9px] px-3 py-1.5 rounded-full whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all font-black uppercase tracking-widest pointer-events-none shadow-xl">Immediate Support</span>
        </button>
      </div>

      {/* Journal Modal */}
      {isJournalModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0D1B2A]/40 backdrop-blur-md" onClick={() => setIsJournalModalOpen(false)}></div>
          <div className="bg-white w-full max-w-2xl rounded-[48px] shadow-2xl relative z-10 overflow-hidden">
            <div className="p-8 md:p-12">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-3xl font-serif font-black mb-1">Today's Journal</h2>
                  <p className="text-xs font-black uppercase tracking-widest text-[#0D1B2A]/40">How are you truly feeling, {firstName}?</p>
                </div>
                <button onClick={() => setIsJournalModalOpen(false)} className="p-3 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
                  <FiIcons.FiX size={24} />
                </button>
              </div>
              <form onSubmit={handleJournalSubmit} className="space-y-6">
                <textarea
                  autoFocus
                  value={journalText}
                  onChange={(e) => setJournalText(e.target.value)}
                  placeholder="The sky is yours... write freely."
                  className="w-full h-64 bg-gray-50 rounded-3xl p-6 text-lg font-medium outline-none focus:ring-2 ring-blue-100 transition-all resize-none"
                />
                <button
                  type="submit"
                  disabled={isJournaling}
                  className="w-full py-5 bg-[#0D1B2A] text-white rounded-2xl font-black text-sm uppercase tracking-[0.3em] hover:bg-black shadow-xl transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                >
                  {isJournaling ? 'Journaling...' : 'Save and Shine ✨'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

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
        <div className="p-6">
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

        {activeTab !== 'chat' && (
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
                className="px-8 py-4 bg-white text-[#0D1B2A] rounded-2xl font-black shadow-lg hover:-translate-y-1 transition-all text-sm active:scale-95 cursor-pointer">Start Chat</button>
              <button className="px-8 py-4 bg-[#D1E5F4]/60 text-[#0D1B2A] rounded-2xl font-black shadow-sm hover:-translate-y-1 transition-all text-sm active:scale-95 cursor-pointer">Take Test</button>
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
              onClick={() => setIsJournalModalOpen(true)}
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
          <div>
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
  );
};

export default Dashboard;
