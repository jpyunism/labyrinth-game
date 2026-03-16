import { INITIAL_PROGRESS, createLevelProgress } from "./progress.js";

/**
 * Manages persistence of game state using localStorage.
 */
export class StorageManager {
  constructor(storageKey = "maze_game_progress") {
    this.storageKey = storageKey;
  }

  /**
   * Saves the entire player progress object.
   * @param {Object} progress - The PlayerProgress object.
   */
  saveProgress(progress) {
    try {
      const serialized = JSON.stringify(progress);
      localStorage.setItem(this.storageKey, serialized);
    } catch (e) {
      console.error("Failed to save progress:", e);
    }
  }

  /**
   * Loads player progress from storage.
   * Returns default initial state if no save exists.
   * @returns {Object} PlayerProgress
   */
  loadProgress() {
    try {
      const serialized = localStorage.getItem(this.storageKey);
      if (serialized) {
        const data = JSON.parse(serialized);
        if (data && typeof data === "object" && typeof data.levels === "object") {
          return data;
        }
      }
    } catch (e) {
      console.error("Failed to load progress:", e);
    }

    return JSON.parse(JSON.stringify(INITIAL_PROGRESS));
  }

  /**
   * Unlocks a specific level.
   * @param {number} levelId
   */
  unlockLevel(levelId) {
    const progress = this.loadProgress();
    if (!progress.levels[levelId]) {
      progress.levels[levelId] = createLevelProgress();
      progress.levels[levelId].unlocked = true;
    } else {
      progress.levels[levelId].unlocked = true;
    }
    this.saveProgress(progress);
  }

  /**
   * Updates score for a level.
   * @param {number} levelId
   * @param {number} time
   * @param {number} stars
   */
  updateLevelScore(levelId, time, stars) {
    const progress = this.loadProgress();

    // Ensure level entry exists
    if (!progress.levels[levelId]) {
      progress.levels[levelId] = createLevelProgress();
      progress.levels[levelId].unlocked = true;
    }

    const levelData = progress.levels[levelId];

    // Update stars if better
    if (stars > levelData.stars) {
      levelData.stars = stars;
    }

    // Update time if better (lower is better) or if no time set yet
    if (levelData.bestTime === null || time < levelData.bestTime) {
      levelData.bestTime = time;
    }

    this.saveProgress(progress);
  }
}
