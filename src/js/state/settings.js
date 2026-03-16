/**
 * Manages audio settings persistence using localStorage.
 */
export class SettingsStore {
  constructor(storageKey = "maze_game_audio_settings") {
    this.storageKey = storageKey;
  }

  /**
   * Loads audio settings from storage.
   * Returns default settings if none exist.
   * @returns {Object} AudioSettings
   */
  load() {
    const defaults = { musicVolume: 0.5, sfxVolume: 0.8, isMuted: false };
    try {
      const serialized = localStorage.getItem(this.storageKey);
      if (serialized) {
        const data = JSON.parse(serialized);
        if (data && typeof data === "object") {
          return {
            musicVolume: typeof data.musicVolume === "number"
              ? Math.max(0, Math.min(1, data.musicVolume)) : defaults.musicVolume,
            sfxVolume: typeof data.sfxVolume === "number"
              ? Math.max(0, Math.min(1, data.sfxVolume)) : defaults.sfxVolume,
            isMuted: typeof data.isMuted === "boolean"
              ? data.isMuted : defaults.isMuted,
          };
        }
      }
    } catch (e) {
      console.error("Failed to load audio settings:", e);
    }
    return defaults;
  }

  /**
   * Saves audio settings to storage.
   * @param {Object} settings - The AudioSettings object
   */
  save(settings) {
    try {
      const serialized = JSON.stringify(settings);
      localStorage.setItem(this.storageKey, serialized);
    } catch (e) {
      console.error("Failed to save audio settings:", e);
    }
  }
}
