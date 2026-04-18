import React, { useState, useRef, useEffect, useCallback } from 'react';

/* ─────────────────────────────────────────────
   Premium Organic Ambient Sound Engine 
   Using Granular, Multi-layered, and Stereo-Panned Synthesis.
───────────────────────────────────────────── */

function makeBrownNoiseBuffer(ctx, secs = 5) {
  const len = ctx.sampleRate * secs;
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  let lastOut = 0;
  for (let i = 0; i < len; i++) {
    const white = Math.random() * 2 - 1;
    data[i] = (lastOut + (0.02 * white)) / 1.02;
    lastOut = data[i];
    data[i] *= 4.0;
  }
  return buf;
}

function makePinkNoiseBuffer(ctx, secs = 5) {
  const len = ctx.sampleRate * secs;
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  let b0, b1, b2, b3, b4, b5, b6;
  b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
  for (let i = 0; i < len; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.96900 * b2 + white * 0.1538520;
    b3 = 0.86650 * b3 + white * 0.3104856;
    b4 = 0.55000 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.0168980;
    data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
    data[i] *= 0.15;
    b6 = white * 0.115926;
  }
  return buf;
}

/* ─────────────────────────────────────────────
   Premium Synthesis Functions
───────────────────────────────────────────── */

/** 
 * High-Fidelity Rain: 
 * - Stereo Panning
 * - Triple-Layer (Wash, Patter, Pings)
 * - Gust modulation
 */
function createRain(ctx, out) {
  const timers = [];
  const masterGain = ctx.createGain();
  masterGain.gain.value = 1.0;
  masterGain.connect(out);

  // 1. Layer: Background Wash (Centered Brown Noise)
  const wash = ctx.createBufferSource();
  wash.buffer = makeBrownNoiseBuffer(ctx, 10);
  wash.loop = true;
  const washFilter = ctx.createBiquadFilter();
  washFilter.frequency.value = 220;
  const washGain = ctx.createGain();
  washGain.gain.value = 0.6;
  wash.connect(washFilter); washFilter.connect(washGain); washGain.connect(masterGain);
  wash.start();

  // 2. Layer: Distant Patter (Pink Noise Grains, panned)
  const scheduleGrain = () => {
    const panner = ctx.createStereoPanner();
    panner.pan.value = (Math.random() * 2 - 1) * 0.8; // Wide stereo field
    
    const grainG = ctx.createGain();
    const duration = 0.05 + Math.random() * 0.15;
    grainG.gain.setValueAtTime(0, ctx.currentTime);
    grainG.gain.linearRampToValueAtTime(0.005 + Math.random() * 0.01, ctx.currentTime + duration * 0.2);
    grainG.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 800 + Math.random() * 1500;
    filter.Q.value = 0.5;

    const noise = ctx.createBufferSource();
    noise.buffer = makePinkNoiseBuffer(ctx, 0.5);
    noise.connect(filter); filter.connect(grainG); grainG.connect(panner); panner.connect(masterGain);
    
    noise.start();
    const next = 40 + Math.random() * 100;
    timers.push(setTimeout(scheduleGrain, next));
  };

  // 3. Layer: Close Patter (Tonal Taps, panned)
  const scheduleDrop = () => {
    const panner = ctx.createStereoPanner();
    panner.pan.value = (Math.random() * 2 - 1) * 0.95; // Full width

    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    const freq = 1500 + Math.random() * 3000;
    
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.8, ctx.currentTime + 0.02);
    
    g.gain.setValueAtTime(0, ctx.currentTime);
    g.gain.linearRampToValueAtTime(0.012 + Math.random() * 0.02, ctx.currentTime + 0.002);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.03);

    osc.connect(g); g.connect(panner); panner.connect(masterGain);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);

    const next = Math.random() > 0.9 ? (200 + Math.random() * 500) : (15 + Math.random() * 120);
    timers.push(setTimeout(scheduleDrop, next));
  };

  scheduleGrain();
  scheduleDrop();

  return () => {
    timers.forEach(t => clearTimeout(t));
    try { wash.stop(); } catch (_) {}
  };
}

function createOcean(ctx, out) {
  const src = ctx.createBufferSource();
  src.buffer = makeBrownNoiseBuffer(ctx, 10);
  src.loop = true;
  const lpf = ctx.createBiquadFilter();
  lpf.frequency.value = 180;
  const surge = ctx.createGain();
  surge.gain.value = 0.5;
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.06;
  const lfoG = ctx.createGain();
  lfoG.gain.value = 0.5;
  lfo.connect(lfoG); lfoG.connect(surge.gain);
  lfo.start();
  src.connect(lpf); lpf.connect(surge); surge.connect(out);
  src.start();
  return () => { try { src.stop(); lfo.stop(); } catch (_) {} };
}

function createForest(ctx, out) {
  const timers = [];
  const wind = ctx.createBufferSource();
  wind.buffer = makePinkNoiseBuffer(ctx, 6);
  wind.loop = true;
  const lpf = ctx.createBiquadFilter();
  lpf.frequency.value = 400;
  wind.connect(lpf); lpf.connect(out);
  wind.start();

  const scheduleEvent = () => {
    const isChirp = Math.random() > 0.5;
    if (isChirp) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      const panner = ctx.createStereoPanner();
      panner.pan.value = Math.random() * 2 - 1;
      const startFreq = 2500 + Math.random() * 1500;
      osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(startFreq + 500, ctx.currentTime + 0.1);
      g.gain.setValueAtTime(0, ctx.currentTime);
      g.gain.linearRampToValueAtTime(0.005, ctx.currentTime + 0.05);
      g.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15);
      osc.connect(g); g.connect(panner); panner.connect(out);
      osc.start(); osc.stop(ctx.currentTime + 0.2);
    } else {
      const noise = ctx.createBufferSource();
      noise.buffer = makePinkNoiseBuffer(ctx, 0.2);
      const bpf = ctx.createBiquadFilter();
      bpf.type = 'bandpass'; bpf.frequency.value = 3000;
      const g = ctx.createGain();
      const panner = ctx.createStereoPanner();
      panner.pan.value = Math.random() * 2 - 1;
      g.gain.setValueAtTime(0, ctx.currentTime);
      g.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.05);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.2);
      noise.connect(bpf); bpf.connect(g); g.connect(panner); panner.connect(out);
      noise.start();
    }
    timers.push(setTimeout(scheduleEvent, 3000 + Math.random() * 7000));
  };
  scheduleEvent();
  return () => {
    timers.forEach(t => clearTimeout(t));
    try { wind.stop(); } catch (_) {}
  };
}

function createLofi(ctx, out) {
  const timers = [];
  const stopFns = [];
  const notes = [130.81, 164.81, 196.00, 246.94];
  notes.forEach(f => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    const lpf = ctx.createBiquadFilter();
    lpf.frequency.value = 350;
    osc.frequency.value = f;
    g.gain.value = 0.04;
    osc.connect(lpf); lpf.connect(g); g.connect(out);
    osc.start();
    stopFns.push(() => osc.stop());
  });

  const scheduleCrackle = () => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    const panner = ctx.createStereoPanner();
    panner.pan.value = Math.random() * 2 - 1;
    osc.type = 'square';
    osc.frequency.value = 50 + Math.random() * 100;
    g.gain.setValueAtTime(0.002, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.003);
    osc.connect(g); g.connect(panner); panner.connect(out);
    osc.start(); osc.stop(ctx.currentTime + 0.01);
    timers.push(setTimeout(scheduleCrackle, Math.random() * 500));
  };
  scheduleCrackle();
  return () => {
    timers.forEach(t => clearTimeout(t));
    stopFns.forEach(f => f());
  };
}

const SOUNDS = [
  { id: 'rain',   label: 'Rain',   emoji: '🌧️', fn: createRain },
  { id: 'ocean',  label: 'Ocean',  emoji: '🌊', fn: createOcean },
  { id: 'forest', label: 'Forest', emoji: '🌿', fn: createForest },
  { id: 'lofi',   label: 'Lo-fi',  emoji: '🎵', fn: createLofi },
];

export default function AmbientPlayer() {
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [activeSound, setActiveSound] = useState(() => localStorage.getItem('ambientSound') || 'rain');
  const [volume, setVolume] = useState(() => parseFloat(localStorage.getItem('ambientVolume') || '0.7'));

  const ctxRef = useRef(null);
  const masterRef = useRef(null);
  const stopRef = useRef(null);
  const panelRef = useRef(null);

  const initAudio = () => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      masterRef.current = ctxRef.current.createGain();
      masterRef.current.gain.setValueAtTime(0, ctxRef.current.currentTime);
      masterRef.current.connect(ctxRef.current.destination);
    }
    return ctxRef.current;
  };

  const stopCurrent = () => {
    if (stopRef.current) {
      stopRef.current();
      stopRef.current = null;
    }
  };

  const fadeOutAndSwitch = useCallback(async (newSoundId) => {
    const ctx = initAudio();
    if (ctx.state === 'suspended') await ctx.resume();
    masterRef.current.gain.setTargetAtTime(0, ctx.currentTime, 0.4);
    await new Promise(r => setTimeout(r, 600));
    stopCurrent();
    if (newSoundId) {
      const sound = SOUNDS.find(s => s.id === newSoundId);
      if (sound) stopRef.current = sound.fn(ctx, masterRef.current);
      masterRef.current.gain.setTargetAtTime(volume, ctx.currentTime, 0.6);
    }
  }, [volume]);

  const togglePlay = async () => {
    if (playing) {
      const ctx = ctxRef.current;
      masterRef.current.gain.setTargetAtTime(0, ctx.currentTime, 0.4);
      setPlaying(false);
      setTimeout(() => stopCurrent(), 800);
    } else {
      setPlaying(true);
      await fadeOutAndSwitch(activeSound);
    }
  };

  const switchSound = async (id) => {
    setActiveSound(id);
    localStorage.setItem('ambientSound', id);
    if (playing) await fadeOutAndSwitch(id);
  };

  const handleVolume = (v) => {
    v = parseFloat(v);
    setVolume(v);
    localStorage.setItem('ambientVolume', String(v));
    if (masterRef.current && playing) {
      masterRef.current.gain.setTargetAtTime(v, ctxRef.current.currentTime, 0.1);
    }
  };

  useEffect(() => {
    if (!open) return;
    const close = (e) => { if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  useEffect(() => () => stopCurrent(), []);

  const currentLabel = SOUNDS.find(s => s.id === activeSound)?.label || 'Rain';

  return (
    <div ref={panelRef} className="relative w-full">
      <style>{`
        @keyframes pulseAmber {
          0%, 100% { color: #F5A623; transform: scale(1); filter: drop-shadow(0 0 0px #F5A623); }
          50% { color: #FFD93D; transform: scale(1.15); filter: drop-shadow(0 0 8px rgba(245,166,35,0.6)); }
        }
        .pulse-icon { animation: pulseAmber 2s ease-in-out infinite; }
      `}</style>
      <div className="flex items-center w-full group">
        <button
          onClick={togglePlay}
          className={`flex-1 flex items-center gap-4 px-4 py-3 rounded-2xl font-bold transition-all duration-300 cursor-pointer ${
            playing
              ? 'bg-white shadow-[0_4px_20px_rgba(0,0,0,0.05)] text-[#0D1B2A]'
              : 'text-[#0D1B2A]/40 hover:text-[#0D1B2A] hover:bg-white/30'
          }`}
        >
          <span className={`text-xl flex items-center justify-center shrink-0 w-6 h-6 ${playing ? 'pulse-icon' : ''}`}>
             🎵
          </span>
          <span className="text-[15px] truncate text-left flex-1">
            {playing ? currentLabel : 'Ambience'}
          </span>
        </button>
        <button
          onClick={() => setOpen(!open)}
          className={`p-3 opacity-30 hover:opacity-100 transition-all cursor-pointer ${open ? 'opacity-100 rotate-90 text-[#F5A623]' : ''}`}
          title="Sound Settings"
        >
          ⚙️
        </button>
      </div>
      {open && (
        <div className="absolute left-full bottom-0 ml-4 w-64 bg-white/95 backdrop-blur-2xl border border-white shadow-2xl rounded-[32px] p-5 flex flex-col gap-4 z-[999]">
          <div className="text-[10px] font-black uppercase tracking-widest text-[#0D1B2A]/40">Soundscapes</div>
          <div className="grid grid-cols-2 gap-2">
            {SOUNDS.map(s => (
              <button
                key={s.id}
                onClick={() => switchSound(s.id)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-2xl font-black text-xs transition-all cursor-pointer border-2 ${
                  activeSound === s.id
                    ? 'bg-[#0D1B2A] text-white border-[#0D1B2A] shadow-md'
                    : 'bg-white text-[#0D1B2A]/60 border-transparent hover:border-[#0D1B2A]/10'
                }`}
              >
                <span>{s.emoji}</span>
                <span>{s.label}</span>
              </button>
            ))}
          </div>
          <div className="mt-2 text-left">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-[#0D1B2A]/40 mb-2">
              <span>Volume</span>
              <span>{Math.round(volume * 100)}%</span>
            </div>
            <input
              type="range" min="0" max="1" step="0.01" value={volume}
              onChange={(e) => handleVolume(e.target.value)}
              className="w-full h-1.5 rounded-full accent-[#0D1B2A] cursor-pointer"
            />
          </div>
          <button
            onClick={togglePlay}
            className={`w-full py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 ${
              playing
                ? 'bg-red-50 text-red-500 border-2 border-red-100'
                : 'bg-[#0D1B2A] text-white hover:bg-black shadow-lg'
            }`}
          >
            {playing ? '⏸ Stop Sounds' : '▶ Play Sounds'}
          </button>
        </div>
      )}
    </div>
  );
}
