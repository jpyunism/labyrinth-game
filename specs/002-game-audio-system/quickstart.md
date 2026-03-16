# Quickstart: Game Audio System

**Feature**: Game Audio System
**Date**: 2025-11-21

## Overview

The Audio System provides 8-bit style sound effects (generated via ZzFX) and background music (Web Audio API). It includes volume controls and persistence.

## Usage

### 1. Initialization

The `AudioManager` must be initialized after a user interaction (e.g., clicking "Start Game") to unlock the AudioContext.

```javascript
import { audioManager } from './engine/audio.js';

document.getElementById('start-btn').addEventListener('click', async () => {
  await audioManager.init();
  audioManager.playMusic('bgm_main_menu');
});
```

### 2. Playing Sounds

**Sound Effects (ZzFX)**:

```javascript
// Play a jump sound
audioManager.playSfx('jump');

// Play a collect sound
audioManager.playSfx('collect');
```

**Music**:

```javascript
// Start level music
audioManager.playMusic('bgm_level1');

// Stop music with fade out
audioManager.stopMusic(1.0); // 1 second fade
```

### 3. Adjusting Volume

```javascript
// Set music volume to 50%
audioManager.setVolume('music', 0.5);

// Set SFX volume to 80%
audioManager.setVolume('sfx', 0.8);
```

## Adding New Sounds

### Adding SFX (ZzFX)

1. Go to [ZzFX Generator](https://killedbyapixel.github.io/ZzFX/).
2. Design your sound.
3. Copy the parameters array (e.g., `[1.0, 0, 200, .1, .1, .1, 0, 0, ...]`).
4. Add it to `src/assets/audio/sfx-definitions.js` (or similar config):

```javascript
export const SFX_DEFINITIONS = {
  jump: [1.0, 0, 200, .1, .1, .1, 0, 0, ...],
  collect: [ ... ]
};
```

### Adding Music

1. Place the `.mp3` or `.ogg` file in `src/assets/audio/music/`.
2. Register it in the `AudioManager` configuration.
