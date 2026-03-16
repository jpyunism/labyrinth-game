/**
 * Interface for the Audio Manager service.
 * Responsible for handling all audio playback and volume control.
 */
export interface IAudioManager {
    /**
     * Initializes the audio context.
     * Must be called after a user interaction to unlock audio.
     */
    init(): Promise<void>;

    /**
     * Plays a sound effect.
     * @param id - The unique identifier of the SFX to play.
     */
    playSfx(id: string): void;

    /**
     * Plays a music track.
     * @param id - The unique identifier of the music track.
     * @param loop - Whether to loop the track (default: true).
     */
    playMusic(id: string, loop?: boolean): void;

    /**
     * Stops the currently playing music.
     * @param fadeOutDuration - Duration in seconds to fade out.
     */
    stopMusic(fadeOutDuration?: number): void;

    /**
     * Sets the volume for a specific category.
     * @param category - 'music' or 'sfx'.
     * @param volume - Normalized volume (0.0 to 1.0).
     */
    setVolume(category: 'music' | 'sfx', volume: number): void;

    /**
     * Toggles global mute.
     * @param muted - Whether audio should be muted.
     */
    setMuted(muted: boolean): void;
}

/**
 * Interface for the Settings Store.
 * Responsible for persisting and retrieving user preferences.
 */
export interface ISettingsStore {
    /**
     * Loads settings from storage.
     */
    load(): AudioSettings;

    /**
     * Saves settings to storage.
     * @param settings - The settings object to save.
     */
    save(settings: AudioSettings): void;
}

export interface AudioSettings {
    musicVolume: number;
    sfxVolume: number;
    isMuted: boolean;
}
