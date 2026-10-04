/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export class AudioManagerClass {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;

  // Persistent Ambient Nodes
  private cityDroneOsc1: OscillatorNode | null = null;
  private cityDroneOsc2: OscillatorNode | null = null;
  private isAmbientRunning = false;

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  private initContext() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.isMuted ? 0 : 0.65;
      this.masterGain.connect(this.ctx.destination);

      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.value = 0.35;
      this.ambientGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 0.5;
      this.sfxGain.connect(this.masterGain);

      this.startCityAmbience();
    } catch (e) {
      console.warn('[AudioManager] Web Audio API initialization deferred:', e);
    }
  }

  public resume() {
    this.initContext();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(
        this.isMuted ? 0 : 0.65,
        this.ctx.currentTime
      );
    }
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Continuous futuristic city ambient background hum
   */
  private startCityAmbience() {
    if (!this.ctx || !this.ambientGain || this.isAmbientRunning) return;
    this.isAmbientRunning = true;

    try {
      const now = this.ctx.currentTime;

      // Low frequency subterranean drone
      this.cityDroneOsc1 = this.ctx.createOscillator();
      this.cityDroneOsc1.type = 'sawtooth';
      this.cityDroneOsc1.frequency.setValueAtTime(55, now); // A1 note

      const filter1 = this.ctx.createBiquadFilter();
      filter1.type = 'lowpass';
      filter1.frequency.setValueAtTime(140, now);

      this.cityDroneOsc2 = this.ctx.createOscillator();
      this.cityDroneOsc2.type = 'sine';
      this.cityDroneOsc2.frequency.setValueAtTime(110.5, now); // slight detune

      this.cityDroneOsc1.connect(filter1);
      this.cityDroneOsc2.connect(filter1);
      filter1.connect(this.ambientGain);

      this.cityDroneOsc1.start();
      this.cityDroneOsc2.start();
    } catch {
      // Ignore audio start exceptions before gesture
    }
  }

  /**
   * UI Click Sound
   */
  public playUiClick() {
    this.resume();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch {}
  }

  /**
   * UI Confirmation Chime
   */
  public playUiConfirm() {
    this.resume();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    try {
      const now = this.ctx.currentTime;
      [523.25, 659.25, 783.99].forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);

        gain.gain.setValueAtTime(0.2, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.15);

        osc.connect(gain);
        gain.connect(this.sfxGain!);

        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.16);
      });
    } catch {}
  }

  /**
   * Maglev Train Whoosh & chime
   */
  public playTrainSound() {
    this.resume();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.6);
      osc.frequency.exponentialRampToValueAtTime(110, now + 1.2);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.25, now + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 1.25);
    } catch {}
  }

  /**
   * Emergency Siren pulse
   */
  public playSirenAlert() {
    this.resume();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(650, now);
      osc.frequency.linearRampToValueAtTime(950, now + 0.4);
      osc.frequency.linearRampToValueAtTime(650, now + 0.8);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.85);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.9);
    } catch {}
  }

  /**
   * Thunder rumble during storm
   */
  public playThunder() {
    this.resume();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(70, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 1.5);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.6);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 1.65);
    } catch {}
  }

  public dispose() {
    if (this.cityDroneOsc1) {
      this.cityDroneOsc1.stop();
      this.cityDroneOsc1.disconnect();
    }
    if (this.cityDroneOsc2) {
      this.cityDroneOsc2.stop();
      this.cityDroneOsc2.disconnect();
    }
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
    this.isAmbientRunning = false;
  }
}

export const AudioManager = new AudioManagerClass();
