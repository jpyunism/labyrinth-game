/**
 * Default initial player progress.
 */
export const INITIAL_PROGRESS = {
  levels: {
    1: {
      stars: 0,
      bestTime: null,
      unlocked: true,
    },
  },
};

/**
 * Helper to create a default level progress entry.
 */
export function createLevelProgress() {
  return {
    stars: 0,
    bestTime: null,
    unlocked: false,
  };
}
