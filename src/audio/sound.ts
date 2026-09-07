// Web Audio API Synthesizer for cozy retro game sound effects & music

class SoundEngine {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;
  private isBgmPlaying: boolean = false;
  private bgmInterval: any = null;
  private bgmNoteIdx: number = 0;

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

    // Play one very quiet immediate note inside the unlocked context. This
    // makes Safari commit the audio session before the interval begins.
    this.playToneNow(261.63, 'sine', 0.08, 0.015, 0.001);
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
    endGain = 0.001
  ) {
    if (this.muted || !this.ctx || this.ctx.state !== 'running') return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(startGain, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(endGain, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
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
    const notes = [523.25, 659.25, 783.99, 1046.50];
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

  // Cozy Loop BGM Generator
  public startBgm() {
    if (this.isBgmPlaying || this.muted || !this.ctx || this.ctx.state !== 'running') return;

    this.isBgmPlaying = true;
    const notes = [261.63, 329.63, 392.0, 523.25, 392.0, 329.63, 440.0, 392.0];

    const playNext = () => {
      if (!this.isBgmPlaying || this.muted) return;
      this.playToneNow(notes[this.bgmNoteIdx], 'sine', 0.4, 0.03, 0.001);
      this.bgmNoteIdx = (this.bgmNoteIdx + 1) % notes.length;
    };

    // Start immediately rather than waiting for the first interval tick.
    playNext();
    this.bgmInterval = setInterval(playNext, 450);
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
