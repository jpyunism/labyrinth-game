import { beforeEach, describe, expect, it, vi } from "vitest";
import { Game } from "../src/js/engine/game.js";

// Mock dependencies
vi.mock("../src/js/engine/renderer.js", () => {
  return {
    Renderer: class {
      constructor() {}
      clear() {}
      calculateLayout() {}
      drawMaze() {}
      drawPlayer() {}
      drawUI() {}
      shake() {}
    },
  };
});

vi.mock("../src/js/state/storage.js", () => {
  return {
    StorageManager: class {
      constructor() {}
      loadProgress() {
        return { levels: {} };
      }
      saveProgress() {}
      updateLevelScore() {}
      unlockLevel() {}
    },
  };
});

// Mock InputHandler to avoid window listener issues in test env
vi.mock("../src/js/engine/input.js", () => {
  return {
    InputHandler: class {
      constructor(cb) {}
      destroy() {}
    },
  };
});

// Mock audio to avoid AudioContext in test env
vi.mock("../src/js/engine/audio.js", () => {
  return {
    audioManager: {
      registerSfxDefinitions() {},
      playSfx() {},
      playMusic() {},
      stopMusic() {},
      init() {},
    },
  };
});

// Mock SFX definitions
vi.mock("../src/assets/audio/sfx-definitions.js", () => {
  return { SFX_DEFINITIONS: {} };
});

describe("Game Engine", () => {
  let game;
  let mockCanvas;

  beforeEach(() => {
    mockCanvas = { getContext: () => ({}) };
    game = new Game(mockCanvas);

    // Manually load a test level
    // We'll use Level 1 from data.js but override layout for predictable testing
    // 0: Path, 1: Wall, 2: Start, 3: Goal
    const testLevel = {
      id: 999,
      width: 3,
      height: 3,
      layout: [
        [2, 0, 3],
        [0, 1, 0],
        [0, 0, 0],
      ],
      timeLimit: 10,
      thresholds: { 3: 5, 2: 8, 1: 10 },
    };

    // Inject test level directly to avoid LevelLoader dependency on real data
    game.state.currentLevelId = 999;
    game.state.currentLevelData = testLevel;
    game.state.status = "PLAYING";
    game.state.player = { x: 0, y: 0 }; // Start at (0,0)
  });

  it("should move player to valid adjacent cell", () => {
    game.movePlayer("RIGHT"); // (0,0) -> (1,0) is 0 (Path)
    expect(game.state.player).toEqual({ x: 1, y: 0 });
  });

  it("should block movement into walls", () => {
    game.state.player = { x: 0, y: 0 };
    game.movePlayer("DOWN"); // (0,0) -> (0,1) is 0 (Path)
    expect(game.state.player).toEqual({ x: 0, y: 1 });

    game.movePlayer("RIGHT"); // (0,1) -> (1,1) is 1 (Wall)
    expect(game.state.player).toEqual({ x: 0, y: 1 }); // Should not move
  });

  it("should block movement out of bounds", () => {
    game.state.player = { x: 0, y: 0 };
    game.movePlayer("UP"); // (0,-1) Out of bounds
    expect(game.state.player).toEqual({ x: 0, y: 0 });

    game.movePlayer("LEFT"); // (-1,0) Out of bounds
    expect(game.state.player).toEqual({ x: 0, y: 0 });
  });

  it("should detect victory condition", () => {
    game.state.player = { x: 1, y: 0 };
    game.movePlayer("RIGHT"); // (1,0) -> (2,0) is 3 (Goal)
    expect(game.state.player).toEqual({ x: 2, y: 0 });
    expect(game.state.status).toBe("VICTORY");
  });

  it("should fail level when time limit exceeded", () => {
    game.checkTimeLimit(11); // Exceeds 10s limit
    expect(game.state.status).toBe("GAMEOVER");
  });
});
