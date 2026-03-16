---
description: "Task list for Game Audio System implementation"
---

# Tasks: Game Audio System

**Input**: Design documents from `specs/002-game-audio-system/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests are OPTIONAL - only include them if explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create directory structure for audio assets in `src/assets/audio/music` and `src/assets/audio/sfx`
- [X] T002 Add ZzFX micro-library to `src/js/lib/zzfx.js`
- [X] T003 Add placeholder 8-bit music file to `src/assets/audio/music/bgm_placeholder.mp3`

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 Implement `SettingsStore` in `src/js/state/settings.js` to handle `localStorage` persistence for `AudioSettings`
- [X] T005 Implement `AudioManager` skeleton in `src/js/engine/audio.js` implementing `IAudioManager` interface
- [X] T006 Implement `init()` method in `AudioManager` to unlock `AudioContext` on user interaction

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Background Music (Priority: P1)

**Goal**: Enable 8-bit background music playback and looping

**Independent Test**: Start the game and verify music plays and loops

### Implementation for User Story 1

- [X] T007 [US1] Implement `playMusic` and `stopMusic` methods in `src/js/engine/audio.js` using Web Audio API
- [X] T008 [US1] Implement looping logic for background music in `src/js/engine/audio.js`
- [X] T009 [US1] Integrate music playback into `src/js/main.js` (or game entry point) to start music on user interaction

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Action Sound Effects (Priority: P1)

**Goal**: Enable immediate audio feedback for game actions using ZzFX

**Independent Test**: Perform actions (jump, move) and verify sound effects play

### Implementation for User Story 2

- [X] T010 [P] [US2] Create SFX definitions file `src/assets/audio/sfx-definitions.js` with ZzFX parameters
- [X] T011 [US2] Implement `playSfx` method in `src/js/engine/audio.js` using ZzFX library
- [X] T012 [US2] Trigger 'jump' and 'move' SFX in `src/js/engine/input.js` or `src/js/engine/game.js` on corresponding actions
- [X] T013 [US2] Trigger 'level_complete' SFX in `src/js/engine/game.js` on level completion

**Checkpoint**: At this point, User Story 2 should be fully functional and testable independently

---

## Phase 5: User Story 3 - Volume Control (Priority: P2)

**Goal**: Allow users to adjust music and SFX volume independently

**Independent Test**: Adjust sliders in settings menu and verify volume changes

### Implementation for User Story 3

- [X] T014 [US3] Implement `setVolume` and `setMuted` methods in `src/js/engine/audio.js` connecting to GainNodes
- [X] T015 [P] [US3] Create or update Settings UI in `src/js/ui/settings.js` with volume sliders for Music and SFX
- [X] T016 [US3] Connect Settings UI sliders to `AudioManager` and `SettingsStore` in `src/js/ui/settings.js`
- [X] T017 [US3] Load and apply saved volume settings on game startup in `src/js/main.js`

**Checkpoint**: At this point, User Story 3 should be fully functional and testable independently

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final touches, edge cases, and non-functional requirements

- [X] T018 Handle browser auto-play policy by showing a "Click to Start" overlay if audio context is suspended
- [X] T019 Preload music assets in `src/js/levels/loader.js` to prevent playback delay

## Dependencies

- **US1 (Music)** depends on **Foundational (AudioManager)**
- **US2 (SFX)** depends on **Foundational (AudioManager)** and **Setup (ZzFX)**
- **US3 (Volume)** depends on **US1** and **US2** (to control their volumes)

## Parallel Execution Opportunities

- **T010 (SFX Definitions)** can be done in parallel with **T007 (Music Implementation)**
- **T015 (Settings UI)** can be done in parallel with **T014 (Volume Logic)**
