import { useEffect, useMemo, useState } from 'react';

export interface CountdownParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
  inlineText: string;
}

function computeCountdown(targetMs: number): CountdownParts {
  const diff = targetMs - Date.now();
  if (diff <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isPast: true,
      inlineText: 'The celebration has begun! ✨',
    };
  }

  const totalSec = Math.floor(diff / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;

  const dLabel = days === 1 ? 'day' : 'days';
  const hLabel = hours === 1 ? 'hour' : 'hours';

  return {
    days,
    hours,
    minutes,
    seconds,
    isPast: false,
    inlineText: `${days} ${dLabel} ${hours} ${hLabel} ${minutes} min ${seconds} sec`,
  };
}

export function useCountdown(dateIsoStart: string): CountdownParts {
  const targetMs = useMemo(() => new Date(dateIsoStart).getTime(), [dateIsoStart]);
  const [parts, setParts] = useState<CountdownParts>(() => computeCountdown(targetMs));

  useEffect(() => {
    let timerId = 0;

    const scheduleNext = () => {
      setParts(computeCountdown(targetMs));
      // Align ticks cleanly to exact second boundaries so multiple countdowns stay lock-stepped
      const msToNextSecond = 1000 - (Date.now() % 1000) + 15;
      timerId = window.setTimeout(scheduleNext, msToNextSecond);
    };

    scheduleNext();
    return () => window.clearTimeout(timerId);
  }, [targetMs]);

  return parts;
}
