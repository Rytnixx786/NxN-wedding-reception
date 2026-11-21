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
import { AmbientLovesCanvas } from './components/AmbientLovesCanvas';
import { loadLocalRsvp, RsvpSubmission } from './services/rsvpService';
import { useAutoScroll } from './hooks/useAutoScroll';
import { useSceneMotion } from './hooks/useSceneMotion';
import { useAssetPreload } from './hooks/useAssetPreload';
import { useAudioBeat } from './hooks/useAudioBeat';
import { useGsapChoreography } from './hooks/useGsapChoreography';

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
  const [autoScrollSignal, setAutoScrollSignal] = useState<number>(
    openDirect ? 1 : 0
  );

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [musicToast, setMusicToast] = useState<string | null>(null);
  const [globalToast, setGlobalToast] = useState<string | null>(null);

  const [rsvpModalOpen, setRsvpModalOpen] = useState<boolean>(false);
  const [cardLightboxOpen, setCardLightboxOpen] = useState<boolean>(false);
  const [savedRsvp, setSavedRsvp] = useState<RsvpSubmission | null>(() =>
    loadLocalRsvp()
  );

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const musicBtnRef = useRef<HTMLButtonElement | null>(null);
  const fadeRafRef = useRef<number>(0);
  const musicToastTimer = useRef<number | null>(null);
  const globalToastTimer = useRef<number | null>(null);
  const stageTimersRef = useRef<number[]>([]);

  const introDismissed = curtainStage === 'dismissed';

  // Live audio-reactive equalizer & rhythmic heartbeat on the music FAB
  const { ensureAnalyser } = useAudioBeat({
    audioRef,
    targetRef: musicBtnRef,
    isPlaying,
  });

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

  // Synchronous play() inside user gesture + Web Audio beat analyser + smooth volume swell
  const startMusic = useCallback(
    (withFade = true, fromUserGesture = false) => {
      const audio = audioRef.current;
      if (!audio) return;

      cancelAudioFade();
      if (fromUserGesture) {
        ensureAnalyser(true);
      }
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
    [cancelAudioFade, ensureAnalyser, showMusicToast]
  );

  const toggleMusic = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      startMusic(false, true);
    } else {
      cancelAudioFade();
      audio.pause();
      setIsPlaying(false);
      showMusicToast('Music Paused');
    }
  }, [cancelAudioFade, startMusic, showMusicToast]);

  // 4-Stage Seamless Opening Card -> Twin Velvet Silk Curtain Reveal -> GSAP 3D Hero -> Auto-Scroll
  const handleTriggerOpen = useCallback(() => {
    if (curtainStage !== 'idle') return;
    clearStageTimers();

    // Always begin from exact top of page cleanly (universal across all iOS/Android WebViews)
    document.documentElement.classList.add('is-autoscrolling');
    window.scrollTo(0, 0);
    document.documentElement.classList.remove('is-autoscrolling');

    // Start Bismillah synchronously inside the user gesture with smooth swell
    startMusic(true, true);

    // Stage 1: Heart seal bloom + cream card 3D lift + radial 3D hearts burst (0ms -> 260ms)
    setCurtainStage('unsealing');

    // Stage 2: Twin velvet silk curtains sweep open with antique-gold edge glow (260ms)
    const tPart = window.setTimeout(() => {
      setCurtainStage('parting');
    }, 260);

    // Stage 3: Synchronized GSAP 3D Hero Envelope + Living Bouquet + Card entrance (520ms)
    const tHero = window.setTimeout(() => {
      setHeroRevealed(true);
    }, 520);

    // Stage 4: Complete dismissal & unmount cover canvas + trigger guided auto-scroll (1460ms)
    const tDismiss = window.setTimeout(() => {
      setCurtainStage('dismissed');
      setAutoScrollSignal((n) => n + 1);
    }, 1460);

    stageTimersRef.current = [tPart, tHero, tDismiss];
  }, [curtainStage, clearStageTimers, startMusic]);

  // Automatic smooth guided scroll whenever the guest enters (no manual auto-scroll button)
  const { stopAutoScroll } = useAutoScroll({
    autoStartSignal: autoScrollSignal,
    blocked: !introDismissed || rsvpModalOpen || cardLightboxOpen,
    startDelayMs: openDirect ? 1000 : 850,
    cruiseSpeedPxPerSec: 48,
  });

  // Unified 60fps 3D Scroll + Pointer Motion Engine (zero React re-renders)
  useSceneMotion(introDismissed);

  // Premium GSAP + ScrollTrigger Entrance & Living Bouquet Choreography
  useGsapChoreography({
    heroRevealed,
    introDismissed,
    skipEntrance: openDirect,
  });

  // Body scroll lock ONLY when splash or modal is active
  useEffect(() => {
    const locked = !introDismissed || rsvpModalOpen || cardLightboxOpen;
    document.documentElement.classList.toggle('scroll-locked', locked);
    return () => {
      document.documentElement.classList.remove('scroll-locked');
    };
  }, [introDismissed, rsvpModalOpen, cardLightboxOpen]);

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

      <AmbientLovesCanvas active={introDismissed} />

      <main
        className={[
          'invitation-page',
          !introDismissed && curtainStage === 'idle' ? 'is-behind-splash' : '',
          heroRevealed ? 'is-hero-revealed' : '',
          openDirect ? 'is-hero-instant' : '',
        ]
          .filter(Boolean)
          .join(' ')}
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
        ref={musicBtnRef}
        isPlaying={isPlaying}
        toastText={musicToast}
        onToggle={toggleMusic}
      />

      <RsvpModal
        isOpen={rsvpModalOpen}
        savedRsvp={savedRsvp}
        onClose={() => setRsvpModalOpen(false)}
        onSaved={(record) => {
          setSavedRsvp(record);
          showGlobalToast(
            record.attendance === 'attending'
              ? 'RSVP confirmed! We look forward to celebrating with you.'
              : 'Thank you for letting us know!'
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
