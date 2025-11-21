# Data Model: Maze Game Levels

## Entities

### Level
Represents the static configuration of a single maze level.

```json
{
  "id": 1,
  "width": 10,
  "height": 10,
  "layout": [
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 1, 0, 1],
    [1, 2, 1, 3, 1],
    [1, 1, 1, 1, 1]
  ],
  "timeLimit": 60,
  "thresholds": {
    "3": 15,
    "2": 30,
    "1": 60
  }
}
```

**Fields**:
- `id` (number): Unique level identifier (1-100).
- `width` (number): Grid width.
- `height` (number): Grid height.
- `layout` (number[][]): 2D array representing the grid.
    - `0`: Path (Walkable)
    - `1`: Wall (Blocked)
    - `2`: Start Position
    - `3`: Goal Position
- `timeLimit` (number): Max seconds allowed to complete.
- `thresholds` (object): Time in seconds for star ratings.

### PlayerProgress
Represents the user's saved state.

```json
{
  "levels": {
    "1": {
      "stars": 3,
      "bestTime": 12,
      "unlocked": true
    },
    "2": {
      "stars": 0,
      "bestTime": null,
      "unlocked": true
    },
    "3": {
      "stars": 0,
      "bestTime": null,
      "unlocked": false
    }
  }
}
```

**Fields**:
- `levels` (Map<string, LevelProgress>): Key is Level ID.

### LevelProgress
- `stars` (number): 0-3.
- `bestTime` (number | null): Fastest completion time in seconds.
- `unlocked` (boolean): Whether the level can be played.

## State Management

- **Runtime State**:
    - `currentLevel`: Level object.
    - `playerPosition`: {x, y}.
    - `timer`: Current elapsed time.
    - `gameState`: 'MENU' | 'PLAYING' | 'PAUSED' | 'VICTORY' | 'GAMEOVER'.

- **Persistence**:
    - `PlayerProgress` is serialized to JSON and stored in `localStorage` under key `maze_game_progress`.
