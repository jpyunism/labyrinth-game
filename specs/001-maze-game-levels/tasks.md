# Tasks: Maze Game Levels

**Feature Branch**: `001-maze-game-levels`
**Status**: In Progress

## Phase 1: Setup
**Goal**: Initialize project structure and development environment.

- [x] T001 Create project directory structure (src/js, src/css, src/assets)
- [x] T002 Initialize `package.json` and install Vitest
- [x] T003 Create `index.html` with Canvas element
- [x] T004 Create `src/css/styles.css` for basic layout
- [x] T005 Create `src/js/main.js` entry point
- [x] T006 Setup `manifest.json` for PWA
- [x] T007 Setup `service-worker.js` boilerplate

## Phase 2: Foundational
**Goal**: Core architecture and shared utilities.

- [x] T008 [P] Implement `StorageManager` class in `src/js/state/storage.js`
- [x] T009 [P] Implement `LevelLoader` utility in `src/js/levels/loader.js`
- [x] T010 [P] Create `Renderer` class skeleton in `src/js/engine/renderer.js`
- [x] T011 Create `Game` class skeleton in `src/js/engine/game.js`

## Phase 3: User Story 1 - Play a Maze Level (P1)
**Goal**: Player can move a character in a maze and reach the goal.
**Story**: [US1] Play a Maze Level

- [x] T012 [US1] Define `Level` data structure in `src/js/levels/data.js` (Level 1 sample)
- [x] T013 [US1] Implement `Renderer.drawMaze()` to render grid in `src/js/engine/renderer.js`
- [x] T014 [US1] Implement `Renderer.drawPlayer()` in `src/js/engine/renderer.js`
- [x] T015 [US1] Implement `InputHandler` for arrow keys in `src/js/engine/input.js`
- [x] T016 [US1] Implement `Game.movePlayer()` with collision logic in `src/js/engine/game.js`
- [x] T017 [US1] Implement `Game.checkWinCondition()` in `src/js/engine/game.js`
- [x] T018 [US1] Implement `Game.checkTimeLimit()` (timer loop) in `src/js/engine/game.js`
- [x] T019 [US1] Create unit tests for movement and collision in `tests/game.test.js`

## Phase 4: User Story 2 - Level Selection & Progression (P1)
**Goal**: Player can select levels and unlock new ones.
**Story**: [US2] Level Selection & Progression

- [x] T020 [US2] Define `PlayerProgress` structure in `src/js/state/progress.js`
- [x] T021 [US2] Update `StorageManager` to save/load `PlayerProgress` in `src/js/state/storage.js`
- [x] T022 [US2] Create `LevelSelect` UI generation in `src/js/ui/level-select.js`
- [x] T023 [US2] Implement level locking logic in `src/js/ui/level-select.js`
- [x] T024 [US2] Connect Level Select click to `Game.startLevel()` in `src/js/main.js`
- [x] T025 [US2] Update `Game` to unlock next level on victory in `src/js/engine/game.js`

## Phase 5: User Story 3 - Star Rating System (P2)
**Goal**: Player earns stars based on completion time.
**Story**: [US3] Star Rating System

- [x] T026 [US3] Add time thresholds to `Level` data in `src/js/levels/data.js`
- [x] T027 [US3] Implement `Game.calculateStars()` in `src/js/engine/game.js`
- [x] T028 [US3] Update `Game` to save stars to `PlayerProgress` in `src/js/engine/game.js`
- [x] T029 [US3] Update `LevelSelect` UI to display earned stars in `src/js/ui/level-select.js`
- [x] T030 [US3] Create unit tests for star calculation in `tests/scoring.test.js`

## Phase 6: Polish & Cross-Cutting
**Goal**: Visual polish, assets, and offline verification.

- [x] T031 Generate 100 levels (procedural or data entry) in `src/js/levels/data.js`
- [x] T032 Polish UI styles in `src/css/styles.css`
- [x] T033 Implement "Game Over" and "Victory" modal screens in `index.html` and `src/js/main.js`
- [x] T034 Verify Service Worker caching strategy in `service-worker.js`

## Dependencies

1. **Setup** -> **Foundational**
2. **Foundational** -> **US1** (Need Renderer/Game structure)
3. **US1** -> **US2** (Need playable game to unlock levels)
4. **US1** -> **US3** (Need timer/win condition for stars)

## Parallel Execution Opportunities

- **US1**: Renderer (T013, T014) and Input/Logic (T015, T016) can be developed in parallel.
- **US2**: Storage logic (T021) and UI generation (T022) can be developed in parallel.
- **US3**: Star calculation logic (T027) and UI display (T029) can be developed in parallel.

## Implementation Strategy

1. **MVP (Phase 3)**: A single playable level with no menu, just start -> play -> win/loss.
2. **Progression (Phase 4)**: Add the menu and persistence.
3. **Full Game (Phase 5+6)**: Add scoring, all 100 levels, and polish.
