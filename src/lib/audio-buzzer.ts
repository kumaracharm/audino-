// Web Audio API Clinical Monitor Alert Buzzer
// Generates realistic medical telemetry alert beeps without external assets or dependencies

class ClinicalAudioBuzzer {
  private audioCtx: AudioContext | null = null;
  private isMuted: boolean = false;
  private activeIntervalId: any = null;
  private currentBuzzIndex: number = 0;
  private buzzSubscriber: ((count: number, active: boolean) => void) | null = null;

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.cancelBuzzerSequence();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.cancelBuzzerSequence();
    } else {
      // Short test blip on unmute
      this.playChime(660, 0.08, 'sine', 0.1);
    }
    return this.isMuted;
  }

  public onBuzzUpdate(callback: (count: number, active: boolean) => void) {
    this.buzzSubscriber = callback;
  }

  /**
   * Triggers continuous hospital telemetry alarm until clinical attention is provided.
   * Repeats triple-pulse alarm every 5 seconds indefinitely until clinician explicitly attends.
   */
  public triggerContinuousAlarmUntilAttended(onProgress?: (cycleIndex: number) => void) {
    this.cancelBuzzerSequence();
    if (this.isMuted) return;

    this.currentBuzzIndex = 1;
    this.playP0Buzzer();
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate([300, 150, 300, 150, 400]); } catch {}
    }
    onProgress?.(1);
    this.buzzSubscriber?.(1, true);

    this.activeIntervalId = setInterval(() => {
      if (this.isMuted) {
        this.cancelBuzzerSequence();
        return;
      }

      this.currentBuzzIndex++;
      this.playP0Buzzer();
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try { navigator.vibrate([300, 150, 300, 150, 400]); } catch {}
      }
      onProgress?.(this.currentBuzzIndex);
      this.buzzSubscriber?.(this.currentBuzzIndex, true);
    }, 5000);
  }

  /**
   * Legacy alias: triggers continuous alarm until attention is provided
   */
  public triggerThreeBuzzSequence(onProgress?: (buzzIndex: number) => void) {
    this.triggerContinuousAlarmUntilAttended(onProgress);
  }

  /**
   * Clinician explicitly provides attention / acknowledges, immediately silencing the alarm
   */
  public provideAttention() {
    this.cancelBuzzerSequence();
  }

  public cancelBuzzerSequence() {
    if (this.activeIntervalId) {
      clearInterval(this.activeIntervalId);
      this.activeIntervalId = null;
    }
    const hadActive = this.currentBuzzIndex > 0;
    this.currentBuzzIndex = 0;
    if (hadActive) {
      this.buzzSubscriber?.(0, false);
    }
  }

  // Play high-urgency P0 Clinical Alert Buzzer (triple pulse medical alarm)
  public playP0Buzzer() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    
    // Pulse 1: 880 Hz (A5)
    this.scheduleTone(ctx, 880, now, 0.12, 0.25);
    // Pulse 2: 1175 Hz (D6)
    this.scheduleTone(ctx, 1175, now + 0.15, 0.12, 0.28);
    // Pulse 3: 880 Hz
    this.scheduleTone(ctx, 880, now + 0.30, 0.12, 0.25);
    // Pulse 4: 1175 Hz (accent)
    this.scheduleTone(ctx, 1175, now + 0.45, 0.22, 0.30);
  }

  // Play standard P1 warning chime
  public playP1Warning() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    this.scheduleTone(ctx, 587.33, now, 0.15, 0.15); // D5
    this.scheduleTone(ctx, 880, now + 0.18, 0.20, 0.18); // A5
  }

  private scheduleTone(ctx: AudioContext, freq: number, startTime: number, duration: number, volume: number) {
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      // Attack & decay envelope
      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.exponentialRampToValueAtTime(volume, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.05);
    } catch {
      // Audio autoplay policy fallback
    }
  }

  private playChime(freq: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.15) {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.exponentialRampToValueAtTime(volume, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + duration + 0.05);
    } catch {}
  }
}

export const clinicalBuzzer = new ClinicalAudioBuzzer();

