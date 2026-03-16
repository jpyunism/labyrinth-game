import "../css/styles.css";
import { audioManager } from "./engine/audio.js";
import { Game } from "./engine/game.js";
import { MAX_LEVELS } from "./levels/loader.js";
import { LevelSelect } from "./ui/level-select.js";
import { SettingsUI } from "./ui/settings.js";

console.log("Maze Game Levels initialized");

window.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("game-canvas");

  // UI Elements
  const levelSelectScreen = document.getElementById("level-select-screen");
  const gameHud = document.getElementById("game-hud");
  const levelDisplay = document.getElementById("level-display");
  const timerDisplay = document.getElementById("timer-display");
  const backBtn = document.getElementById("back-btn");

  // Modals
  const modalOverlay = document.getElementById("modal-overlay");
  const victoryModal = document.getElementById("victory-modal");
  const gameOverModal = document.getElementById("game-over-modal");

  // Modal Buttons
  const nextLevelBtn = document.getElementById("next-level-btn");
  const menuBtn = document.getElementById("menu-btn");
  const retryBtn = document.getElementById("retry-btn");
  const menuBtnFail = document.getElementById("menu-btn-fail");

  if (canvas) {
    // Resize canvas to fill viewport
    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      if (game && game.state.currentLevelData) {
        game.renderer.calculateLayout(game.state.currentLevelData);
      }
    }
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const game = new Game(canvas, {
      onWin: (data) => {
        showVictory(data.stars, data.time);
      },
      onLose: (data) => {
        showGameOver();
      },
    });
    let currentLevelId = 1;

    let resizeTimeout;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(resizeCanvas, 150);
    });

    // Audio unlock overlay
    const audioUnlockOverlay = document.getElementById("audio-unlock-overlay");

    const levelSelect = new LevelSelect(
      "level-select-screen",
      async (levelId) => {
        // Initialize audio on first user interaction
        if (!audioManager.initialized) {
          await audioManager.init();

          // Check if audio context is still suspended (autoplay policy)
          if (
            audioManager.audioContext &&
            audioManager.audioContext.state === "suspended"
          ) {
            // Show unlock overlay
            audioUnlockOverlay.classList.remove("hidden");

            // Wait for user to click
            await new Promise((resolve) => {
              const clickHandler = async () => {
                await audioManager.audioContext.resume();
                audioUnlockOverlay.classList.add("hidden");
                document.removeEventListener("click", clickHandler);
                resolve();
              };
              document.addEventListener("click", clickHandler);
            });
          }

          // Load saved settings after initialization
          const settings = audioManager.getSettings();
          audioManager.setVolume("music", settings.musicVolume);
          audioManager.setVolume("sfx", settings.sfxVolume);
          audioManager.setMuted(settings.isMuted);
        }
        startGame(levelId);
      }
    );

    // Initialize settings UI
    const settingsUI = new SettingsUI();

    // Initial render
    levelSelect.render();

    // Event Listeners
    backBtn.addEventListener("click", showLevelSelect);

    nextLevelBtn.addEventListener("click", () => {
      const nextLevel = currentLevelId + 1;
      if (nextLevel <= MAX_LEVELS) {
        startGame(nextLevel);
      } else {
        showLevelSelect();
      }
    });

    menuBtn.addEventListener("click", showLevelSelect);
    menuBtnFail.addEventListener("click", showLevelSelect);
    retryBtn.addEventListener("click", () => startGame(currentLevelId));

    function startGame(levelId) {
      currentLevelId = levelId;
      levelSelect.hide();
      gameHud.classList.remove("hidden");
      hideModals();
      game.loadLevel(levelId);
      game.start();
      updateHud();

      // Start background music
      audioManager.playMusic("gameplay");

      // Start HUD update loop
      requestAnimationFrame(hudLoop);
    }

    function showLevelSelect() {
      game.stop(); // Ensure game loop stops
      gameHud.classList.add("hidden");
      hideModals();
      levelSelect.render();

      // Stop music when returning to menu
      audioManager.stopMusic(0.5);
    }

    function hideModals() {
      modalOverlay.classList.add("hidden");
      victoryModal.classList.add("hidden");
      gameOverModal.classList.add("hidden");
    }

    function showVictory(stars, time) {
      modalOverlay.classList.remove("hidden");
      victoryModal.classList.remove("hidden");

      const starsDisplay = victoryModal.querySelector(".stars-display");
      starsDisplay.textContent = "★".repeat(stars);

      const timeResult = victoryModal.querySelector(".time-result");
      timeResult.textContent = (time / 1000).toFixed(1) + "s";
    }

    function showGameOver() {
      modalOverlay.classList.remove("hidden");
      gameOverModal.classList.remove("hidden");
    }

    function updateHud() {
      levelDisplay.textContent = `Level: ${currentLevelId}`;
    }

    function hudLoop() {
      if (game.state.status === "PLAYING") {
        const seconds = Math.floor(game.state.timer);
        const tenths = Math.floor((game.state.timer % 1) * 10);
        timerDisplay.textContent = `Time: ${seconds}.${tenths}`;

        requestAnimationFrame(hudLoop);
      }
    }

  }
});
