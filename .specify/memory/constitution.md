<!--
Sync Impact Report:
- Version change: 0.0.0 -> 1.0.0 (Initial Ratification)
- Modified principles: Defined all core principles for Labyrinth Game.
- Added sections: Technology Standards, Development Workflow.
- Templates requiring updates: None (Initial setup).
-->

# Labyrinth Game Constitution

## Core Principles

### I. Offline-First (NON-NEGOTIABLE)
The game MUST be fully playable without an internet connection. All static assets (images, sounds, code) MUST be cached via Service Worker on the first load. Network dependency for core gameplay is strictly prohibited.

### II. Simplicity & Lightweight
We prioritize native Web APIs (Canvas, localStorage) over heavy frameworks. No external game engines (like Phaser) unless justified by complexity that cannot be handled natively. The initial bundle size SHOULD remain under 5MB.

### III. Performance (60 FPS)
The game loop MUST maintain a steady 60 frames per second on target devices. Game logic (updates) MUST be decoupled from rendering (draw calls) to ensure smooth performance. Memory leaks must be aggressively prevented.

### IV. Testable Logic
Core game logic (movement, collision detection, scoring, state management) MUST be implemented as testable units (pure functions or decoupled classes) verified by automated tests (Vitest). Rendering code is exempt from unit testing but requires manual verification.

### V. Responsive Design
The game interface and canvas MUST adapt to different screen sizes and aspect ratios. While primary input is keyboard (Arrow Keys), the UI layout MUST NOT break on smaller screens.

## Technology Standards

- **Language**: HTML5, CSS3, Modern JavaScript (ES6+).
- **Testing**: Vitest for unit testing game logic.
- **Storage**: `localStorage` for persisting user progress (stars, unlocks).
- **Architecture**: Single Page Application (SPA) structure; PWA compliant (Manifest + Service Worker).

## Development Workflow

- **Process**: Spec -> Plan -> Tasks -> Implementation. No code is written without a defined task.
- **Quality Gates**: All functional requirements must be met. Automated tests must pass for logic changes.
- **Documentation**: Specs and Plans must be kept in sync with implementation decisions.

## Governance

This Constitution supersedes all other project documentation. Amendments require a Pull Request with a clear rationale and impact analysis.

**Version**: 1.0.0 | **Ratified**: 2025-11-20 | **Last Amended**: 2025-11-20
