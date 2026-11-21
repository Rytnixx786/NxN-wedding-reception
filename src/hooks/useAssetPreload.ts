import { useEffect, useState } from 'react';

export function useAssetPreload(imageUrls: string[]): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const preloadImage = (src: string) =>
      new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => resolve();
        img.src = src;
        if (img.complete) resolve();
      });

    const fontsPromise =
      typeof document !== 'undefined' && 'fonts' in document
        ? document.fonts.ready.then(() => undefined).catch(() => undefined)
        : Promise.resolve();

    // Never block longer than 1800ms on slow networks
    const timeoutPromise = new Promise<void>((resolve) => {
      window.setTimeout(resolve, 1800);
    });

    Promise.race([
      Promise.all([fontsPromise, ...imageUrls.map(preloadImage)]).then(
        () => undefined
      ),
      timeoutPromise,
    ]).then(() => {
      if (!cancelled) setReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, [imageUrls]);

  return ready;
}
