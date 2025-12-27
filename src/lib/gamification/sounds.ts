// Sound System for Gamification
// Manages all audio feedback with volume control

export type SoundType =
    | 'correct_basic'
    | 'correct_combo5'
    | 'correct_combo10'
    | 'correct_combo20'
    | 'correct_combo50'
    | 'incorrect'
    | 'levelUp'
    | 'achievementUnlock'
    | 'chestOpen'
    | 'coinCollect'
    | 'click'
    | 'hover';

class SoundManager {
    private sounds: Map<SoundType, HTMLAudioElement> = new Map();
    private volume: number = 0.7;
    private muted: boolean = false;

    constructor() {
        if (typeof window !== 'undefined') {
            this.loadSounds();
            this.loadSettings();
        }
    }

    private loadSounds() {
        const soundFiles: Record<SoundType, string> = {
            correct_basic: '/sounds/ding.mp3',
            correct_combo5: '/sounds/power_up.mp3',
            correct_combo10: '/sounds/epic.mp3',
            correct_combo20: '/sounds/legendary.mp3',
            correct_combo50: '/sounds/mega.mp3',
            incorrect: '/sounds/hmm.mp3',
            levelUp: '/sounds/fanfare.mp3',
            achievementUnlock: '/sounds/unlock.mp3',
            chestOpen: '/sounds/chest_open.mp3',
            coinCollect: '/sounds/coin.mp3',
            click: '/sounds/click.mp3',
            hover: '/sounds/hover.mp3',
        };

        Object.entries(soundFiles).forEach(([key, path]) => {
            const audio = new Audio(path);
            audio.volume = this.volume;
            this.sounds.set(key as SoundType, audio);
        });
    }

    private loadSettings() {
        const savedVolume = localStorage.getItem('sound_volume');
        const savedMuted = localStorage.getItem('sound_muted');

        if (savedVolume) {
            this.volume = parseFloat(savedVolume);
        }
        if (savedMuted) {
            this.muted = savedMuted === 'true';
        }

        this.updateAllVolumes();
    }

    private updateAllVolumes() {
        this.sounds.forEach(audio => {
            audio.volume = this.muted ? 0 : this.volume;
        });
    }

    play(soundType: SoundType) {
        if (this.muted) return;

        const audio = this.sounds.get(soundType);
        if (audio) {
            // Clone audio to allow overlapping sounds
            const clone = audio.cloneNode() as HTMLAudioElement;
            clone.volume = this.volume;
            clone.play().catch(err => console.warn('Sound play failed:', err));
        }
    }

    setVolume(volume: number) {
        this.volume = Math.max(0, Math.min(1, volume));
        this.updateAllVolumes();
        localStorage.setItem('sound_volume', this.volume.toString());
    }

    setMuted(muted: boolean) {
        this.muted = muted;
        this.updateAllVolumes();
        localStorage.setItem('sound_muted', muted.toString());
    }

    toggleMute() {
        this.setMuted(!this.muted);
    }

    getVolume(): number {
        return this.volume;
    }

    isMuted(): boolean {
        return this.muted;
    }

    // Play sound based on combo level
    playComboSound(combo: number) {
        if (combo >= 50) {
            this.play('correct_combo50');
        } else if (combo >= 20) {
            this.play('correct_combo20');
        } else if (combo >= 10) {
            this.play('correct_combo10');
        } else if (combo >= 5) {
            this.play('correct_combo5');
        } else {
            this.play('correct_basic');
        }
    }
}

// Singleton instance
export const soundManager = new SoundManager();

// React hook for sound management
export function useSoundManager() {
    const play = (soundType: SoundType) => soundManager.play(soundType);
    const setVolume = (volume: number) => soundManager.setVolume(volume);
    const setMuted = (muted: boolean) => soundManager.setMuted(muted);
    const toggleMute = () => soundManager.toggleMute();
    const playComboSound = (combo: number) => soundManager.playComboSound(combo);

    return {
        play,
        setVolume,
        setMuted,
        toggleMute,
        playComboSound,
        volume: soundManager.getVolume(),
        isMuted: soundManager.isMuted(),
    };
}
