/**
 * Handles keyboard and touch input.
 */
export class InputHandler {
  /**
   * @param {Function} onMove - Callback(direction) when a movement input is detected.
   * @param {HTMLElement} [touchTarget] - Element to attach touch listeners to (defaults to window).
   */
  constructor(onMove, touchTarget = null) {
    this.onMove = onMove;
    this.handleKey = this.handleKey.bind(this);
    window.addEventListener("keydown", this.handleKey);

    // Touch/swipe support
    this.touchTarget = touchTarget || window;
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);
    this.touchTarget.addEventListener("touchstart", this.handleTouchStart, { passive: true });
    this.touchTarget.addEventListener("touchend", this.handleTouchEnd, { passive: true });
  }

  handleKey(event) {
    const key = event.key;

    const movementKeys = [
      "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight",
      "w", "W", "a", "A", "s", "S", "d", "D",
    ];

    if (movementKeys.includes(key)) {
      event.preventDefault();
    }

    switch (key) {
      case "ArrowUp":
      case "w":
      case "W":
        this.onMove("UP");
        break;
      case "ArrowDown":
      case "s":
      case "S":
        this.onMove("DOWN");
        break;
      case "ArrowLeft":
      case "a":
      case "A":
        this.onMove("LEFT");
        break;
      case "ArrowRight":
      case "d":
      case "D":
        this.onMove("RIGHT");
        break;
    }
  }

  handleTouchStart(event) {
    const touch = event.touches[0];
    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
  }

  handleTouchEnd(event) {
    const touch = event.changedTouches[0];
    const dx = touch.clientX - this.touchStartX;
    const dy = touch.clientY - this.touchStartY;
    const minSwipe = 30;

    if (Math.abs(dx) < minSwipe && Math.abs(dy) < minSwipe) return;

    if (Math.abs(dx) > Math.abs(dy)) {
      this.onMove(dx > 0 ? "RIGHT" : "LEFT");
    } else {
      this.onMove(dy > 0 ? "DOWN" : "UP");
    }
  }

  destroy() {
    window.removeEventListener("keydown", this.handleKey);
    this.touchTarget.removeEventListener("touchstart", this.handleTouchStart);
    this.touchTarget.removeEventListener("touchend", this.handleTouchEnd);
  }
}
