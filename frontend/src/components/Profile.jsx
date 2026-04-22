import React, { useState } from 'react';
import * as FiIcons from 'react-icons/fi';
import { guides } from '../utils/constants';

const Profile = ({ user, onUpdate, onOpenEmergencyModal }) => {
  if (!user) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user.fullName || '',
    phone: user.phone || '',
  });

  const handleSave = () => {
    onUpdate(formData);
    setIsEditing(false);
  };

  const milestones = [
    { lvl: 1, label: 'Sprout', reward: null },
    { lvl: 5, label: 'Seedling', reward: null },
    { lvl: 10, label: 'Guardian', reward: 'Free Student Club Entry', gift: true },
    { lvl: 15, label: 'Warrior', reward: 'Literary Club Voucher', gift: true },
    { lvl: 20, label: 'Master', reward: '₹500 Wellness Voucher', gift: true },
    { lvl: 25, label: 'Legend', reward: 'Mystery Surprise', gift: true },
  ];

  const badges = [
    { id: 'early', icon: 'FiSun', label: 'Early Bird', desc: 'Mood logged before 8 AM', unlocked: true },
    { id: 'streak', icon: 'FiZap', label: 'Streak Master', desc: '5 days in a row', unlocked: user.streak >= 5 },
    { id: 'journal', icon: 'FiEdit3', label: 'Deep Thinker', desc: '10 journals written', unlocked: (user.journal?.length || 0) >= 10 },
    { id: 'game', icon: 'FiTarget', label: 'Sharp Mind', desc: 'Level 5 reached', unlocked: user.level >= 5 },
    { id: 'social', icon: 'FiShield', label: 'Safety First', desc: 'Emergency contact set', unlocked: user.hasEmergencyContacts },
    { id: 'assessment', icon: 'FiActivity', label: 'Self-Aware', desc: '5 AI assessments', unlocked: (user.assessments?.length || 0) >= 5 },
  ];

  const renderIcon = (name, size = 24) => {
    const Icon = FiIcons[name];
    return Icon ? <Icon size={size} /> : null;
  };

  const xpProgress = Math.min(100, Math.max(0, ((user.xp || 0) / 1000) * 100));
  const selectedGuideObj = guides.find(g => g.id === user.selectedGuide);

  return (
    <div className="max-w-6xl mx-auto pb-20 fade-in space-y-8">
      {/* ─── PROFILE HEADER & XP ─── */}
      <section className="relative w-full bg-white/40 backdrop-blur-2xl rounded-[48px] border border-white shadow-[0_20px_60px_rgba(0,0,0,0.03)] p-8 md:p-14 overflow-hidden group">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-[#F5A623]/20 to-transparent blur-[100px] rounded-full pointer-events-none transition-transform duration-1000 group-hover:scale-110"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gradient-to-tr from-blue-200/30 to-transparent blur-[80px] rounded-full pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-10">
          
          {/* Avatar Area */}
          <div className="flex flex-col items-center shrink-0">
            <div className="relative">
              {/* Outer rotating ring */}
              <div className="absolute inset-[-8px] rounded-full bg-gradient-to-tr from-[#F5A623] via-[#FFD93D] to-transparent opacity-70 blur-sm animate-[spin_4s_linear_infinite]"></div>
              
              <div className="relative w-36 h-36 md:w-44 md:h-44 rounded-full bg-white p-2 shadow-xl ring-4 ring-white z-10 overflow-hidden group-hover:shadow-2xl transition-all duration-500">
                <div className="w-full h-full rounded-full bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center relative overflow-hidden">
                  {selectedGuideObj ? (
                    <img 
                      src={selectedGuideObj.image} 
                      alt={selectedGuideObj.name}
                      className="w-[85%] h-[85%] object-contain transform group-hover:scale-110 transition-transform duration-500 select-none pb-1"
                    />
                  ) : (
                    <span className="text-6xl md:text-7xl text-gray-300 select-none">👤</span>
                  )}
                </div>
              </div>
              
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-[#0D1B2A] text-white px-6 py-2 rounded-2xl shadow-xl border-2 border-white font-black text-sm uppercase tracking-widest z-20 whitespace-nowrap">
                LVL {user.level}
              </div>
            </div>
          </div>

          {/* Details & XP */}
          <div className="flex-1 w-full text-center md:text-left mt-4 md:mt-0">
            <h1 className="text-4xl md:text-5xl font-serif font-black text-[#0D1B2A] mb-2 drop-shadow-sm">
              {user.fullName}
            </h1>
            <div className="flex items-center justify-center md:justify-start gap-2 text-[#0D1B2A]/50 font-bold mb-8">
              <FiIcons.FiMail size={16} /> 
              <span>{user.email}</span>
            </div>
            
            <div className="bg-white/70 backdrop-blur-md p-6 rounded-[32px] border border-white shadow-sm relative overflow-hidden">
               <div className="flex justify-between items-end mb-4">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-[#0D1B2A]/40 mb-1">Current Tier</div>
                  <div className="text-xl font-black text-[#0D1B2A]">MindSky Explorer</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-[#F5A623]">{user.xp || 0} <span className="text-xs text-[#0D1B2A]/40 uppercase">XP</span></div>
                  <div className="text-xs font-bold text-[#0D1B2A]/40 mt-1">/ 1000 to Rank Up</div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden border border-white/50 relative shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-[#F5A623] to-[#FFD93D] transition-all duration-1000 ease-out relative"
                  style={{ width: `${Math.max(5, xpProgress)}%` }} // At least 5% so it's visible
                >
                  <div className="absolute top-0 right-0 bottom-0 left-0 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAIklEQVQIW2NkQAKrVq36zwjjgzhhYWGMYAEYB8RmROaABADeOQ8CXl/xfgAAAABJRU5ErkJggg==')] opacity-20"></div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-6">
              <div className="px-5 py-3 bg-white/70 backdrop-blur-md rounded-2xl border border-white shadow-sm flex items-center gap-3">
                <div className="bg-[#F5A623]/20 p-2 rounded-xl text-[#F5A623]"><FiIcons.FiZap /></div>
                <span className="text-sm font-black text-[#0D1B2A] uppercase tracking-widest">{user.streak} Day Streak</span>
              </div>
              <div className="px-5 py-3 bg-white/70 backdrop-blur-md rounded-2xl border border-white shadow-sm flex items-center gap-3">
                <div className="bg-[#0D1B2A]/10 p-2 rounded-xl text-[#0D1B2A]"><FiIcons.FiCompass /></div>
                <span className="text-sm font-black text-[#0D1B2A] uppercase tracking-widest">{user.location || 'Global Explorer'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── MILESTONE ROADMAP ─── */}
      <section className="bg-white/40 backdrop-blur-2xl rounded-[40px] border border-white p-8 shadow-sm overflow-hidden relative">
        <div className="text-[10px] font-black uppercase tracking-widest text-[#0D1B2A]/40 mb-10 px-2 flex justify-between items-center">
          <span>Growth Roadmap & Rewards</span>
          <span className="text-[#F5A623]">Level {user.level}</span>
        </div>

        <div className="relative pt-20 pb-12 overflow-x-auto no-scrollbar">
          {/* Background Path Line */}
          <div className="absolute top-[116px] left-0 right-0 h-1 bg-gray-200/50 rounded-full mx-10">
            <div 
              className="h-full bg-gradient-to-r from-[#F5A623] to-[#FFD93D] rounded-full transition-all duration-1000"
              style={{ width: `${Math.min(100, (user.level / 25) * 100)}%` }}
            ></div>
          </div>

          <div className="flex justify-between min-w-[800px] px-10 relative">
            {milestones.map((m, idx) => {
              const isUnlocked = user.level >= m.lvl;
              const isNext = !isUnlocked && (idx === 0 || user.level >= milestones[idx-1].lvl);
              
              return (
                <div key={m.lvl} className="flex flex-col items-center group relative cursor-default">
                  {/* Reward Tooltip */}
                  {m.gift && (
                    <div className="absolute -top-16 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-20 pointer-events-none">
                      <div className="bg-[#0D1B2A] text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl whitespace-nowrap shadow-xl">
                        {isUnlocked ? 'Unlocked: ' : 'Reward: '} {m.reward}
                      </div>
                      <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-[#0D1B2A] mx-auto"></div>
                    </div>
                  )}

                  {/* Level Circle */}
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center border-4 transition-all duration-500 z-[1] ${
                    isUnlocked 
                      ? 'bg-[#F5A623] border-white text-white shadow-lg shadow-[#F5A623]/30 scale-110' 
                      : isNext 
                        ? 'bg-white border-[#F5A623] text-[#F5A623] shadow-md scale-110'
                        : 'bg-white border-gray-100 text-gray-300'
                  }`}>
                    {m.gift ? <FiIcons.FiGift size={20} /> : <span className="font-serif font-black">{m.lvl}</span>}
                  </div>

                  {/* Labels */}
                  <div className="mt-4 text-center">
                    <div className={`text-[11px] font-black uppercase tracking-widest ${isUnlocked ? 'text-[#0D1B2A]' : 'text-gray-400'}`}>
                      {m.label}
                    </div>
                    {isNext && <div className="text-[9px] font-black text-[#F5A623] uppercase tracking-widest mt-1">Coming Next</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── CHARACTER PICKER ─── */}
      <section className="bg-white/40 backdrop-blur-2xl rounded-[40px] border border-white p-8 shadow-sm">
        <div className="text-[10px] font-black uppercase tracking-widest text-[#0D1B2A]/40 mb-6 px-2">Choose Your Companion</div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {guides.filter(g => user.isGuest || g.id !== 'ai_guide').map((guide) => (
            <button
              key={guide.id}
              onClick={() => onUpdate({ selectedGuide: guide.id })}
              className={`relative overflow-hidden group p-4 rounded-3xl border-2 transition-all duration-300 cursor-pointer ${
                user.selectedGuide === guide.id 
                  ? 'bg-[#0D1B2A] border-[#0D1B2A] text-white shadow-xl scale-105' 
                  : 'bg-white border-transparent hover:border-[#0D1B2A]/10 text-[#0D1B2A]'
              }`}
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mb-3 mx-auto flex items-center justify-center overflow-hidden rounded-full bg-[#0D1B2A]/5">
                <img 
                  src={guide.image} 
                  alt={guide.name}
                  className="w-[85%] h-[85%] object-contain group-hover:scale-110 transition-transform duration-300 pb-1"
                />
              </div>
              <div className="text-[13px] font-black uppercase tracking-tight truncate w-full text-center">{guide.name.split(' ')[0]}</div>
              <div className={`text-[9px] font-bold uppercase tracking-widest mt-0.5 text-center ${user.selectedGuide === guide.id ? 'text-white/70' : 'text-[#0D1B2A]/40'}`}>
                {guide.tag}
              </div>

              {user.selectedGuide === guide.id && (
                <div className="absolute top-2 right-2 flex items-center justify-center w-5 h-5 bg-emerald-500 rounded-full shadow-md">
                  <FiIcons.FiCheck size={12} className="text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* ─── ACHIEVEMENTS (BADGES) ─── */}
        <section className="bg-white/40 backdrop-blur-2xl rounded-[40px] border border-white p-8 shadow-sm col-span-1">
          <div className="text-[10px] font-black uppercase tracking-widest text-[#0D1B2A]/40 mb-8 px-2 flex justify-between items-center">
            <span>Badges & Achievements</span>
            <span className="text-emerald-500 font-black">{badges.filter(b => b.unlocked).length}/{badges.length}</span>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {badges.map(badge => (
              <div 
                key={badge.id} 
                className={`flex items-center gap-4 p-4 rounded-3xl transition-all border ${
                  badge.unlocked 
                    ? 'bg-white/80 border-white shadow-sm' 
                    : 'bg-gray-50/30 border-transparent opacity-50 grayscale hover:grayscale-0 hover:opacity-100'
                }`}
              >
                <div className={`w-12 h-12 rounded-2xl flex shrink-0 items-center justify-center ${
                  badge.unlocked ? 'bg-[#F5A623]/10 text-[#F5A623]' : 'bg-gray-200 text-gray-500'
                }`}>
                  {renderIcon(badge.icon)}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-black text-[#0D1B2A] flex items-center justify-between">
                    {badge.label}
                    {badge.unlocked && <FiIcons.FiCheckCircle className="text-emerald-500" size={16} />}
                  </div>
                  <div className="text-[10px] font-semibold text-[#0D1B2A]/40">{badge.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="space-y-8 col-span-1">
          {/* ─── EDIT PROFILE ─── */}
          <section className="bg-white/40 backdrop-blur-2xl rounded-[40px] border border-white p-8 shadow-sm">
            <div className="flex justify-between items-center mb-8 px-2">
              <div className="text-[10px] font-black uppercase tracking-widest text-[#0D1B2A]/40">User Identity</div>
              <button 
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                className={`text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
                  isEditing ? 'text-emerald-500 hover:scale-105' : 'text-[#F5A623] hover:scale-105'
                }`}
              >
                {isEditing ? 'Save Changes' : 'Edit Profile'}
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-[#0D1B2A]/40 block mb-2 px-2">Full Name</label>
                {isEditing ? (
                  <input 
                    className="w-full bg-white border border-gray-100 rounded-2xl px-5 py-4 font-bold text-[#0D1B2A] focus:outline-none focus:border-[#F5A623] transition-all shadow-inner"
                    value={formData.fullName}
                    onChange={e => setFormData({...formData, fullName: e.target.value})}
                  />
                ) : (
                  <div className="px-5 py-4 bg-white/60 rounded-2xl font-black text-lg text-[#0D1B2A] border border-white shadow-sm">
                    {user.fullName}
                  </div>
                )}
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-[#0D1B2A]/40 block mb-2 px-2">Phone Number</label>
                {isEditing ? (
                  <input 
                    className="w-full bg-white border border-gray-100 rounded-2xl px-5 py-4 font-bold text-[#0D1B2A] focus:outline-none focus:border-[#F5A623] transition-all shadow-inner"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                ) : (
                  <div className="px-5 py-4 bg-white/60 rounded-2xl font-black text-lg text-[#0D1B2A] border border-white shadow-sm">
                    {user.phone || 'Not set'}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* ─── SETTINGS & SAFETY ─── */}
          <section className="bg-white/40 backdrop-blur-2xl rounded-[40px] border border-white p-8 shadow-sm flex flex-col justify-center">
            <div className="text-[10px] font-black uppercase tracking-widest text-[#0D1B2A]/40 mb-8 px-2">Safety & Settings</div>
            
            <div className="space-y-4">
              <button 
                onClick={onOpenEmergencyModal}
                className="w-full flex items-center justify-between p-6 bg-white rounded-3xl border border-gray-100 hover:shadow-lg transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-red-500 group-hover:text-white transition-all">
                    <FiIcons.FiShield size={20} />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-black text-[#0D1B2A]">Emergency Contacts</div>
                    <div className="text-[10px] font-bold text-[#0D1B2A]/40 uppercase tracking-widest">Manage SOS triggers</div>
                  </div>
                </div>
                <FiIcons.FiChevronRight className="text-gray-300" />
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Profile;
