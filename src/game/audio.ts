// Web Audio API Retro Arcade Sound Synthesizer for Contra
class SoundManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private bgmGain: GainNode | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.7;
  private bgmTimer: number | null = null;
  private currentBgmTrack: string | null = null;
  private isInitialized: boolean = false;

  constructor() {
    // Will be initialized on first user interaction
  }

  public init() {
    if (this.isInitialized && this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.85, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.setValueAtTime(0.4, this.ctx.currentTime);
      this.bgmGain.connect(this.masterGain);

      this.isInitialized = true;
    } catch (e) {
      console.warn('Web Audio API not supported or blocked:', e);
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : this.volume, this.ctx.currentTime);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  // --- Sound Effects ---

  // Standard Rifle Shot (P)
  public playShootP() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.08);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  // Machine Gun (M)
  public playShootM() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(950, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.06);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.07);
  }

  // Spread Gun (S)
  public playShootS() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    // Rich dual-tone blast
    [600, 1100].forEach((freq, i) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(80 + i * 50, now + 0.12);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.13);
    });

    // Add noise snap
    this.playNoiseSnap(0.06, 0.2);
  }

  // Laser Gun (L)
  public playShootL() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(2200, now);
    osc.frequency.linearRampToValueAtTime(350, now + 0.15);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.16);
  }

  // Flame Gun (F)
  public playShootF() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.14);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.15);

    this.playNoiseSnap(0.12, 0.25);
  }

  // Player Jump (classic rising chirp)
  public playJump() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(620, now + 0.16);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.16);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.17);
  }

  // Explosion: small (grunt defeated)
  public playExplosionSmall() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    this.playNoiseExplosion(0.15, 0.35, 600);
  }

  // Explosion: big (turrets, pods, minibosses)
  public playExplosionBig() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    this.playNoiseExplosion(0.35, 0.55, 300);

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.3);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.32);
  }

  // Powerup capsule pickup
  public playPowerup() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const now = this.ctx.currentTime;
    const notes = [440, 554, 659, 880]; // A4, C#5, E5, A5
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);

      gain.gain.setValueAtTime(0, now);
      gain.gain.setValueAtTime(0.25, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.05 + 0.09);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.1);
    });
  }

  // Player Hit / Death
  public playPlayerDeath() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.5);

    gain.gain.setValueAtTime(0.45, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.55);

    this.playNoiseExplosion(0.4, 0.4, 400);
  }

  // Boss Warning Siren
  public playBossWarning() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const now = this.ctx.currentTime;
    for (let i = 0; i < 3; i++) {
      const start = now + i * 0.25;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(520, start);
      osc.frequency.linearRampToValueAtTime(940, start + 0.18);

      gain.gain.setValueAtTime(0.35, start);
      gain.gain.exponentialRampToValueAtTime(0.01, start + 0.2);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(start);
      osc.stop(start + 0.22);
    }
  }

  // Konami Code Secret Jingling Sound
  public playKonamiJingle() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const now = this.ctx.currentTime;
    const chord = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    chord.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      gain.gain.setValueAtTime(0.3, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.06 + 0.25);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.28);
    });
  }

  // Stage Clear Fanfare
  public playStageClear() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const now = this.ctx.currentTime;
    const melody = [
      { f: 523, t: 0 },
      { f: 659, t: 0.12 },
      { f: 783, t: 0.24 },
      { f: 1046, t: 0.36 },
      { f: 880, t: 0.52 },
      { f: 1046, t: 0.68 },
      { f: 1318, t: 0.88 },
    ];
    melody.forEach((note) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(note.f, now + note.t);

      gain.gain.setValueAtTime(0.3, now + note.t);
      gain.gain.exponentialRampToValueAtTime(0.01, now + note.t + 0.22);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + note.t);
      osc.stop(now + note.t + 0.25);
    });
  }

  // Noise explosion generator
  private playNoiseExplosion(duration: number, volume: number, filterFreq: number) {
    if (!this.ctx || !this.sfxGain) return;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(filterFreq, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + duration);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start();
  }

  private playNoiseSnap(duration: number, volume: number) {
    if (!this.ctx || !this.sfxGain) return;
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

    noise.connect(gain);
    gain.connect(this.sfxGain);

    noise.start();
  }

  // --- Procedural 8-Bit Chiptune Background Music ---
  public playBGM(track: 'title' | 'jungle' | 'tech_base' | 'alien_nest' | 'boss') {
    if (this.currentBgmTrack === track) return;
    this.stopBGM();
    this.currentBgmTrack = track;

    if (!this.ctx || !this.bgmGain) return;

    let step = 0;
    const bpm = track === 'boss' ? 160 : track === 'alien_nest' ? 145 : 138;
    const stepDuration = 60 / bpm / 2; // sixteenth notes

    // Melodies and basslines for each stage
    const jungleBass = [110, 110, 130.8, 110, 146.8, 130.8, 110, 98, 110, 110, 164.8, 146.8, 130.8, 110, 123.5, 98];
    const jungleLead = [440, 0, 523, 0, 587, 0, 659, 0, 587, 523, 440, 0, 392, 0, 440, 0];

    const techBass = [98, 98, 110, 98, 123.5, 98, 110, 98, 130.8, 98, 123.5, 98, 110, 98, 82.4, 98];
    const techLead = [392, 440, 493.88, 523.25, 493.88, 440, 392, 329.63, 440, 0, 440, 493.88, 523.25, 0, 587.33, 0];

    const alienBass = [73.4, 73.4, 87.3, 73.4, 98, 87.3, 73.4, 65.4, 73.4, 73.4, 110, 98, 87.3, 73.4, 77.8, 65.4];
    const alienLead = [293.66, 329.63, 349.23, 0, 329.63, 293.66, 261.63, 0, 293.66, 349.23, 392, 0, 349.23, 329.63, 293.66, 0];

    const bossBass = [82.4, 82.4, 82.4, 110, 82.4, 82.4, 123.5, 82.4, 82.4, 82.4, 130.8, 123.5, 110, 98, 82.4, 73.4];
    const bossLead = [329.63, 329.63, 440, 0, 493.88, 0, 523.25, 493.88, 440, 329.63, 392, 0, 440, 0, 329.63, 0];

    const titleBass = [130.8, 130.8, 164.8, 196, 130.8, 130.8, 164.8, 196, 110, 110, 146.8, 174.6, 98, 98, 130.8, 164.8];
    const titleLead = [523.25, 0, 659.25, 0, 783.99, 0, 659.25, 523.25, 440, 0, 587.33, 0, 659.25, 0, 523.25, 0];

    let bassPattern = jungleBass;
    let leadPattern = jungleLead;

    if (track === 'tech_base') {
      bassPattern = techBass;
      leadPattern = techLead;
    } else if (track === 'alien_nest') {
      bassPattern = alienBass;
      leadPattern = alienLead;
    } else if (track === 'boss') {
      bassPattern = bossBass;
      leadPattern = bossLead;
    } else if (track === 'title') {
      bassPattern = titleBass;
      leadPattern = titleLead;
    }

    const playNextStep = () => {
      if (!this.ctx || !this.bgmGain || this.isMuted || !this.currentBgmTrack) return;
      const now = this.ctx.currentTime;
      const idx = step % bassPattern.length;

      // Bass note
      const bassFreq = bassPattern[idx];
      if (bassFreq > 0) {
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();

        bassOsc.type = 'triangle';
        bassOsc.frequency.setValueAtTime(bassFreq, now);

        bassGain.gain.setValueAtTime(0.28, now);
        bassGain.gain.exponentialRampToValueAtTime(0.01, now + stepDuration * 0.9);

        bassOsc.connect(bassGain);
        bassGain.connect(this.bgmGain);

        bassOsc.start(now);
        bassOsc.stop(now + stepDuration);
      }

      // Lead note
      const leadFreq = leadPattern[idx];
      if (leadFreq > 0) {
        const leadOsc = this.ctx.createOscillator();
        const leadGain = this.ctx.createGain();

        leadOsc.type = 'square';
        leadOsc.frequency.setValueAtTime(leadFreq, now);

        leadGain.gain.setValueAtTime(0.18, now);
        leadGain.gain.exponentialRampToValueAtTime(0.01, now + stepDuration * 0.85);

        leadOsc.connect(leadGain);
        leadGain.connect(this.bgmGain);

        leadOsc.start(now);
        leadOsc.stop(now + stepDuration);
      }

      // Hi-hat noise on odd beats
      if (idx % 2 === 1) {
        this.playNoiseSnap(0.03, 0.08);
      }
      // Snare on beat 4, 12
      if (idx === 4 || idx === 12) {
        this.playNoiseSnap(0.07, 0.15);
      }

      step++;
      this.bgmTimer = window.setTimeout(playNextStep, stepDuration * 1000);
    };

    playNextStep();
  }

  public stopBGM() {
    if (this.bgmTimer !== null) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
    this.currentBgmTrack = null;
  }
}

export const soundManager = new SoundManager();
