/**
 * Handles keyboard input.
 */
export class InputHandler {
  /**
   * @param {Function} onMove - Callback(direction) when an arrow key is pressed.
   */
  constructor(onMove) {
    this.onMove = onMove;
    this.handleKey = this.handleKey.bind(this);
    window.addEventListener("keydown", this.handleKey);
  }

  handleKey(event) {
    // Prevent default scrolling for arrow keys
    if (
      ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)
    ) {
      event.preventDefault();
    }

    switch (event.key) {
      case "ArrowUp":
        this.onMove("UP");
        break;
      case "ArrowDown":
        this.onMove("DOWN");
        break;
      case "ArrowLeft":
        this.onMove("LEFT");
        break;
      case "ArrowRight":
        this.onMove("RIGHT");
        break;
    }
  }

  destroy() {
    window.removeEventListener("keydown", this.handleKey);
  }
}
