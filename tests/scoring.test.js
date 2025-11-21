import { beforeEach, describe, expect, it, vi } from "vitest";
import { Game } from "../src/js/engine/game.js";

// Mock dependencies
vi.mock("../src/js/engine/renderer.js", () => ({ Renderer: class {} }));
vi.mock("../src/js/state/storage.js", () => ({ StorageManager: class {} }));
vi.mock("../src/js/engine/input.js", () => ({ InputHandler: class {} }));

describe("Scoring System", () => {
  let game;

  beforeEach(() => {
    game = new Game({ getContext: () => ({}) });
    game.state.currentLevelData = {
      thresholds: {
        3: 10,
        2: 20,
        1: 30,
      },
    };
  });

  it("should award 3 stars for fast time", () => {
    expect(game.calculateStars(5)).toBe(3);
    expect(game.calculateStars(10)).toBe(3);
  });

  it("should award 2 stars for medium time", () => {
    expect(game.calculateStars(10.1)).toBe(2);
    expect(game.calculateStars(20)).toBe(2);
  });

  it("should award 1 star for slow time", () => {
    expect(game.calculateStars(20.1)).toBe(1);
    expect(game.calculateStars(30)).toBe(1);
  });
});
