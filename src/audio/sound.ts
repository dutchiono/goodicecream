// Web Audio API Synthesizer for cozy retro game sound effects & music

class SoundEngine {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;
  private isBgmPlaying: boolean = false;
  private bgmInterval: any = null;
  private bgmStep: number = 0;

  constructor() {
    // AudioContext is intentionally created only after a user gesture.
  }

  private ensureCtx(): AudioContext | null {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    return this.ctx;
  }

  private async resumeCtx(): Promise<boolean> {
    const ctx = this.ensureCtx();
    if (!ctx) return false;

    try {
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
      return ctx.state === 'running';
    } catch (e) {
      console.warn('AudioContext resume failed', e);
      return false;
    }
  }

  /**
   * Safari/iOS requires Web Audio to be resumed from a real user gesture.
   * We wait until the context is actually running before starting BGM.
   */
  public async unlockAndStart() {
    if (this.muted) return;

    const running = await this.resumeCtx();
    if (!running) return;

    // Very quiet immediate tone to lock in the Safari audio session.
    this.playToneNow(261.63, 'sine', 0.06, 0.006, 0.001);
    this.startBgm();
  }

  public toggleMute(): boolean {
    this.muted = !this.muted;
    if (this.muted) {
      this.stopBgm();
    } else {
      void this.unlockAndStart();
    }
    return this.muted;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  private playToneNow(
    freq: number,
    type: OscillatorType,
    duration: number,
    startGain = 0.2,
    endGain = 0.001,
    delay = 0
  ) {
    if (this.muted || !this.ctx || this.ctx.state !== 'running') return;

    try {
      const now = this.ctx.currentTime + delay;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(Math.max(startGain, 0.0001), now);
      gain.gain.exponentialRampToValueAtTime(Math.max(endGain, 0.0001), now + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {
      console.warn('Audio playback error', e);
    }
  }

  private playTone(freq: number, type: OscillatorType, duration: number, startGain = 0.2, endGain = 0.001) {
    if (this.muted) return;

    const ctx = this.ensureCtx();
    if (!ctx) return;

    if (ctx.state !== 'running') {
      void this.resumeCtx().then((running) => {
        if (running) this.playToneNow(freq, type, duration, startGain, endGain);
      });
      return;
    }

    this.playToneNow(freq, type, duration, startGain, endGain);
  }

  private playJazzChord(notes: number[], duration = 1.9, gain = 0.016) {
    // Triangle + sine blend gives a softer electric-piano/lounge character.
    notes.forEach((freq, i) => {
      this.playToneNow(freq, 'triangle', duration, gain, 0.001, i * 0.025);
      this.playToneNow(freq * 2, 'sine', duration * 0.8, gain * 0.22, 0.001, i * 0.025);
    });
  }

  private playBass(freq: number) {
    this.playToneNow(freq, 'sine', 0.85, 0.024, 0.001);
  }

  private playBrush() {
    // A very soft, short high tone suggests a brushed cymbal tick without
    // making the soundtrack feel percussive or arcade-like.
    this.playToneNow(1800, 'triangle', 0.045, 0.004, 0.001);
  }

  // Sound Effects
  public playClick() {
    this.playTone(600, 'sine', 0.08, 0.15);
  }

  public playScoop() {
    if (this.muted) return;
    this.playTone(240, 'triangle', 0.15, 0.25);
  }

  public playDrizzle() {
    this.playTone(800 + Math.random() * 200, 'sine', 0.05, 0.08);
  }

  public playCashRegister() {
    if (this.muted) return;
    this.playTone(987.77, 'sine', 0.15, 0.25);
    setTimeout(() => {
      this.playTone(1318.51, 'sine', 0.35, 0.3);
    }, 80);
  }

  public playCustomerHappy() {
    if (this.muted) return;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 'triangle', 0.15, 0.2), idx * 70);
    });
  }

  public playCustomerSad() {
    if (this.muted) return;
    const notes = [400, 350, 300, 250];
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 'sawtooth', 0.2, 0.15), idx * 100);
    });
  }

  // Cozy coffee-shop jazz loop.
  public startBgm() {
    if (this.isBgmPlaying || this.muted || !this.ctx || this.ctx.state !== 'running') return;

    this.isBgmPlaying = true;

    // Cmaj7 -> A7 -> Dm7 -> G7, a classic warm jazz turnaround.
    const chords = [
      { notes: [261.63, 329.63, 392.0, 493.88], bass: 130.81 }, // Cmaj7
      { notes: [277.18, 329.63, 415.3, 493.88], bass: 110.0 },  // A7(b9-ish voicing)
      { notes: [293.66, 349.23, 440.0, 523.25], bass: 146.83 }, // Dm7
      { notes: [293.66, 349.23, 392.0, 493.88], bass: 98.0 }    // G7
    ];

    const playBar = () => {
      if (!this.isBgmPlaying || this.muted) return;

      const chord = chords[this.bgmStep % chords.length];
      this.playJazzChord(chord.notes);
      this.playBass(chord.bass);

      // Light swing-like brush ticks inside the bar.
      setTimeout(() => this.playBrush(), 420);
      setTimeout(() => this.playBrush(), 980);
      setTimeout(() => this.playBrush(), 1420);

      this.bgmStep = (this.bgmStep + 1) % chords.length;
    };

    playBar();
    this.bgmInterval = setInterval(playBar, 2000);
  }

  public stopBgm() {
    this.isBgmPlaying = false;
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }
}

export const sound = new SoundEngine();
