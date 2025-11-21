import "../css/styles.css";
import { Game } from "./engine/game.js";
import { LevelSelect } from "./ui/level-select.js";

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
    // Resize canvas
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

    const levelSelect = new LevelSelect("level-select-screen", (levelId) => {
      startGame(levelId);
    });

    // Initial render
    levelSelect.render();

    // Event Listeners
    backBtn.addEventListener("click", showLevelSelect);

    nextLevelBtn.addEventListener("click", () => {
      const nextLevel = currentLevelId + 1;
      if (nextLevel <= 100) {
        // Check max levels
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

      // Start HUD update loop
      requestAnimationFrame(hudLoop);
    }

    function showLevelSelect() {
      game.stop(); // Ensure game loop stops
      gameHud.classList.add("hidden");
      hideModals();
      levelSelect.render();
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
        const elapsed = Date.now() - game.state.startTime;
        const seconds = Math.floor(elapsed / 1000);
        const ms = Math.floor((elapsed % 1000) / 100);
        timerDisplay.textContent = `Time: ${seconds}.${ms}`;

        requestAnimationFrame(hudLoop);
      } else if (game.state.status === "WON") {
        // Game just finished
        // We need a way to detect the transition.
        // Ideally Game class should emit events, but for now we can check status.
        // However, this loop runs constantly. We should only show modal once.
      }
    }

    // Hook into Game's checkWinCondition or add a callback
    // Since we can't easily modify Game to emit events without changing it,
    // let's modify Game to accept callbacks or check status in the game loop.
    // Actually, Game.js has a loop. Let's see if we can override the onWin/onLose behavior
    // or if we need to modify Game.js.

    // Checking Game.js... it probably just sets status.
    // Let's modify Game.js to accept callbacks for win/loss.
  }
});
