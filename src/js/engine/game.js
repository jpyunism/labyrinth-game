import { SFX_DEFINITIONS } from "../../assets/audio/sfx-definitions.js";
import { LevelLoader, MAX_LEVELS } from "../levels/loader.js";
import { StorageManager } from "../state/storage.js";
import { audioManager } from "./audio.js";
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
    this.input = new InputHandler((dir) => this.movePlayer(dir), canvas);
    this.callbacks = {
      onWin: callbacks.onWin || (() => {}),
      onLose: callbacks.onLose || (() => {}),
    };

    // Register SFX definitions with audio manager
    audioManager.registerSfxDefinitions(SFX_DEFINITIONS);

    this.state = {
      currentLevelId: null,
      status: "MENU", // MENU, PLAYING, PAUSED, VICTORY, GAMEOVER
      timer: 0,
      moves: 0,
      player: { x: 0, y: 0 },
      currentLevelData: null,
    };

    // Smooth movement interpolation
    this.displayPlayer = { x: 0, y: 0 };
    this.lastDirection = null;
    this.moveSpeed = 12; // cells per second for lerp

    // Trail system
    this.trail = []; // { x, y, alpha }
    this.trailTimer = 0;

    this.lastTime = 0;
    this.animationFrameId = null;
    this._timerWarned = false;
  }

  start() {
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  stop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Main game loop.
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
   * Updates game logic and interpolation.
   */
  update(dt) {
    if (this.state.status === "PLAYING") {
      this.checkTimeLimit(dt);
      this.updateDisplayPlayer(dt);
      this.updateTrail(dt);
    }
  }

  /**
   * Lerp displayPlayer toward logical player position.
   */
  updateDisplayPlayer(dt) {
    const tx = this.state.player.x;
    const ty = this.state.player.y;
    const speed = this.moveSpeed * dt;

    const dx = tx - this.displayPlayer.x;
    const dy = ty - this.displayPlayer.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 0.01) {
      this.displayPlayer.x = tx;
      this.displayPlayer.y = ty;
    } else if (dist > 2) {
      // Snap if too far (e.g. level load)
      this.displayPlayer.x = tx;
      this.displayPlayer.y = ty;
    } else {
      this.displayPlayer.x += dx * Math.min(speed / dist * 3, 1);
      this.displayPlayer.y += dy * Math.min(speed / dist * 3, 1);
    }
  }

  /**
   * Update trail particles — emit from display position and fade existing.
   */
  updateTrail(dt) {
    this.trailTimer += dt;

    // Emit trail particle every ~30ms while moving
    const dx = this.state.player.x - this.displayPlayer.x;
    const dy = this.state.player.y - this.displayPlayer.y;
    const moving = Math.abs(dx) > 0.05 || Math.abs(dy) > 0.05;

    if (moving && this.trailTimer > 0.03) {
      this.trail.push({
        x: this.displayPlayer.x,
        y: this.displayPlayer.y,
        alpha: 0.6,
      });
      this.trailTimer = 0;
    }

    // Fade and remove old particles
    for (let i = this.trail.length - 1; i >= 0; i--) {
      this.trail[i].alpha -= dt * 2.5;
      if (this.trail[i].alpha <= 0) {
        this.trail.splice(i, 1);
      }
    }
  }

  render() {
    this.renderer.clear();

    if (this.state.status === "PLAYING" && this.state.currentLevelData) {
      const timeRatio = this.state.timer / this.state.currentLevelData.timeLimit;
      this.renderer.drawMaze(this.state.currentLevelData, timeRatio);
      this.renderer.drawTrail(this.trail);
      this.renderer.drawPlayer(this.displayPlayer, this.lastDirection, this.state.player);
      this.renderer.drawGoalGlow(this.state.currentLevelData);
      this.renderer.drawVignette(timeRatio);
    }
  }

  loadLevel(levelId) {
    const level = LevelLoader.getLevel(levelId);
    if (!level) return;

    this.state.currentLevelId = levelId;
    this.state.currentLevelData = level;
    this.state.status = "PLAYING";
    this.state.timer = 0;
    this.state.moves = 0;
    this._timerWarned = false;
    this.trail = [];
    this.lastDirection = null;

    // Find start position
    for (let y = 0; y < level.height; y++) {
      for (let x = 0; x < level.width; x++) {
        if (level.layout[y][x] === 2) {
          this.state.player = { x, y };
          this.displayPlayer = { x, y };
          break;
        }
      }
    }

    this.renderer.calculateLayout(level);
  }

  movePlayer(direction) {
    if (this.state.status !== "PLAYING") return;

    // Block input while still animating a previous move
    const dx = Math.abs(this.state.player.x - this.displayPlayer.x);
    const dy = Math.abs(this.state.player.y - this.displayPlayer.y);
    if (dx > 0.3 || dy > 0.3) return;

    const { x, y } = this.state.player;
    let newX = x;
    let newY = y;

    switch (direction) {
      case "UP":    newY--; break;
      case "DOWN":  newY++; break;
      case "LEFT":  newX--; break;
      case "RIGHT": newX++; break;
    }

    // Check bounds
    if (
      newX < 0 || newX >= this.state.currentLevelData.width ||
      newY < 0 || newY >= this.state.currentLevelData.height
    ) {
      return;
    }

    // Check collision (1 is Wall)
    if (this.state.currentLevelData.layout[newY][newX] === 1) {
      audioManager.playSfx("hit_wall");
      this.renderer.shake();
      return;
    }

    this.lastDirection = direction;
    this.state.player = { x: newX, y: newY };
    this.state.moves++;
    audioManager.playSfx("jump");
    this.checkWinCondition();
  }

  calculateStars() {
    const minMoves = this.state.currentLevelData.minMoves;
    const moves = this.state.moves;
    if (minMoves <= 0) return 1;
    if (moves <= minMoves) return 3;
    if (moves <= Math.floor(minMoves * 1.5)) return 2;
    return 1;
  }

  checkWinCondition() {
    const { x, y } = this.state.player;
    if (this.state.currentLevelData.layout[y][x] === 3) {
      this.state.status = "VICTORY";
      audioManager.playSfx("level_complete");

      const stars = this.calculateStars();
      for (let i = 0; i < stars; i++) {
        setTimeout(() => audioManager.playSfx("star"), i * 200);
      }

      this.storage.updateLevelScore(
        this.state.currentLevelId,
        this.state.timer,
        stars,
        this.state.moves
      );

      const nextLevelId = this.state.currentLevelId + 1;
      if (nextLevelId <= MAX_LEVELS) {
        this.storage.unlockLevel(nextLevelId);
      }

      this.callbacks.onWin({
        levelId: this.state.currentLevelId,
        time: this.state.timer * 1000,
        stars: stars,
        moves: this.state.moves,
        minMoves: this.state.currentLevelData.minMoves,
      });
    }
  }

  checkTimeLimit(dt) {
    this.state.timer += dt;
    const timeLimit = this.state.currentLevelData.timeLimit;
    const remaining = timeLimit - this.state.timer;

    if (!this._timerWarned && remaining <= timeLimit * 0.25 && remaining > 0) {
      audioManager.playSfx("timer_warning");
      this._timerWarned = true;
    }

    if (this.state.timer >= timeLimit) {
      this.state.status = "GAMEOVER";
      audioManager.playSfx("game_over");
      this.callbacks.onLose({ reason: "Time Limit Exceeded" });
    }
  }
}
