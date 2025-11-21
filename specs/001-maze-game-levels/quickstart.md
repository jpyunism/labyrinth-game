# Quickstart: Maze Game Levels

## Prerequisites

- **Node.js**: v18+ (for development server)
- **Browser**: Chrome, Firefox, or Safari (latest versions)

## Setup

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Start Development Server**:
    ```bash
    npm run dev
    ```
    This will start a local server (e.g., Vite) at `http://localhost:5173`.

## Running Tests

- **Unit Tests**:
    ```bash
    npm test
    ```
    Runs Vitest for game logic.

## Building for Production

1.  **Build**:
    ```bash
    npm run build
    ```
    Generates the `dist/` folder with optimized assets.

2.  **Preview Production Build**:
    ```bash
    npm run preview
    ```

## Offline Mode

To test offline capabilities:
1.  Open the game in Chrome.
2.  Open DevTools (F12) -> Application tab -> Service Workers.
3.  Check "Offline".
4.  Reload the page. The game should still load and be playable.
