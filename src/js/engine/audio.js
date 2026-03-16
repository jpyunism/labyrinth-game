import { SettingsStore } from "../state/settings.js";
import { zzfx, zzfxV, zzfxX } from "../lib/zzfx.js";

// Note frequencies (Hz) for C pentatonic scale
const NOTE = {
  C3: 130.81,
  D3: 146.83,
  E3: 164.81,
  G3: 196.0,
  A3: 220.0,
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  G4: 392.0,
  A4: 440.0,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  REST: 0,
};

/**
 * Track definitions for procedural music.
 * Each track has a tempo (BPM) and note sequences for lead and bass voices.
 * A REST (0) means silence for that beat.
 */
const TRACKS = {
  gameplay: {
    tempo: 130,
    lead: [
      NOTE.E4,
      NOTE.G4,
      NOTE.A4,
      NOTE.G4,
      NOTE.E4,
      NOTE.REST,
      NOTE.D4,
      NOTE.C4,
      NOTE.D4,
      NOTE.E4,
      NOTE.G4,
      NOTE.REST,
      NOTE.A4,
      NOTE.G4,
      NOTE.E4,
      NOTE.D4,
      NOTE.C4,
      NOTE.REST,
      NOTE.D4,
      NOTE.E4,
      NOTE.G4,
      NOTE.A4,
      NOTE.C5,
      NOTE.A4,
      NOTE.G4,
      NOTE.E4,
      NOTE.D4,
      NOTE.REST,
      NOTE.C4,
      NOTE.D4,
      NOTE.E4,
      NOTE.REST,
    ],
    bass: [
      NOTE.C3,
      NOTE.C3,
      NOTE.REST,
      NOTE.C3,
      NOTE.G3,
      NOTE.G3,
      NOTE.REST,
      NOTE.G3,
      NOTE.A3,
      NOTE.A3,
      NOTE.REST,
      NOTE.A3,
      NOTE.E3,
      NOTE.E3,
      NOTE.REST,
      NOTE.E3,
      NOTE.C3,
      NOTE.C3,
      NOTE.REST,
      NOTE.C3,
      NOTE.G3,
      NOTE.G3,
      NOTE.REST,
      NOTE.G3,
      NOTE.D3,
      NOTE.D3,
      NOTE.REST,
      NOTE.D3,
      NOTE.C3,
      NOTE.C3,
      NOTE.REST,
      NOTE.C3,
    ],
  },
};

/**
 * AudioManager - Handles all audio playback and volume control.
 * Uses the shared ZzFX AudioContext (zzfxX) for both music and SFX.
 */
export class AudioManager {
  constructor() {
    this.audioContext = null;
    this.musicGainNode = null;
    this.settingsStore = new SettingsStore();
    this.settings = this.settingsStore.load();
    this.initialized = false;
    this.sfxDefinitions = {};

    // Procedural music state
    this.musicPlaying = false;
    this.musicSchedulerId = null;
    this.leadOscillator = null;
    this.bassOscillator = null;
    this.leadGain = null;
    this.bassGain = null;
    this.currentTrack = null;
    this.nextNoteTime = 0;
    this.leadIndex = 0;
    this.bassIndex = 0;
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
   * Starts procedural music playback.
   * @param {string} trackId - The track to play (e.g. "gameplay")
   */
  playMusic(trackId) {
    if (!this.initialized) {
      console.warn("AudioManager not initialized");
      return;
    }

    // Stop current music if playing
    this.stopMusic();

    if (this.settings.isMuted) {
      return;
    }

    const track = TRACKS[trackId];
    if (!track) {
      console.warn(`Music track "${trackId}" not found`);
      return;
    }

    try {
      this.currentTrack = track;
      this.leadIndex = 0;
      this.bassIndex = 0;

      const beatDuration = 60 / track.tempo;

      // Create lead oscillator (square wave)
      this.leadOscillator = this.audioContext.createOscillator();
      this.leadOscillator.type = "square";
      this.leadGain = this.audioContext.createGain();
      this.leadGain.gain.value = 0; // start silent
      this.leadOscillator.connect(this.leadGain);
      this.leadGain.connect(this.musicGainNode);
      this.leadOscillator.start();

      // Create bass oscillator (triangle wave)
      this.bassOscillator = this.audioContext.createOscillator();
      this.bassOscillator.type = "triangle";
      this.bassGain = this.audioContext.createGain();
      this.bassGain.gain.value = 0; // start silent
      this.bassOscillator.connect(this.bassGain);
      this.bassGain.connect(this.musicGainNode);
      this.bassOscillator.start();

      this.musicPlaying = true;
      this.nextNoteTime = this.audioContext.currentTime;

      // Look-ahead scheduler: runs every 25ms, schedules notes 100ms ahead
      this.musicSchedulerId = setInterval(() => {
        this._scheduleNotes(beatDuration);
      }, 25);
    } catch (error) {
      console.error("Failed to start music:", error);
    }
  }

  /**
   * Schedules upcoming notes for the procedural music.
   * @param {number} beatDuration - Duration of one beat in seconds
   * @private
   */
  _scheduleNotes(beatDuration) {
    if (!this.musicPlaying || !this.currentTrack) return;

    const lookAhead = 0.1; // schedule 100ms into the future
    const noteLength = beatDuration * 0.7; // note duration (70% of beat, 30% gap)

    while (this.nextNoteTime < this.audioContext.currentTime + lookAhead) {
      const track = this.currentTrack;

      // Schedule lead note
      const leadFreq = track.lead[this.leadIndex % track.lead.length];
      if (leadFreq > 0) {
        this.leadOscillator.frequency.setValueAtTime(
          leadFreq,
          this.nextNoteTime
        );
        this.leadGain.gain.setValueAtTime(0.15, this.nextNoteTime);
        this.leadGain.gain.setValueAtTime(
          0,
          this.nextNoteTime + noteLength
        );
      } else {
        this.leadGain.gain.setValueAtTime(0, this.nextNoteTime);
      }

      // Schedule bass note
      const bassFreq = track.bass[this.bassIndex % track.bass.length];
      if (bassFreq > 0) {
        this.bassOscillator.frequency.setValueAtTime(
          bassFreq,
          this.nextNoteTime
        );
        this.bassGain.gain.setValueAtTime(0.2, this.nextNoteTime);
        this.bassGain.gain.setValueAtTime(
          0,
          this.nextNoteTime + noteLength
        );
      } else {
        this.bassGain.gain.setValueAtTime(0, this.nextNoteTime);
      }

      this.leadIndex++;
      this.bassIndex++;
      this.nextNoteTime += beatDuration;
    }
  }

  /**
   * Stops the currently playing music.
   * @param {number} fadeOutDuration - Duration in seconds to fade out (default: 0)
   */
  stopMusic(fadeOutDuration = 0) {
    if (!this.musicPlaying) {
      return;
    }

    try {
      // Clear the scheduler
      if (this.musicSchedulerId) {
        clearInterval(this.musicSchedulerId);
        this.musicSchedulerId = null;
      }

      const cleanup = () => {
        if (this.leadOscillator) {
          this.leadOscillator.stop();
          this.leadOscillator.disconnect();
          this.leadOscillator = null;
        }
        if (this.bassOscillator) {
          this.bassOscillator.stop();
          this.bassOscillator.disconnect();
          this.bassOscillator = null;
        }
        if (this.leadGain) {
          this.leadGain.disconnect();
          this.leadGain = null;
        }
        if (this.bassGain) {
          this.bassGain.disconnect();
          this.bassGain = null;
        }
        this.musicPlaying = false;
        this.currentTrack = null;

        // Restore music gain after fade
        if (this.musicGainNode) {
          this.musicGainNode.gain.cancelScheduledValues(
            this.audioContext.currentTime
          );
          this.musicGainNode.gain.value = this.settings.isMuted
            ? 0
            : this.settings.musicVolume;
        }
      };

      if (fadeOutDuration > 0) {
        const currentTime = this.audioContext.currentTime;
        this.musicGainNode.gain.linearRampToValueAtTime(
          0,
          currentTime + fadeOutDuration
        );
        setTimeout(cleanup, fadeOutDuration * 1000);
      } else {
        cleanup();
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
      if (this.musicGainNode && !this.settings.isMuted) {
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
