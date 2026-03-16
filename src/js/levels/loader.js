import { LEVELS } from "./data.js";

export const MAX_LEVELS = 200;

/**
 * Utility to load level data.
 */
export class LevelLoader {
  /**
   * Retrieves configuration for a specific level.
   * @param {number} levelId
   * @returns {Object|null} Level configuration or null if not found.
   */
  static getLevel(levelId) {
    if (LEVELS && LEVELS[levelId]) {
      return JSON.parse(JSON.stringify(LEVELS[levelId])); // Return deep copy
    }

    if (levelId > 0 && levelId <= MAX_LEVELS) {
      return this.generateProceduralLevel(levelId);
    }

    console.warn(`Level ${levelId} not found.`);
    return null;
  }

  /**
   * Returns the total number of available levels.
   * @returns {number}
   */
  static getTotalLevels() {
    return MAX_LEVELS;
  }

  /**
   * Generates a procedural level.
   * @param {number} levelId
   * @returns {Object}
   */
  static generateProceduralLevel(levelId) {
    // Increase size and complexity with level ID
    const width = Math.min(30, 10 + Math.floor(levelId / 5));
    const height = Math.min(30, 10 + Math.floor(levelId / 5));

    // Initialize grid with walls (1)
    const layout = Array(height)
      .fill()
      .map(() => Array(width).fill(1));

    // Simple DFS Maze Generation
    const stack = [];
    const startX = 1;
    const startY = 1;

    layout[startY][startX] = 0;
    stack.push({ x: startX, y: startY });

    const directions = [
      { dx: 0, dy: -2 }, // Up
      { dx: 0, dy: 2 }, // Down
      { dx: -2, dy: 0 }, // Left
      { dx: 2, dy: 0 }, // Right
    ];

    while (stack.length > 0) {
      const current = stack[stack.length - 1];
      const { x, y } = current;

      // Fisher-Yates shuffle (unbiased, does not mutate original)
      const shuffledDirs = [...directions];
      for (let i = shuffledDirs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledDirs[i], shuffledDirs[j]] = [shuffledDirs[j], shuffledDirs[i]];
      }
      let moved = false;

      for (const dir of shuffledDirs) {
        const nx = x + dir.dx;
        const ny = y + dir.dy;

        if (
          nx > 0 &&
          nx < width - 1 &&
          ny > 0 &&
          ny < height - 1 &&
          layout[ny][nx] === 1
        ) {
          layout[ny][nx] = 0;
          layout[y + dir.dy / 2][x + dir.dx / 2] = 0; // Carve path
          stack.push({ x: nx, y: ny });
          moved = true;
          break;
        }
      }

      if (!moved) {
        stack.pop();
      }
    }

    // Set Start (2) and Goal (3)
    layout[1][1] = 2;

    // Find a far point for the goal
    // Simple approach: bottom-right-ish empty spot
    let goalSet = false;
    for (let y = height - 2; y > 0; y--) {
      for (let x = width - 2; x > 0; x--) {
        if (layout[y][x] === 0) {
          layout[y][x] = 3;
          goalSet = true;
          break;
        }
      }
      if (goalSet) break;
    }

    // Calculate time limit based on size
    const timeLimit = Math.floor(width * height * 0.5);

    return {
      id: levelId,
      width: width,
      height: height,
      layout: layout,
      timeLimit: timeLimit,
      thresholds: {
        3: Math.floor(timeLimit * 0.3),
        2: Math.floor(timeLimit * 0.6),
        1: timeLimit,
      },
    };
  }
}
