/**
 * High-fidelity glass tap and tactile haptic audio synthesis using Web Audio API
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public playGlassTap(frequency = 800, duration = 0.05, intensity = 0.15) {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      // High resonance bandpass for crystalline "glass" clink
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(frequency * 1.8, now);
      filter.Q.setValueAtTime(12, now);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, now);
      osc.frequency.exponentialRampToValueAtTime(frequency * 0.4, now + duration);

      gain.gain.setValueAtTime(intensity, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch {
      // Audio context might be restricted before interaction
    }
  }

  public playNumberTap(digit: string) {
    // Subtle varied pitch depending on digit for organic tactile sensation
    const num = parseInt(digit, 10);
    const baseFreq = isNaN(num) ? 900 : 700 + num * 40;
    this.playGlassTap(baseFreq, 0.045, 0.12);
  }

  public playOperatorTap() {
    this.playGlassTap(1250, 0.06, 0.18);
  }

  public playEqualsChime() {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      // Dual harmonic crystalline chime
      [1046.5, 1318.5, 1567.98].forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.03);
        gain.gain.setValueAtTime(0.12 / (idx + 1), now + idx * 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.03 + 0.22);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.03);
        osc.stop(now + idx * 0.03 + 0.22);
      });
    } catch {
      // Ignore
    }
  }

  public playClearSound() {
    this.playGlassTap(480, 0.08, 0.14);
  }
}

export const sound = new SoundEngine();
