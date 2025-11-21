import { LevelLoader } from "../levels/loader.js";
import { StorageManager } from "../state/storage.js";
import { InputHandler } from "./input.js";
import { Renderer } from "./renderer.js";

/**
 * Main Game Controller.
 * Manages the game loop, state, and logic.
 */
export class Game {
  constructor(canvas, callbacks = {}) {
    this.canvas = canvas;
    this.renderer = new Renderer(canvas);
    this.storage = new StorageManager();
    this.input = new InputHandler((dir) => this.movePlayer(dir));
    this.callbacks = {
      onWin: callbacks.onWin || (() => {}),
      onLose: callbacks.onLose || (() => {}),
    };

    this.state = {
      currentLevelId: null,
      status: "MENU", // MENU, PLAYING, PAUSED, VICTORY, GAMEOVER
      timer: 0,
      player: { x: 0, y: 0 },
      currentLevelData: null,
      startTime: 0,
    };

    this.lastTime = 0;
    this.animationFrameId = null;
  }

  /**
   * Starts the game loop.
   */
  start() {
    this.state.startTime = Date.now();
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  /**
   * Stops the game loop.
   */
  stop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Main game loop.
   * @param {number} timestamp
   */
  loop(timestamp) {
    if (this.state.status !== "PLAYING") return;

    const deltaTime = (timestamp - this.lastTime) / 1000;
    this.lastTime = timestamp;

    this.update(deltaTime);
    this.render();

    this.animationFrameId = requestAnimationFrame((ts) => this.loop(ts));
  }

  /**
   * Updates game logic.
   * @param {number} dt - Delta time in seconds.
   */
  update(dt) {
    if (this.state.status === "PLAYING") {
      this.checkTimeLimit(dt);
    }
  }

  /**
   * Renders the game.
   */
  render() {
    this.renderer.clear();

    if (this.state.status === "PLAYING" && this.state.currentLevelData) {
      this.renderer.drawMaze(this.state.currentLevelData);
      this.renderer.drawPlayer(this.state.player);
      this.renderer.drawUI(this.state);
    }
  }

  /**
   * Loads and starts a specific level.
   * @param {number} levelId
   */
  loadLevel(levelId) {
    const level = LevelLoader.getLevel(levelId);
    if (!level) return;

    this.state.currentLevelId = levelId;
    this.state.currentLevelData = level;
    this.state.status = "PLAYING";
    this.state.timer = 0;

    // Find start position
    for (let y = 0; y < level.height; y++) {
      for (let x = 0; x < level.width; x++) {
        if (level.layout[y][x] === 2) {
          // 2 is Start
          this.state.player = { x, y };
          break;
        }
      }
    }

    this.renderer.calculateLayout(level);
  }

  /**
   * Handles player movement.
   * @param {string} direction - 'UP', 'DOWN', 'LEFT', 'RIGHT'
   */
  movePlayer(direction) {
    if (this.state.status !== "PLAYING") return;

    const { x, y } = this.state.player;
    let newX = x;
    let newY = y;

    switch (direction) {
      case "UP":
        newY--;
        break;
      case "DOWN":
        newY++;
        break;
      case "LEFT":
        newX--;
        break;
      case "RIGHT":
        newX++;
        break;
    }

    // Check bounds
    if (
      newX < 0 ||
      newX >= this.state.currentLevelData.width ||
      newY < 0 ||
      newY >= this.state.currentLevelData.height
    ) {
      return;
    }

    // Check collision (1 is Wall)
    if (this.state.currentLevelData.layout[newY][newX] === 1) {
      return;
    }

    // Move player
    this.state.player = { x: newX, y: newY };

    // Check win
    this.checkWinCondition();
  }

  /**
   * Calculates stars based on time taken.
   * @param {number} timeTaken
   * @returns {number} Stars (1-3)
   */
  calculateStars(timeTaken) {
    const thresholds = this.state.currentLevelData.thresholds;
    if (timeTaken <= thresholds[3]) return 3;
    if (timeTaken <= thresholds[2]) return 2;
    return 1;
  }

  checkWinCondition() {
    const { x, y } = this.state.player;
    // 3 is Goal
    if (this.state.currentLevelData.layout[y][x] === 3) {
      this.state.status = "VICTORY";
      console.log("Victory!");

      const stars = this.calculateStars(this.state.timer);

      // Save progress
      this.storage.updateLevelScore(
        this.state.currentLevelId,
        this.state.timer,
        stars
      );

      // Unlock next level
      const nextLevelId = this.state.currentLevelId + 1;
      if (nextLevelId <= 100) {
        // Assuming 100 levels
        this.storage.unlockLevel(nextLevelId);
      }

      this.callbacks.onWin({
        levelId: this.state.currentLevelId,
        time: this.state.timer * 1000, // Convert back to ms for display consistency if needed
        stars: stars,
      });
    }
  }

  checkTimeLimit(dt) {
    this.state.timer += dt;
    if (this.state.timer >= this.state.currentLevelData.timeLimit) {
      this.state.status = "GAMEOVER";
      console.log("Game Over - Time Limit Exceeded");
      this.callbacks.onLose({
        reason: "Time Limit Exceeded",
      });
    }
  }
}
