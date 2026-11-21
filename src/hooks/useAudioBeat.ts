import { RefObject, useCallback, useEffect, useRef } from 'react';

interface UseAudioBeatOptions {
  audioRef: RefObject<HTMLAudioElement | null>;
  targetRef: RefObject<HTMLElement | null>;
  isPlaying: boolean;
}

/**
 * Live audio-reactive equalizer & rhythmic heartbeat driver.
 * Connects safely to HTMLAudioElement via Web Audio API AnalyserNode (when permitted)
 * and blends real-time FFT spectrum energy with a smooth musical cadence so the
 * floating music button and 4 equalizer bars visibly dance & beat live at 60fps
 * with zero React re-renders.
 */
export function useAudioBeat({
  audioRef,
  targetRef,
  isPlaying,
}: UseAudioBeatOptions) {
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceAttachedRef = useRef<boolean>(false);
  const dataRef = useRef<Uint8Array<ArrayBuffer> | null>(null);

  const ensureAnalyser = useCallback(
    (fromUserGesture = false) => {
      const audio = audioRef.current;
      if (!audio || !fromUserGesture) return;

      try {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext?: typeof AudioContext })
            .webkitAudioContext;
        if (!AudioCtx) return;

        if (!ctxRef.current) {
          ctxRef.current = new AudioCtx();
        }
        const ctx = ctxRef.current;

        const attachSource = () => {
          if (sourceAttachedRef.current || !audioRef.current) return;
          // Only attach MediaElementSource once AudioContext is actually running
          // so iOS Safari / restricted browsers can never end up muting <audio>
          if (ctx.state !== 'running') return;
          try {
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 256;
            analyser.smoothingTimeConstant = 0.65;
            const source = ctx.createMediaElementSource(audioRef.current);
            source.connect(analyser);
            analyser.connect(ctx.destination);
            analyserRef.current = analyser;
            dataRef.current = new Uint8Array(
              new ArrayBuffer(analyser.frequencyBinCount)
            );
            sourceAttachedRef.current = true;
          } catch {
            // Fall back cleanly to musical cadence synthesis
          }
        };

        if (ctx.state === 'running') {
          attachSource();
        } else if (ctx.state === 'suspended') {
          ctx
            .resume()
            .then(attachSource)
            .catch(() => undefined);
        }
      } catch {
        // Gracefully fall back to musical cadence synthesis if Web Audio is unavailable
      }
    },
    [audioRef]
  );

  useEffect(() => {
    const target = targetRef.current;
    if (!isPlaying) {
      if (target) {
        target.style.setProperty('--eq-1', '0.26');
        target.style.setProperty('--eq-2', '0.26');
        target.style.setProperty('--eq-3', '0.26');
        target.style.setProperty('--eq-4', '0.26');
        target.style.setProperty('--beat-scale', '1');
        target.style.setProperty('--beat-glow', '0');
      }
      document.documentElement.style.setProperty('--music-beat', '0');
      return;
    }

    let rafId = 0;
    const smoothBars = [0.34, 0.78, 0.56, 0.28];
    // Floating moving averages (adapt both up and down — never locked to a static EQ slope)
    const bandEma = [0.22, 0.18, 0.10, 0.06];
    let energyEma = 0.18;
    let beatPulse = 0;
    let smoothBeat = 0.25;

    // Independent, non-locking phase accumulators spread across 2π so all 4 bars
    // breathe continuously through full [0.17..0.98] arcs out of phase with each other
    const phase1 = [0.2, 1.85, 3.55, 5.1];
    const phase2 = [1.1, 2.9, 4.4, 0.5];
    const speed1 = [3.15, 3.75, 3.4, 4.05];
    const speed2 = [5.45, 6.25, 5.85, 6.75];
    let beatPhase = 0;
    let lastMs = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(0.05, Math.max(0.004, (now - lastMs) / 1000));
      lastMs = now;

      const analyser = analyserRef.current;
      const bins = dataRef.current;

      let loudness = 0.68;
      const bandDelta = [0, 0, 0, 0];

      if (analyser && bins && ctxRef.current?.state === 'running') {
        analyser.getByteFrequencyData(bins);
        // fftSize=256 (~172 Hz/bin @ 44.1kHz): musical body 170Hz -> 5.2kHz
        const avg = (from: number, to: number) => {
          let sum = 0;
          const end = Math.min(to, bins.length);
          for (let i = from; i < end; i++) sum += bins[i];
          return sum / Math.max(1, end - from) / 255;
        };

        const rawBands = [
          avg(1, 4), // 170 - 680 Hz (warm lows / tabla)
          avg(4, 9), // 680 - 1550 Hz (vocal core / harmonies)
          avg(9, 17), // 1550 - 2900 Hz (upper vocals / strings)
          avg(17, 30), // 2900 - 5150 Hz (presence / shimmer)
        ];
        const energy =
          rawBands[0] * 0.36 +
          rawBands[1] * 0.34 +
          rawBands[2] * 0.2 +
          rawBands[3] * 0.1;

        if (energy > 0.015) {
          // Floating EMA tracks musical swells without pinning any band high or low
          energyEma += (energy - energyEma) * 0.045;
          loudness = Math.max(0.38, Math.min(1, (energy - 0.02) / 0.5));

          // Zero-centered per-band deviation adds genuine audio micro-expression
          // without imposing the song's low-to-high EQ tilt across the 4 bars
          for (let i = 0; i < 4; i++) {
            bandEma[i] += (rawBands[i] - bandEma[i]) * 0.09;
            const delta = (rawBands[i] - bandEma[i]) * 2.2;
            bandDelta[i] = Math.max(-0.15, Math.min(0.2, delta));
          }

          // Real rhythmic transient flux for crisp musical heartbeat lifts
          const flux = Math.max(0, energy - energyEma);
          beatPulse = Math.max(beatPulse * 0.87, Math.min(1, flux * 6.5));
        } else {
          beatPulse *= 0.9;
        }
      } else {
        beatPulse *= 0.9;
      }

      // Phase-integrated breathing speed swells gently with musical energy
      const tempoMod = 0.88 + 0.28 * loudness;
      const amp = 0.78 + 0.22 * loudness;
      const targets = [0, 0, 0, 0];

      for (let i = 0; i < 4; i++) {
        phase1[i] += dt * speed1[i] * tempoMod;
        phase2[i] += dt * speed2[i] * tempoMod;

        // Smooth dual-harmonic breathing wave spanning full [0..1]
        const breath =
          0.5 +
          0.38 * Math.sin(phase1[i]) +
          0.12 * Math.sin(phase2[i]);
        const shaped = Math.pow(Math.max(0, Math.min(1, breath)), 1.15);

        const rawTarget =
          0.17 +
          shaped * 0.74 * amp +
          beatPulse * (0.08 + 0.12 * shaped) +
          bandDelta[i];

        targets[i] = Math.max(0.16, Math.min(1, rawTarget));
      }

      beatPhase += dt * (3.6 + 1.1 * loudness);
      const organicBeat =
        0.22 + 0.44 * Math.pow(0.5 + 0.5 * Math.sin(beatPhase), 1.8);
      const beatRaw = Math.min(
        1,
        organicBeat * 0.58 + beatPulse * 0.56 + loudness * 0.14
      );

      // Fluid breathing attack & release (60fps GPU scaleY)
      for (let i = 0; i < 4; i++) {
        const rate = targets[i] > smoothBars[i] ? 0.34 : 0.22;
        smoothBars[i] += (targets[i] - smoothBars[i]) * rate;
      }

      const beatRate = beatRaw > smoothBeat ? 0.32 : 0.15;
      smoothBeat += (beatRaw - smoothBeat) * beatRate;

      const el = targetRef.current;
      if (el) {
        el.style.setProperty('--eq-1', smoothBars[0].toFixed(3));
        el.style.setProperty('--eq-2', smoothBars[1].toFixed(3));
        el.style.setProperty('--eq-3', smoothBars[2].toFixed(3));
        el.style.setProperty('--eq-4', smoothBars[3].toFixed(3));
        el.style.setProperty(
          '--beat-scale',
          (1 + smoothBeat * 0.105).toFixed(4)
        );
        el.style.setProperty('--beat-glow', smoothBeat.toFixed(3));
      }
      document.documentElement.style.setProperty(
        '--music-beat',
        smoothBeat.toFixed(3)
      );

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, [isPlaying, targetRef]);

  useEffect(() => {
    return () => {
      if (ctxRef.current && ctxRef.current.state !== 'closed') {
        ctxRef.current.close().catch(() => undefined);
      }
    };
  }, []);

  return { ensureAnalyser };
}
