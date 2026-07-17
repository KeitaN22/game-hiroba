// ここでは Web Audio API を つかって、おとを コードだけで つくってるよ
// (おとの ファイルは つかわないから、どのゲームでも すぐ うごくよ)

(function () {
  let audioCtx = null;
  let muted = false;
  let bgmStopFn = null;

  function getCtx() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  }

  function beep(freq, startTime, duration, type, volume) {
    if (muted) return;
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume || 0.2, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  const DEFAULT_BGM = [523.25, 587.33, 659.25, 698.46, 783.99, 698.46, 659.25, 587.33];

  window.GameAudio = {
    DEFAULT_BGM,

    isMuted() {
      return muted;
    },

    setMuted(value) {
      muted = value;
      if (muted) this.stopBGM();
    },

    toggleMute() {
      this.setMuted(!muted);
      return muted;
    },

    playClickTick() {
      if (muted) return;
      const ctx = getCtx();
      beep(880, ctx.currentTime, 0.06, 'square', 0.08);
    },

    playClearFanfare() {
      if (muted) return;
      const ctx = getCtx();
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((f, i) => beep(f, now + i * 0.12, 0.28, 'triangle', 0.28));
    },

    playFailBuzz() {
      if (muted) return;
      const ctx = getCtx();
      const now = ctx.currentTime;
      beep(220, now, 0.22, 'sawtooth', 0.2);
      beep(160, now + 0.15, 0.3, 'sawtooth', 0.2);
    },

    // どすん、という パンチ・うちの おと
    playPunchImpact() {
      if (muted) return;
      const ctx = getCtx();
      const now = ctx.currentTime;
      beep(140, now, 0.14, 'square', 0.22);
      beep(90, now + 0.02, 0.16, 'sine', 0.2);
      const bufferSize = Math.floor(ctx.sampleRate * 0.06);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 500;
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start(now);
      noise.stop(now + 0.06);
    },

    // ぴゅーん、という エネルギー・ビームの おと
    playEnergyZap() {
      if (muted) return;
      const ctx = getCtx();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.22);
      gain.gain.setValueAtTime(0.16, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.24);
    },

    // ぼわっ、という ほのおの おと
    playFireWhoosh() {
      if (muted) return;
      const ctx = getCtx();
      const now = ctx.currentTime;
      const bufferSize = Math.floor(ctx.sampleRate * 0.3);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.22, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(300, now);
      filter.frequency.exponentialRampToValueAtTime(900, now + 0.3);
      filter.Q.value = 0.8;
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start(now);
      noise.stop(now + 0.3);
    },

    // しゅっ、という は・いとの すばやい おと
    playBladeSwish() {
      if (muted) return;
      const ctx = getCtx();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(2200, now);
      osc.frequency.exponentialRampToValueAtTime(700, now + 0.1);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    },

    playGunshot() {
      if (muted) return;
      const ctx = getCtx();
      const now = ctx.currentTime;
      const bufferSize = Math.floor(ctx.sampleRate * 0.08);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 1400;
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start(now);
      noise.stop(now + 0.08);
    },

    // returns a handle: call .update(0-1) to change pitch/volume with spin speed, .stop() to end
    startSpinWhir() {
      const ctx = getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.value = 80;
      gain.gain.value = 0;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      let stopped = false;
      return {
        update(ratio) {
          if (stopped) return;
          const now = ctx.currentTime;
          osc.frequency.setTargetAtTime(70 + ratio * 260, now, 0.06);
          gain.gain.setTargetAtTime(muted ? 0 : (ratio > 0.02 ? 0.1 : 0), now, 0.08);
        },
        stop() {
          if (stopped) return;
          stopped = true;
          const now = ctx.currentTime;
          gain.gain.setTargetAtTime(0, now, 0.1);
          osc.stop(now + 0.3);
        },
      };
    },

    playBGM(melody, tempo) {
      this.stopBGM();
      if (muted) return;
      const notes = melody || DEFAULT_BGM;
      const stepTime = tempo || 0.3;
      const ctx = getCtx();
      let stopped = false;
      let stepIndex = 0;
      let timer = null;
      function scheduleNext() {
        if (stopped) return;
        if (!muted) {
          beep(notes[stepIndex], ctx.currentTime, stepTime * 0.85, 'square', 0.05);
        }
        stepIndex = (stepIndex + 1) % notes.length;
        timer = setTimeout(scheduleNext, stepTime * 1000);
      }
      scheduleNext();
      bgmStopFn = () => { stopped = true; clearTimeout(timer); };
    },

    stopBGM() {
      if (bgmStopFn) {
        bgmStopFn();
        bgmStopFn = null;
      }
    },

    speak(text) {
      if (muted) return;
      if (!window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'ja-JP';
      utter.rate = 1.0;
      utter.pitch = 1.05;
      window.speechSynthesis.speak(utter);
    },
  };
})();
