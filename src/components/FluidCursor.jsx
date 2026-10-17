import { useEffect, useRef } from "react";

const POINT_COUNT = 22;
const SUBDIVISIONS = 3;
const SAMPLE_COUNT = (POINT_COUNT - 1) * SUBDIVISIONS + 1;
const CAP_STEPS = 8;
const MAX_DPR = 1.5;
const DIRTY_PADDING = 44;

const STRANDS = [
  { follow: 0.34, chain: 0.36, width: 15, phase: 0, swirl: 0, hueShift: 0 },
  { follow: 0.24, chain: 0.3, width: 11, phase: 2.1, swirl: 18, hueShift: 12 },
  { follow: 0.17, chain: 0.26, width: 8, phase: 4.2, swirl: -26, hueShift: -12 },
];

const PASSES = [
  { scale: 3.4, alpha: 0.09, light: 55 },
  { scale: 1.9, alpha: 0.2, light: 58 },
  { scale: 1, alpha: 0.7, light: 60 },
  { scale: 0.3, alpha: 0.8, light: 88 },
];

const lerpFactor = (k, dt) => 1 - Math.pow(1 - k, dt * 60);

const hsla = (hue, saturation, lightness, alpha) =>
  `hsla(${hue.toFixed(1)}, ${saturation}%, ${lightness}%, ${alpha})`;

const spline = (a, b, c, d, t) => {
  const t2 = t * t;
  const t3 = t2 * t;
  return 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
};

function createStrand(config) {
  return {
    cfg: config,
    pts: Array.from({ length: POINT_COUNT }, () => ({ x: 0, y: 0 })),
    xs: new Float32Array(SAMPLE_COUNT),
    ys: new Float32Array(SAMPLE_COUNT),
    nx: new Float32Array(SAMPLE_COUNT),
    ny: new Float32Array(SAMPLE_COUNT),
    tx: new Float32Array(SAMPLE_COUNT),
    ty: new Float32Array(SAMPLE_COUNT),
    ws: new Float32Array(SAMPLE_COUNT),
  };
}

function buildSamples(strand, maxWidth) {
  const { pts, xs, ys, nx, ny, tx, ty, ws } = strand;
  let count = 0;

  for (let i = 0; i < POINT_COUNT - 1; i += 1) {
    const a = pts[Math.max(i - 1, 0)];
    const b = pts[i];
    const c = pts[i + 1];
    const d = pts[Math.min(i + 2, POINT_COUNT - 1)];
    for (let s = 0; s < SUBDIVISIONS; s += 1) {
      const t = s / SUBDIVISIONS;
      xs[count] = spline(a.x, b.x, c.x, d.x, t);
      ys[count] = spline(a.y, b.y, c.y, d.y, t);
      count += 1;
    }
  }

  const tail = pts[POINT_COUNT - 1];
  xs[count] = tail.x;
  ys[count] = tail.y;
  count += 1;

  for (let i = 0; i < count; i += 1) {
    const previous = Math.max(i - 1, 0);
    const next = Math.min(i + 1, count - 1);
    const dx = xs[next] - xs[previous];
    const dy = ys[next] - ys[previous];
    const length = Math.hypot(dx, dy);
    if (length > 1e-4) {
      tx[i] = dx / length;
      ty[i] = dy / length;
    } else {
      tx[i] = i > 0 ? tx[i - 1] : 1;
      ty[i] = i > 0 ? ty[i - 1] : 0;
    }
    nx[i] = -ty[i];
    ny[i] = tx[i];
    ws[i] = maxWidth * Math.pow(1 - i / (count - 1), 1.25);
  }
}

function tracePath(ctx, strand, scale) {
  const { xs, ys, nx, ny, tx, ty, ws } = strand;
  const last = SAMPLE_COUNT - 1;

  ctx.beginPath();
  ctx.moveTo(xs[0] + nx[0] * ws[0] * scale * 0.5, ys[0] + ny[0] * ws[0] * scale * 0.5);

  for (let i = 1; i <= last; i += 1) {
    const half = ws[i] * scale * 0.5;
    ctx.lineTo(xs[i] + nx[i] * half, ys[i] + ny[i] * half);
  }

  for (let i = last; i >= 0; i -= 1) {
    const half = ws[i] * scale * 0.5;
    ctx.lineTo(xs[i] - nx[i] * half, ys[i] - ny[i] * half);
  }

  const radius = ws[0] * scale * 0.5;
  const frontX = -tx[0];
  const frontY = -ty[0];

  for (let k = 1; k <= CAP_STEPS; k += 1) {
    const theta = (Math.PI * k) / CAP_STEPS;
    const cos = Math.cos(theta);
    const sin = Math.sin(theta);
    ctx.lineTo(xs[0] + radius * (-nx[0] * cos + frontX * sin), ys[0] + radius * (-ny[0] * cos + frontY * sin));
  }

  ctx.closePath();
}

export default function FluidCursor() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!finePointer.matches || reducedMotion.matches) return undefined;

    const ctx = canvas.getContext("2d", { desynchronized: true });
    if (!ctx) return undefined;

    const root = document.documentElement;
    const strands = STRANDS.map(createStrand);
    const pointer = { x: 0, y: 0 };
    const previous = { x: 0, y: 0 };
    const direction = { x: 1, y: 0 };

    let viewWidth = 0;
    let viewHeight = 0;
    let dirty = null;
    let frameId = 0;
    let lastTime = 0;
    let elapsed = 0;
    let energy = 0;
    let ready = false;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      viewWidth = window.innerWidth;
      viewHeight = window.innerHeight;
      canvas.width = Math.round(viewWidth * dpr);
      canvas.height = Math.round(viewHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      dirty = null;
    };

    const clearDirty = () => {
      if (dirty) ctx.clearRect(dirty.x0, dirty.y0, dirty.x1 - dirty.x0, dirty.y1 - dirty.y0);
      else ctx.clearRect(0, 0, viewWidth, viewHeight);
    };

    const render = (now) => {
      frameId = 0;
      const dt = Math.min(Math.max((now - lastTime) / 1000, 0.001), 0.05);
      lastTime = now;
      elapsed += dt;

      const moveX = pointer.x - previous.x;
      const moveY = pointer.y - previous.y;
      previous.x = pointer.x;
      previous.y = pointer.y;
      const distance = Math.hypot(moveX, moveY);
      if (distance > 0.5) {
        direction.x = moveX / distance;
        direction.y = moveY / distance;
      }

      const speed = distance / dt;
      energy += (Math.min(speed / 1600, 1) - energy) * (1 - Math.exp(-dt * 7));

      const perpX = -direction.y;
      const perpY = direction.x;
      let spread = 0;

      strands.forEach((strand) => {
        const { cfg, pts } = strand;
        const swirl = Math.sin(elapsed * 5 + cfg.phase) * cfg.swirl * energy;
        const targetX = pointer.x + perpX * swirl;
        const targetY = pointer.y + perpY * swirl;
        const headK = lerpFactor(cfg.follow, dt);
        pts[0].x += (targetX - pts[0].x) * headK;
        pts[0].y += (targetY - pts[0].y) * headK;

        const chainK = lerpFactor(cfg.chain, dt);
        for (let i = 1; i < POINT_COUNT; i += 1) {
          pts[i].x += (pts[i - 1].x - pts[i].x) * chainK;
          pts[i].y += (pts[i - 1].y - pts[i].y) * chainK;
        }

        const tail = pts[POINT_COUNT - 1];
        spread = Math.max(spread, Math.hypot(tail.x - pointer.x, tail.y - pointer.y));
      });

      const normX = pointer.x / viewWidth;
      const normY = pointer.y / viewHeight;
      const headHue = 190 - normY * 28 - energy * 40;
      const tailHue = 46 + normX * 22;

      clearDirty();
      ctx.globalCompositeOperation = "lighter";

      let minX = pointer.x;
      let maxX = pointer.x;
      let minY = pointer.y;
      let maxY = pointer.y;

      strands.forEach((strand) => {
        const maxWidth = strand.cfg.width * (0.45 + 0.55 * energy) * (1 + 0.08 * Math.sin(elapsed * 6 + strand.cfg.phase));
        buildSamples(strand, maxWidth);

        const hueHead = headHue + strand.cfg.hueShift;
        const hueTail = tailHue + strand.cfg.hueShift * 0.5;
        const hueMid = (hueHead + hueTail) / 2;
        const lastIndex = SAMPLE_COUNT - 1;

        PASSES.forEach((pass) => {
          const gradient = ctx.createLinearGradient(
            strand.xs[0],
            strand.ys[0],
            strand.xs[lastIndex] + 0.01,
            strand.ys[lastIndex]
          );
          gradient.addColorStop(0, hsla(hueHead, 100, pass.light, pass.alpha));
          gradient.addColorStop(0.5, hsla(hueMid, 100, pass.light - 4, pass.alpha * 0.85));
          gradient.addColorStop(1, hsla(hueTail, 100, pass.light - 8, 0));
          ctx.fillStyle = gradient;
          tracePath(ctx, strand, pass.scale);
          ctx.fill();
        });

        for (let i = 0; i < SAMPLE_COUNT; i += 1) {
          if (strand.xs[i] < minX) minX = strand.xs[i];
          if (strand.xs[i] > maxX) maxX = strand.xs[i];
          if (strand.ys[i] < minY) minY = strand.ys[i];
          if (strand.ys[i] > maxY) maxY = strand.ys[i];
        }
      });

      const glow = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, 26);
      glow.addColorStop(0, hsla(headHue, 100, 75, 0.9));
      glow.addColorStop(0.25, hsla(headHue, 100, 60, 0.45));
      glow.addColorStop(1, hsla(headHue, 100, 50, 0));
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(pointer.x, pointer.y, 26, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = hsla(headHue, 100, 92, 0.95);
      ctx.beginPath();
      ctx.arc(pointer.x, pointer.y, 2.4, 0, Math.PI * 2);
      ctx.fill();

      dirty = {
        x0: Math.max(0, Math.floor(minX - DIRTY_PADDING)),
        y0: Math.max(0, Math.floor(minY - DIRTY_PADDING)),
        x1: Math.min(viewWidth, Math.ceil(maxX + DIRTY_PADDING)),
        y1: Math.min(viewHeight, Math.ceil(maxY + DIRTY_PADDING)),
      };

      if (energy < 0.02 && spread < 0.8) return;
      frameId = requestAnimationFrame(render);
    };

    const wake = () => {
      if (frameId) return;
      lastTime = performance.now();
      frameId = requestAnimationFrame(render);
    };

    const handleMove = (event) => {
      if (event.pointerType === "touch") return;
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      if (!ready) {
        ready = true;
        previous.x = pointer.x;
        previous.y = pointer.y;
        strands.forEach((strand) => {
          strand.pts.forEach((point) => {
            point.x = pointer.x;
            point.y = pointer.y;
          });
        });
      }
      wake();
    };

    const handleLeave = () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
        frameId = 0;
      }
      ctx.clearRect(0, 0, viewWidth, viewHeight);
      dirty = null;
      ready = false;
      energy = 0;
    };

    resize();
    root.classList.add("fluid-cursor-active");
    window.addEventListener("pointermove", handleMove, { passive: true });
    window.addEventListener("resize", resize);
    window.addEventListener("blur", handleLeave);
    root.addEventListener("mouseleave", handleLeave);

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("resize", resize);
      window.removeEventListener("blur", handleLeave);
      root.removeEventListener("mouseleave", handleLeave);
      root.classList.remove("fluid-cursor-active");
    };
  }, []);

  return <canvas ref={canvasRef} className="fluid-cursor" aria-hidden="true" />;
}