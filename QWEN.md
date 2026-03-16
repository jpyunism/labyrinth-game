# Labyrinth Game - Project Context

## Project Overview

**Labyrinth Game** is a browser-based maze puzzle game built with vanilla JavaScript and Vite. Players navigate through 100 progressively challenging maze levels, earning 1-3 stars based on completion time. The game features procedural level generation for levels beyond the manually designed ones, a star-based scoring system, and persistent progress tracking via localStorage.

### Key Features

- 100 levels with increasing difficulty (3 hand-crafted + 197 procedurally generated)
- Star rating system (1-3 stars based on completion time)
- Level progression with unlock mechanics
- Persistent save system using localStorage
- Procedural background music using ZzFX
- Sound effects for game events
- Responsive design for desktop and mobile
- PWA support with service worker and manifest

## Tech Stack

| Category       | Technology                        |
| -------------- | --------------------------------- |
| **Build Tool** | Vite 7.x                          |
| **Testing**    | Vitest 4.x                        |
| **Audio**      | ZzFX (procedural audio library)   |
| **Storage**    | localStorage API                  |
| **Graphics**   | HTML5 Canvas API                  |
| **PWA**        | Service Worker + Web App Manifest |

## Project Structure

```
labyrinth-game/
├── src/
│   ├── js/
│   │   ├── engine/
│   │   │   ├── audio.js       # AudioManager with procedural music (ZzFX)
│   │   │   ├── game.js        # Main Game class, game loop, state management
│   │   │   ├── input.js       # Keyboard input handler
│   │   │   └── renderer.js    # Canvas rendering (maze, player, effects)
│   │   ├── levels/
│   │   │   ├── data.js        # Hand-crafted level definitions (levels 1-3)
│   │   │   └── loader.js      # LevelLoader with procedural generation
│   │   ├── state/
│   │   │   ├── progress.js    # Player progress data structures
│   │   │   ├── settings.js    # Audio/settings persistence
│   │   │   └── storage.js     # StorageManager for localStorage
│   │   ├── ui/
│   │   │   ├── level-select.js # Level selection screen UI
│   │   │   └── settings.js     # Settings modal UI
│   │   ├── lib/
│   │   │   └── zzfx.js        # ZzFX micro audio library
│   │   └── main.js            # Application entry point
│   ├── css/
│   │   └── styles.css         # Game styles with CSS variables
│   └── assets/
│       └── audio/
│           └── sfx-definitions.js  # SFX sound parameters
├── tests/
│   ├── game.test.js           # Game engine tests
│   └── scoring.test.js        # Scoring system tests
├── specs/
│   ├── 001-maze-game-levels/  # Feature specifications
│   └── 002-game-audio-system/ # Audio system specifications
├── index.html                 # Main HTML with game canvas and UI
├── manifest.json              # PWA manifest
├── service-worker.js          # PWA service worker
├── package.json               # Dependencies and scripts
└── vite.config.js             # Vite configuration (if present)
```

## Building and Running

### Development Server

```bash
npm run dev
```

Starts Vite dev server (typically at `http://localhost:5173`)

### Production Build

```bash
npm run build
```

Creates optimized production build in `dist/` directory

### Preview Production Build

```bash
npm run preview
```

Serves the production build locally

### Run Tests

```bash
npm run test
```

Runs test suite using Vitest

## Game Architecture

### Core Components

1. **Game Class** (`src/js/engine/game.js`)
   - Manages game loop via `requestAnimationFrame`
   - Handles state: `MENU`, `PLAYING`, `PAUSED`, `VICTORY`, `GAMEOVER`
   - Coordinates input, rendering, and audio
   - Implements smooth player movement interpolation

2. **LevelLoader** (`src/js/levels/loader.js`)
   - Serves hand-crafted levels (1-3) from `data.js`
   - Generates procedural mazes for levels 4-200 using DFS algorithm
   - Calculates minimum moves using BFS pathfinding

3. **Renderer** (`src/js/engine/renderer.js`)
   - Canvas-based rendering
   - Draws maze walls, paths, start/goal markers
   - Player character with directional rendering
   - Visual effects: trail particles, vignette, goal glow, screen shake

4. **AudioManager** (`src/js/engine/audio.js`)
   - Procedural music using Web Audio API oscillators
   - Scheduled note playback with lookahead scheduler
   - SFX playback via ZzFX library
   - Volume controls for music and SFX

5. **StorageManager** (`src/js/state/storage.js`)
   - Persists player progress to localStorage
   - Tracks: unlocked levels, stars earned, best times, best moves

### Game State Flow

```
MENU → Level Select → PLAYING → VICTORY/GAMEOVER → MENU
                              ↓
                         (retry option)
```

### Level Data Format

```javascript
{
  id: number,           // Level ID (1-200)
  width: number,        // Grid width in cells
  height: number,       // Grid height in cells
  layout: number[][],   // 2D grid: 0=path, 1=wall, 2=start, 3=goal
  timeLimit: number,    // Time limit in seconds
  thresholds: {         // Star thresholds (time in seconds)
    3: number,
    2: number,
    1: number
  },
  minMoves: number      // Minimum moves to solve (calculated via BFS)
}
```

### Cell Types

| Value | Meaning         |
| ----- | --------------- |
| 0     | Path (walkable) |
| 1     | Wall (blocked)  |
| 2     | Start position  |
| 3     | Goal position   |

## Development Conventions

### Code Style

- ES Modules for all JavaScript files
- JSDoc comments for public APIs
- Consistent use of `const`/`let` (no `var`)
- Arrow functions for callbacks and methods not using `this`

### Testing Practices

- Tests located in `tests/` directory
- Uses Vitest framework with `describe`/`it`/`expect` pattern
- Mock external dependencies (renderer, storage, audio, input)
- Test core game logic: movement, collision, win/lose conditions

### File Naming

- `.js` extension for all JavaScript files
- kebab-case for file names
- PascalCase for class names, camelCase for functions/variables

### Audio System Notes

- ZzFX library requires user interaction to initialize (browser autoplay policy)
- Audio unlock overlay prompts user to enable sound
- Music uses procedural generation with defined tracks and note sequences
- SFX defined as parameter arrays for ZzFX function

## Key Design Decisions

1. **Procedural Level Generation**: Uses recursive backtracking (DFS) for maze generation, ensuring solvable mazes with increasing complexity

2. **Movement Interpolation**: Logical player position updates instantly, but display position lerps for smooth animation

3. **Input Blocking**: Prevents rapid key presses during animation to maintain game feel

4. **Trail System**: Particle trail follows player with fade-out effect for visual feedback

5. **Star Calculation**: Based on moves vs. minimum moves (not just time):
   - 3 stars: moves ≤ minMoves
   - 2 stars: moves ≤ 1.5 × minMoves
   - 1 star: otherwise (but still completed in time)

## Common Tasks

### Adding a New Hand-Crafted Level

Edit `src/js/levels/data.js`:

```javascript
4: {
  id: 4,
  width: 12,
  height: 12,
  layout: [/* 2D array */],
  timeLimit: 45,
  thresholds: { 3: 15, 2: 30, 1: 45 },
}
```

### Adding a New Sound Effect

1. Define in `src/assets/audio/sfx-definitions.js` using ZzFX parameters
2. Play via `audioManager.playSfx("yourSfxId")`

### Modifying Music Tracks

Edit `TRACKS` object in `src/js/engine/audio.js`:

- Adjust tempo (BPM)
- Modify note sequences using `NOTE` constants

## Troubleshooting

### Audio Not Playing

- Browser autoplay policy requires user interaction first
- Check `audioManager.initialized` flag
- Verify audio context is not suspended

### Level Not Loading

- Ensure level ID is between 1-200
- Check console for "Level not found" warnings
- Verify level data has required properties

### Tests Failing

- Ensure mocks are properly configured for dependencies
- Check that game state is reset between tests
- Verify async operations are handled correctly
