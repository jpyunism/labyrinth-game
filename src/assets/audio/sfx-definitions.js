/**
 * SFX Definitions - ZzFX parameter arrays for game sound effects.
 * Use the ZzFX Generator to create sounds: https://killedbyapixel.github.io/ZzFX/
 *
 * Parameter order:
 * volume, randomness, frequency, attack, sustain, release, shape, shapeCurve,
 * slide, deltaSlide, pitchJump, pitchJumpTime, repeatTime, noise, modulation,
 * bitCrush, delay, sustainVolume, decay, tremolo, filter
 */

export const SFX_DEFINITIONS = {
  // Jump/Move sound - bouncy triangle blip with upward pitch slide
  jump: [, , 280, 0.01, 0.02, 0.06, 1, 1.5, 12, , , , , , , , , 0.6, 0.01],

  // Collect/Pickup sound - shimmery ascending chime with pitch jump
  collect: [
    , , 520, 0.02, 0.05, 0.15, 1, 1.8, , , 200, 0.04, , , , , 0.02, 0.7,
    0.02, 0.1,
  ],

  // Level complete - triumphant ascending arpeggio with echo
  level_complete: [
    , , 440, 0.05, 0.25, 0.4, , 1.2, , , 150, 0.08, , , , , 0.08, 0.9, 0.05,
    0.05,
  ],

  // Game over - dramatic descending buzz with noise and bit crush
  game_over: [
    , , 380, 0.08, 0.3, 0.5, 2, 0.5, -8, -1, , , , 0.3, , 3, , 0.4, 0.15, ,
    200,
  ],

  // Button click - crisp filtered tap
  click: [, , 300, 0.005, , 0.03, , 1.2, , , , , , , , , , 0.5, 0.01, , 500],

  // Wall collision - crunchy impact thud with noise
  hit_wall: [
    , , 80, 0.01, 0.01, 0.06, 4, , , , , , , 0.4, , 4, , 0.3, 0.02,
  ],

  // Star earned - bright sparkle with delay and tremolo
  star: [
    , , 700, 0.02, 0.06, 0.18, 1, 1.6, 5, , 300, 0.05, , , , , 0.04, 0.8,
    0.02, 0.15,
  ],

  // Timer warning - urgent pulsing square alarm
  timer_warning: [
    , , 800, 0.03, 0.04, 0.12, 5, 0.5, , , , , 0.06, , 2, , , 0.6, 0.03,
    0.2,
  ],
};
