import React, { useEffect, useRef, useState } from 'react';

const COLORS = [
  '#FF6B6B','#FFD93D','#6BCB77','#4D96FF','#C77DFF',
  '#FF9F1C','#2EC4B6','#FF70A6','#A8DADC','#F4A261',
];
const SHAPES = ['rounded-full', 'rounded-sm', 'rounded-none'];

function generateParticles() {
  return Array.from({ length: 90 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    color: COLORS[i % COLORS.length],
    width: `${6 + Math.random() * 8}px`,
    height: `${6 + Math.random() * 14}px`,
    shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
    duration: `${1.6 + Math.random() * 1.8}s`,
    delay: `${Math.random() * 0.6}s`,
    drift: `${(Math.random() - 0.5) * 180}px`,
    rotation: `${Math.random() * 720}deg`,
    opacity: 0.7 + Math.random() * 0.3,
  }));
}

export default function LevelUpCelebration({ level }) {
  const prevLevel = useRef(level);
  const [celebrating, setCelebrating] = useState(false);
  const [newLevel, setNewLevel] = useState(level);
  const [particles] = useState(generateParticles);

  useEffect(() => {
    if (level > prevLevel.current) {
      setNewLevel(level);
      setCelebrating(true);
      const t = setTimeout(() => setCelebrating(false), 3000);
      prevLevel.current = level;
      return () => clearTimeout(t);
    }
    prevLevel.current = level;
  }, [level]);

  if (!celebrating) return null;

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden">
      {/* Confetti */}
      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(-20px) translateX(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) translateX(var(--drift)) rotate(var(--rot)); opacity: 0; }
        }
      `}</style>
      {particles.map(p => (
        <div
          key={p.id}
          className={`absolute top-0 ${p.shape}`}
          style={{
            left: p.left,
            width: p.width,
            height: p.height,
            backgroundColor: p.color,
            opacity: p.opacity,
            '--drift': p.drift,
            '--rot': p.rotation,
            animation: `confettiFall ${p.duration} ${p.delay} ease-in forwards`,
          }}
        />
      ))}

      {/* Banner */}
      <div className="absolute inset-0 flex items-center justify-center">
        <style>{`
          @keyframes levelUpPop {
            0%   { transform: scale(0.3); opacity: 0; }
            40%  { transform: scale(1.15); opacity: 1; }
            60%  { transform: scale(0.95); }
            75%  { transform: scale(1.05); }
            88%  { transform: scale(0.98); }
            100% { transform: scale(1); opacity: 1; }
          }
          @keyframes levelUpFade {
            0%   { opacity: 1; }
            70%  { opacity: 1; }
            100% { opacity: 0; }
          }
          .level-up-banner {
            animation: levelUpPop 0.7s cubic-bezier(0.36,0.07,0.19,0.97) both,
                       levelUpFade 3s ease-out forwards;
          }
        `}</style>
        <div className="level-up-banner flex flex-col items-center gap-4 select-none">
          <div className="text-7xl drop-shadow-2xl">🏆</div>
          <div className="px-10 py-6 bg-gradient-to-br from-amber-400 via-orange-400 to-yellow-300 rounded-[32px] shadow-2xl border-4 border-white/60 text-center backdrop-blur-sm">
            <div className="text-white/80 font-black text-sm uppercase tracking-[0.3em] mb-1">Level Up!</div>
            <div className="text-white font-black text-6xl drop-shadow-lg">Level {newLevel}</div>
            <div className="text-white/70 font-semibold text-sm mt-2">You're growing stronger 💪</div>
          </div>
        </div>
      </div>
    </div>
  );
}
