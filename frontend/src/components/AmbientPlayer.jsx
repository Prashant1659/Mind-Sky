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

// 1. 432Hz Deep Earth (Ultra-Soothing Sub Bass Hum)
function create432Earth(ctx, out) {
  const master = ctx.createGain(); master.gain.value = 0.8; master.connect(out);
  const activeNodes = [];
  
  // Frequencies based on 432Hz geometry, but lowered to sub-bass for maximum warmth
  // 54Hz (Sub), 108Hz (Bass), 216Hz (Warmth), 432Hz (Whisper)
  const layers = [
    { freq: 54, gain: 0.5, pan: 0, swellSpeed: 0.03 },
    { freq: 108, gain: 0.3, pan: -0.5, swellSpeed: 0.04 },
    { freq: 108.5, gain: 0.3, pan: 0.5, swellSpeed: 0.05 }, // slight detune for wide stereo
    { freq: 216, gain: 0.1, pan: 0, swellSpeed: 0.02 },
    { freq: 432, gain: 0.02, pan: 0, swellSpeed: 0.01 } // Barely audible sparkle
  ];
  
  layers.forEach(l => {
    const osc = ctx.createOscillator();
    osc.type = 'sine'; // Sine is the smoothest waveform, zero harsh harmonics
    osc.frequency.value = l.freq;
    
    const vca = ctx.createGain();
    vca.gain.value = 0; // Controlled entirely by LFO
    
    // Extremely slow volume breathing
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = l.swellSpeed;
    
    const lfoScale = ctx.createGain();
    lfoScale.gain.value = l.gain; 
    
    lfo.connect(lfoScale); lfoScale.connect(vca.gain);
    
    // Gentle lowpass just to be safe
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 300; 
    
    const panner = ctx.createStereoPanner();
    panner.pan.value = l.pan;
    
    osc.connect(filter); filter.connect(vca); vca.connect(panner); panner.connect(master);
    
    osc.start(); lfo.start();
    activeNodes.push(osc, lfo);
  });

  return () => { activeNodes.forEach(n => { try { n.stop(); } catch(e){} }); };
}

// 2. 528Hz Miracle Flow (DNA Repair & Water)
function create528Flow(ctx, out) {
  const master = ctx.createGain(); master.gain.value = 0.5; master.connect(out);
  const activeNodes = []; const timers = [];
  
  // Ocean base
  const noise = ctx.createBufferSource(); noise.buffer = makeBrownNoiseBuffer(ctx, 10); noise.loop = true;
  const nFilter = ctx.createBiquadFilter(); nFilter.type = 'lowpass'; nFilter.frequency.value = 200;
  const nLfo = ctx.createOscillator(); nLfo.frequency.value = 0.05;
  const nLfoGain = ctx.createGain(); nLfoGain.gain.value = 100;
  const nVca = ctx.createGain(); nVca.gain.value = 0.3;
  nLfo.connect(nLfoGain); nLfoGain.connect(nFilter.frequency);
  noise.connect(nFilter); nFilter.connect(nVca); nVca.connect(master);
  noise.start(); nLfo.start(); activeNodes.push(noise, nLfo);

  // Soft 528Hz generative pings
  const scale = [132, 264, 396, 528, 660];
  const playPing = () => {
    const f = scale[Math.floor(Math.random()*scale.length)];
    const osc = ctx.createOscillator(); osc.type = 'sine'; osc.frequency.value = f;
    const vca = ctx.createGain(); vca.gain.setValueAtTime(0, ctx.currentTime);
    vca.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 3);
    vca.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 8);
    const pan = ctx.createStereoPanner(); pan.pan.value = (Math.random()*2)-1;
    osc.connect(vca); vca.connect(pan); pan.connect(master);
    osc.start(); osc.stop(ctx.currentTime + 9);
    timers.push(setTimeout(playPing, 2000 + Math.random()*4000));
  };
  playPing();

  return () => { timers.forEach(t=>clearTimeout(t)); activeNodes.forEach(n => { try { n.stop(); } catch(e){} }); };
}

// 3. 852Hz Ethereal (Crystal Drone + Gentle Melody)
function create852Ethereal(ctx, out) {
  const master = ctx.createGain(); master.gain.value = 0.5; master.connect(out);
  const activeNodes = [];
  const timers = [];
  
  // 1. Crystal Drone Base (Very soft, provides the ethereal foundation)
  const bowls = [
    { freq: 213, gain: 0.25, pan: 0, speed: 0.02 },
    { freq: 426, gain: 0.15, pan: -0.5, speed: 0.03 }
  ];
  
  bowls.forEach(bowl => {
    [0, 0.5].forEach(detune => {
      const osc = ctx.createOscillator(); osc.type = 'sine'; osc.frequency.value = bowl.freq + detune;
      const vca = ctx.createGain(); vca.gain.value = 0;
      const lfo = ctx.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = bowl.speed + (detune * 0.01);
      const lfoScale = ctx.createGain(); lfoScale.gain.value = bowl.gain;
      lfo.connect(lfoScale); lfoScale.connect(vca.gain);
      const panner = ctx.createStereoPanner(); panner.pan.value = bowl.pan;
      osc.connect(vca); vca.connect(panner); panner.connect(master);
      osc.start(); lfo.start();
      activeNodes.push(osc, lfo);
    });
  });

  // 2. Generative 852Hz Melody
  // Pentatonic scale based around 852Hz proportions
  const scale = [426, 479.25, 532.5, 639, 710, 852, 1065];
  
  const playNote = () => {
    const f = scale[Math.floor(Math.random() * scale.length)];
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = f;

    const vca = ctx.createGain();
    vca.gain.setValueAtTime(0, ctx.currentTime);
    // Super soft attack, incredibly long release to simulate reverb
    vca.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 3); 
    vca.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 10); 
    
    const panner = ctx.createStereoPanner();
    panner.pan.value = (Math.random() * 2) - 1; // Wide stereo ping
    
    osc.connect(vca);
    vca.connect(panner);
    panner.connect(master);
    
    osc.start();
    osc.stop(ctx.currentTime + 11);
    
    // Clear dead nodes to prevent memory leak
    setTimeout(() => { try { osc.disconnect(); } catch(e){} }, 12000);

    // Schedule next note slowly (rarely overlaps too much)
    const nextTime = 4000 + Math.random() * 5000; // 4 to 9 seconds between notes
    timers.push(setTimeout(playNote, nextTime));
  };

  playNote(); // Start melody loop

  return () => { 
    timers.forEach(t => clearTimeout(t)); 
    activeNodes.forEach(n => { try { n.stop(); } catch(e){} }); 
  };
}

// 4. 4Hz Delta Sleep (Deep Rest Binaural)
function createDeltaSleep(ctx, out) {
  const master = ctx.createGain(); master.gain.value = 0.6; master.connect(out);
  const activeNodes = [];

  // Carrier: 136.1Hz (Om). Delta: 4Hz
  const oscL = ctx.createOscillator(); oscL.type = 'triangle'; oscL.frequency.value = 134.1;
  const oscR = ctx.createOscillator(); oscR.type = 'triangle'; oscR.frequency.value = 138.1;
  const filterL = ctx.createBiquadFilter(); filterL.type = 'lowpass'; filterL.frequency.value = 160;
  const filterR = ctx.createBiquadFilter(); filterR.type = 'lowpass'; filterR.frequency.value = 160;
  const panL = ctx.createStereoPanner(); panL.pan.value = -1;
  const panR = ctx.createStereoPanner(); panR.pan.value = 1;
  
  oscL.connect(filterL); filterL.connect(panL); panL.connect(master);
  oscR.connect(filterR); filterR.connect(panR); panR.connect(master);
  oscL.start(); oscR.start(); activeNodes.push(oscL, oscR);

  // Deep rumble
  const noise = ctx.createBufferSource(); noise.buffer = makeBrownNoiseBuffer(ctx, 10); noise.loop = true;
  const nFilter = ctx.createBiquadFilter(); nFilter.type = 'lowpass'; nFilter.frequency.value = 80;
  const nVca = ctx.createGain(); nVca.gain.value = 0.5;
  noise.connect(nFilter); nFilter.connect(nVca); nVca.connect(master);
  noise.start(); activeNodes.push(noise);

  return () => { activeNodes.forEach(n => { try { n.stop(); } catch(e){} }); };
}

const SOUNDS = [
  { id: 'earth432',  label: '432Hz Earth',    emoji: '🌲', fn: create432Earth },
  { id: 'flow528',   label: '528Hz Flow',     emoji: '💧', fn: create528Flow },
  { id: 'ether852',  label: '852Hz Ethereal', emoji: '✨', fn: create852Ethereal },
  { id: 'delta4',    label: '4Hz Delta',      emoji: '🌌', fn: createDeltaSleep },
];

export default function AmbientPlayer() {
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [activeSound, setActiveSound] = useState(() => {
    const saved = localStorage.getItem('ambientSound');
    return SOUNDS.some(s => s.id === saved) ? saved : 'earth432';
  });
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

  const currentLabel = SOUNDS.find(s => s.id === activeSound)?.label || '432Hz Earth';

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
