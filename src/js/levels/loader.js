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
      const level = JSON.parse(JSON.stringify(LEVELS[levelId])); // Return deep copy
      if (level.minMoves === undefined) {
        level.minMoves = this.calculateMinMoves(level);
      }
      return level;
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

    const level = {
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

    level.minMoves = this.calculateMinMoves(level);
    return level;
  }

  /**
   * Calculates the minimum number of moves from start to goal using BFS.
   * @param {Object} level - Level data with layout, width, height.
   * @returns {number} Minimum moves, or -1 if no path exists.
   */
  static calculateMinMoves(level) {
    const { layout, width, height } = level;
    let startX = -1, startY = -1;
    let goalX = -1, goalY = -1;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (layout[y][x] === 2) { startX = x; startY = y; }
        if (layout[y][x] === 3) { goalX = x; goalY = y; }
      }
    }

    if (startX < 0 || goalX < 0) return -1;

    const visited = Array(height).fill(null).map(() => Array(width).fill(false));
    const queue = [{ x: startX, y: startY, dist: 0 }];
    visited[startY][startX] = true;

    const dirs = [{ dx: 0, dy: -1 }, { dx: 0, dy: 1 }, { dx: -1, dy: 0 }, { dx: 1, dy: 0 }];

    while (queue.length > 0) {
      const { x, y, dist } = queue.shift();

      if (x === goalX && y === goalY) return dist;

      for (const { dx, dy } of dirs) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < width && ny >= 0 && ny < height && !visited[ny][nx] && layout[ny][nx] !== 1) {
          visited[ny][nx] = true;
          queue.push({ x: nx, y: ny, dist: dist + 1 });
        }
      }
    }

    return -1;
  }
}
