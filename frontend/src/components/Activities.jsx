import React, { useState, useEffect } from 'react';
import * as FiIcons from 'react-icons/fi';

export default function Activities({ user, onUpdateUser }) {
  const [latestRecommendations, setLatestRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completingActivity, setCompletingActivity] = useState(null);

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/ai/assessments', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const assessments = data.assessments || [];
          
          if (assessments.length > 0) {
            // assessments from the API are usually reverse ordered (newest first based on Dashboard logic)
            // It uses: const last5 = all.slice(-5).reverse(); so index 0 is the newest.
            const latest = assessments[0];
            const aiData = latest.data?.aiServiceResponse ?? latest.aiServiceResponse ?? {};
            if (aiData.recommendations && aiData.recommendations.length > 0) {
              setLatestRecommendations(aiData.recommendations);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load activities:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssessments();
  }, []);

  const handleComplete = async (activityText) => {
    setCompletingActivity(activityText);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/auth/complete-activity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ activityText })
      });
      
      if (res.ok) {
        const updatedUser = await res.json();
        onUpdateUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (err) {
      console.error('Failed to complete activity', err);
    } finally {
      setCompletingActivity(null);
    }
  };

  const completedSet = new Set(user.completedActivities || []);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="mb-8">
        <h1 className="text-4xl font-serif font-black tracking-tight mb-2">Recommended Activities</h1>
        <p className="text-xs font-black uppercase tracking-widest text-[#0D1B2A]/40">from your latest AI assessment</p>
      </header>

      {/* Gamification Stats Header for Activities */}
      <div className="bg-white/40 backdrop-blur-xl border border-white p-6 rounded-[32px] shadow-sm flex flex-col md:flex-row items-center gap-6 justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-100/50 rounded-2xl flex items-center justify-center text-blue-500 shadow-inner">
            <FiIcons.FiAward size={32} />
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-[#0D1B2A]/40 mb-1">Your Progress</div>
            <div className="text-2xl font-black">Level {user.level || 1}</div>
          </div>
        </div>
        <div className="flex-1 w-full max-w-sm">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2 text-[#0D1B2A]/60">
            <span>XP to level up</span>
            <span>{user.xp || 0} / 1000 XP</span>
          </div>
          <div className="w-full h-4 bg-white/60 rounded-full overflow-hidden shadow-inner">
            <div 
              className="h-full bg-blue-400 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(96,165,250,0.5)]" 
              style={{ width: `${((user.xp || 0) / 1000) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20 gap-3 text-[#0D1B2A]/40">
          <FiIcons.FiLoader size={24} className="animate-spin" />
          <span className="text-sm font-medium tracking-wide">Fetching your plan...</span>
        </div>
      )}

      {!loading && latestRecommendations.length === 0 && (
        <div className="bg-white/60 backdrop-blur-xl border border-white rounded-[32px] p-12 text-center shadow-sm">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-300 mx-auto mb-6">
            <FiIcons.FiWind size={36} />
          </div>
          <h3 className="text-xl font-bold mb-2">No Activities Found</h3>
          <p className="text-sm font-medium text-[#0D1B2A]/50">Complete an AI Assessment to get personalized activity recommendations!</p>
        </div>
      )}

      {/* Activities Grid */}
      {!loading && latestRecommendations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {latestRecommendations.map((activity, idx) => {
            const isCompleted = completedSet.has(activity);
            const isActing = completingActivity === activity;

            return (
              <div 
                key={idx} 
                className={`group relative overflow-hidden bg-white/60 backdrop-blur-xl border border-white rounded-[32px] p-8 shadow-sm transition-all duration-300 ${isCompleted ? 'opacity-70' : 'hover:shadow-md hover:-translate-y-1'}`}
              >
                {/* Visual Flair */}
                <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] rounded-full -z-10 transition-colors duration-500 pointer-events-none ${isCompleted ? 'bg-emerald-200/40' : 'bg-blue-200/30 group-hover:bg-blue-300/40'}`}></div>

                <div className="flex items-start gap-5">
                  <div className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center shadow-inner transition-colors duration-300 ${isCompleted ? 'bg-emerald-100 text-emerald-500' : 'bg-blue-50 text-blue-400'}`}>
                    {isCompleted ? <FiIcons.FiCheckCircle size={24} /> : <FiIcons.FiCheckSquare size={24} />}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-base md:text-lg font-bold text-[#0D1B2A] leading-snug mb-6">{activity}</h4>
                    
                    <button
                      onClick={() => handleComplete(activity)}
                      disabled={isCompleted || isActing}
                      className={`inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all cursor-pointer shadow-sm
                        ${isCompleted 
                          ? 'bg-emerald-50 text-emerald-500 border border-emerald-100 cursor-not-allowed' 
                          : 'bg-[#0D1B2A] text-white hover:bg-black hover:shadow-md active:scale-95'
                        }
                      `}
                    >
                      {isActing ? (
                        <><FiIcons.FiLoader size={14} className="animate-spin" /> Processing...</>
                      ) : isCompleted ? (
                        <><FiIcons.FiCheck size={14} /> Completed</>
                      ) : (
                        <><FiIcons.FiPlay size={14} /> Complete (+150 XP)</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
