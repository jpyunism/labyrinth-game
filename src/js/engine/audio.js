import { SettingsStore } from "../state/settings.js";
import { zzfx, zzfxV, zzfxX } from "../lib/zzfx.js";

/**
 * AudioManager - Handles all audio playback and volume control.
 * Uses the shared ZzFX AudioContext (zzfxX) for both music and SFX.
 */
export class AudioManager {
  constructor() {
    this.audioContext = null;
    this.musicGainNode = null;
    this.currentMusicSource = null;
    this.musicBufferCache = new Map();
    this.settingsStore = new SettingsStore();
    this.settings = this.settingsStore.load();
    this.initialized = false;
    this.sfxDefinitions = {};
  }

  /**
   * Initializes the audio context.
   * Must be called after a user interaction to unlock audio.
   * @returns {Promise<void>}
   */
  async init() {
    if (this.initialized) {
      return;
    }

    try {
      // Use the shared ZzFX AudioContext
      this.audioContext = zzfxX;

      // Resume context if suspended (browser autoplay policy)
      if (this.audioContext.state === "suspended") {
        await this.audioContext.resume();
      }

      // Create gain node for music volume control
      this.musicGainNode = this.audioContext.createGain();
      this.musicGainNode.connect(this.audioContext.destination);

      // Apply saved settings
      this.applySettings();

      this.initialized = true;
      console.log("AudioManager initialized");
    } catch (error) {
      console.error("Failed to initialize AudioManager:", error);
    }
  }

  /**
   * Registers SFX definitions (ZzFX parameters).
   * @param {Object} definitions - Object with sound IDs as keys and parameter arrays as values
   */
  registerSfxDefinitions(definitions) {
    this.sfxDefinitions = { ...this.sfxDefinitions, ...definitions };
  }

  /**
   * Plays a sound effect using ZzFX.
   * @param {string} id - The unique identifier of the SFX
   */
  playSfx(id) {
    if (!this.initialized || this.settings.isMuted) {
      return;
    }

    const params = this.sfxDefinitions[id];
    if (!params) {
      console.warn(`SFX "${id}" not found`);
      return;
    }

    try {
      // Temporarily set zzfxV to the user's SFX volume, then restore
      const savedVolume = zzfxV;
      window.zzfxV = this.settings.sfxVolume;
      zzfx(...params);
      window.zzfxV = savedVolume;
    } catch (error) {
      console.error(`Failed to play SFX "${id}":`, error);
    }
  }

  /**
   * Plays a music track.
   * @param {string} id - The unique identifier of the music track
   * @param {boolean} loop - Whether to loop the track (default: true)
   */
  async playMusic(id, loop = true) {
    if (!this.initialized) {
      console.warn("AudioManager not initialized");
      return;
    }

    // Stop current music if playing
    this.stopMusic();

    if (this.settings.isMuted) {
      return;
    }

    try {
      // Check cache first
      let audioBuffer = this.musicBufferCache.get(id);
      if (!audioBuffer) {
        // Load from public directory (works in both dev and production)
        const response = await fetch(`/audio/music/${id}.mp3`);
        if (!response.ok) {
          console.warn(`Music file "${id}.mp3" not found`);
          return;
        }
        const arrayBuffer = await response.arrayBuffer();
        audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
        this.musicBufferCache.set(id, audioBuffer);
      }

      // Create source
      this.currentMusicSource = this.audioContext.createBufferSource();
      this.currentMusicSource.buffer = audioBuffer;
      this.currentMusicSource.loop = loop;

      // Connect through gain node
      this.currentMusicSource.connect(this.musicGainNode);

      // Start playback
      this.currentMusicSource.start(0);
    } catch (error) {
      console.error(`Failed to play music "${id}":`, error);
    }
  }

  /**
   * Stops the currently playing music.
   * @param {number} fadeOutDuration - Duration in seconds to fade out (default: 0)
   */
  stopMusic(fadeOutDuration = 0) {
    if (!this.currentMusicSource) {
      return;
    }

    try {
      if (fadeOutDuration > 0) {
        const currentTime = this.audioContext.currentTime;
        this.musicGainNode.gain.linearRampToValueAtTime(
          0,
          currentTime + fadeOutDuration
        );
        setTimeout(() => {
          if (this.currentMusicSource) {
            this.currentMusicSource.stop();
            this.currentMusicSource = null;
          }
          // Restore gain
          this.musicGainNode.gain.value = this.settings.musicVolume;
        }, fadeOutDuration * 1000);
      } else {
        this.currentMusicSource.stop();
        this.currentMusicSource = null;
      }
    } catch (error) {
      console.error("Failed to stop music:", error);
    }
  }

  /**
   * Sets the volume for a specific category.
   * @param {'music' | 'sfx'} category
   * @param {number} volume - Normalized volume (0.0 to 1.0)
   */
  setVolume(category, volume) {
    volume = Math.max(0, Math.min(1, volume));

    if (category === "music") {
      this.settings.musicVolume = volume;
      if (this.musicGainNode) {
        this.musicGainNode.gain.value = volume;
      }
    } else if (category === "sfx") {
      this.settings.sfxVolume = volume;
    }

    this.settingsStore.save(this.settings);
  }

  /**
   * Toggles global mute.
   * @param {boolean} muted
   */
  setMuted(muted) {
    this.settings.isMuted = muted;

    if (muted) {
      if (this.musicGainNode) {
        this.musicGainNode.gain.value = 0;
      }
    } else {
      this.applySettings();
    }

    this.settingsStore.save(this.settings);
  }

  /**
   * Applies current settings to gain nodes.
   */
  applySettings() {
    if (this.musicGainNode) {
      this.musicGainNode.gain.value = this.settings.isMuted
        ? 0
        : this.settings.musicVolume;
    }
  }

  /**
   * Gets current settings.
   * @returns {Object} Current audio settings
   */
  getSettings() {
    return { ...this.settings };
  }
}

// Create singleton instance
export const audioManager = new AudioManager();
