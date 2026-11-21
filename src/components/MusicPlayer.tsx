import { forwardRef } from 'react';
import { Play } from 'lucide-react';

interface MusicPlayerProps {
  isPlaying: boolean;
  toastText: string | null;
  onToggle: () => void;
}

export const MusicPlayer = forwardRef<HTMLButtonElement, MusicPlayerProps>(
  function MusicPlayer({ isPlaying, toastText, onToggle }, ref) {
    return (
      <div className="floating-dock">
        <div className="music-fab-row">
          <div
            className={`music-toast${toastText ? ' is-visible' : ''}`}
            aria-live="polite"
          >
            {toastText || ''}
          </div>
          <button
            ref={ref}
            type="button"
            className={`music-fab${isPlaying ? ' is-playing' : ''}`}
            id="musicToggleBtn"
            onClick={onToggle}
            aria-label={isPlaying ? 'Pause wedding music' : 'Play wedding music'}
            aria-pressed={isPlaying}
            title={isPlaying ? 'Pause Music' : 'Play Music'}
          >
            {/* GPU-composited live beat glow halo + rhythmic soundwave rings */}
            <span className="music-beat-halo" aria-hidden="true" />
            <span className="music-pulse-ring music-pulse-ring--1" aria-hidden="true" />
            <span className="music-pulse-ring music-pulse-ring--2" aria-hidden="true" />
            <span className="music-fab-core" aria-hidden="true">
              <span className="eq-bars">
                <span className="eq-bar b1" />
                <span className="eq-bar b2" />
                <span className="eq-bar b3" />
                <span className="eq-bar b4" />
              </span>
              <Play
                size={18}
                fill="currentColor"
                className="play-icon-svg"
              />
            </span>
          </button>
        </div>
      </div>
    );
  }
);
