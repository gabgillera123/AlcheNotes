// Web Audio API procedural sound effects for QuizAlchemist

class SoundEngine {
  private ctx: AudioContext | null = null;
  public muted: boolean = false;

  private getContext(): AudioContext | null {
    if (this.muted || typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public playTone(
    freq: number,
    duration: number = 0.12,
    type: OscillatorType = 'triangle',
    volume: number = 0.12,
    delay: number = 0
  ) {
    const ctx = this.getContext();
    if (!ctx) return;

    const startTime = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.02);
  }

  public playClick() {
    this.playTone(520, 0.06, 'square', 0.06);
  }

  public playPlop() {
    this.playTone(280, 0.09, 'sine', 0.14);
    this.playTone(420, 0.11, 'triangle', 0.12, 0.05);
  }

  public playHarvestSuccess() {
    this.playTone(523.25, 0.1, 'triangle', 0.14, 0);
    this.playTone(659.25, 0.1, 'triangle', 0.14, 0.08);
    this.playTone(783.99, 0.14, 'triangle', 0.15, 0.16);
    this.playTone(1046.5, 0.24, 'sine', 0.16, 0.24);
  }

  public playHarvestFail() {
    this.playTone(240, 0.15, 'sawtooth', 0.1, 0);
    this.playTone(180, 0.25, 'sawtooth', 0.12, 0.12);
  }

  public playPotionPoof() {
    this.playTone(440, 0.1, 'sine', 0.14, 0);
    this.playTone(554.37, 0.1, 'sine', 0.14, 0.07);
    this.playTone(659.25, 0.12, 'triangle', 0.15, 0.14);
    this.playTone(880, 0.28, 'triangle', 0.18, 0.22);
  }

  public playGoldCoins() {
    this.playTone(987.77, 0.08, 'square', 0.08, 0);
    this.playTone(1318.51, 0.18, 'square', 0.1, 0.07);
    this.playTone(1567.98, 0.22, 'sine', 0.12, 0.15);
  }
}

export const sound = new SoundEngine();
