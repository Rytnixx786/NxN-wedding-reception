import { ChevronsDown, Pause, Play } from 'lucide-react';

interface MusicPlayerProps {
  isPlaying: boolean;
  toastText: string | null;
  onToggle: () => void;
  showAutoScrollControl: boolean;
  isAutoScrolling: boolean;
  onToggleAutoScroll: () => void;
}

export function MusicPlayer({
  isPlaying,
  toastText,
  onToggle,
  showAutoScrollControl,
  isAutoScrolling,
  onToggleAutoScroll,
}: MusicPlayerProps) {
  return (
    <div className="floating-dock">
      {showAutoScrollControl && (
        <button
          type="button"
          className={`autoscroll-fab${isAutoScrolling ? ' is-scrolling' : ''}`}
          id="autoScrollToggleBtn"
          onClick={onToggleAutoScroll}
          aria-label={
            isAutoScrolling ? 'Pause automatic scroll' : 'Resume automatic scroll'
          }
          aria-pressed={isAutoScrolling}
          title={isAutoScrolling ? 'Pause Auto-Scroll' : 'Auto-Scroll Invitation'}
        >
          {isAutoScrolling ? (
            <Pause size={15} aria-hidden="true" />
          ) : (
            <ChevronsDown size={17} aria-hidden="true" />
          )}
        </button>
      )}

      <div className="music-fab-row">
        <div
          className={`music-toast${toastText ? ' is-visible' : ''}`}
          aria-live="polite"
        >
          {toastText || ''}
        </div>
        <button
          type="button"
          className={`music-fab${isPlaying ? ' is-playing' : ''}`}
          id="musicToggleBtn"
          onClick={onToggle}
          aria-label={isPlaying ? 'Pause wedding music' : 'Play wedding music'}
          aria-pressed={isPlaying}
          title={isPlaying ? 'Pause Music' : 'Play Music'}
        >
          <span className="eq-bars" aria-hidden="true">
            <span className="eq-bar b1" />
            <span className="eq-bar b2" />
            <span className="eq-bar b3" />
            <span className="eq-bar b4" />
          </span>
          <Play
            size={18}
            fill="currentColor"
            className="play-icon-svg"
            aria-hidden="true"
          />
        </button>
      </div>
    </div>
  );
}
