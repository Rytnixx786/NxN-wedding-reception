import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { weddingConfig } from './config/wedding';
import { CurtainStage, IntroCurtain } from './components/IntroCurtain';
import { HeroSection } from './components/HeroSection';
import { CeremonyInfo } from './components/CeremonyInfo';
import { ReceptionInfo } from './components/ReceptionInfo';
import { VenueSection } from './components/VenueSection';
import { OptionalSections } from './components/OptionalSections';
import { Footer } from './components/Footer';
import { MusicPlayer } from './components/MusicPlayer';
import { RsvpModal } from './components/RsvpModal';
import { CardLightbox } from './components/CardLightbox';
import { loadLocalRsvp, RsvpSubmission } from './services/rsvpService';
import { useAutoScroll } from './hooks/useAutoScroll';
import { useSceneMotion } from './hooks/useSceneMotion';
import { useAssetPreload } from './hooks/useAssetPreload';

export function App() {
  const openDirect =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('open') === '1';

  const criticalImages = useMemo(
    () => [
      weddingConfig.assets.palaceBackdrop,
      weddingConfig.assets.floralBouquet,
      weddingConfig.assets.waxSeal,
      weddingConfig.assets.receptionCard,
    ],
    []
  );
  const assetsReady = useAssetPreload(criticalImages);

  const [curtainStage, setCurtainStage] = useState<CurtainStage>(
    openDirect ? 'dismissed' : 'idle'
  );
  const [heroRevealed, setHeroRevealed] = useState<boolean>(openDirect);
  const [autoScrollSignal, setAutoScrollSignal] = useState<number>(0);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [musicToast, setMusicToast] = useState<string | null>(null);
  const [globalToast, setGlobalToast] = useState<string | null>(null);

  const [rsvpModalOpen, setRsvpModalOpen] = useState<boolean>(false);
  const [cardLightboxOpen, setCardLightboxOpen] = useState<boolean>(false);
  const [savedRsvp, setSavedRsvp] = useState<RsvpSubmission | null>(() =>
    loadLocalRsvp()
  );

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeRafRef = useRef<number>(0);
  const musicToastTimer = useRef<number | null>(null);
  const globalToastTimer = useRef<number | null>(null);
  const stageTimersRef = useRef<number[]>([]);

  const introDismissed = curtainStage === 'dismissed';

  const clearStageTimers = useCallback(() => {
    stageTimersRef.current.forEach((id) => window.clearTimeout(id));
    stageTimersRef.current = [];
  }, []);

  const showMusicToast = useCallback((label: string) => {
    setMusicToast(label);
    if (musicToastTimer.current) window.clearTimeout(musicToastTimer.current);
    musicToastTimer.current = window.setTimeout(() => setMusicToast(null), 2600);
  }, []);

  const showGlobalToast = useCallback((label: string) => {
    setGlobalToast(label);
    if (globalToastTimer.current) window.clearTimeout(globalToastTimer.current);
    globalToastTimer.current = window.setTimeout(() => setGlobalToast(null), 3200);
  }, []);

  const cancelAudioFade = useCallback(() => {
    if (fadeRafRef.current) {
      window.cancelAnimationFrame(fadeRafRef.current);
      fadeRafRef.current = 0;
    }
  }, []);

  // Synchronous play() inside user gesture + smooth 1.2s ease-out volume swell
  const startMusic = useCallback(
    (withFade = true) => {
      const audio = audioRef.current;
      if (!audio) return;

      cancelAudioFade();
      const targetVol = weddingConfig.music.defaultVolume;

      try {
        audio.volume = withFade ? 0.02 : targetVol;
      } catch {
        // iOS Safari treats HTMLMediaElement.volume as read-only
      }

      const playPromise = audio.play();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise
          .then(() => {
            setIsPlaying(true);
            showMusicToast(weddingConfig.music.artistHint);

            if (withFade) {
              const startTs = performance.now();
              const durationMs = 1200;
              const ramp = (now: number) => {
                if (!audioRef.current || audioRef.current.paused) return;
                const p = Math.min(1, (now - startTs) / durationMs);
                const eased = 1 - (1 - p) * (1 - p);
                try {
                  audioRef.current.volume = Math.min(
                    targetVol,
                    0.02 + (targetVol - 0.02) * eased
                  );
                } catch {
                  return;
                }
                if (p < 1) {
                  fadeRafRef.current = window.requestAnimationFrame(ramp);
                } else {
                  fadeRafRef.current = 0;
                }
              };
              fadeRafRef.current = window.requestAnimationFrame(ramp);
            }
          })
          .catch(() => {
            setIsPlaying(false);
          });
      }
    },
    [cancelAudioFade, showMusicToast]
  );

  const toggleMusic = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      startMusic(false);
    } else {
      cancelAudioFade();
      audio.pause();
      setIsPlaying(false);
      showMusicToast('Music Paused');
    }
  }, [cancelAudioFade, startMusic, showMusicToast]);

  // 4-Stage Seamless Splash -> Twin Velvet Silk Curtain Reveal -> Synchronized 3D Hero -> Auto-Scroll
  const handleTriggerOpen = useCallback(() => {
    if (curtainStage !== 'idle') return;
    clearStageTimers();

    // Always start from exact top of page cleanly
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });

    // Start Bismillah synchronously inside the user gesture with smooth swell
    startMusic(true);

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (reducedMotion) {
      setCurtainStage('dismissed');
      setHeroRevealed(true);
      return;
    }

    // Stage 1: Wax seal press + 3D radial gold/heart burst (0ms -> 240ms)
    setCurtainStage('unsealing');

    // Stage 2: Twin velvet silk curtains part with glowing gold trim (240ms)
    const tPart = window.setTimeout(() => {
      setCurtainStage('parting');
    }, 240);

    // Stage 3: Synchronized 3D Hero Envelope + Bouquet + Card entrance (500ms)
    const tHero = window.setTimeout(() => {
      setHeroRevealed(true);
    }, 500);

    // Stage 4: Complete dismissal & unmount splash canvas + trigger guided slow scroll (1460ms)
    const tDismiss = window.setTimeout(() => {
      setCurtainStage('dismissed');
      setAutoScrollSignal((n) => n + 1);
    }, 1460);

    stageTimersRef.current = [tPart, tHero, tDismiss];
  }, [curtainStage, clearStageTimers, startMusic]);

  // Reliable cinematic slow auto-scroll (~1.5s after curtains finish parting)
  const { isAutoScrolling, toggleAutoScroll, stopAutoScroll } = useAutoScroll({
    autoStartSignal: autoScrollSignal,
    blocked: !introDismissed || rsvpModalOpen || cardLightboxOpen,
    startDelayMs: 1500,
    cruiseSpeedPxPerSec: 46,
  });

  // Unified 60fps 3D Scroll + Pointer Motion Engine (zero React re-renders)
  useSceneMotion(introDismissed);

  // Body scroll lock ONLY when splash or modal is active
  useEffect(() => {
    const locked = !introDismissed || rsvpModalOpen || cardLightboxOpen;
    document.documentElement.classList.toggle('scroll-locked', locked);
    return () => {
      document.documentElement.classList.remove('scroll-locked');
    };
  }, [introDismissed, rsvpModalOpen, cardLightboxOpen]);

  // Scroll-reveal observer for Ceremony, Reception, Venue & Footer
  useEffect(() => {
    if (!introDismissed) return;
    const items = Array.from(document.querySelectorAll('.reveal-item'));
    if (openDirect || !('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -24px 0px' }
    );

    items.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [introDismissed, openDirect]);

  // Attempt audio on direct-open preview if browser permits
  useEffect(() => {
    if (openDirect) {
      startMusic(false);
    }
  }, [openDirect, startMusic]);

  // Cleanup timers & RAF on unmount
  useEffect(() => {
    return () => {
      clearStageTimers();
      cancelAudioFade();
      if (musicToastTimer.current) window.clearTimeout(musicToastTimer.current);
      if (globalToastTimer.current) window.clearTimeout(globalToastTimer.current);
    };
  }, [clearStageTimers, cancelAudioFade]);

  return (
    <>
      <audio
        ref={audioRef}
        id="bgMusic"
        loop
        preload="auto"
        playsInline
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      >
        <source src={weddingConfig.music.src} type="audio/mpeg" />
      </audio>

      <IntroCurtain
        stage={curtainStage}
        assetsReady={assetsReady}
        onTriggerOpen={handleTriggerOpen}
      />

      <main
        className={`invitation-page${!introDismissed && curtainStage === 'idle' ? ' is-behind-splash' : ''}`}
        id="invitationMain"
      >
        <div className="paper-grain" aria-hidden="true" />

        <HeroSection
          heroRevealed={heroRevealed}
          skipEntrance={openDirect}
          onOpenCardLightbox={() => {
            stopAutoScroll();
            setCardLightboxOpen(true);
          }}
        />
        <CeremonyInfo />
        <ReceptionInfo
          savedRsvp={savedRsvp}
          onOpenRsvp={() => {
            stopAutoScroll();
            setRsvpModalOpen(true);
          }}
          onNotify={showGlobalToast}
          onUserInteract={stopAutoScroll}
        />
        <VenueSection />
        <OptionalSections />
        <Footer />
      </main>

      <MusicPlayer
        isPlaying={isPlaying}
        toastText={musicToast}
        onToggle={toggleMusic}
        showAutoScrollControl={introDismissed}
        isAutoScrolling={isAutoScrolling}
        onToggleAutoScroll={toggleAutoScroll}
      />

      <RsvpModal
        isOpen={rsvpModalOpen}
        savedRsvp={savedRsvp}
        onClose={() => setRsvpModalOpen(false)}
        onSaved={(record, mode) => {
          setSavedRsvp(record);
          showGlobalToast(
            mode === 'supabase'
              ? 'RSVP confirmed & saved! Thank you.'
              : 'RSVP saved locally (preview mode).'
          );
        }}
      />

      <CardLightbox
        isOpen={cardLightboxOpen}
        onClose={() => setCardLightboxOpen(false)}
      />

      <div
        id="globalToast"
        className={`global-toast${globalToast ? ' is-visible' : ''}`}
        role="status"
        aria-live="polite"
      >
        {globalToast || ''}
      </div>
    </>
  );
}

export default App;
