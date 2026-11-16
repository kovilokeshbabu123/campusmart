import { getSceneAtTime } from './timeline';

/**
 * Procedural Web Audio synthesizer generating an uplifting, corporate/university
 * ambient soundtrack synchronized to the 7 commercial scenes.
 * Supports exporting a MediaStreamTrack for recording into the exported video.
 */
export class CinematicAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private streamDest: MediaStreamAudioDestinationNode | null = null;
  private isMuted = false;
  private lastSceneId = '';
  private stepTimer: number | null = null;
  private stepIndex = 0;

  // Uplifting D major / B minor progression frequencies (warm piano/pad chords)
  private readonly chords: number[][] = [
    [146.83, 220.0, 293.66, 369.99], // Dmaj
    [110.0, 164.81, 220.0, 277.18], // Amaj
    [123.47, 185.0, 246.94, 293.66], // Bm7
    [196.0, 246.94, 293.66, 369.99], // Gmaj7
  ];

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;

    if (!this.ctx) {
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.isMuted ? 0 : 0.24;
      this.masterGain.connect(this.ctx.destination);
      this.streamDest = this.ctx.createMediaStreamDestination();
      this.masterGain.connect(this.streamDest);
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : 0.24, this.ctx.currentTime, 0.08);
    }
  }

  public getAudioStream(): MediaStream | null {
    this.ensureContext();
    return this.streamDest ? this.streamDest.stream : null;
  }

  public start(): void {
    const ctx = this.ensureContext();
    if (!ctx || this.stepTimer !== null) return;

    this.triggerBeat();
    this.stepTimer = window.setInterval(() => {
      this.triggerBeat();
    }, 850);
  }

  public stop(): void {
    if (this.stepTimer !== null) {
      window.clearInterval(this.stepTimer);
      this.stepTimer = null;
    }
  }

  public syncScene(timeSec: number): void {
    const scene = getSceneAtTime(timeSec);
    if (scene.id !== this.lastSceneId) {
      this.lastSceneId = scene.id;
      this.triggerSceneChime(scene.number);
    }
  }

  private triggerBeat(): void {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const now = this.ctx.currentTime;
    const chord = this.chords[Math.floor(this.stepIndex / 4) % this.chords.length];
    const note = chord[this.stepIndex % chord.length];

    // Warm plucked electric-piano / marimba pulse
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(note * 2, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.11, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.78);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.8);

    // Every 4th beat, swell a warm sub pad
    if (this.stepIndex % 4 === 0) {
      for (const freq of chord.slice(0, 3)) {
        const pad = this.ctx.createOscillator();
        const padGain = this.ctx.createGain();
        pad.type = 'sine';
        pad.frequency.setValueAtTime(freq, now);
        padGain.gain.setValueAtTime(0.001, now);
        padGain.gain.linearRampToValueAtTime(0.045, now + 0.6);
        padGain.gain.exponentialRampToValueAtTime(0.0008, now + 3.2);
        pad.connect(padGain);
        padGain.connect(this.masterGain);
        pad.start(now);
        pad.stop(now + 3.3);
      }
    }

    this.stepIndex += 1;
  }

  private triggerSceneChime(sceneNum: number): void {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const now = this.ctx.currentTime;
    const baseFreqs = [587.33, 659.25, 739.99, 880.0, 987.77, 1174.66, 587.33];
    const freq = baseFreqs[(sceneNum - 1) % baseFreqs.length];

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.08, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0005, now + 1.1);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 1.15);
  }
}
