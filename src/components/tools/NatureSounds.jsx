import React, { useState, useEffect, useRef } from 'react';

const NatureSounds = () => {
  const [playing, setPlaying] = useState(null);
  const audioCtxRef = useRef(null);
  const nodesRef = useRef({});

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
  };

  const createRain = (ctx) => {
    const bufferSize = 2 * ctx.sampleRate,
          noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate),
          output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
    }
    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1000;

    const gain = ctx.createGain();
    gain.gain.value = 0.5;

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    return { source: whiteNoise, gain };
  };

  const createWind = (ctx) => {
    const bufferSize = 2 * ctx.sampleRate,
          noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate),
          output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
    }
    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;
    filter.Q.value = 10;

    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.1;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 300;

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();

    const gain = ctx.createGain();
    gain.gain.value = 0.3;

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    return { source: whiteNoise, gain, lfo };
  };

  const toggleSound = (type) => {
    initAudio();
    const ctx = audioCtxRef.current;

    if (playing === type) {
      nodesRef.current[type].gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      setTimeout(() => {
        nodesRef.current[type].source.stop();
        if (nodesRef.current[type].lfo) nodesRef.current[type].lfo.stop();
        delete nodesRef.current[type];
        setPlaying(null);
      }, 500);
    } else {
      if (playing) toggleSound(playing);
      let nodes;
      if (type === 'rain') nodes = createRain(ctx);
      if (type === 'wind') nodes = createWind(ctx);

      nodes.source.start();
      setPlaying(type);
      nodesRef.current[type] = nodes;
    }
  };

  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        Object.values(nodesRef.current).forEach(n => {
            n.source.stop();
            if (n.lfo) n.lfo.stop();
        });
        audioCtxRef.current.close();
      }
    };
  }, []);

  return (
    <div className="tool-form text-center">
      <p className="mb-20 opacity-7">Procedural ambient sounds for relaxation and focus.</p>
      <div className="nature-sounds-grid">
        <div className={`sound-card ${playing === 'rain' ? 'active' : ''}`} onClick={() => toggleSound('rain')}>
          <span className="material-icons" style={{ fontSize: '3rem' }}>umbrella</span>
          <h3>Rain</h3>
        </div>
        <div className={`sound-card ${playing === 'wind' ? 'active' : ''}`} onClick={() => toggleSound('wind')}>
          <span className="material-icons" style={{ fontSize: '3rem' }}>air</span>
          <h3>Wind</h3>
        </div>
      </div>
    </div>
  );
};

export default NatureSounds;
