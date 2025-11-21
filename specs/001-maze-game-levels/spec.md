# Feature Specification: Maze Game Levels

**Feature Branch**: `001-maze-game-levels`
**Created**: 2025-11-20
**Status**: Draft
**Input**: User description: "Un juego de laberintos por niveles, cada nivel mas dificil que el anterior. Pantalla principal se veran los niveles enumerados del 1 al 100. Cada nivel se debe completar en max un tiempo razonable, el puntaje se representa en estrellas. El usuario puede obtener de 1 a 3 estrellas dependiendo de cuan rapido logro llegar a la meta. Puedes volver a jugar un nivel completado para poder mejorar el puntaje obtenido. El laberinto debe poder recorrerse con las teclas de flachas."

## User Scenarios & Testing

### User Story 1 - Play a Maze Level (Priority: P1)

As a player, I want to control a character in a maze using arrow keys so that I can reach the goal before time runs out.

**Why this priority**: This is the core gameplay loop. Without movement and a goal, there is no game.

**Independent Test**: Can be fully tested by launching a single level and verifying movement, collision, and reaching the goal.

**Acceptance Scenarios**:

1. **Given** the game level is active, **When** I press the Arrow Keys, **Then** the character moves in the corresponding direction.
2. **Given** the character is next to a wall, **When** I press the Arrow Key towards the wall, **Then** the character does not move (collision).
3. **Given** the character reaches the goal position, **Then** the level is marked as completed.
4. **Given** the time limit expires, **Then** the level ends in failure and I must retry.

---

### User Story 2 - Level Selection & Progression (Priority: P1)

As a player, I want to see a list of 100 levels and select one to play, so that I can progress through the game.

**Why this priority**: Essential for navigating the "100 levels" requirement and tracking progress.

**Independent Test**: Can be tested by viewing the main menu and clicking different level icons.

**Acceptance Scenarios**:

1. **Given** the game launches, **When** the main screen appears, **Then** I see a grid of levels numbered 1 to 100.
2. **Given** I have not completed Level 1, **When** I look at Level 2, **Then** it is locked (cannot be played).
3. **Given** I complete Level 1, **When** I return to the menu, **Then** Level 2 is unlocked.
4. **Given** I select an unlocked level, **Then** the game transitions to that specific maze layout.

---

### User Story 3 - Star Rating System (Priority: P2)

As a player, I want to earn 1 to 3 stars based on my completion time, so that I am challenged to play faster.

**Why this priority**: Adds the scoring mechanic requested ("puntaje se representa en estrellas").

**Independent Test**: Can be tested by completing a level at different speeds and checking the result.

**Acceptance Scenarios**:

1. **Given** I complete the level very quickly (under threshold A), **Then** I am awarded 3 stars.
2. **Given** I complete the level moderately fast (between threshold A and B), **Then** I am awarded 2 stars.
3. **Given** I complete the level slowly but within the limit (between threshold B and limit), **Then** I am awarded 1 star.
4. **Given** I replay a level and get a worse time, **Then** my previous high score (stars) is preserved.
5. **Given** I replay a level and get a better time/more stars, **Then** my score is updated.

---

### Edge Cases

- What happens if the player presses multiple arrow keys at once? (System should prioritize one or ignore conflicting inputs).
- What happens if the game is closed while playing? (Progress is not saved until level completion).
- What happens if the player completes the level exactly on the time limit second? (Count as success).

## Requirements

### Functional Requirements

- **FR-001**: The system MUST display a main menu with 100 selectable levels.
- **FR-002**: The system MUST lock levels that have not been reached yet (Level 1 unlocked by default).
- **FR-003**: The system MUST allow character movement using the keyboard Arrow Keys (Up, Down, Left, Right).
- **FR-004**: The system MUST prevent the character from moving through maze walls.
- **FR-005**: Each level MUST have a specific time limit ("tiempo razonable").
- **FR-006**: The system MUST fail the level if the time limit is exceeded.
- **FR-007**: The system MUST award 1, 2, or 3 stars upon level completion based on predefined time thresholds for that level.
- **FR-008**: The system MUST save the highest number of stars earned for each level.
- **FR-009**: The system MUST allow replaying previously completed levels.
- **FR-010**: Levels MUST increase in difficulty (e.g., larger grid size, longer path) as the level number increases.

### Key Entities

- **Level**:
    - ID (1-100)
    - Layout (Grid/Map data)
    - TimeLimit (Seconds)
    - ThreeStarThreshold (Seconds)
    - TwoStarThreshold (Seconds)
- **PlayerProgress**:
    - LevelID
    - StarsEarned (0-3)
    - IsUnlocked (Boolean)

## Success Criteria

### Measurable Outcomes

- **SC-001**: Player can successfully navigate from start to finish in Level 1.
- **SC-002**: Player receives exactly 3 stars when completing Level 1 under the 3-star time threshold.
- **SC-003**: Player receives exactly 1 star when completing Level 1 near the time limit.
- **SC-004**: Level 2 becomes playable immediately after completing Level 1.
- **SC-005**: Game state persists across page reloads/restarts (stars are remembered).
