// Web Audio API synthesizer for game sound effects and a cozy jazz soundtrack.

class SoundEngine {
  private ctx: AudioContext | null = null;
  private muted = false;
  private isBgmPlaying = false;
  private bgmTimers: number[] = [];
  private bar = 0;

  private ensureCtx(): AudioContext | null {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) this.ctx = new AudioCtxClass();
    }
    return this.ctx;
  }

  private async resumeCtx(): Promise<boolean> {
    const ctx = this.ensureCtx();
    if (!ctx) return false;
    try {
      if (ctx.state === 'suspended') await ctx.resume();
      return ctx.state === 'running';
    } catch (e) {
      console.warn('AudioContext resume failed', e);
      return false;
    }
  }

  public async unlockAndStart() {
    if (this.muted) return;
    if (!(await this.resumeCtx())) return;
    this.startBgm();
  }

  public toggleMute(): boolean {
    this.muted = !this.muted;
    if (this.muted) this.stopBgm();
    else void this.unlockAndStart();
    return this.muted;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  private tone(
    freq: number,
    type: OscillatorType,
    duration: number,
    gainValue: number,
    delay = 0,
    detune = 0
  ) {
    if (this.muted || !this.ctx || this.ctx.state !== 'running') return;
    const now = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    osc.detune.setValueAtTime(detune, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(Math.max(gainValue, 0.0001), now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.05);
  }

  private noiseBurst(delay: number, duration = 0.08, gainValue = 0.007) {
    if (this.muted || !this.ctx || this.ctx.state !== 'running') return;
    const length = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();
    filter.type = 'highpass';
    filter.frequency.value = 4500;
    gain.gain.value = gainValue;
    src.buffer = buffer;
    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    const when = this.ctx.currentTime + delay;
    src.start(when);
    src.stop(when + duration);
  }

  private pianoChord(notes: number[], delay = 0, duration = 2.6) {
    notes.forEach((freq, i) => {
      this.tone(freq, 'triangle', duration, 0.012, delay + i * 0.018);
      this.tone(freq * 2, 'sine', duration * 0.75, 0.0022, delay + i * 0.018, -4);
    });
  }

  private bass(freq: number, delay: number) {
    this.tone(freq, 'sine', 0.55, 0.03, delay);
    this.tone(freq * 2, 'triangle', 0.35, 0.006, delay, -6);
  }

  private lead(freq: number, delay: number, duration = 0.5) {
    this.tone(freq, 'sine', duration, 0.009, delay, 3);
    this.tone(freq * 0.5, 'triangle', duration, 0.0025, delay, -3);
  }

  private schedule(fn: () => void, ms: number) {
    const id = window.setTimeout(fn, ms);
    this.bgmTimers.push(id);
  }

  // Sound effects
  public playClick() {
    if (!this.ctx || this.ctx.state !== 'running') {
      void this.resumeCtx().then(() => this.tone(600, 'sine', 0.08, 0.15));
      return;
    }
    this.tone(600, 'sine', 0.08, 0.15);
  }

  public playScoop() { this.tone(240, 'triangle', 0.15, 0.25); }
  public playDrizzle() { this.tone(850, 'sine', 0.05, 0.08); }
  public playCashRegister() {
    this.tone(987.77, 'sine', 0.15, 0.25);
    this.schedule(() => this.tone(1318.51, 'sine', 0.35, 0.3), 80);
  }
  public playCustomerHappy() {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => this.schedule(() => this.tone(f, 'triangle', 0.15, 0.2), i * 70));
  }
  public playCustomerSad() {
    [400, 350, 300, 250].forEach((f, i) => this.schedule(() => this.tone(f, 'sawtooth', 0.2, 0.15), i * 100));
  }

  // Slow coffee-shop jazz: Rhodes-like chords, walking bass, brushed hats, soft lead.
  public startBgm() {
    if (this.isBgmPlaying || this.muted || !this.ctx || this.ctx.state !== 'running') return;
    this.isBgmPlaying = true;
    this.bar = 0;

    const progression = [
      { chord: [261.63, 329.63, 392.0, 493.88], bass: [130.81, 164.81, 196.0, 220.0] }, // Cmaj7
      { chord: [220.0, 261.63, 329.63, 392.0], bass: [110.0, 138.59, 164.81, 196.0] },   // Am7
      { chord: [293.66, 349.23, 440.0, 523.25], bass: [146.83, 174.61, 220.0, 246.94] }, // Dm7
      { chord: [196.0, 246.94, 293.66, 349.23], bass: [98.0, 123.47, 146.83, 174.61] }   // G7
    ];

    const melody = [659.25, 587.33, 523.25, 493.88, 440.0, 493.88, 523.25, 392.0];
    const barMs = 3600;

    const playBar = () => {
      if (!this.isBgmPlaying || this.muted) return;
      const p = progression[this.bar % progression.length];
      this.pianoChord(p.chord, 0, 3.2);

      p.bass.forEach((f, i) => this.bass(f, i * 0.82));
      [0.38, 1.2, 2.02, 2.84].forEach(d => this.noiseBurst(d));

      const m = this.bar % melody.length;
      this.lead(melody[m], 0.55, 0.62);
      this.lead(melody[(m + 2) % melody.length], 2.15, 0.8);

      this.bar++;
      this.schedule(playBar, barMs);
    };

    playBar();
  }

  public stopBgm() {
    this.isBgmPlaying = false;
    this.bgmTimers.forEach(id => clearTimeout(id));
    this.bgmTimers = [];
  }
}

export const sound = new SoundEngine();
