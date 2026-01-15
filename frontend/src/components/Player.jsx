import { useEffect, useRef, useState } from 'react';
import YouTube from 'react-youtube';
import usePlayerStore, { playerStore } from '../store/playerStore';

function Player() {
  const {
    currentSong,
    isPlaying,
    queue,
    currentIndex,
    togglePlay,
    nextSong,
    previousSong,
    play,
    pause,
    stop,
  } = usePlayerStore();
  const playerRef = useRef(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showToast, setShowToast] = useState(true);

  // Control play/pause when isPlaying state changes
  useEffect(() => {
    if (!playerRef.current) return;

    try {
      if (isPlaying) {
        playerRef.current.playVideo();
        setShowToast(true);
      } else {
        playerRef.current.pauseVideo();
      }
    } catch (error) {
      console.error('Error controlling player:', error);
    }
  }, [isPlaying]);

  // Single player opts - fixed size, we'll resize via YouTube API
  const playerOpts = {
    height: '200',
    width: '100%',
    playerVars: {
      autoplay: 0,
      controls: 1,
      modestbranding: 1,
      rel: 0,
      playsinline: 1,
    },
  };

  // Update player size when minimized state changes
  useEffect(() => {
    if (playerRef.current) {
      try {
        if (isMinimized) {
          playerRef.current.setSize(224, 56);
        } else {
          playerRef.current.setSize(384, 200);
        }
      } catch (error) {
        console.error('Error resizing player:', error);
      }
    }
  }, [isMinimized]);

  const handleReady = (event) => {
    playerRef.current = event.target;
    if (isPlaying) {
      event.target.playVideo();
    }
  };

  const handleStateChange = (event) => {
    if (event.data === window.YT.PlayerState.PLAYING) {
      play();
      setShowToast(true);
    } else if (event.data === window.YT.PlayerState.PAUSED) {
      pause();
    } else if (event.data === window.YT.PlayerState.ENDED) {
      const state = playerStore.getState();
      if (state.currentIndex < state.queue.length - 1) {
        state.nextSong();
      }
    }
  };

  // Show toast when song changes
  useEffect(() => {
    if (currentSong) {
      setShowToast(true);
      setIsMinimized(false);
    }
  }, [currentSong]);

  if (!currentSong) {
    return null;
  }

  // Single container with single YouTube component - just changes position/size
  return (
    <div
      className={`fixed bg-bg-card border border-border rounded-xl shadow-2xl transition-all duration-300 z-50 overflow-hidden ${
        isMinimized
          ? 'bottom-4 right-4 w-56 sm:w-64'
          : `top-4 right-4 left-4 sm:left-auto w-auto sm:w-96 max-w-[calc(100vw-2rem)] sm:max-w-none ${showToast ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'}`
      }`}
    >
      <div className={isMinimized ? 'relative' : 'p-3 sm:p-4'}>
        {!isMinimized && (
          <div className="flex items-start justify-between mb-3 gap-2">
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-text-primary truncate text-sm sm:text-base">{currentSong.title}</div>
              <div className="text-xs sm:text-sm text-text-muted truncate">
                {currentSong.artist || 'Unknown Artist'}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setIsMinimized(true)}
                className="text-text-muted hover:text-text-primary transition-colors"
                title="Minimize"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
                </svg>
              </button>
              <button
                onClick={() => {
                  if (playerRef.current) {
                    playerRef.current.stopVideo();
                  }
                  stop();
                }}
                className="text-red-400 hover:text-red-300 transition-colors"
                title="Stop"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Single YouTube component - always rendered, just resized */}
        <div className={isMinimized ? 'w-full' : 'mb-3 rounded-lg overflow-hidden aspect-video'}>
          <YouTube
            videoId={currentSong.youtubeId}
            opts={playerOpts}
            onReady={handleReady}
            onStateChange={handleStateChange}
            key={currentSong.youtubeId}
            className="w-full h-full"
          />
        </div>

        {isMinimized && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-white truncate">{currentSong.title}</div>
              <div className="text-xs text-white/70 truncate">{currentSong.artist || 'Unknown Artist'}</div>
            </div>
            <div className="flex items-center gap-1 ml-2">
              <button
                onClick={togglePlay}
                className="w-6 h-6 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
              >
                {isPlaying ? (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-3 h-3 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                )}
              </button>
              <button
                onClick={() => setIsMinimized(false)}
                className="w-6 h-6 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                title="Expand"
              >
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {!isMinimized && (
          <div className="flex items-center justify-between gap-2 mb-2">
            <button
              onClick={previousSong}
              disabled={currentIndex === 0}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-md bg-bg-hover text-text-secondary hover:text-primary hover:bg-primary/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center flex-shrink-0"
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" />
              </svg>
            </button>
            <button
              onClick={togglePlay}
              className="flex-1 h-8 sm:h-9 bg-primary text-white rounded-md flex items-center justify-center hover:bg-primary-dark transition-all font-medium text-xs sm:text-sm"
            >
              {isPlaying ? (
                <>
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="hidden sm:inline">Pause</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                  <span className="hidden sm:inline">Play</span>
                </>
              )}
            </button>
            <button
              onClick={nextSong}
              disabled={currentIndex >= queue.length - 1}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-md bg-bg-hover text-text-secondary hover:text-primary hover:bg-primary/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center flex-shrink-0"
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0011 6v2.798l-5.445-3.63z" />
              </svg>
            </button>
          </div>
        )}

        {!isMinimized && (
          <div className="text-xs sm:text-sm text-text-muted text-center">
            {currentIndex + 1} of {queue.length}
          </div>
        )}
      </div>
    </div>
  );
}

export default Player;
