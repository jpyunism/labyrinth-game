/**
 * Game State Interfaces
 * Since this is a client-side only game, these contracts define the internal API
 * for the game logic and state management.
 */

export interface Level {
  id: number;
  width: number;
  height: number;
  layout: number[][]; // 0: Path, 1: Wall, 2: Start, 3: Goal
  timeLimit: number; // Seconds
  thresholds: {
    3: number;
    2: number;
    1: number;
  };
}

export interface LevelProgress {
  stars: number; // 0-3
  bestTime: number | null; // Seconds
  unlocked: boolean;
}

export interface PlayerProgress {
  levels: Record<number, LevelProgress>;
}

export interface GameState {
  currentLevelId: number | null;
  status: 'MENU' | 'PLAYING' | 'PAUSED' | 'VICTORY' | 'GAMEOVER';
  timer: number;
  player: {
    x: number;
    y: number;
  };
}

/**
 * Core Game Logic Contract
 */
export interface GameEngine {
  loadLevel(levelId: number): void;
  startLevel(): void;
  movePlayer(direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'): void;
  checkWinCondition(): boolean;
  checkTimeLimit(): boolean;
  calculateStars(timeTaken: number): number;
}

/**
 * Storage Contract
 */
export interface StorageManager {
  saveProgress(progress: PlayerProgress): void;
  loadProgress(): PlayerProgress;
  unlockLevel(levelId: number): void;
  updateLevelScore(levelId: number, time: number, stars: number): void;
}
