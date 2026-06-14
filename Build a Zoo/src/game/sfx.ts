type LegacyAudioContext = typeof AudioContext & {
    webkitAudioContext?: typeof AudioContext;
};

export class Sfx {
    private static context: AudioContext | null = null;

    private static getContext(): AudioContext | null {
        if (typeof window === 'undefined') {
            return null;
        }

        const audioContextType = window.AudioContext as LegacyAudioContext | undefined;
        const Ctx = audioContextType ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

        if (!Ctx) {
            return null;
        }

        if (!this.context) {
            this.context = new Ctx();
        }

        return this.context;
    }

    static unlock(): void {
        const ctx = this.getContext();

        if (ctx && ctx.state === 'suspended') {
            void ctx.resume();
        }
    }

    private static tone(
        frequency: number,
        startTime: number,
        duration: number,
        gain = 0.045,
        type: OscillatorType = 'sine'
    ): void {
        const ctx = this.getContext();

        if (!ctx) {
            return;
        }

        const oscillator = ctx.createOscillator();
        const envelope = ctx.createGain();

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, startTime);

        envelope.gain.setValueAtTime(0.0001, startTime);
        envelope.gain.exponentialRampToValueAtTime(Math.max(gain, 0.0001), startTime + 0.015);
        envelope.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

        oscillator.connect(envelope);
        envelope.connect(ctx.destination);

        oscillator.start(startTime);
        oscillator.stop(startTime + duration + 0.02);
    }

    static playPop(pitch = 1): void {
        const ctx = this.getContext();

        if (!ctx) {
            return;
        }

        const now = ctx.currentTime;
        this.tone(620 * pitch, now, 0.045, 0.036, 'triangle');
        this.tone(920 * pitch, now + 0.018, 0.075, 0.028, 'sine');
    }

    static playSoftMistake(volume = 1): void {
        const ctx = this.getContext();

        if (!ctx) {
            return;
        }

        const now = ctx.currentTime;
        this.tone(250, now, 0.12, 0.032 * volume, 'sawtooth');
        this.tone(190, now + 0.08, 0.16, 0.025 * volume, 'triangle');
    }

    static playSuccess(): void {
        const ctx = this.getContext();

        if (!ctx) {
            return;
        }

        const now = ctx.currentTime;
        this.tone(392, now, 0.12, 0.03, 'triangle');
        this.tone(523, now + 0.1, 0.12, 0.03, 'triangle');
        this.tone(659, now + 0.2, 0.14, 0.03, 'triangle');
        this.tone(880, now + 0.32, 0.2, 0.04, 'sine');
    }
}
