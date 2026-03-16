/**
 * Handles all Canvas rendering operations with enhanced visuals.
 */
export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.cellSize = 0;
    this.offsetX = 0;
    this.offsetY = 0;
    this.shakeOffset = { x: 0, y: 0 };
    this.time = 0; // monotonic time for animations
    this._lastFrame = performance.now();

    // Colors
    this.colors = {
      bg: "#1a1a2e",
      floorA: "#16213e",
      floorB: "#1a1a2e",
      wallTop: "#4a5568",
      wallFace: "#2d3748",
      wallDark: "#1a202c",
      wallEdge: "#5a6a80",
      player: "#fbbf24",
      playerGlow: "rgba(251, 191, 36, 0.35)",
      playerHighlight: "#fde68a",
      goal: "#34d399",
      goalGlow: "rgba(52, 211, 153, 0.25)",
      start: "rgba(96, 165, 250, 0.2)",
      trail: "#fbbf24",
    };
  }

  clear() {
    const now = performance.now();
    this.time += (now - this._lastFrame) / 1000;
    this._lastFrame = now;

    this.ctx.fillStyle = this.colors.bg;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  calculateLayout(level) {
    const maxWidth = this.canvas.width * 0.9;
    const maxHeight = this.canvas.height * 0.9;
    const cellWidth = maxWidth / level.width;
    const cellHeight = maxHeight / level.height;

    this.cellSize = Math.floor(Math.min(cellWidth, cellHeight));
    const mazePixelWidth = this.cellSize * level.width;
    const mazePixelHeight = this.cellSize * level.height;

    this.offsetX = Math.floor((this.canvas.width - mazePixelWidth) / 2);
    this.offsetY = Math.floor((this.canvas.height - mazePixelHeight) / 2);
  }

  /**
   * Draws the maze with enhanced wall rendering and floor grid.
   * @param {Object} level
   * @param {number} timeRatio - 0..1 how much time has passed
   */
  drawMaze(level, timeRatio) {
    if (!this.cellSize) return;

    const ctx = this.ctx;
    const cs = this.cellSize;
    const sx = this.shakeOffset.x;
    const sy = this.shakeOffset.y;
    const wallDepth = Math.max(2, cs * 0.15);

    for (let y = 0; y < level.height; y++) {
      for (let x = 0; x < level.width; x++) {
        const cellType = level.layout[y][x];
        const px = this.offsetX + x * cs + sx;
        const py = this.offsetY + y * cs + sy;

        // --- Floor: subtle checkerboard ---
        ctx.fillStyle = (x + y) % 2 === 0 ? this.colors.floorA : this.colors.floorB;
        ctx.fillRect(px, py, cs, cs);

        // Floor grid lines
        ctx.strokeStyle = "rgba(255,255,255,0.03)";
        ctx.lineWidth = 0.5;
        ctx.strokeRect(px + 0.5, py + 0.5, cs - 1, cs - 1);

        // --- Wall: 3D block with top face and shadows ---
        if (cellType === 1) {
          // Wall shadow (on the floor, bottom-right)
          ctx.fillStyle = "rgba(0,0,0,0.3)";
          ctx.fillRect(px + 2, py + 2, cs, cs);

          // Wall front face
          ctx.fillStyle = this.colors.wallFace;
          ctx.fillRect(px, py + wallDepth, cs, cs - wallDepth);

          // Wall top face (lighter, gives 3D depth)
          ctx.fillStyle = this.colors.wallTop;
          ctx.fillRect(px, py, cs, wallDepth);

          // Left edge highlight
          ctx.fillStyle = this.colors.wallEdge;
          ctx.fillRect(px, py, 2, cs);

          // Bottom dark edge
          ctx.fillStyle = this.colors.wallDark;
          ctx.fillRect(px, py + cs - 1, cs, 1);
          ctx.fillRect(px + cs - 1, py, 1, cs);
        }

        // --- Start marker: soft blue glow ---
        if (cellType === 2) {
          ctx.fillStyle = this.colors.start;
          ctx.fillRect(px, py, cs, cs);

          // Small diamond marker in center
          ctx.fillStyle = "rgba(96, 165, 250, 0.4)";
          ctx.beginPath();
          const cx = px + cs / 2;
          const cy = py + cs / 2;
          const r = cs * 0.15;
          ctx.moveTo(cx, cy - r);
          ctx.lineTo(cx + r, cy);
          ctx.lineTo(cx, cy + r);
          ctx.lineTo(cx - r, cy);
          ctx.closePath();
          ctx.fill();
        }
      }
    }
  }

  /**
   * Draws an animated pulsing glow on the goal cell.
   */
  drawGoalGlow(level) {
    if (!this.cellSize) return;

    const ctx = this.ctx;
    const cs = this.cellSize;
    const sx = this.shakeOffset.x;
    const sy = this.shakeOffset.y;
    const pulse = 0.8 + Math.sin(this.time * 3) * 0.2;
    const glowPulse = 0.15 + Math.sin(this.time * 2) * 0.1;

    for (let y = 0; y < level.height; y++) {
      for (let x = 0; x < level.width; x++) {
        if (level.layout[y][x] !== 3) continue;

        const px = this.offsetX + x * cs + sx;
        const py = this.offsetY + y * cs + sy;
        const cx = px + cs / 2;
        const cy = py + cs / 2;

        // Outer glow
        const outerGlow = ctx.createRadialGradient(cx, cy, cs * 0.1, cx, cy, cs * 0.7);
        outerGlow.addColorStop(0, `rgba(52, 211, 153, ${glowPulse})`);
        outerGlow.addColorStop(1, "rgba(52, 211, 153, 0)");
        ctx.fillStyle = outerGlow;
        ctx.fillRect(px - cs * 0.3, py - cs * 0.3, cs * 1.6, cs * 1.6);

        // Main goal circle
        const goalGrad = ctx.createRadialGradient(
          cx - cs * 0.08, cy - cs * 0.08, cs * 0.05,
          cx, cy, cs * 0.32 * pulse
        );
        goalGrad.addColorStop(0, "#6ee7b7");
        goalGrad.addColorStop(0.7, this.colors.goal);
        goalGrad.addColorStop(1, "#059669");
        ctx.fillStyle = goalGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, cs * 0.32 * pulse, 0, Math.PI * 2);
        ctx.fill();

        // Inner highlight
        ctx.fillStyle = "rgba(255,255,255,0.3)";
        ctx.beginPath();
        ctx.arc(cx - cs * 0.06, cy - cs * 0.08, cs * 0.1, 0, Math.PI * 2);
        ctx.fill();

        // Small star sparkle
        const sparkAngle = this.time * 2;
        const sparkDist = cs * 0.35;
        const sparkX = cx + Math.cos(sparkAngle) * sparkDist;
        const sparkY = cy + Math.sin(sparkAngle) * sparkDist;
        const sparkAlpha = 0.4 + Math.sin(this.time * 6) * 0.3;
        ctx.fillStyle = `rgba(255,255,255,${sparkAlpha})`;
        ctx.beginPath();
        ctx.arc(sparkX, sparkY, cs * 0.03, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  /**
   * Draws the movement trail (fading circles behind the player).
   */
  drawTrail(trail) {
    if (!this.cellSize) return;

    const ctx = this.ctx;
    const cs = this.cellSize;
    const sx = this.shakeOffset.x;
    const sy = this.shakeOffset.y;

    for (const p of trail) {
      const px = this.offsetX + p.x * cs + cs / 2 + sx;
      const py = this.offsetY + p.y * cs + cs / 2 + sy;
      const radius = cs * 0.12 * p.alpha;

      ctx.fillStyle = `rgba(251, 191, 36, ${p.alpha * 0.5})`;
      ctx.beginPath();
      ctx.arc(px, py, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /**
   * Draws the player with glow, gradient fill, squash/stretch, and direction eye.
   * @param {Object} display - Interpolated {x, y} position (float)
   * @param {string|null} lastDirection - Last movement direction
   * @param {Object} target - Logical grid {x, y} position
   */
  drawPlayer(display, lastDirection, target) {
    if (!this.cellSize) return;

    const ctx = this.ctx;
    const cs = this.cellSize;
    const px = this.offsetX + display.x * cs + this.shakeOffset.x;
    const py = this.offsetY + display.y * cs + this.shakeOffset.y;
    const cx = px + cs / 2;
    const cy = py + cs / 2;
    const baseRadius = cs * 0.36;

    // Calculate squash/stretch based on distance to target
    const dx = target.x - display.x;
    const dy = target.y - display.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const stretch = 1 + dist * 0.3;
    const squash = 1 / Math.sqrt(stretch);

    // Determine stretch axis
    let scaleX = 1, scaleY = 1;
    if (Math.abs(dx) > Math.abs(dy)) {
      scaleX = stretch;
      scaleY = squash;
    } else if (dist > 0.01) {
      scaleX = squash;
      scaleY = stretch;
    }

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scaleX, scaleY);

    // Outer glow
    const glowGrad = ctx.createRadialGradient(0, 0, baseRadius * 0.5, 0, 0, baseRadius * 1.8);
    glowGrad.addColorStop(0, this.colors.playerGlow);
    glowGrad.addColorStop(1, "rgba(251, 191, 36, 0)");
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(0, 0, baseRadius * 1.8, 0, Math.PI * 2);
    ctx.fill();

    // Main body gradient
    const bodyGrad = ctx.createRadialGradient(
      -baseRadius * 0.2, -baseRadius * 0.2, baseRadius * 0.1,
      0, 0, baseRadius
    );
    bodyGrad.addColorStop(0, this.colors.playerHighlight);
    bodyGrad.addColorStop(0.6, this.colors.player);
    bodyGrad.addColorStop(1, "#d97706");
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.arc(0, 0, baseRadius, 0, Math.PI * 2);
    ctx.fill();

    // Subtle shadow ring
    ctx.strokeStyle = "rgba(0,0,0,0.2)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, baseRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Specular highlight
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.beginPath();
    ctx.arc(-baseRadius * 0.2, -baseRadius * 0.25, baseRadius * 0.25, 0, Math.PI * 2);
    ctx.fill();

    // Direction-aware eyes
    let eyeOffX = 0, eyeOffY = 0;
    switch (lastDirection) {
      case "UP":    eyeOffY = -baseRadius * 0.2; break;
      case "DOWN":  eyeOffY = baseRadius * 0.2;  break;
      case "LEFT":  eyeOffX = -baseRadius * 0.2; break;
      case "RIGHT": eyeOffX = baseRadius * 0.2;  break;
    }

    // Eye whites
    const eyeRadius = baseRadius * 0.14;
    const eyeSpacing = baseRadius * 0.22;
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(-eyeSpacing + eyeOffX, -baseRadius * 0.05 + eyeOffY, eyeRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(eyeSpacing + eyeOffX, -baseRadius * 0.05 + eyeOffY, eyeRadius, 0, Math.PI * 2);
    ctx.fill();

    // Pupils
    const pupilR = eyeRadius * 0.55;
    ctx.fillStyle = "#1a1a2e";
    ctx.beginPath();
    ctx.arc(-eyeSpacing + eyeOffX * 1.3, -baseRadius * 0.05 + eyeOffY * 1.3, pupilR, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(eyeSpacing + eyeOffX * 1.3, -baseRadius * 0.05 + eyeOffY * 1.3, pupilR, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  /**
   * Draws a vignette overlay. Turns red when time is running out.
   * @param {number} timeRatio - 0..1 how much time has passed
   */
  drawVignette(timeRatio) {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const outerRadius = Math.sqrt(cx * cx + cy * cy);

    // Base vignette (always present, subtle)
    const baseVignette = ctx.createRadialGradient(cx, cy, outerRadius * 0.5, cx, cy, outerRadius);
    baseVignette.addColorStop(0, "rgba(0,0,0,0)");
    baseVignette.addColorStop(1, "rgba(0,0,0,0.4)");
    ctx.fillStyle = baseVignette;
    ctx.fillRect(0, 0, w, h);

    // Danger vignette — fades in when >75% time used, pulses when >90%
    if (timeRatio > 0.75) {
      const dangerIntensity = Math.min(1, (timeRatio - 0.75) / 0.25);
      const pulse = timeRatio > 0.9
        ? 0.5 + Math.sin(this.time * 6) * 0.5
        : 1;
      const alpha = dangerIntensity * 0.3 * pulse;

      const dangerGrad = ctx.createRadialGradient(cx, cy, outerRadius * 0.3, cx, cy, outerRadius);
      dangerGrad.addColorStop(0, "rgba(239,68,68,0)");
      dangerGrad.addColorStop(0.7, `rgba(239,68,68,${alpha * 0.3})`);
      dangerGrad.addColorStop(1, `rgba(239,68,68,${alpha})`);
      ctx.fillStyle = dangerGrad;
      ctx.fillRect(0, 0, w, h);
    }
  }

  /**
   * Triggers a brief screen shake effect.
   */
  shake(duration = 120, intensity = 4) {
    const start = performance.now();
    const animate = (now) => {
      const elapsed = now - start;
      if (elapsed < duration) {
        const decay = 1 - elapsed / duration;
        this.shakeOffset.x = (Math.random() - 0.5) * intensity * 2 * decay;
        this.shakeOffset.y = (Math.random() - 0.5) * intensity * 2 * decay;
        requestAnimationFrame(animate);
      } else {
        this.shakeOffset.x = 0;
        this.shakeOffset.y = 0;
      }
    };
    requestAnimationFrame(animate);
  }
}
