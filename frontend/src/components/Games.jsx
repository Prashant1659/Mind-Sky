import React, { useState, useRef, useEffect } from 'react';
import * as FiIcons from 'react-icons/fi';

/* ═══════════════════════════════════════════════════════════
   GAME 1 — BUBBLE WRAP
═══════════════════════════════════════════════════════════ */
const MathCols = Math.floor(typeof window !== 'undefined' && window.innerWidth < 600 ? 7 : 12);
const COLS = 12;
const ROWS = 9;
const TOTAL = COLS * ROWS;

function BubbleWrap({ onBack, onXP }) {
  const [popped, setPopped] = useState(() => new Array(TOTAL).fill(false));
  const [rewardGranted, setRewardGranted] = useState(false);
  const [xpPops, setXpPops] = useState([]);      // list of floating +XP particles
  const lastMilestone = useRef(0);               // tracks last 10-bubble milestone
  const xpPopId = useRef(0);
  const poppedCount = popped.filter(Boolean).length;

  const spawnXPPop = (label) => {
    const id = xpPopId.current++;
    setXpPops(prev => [...prev, { id, label }]);
    setTimeout(() => setXpPops(prev => prev.filter(p => p.id !== id)), 1500);
  };

  const playPopSound = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.05);
      
      gainNode.gain.setValueAtTime(1.5, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
      
      const bufferSize = ctx.sampleRate * 0.05;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'highpass';
      noiseFilter.frequency.value = 5000;
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.5, ctx.currentTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
      
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start(ctx.currentTime);
      noise.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.05);
      noise.stop(ctx.currentTime + 0.05);
    } catch(e) {
      console.warn('Audio play restricted or unsupported');
    }
  };

  const handlePop = (i, e) => {
    if (e.type === 'pointerenter' && e.buttons !== 1) return;
    if (popped[i]) return;
    setPopped(p => {
      const n = [...p];
      n[i] = true;
      const newCount = n.filter(Boolean).length;
      // every 10 bubbles: grant +5 XP
      const milestone = Math.floor(newCount / 10);
      if (milestone > lastMilestone.current) {
        lastMilestone.current = milestone;
        if (onXP) onXP(5);
        spawnXPPop('+5 XP');
      }
      return n;
    });
    playPopSound();
  };

  const allPopped = poppedCount === TOTAL;

  useEffect(() => {
    if (allPopped && !rewardGranted) {
      if (onXP) onXP(50);
      setRewardGranted(true);
      spawnXPPop('+50 XP 🎉');
    }
  }, [allPopped, rewardGranted, onXP]);

  const reset = () => {
    setPopped(new Array(TOTAL).fill(false));
    setRewardGranted(false);
    lastMilestone.current = 0;
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto overflow-hidden relative">
      {/* XP floating pop animations */}
      <style>{`
        @keyframes xpFloat {
          0%   { transform: translate(-50%, 0px);   opacity: 0; scale: 0.6; }
          15%  { transform: translate(-50%, -20px);  opacity: 1; scale: 1.25; }
          70%  { transform: translate(-50%, -60px);  opacity: 1; scale: 1; }
          100% { transform: translate(-50%, -100px); opacity: 0; scale: 0.85; }
        }
        .xp-float { animation: xpFloat 1.5s ease-out forwards; }
      `}</style>
      {xpPops.map(p => (
        <div key={p.id} className="xp-float absolute top-1/2 left-1/2 pointer-events-none z-50 whitespace-nowrap">
          <div className="px-4 py-2 bg-gradient-to-r from-violet-500 to-indigo-500 text-white font-black text-lg rounded-full shadow-2xl border-2 border-white/50">
            {p.label}
          </div>
        </div>
      ))}

      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <div>
          <h2 className="text-2xl font-serif font-black text-[#0D1B2A]">Bubble Wrap</h2>
          <p className="text-xs font-black uppercase tracking-widest text-[#0D1B2A]/40">
            {poppedCount} / {TOTAL} popped
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={reset}
            className="px-4 py-2 bg-white border border-gray-100 text-[#0D1B2A] rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-50 shadow-sm transition-all cursor-pointer"
          >
            Refill 🫧
          </button>
          <button onClick={onBack} className="px-4 py-2 bg-[#0D1B2A] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black shadow-sm transition-all cursor-pointer">
            ← Back
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full transition-all duration-300"
          style={{ width: `${(poppedCount / TOTAL) * 100}%` }}
        />
      </div>

      {allPopped && (
        <div className="py-3 px-6 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-700 font-black text-sm flex items-center gap-2 w-full justify-center">
          🎉 All popped! So satisfying!
        </div>
      )}

      {/* Bubble grid - honeycomb wrap */}
      <div className="flex flex-col items-center justify-center py-10 px-0 sm:px-8 w-full max-w-full bg-[#c2e4f7]/80 backdrop-blur-3xl border border-white/50 rounded-[36px] shadow-2xl overflow-hidden touch-none select-none">
        {Array.from({ length: ROWS }).map((_, r) => (
          <div key={r} className={`flex justify-center flex-nowrap ${r > 0 ? '-mt-3.5' : ''} ${r % 2 === 1 ? 'ml-7' : ''}`}>
             {Array.from({ length: COLS }).map((_, c) => {
                const i = r * COLS + c;
                const isPop = popped[i];
                return (
                   <div
                     key={c}
                     onPointerDown={(e) => handlePop(i, e)}
                     onPointerEnter={(e) => handlePop(i, e)}
                     className={`w-14 h-14 rounded-full relative transition-all duration-[50ms] focus:outline-none select-none flex-shrink-0 -ml-1 ${
                       isPop
                         ? 'opacity-80 mix-blend-multiply scale-[0.85] cursor-default'
                         : 'shadow-[0_4px_8px_rgba(0,0,0,0.1),inset_0_4px_8px_rgba(255,255,255,0.9),inset_0_-2px_6px_rgba(0,0,0,0.15)] hover:scale-105 hover:brightness-110 active:scale-95 cursor-pointer z-10'
                     }`}
                     style={
                       isPop
                         ? { background: 'rgba(255,255,255,0.1)' }
                         : { background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.3) 25%, rgba(180,225,250,0.5) 75%, rgba(135,206,235,0.6) 100%)', 
                             backdropFilter: 'blur(2px)' }
                     }
                   >
                     {!isPop ? (
                       <>
                         <div className="absolute top-[18%] left-[22%] w-[35%] h-[18%] bg-white rounded-full rotate-[-25deg] blur-[0.5px]"></div>
                         <div className="absolute bottom-[15%] right-[20%] w-[15%] h-[10%] bg-[#0f3b55]/20 rounded-full rotate-[-25deg] blur-[1px]"></div>
                       </>
                     ) : (
                       <svg viewBox="0 0 100 100" className="w-[125%] h-[125%] absolute -top-[12.5%] -left-[12.5%] opacity-50">
                         <path d="M 25 35 Q 50 15 75 35" stroke="#000" strokeWidth="2" fill="none" opacity="0.3"/>
                         <path d="M 20 65 Q 50 50 80 65" stroke="#000" strokeWidth="2" fill="none" opacity="0.2"/>
                         <path d="M 40 15 Q 55 50 45 80" stroke="#000" strokeWidth="1" fill="none" opacity="0.4"/>
                         <path d="M 25 35 Q 50 15 75 35" stroke="#fff" strokeWidth="3" fill="none" opacity="0.8" transform="translate(1, 1)"/>
                         <circle cx="50" cy="50" r="46" fill="none" stroke="#000" strokeWidth="1.5" opacity="0.1"/>
                       </svg>
                     )}
                   </div>
                );
             })}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   GAME 2 — COLORING BOOK
═══════════════════════════════════════════════════════════ */
const PALETTE = [
  '#EF4444','#F97316','#FBBF24','#22C55E',
  '#14B8A6','#3B82F6','#8B5CF6','#EC4899',
  '#FDE68A','#BBF7D0','#BAE6FD','#DDD6FE',
  '#FFFFFF','#D1D5DB','#374151','#1F2937',
];

// SVG regions: a simple mandala-style flower
const FLOWER_REGIONS = [
  { id: 'bg',      d: 'M0,0 H300 V340 H0 Z' },
  { id: 'stem',    d: 'M145,230 C143,255 141,275 140,310 L160,310 C159,275 157,255 155,230 Z' },
  { id: 'leafL',   d: 'M147,280 C130,265 105,268 108,282 C111,296 135,292 147,280 Z' },
  { id: 'leafR',   d: 'M153,265 C170,250 195,253 192,267 C189,281 165,277 153,265 Z' },
  { id: 'petal1',  d: 'M150,170 C158,140 175,115 160,95 C145,115 138,140 150,170 Z' },
  { id: 'petal2',  d: 'M150,170 C180,162 205,148 205,128 C185,128 162,148 150,170 Z' },
  { id: 'petal3',  d: 'M150,170 C180,178 205,193 205,213 C185,213 162,193 150,170 Z' },
  { id: 'petal4',  d: 'M150,170 C158,200 175,225 160,245 C145,225 138,200 150,170 Z' },
  { id: 'petal5',  d: 'M150,170 C120,178 95,193 95,213 C115,213 138,193 150,170 Z' },
  { id: 'petal6',  d: 'M150,170 C120,162 95,148 95,128 C115,128 138,148 150,170 Z' },
  { id: 'innerP1', d: 'M150,170 C155,152 163,140 156,130 C149,138 144,152 150,170 Z' },
  { id: 'innerP2', d: 'M150,170 C165,167 174,158 170,151 C162,152 153,163 150,170 Z' },
  { id: 'innerP3', d: 'M150,170 C165,173 174,182 170,189 C162,188 153,177 150,170 Z' },
  { id: 'innerP4', d: 'M150,170 C155,188 163,200 156,210 C149,202 144,188 150,170 Z' },
  { id: 'innerP5', d: 'M150,170 C135,173 126,182 130,189 C138,188 147,177 150,170 Z' },
  { id: 'innerP6', d: 'M150,170 C135,167 126,158 130,151 C138,152 147,163 150,170 Z' },
  { id: 'center',  d: 'M150,170 m-18,0 a18,18 0 1,0 36,0 a18,18 0 1,0 -36,0' },
  { id: 'dot',     d: 'M150,170 m-6,0 a6,6 0 1,0 12,0 a6,6 0 1,0 -12,0' },
];

const HOUSE_REGIONS = [
  { id: 'bg', d: 'M0,0 H300 V340 H0 Z' },
  { id: 'sky', d: 'M0,0 H300 V280 H0 Z' },
  { id: 'ground', d: 'M0,280 H300 V340 H0 Z' },
  { id: 'walls', d: 'M80,160 H220 V280 H80 Z' },
  { id: 'roof', d: 'M60,160 L150,70 L240,160 Z' },
  { id: 'door', d: 'M130,220 H170 V280 H130 Z' },
  { id: 'doorKnob', d: 'M160,250 m-3,0 a3,3 0 1,0 6,0 a3,3 0 1,0 -6,0' },
  { id: 'window1', d: 'M100,180 H120 V210 H100 Z' },
  { id: 'window2', d: 'M180,180 H200 V210 H180 Z' },
  { id: 'chimney', d: 'M190,100 H210 V130 H190 Z' },
  { id: 'sun', d: 'M50,50 m-20,0 a20,20 0 1,0 40,0 a20,20 0 1,0 -40,0' },
  { id: 'cloud1', d: 'M230,60 C230,50 250,40 260,50 C270,40 290,50 280,65 C290,75 270,85 260,80 C240,90 220,80 230,60 Z' },
];

const BUTTERFLY_REGIONS = [
  { id: 'bg', d: 'M0,0 H300 V340 H0 Z' },
  // Body
  { id: 'body', d: 'M140,80 C140,80 160,80 160,160 C160,300 140,300 140,160 Z' },
  // Head
  { id: 'head', d: 'M150,70 m-15,0 a15,15 0 1,0 30,0 a15,15 0 1,0 -30,0' },
  // Antennae
  { id: 'antL', d: 'M140,60 C130,40 100,30 110,20 C115,15 120,25 115,35 C110,45 130,50 145,65 Z' },
  { id: 'antR', d: 'M160,60 C170,40 200,30 190,20 C185,15 180,25 185,35 C190,45 170,50 155,65 Z' },
  // Wings
  { id: 'wingL_top', d: 'M140,100 C80,60 20,80 30,160 C35,200 90,180 140,160 Z' },
  { id: 'wingL_bot', d: 'M140,160 C100,180 40,240 70,290 C100,320 130,260 145,210 Z' },
  { id: 'wingR_top', d: 'M160,100 C220,60 280,80 270,160 C265,200 210,180 160,160 Z' },
  { id: 'wingR_bot', d: 'M160,160 C200,180 260,240 230,290 C200,320 170,260 155,210 Z' },
  // Wing patterns
  { id: 'patL1', d: 'M80,110 m-15,0 a15,15 0 1,0 30,0 a15,15 0 1,0 -30,0' },
  { id: 'patR1', d: 'M220,110 m-15,0 a15,15 0 1,0 30,0 a15,15 0 1,0 -30,0' },
  { id: 'patL2', d: 'M90,240 m-10,0 a10,10 0 1,0 20,0 a10,10 0 1,0 -20,0' },
  { id: 'patR2', d: 'M210,240 m-10,0 a10,10 0 1,0 20,0 a10,10 0 1,0 -20,0' },
  { id: 'patL3', d: 'M60,150 m-8,0 a8,8 0 1,0 16,0 a8,8 0 1,0 -16,0' },
  { id: 'patR3', d: 'M240,150 m-8,0 a8,8 0 1,0 16,0 a8,8 0 1,0 -16,0' },
];

const TREE_REGIONS = [
  { id: 'bg', d: 'M0,0 H300 V340 H0 Z' },
  { id: 'ground', d: 'M0,280 H300 V340 H0 Z' },
  { id: 'trunk', d: 'M130,280 C130,200 140,160 140,160 H160 C160,160 170,200 170,280 Z' },
  { id: 'leavesC', d: 'M150,50 C110,50 90,80 90,110 C70,110 50,140 60,170 C70,200 100,210 120,200 C130,220 170,220 180,200 C200,210 230,200 240,170 C250,140 230,110 210,110 C210,80 190,50 150,50 Z' },
  { id: 'apple1', d: 'M120,90 m-5,0 a5,5 0 1,0 10,0 a5,5 0 1,0 -10,0' },
  { id: 'apple2', d: 'M180,110 m-5,0 a5,5 0 1,0 10,0 a5,5 0 1,0 -10,0' },
  { id: 'apple3', d: 'M100,150 m-5,0 a5,5 0 1,0 10,0 a5,5 0 1,0 -10,0' },
  { id: 'apple4', d: 'M150,170 m-5,0 a5,5 0 1,0 10,0 a5,5 0 1,0 -10,0' },
  { id: 'apple5', d: 'M200,160 m-5,0 a5,5 0 1,0 10,0 a5,5 0 1,0 -10,0' },
];

const WATERMELON_REGIONS = [
  { id: 'bg', d: 'M0,0 H300 V340 H0 Z' },
  { id: 'rind_out', d: 'M50,120 A100,100 0 0,0 250,120 Z' },
  { id: 'rind_in', d: 'M70,120 A80,80 0 0,0 230,120 Z' }, 
  { id: 'flesh', d: 'M85,120 A65,65 0 0,0 215,120 Z' },
  { id: 'seed1', d: 'M150,140 m-5,0 a5,10 0 1,0 10,0 a5,10 0 1,0 -10,0' },
  { id: 'seed2', d: 'M110,150 m-5,0 a5,10 0 1,0 10,0 a5,10 0 1,0 -10,0' },
  { id: 'seed3', d: 'M190,150 m-5,0 a5,10 0 1,0 10,0 a5,10 0 1,0 -10,0' },
  { id: 'seed4', d: 'M130,170 m-5,0 a5,10 0 1,0 10,0 a5,10 0 1,0 -10,0' },
  { id: 'seed5', d: 'M170,170 m-5,0 a5,10 0 1,0 10,0 a5,10 0 1,0 -10,0' }
];

const MOUNTAIN_REGIONS = [
  { id: 'bg', d: 'M0,0 H300 V340 H0 Z' },
  { id: 'sky', d: 'M0,0 H300 V300 H0 Z' },
  { id: 'sun', d: 'M150,120 m-30,0 a30,30 0 1,0 60,0 a30,30 0 1,0 -60,0' },
  { id: 'mountain_bg_l', d: 'M-50,300 L50,130 L150,300 Z' },
  { id: 'mountain_bg_r', d: 'M150,300 L250,100 L350,300 Z' },
  { id: 'mountain_main', d: 'M50,300 L150,80 L250,300 Z' },
  { id: 'snow_cap', d: 'M150,80 L115,155 L140,145 L150,165 L165,145 L180,145 Z' },
  { id: 'foreground', d: 'M0,300 H300 V340 H0 Z' },
  { id: 'tree1_trunk', d: 'M40,280 H50 V310 H40 Z' },
  { id: 'tree1_leaves', d: 'M20,280 L45,230 L70,280 Z' },
  { id: 'tree2_trunk', d: 'M260,270 H270 V310 H260 Z' },
  { id: 'tree2_leaves', d: 'M240,270 L265,200 L290,270 Z' },
];

const BALLOON_REGIONS = [
  { id: 'bg', d: 'M0,0 H300 V340 H0 Z' },
  { id: 'string_fill', d: 'M149,220 C139,250 159,280 149,330 H151 C161,280 141,250 151,220 Z' },
  { id: 'basket', d: 'M130,190 H170 L160,220 H140 Z' },
  { id: 'b_left', d: 'M150,40 C50,40 50,150 150,190 C120,150 120,80 150,40 Z' },
  { id: 'b_right', d: 'M150,40 C250,40 250,150 150,190 C180,150 180,80 150,40 Z' },
  { id: 'b_mid', d: 'M150,40 C120,80 120,150 150,190 C180,150 180,80 150,40 Z' },
  { id: 'cloudL', d: 'M50,100 C30,100 20,120 40,130 C30,140 50,150 60,140 C80,150 90,130 80,110 C90,90 70,80 50,100 Z' },
  { id: 'cloudR', d: 'M250,200 C230,200 220,220 240,230 C230,240 250,250 260,240 C280,250 290,230 280,210 C290,190 270,180 250,200 Z' },
  { id: 'bird1', d: 'M40,50 Q45,45 50,50 Q55,45 60,50 Q50,40 40,50 Z' },
  { id: 'bird2', d: 'M220,80 Q225,75 230,80 Q235,75 240,80 Q230,70 220,80 Z' },
];

const SUNNY_CAT_REGIONS = [
  { id: 'bg', type: 'rect', x: 0, y: 0, width: 700, height: 520, rx: 18 },
  { id: 'Sun', type: 'circle', cx: 590, cy: 92, r: 54 },
  { id: 'detail1', type: 'path', d: 'M590 14v32M590 138v32M512 92h32M636 92h32M535 37l23 23M622 124l23 23M645 37l-23 23M558 124l-23 23', isDetail: true },
  { id: 'Cat body', type: 'path', d: 'M256 424c-40-34-49-103-24-151 24-47 72-76 122-76s98 29 122 76c25 48 16 117-24 151z' },
  { id: 'Cat head', type: 'path', d: 'M214 210l37-70 57 36c16-6 32-9 50-9 19 0 38 4 55 12l59-39 36 73c17 26 25 56 25 88 0 86-76 154-175 154s-175-68-175-154c0-33 11-64 31-91z' },
  { id: 'Left ear', type: 'path', d: 'M232 211l22-47 38 31c-23 8-42 14-60 16z' },
  { id: 'Right ear', type: 'path', d: 'M419 196l42-30 23 48c-25-4-45-9-65-18z' },
  { id: 'Tail', type: 'path', d: 'M457 391c82 21 122-25 111-72-9-37-62-33-51 1 6 18 26 11 28 30 3 28-43 42-82 25z' },
  { id: 'eye1', type: 'circle', cx: 305, cy: 292, r: 8, isSolidDetail: true },
  { id: 'eye2', type: 'circle', cx: 398, cy: 292, r: 8, isSolidDetail: true },
  { id: 'face_details', type: 'path', d: 'M353 312v21M322 344c17 18 45 18 62 0M253 326h64M252 354h62M389 326h65M392 354h61', isDetail: true }
];

const MOON_ROCKET_REGIONS = [
  { id: 'bg', type: 'rect', x: 0, y: 0, width: 700, height: 520, rx: 18 },
  { id: 'Moon', type: 'circle', cx: 575, cy: 112, r: 58 },
  { id: 'Rocket body', type: 'path', d: 'M355 55c-92 72-101 228-75 311h150c26-83 17-239-75-311z' },
  { id: 'Window', type: 'circle', cx: 355, cy: 187, r: 42 },
  { id: 'Left wing', type: 'path', d: 'M280 312c-69 26-102 78-104 136l103-55z' },
  { id: 'Right wing', type: 'path', d: 'M430 312c69 26 102 78 104 136l-103-55z' },
  { id: 'Flame', type: 'path', d: 'M307 366c4 42 21 80 48 113 27-33 44-71 48-113z' },
  { id: 'Star one', type: 'circle', cx: 135, cy: 92, r: 24 },
  { id: 'Star two', type: 'circle', cx: 166, cy: 218, r: 18 },
  { id: 'Star three', type: 'circle', cx: 520, cy: 265, r: 20 },
  { id: 'lines', type: 'path', d: 'M304 255h102M299 308h112M355 55v311', isDetail: true }
];

const HAPPY_FISH_REGIONS = [
  { id: 'bg', type: 'rect', x: 0, y: 0, width: 700, height: 520, rx: 18 },
  { id: 'Fish body', type: 'path', d: 'M150 270c75-95 239-118 360 0-121 118-285 95-360 0z' },
  { id: 'Tail', type: 'path', d: 'M510 270l105-83c18 56 18 111 0 166z' },
  { id: 'Top fin', type: 'path', d: 'M300 188c33-52 86-80 139-77-20 40-46 72-84 95z' },
  { id: 'Bottom fin', type: 'path', d: 'M314 349c36 42 82 57 132 45-19-30-47-51-87-67z' },
  { id: 'Bubble one', type: 'circle', cx: 135, cy: 128, r: 29 },
  { id: 'Bubble two', type: 'circle', cx: 210, cy: 92, r: 19 },
  { id: 'Bubble three', type: 'circle', cx: 572, cy: 126, r: 24 },
  { id: 'eye', type: 'circle', cx: 254, cy: 256, r: 11, isSolidDetail: true },
  { id: 'fish_lines', type: 'path', d: 'M280 304c30 20 71 18 101-4M361 197c35 37 35 106 0 146M437 224c27 28 27 70 0 96', isDetail: true }
];

const GARDEN_FLOWER_REGIONS = [
  { id: 'bg', type: 'rect', x: 0, y: 0, width: 700, height: 520, rx: 18 },
  { id: 'Stem', type: 'path', d: 'M341 295c8 58 8 112-2 164h36c-11-52-11-106-2-164z' },
  { id: 'Left leaf', type: 'path', d: 'M342 384c-64-55-119-52-164-10 58 42 113 42 164 10z' },
  { id: 'Right leaf', type: 'path', d: 'M371 358c68-50 120-42 161 4-58 37-111 36-161-4z' },
  { id: 'Top petal', type: 'ellipse', cx: 355, cy: 137, rx: 53, ry: 94 },
  { id: 'Left petal', type: 'ellipse', cx: 268, cy: 224, rx: 53, ry: 94, transform: 'rotate(-55 268 224)' },
  { id: 'Right petal', type: 'ellipse', cx: 442, cy: 224, rx: 53, ry: 94, transform: 'rotate(55 442 224)' },
  { id: 'Lower left petal', type: 'ellipse', cx: 311, cy: 282, rx: 52, ry: 82, transform: 'rotate(20 311 282)' },
  { id: 'Lower right petal', type: 'ellipse', cx: 399, cy: 282, rx: 52, ry: 82, transform: 'rotate(-20 399 282)' },
  { id: 'Flower center', type: 'circle', cx: 355, cy: 231, r: 58 },
  { id: 'flower_lines', type: 'path', d: 'M355 176v110M300 228h110M318 195l75 75M394 195l-78 78', isDetail: true }
];

const TINY_DINOSAUR_REGIONS = [
  { id: 'bg', type: 'rect', x: 0, y: 0, width: 700, height: 520, rx: 18 },
  { id: 'Dinosaur body', type: 'path', d: 'M159 348c27-104 120-156 242-135 87 15 145-2 166-43 46 71-5 152-112 165-21 72-79 106-170 96-61-7-104-35-126-83z' },
  { id: 'Neck and head', type: 'path', d: 'M386 219c22-91 91-135 175-116 56 13 82 49 67 89-15 42-75 43-118 20-16 30-34 52-57 66z' },
  { id: 'Tail', type: 'path', d: 'M165 348c-58-5-96-34-117-87 74 13 122 38 151 75z' },
  { id: 'Back plates', type: 'path', d: 'M219 248l34-62 30 66M306 224l37-70 34 76M406 228l36-61 31 71' },
  { id: 'Front leg', type: 'path', d: 'M407 349h54l16 93h-60z' },
  { id: 'Back leg', type: 'path', d: 'M240 358h58l-5 84h-66z' },
  { id: 'eye', type: 'circle', cx: 577, cy: 154, r: 9, isSolidDetail: true },
  { id: 'lines', type: 'path', d: 'M536 188c16 16 36 18 55 5M272 431h43M410 431h70', isDetail: true }
];

const FRIENDLY_ROBOT_REGIONS = [
  { id: 'bg', type: 'rect', x: 0, y: 0, width: 700, height: 520, rx: 18 },
  { id: 'Antenna', type: 'path', d: 'M341 87h32v69h-32z' },
  { id: 'Antenna ball', type: 'circle', cx: 357, cy: 66, r: 28 },
  { id: 'Head', type: 'rect', x: 219, y: 145, width: 276, height: 156, rx: 28 },
  { id: 'Body', type: 'rect', x: 250, y: 303, width: 214, height: 146, rx: 18 },
  { id: 'Left arm', type: 'rect', x: 131, y: 320, width: 119, height: 46, rx: 20 },
  { id: 'Right arm', type: 'rect', x: 464, y: 320, width: 119, height: 46, rx: 20 },
  { id: 'Left button', type: 'circle', cx: 320, cy: 367, r: 22 },
  { id: 'Right button', type: 'circle', cx: 394, cy: 367, r: 22 },
  { id: 'Left foot', type: 'rect', x: 247, y: 449, width: 72, height: 34, rx: 12 },
  { id: 'Right foot', type: 'rect', x: 395, y: 449, width: 72, height: 34, rx: 12 },
  { id: 'eyeL', type: 'circle', cx: 303, cy: 222, r: 13, isSolidDetail: true },
  { id: 'eyeR', type: 'circle', cx: 411, cy: 222, r: 13, isSolidDetail: true },
  { id: 'lines', type: 'path', d: 'M322 260h70M169 365v51M545 365v51', isDetail: true }
];

const BRIGHT_BUTTERFLY_REGIONS = [
  { id: 'bg', type: 'rect', x: 0, y: 0, width: 700, height: 520, rx: 18 },
  { id: 'Body', type: 'ellipse', cx: 352, cy: 275, rx: 34, ry: 145 },
  { id: 'Left upper wing', type: 'path', d: 'M322 235c-86-151-244-147-246-24-1 83 98 111 246 24z' },
  { id: 'Right upper wing', type: 'path', d: 'M382 235c86-151 244-147 246-24 1 83-98 111-246 24z' },
  { id: 'Left lower wing', type: 'path', d: 'M324 294c-120 0-194 68-157 141 38 73 143 36 157-141z' },
  { id: 'Right lower wing', type: 'path', d: 'M380 294c120 0 194 68 157 141-38 73-143 36-157-141z' },
  { id: 'Left wing dot', type: 'circle', cx: 185, cy: 220, r: 27 },
  { id: 'Right wing dot', type: 'circle', cx: 519, cy: 220, r: 27 },
  { id: 'lines', type: 'path', d: 'M340 139c-52-64-94-78-126-42M365 139c52-64 94-78 126-42M352 170v244M192 358c38-20 72-24 100-12M512 358c-38-20-72-24-100-12', isDetail: true }
];

const COZY_HOUSE_REGIONS = [
  { id: 'bg', type: 'rect', x: 0, y: 0, width: 700, height: 520, rx: 18 },
  { id: 'Roof', type: 'path', d: 'M105 263l250-179 250 179z' },
  { id: 'House wall', type: 'rect', x: 169, y: 263, width: 372, height: 184, rx: 8 },
  { id: 'Door', type: 'rect', x: 318, y: 331, width: 75, height: 116, rx: 8 },
  { id: 'Left window', type: 'rect', x: 215, y: 310, width: 72, height: 62, rx: 8 },
  { id: 'Right window', type: 'rect', x: 424, y: 310, width: 72, height: 62, rx: 8 },
  { id: 'Chimney', type: 'rect', x: 460, y: 115, width: 57, height: 92, rx: 8 },
  { id: 'Tree top', type: 'circle', cx: 108, cy: 333, r: 55 },
  { id: 'Tree trunk', type: 'rect', x: 88, y: 376, width: 40, height: 71, rx: 8 },
  { id: 'Path', type: 'path', d: 'M333 447h45l58 50H276z' },
  { id: 'lines', type: 'path', d: 'M251 310v62M215 341h72M460 310v62M424 341h72M356 331v116M378 391h3', isDetail: true }
];

const COLORING_IMAGES = [
  { id: 'Flower', regions: FLOWER_REGIONS },
  { id: 'House', regions: HOUSE_REGIONS },
  { id: 'Butterfly', regions: BUTTERFLY_REGIONS },
  { id: 'Tree', regions: TREE_REGIONS },
  { id: 'Watermelon', regions: WATERMELON_REGIONS },
  { id: 'Mountain', regions: MOUNTAIN_REGIONS },
  { id: 'Balloon', regions: BALLOON_REGIONS },
  { id: 'Moon Rocket', regions: MOON_ROCKET_REGIONS, viewBox: "0 0 700 520" },
  { id: 'Happy Fish', regions: HAPPY_FISH_REGIONS, viewBox: "0 0 700 520" },
  { id: 'Garden Flower', regions: GARDEN_FLOWER_REGIONS, viewBox: "0 0 700 520" },
  { id: 'Friendly Robot', regions: FRIENDLY_ROBOT_REGIONS, viewBox: "0 0 700 520" },
  { id: 'Bright Butterfly', regions: BRIGHT_BUTTERFLY_REGIONS, viewBox: "0 0 700 520" },
  { id: 'Cozy House', regions: COZY_HOUSE_REGIONS, viewBox: "0 0 700 520" },
];

let globalColoringIndex = Math.floor(Math.random() * COLORING_IMAGES.length);

function ColoringBook({ onBack, onXP }) {
  const [selected, setSelected] = useState('#3B82F6');
  const [rewardGranted, setRewardGranted] = useState(false);
  const [showXPPulse, setShowXPPulse] = useState(false);
  
  // Sequentially pick the next image, guaranteeing no two opens yield the same image
  const [currentImage] = useState(() => COLORING_IMAGES[globalColoringIndex % COLORING_IMAGES.length]);

  // Increment tracking index only once after successful mount to avoid React StrictMode issues
  useEffect(() => {
    globalColoringIndex++;
  }, []);

  const [colors, setColors] = useState(() => {
    const m = {};
    currentImage.regions.forEach(r => { m[r.id] = '#FFFFFF'; });
    return m;
  });

  const paint = (id) => {
    setColors(c => ({ ...c, [id]: selected }));
  };

  const reset = () => {
    const m = {};
    currentImage.regions.forEach(r => { m[r.id] = '#FFFFFF'; });
    setColors(m);
    setRewardGranted(false);
  };

  const handleFinish = () => {
    if (!rewardGranted && onXP) {
      onXP(50);
      setRewardGranted(true);
      setShowXPPulse(true);
      setTimeout(() => setShowXPPulse(false), 2000);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto relative">
      {showXPPulse && (
        <>
          <style>{`
            @keyframes floatUpFade {
              0% { transform: translate(-50%, 0); opacity: 0; scale: 0.5; }
              20% { transform: translate(-50%, -50%); opacity: 1; scale: 1.2; }
              80% { transform: translate(-50%, -80%); opacity: 1; scale: 1; }
              100% { transform: translate(-50%, -100%); opacity: 0; scale: 0.8; }
            }
          `}</style>
          <div className="absolute top-1/2 left-1/2 pointer-events-none z-50 flex flex-col items-center"
               style={{ animation: 'floatUpFade 2s ease-out forwards' }}>
            <div className="text-5xl mb-2 drop-shadow-lg">✨</div>
            <div className="px-6 py-3 bg-gradient-to-r from-emerald-400 to-teal-500 text-white font-black text-2xl rounded-full shadow-2xl border-4 border-white/50 backdrop-blur-md">
              +50 XP
            </div>
          </div>
        </>
      )}

      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <div>
          <h2 className="text-2xl font-serif font-black text-[#0D1B2A]">Coloring Book</h2>
          <p className="text-xs font-black uppercase tracking-widest text-[#0D1B2A]/40">Pick a color · Click to paint</p>
        </div>
        <div className="flex gap-2">
          {!rewardGranted && (
             <button onClick={handleFinish} className="px-4 py-2 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-100 shadow-sm transition-all cursor-pointer">
               Finish (+50 XP) ✨
             </button>
          )}
          <button onClick={reset} className="px-4 py-2 bg-white border border-gray-100 text-[#0D1B2A] rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-50 shadow-sm transition-all cursor-pointer">
            Reset 🎨
          </button>
          <button onClick={onBack} className="px-4 py-2 bg-[#0D1B2A] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black shadow-sm transition-all cursor-pointer">
            ← Back
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start justify-center w-full">
        {/* SVG Canvas */}
        <div className="bg-white rounded-[32px] shadow-xl border border-gray-100 p-4 shrink-0 flex items-center justify-center">
          <svg viewBox={currentImage.viewBox || "0 0 300 340"} style={{ display: 'block', width: '260px', height: '295px' }}>
            {currentImage.regions.map(r => {
              if (r.isDetail) {
                return <path key={r.id} d={r.d} fill="none" stroke="#1F2937" strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" style={{ pointerEvents: 'none' }} />;
              }
              const commonProps = {
                key: r.id,
                fill: r.isSolidDetail ? '#1F2937' : colors[r.id],
                stroke: r.isSolidDetail ? 'none' : '#1F2937',
                strokeWidth: r.strokeWidth || 2,
                strokeLinejoin: 'round',
                onClick: r.isSolidDetail ? undefined : () => paint(r.id),
                style: { cursor: r.isSolidDetail ? 'default' : 'pointer', transition: 'fill 0.15s ease' }
              };
              if (r.type === 'circle') return <circle cx={r.cx} cy={r.cy} r={r.r} {...commonProps} />;
              if (r.type === 'rect') return <rect x={r.x} y={r.y} rx={r.rx} width={r.width} height={r.height} {...commonProps} />;
              if (r.type === 'ellipse') return <ellipse cx={r.cx} cy={r.cy} rx={r.rx} ry={r.ry} transform={r.transform} {...commonProps} />;
              return <path d={r.d} {...commonProps} />;
            })}
          </svg>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-4">
          {/* Current color */}
          <div className="bg-white/60 backdrop-blur-xl border border-white rounded-2xl p-4 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl border-2 border-[#0D1B2A] shadow-inner" style={{ backgroundColor: selected }} />
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-[#0D1B2A]/40">Selected</div>
              <div className="text-sm font-black text-[#0D1B2A]">{selected}</div>
            </div>
          </div>

          {/* Palette */}
          <div className="bg-white/60 backdrop-blur-xl border border-white rounded-2xl p-4 shadow-sm">
            <div className="text-[10px] font-black uppercase tracking-widest text-[#0D1B2A]/40 mb-3">Color Palette</div>
            <div className="grid grid-cols-4 gap-2">
              {PALETTE.map(c => (
                <button
                  key={c}
                  onClick={() => setSelected(c)}
                  title={c}
                  className={`w-9 h-9 rounded-xl transition-all cursor-pointer border-2 ${
                    selected === c ? 'scale-110 border-[#0D1B2A] shadow-md' : 'border-gray-100 hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Tip */}
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-3 text-xs font-semibold text-amber-700">
            💡 Click any region on the flower to paint it with your selected color.
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   GAME 3 — TOSS THE PAPER
═══════════════════════════════════════════════════════════ */
function TossThePaper({ onBack, onXP }) {
  const [state, setState] = useState('idle'); // idle | tossing | hit | miss
  const [score, setScore] = useState({ hits: 0, total: 0 });
  const [streak, setStreak] = useState(0);
  const [windForce, setWindForce] = useState(0);
  const [dragVector, setDragVector] = useState(null);
  const [xpPops, setXpPops] = useState([]);
  const xpPopId = useRef(0);

  const spawnXPPop = () => {
    const id = xpPopId.current++;
    setXpPops(prev => [...prev, { id }]);
    setTimeout(() => setXpPops(prev => prev.filter(p => p.id !== id)), 1400);
  };

  const containerRef = useRef(null);
  const paperRef = useRef(null);
  const reqRef = useRef(null);

  const physics = useRef({
    isDragging: false,
    isFlying: false,
    startX: 0,
    startY: 0,
    paperX: 40,
    paperY: 56, // starting 56px from bottom
    velX: 0,
    velY: 0,
    rot: 0,
    gravity: 0.6,
    wind: 0
  });

  const accuracy = score.total > 0 ? Math.round((score.hits / score.total) * 100) : 0;

  const generateWind = () => {
    const w = (Math.random() - 0.5) * 2;
    physics.current.wind = w;
    setWindForce(w);
  };

  useEffect(() => {
    generateWind();
    return () => cancelAnimationFrame(reqRef.current);
  }, []);

  const resetPaper = () => {
    physics.current.isFlying = false;
    physics.current.velX = 0;
    physics.current.velY = 0;
    physics.current.paperX = 40;
    physics.current.paperY = 56;
    physics.current.rot = 0;
    setState('idle');
    setDragVector(null);
    if (paperRef.current) {
      paperRef.current.style.transition = 'transform 0.3s ease';
      paperRef.current.style.transform = `translate(40px, -56px) rotate(0deg)`;
      setTimeout(() => {
        if (paperRef.current) paperRef.current.style.transition = 'none';
      }, 300);
    }
    generateWind();
  };

  const handlePointerDown = (e) => {
    if (physics.current.isFlying || state !== 'idle') return;
    physics.current.isDragging = true;
    physics.current.startX = e.clientX;
    physics.current.startY = e.clientY;
    setDragVector({ dx: 0, dy: 0 });
    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
  };

  const handlePointerMove = (e) => {
    if (!physics.current.isDragging) return;
    const dx = e.clientX - physics.current.startX;
    const dy = e.clientY - physics.current.startY;
    
    let rawDx = dx;
    let rawDy = dy;
    const dist = Math.sqrt(rawDx*rawDx + rawDy*rawDy);
    if (dist > 120) {
      rawDx = (rawDx / dist) * 120;
      rawDy = (rawDy / dist) * 120;
    }

    if (paperRef.current) {
       paperRef.current.style.transform = `translate(${40 + rawDx * 0.3}px, ${-56 + rawDy * 0.3}px) rotate(0deg)`;
    }
    setDragVector({ dx, dy });
  };

  const handlePointerUp = (e) => {
    if (!physics.current.isDragging) return;
    physics.current.isDragging = false;
    document.removeEventListener('pointermove', handlePointerMove);
    document.removeEventListener('pointerup', handlePointerUp);

    const dx = e.clientX - physics.current.startX;
    const dy = e.clientY - physics.current.startY;
    
    setDragVector(null);

    if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
      let rawDx = dx;
      let rawDy = dy;
      const dist = Math.sqrt(rawDx*rawDx + rawDy*rawDy);
      if (dist > 120) {
         rawDx = (rawDx / dist) * 120;
         rawDy = (rawDy / dist) * 120;
      }
      physics.current.velX = -rawDx * 0.28;
      physics.current.velY = -rawDy * 0.32;
      physics.current.paperX = 40 + rawDx * 0.3;
      physics.current.paperY = 56 - rawDy * 0.3;
      
      physics.current.isFlying = true;
      setState('tossing');
      reqRef.current = requestAnimationFrame(animatePaper);
    } else {
      resetPaper();
    }
  };

  const animatePaper = () => {
    if (!physics.current.isFlying || !containerRef.current || !paperRef.current) return;

    const contWidth = containerRef.current.offsetWidth;

    physics.current.velY -= physics.current.gravity;
    physics.current.velX += physics.current.wind * 0.08;

    physics.current.paperX += physics.current.velX;
    physics.current.paperY += physics.current.velY;
    physics.current.rot += physics.current.velX * 3;

    paperRef.current.style.transform = `translate(${physics.current.paperX}px, -${physics.current.paperY}px) rotate(${physics.current.rot}deg)`;

    const px = physics.current.paperX;
    const py = physics.current.paperY;

    // Check hit logic while falling
    if (physics.current.velY < 0 && py < 90 && py > 15 && px > contWidth - 140 && px < contWidth) {
      setScore(s => ({ hits: s.hits + 1, total: s.total + 1 }));
      setStreak(s => s + 1);
      setState('hit');
      if (onXP) onXP(10);
      spawnXPPop();
      setTimeout(resetPaper, 1400);
      return;
    }

    // Miss check
    if (py < -30 || px > contWidth || px < -50) {
      setScore(s => ({ ...s, total: s.total + 1 }));
      setStreak(0);
      setState('miss');
      setTimeout(resetPaper, 1400);
      return;
    }

    reqRef.current = requestAnimationFrame(animatePaper);
  };

  const renderTrajectory = () => {
    if (!dragVector || state !== 'idle') return null;
    let rawDx = dragVector.dx;
    let rawDy = dragVector.dy;
    const dist = Math.sqrt(rawDx*rawDx + rawDy*rawDy);
    if (dist > 120) {
      rawDx = (rawDx / dist) * 120;
      rawDy = (rawDy / dist) * 120;
    }

    const vx0 = -rawDx * 0.28;
    const vy0 = -rawDy * 0.32;
    const points = [];
    let px = 40 + rawDx * 0.3;
    let py = 56 - rawDy * 0.3;
    let vx = vx0;
    let vy = vy0;

    for (let i = 0; i < 70; i++) {
       if (i % 6 === 0 && i > 0) {
           points.push({ x: px, y: py, step: i });
       }
       vy -= physics.current.gravity;
       vx += windForce * 0.08;
       px += vx;
       py += vy;
       if (py < 0) break;
    }

    return (
      <div className="absolute inset-0 pointer-events-none z-[5]">
        {points.map((p, i) => (
           <div
             key={i}
             className="absolute bg-white/70 rounded-full shadow-sm blur-[0.5px]"
             style={{
                width: `${Math.max(3, 10 - i * 0.4)}px`,
                height: `${Math.max(3, 10 - i * 0.4)}px`,
                left: p.x + 24, // adjust to center of newspaper (~48px wide)
                bottom: p.y + 24
             }}
           />
        ))}
      </div>
    );
  };

  const reset = () => { setScore({ hits: 0, total: 0 }); setStreak(0); resetPaper(); };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto relative">
      {/* XP pop styles */}
      <style>{`
        @keyframes tossXPFloat {
          0%   { transform: translate(-50%, 0);    opacity: 0; scale: 0.5; }
          20%  { transform: translate(-50%, -30px); opacity: 1; scale: 1.3; }
          75%  { transform: translate(-50%, -80px); opacity: 1; scale: 1; }
          100% { transform: translate(-50%, -120px);opacity: 0; scale: 0.8; }
        }
        .toss-xp-float { animation: tossXPFloat 1.4s ease-out forwards; }
      `}</style>
      {xpPops.map(p => (
        <div key={p.id} className="toss-xp-float absolute top-[42%] left-[75%] pointer-events-none z-50">
          <div className="px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-black text-lg rounded-full shadow-2xl border-2 border-white/50 whitespace-nowrap">
            🎯 +10 XP
          </div>
        </div>
      ))}

      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <div>
          <h2 className="text-2xl font-serif font-black text-[#0D1B2A]">Toss the Paper</h2>
          <p className="text-xs font-black uppercase tracking-widest text-[#0D1B2A]/40">
            {score.hits}/{score.total} shots · {accuracy}% accuracy
            {streak >= 3 && <span className="text-orange-500 ml-2">🔥 {streak} streak!</span>}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={reset} className="px-4 py-2 bg-white border border-gray-100 text-[#0D1B2A] rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-50 shadow-sm transition-all cursor-pointer">
            Reset
          </button>
          <button onClick={onBack} className="px-4 py-2 bg-[#0D1B2A] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black shadow-sm transition-all cursor-pointer">
            ← Back
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3 w-full">
        {[
          { label: 'Shots', value: score.total, icon: '🗞️' },
          { label: 'Hits', value: score.hits, icon: '🎯' },
          { label: 'Accuracy', value: `${accuracy}%`, icon: '📊' },
        ].map((s, i) => (
          <div key={i} className="bg-white/60 backdrop-blur-xl border border-white rounded-2xl p-4 text-center shadow-sm">
            <div className="text-xl mb-1">{s.icon}</div>
            <div className="text-xl font-black text-[#0D1B2A]">{s.value}</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-[#0D1B2A]/40">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Arena */}
      <div 
        ref={containerRef}
        className="relative w-full h-72 bg-gradient-to-b from-indigo-950 to-slate-900 rounded-[32px] border border-slate-700/50 shadow-2xl overflow-hidden select-none"
      >
        {/* Dynamic Visual Wind Lines */}
        {Math.abs(windForce) > 0.5 && (
           <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20 z-0">
             <style>{`
               @keyframes windRight { 0% { transform: translateX(-100%); } 100% { transform: translateX(200%); } }
               @keyframes windLeft  { 0% { transform: translateX(200%); } 100% { transform: translateX(-100%); } }
             `}</style>
             {[...Array(6)].map((_, i) => (
                <div 
                  key={i} 
                  className="absolute h-[1.5px] bg-sky-200 rounded-full"
                  style={{
                    width: `${Math.random() * 40 + 20}%`,
                    top: `${Math.random() * 60 + 5}%`,
                    animation: `${windForce > 0 ? 'windRight' : 'windLeft'} ${(3 / Math.abs(windForce)) + Math.random()}s linear infinite`,
                    animationDelay: `-${Math.random() * 4}s`
                  }}
                />
             ))}
           </div>
        )}

        {/* Wind Indicator */}
        {Math.abs(windForce) > 0.5 && (
          <div className="absolute top-8 left-1/2 -translate-x-1/2 text-2xl animate-pulse text-white/30 font-black flex items-center gap-2">
            💨 <span className="text-sm">{(windForce > 0) ? '➡️' : '⬅️'}</span>
          </div>
        )}

        {/* Room details border */}
        <div className="absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-r from-slate-800 to-slate-900 border-t border-slate-700/80 rounded-b-[32px]" />
        <div className="absolute bottom-12 left-0 right-0 h-px bg-white/5" />

        {/* Desk */}
        <div className="absolute bottom-8 left-0 w-36 h-6 bg-zinc-800 rounded-r-2xl border border-zinc-700 shadow-lg z-10" />

        {/* Trajectory */}
        {renderTrajectory()}

        {/* Paper ball */}
        <div
          ref={paperRef}
          onPointerDown={handlePointerDown}
          className="absolute bottom-0 left-0 text-4xl select-none cursor-grab active:cursor-grabbing z-10 origin-center"
          style={{ transform: 'translate(40px, -56px) rotate(0deg)', touchAction: 'none' }}
        >
          🗞️
        </div>

        {/* Bin */}
        <div className="absolute right-10 bottom-8 text-6xl select-none pointer-events-none">🗑️</div>

        {/* Result overlay */}
        {(state === 'hit' || state === 'miss') && (
          <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
            <div className={`px-8 py-4 rounded-2xl font-black text-2xl shadow-2xl border ${
              state === 'hit'
                ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                : 'bg-red-50 border-red-100 text-red-500'
            }`}>
              {state === 'hit' ? '🎯 Swish!' : '😅 Miss!'}
            </div>
          </div>
        )}
      </div>

      {/* Instructions Overlay */}
      <div className="w-full bg-indigo-50/80 backdrop-blur-md border border-indigo-100 rounded-2xl p-4 text-center">
        <p className="text-sm font-black text-indigo-700 uppercase tracking-widest">
          👉 Swipe the paper to toss it!
        </p>
        <p className="text-xs text-indigo-500/80 mt-1 font-semibold">
          Watch out for the wind direction! Faster swipes throw it further.
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   GAME SELECTION SCREEN
═══════════════════════════════════════════════════════════ */
const GAME_CARDS = [
  {
    id: 'bubble',
    title: 'Bubble Wrap',
    desc: 'Pop every bubble on the sheet. Satisfying, simple, stress-melting.',
    emoji: '🫧',
    accent: 'from-indigo-400 to-violet-500',
    tag: 'Satisfying',
  },
  {
    id: 'coloring',
    title: 'Coloring Book',
    desc: 'Paint a beautiful flower with your choice of colors. Calm your mind.',
    emoji: '🎨',
    accent: 'from-pink-400 to-rose-500',
    tag: 'Relaxing',
  },
  {
    id: 'toss',
    title: 'Toss the Paper',
    desc: 'Crumple it up and sink the shot. Adjust power and angle to win.',
    emoji: '🗞️',
    accent: 'from-amber-400 to-orange-500',
    tag: 'Fun',
  },
];

export default function Games({ user, addXP }) {
  const [activeGame, setActiveGame] = useState(null);
  const firstName = user?.fullName?.split(' ')[0] || 'Friend';

  if (activeGame === 'bubble') return <div className="max-w-3xl mx-auto pb-16"><BubbleWrap onBack={() => setActiveGame(null)} onXP={addXP} /></div>;
  if (activeGame === 'coloring') return <div className="max-w-3xl mx-auto pb-16"><ColoringBook onBack={() => setActiveGame(null)} onXP={addXP} /></div>;
  if (activeGame === 'toss') return <div className="max-w-3xl mx-auto pb-16"><TossThePaper onBack={() => setActiveGame(null)} onXP={addXP} /></div>;

  return (
    <div className="max-w-3xl mx-auto pb-16">
      {/* Header */}
      <header className="mb-10">
        <h1 className="text-4xl font-serif font-black tracking-tight mb-1">Games</h1>
        <p className="text-xs font-black uppercase tracking-widest text-[#0D1B2A]/40">
          Stress-relief mini games just for you, {firstName}
        </p>
      </header>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {GAME_CARDS.map(g => (
          <button
            key={g.id}
            onClick={() => setActiveGame(g.id)}
            className="bg-white/60 backdrop-blur-xl border border-white rounded-[32px] overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 text-left group cursor-pointer"
          >
            {/* Colour bar top */}
            <div className={`h-28 bg-gradient-to-br ${g.accent} flex items-center justify-center relative overflow-hidden`}>
              <div className="absolute inset-0 opacity-20"
                style={{ backgroundImage: 'radial-gradient(circle at 30% 30%, white 0%, transparent 60%)' }} />
              <span className="text-6xl drop-shadow-lg group-hover:scale-110 transition-transform duration-300 select-none">
                {g.emoji}
              </span>
              <span className="absolute top-3 right-3 px-2 py-1 bg-white/20 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-widest text-white">
                {g.tag}
              </span>
            </div>

            {/* Card body */}
            <div className="p-6">
              <h3 className="text-lg font-serif font-black text-[#0D1B2A] mb-2">{g.title}</h3>
              <p className="text-sm font-medium text-[#0D1B2A]/50 leading-relaxed mb-5">{g.desc}</p>
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#0D1B2A]/60 group-hover:text-[#0D1B2A] transition-colors">
                <FiIcons.FiPlay size={13} /> Play now
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Tip */}
      <div className="mt-8 flex items-start gap-3 px-5 py-4 bg-blue-50 border border-blue-100 rounded-2xl">
        <span className="text-xl">💙</span>
        <p className="text-sm font-semibold text-blue-700 leading-snug">
          Take a short break and play — even 5 minutes of mindful play can lower cortisol levels and improve your mood.
        </p>
      </div>
    </div>
  );
}
