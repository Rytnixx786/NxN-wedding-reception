import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

export interface LivingHeartsCanvasHandle {
  triggerBurst: (clientX: number, clientY: number) => void;
  sweepOut: () => void;
}

interface LivingHeartsCanvasProps {
  active: boolean;
}

interface HeartParticle {
  baseX: number;
  x: number;
  y: number;
  z: number; // 0.18 (far bokeh) -> 1.0 (foreground accent)
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
  tierIdx: number; // 0 = far bokeh, 1 = mid crisp, 2 = near soft
  vxOut: number;
}

interface EmberParticle {
  x: number;
  y: number;
  vy: number;
  size: number;
  phase: number;
  freq: number;
  drift: number;
}

interface BurstParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  rot: number;
  rotSpeed: number;
  isHeart: boolean;
  matIdx: number;
}

interface MaterialSpec {
  c0: string;
  c1: string;
  c2: string;
  rim: string;
  specAlpha: number;
  goldBounce: number;
}

const MATERIALS: MaterialSpec[] = [
  // 0: Velvet Crimson
  {
    c0: '#a3283a',
    c1: '#5d141e',
    c2: '#27050a',
    rim: 'rgba(228, 175, 180, 0.28)',
    specAlpha: 0.42,
    goldBounce: 0.18,
  },
  // 1: Glossy Ruby Lacquer
  {
    c0: '#d6364c',
    c1: '#7c1623',
    c2: '#2e060c',
    rim: 'rgba(255, 226, 222, 0.36)',
    specAlpha: 0.72,
    goldBounce: 0.3,
  },
  // 2: Brushed Rose-Gold
  {
    c0: '#f7dfd0',
    c1: '#cc8c74',
    c2: '#743732',
    rim: 'rgba(255, 244, 232, 0.45)',
    specAlpha: 0.62,
    goldBounce: 0.36,
  },
  // 3: Champagne Gold
  {
    c0: '#fff2be',
    c1: '#cf9e52',
    c2: '#6b4717',
    rim: 'rgba(255, 248, 220, 0.5)',
    specAlpha: 0.78,
    goldBounce: 0.42,
  },
];

function drawHeartPath(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
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

function bakeHeartSprite(mat: MaterialSpec, blurPx: number): HTMLCanvasElement {
  const size = 96;
  const cx = size / 2;
  const cy = size / 2 + 2;
  const r = 30;

  // Bake sharp sprite first
  const sharp = document.createElement('canvas');
  sharp.width = size;
  sharp.height = size;
  const ctx = sharp.getContext('2d');
  if (!ctx) return sharp;

  ctx.save();
  drawHeartPath(ctx, cx, cy, r);
  ctx.clip();

  // 1. Key-lit 3D off-center radial fill (upper-left 11 o'clock light)
  const diff = ctx.createRadialGradient(
    cx - r * 0.34,
    cy - r * 0.36,
    r * 0.08,
    cx + r * 0.1,
    cy + r * 0.1,
    r * 1.38
  );
  diff.addColorStop(0, mat.c0);
  diff.addColorStop(0.54, mat.c1);
  diff.addColorStop(1, mat.c2);
  ctx.fillStyle = diff;
  ctx.fillRect(0, 0, size, size);

  // 2. Lower-right crescent ambient occlusion shadow
  ctx.globalCompositeOperation = 'source-atop';
  const ao = ctx.createRadialGradient(
    cx - r * 0.25,
    cy - r * 0.28,
    r * 0.45,
    cx + r * 0.2,
    cy + r * 0.3,
    r * 1.25
  );
  ao.addColorStop(0, 'rgba(0,0,0,0)');
  ao.addColorStop(0.7, 'rgba(20, 3, 6, 0.18)');
  ao.addColorStop(1, 'rgba(18, 2, 5, 0.48)');
  ctx.fillStyle = ao;
  ctx.fillRect(0, 0, size, size);

  // 3. Warm antique-gold lower-right bounce rim light
  const bounce = ctx.createRadialGradient(
    cx + r * 0.48,
    cy + r * 0.42,
    r * 0.04,
    cx + r * 0.35,
    cy + r * 0.32,
    r * 0.72
  );
  bounce.addColorStop(0, `rgba(244, 212, 148, ${mat.goldBounce})`);
  bounce.addColorStop(1, 'rgba(244, 212, 148, 0)');
  ctx.fillStyle = bounce;
  ctx.fillRect(0, 0, size, size);

  // 4. Dual glossy specular lobe highlights (gives real 3D plump glass/jewel feel)
  ctx.globalCompositeOperation = 'lighter';
  ctx.save();
  ctx.translate(cx - r * 0.36, cy - r * 0.36);
  ctx.rotate(-0.48);
  const specL = ctx.createRadialGradient(0, 0, 0.5, 0, 0, r * 0.34);
  specL.addColorStop(0, `rgba(255, 248, 238, ${mat.specAlpha})`);
  specL.addColorStop(0.55, `rgba(255, 242, 224, ${mat.specAlpha * 0.32})`);
  specL.addColorStop(1, 'rgba(255, 242, 224, 0)');
  ctx.fillStyle = specL;
  ctx.scale(1.15, 0.62);
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.34, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.translate(cx + r * 0.36, cy - r * 0.34);
  ctx.rotate(0.45);
  const specR = ctx.createRadialGradient(0, 0, 0.5, 0, 0, r * 0.24);
  specR.addColorStop(0, `rgba(255, 246, 234, ${mat.specAlpha * 0.52})`);
  specR.addColorStop(1, 'rgba(255, 246, 234, 0)');
  ctx.fillStyle = specR;
  ctx.scale(1.05, 0.58);
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.24, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.restore();

  // 5. Delicate satin rim stroke
  ctx.save();
  drawHeartPath(ctx, cx, cy, r);
  ctx.strokeStyle = mat.rim;
  ctx.lineWidth = 1.15;
  ctx.stroke();
  ctx.restore();

  if (blurPx <= 0) return sharp;

  const blurred = document.createElement('canvas');
  blurred.width = size;
  blurred.height = size;
  const bctx = blurred.getContext('2d');
  if (bctx) {
    bctx.filter = `blur(${blurPx}px)`;
    bctx.drawImage(sharp, 0, 0);
  }
  return blurred;
}

function bakeEmberSprite(): HTMLCanvasElement {
  const s = 18;
  const c = document.createElement('canvas');
  c.width = s;
  c.height = s;
  const ctx = c.getContext('2d');
  if (!ctx) return c;
  const g = ctx.createRadialGradient(s / 2, s / 2, 0.5, s / 2, s / 2, s / 2);
  g.addColorStop(0, 'rgba(255, 246, 214, 1)');
  g.addColorStop(0.38, 'rgba(232, 194, 118, 0.68)');
  g.addColorStop(1, 'rgba(232, 194, 118, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  return c;
}

export const LivingHeartsCanvas = forwardRef<
  LivingHeartsCanvasHandle,
  LivingHeartsCanvasProps
>(function LivingHeartsCanvas({ active }, ref) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const burstQueueRef = useRef<Array<{ x: number; y: number }>>([]);
  const sweepingOutRef = useRef(false);

  useImperativeHandle(ref, () => ({
    triggerBurst(clientX: number, clientY: number) {
      burstQueueRef.current.push({ x: clientX, y: clientY });
    },
    sweepOut() {
      sweepingOutRef.current = true;
    },
  }));

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Always animate living 3D floating hearts so the burgundy cover stays alive
    const reducedMotion = false;

    // Pre-bake 4 materials x 3 DoF tiers (init-time only)
    const blurTiers = [4.5, 0, 1.4]; // 0 = far bokeh, 1 = mid crisp, 2 = fore near-soft
    const sprites: HTMLCanvasElement[][] = MATERIALS.map((mat) =>
      blurTiers.map((b) => bakeHeartSprite(mat, b))
    );
    const emberSprite = bakeEmberSprite();

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

    // Adaptive particle budget for locked 60fps mobile & desktop
    const isSmall = width < 640;
    const lowCpu = (navigator.hardwareConcurrency || 8) <= 4;
    const heartCount = isSmall ? (lowCpu ? 18 : 26) : 36;
    const emberCount = isSmall ? (lowCpu ? 16 : 26) : 42;

    const hearts: HeartParticle[] = [];
    for (let i = 0; i < heartCount; i++) {
      const ratio = i / heartCount;
      // 35% far bokeh, 45% mid crisp, 20% foreground accent
      let tierIdx = 1;
      let z = 0.55;
      let size = 28;
      let opacity = 0.72;
      let vy = 16;

      if (ratio < 0.35) {
        tierIdx = 0;
        z = 0.18 + Math.random() * 0.24;
        size = 34 + Math.random() * 26;
        opacity = 0.26 + Math.random() * 0.2;
        vy = 7 + Math.random() * 6;
      } else if (ratio < 0.8) {
        tierIdx = 1;
        z = 0.45 + Math.random() * 0.33;
        size = 20 + Math.random() * 18;
        opacity = 0.62 + Math.random() * 0.26;
        vy = 13 + Math.random() * 10;
      } else {
        tierIdx = 2;
        z = 0.82 + Math.random() * 0.18;
        size = 42 + Math.random() * 22;
        opacity = 0.78 + Math.random() * 0.16;
        vy = 20 + Math.random() * 11;
      }

      // Bias foreground hearts gently outside the center typography safe-zone
      let baseX = Math.random() * width;
      let y = Math.random() * height;
      if (tierIdx === 2) {
        const dx = (baseX - width * 0.5) / (width * 0.32);
        const dy = (y - height * 0.5) / (height * 0.3);
        if (dx * dx + dy * dy < 1) {
          baseX =
            baseX < width * 0.5
              ? Math.random() * width * 0.24
              : width * 0.76 + Math.random() * width * 0.24;
        }
      }

      hearts.push({
        baseX,
        x: baseX,
        y,
        z,
        size,
        opacity,
        vy,
        swayPhase: Math.random() * Math.PI * 2,
        swayFreq: 0.45 + Math.random() * 0.55,
        swayAmp: 12 + Math.random() * 24,
        yaw: Math.random() * Math.PI * 2,
        yawSpeed: (0.45 + Math.random() * 0.7) * (Math.random() < 0.5 ? 1 : -1),
        pitch: Math.random() * Math.PI * 2,
        pitchSpeed: 0.4 + Math.random() * 0.55,
        roll: (Math.random() - 0.5) * 0.45,
        rollSpeed: (Math.random() - 0.5) * 0.28,
        matIdx: i % MATERIALS.length,
        tierIdx,
        vxOut: 0,
      });
    }

    // Painter's algorithm sort: far -> near
    hearts.sort((a, b) => a.z - b.z);

    const embers: EmberParticle[] = Array.from({ length: emberCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vy: 9 + Math.random() * 12,
      size: 5 + Math.random() * 9,
      phase: Math.random() * Math.PI * 2,
      freq: 1.2 + Math.random() * 1.8,
      drift: (Math.random() - 0.5) * 8,
    }));

    const bursts: BurstParticle[] = [];

    // Smooth pointer parallax
    let targetPx = 0;
    let targetPy = 0;
    let curPx = 0;
    let curPy = 0;

    const onPointerMove = (e: PointerEvent) => {
      targetPx = (e.clientX / Math.max(width, 1) - 0.5) * 2;
      targetPy = (e.clientY / Math.max(height, 1) - 0.5) * 2;
    };

    if (!reducedMotion) {
      window.addEventListener('pointermove', onPointerMove, { passive: true });
    }
    window.addEventListener('resize', resize, { passive: true });

    let rafId = 0;
    let lastTime = performance.now();
    let elapsed = 0;
    let hidden = document.visibilityState === 'hidden';

    const onVisChange = () => {
      hidden = document.visibilityState === 'hidden';
      if (!hidden) lastTime = performance.now();
    };
    document.addEventListener('visibilitychange', onVisChange);

    const spawnBurstAt = (bx: number, by: number) => {
      // 18 gold sparks + 10 mini 3D hearts erupting radially from the wax seal
      for (let i = 0; i < 28; i++) {
        const angle = (Math.PI * 2 * i) / 28 + (Math.random() - 0.5) * 0.22;
        const speed = 150 + Math.random() * 280;
        const isHeart = i % 3 === 0;
        bursts.push({
          x: bx,
          y: by,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 45,
          size: isHeart ? 14 + Math.random() * 12 : 6 + Math.random() * 8,
          life: 0,
          maxLife: 0.65 + Math.random() * 0.35,
          rot: (Math.random() - 0.5) * 0.8,
          rotSpeed: (Math.random() - 0.5) * 4.5,
          isHeart,
          matIdx: isHeart ? (i % 2 === 0 ? 3 : 1) : 3,
        });
      }
    };

    const drawFrame = (now: number) => {
      if (!hidden) {
        const dt = Math.min((now - lastTime) / 1000, 0.05);
        lastTime = now;
        elapsed += dt;

        // Consume any queued burst triggers
        while (burstQueueRef.current.length > 0) {
          const pt = burstQueueRef.current.shift()!;
          spawnBurstAt(pt.x, pt.y);
        }

        // Smooth pointer parallax damping
        const damp = 1 - Math.exp(-4.0 * dt);
        curPx += (targetPx - curPx) * damp;
        curPy += (targetPy - curPy) * damp;
        const maxShiftX = isSmall ? 14 : 26;
        const maxShiftY = isSmall ? 10 : 18;

        ctx.clearRect(0, 0, width, height);

        // 1. Subtle lub-dub golden-burgundy heartbeat ambient glow centered on screen
        const beatPhase = (elapsed % 3.4) / 3.4;
        let beatIntensity = 0;
        if (beatPhase < 0.14) {
          beatIntensity = Math.sin((beatPhase / 0.14) * Math.PI);
        } else if (beatPhase >= 0.18 && beatPhase < 0.3) {
          beatIntensity = Math.sin(((beatPhase - 0.18) / 0.12) * Math.PI) * 0.6;
        }
        const auraAlpha = 0.06 + beatIntensity * 0.09;
        const auraR = Math.min(width, height) * (0.44 + beatIntensity * 0.05);
        const aura = ctx.createRadialGradient(
          width * 0.5,
          height * 0.52,
          10,
          width * 0.5,
          height * 0.52,
          auraR
        );
        aura.addColorStop(0, `rgba(228, 186, 114, ${auraAlpha})`);
        aura.addColorStop(0.55, `rgba(148, 34, 48, ${auraAlpha * 0.7})`);
        aura.addColorStop(1, 'rgba(78, 18, 23, 0)');
        ctx.fillStyle = aura;
        ctx.fillRect(0, 0, width, height);

        // 2. Twinkling golden stardust embers
        for (let i = 0; i < embers.length; i++) {
          const em = embers[i];
          if (!reducedMotion) {
            em.y -= em.vy * dt;
            em.x += em.drift * dt;
            if (em.y < -16) {
              em.y = height + 16;
              em.x = Math.random() * width;
            }
            if (em.x < -16) em.x = width + 16;
            if (em.x > width + 16) em.x = -16;
          }
          const twinkle =
            0.18 + 0.72 * Math.pow(Math.sin(elapsed * em.freq + em.phase), 2);
          ctx.globalAlpha = twinkle;
          ctx.drawImage(
            emberSprite,
            em.x - em.size * 0.5,
            em.y - em.size * 0.5,
            em.size,
            em.size
          );
        }

        // 3. Living 3D-shaded floating hearts (depth-sorted)
        for (let i = 0; i < hearts.length; i++) {
          const h = hearts[i];
          if (!reducedMotion) {
            h.y -= h.vy * dt;
            h.yaw += h.yawSpeed * dt;
            h.pitch += h.pitchSpeed * dt;
            h.roll += h.rollSpeed * dt;

            if (sweepingOutRef.current) {
              const dir = h.baseX < width * 0.5 ? -1 : 1;
              h.vxOut += dir * (180 + h.z * 260) * dt;
              h.baseX += h.vxOut * dt;
            }

            if (h.y < -h.size - 20) {
              h.y = height + h.size + 12;
              h.baseX = Math.random() * width;
              h.vxOut = 0;
            }
          }

          const swayX = reducedMotion
            ? 0
            : Math.sin(elapsed * h.swayFreq + h.swayPhase) * h.swayAmp;
          const drawX = h.baseX + swayX + curPx * h.z * maxShiftX;
          const drawY = h.y + curPy * h.z * maxShiftY;

          // Pseudo-3D yaw foreshortening + pitch breathing
          const cosYaw = reducedMotion ? 1 : Math.cos(h.yaw);
          const scaleX =
            Math.abs(cosYaw) < 0.24 ? (cosYaw < 0 ? -0.24 : 0.24) : cosYaw;
          const scaleY = reducedMotion
            ? 1
            : 0.92 + 0.08 * Math.cos(h.pitch) + beatIntensity * 0.03 * h.z;
          const fresnelAlpha = h.opacity * (0.72 + 0.28 * Math.abs(scaleX));

          const sprite = sprites[h.matIdx][h.tierIdx];
          ctx.save();
          ctx.globalAlpha = Math.max(0, Math.min(1, fresnelAlpha));
          ctx.translate(drawX, drawY);
          ctx.rotate(h.roll);
          ctx.scale(scaleX, scaleY);
          ctx.drawImage(sprite, -h.size * 0.5, -h.size * 0.5, h.size, h.size);
          ctx.restore();
        }

        // 4. Wax-seal unsealing radial burst particles (sparks + mini 3D hearts)
        for (let i = bursts.length - 1; i >= 0; i--) {
          const bp = bursts[i];
          bp.life += dt;
          if (bp.life >= bp.maxLife) {
            bursts.splice(i, 1);
            continue;
          }
          const drag = Math.pow(0.92, dt * 60);
          bp.vx *= drag;
          bp.vy = bp.vy * drag + 140 * dt;
          bp.x += bp.vx * dt;
          bp.y += bp.vy * dt;
          bp.rot += bp.rotSpeed * dt;

          const pNorm = bp.life / bp.maxLife;
          const alpha = (1 - pNorm) * (1 - pNorm);

          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.translate(bp.x, bp.y);
          ctx.rotate(bp.rot);
          if (bp.isHeart) {
            const spr = sprites[bp.matIdx][1];
            const s = bp.size * (0.75 + 0.35 * (1 - pNorm));
            ctx.drawImage(spr, -s * 0.5, -s * 0.5, s, s);
          } else {
            const s = bp.size * (1.2 - pNorm * 0.5);
            ctx.drawImage(emberSprite, -s * 0.5, -s * 0.5, s, s);
          }
          ctx.restore();
        }

        ctx.globalAlpha = 1;
      }

      if (!reducedMotion) {
        rafId = window.requestAnimationFrame(drawFrame);
      }
    };

    // Draw initial frame immediately (and continue looping unless reduced motion)
    drawFrame(performance.now());

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisChange);
    };
  }, [active]);

  return (
    <canvas
      ref={canvasRef}
      className="hearts-canvas"
      aria-hidden="true"
    />
  );
});
