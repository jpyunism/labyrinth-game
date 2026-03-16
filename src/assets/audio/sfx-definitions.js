/**
 * SFX Definitions - ZzFX parameter arrays for game sound effects.
 * Use the ZzFX Generator to create sounds: https://killedbyapixel.github.io/ZzFX/
 */

export const SFX_DEFINITIONS = {
  // Jump/Move sound - short blip
  jump: [, , 261, 0.01, , 0.04, , , , , , , , , , , , 0.5, 0.01],

  // Collect/Pickup sound - positive chime
  collect: [, , 587, 0.02, 0.02, 0.09, 1, 1.9, , , , , , , , , , 0.6, 0.02],

  // Level complete - victory fanfare
  level_complete: [, , 523, 0.05, 0.2, 0.3, , 1.3, , , , , , , , , , 0.8, 0.05],

  // Game over - descending sad sound
  game_over: [, , 440, 0.1, 0.3, 0.4, 1, 0.1, , -9, , , , , , , , 0.5, 0.1],

  // Button click - UI feedback
  click: [, , 200, 0.01, , 0.03, , , , , , , , , , , , 0.4, 0.01],

  // Wall collision - thud
  hit_wall: [, , 100, 0.01, , 0.04, 4, , , , , , , , , , , 0.3, 0.01],

  // Star earned - sparkle
  star: [, , 800, 0.02, 0.04, 0.12, , 1.5, , , , , , , , , , 0.7, 0.02],

  // Timer warning - urgent beep
  timer_warning: [, , 880, 0.05, , 0.1, , , , , , , , , , , , 0.5, 0.05],
};
