import { useEffect, useRef } from 'react';

interface AmbientLovesCanvasProps {
  active: boolean;
}

interface AmbientHeart {
  baseX: number;
  y: number;
  z: number;
  size: number;
  opacity: number;
  vy: number;
  swayPhase: number;
  swayFreq: number;
  swayAmp: number;
  yaw: number;
  yawSpeed: number;
  pitch: number;
  pitchSpeed: number;
  roll: number;
  rollSpeed: number;
  matIdx: number;
  blurTier: number;
}

interface DustMote {
  x: number;
  y: number;
  vy: number;
  size: number;
  phase: number;
  freq: number;
}

interface HeartPalette {
  c0: string;
  c1: string;
  c2: string;
  rim: string;
  specAlpha: number;
}

const PALETTES: HeartPalette[] = [
  // Deep Velvet Burgundy
  {
    c0: '#9e2636',
    c1: '#5a121b',
    c2: '#2d060b',
    rim: 'rgba(228, 188, 174, 0.35)',
    specAlpha: 0.55,
  },
  // Antique Champagne Gold
  {
    c0: '#f8e6b4',
    c1: '#cc9b4d',
    c2: '#7a521d',
    rim: 'rgba(255, 248, 224, 0.45)',
    specAlpha: 0.72,
  },
  // Rose Ruby
  {
    c0: '#c73a4e',
    c1: '#781826',
    c2: '#390910',
    rim: 'rgba(255, 222, 220, 0.38)',
    specAlpha: 0.65,
  },
];

function traceHeart(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(cx, cy + r * 0.82);
  ctx.bezierCurveTo(
    cx - r * 1.12,
    cy + r * 0.22,
    cx - r * 1.12,
    cy - r * 0.78,
    cx - r * 0.48,
    cy - r * 0.82
  );
  ctx.bezierCurveTo(
    cx - r * 0.14,
    cy - r * 0.84,
    cx,
    cy - r * 0.52,
    cx,
    cy - r * 0.36
  );
  ctx.bezierCurveTo(
    cx,
    cy - r * 0.52,
    cx + r * 0.14,
    cy - r * 0.84,
    cx + r * 0.48,
    cy - r * 0.82
  );
  ctx.bezierCurveTo(
    cx + r * 1.12,
    cy - r * 0.78,
    cx + r * 1.12,
    cy + r * 0.22,
    cx,
    cy + r * 0.82
  );
  ctx.closePath();
}

function bakeAmbientHeart(pal: HeartPalette, blurPx: number): HTMLCanvasElement {
  const s = 64;
  const cx = s / 2;
  const cy = s / 2 + 1.5;
  const r = 20;

  const sharp = document.createElement('canvas');
  sharp.width = s;
  sharp.height = s;
  const ctx = sharp.getContext('2d');
  if (!ctx) return sharp;

  ctx.save();
  traceHeart(ctx, cx, cy, r);
  ctx.clip();

  const grad = ctx.createRadialGradient(
    cx - r * 0.34,
    cy - r * 0.34,
    r * 0.08,
    cx + r * 0.12,
    cy + r * 0.14,
    r * 1.38
  );
  grad.addColorStop(0, pal.c0);
  grad.addColorStop(0.55, pal.c1);
  grad.addColorStop(1, pal.c2);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, s, s);

  ctx.globalCompositeOperation = 'lighter';
  ctx.save();
  ctx.translate(cx - r * 0.34, cy - r * 0.34);
  ctx.rotate(-0.48);
  const spec = ctx.createRadialGradient(0, 0, 0.5, 0, 0, r * 0.36);
  spec.addColorStop(0, `rgba(255, 248, 236, ${pal.specAlpha})`);
  spec.addColorStop(1, 'rgba(255, 248, 236, 0)');
  ctx.fillStyle = spec;
  ctx.scale(1.15, 0.62);
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.36, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.restore();

  ctx.save();
  traceHeart(ctx, cx, cy, r);
  ctx.strokeStyle = pal.rim;
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();

  if (blurPx <= 0) return sharp;
  const out = document.createElement('canvas');
  out.width = s;
  out.height = s;
  const bctx = out.getContext('2d');
  if (bctx) {
    bctx.filter = `blur(${blurPx}px)`;
    bctx.drawImage(sharp, 0, 0);
  }
  return out;
}

function bakeGoldDust(): HTMLCanvasElement {
  const s = 14;
  const c = document.createElement('canvas');
  c.width = s;
  c.height = s;
  const ctx = c.getContext('2d');
  if (!ctx) return c;
  const g = ctx.createRadialGradient(s / 2, s / 2, 0.4, s / 2, s / 2, s / 2);
  g.addColorStop(0, 'rgba(232, 188, 108, 0.92)');
  g.addColorStop(0.45, 'rgba(200, 155, 84, 0.44)');
  g.addColorStop(1, 'rgba(200, 155, 84, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  return c;
}

/**
 * Subtle, atmospheric 3D-shaded living floating hearts & golden stardust
 * drifting continuously across the invitation viewport on both PC & Mobile.
 * Edge-biased on mobile so typography stays effortlessly clear;
 * lushly framing the parchment margins on desktop.
 */
export function AmbientLovesCanvas({ active }: AmbientLovesCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const sprites = PALETTES.map((pal) => [
      bakeAmbientHeart(pal, 2.2),
      bakeAmbientHeart(pal, 0),
    ]);
    const dustSprite = bakeGoldDust();

    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const pickEdgeBiasedX = () => {
      if (width >= 768) {
        // 88% in the scenic outer cream margins flanking the central 560px column, 12% near column edges
        const colHalf = Math.min(286, width * 0.34);
        const sideMargin = Math.max(40, width * 0.5 - colHalf);
        if (Math.random() < 0.88) {
          return Math.random() < 0.5
            ? Math.random() * (sideMargin - 8)
            : width - Math.random() * (sideMargin - 8);
        }
        return Math.random() < 0.5
          ? width * 0.5 - colHalf + Math.random() * 26
          : width * 0.5 + colHalf - Math.random() * 26;
      }
      // Mobile: keep hearts gracefully drifting along the outer left & right 15% periphery so text stays crystal clear
      return Math.random() < 0.5
        ? 6 + Math.random() * (width * 0.14)
        : width * 0.86 + Math.random() * (width * 0.14 - 6);
    };

    const isMobile = width < 768;
    const heartCount = isMobile ? 14 : 24;
    const dustCount = isMobile ? 14 : 24;

    const hearts: AmbientHeart[] = Array.from({ length: heartCount }, (_, i) => {
      const isFar = i < heartCount * 0.42;
      const z = isFar ? 0.28 + Math.random() * 0.26 : 0.62 + Math.random() * 0.38;
      return {
        baseX: pickEdgeBiasedX(),
        y: Math.random() * height,
        z,
        size: isMobile
          ? (isFar ? 13 : 17) + Math.random() * 7
          : (isFar ? 18 : 22) + Math.random() * 14,
        opacity: isMobile
          ? (isFar ? 0.24 : 0.38) + Math.random() * 0.14
          : (isFar ? 0.26 : 0.48) + Math.random() * 0.18,
        vy: (isFar ? 8 : 13) + Math.random() * 8,
        swayPhase: Math.random() * Math.PI * 2,
        swayFreq: 0.45 + Math.random() * 0.55,
        swayAmp: isMobile ? 6 + Math.random() * 8 : 12 + Math.random() * 18,
        yaw: Math.random() * Math.PI * 2,
        yawSpeed: (0.45 + Math.random() * 0.65) * (Math.random() < 0.5 ? 1 : -1),
        pitch: Math.random() * Math.PI * 2,
        pitchSpeed: 0.35 + Math.random() * 0.45,
        roll: (Math.random() - 0.5) * 0.4,
        rollSpeed: (Math.random() - 0.5) * 0.22,
        matIdx: i % PALETTES.length,
        blurTier: isFar ? 0 : 1,
      };
    }).sort((a, b) => a.z - b.z);

    const dusts: DustMote[] = Array.from({ length: dustCount }, () => ({
      x: pickEdgeBiasedX(),
      y: Math.random() * height,
      vy: 6 + Math.random() * 9,
      size: 4 + Math.random() * 6,
      phase: Math.random() * Math.PI * 2,
      freq: 1.1 + Math.random() * 1.4,
    }));

    const handleResize = () => {
      resize();
      for (let i = 0; i < hearts.length; i++) {
        hearts[i].baseX = pickEdgeBiasedX();
      }
      for (let i = 0; i < dusts.length; i++) {
        dusts[i].x = pickEdgeBiasedX();
      }
    };

    let targetPx = 0;
    let targetPy = 0;
    let curPx = 0;
    let curPy = 0;
    let lastScrollY = window.scrollY;
    let scrollVelocity = 0;

    const onPointerMove = (e: PointerEvent) => {
      targetPx = (e.clientX / Math.max(width, 1) - 0.5) * 2;
      targetPy = (e.clientY / Math.max(height, 1) - 0.5) * 2;
    };

    const onScroll = () => {
      const sy = window.scrollY;
      scrollVelocity = Math.max(-40, Math.min(40, (sy - lastScrollY) * 0.25));
      lastScrollY = sy;
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });

    let rafId = 0;
    let lastNow = performance.now();
    let elapsed = 0;
    let hidden = document.visibilityState === 'hidden';

    const onVis = () => {
      hidden = document.visibilityState === 'hidden';
      if (!hidden) lastNow = performance.now();
    };
    document.addEventListener('visibilitychange', onVis);

    const tick = (now: number) => {
      if (!hidden) {
        const dt = Math.min((now - lastNow) / 1000, 0.05);
        lastNow = now;
        elapsed += dt;

        const damp = 1 - Math.exp(-3.8 * dt);
        curPx += (targetPx - curPx) * damp;
        curPy += (targetPy - curPy) * damp;
        scrollVelocity *= Math.pow(0.88, dt * 60);

        ctx.clearRect(0, 0, width, height);

        // Soft golden dust motes
        for (let i = 0; i < dusts.length; i++) {
          const d = dusts[i];
          d.y -= (d.vy + scrollVelocity * 0.28) * dt;
          if (d.y < -12) {
            d.y = height + 12;
            d.x = pickEdgeBiasedX();
          } else if (d.y > height + 16) {
            d.y = -10;
          }
          const tw = 0.22 + 0.56 * Math.pow(Math.sin(elapsed * d.freq + d.phase), 2);
          ctx.globalAlpha = tw;
          ctx.drawImage(
            dustSprite,
            d.x - d.size * 0.5,
            d.y - d.size * 0.5,
            d.size,
            d.size
          );
        }

        // Living 3D-shaded floating hearts
        for (let i = 0; i < hearts.length; i++) {
          const h = hearts[i];
          h.y -= (h.vy + scrollVelocity * h.z * 0.45) * dt;
          h.yaw += h.yawSpeed * dt;
          h.pitch += h.pitchSpeed * dt;
          h.roll += h.rollSpeed * dt;

          if (h.y < -h.size - 16) {
            h.y = height + h.size + 12;
            h.baseX = pickEdgeBiasedX();
          } else if (h.y > height + h.size + 24) {
            h.y = -h.size - 8;
            h.baseX = pickEdgeBiasedX();
          }

          const swayX = Math.sin(elapsed * h.swayFreq + h.swayPhase) * h.swayAmp;
          const drawX = h.baseX + swayX + curPx * h.z * 16;
          const drawY = h.y + curPy * h.z * 12;

          const cosYaw = Math.cos(h.yaw);
          const scaleX =
            Math.abs(cosYaw) < 0.24 ? (cosYaw < 0 ? -0.24 : 0.24) : cosYaw;
          const scaleY = 0.92 + 0.08 * Math.cos(h.pitch);

          const spr = sprites[h.matIdx][h.blurTier];
          ctx.save();
          ctx.globalAlpha = h.opacity * (0.72 + 0.28 * Math.abs(scaleX));
          ctx.translate(drawX, drawY);
          ctx.rotate(h.roll);
          ctx.scale(scaleX, scaleY);
          ctx.drawImage(spr, -h.size * 0.5, -h.size * 0.5, h.size, h.size);
          ctx.restore();
        }

        ctx.globalAlpha = 1;
      }

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="ambient-loves-canvas"
      aria-hidden="true"
    />
  );
}
