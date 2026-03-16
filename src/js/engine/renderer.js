/**
 * Handles all Canvas rendering operations.
 */
export class Renderer {
  /**
   * @param {HTMLCanvasElement} canvas
   */
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.cellSize = 0;
    this.offsetX = 0;
    this.offsetY = 0;
    this.shakeOffset = { x: 0, y: 0 };
  }

  /**
   * Clears the canvas.
   */
  clear() {
    this.ctx.fillStyle = "#222";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Calculates cell size and offsets to center the maze.
   * @param {Object} level - Level data with width and height.
   */
  calculateLayout(level) {
    const maxWidth = this.canvas.width * 0.9;
    const maxHeight = this.canvas.height * 0.9;

    const cellWidth = maxWidth / level.width;
    const cellHeight = maxHeight / level.height;

    this.cellSize = Math.floor(Math.min(cellWidth, cellHeight));

    const mazePixelWidth = this.cellSize * level.width;
    const mazePixelHeight = this.cellSize * level.height;

    this.offsetX = Math.floor((this.canvas.width - mazePixelWidth) / 2);
    this.offsetY = Math.floor((this.canvas.height - mazePixelHeight) / 2);
  }

  /**
   * Draws the static maze structure (walls, floor, goal).
   * @param {Object} level
   */
  drawMaze(level) {
    if (!this.cellSize) return;

    const sx = this.shakeOffset.x;
    const sy = this.shakeOffset.y;

    for (let y = 0; y < level.height; y++) {
      for (let x = 0; x < level.width; x++) {
        const cellType = level.layout[y][x];
        const px = this.offsetX + x * this.cellSize + sx;
        const py = this.offsetY + y * this.cellSize + sy;

        // Draw Floor
        this.ctx.fillStyle = "#333";
        this.ctx.fillRect(px, py, this.cellSize, this.cellSize);

        // Draw Wall
        if (cellType === 1) {
          this.ctx.fillStyle = "#888";
          this.ctx.fillRect(px, py, this.cellSize, this.cellSize);
          // Add simple 3D effect
          this.ctx.fillStyle = "#aaa";
          this.ctx.fillRect(px, py, this.cellSize, this.cellSize * 0.1);
        }

        // Draw Goal
        if (cellType === 3) {
          this.ctx.fillStyle = "#4CAF50"; // Green
          this.ctx.beginPath();
          this.ctx.arc(
            px + this.cellSize / 2,
            py + this.cellSize / 2,
            this.cellSize * 0.3,
            0,
            Math.PI * 2
          );
          this.ctx.fill();
        }

        // Draw Start (Optional visual marker)
        if (cellType === 2) {
          this.ctx.fillStyle = "#2196F3"; // Blue
          this.ctx.globalAlpha = 0.3;
          this.ctx.fillRect(px, py, this.cellSize, this.cellSize);
          this.ctx.globalAlpha = 1.0;
        }
      }
    }
  }

  /**
   * Draws the player character.
   * @param {Object} player - {x, y} coordinates.
   */
  drawPlayer(player) {
    if (!this.cellSize) return;

    const px = this.offsetX + player.x * this.cellSize + this.shakeOffset.x;
    const py = this.offsetY + player.y * this.cellSize + this.shakeOffset.y;

    this.ctx.fillStyle = "#FFC107"; // Amber
    this.ctx.beginPath();
    this.ctx.arc(
      px + this.cellSize / 2,
      py + this.cellSize / 2,
      this.cellSize * 0.35,
      0,
      Math.PI * 2
    );
    this.ctx.fill();

    // Simple eye for direction (optional, just a dot for now)
    this.ctx.fillStyle = "#000";
    this.ctx.beginPath();
    this.ctx.arc(
      px + this.cellSize / 2 + this.cellSize * 0.1,
      py + this.cellSize / 2 - this.cellSize * 0.1,
      this.cellSize * 0.05,
      0,
      Math.PI * 2
    );
    this.ctx.fill();
  }

  /**
   * Triggers a brief screen shake effect.
   * @param {number} duration - Duration in ms (default: 100)
   * @param {number} intensity - Shake intensity in px (default: 3)
   */
  shake(duration = 100, intensity = 3) {
    const start = performance.now();
    const animate = (now) => {
      const elapsed = now - start;
      if (elapsed < duration) {
        this.shakeOffset.x = (Math.random() - 0.5) * intensity * 2;
        this.shakeOffset.y = (Math.random() - 0.5) * intensity * 2;
        requestAnimationFrame(animate);
      } else {
        this.shakeOffset.x = 0;
        this.shakeOffset.y = 0;
      }
    };
    requestAnimationFrame(animate);
  }
}
