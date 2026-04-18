import React, { useState } from 'react';
import * as FiIcons from 'react-icons/fi';

const Insights = ({ user }) => {
  if (!user) return null;

  const totalJournals = user.journal?.length || 0;
  const totalActivities = user.completedActivities?.length || 0;
  const totalAssessments = user.assessments?.length || 0;

  // Realistic 30-day real-time data
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysData = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (29 - i));
    return { date: d, count: 0, dateStr: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) };
  });

  const getDayOffset = (dateStr) => {
    const d = new Date(dateStr);
    d.setHours(0,0,0,0);
    const diffTime = today - d;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return 29 - diffDays;
  };

  (user.journal || []).forEach(j => {
    const offset = getDayOffset(j.date || j.updatedAt);
    if (offset >= 0 && offset < 30) daysData[offset].count += 1;
  });

  (user.assessments || []).forEach(a => {
    const offset = getDayOffset(a.completedAt || a.date);
    if (offset >= 0 && offset < 30) daysData[offset].count += 1;
  });

  (user.moodLogs || []).forEach(l => {
    const offset = getDayOffset(l.date);
    if (offset >= 0 && offset < 30) daysData[offset].count += 1;
  });

  const maxActivity = Math.max(...daysData.map(d => d.count), 4);

  // Real-time Mood Distribution from both journals and dedicated mood logs
  const moodMap = { joyful: 0, neutral: 0, down: 0, anxious: 0 };
  
  const processMood = (m) => {
    if (['😊', '🥰'].includes(m)) moodMap.joyful++;
    else if (['😐', '😌', '🤔', '😴'].includes(m)) moodMap.neutral++;
    else if (['😔'].includes(m)) moodMap.down++;
    else if (['😰', '😤'].includes(m)) moodMap.anxious++;
    else moodMap.neutral++; // default
  };

  (user.journal || []).forEach(j => processMood(j.mood));
  (user.moodLogs || []).forEach(l => processMood(l.mood));

  const totalEntries = (user.journal?.length || 0) + (user.moodLogs?.length || 0);

  const getPercent = (count) => totalEntries > 0 ? Math.round((count / totalEntries) * 100) : 0;
  
  const moodData = [
    { m: '😊', p: getPercent(moodMap.joyful), c: 'from-emerald-300 to-emerald-500', shadow: 'rgba(16,185,129,0.3)', label: 'Joyful' },
    { m: '😐', p: getPercent(moodMap.neutral), c: 'from-yellow-300 to-yellow-500', shadow: 'rgba(234,179,8,0.3)', label: 'Neutral' },
    { m: '😔', p: getPercent(moodMap.down), c: 'from-indigo-300 to-indigo-500', shadow: 'rgba(99,102,241,0.3)', label: 'Down' },
    { m: '😰', p: getPercent(moodMap.anxious), c: 'from-red-300 to-red-500',   shadow: 'rgba(239,68,68,0.3)', label: 'Anxious' },
  ];

  // If no data, provide a gentle baseline
  const finalMoodData = totalEntries === 0 ? [
    { m: '😊', p: 0, c: 'from-emerald-300 to-emerald-500', shadow: 'rgba(16,185,129,0.3)', label: 'Joyful' },
    { m: '😐', p: 0, c: 'from-yellow-300 to-yellow-500', shadow: 'rgba(234,179,8,0.3)', label: 'Neutral' },
    { m: '😔', p: 0, c: 'from-indigo-300 to-indigo-500', shadow: 'rgba(99,102,241,0.3)', label: 'Down' },
    { m: '😰', p: 0, c: 'from-red-300 to-red-500',   shadow: 'rgba(239,68,68,0.3)', label: 'Anxious' },
  ] : moodData;

  return (
    <div className="max-w-6xl mx-auto pb-24 fade-in space-y-10 relative">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-blue-200/40 via-transparent to-transparent blur-[120px] rounded-full pointer-events-none -z-10 animate-pulse-slow"></div>
      <div className="absolute bottom-40 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-emerald-200/30 via-transparent to-transparent blur-[100px] rounded-full pointer-events-none -z-10"></div>

      {/* HEADER SECTION */}
      <div className="px-2 pt-4">
        <h1 className="text-4xl md:text-5xl font-serif font-black text-[#0D1B2A] mb-3 drop-shadow-sm tracking-tight">Your Wellness Journey</h1>
        <p className="text-[#0D1B2A]/60 font-medium text-sm md:text-base max-w-2xl">
          A visual reflection of your emotional growth, consistency, and patterns. Every small step is tracked and celebrated here.
        </p>
      </div>

      {/* ─── SUMMARY STATS ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          icon={<FiIcons.FiBookOpen size={24} />}
          value={totalJournals}
          label="Journal Entries"
          gradient="from-blue-100 to-blue-50"
          iconColor="text-blue-500"
        />
        <StatCard 
          icon={<FiIcons.FiWind size={24} />}
          value={totalActivities}
          label="Habits Formed"
          gradient="from-emerald-100 to-emerald-50"
          iconColor="text-emerald-500"
        />
        <StatCard 
          icon={<FiIcons.FiActivity size={24} />}
          value={totalAssessments}
          label="Insights Gained"
          gradient="from-[#F5A623]/20 to-[#FFD93D]/10"
          iconColor="text-[#F5A623]"
        />
      </div>

      {/* ─── ACTIVITY HEATMAP -> ENERGY PULSE ─── */}
      <section className="bg-white/50 backdrop-blur-3xl rounded-[48px] border border-white p-8 md:p-14 shadow-[0_20px_60px_rgba(0,0,0,0.03)] relative overflow-hidden group">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 relative z-10">
          <div>
            <h2 className="text-3xl font-serif font-black text-[#0D1B2A] mb-2 tracking-tight">Energy Pulse</h2>
            <p className="text-sm font-semibold text-[#0D1B2A]/50">Your real-time activity tracking over the last 30 days.</p>
          </div>
          <div className="flex gap-2 items-center bg-white/70 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/80 shadow-sm">
            <span className="text-[10px] font-black text-[#0D1B2A]/40 uppercase tracking-widest mr-2">Inactive</span>
            <div className="w-12 h-3 bg-gradient-to-r from-gray-200 via-emerald-300 to-emerald-500 rounded-full opacity-60"></div>
            <span className="text-[10px] font-black text-[#0D1B2A]/40 uppercase tracking-widest ml-2">High Energy</span>
          </div>
        </div>

        <div className="relative z-10 w-full pt-10 pb-4 h-64 border-b border-[#0D1B2A]/5">
          {/* Background Grid Lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none z-0">
            <div className="w-full h-px bg-[#0D1B2A]/5"></div>
            <div className="w-full h-px bg-[#0D1B2A]/5"></div>
            <div className="w-full h-px bg-[#0D1B2A]/5"></div>
          </div>

          <div className="w-full h-full flex items-end justify-between gap-1 sm:gap-2 px-2">
            {daysData.map((d, i) => {
              const heightPercent = d.count === 0 ? 5 : Math.max(15, (d.count / maxActivity) * 100);
              const isActive = d.count > 0;
              
              return (
                <div key={i} className="flex-1 flex justify-center group/bar relative h-full">
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover/bar:opacity-100 transition-all duration-300 transform translate-y-2 group-hover/bar:translate-y-0 pointer-events-none z-50">
                    <div className="bg-[#0D1B2A] text-white text-[10px] font-black px-3 py-1.5 rounded-xl whitespace-nowrap shadow-xl border border-white/10 uppercase tracking-wider">
                      {d.count} Actions <span className="opacity-50 mx-1">•</span> {d.dateStr}
                    </div>
                    <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-[#0D1B2A] mx-auto"></div>
                  </div>

                  {/* Vertical Liquid Fill Bar */}
                  <div className="w-full max-w-[24px] h-full flex items-end">
                    <div 
                      className={`w-full rounded-full transition-all duration-700 ease-out flex justify-center group-hover/bar:-translate-y-1 relative overflow-hidden ${
                        isActive 
                          ? 'bg-gradient-to-t from-emerald-400 to-emerald-500 shadow-[0_4px_15px_rgba(16,185,129,0.4)]' 
                          : 'bg-[#0D1B2A]/5 hover:bg-[#0D1B2A]/10'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    >
                      {isActive && <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/30 to-transparent opacity-0 group-hover/bar:opacity-100 transition-opacity"></div>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* X-Axis labels */}
        <div className="flex justify-between items-center w-full px-2 mt-4">
          <span className="text-[10px] font-black text-[#0D1B2A]/40 uppercase tracking-widest">{daysData[0].dateStr}</span>
          <span className="text-[10px] font-black text-[#0D1B2A]/40 uppercase tracking-widest">{daysData[29].dateStr} (Today)</span>
        </div>
      </section>

      {/* ─── INSIGHTS ROW ─── */}
      <section className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Mood Distribution */}
        <div className="lg:col-span-3 bg-white/50 backdrop-blur-3xl rounded-[48px] border border-white p-8 md:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.03)] relative overflow-hidden group">
          <div className="text-[11px] font-black uppercase tracking-[0.2em] text-[#0D1B2A]/40 mb-10 px-2 flex items-center gap-3">
             <div className="w-8 h-px bg-[#0D1B2A]/10"></div> 
             Emotional Spectrum
          </div>
          
          <div className="flex items-end justify-around gap-2 h-56 px-4 md:px-8 mt-12 relative z-10 w-full">
            {/* Background Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none z-0 px-8">
               {[100, 75, 50, 25, 0].map(line => (
                 <div key={line} className="w-full h-px bg-[#0D1B2A]/[0.03] flex items-center relative">
                   <span className="absolute -left-4 text-[9px] font-bold text-[#0D1B2A]/20">{line}%</span>
                 </div>
               ))}
            </div>

            {finalMoodData.map((item, idx) => (
              <div key={item.m} className="flex-1 h-full flex flex-col items-center gap-5 relative z-10 group/bar">
                
                {/* Custom Bar */}
                <div className="w-12 md:w-16 relative flex justify-center h-full items-end">
                   {/* Hover Tooltip */}
                   <div className="absolute -top-12 opacity-0 group-hover/bar:opacity-100 transition-all duration-300 transform translate-y-2 group-hover/bar:translate-y-0 pointer-events-none whitespace-nowrap z-50">
                     <div className="bg-white text-[#0D1B2A] text-xs font-black px-4 py-2 rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.1)] border border-black/5">
                       {item.p}%
                     </div>
                   </div>

                   <div 
                     className={`w-full rounded-2xl bg-gradient-to-t ${item.c} transition-all duration-1000 ease-out flex justify-center group-hover/bar:-translate-y-2 relative overflow-hidden`}
                     style={{ height: `${item.p}%`, boxShadow: `0 10px 20px ${item.shadow}` }}
                   >
                      <div className="absolute top-0 left-0 w-full h-full bg-white/20 opacity-0 group-hover/bar:opacity-100 transition-opacity"></div>
                   </div>
                </div>

                <div className="text-center mt-2">
                  <div className="text-2xl md:text-3xl filter hover:drop-shadow-lg transition-all duration-300 cursor-help mb-1">{item.m}</div>
                  <div className="text-[9px] font-black text-[#0D1B2A]/40 uppercase tracking-widest">{item.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Wellness Architect AI */}
        <div className="lg:col-span-2 bg-[#0D1B2A] text-white rounded-[48px] border border-white/10 p-10 shadow-[0_30px_80px_rgba(13,27,42,0.4)] relative overflow-hidden flex flex-col justify-between group transform transition-transform hover:-translate-y-2 duration-500">
          
          <div className="absolute top-[-20%] right-[-20%] w-[300px] h-[300px] bg-gradient-to-bl from-emerald-500/20 to-blue-500/10 blur-[80px] rounded-full pointer-events-none transition-transform duration-1000 group-hover:scale-110"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/5">
                <span className="text-xl">✨</span>
              </div>
              <div className="text-[11px] font-black uppercase tracking-[0.2em] text-white/60">Wellness Architect</div>
            </div>

            <h3 className="text-3xl font-serif font-black mb-4 leading-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">
              Your Optimal <br/>Routine Discovered
            </h3>
            
            <p className="text-white/70 text-[15px] font-medium leading-relaxed mb-8">
              Based on recent activity, you are highly resilient in the mornings. Scheduling deep-focus journals before 11 AM maximizes your emotional stability score.
            </p>
          </div>

          <div className="relative z-10 w-full bg-white/5 backdrop-blur-md rounded-[24px] border border-white/10 p-5 mt-auto transition-colors hover:bg-white/10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                <FiIcons.FiTrendingUp size={20} />
              </div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-1">Growth Mission</div>
                <div className="text-[13px] text-white/90 font-bold leading-tight">Try a social connectivity objective today to boost your balance.</div>
              </div>
            </div>
          </div>
        </div>

      </section>
    </div>
  );
};

// Sub-component for clean Stats
const StatCard = ({ icon, value, label, gradient, iconColor }) => (
  <div className="bg-white/50 backdrop-blur-3xl rounded-[32px] border border-white/80 p-8 shadow-[0_15px_40px_rgba(0,0,0,0.02)] flex items-center gap-6 group hover:-translate-y-1 transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] cursor-default">
    <div className={`w-16 h-16 bg-gradient-to-br ${gradient} ${iconColor} rounded-[20px] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500 shadow-inner border border-white/50`}>
      {icon}
    </div>
    <div>
      <div className="text-3xl md:text-4xl font-serif font-black text-[#0D1B2A] tracking-tight">{value}</div>
      <div className="text-[11px] font-black uppercase tracking-[0.2em] text-[#0D1B2A]/40 mt-1">{label}</div>
    </div>
  </div>
);

export default Insights;
