import { audioManager } from "../engine/audio.js";

/**
 * SettingsUI - Manages the audio settings interface.
 */
export class SettingsUI {
  constructor() {
    this.modal = document.getElementById("settings-modal");
    this.overlay = document.getElementById("modal-overlay");
    this.settingsBtn = document.getElementById("settings-btn");
    this.closeBtn = document.getElementById("settings-close-btn");

    this.musicVolumeSlider = document.getElementById("music-volume");
    this.musicVolumeValue = document.getElementById("music-volume-value");
    this.sfxVolumeSlider = document.getElementById("sfx-volume");
    this.sfxVolumeValue = document.getElementById("sfx-volume-value");
    this.muteToggle = document.getElementById("mute-toggle");

    this.init();
  }

  init() {
    // Load current settings
    const settings = audioManager.getSettings();
    this.updateUI(settings);

    // Event listeners
    this.settingsBtn.addEventListener("click", () => this.show());
    this.closeBtn.addEventListener("click", () => this.hide());

    this.musicVolumeSlider.addEventListener("input", (e) => {
      const volume = parseInt(e.target.value) / 100;
      audioManager.setVolume("music", volume);
      this.musicVolumeValue.textContent = `${e.target.value}%`;
    });

    let lastSfxTest = 0;
    this.sfxVolumeSlider.addEventListener("input", (e) => {
      const volume = parseInt(e.target.value) / 100;
      audioManager.setVolume("sfx", volume);
      this.sfxVolumeValue.textContent = `${e.target.value}%`;

      // Throttled test sound (max once per 200ms)
      const now = Date.now();
      if (now - lastSfxTest > 200) {
        audioManager.playSfx("click");
        lastSfxTest = now;
      }
    });

    this.muteToggle.addEventListener("change", (e) => {
      audioManager.setMuted(e.target.checked);
    });
  }

  updateUI(settings) {
    this.musicVolumeSlider.value = Math.round(settings.musicVolume * 100);
    this.musicVolumeValue.textContent = `${Math.round(
      settings.musicVolume * 100
    )}%`;

    this.sfxVolumeSlider.value = Math.round(settings.sfxVolume * 100);
    this.sfxVolumeValue.textContent = `${Math.round(
      settings.sfxVolume * 100
    )}%`;

    this.muteToggle.checked = settings.isMuted;
  }

  show() {
    // Refresh UI with current settings
    const settings = audioManager.getSettings();
    this.updateUI(settings);

    this.overlay.classList.remove("hidden");
    this.modal.classList.remove("hidden");
  }

  hide() {
    this.modal.classList.add("hidden");

    // Check if other modals are showing
    const victoryModal = document.getElementById("victory-modal");
    const gameOverModal = document.getElementById("game-over-modal");

    if (
      victoryModal.classList.contains("hidden") &&
      gameOverModal.classList.contains("hidden")
    ) {
      this.overlay.classList.add("hidden");
    }
  }
}
