/**
 * Web Audio API Keyboard Sound Synthesizer
 * Provides crisp tactile sound effects without external audio files:
 * - Thock (Deep tactile sound)
 * - Click (Crisp Blue switch)
 * - Clack (Linear switch)
 * - Beep (Retro 80s terminal)
 * - Error (Subtle typo feedback)
 */

class SoundEngine {
  constructor() {
    this.audioCtx = null;
    this.soundType = "thock"; // "off", "thock", "click", "clack", "beep"
    this.volume = 0.4;
    this.errorSoundEnabled = true;
  }

  init() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
  }

  setSoundType(type) {
    this.soundType = type;
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
  }

  playKey() {
    if (this.soundType === "off" || this.volume <= 0) return;
    this.init();
    if (!this.audioCtx) return;

    switch (this.soundType) {
      case "thock":
        this._playThock();
        break;
      case "click":
        this._playClick();
        break;
      case "clack":
        this._playClack();
        break;
      case "beep":
        this._playBeep();
        break;
    }
  }

  playError() {
    if (!this.errorSoundEnabled || this.soundType === "off" || this.volume <= 0) return;
    this.init();
    if (!this.audioCtx) return;

    const ctx = this.audioCtx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(140, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(this.volume * 0.35, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  }

  _playThock() {
    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    // Body of the thock (low sine drop)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    // Pitch shift downward for tactile deep feel
    const startFreq = 220 + Math.random() * 40;
    osc.type = "sine";
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.06);

    gain.gain.setValueAtTime(this.volume * 0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.06);

    // Initial micro-transient click
    const clickOsc = ctx.createOscillator();
    const clickGain = ctx.createGain();
    clickOsc.type = "triangle";
    clickOsc.frequency.setValueAtTime(800 + Math.random() * 200, now);
    clickGain.gain.setValueAtTime(this.volume * 0.25, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);

    clickOsc.connect(clickGain);
    clickGain.connect(ctx.destination);

    clickOsc.start(now);
    clickOsc.stop(now + 0.015);
  }

  _playClick() {
    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "square";
    osc.frequency.setValueAtTime(1400 + Math.random() * 300, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.025);

    gain.gain.setValueAtTime(this.volume * 0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.025);
  }

  _playClack() {
    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(550 + Math.random() * 100, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.04);

    gain.gain.setValueAtTime(this.volume * 0.45, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  _playBeep() {
    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(650, now);

    gain.gain.setValueAtTime(this.volume * 0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.035);
  }
}

const soundManager = new SoundEngine();
