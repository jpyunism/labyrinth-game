# Research: Game Audio System

**Feature**: Game Audio System
**Date**: 2025-11-21

## 1. Audio Library vs Native API

**Decision**: Use **ZzFX** for Sound Effects and **Native Web Audio API** for Music.

**Rationale**:

- **ZzFX**: It is an incredibly tiny (~1kb) library specifically designed to *generate* 8-bit sound effects in real-time. This eliminates the need to download or manage `.wav` files for actions like jumping or collecting items, perfectly matching the "Simplicity & Lightweight" constraint while guaranteeing the 8-bit aesthetic.
- **Native Web Audio API**: It is sufficient for playing background music loops. Adding a library like Howler.js (~30kb) is unnecessary overhead just for looping a music track and adjusting volume, which can be achieved with a simple `AudioContext` wrapper.

**Alternatives Considered**:

- **Howler.js**: Good for compatibility, but adds ~30kb overhead which violates the "Simplicity" principle when native APIs suffice for basic looping.
- **ZzFXM**: A music tracker for ZzFX. Rejected because composing music in code is difficult compared to using standard audio files from established tools.

## 2. Asset Sources & Tools

**Music Assets**:

- **Source**: [OpenGameArt.org](https://opengameart.org/) (Search: "8-bit", "Chiptune", "NES")
- **Tool**: [BeepBox](https://beepbox.co/) (Browser-based tool for composing and exporting 8-bit music loops).

**SFX Assets**:

- **Tool**: [ZzFX Generator](https://killedbyapixel.github.io/ZzFX/) (Design sounds visually and export code parameters).
