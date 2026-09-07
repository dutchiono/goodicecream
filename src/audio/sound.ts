// Web Audio API Synthesizer for cozy retro game sound effects & music

class SoundEngine {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;
  private isBgmPlaying: boolean = false;
  private bgmInterval: any = null;

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.muted = !this.muted;
    if (this.muted) {
      this.stopBgm();
    } else {
      this.startBgm();
    }
    return this.muted;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  // Play a simple synthesized frequency envelope
  private playTone(freq: number, type: OscillatorType, duration: number, startGain = 0.2, endGain = 0.001) {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

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

  // Sound Effects
  public playClick() {
    this.playTone(600, 'sine', 0.08, 0.15);
  }

  public playScoop() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    // Pitch sweep for scoop splat sound
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(320, this.ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  public playDrizzle() {
    this.playTone(800 + Math.random() * 200, 'sine', 0.05, 0.08);
  }

  public playCashRegister() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    // Two fast bell tones (cha-ching)
    this.playTone(987.77, 'sine', 0.15, 0.25); // B5
    setTimeout(() => {
      this.playTone(1318.51, 'sine', 0.35, 0.3); // E6
    }, 80);
  }

  public playCustomerHappy() {
    if (this.muted) return;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
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
    if (this.isBgmPlaying || this.muted) return;
    this.isBgmPlaying = true;

    // Simple pentatonic melody sequence
    const notes = [261.63, 329.63, 392.00, 523.25, 392.00, 329.63, 440.00, 392.00];
    let noteIdx = 0;

    this.bgmInterval = setInterval(() => {
      if (!this.isBgmPlaying || this.muted) return;
      this.playTone(notes[noteIdx], 'sine', 0.4, 0.03, 0.001);
      noteIdx = (noteIdx + 1) % notes.length;
    }, 450);
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
