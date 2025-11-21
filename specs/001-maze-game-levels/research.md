# Research: Maze Game Technologies

## 1. Game Engine / Rendering

### Options Compared
*   **Phaser 3**:
    *   *Pros*: Industry standard, rich feature set (scenes, audio, tweens, physics), extensive docs.
    *   *Cons*: Large bundle size (~1MB minified), might be overkill for simple grid movement.
*   **Vanilla Canvas API**:
    *   *Pros*: Zero overhead, maximum performance, tiny footprint. Grid-based logic is simple to implement without a physics engine.
    *   *Cons*: Boilerplate required for game loop, asset loading, input handling, scaling/responsiveness.
*   **Kaboom.js**:
    *   *Pros*: Very beginner-friendly, concise syntax.
    *   *Cons*: Opinionated, abstraction layer might fight against custom grid logic.

### Analysis for Maze Game
A maze game relies heavily on a 2D grid. Complex physics (gravity, collisions with arbitrary shapes) are not needed.
*   **Phaser** is great if we want high polish (particle effects, complex UI, transitions) easily.
*   **Vanilla** is best if we want to keep the "offline" download size tiny (< 5MB goal is easy with Vanilla).

### Recommendation
**Vanilla Canvas API**.
*Reasoning*: The game logic (grid movement) is simple. We don't need a physics engine. Keeping the bundle small ensures fast load times and easy offline caching. We can build a lightweight "Game Loop" and "Scene Manager" specifically for our needs.

## 2. Storage (Progress Saving)

### Options Compared
*   **localStorage**:
    *   *Pros*: Sync API, extremely easy to use (`getItem`, `setItem`), widely supported.
    *   *Cons*: Blocking (negligible for small data), 5MB limit.
*   **IndexedDB**:
    *   *Pros*: Async, large storage, structured data.
    *   *Cons*: Complex API, overkill for simple scalars.

### Analysis
Data to store:
*   Level completion status (boolean or int) for 100 levels.
*   Stars earned (1-3) per level.
*   Settings (audio volume).
*   *Estimated size*: < 50KB JSON.

### Recommendation
**localStorage**.
*Reasoning*: The data requirements are trivial. `localStorage` is robust enough for this use case. We will wrap it in a `StorageManager` class to allow swapping later if needed.

## 3. Offline Capability (PWA)

### Strategy
*   **Service Worker**: Essential. Intercept network requests.
    *   *Cache Strategy*: "Cache First" for assets (images, sounds, JS, CSS) since they don't change often.
*   **Manifest**: `manifest.json` for "Add to Home Screen", standalone display, orientation lock.

### Recommendation
**Vite PWA Plugin** (if using Vite) or a standard **Service Worker** implementation.
*   Ensure `manifest.json` defines `display: standalone` and `orientation: landscape`.

## 4. Testing Framework

### Options Compared
*   **Jest/Vitest**: Unit testing.
*   **Cypress/Playwright**: E2E testing.

### Analysis
*   Game Logic (Movement, Collision, Scoring) should be decoupled from the View (Canvas).
*   This allows **Unit Testing** of the core logic without a browser environment.

### Recommendation
**Vitest**.
*   Focus on testing the `GameEngine` and `LevelManager` classes.
*   Since we are targeting ES6+, Vitest is faster and requires less config than Jest.
