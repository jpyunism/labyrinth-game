# Data Model: Game Audio System

**Feature**: Game Audio System
**Date**: 2025-11-21

## Entities

### AudioSettings

Represents the user's audio preferences, persisted in `localStorage`.

| Field | Type | Description | Validation |
| :--- | :--- | :--- | :--- |
| `musicVolume` | `number` | Volume level for background music. | `0.0` to `1.0` |
| `sfxVolume` | `number` | Volume level for sound effects. | `0.0` to `1.0` |
| `isMuted` | `boolean` | Global mute state. | `true` or `false` |

### SoundAsset

Represents a playable audio resource.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Unique identifier (e.g., `'jump'`, `'bgm_level1'`). |
| `type` | `'music' \| 'sfx'` | Category of the sound. |
| `src` | `string` | Path to audio file (for Music). |
| `zzfxParams` | `number[]` | ZzFX generation parameters (for SFX). |

## State Management

### Settings State

The global state object will be updated to include audio settings.

```javascript
const state = {
  // ... existing state
  settings: {
    audio: {
      musicVolume: 0.5,
      sfxVolume: 0.8,
      isMuted: false
    }
  }
};
```
