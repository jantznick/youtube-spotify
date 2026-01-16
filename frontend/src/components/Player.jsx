import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import YouTube from 'react-youtube';
import usePlayerStore, { playerStore } from '../store/playerStore';

// Sortable Queue Item Component for Player
function SortableQueueItem({ song, actualIndex, onRemove, onPlayNext }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `queue-item-${actualIndex}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 300ms cubic-bezier(0.2, 0, 0.2, 1), opacity 200ms ease',
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 p-2 rounded-lg hover:bg-bg-hover transition-colors group"
    >
      <div
        {...attributes}
        {...listeners}
        className="text-text-muted hover:text-text-primary transition cursor-grab active:cursor-grabbing flex-shrink-0"
        title="Drag to reorder"
        onClick={(e) => e.stopPropagation()}
        style={{ touchAction: 'none' }}
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </div>
      {song.thumbnailUrl && (
        <img
          src={song.thumbnailUrl}
          alt={song.title}
          className="w-10 h-10 object-cover rounded flex-shrink-0"
        />
      )}
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-text-primary truncate">{song.title}</div>
        <div className="text-xs text-text-muted truncate">{song.artist || 'Unknown Artist'}</div>
      </div>
      <div className="flex items-center gap-1 md:opacity-0 md:group-hover:opacity-100 opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPlayNext(song, actualIndex);
          }}
          className="text-text-muted hover:text-accent transition-all p-1 active:scale-95"
          title="Play next"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(actualIndex);
          }}
          className="text-text-muted hover:text-red-400 transition-all p-1 active:scale-95"
          title="Remove from queue"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

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
    showQueue,
    setShowQueue,
    removeFromQueue,
    reorderQueue,
    playNext,
  } = usePlayerStore();
  const playerRef = useRef(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showToast, setShowToast] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
        delay: 100,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Control play/pause when isPlaying state changes
  useEffect(() => {
    if (!playerRef.current) return;

    try {
      if (isPlaying) {
        // Check player state before playing
        const playerState = playerRef.current.getPlayerState();
        // Only play if player is in a playable state
        if (playerState === window.YT.PlayerState.UNSTARTED || 
            playerState === window.YT.PlayerState.CUED ||
            playerState === window.YT.PlayerState.PAUSED ||
            playerState === window.YT.PlayerState.BUFFERING) {
          playerRef.current.playVideo();
          setShowToast(true);
        }
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
      autoplay: 1, // Enable autoplay
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
    // Always try to autoplay when player is ready
    // Check store state directly to avoid stale closure issues
    const tryPlay = () => {
      try {
        const storeState = playerStore.getState();
        const playerState = event.target.getPlayerState();
        
        // Play if isPlaying is true and player is in a playable state
        if (storeState.isPlaying && 
            (playerState === window.YT.PlayerState.UNSTARTED || 
             playerState === window.YT.PlayerState.CUED ||
             playerState === window.YT.PlayerState.PAUSED)) {
          event.target.playVideo();
          console.log('[Player] Autoplaying video on ready, isPlaying:', storeState.isPlaying);
        } else if (playerState === window.YT.PlayerState.PLAYING) {
          // Already playing, do nothing
          console.log('[Player] Video already playing');
        } else {
          console.log('[Player] Not autoplaying - isPlaying:', storeState.isPlaying, 'playerState:', playerState);
        }
      } catch (error) {
        console.error('Error playing video on ready:', error);
      }
    };

    // Try immediately
    tryPlay();
    // Also try after a short delay as fallback (in case store state hasn't updated yet)
    setTimeout(tryPlay, 300);
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

  const handleArtistClick = (e, song) => {
    e.stopPropagation();
    if (!song) return;
    
    // Get the first artist ID from artistIds if available
    const artistIds = song.artistIds;
    if (artistIds && Array.isArray(artistIds) && artistIds.length > 0) {
      // Navigate to the first artist
      navigate(`/artist/${artistIds[0]}`);
    }
  };

  // Show toast and autoplay when song changes
  useEffect(() => {
    if (currentSong) {
      setShowToast(true);
      setIsMinimized(false);
      
      // When song changes, the YouTube component will remount (due to key prop)
      // The handleReady callback will handle autoplay when the new player is ready
      // But also try to play if player is already ready (for same video or edge cases)
      const tryPlayCurrent = () => {
        if (playerRef.current) {
          try {
            const storeState = playerStore.getState();
            // Only play if isPlaying is true in the store
            if (storeState.isPlaying && storeState.currentSong?.youtubeId === currentSong.youtubeId) {
              const playerState = playerRef.current.getPlayerState();
              // Only try to play if player is in a state where it can play
              if (playerState === window.YT.PlayerState.UNSTARTED || 
                  playerState === window.YT.PlayerState.CUED ||
                  playerState === window.YT.PlayerState.PAUSED) {
                playerRef.current.playVideo();
                console.log('[Player] Autoplaying on song change');
              }
            }
          } catch (error) {
            // Player might not be ready yet, that's okay - handleReady will handle it
            console.log('Player not ready yet, will play on ready');
          }
        }
      };

      // Try after a short delay to allow component to update
      setTimeout(tryPlayCurrent, 100);
    }
  }, [currentSong]);

  if (!currentSong) {
    return null;
  }

  const hasYouTubeId = !!currentSong.youtubeId;

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
              {currentSong.artistIds && Array.isArray(currentSong.artistIds) && currentSong.artistIds.length > 0 ? (
                <div className="text-xs sm:text-sm text-text-muted truncate">
                  {currentSong.artistIds.length === 1 ? (
                    <button
                      onClick={(e) => handleArtistClick(e, currentSong)}
                      className="hover:text-accent transition-colors cursor-pointer"
                      title={`View ${currentSong.artist || 'Unknown Artist'}`}
                    >
                      {currentSong.artist || 'Unknown Artist'}
                    </button>
                  ) : (
                    <button
                      onClick={(e) => handleArtistClick(e, currentSong)}
                      className="hover:text-accent transition-colors cursor-pointer"
                      title={`View ${currentSong.artist || 'Unknown Artist'} (and ${currentSong.artistIds.length - 1} more)`}
                    >
                      {currentSong.artist || 'Unknown Artist'}
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-xs sm:text-sm text-text-muted truncate">
                  {currentSong.artist || 'Unknown Artist'}
                </div>
              )}
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
                  // If on queue page, navigate to homepage
                  if (location.pathname === '/queue') {
                    navigate('/home');
                  }
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

        {/* YouTube component or "Coming Soon" message */}
        <div className={isMinimized ? 'w-full' : 'mb-3 rounded-lg overflow-hidden aspect-video'}>
          {hasYouTubeId ? (
            <YouTube
              videoId={currentSong.youtubeId}
              opts={playerOpts}
              onReady={handleReady}
              onStateChange={handleStateChange}
              key={currentSong.youtubeId}
              className="w-full h-full"
            />
          ) : (
            <div className="w-full h-full bg-bg-primary flex flex-col items-center justify-center p-6 text-center">
              {currentSong.thumbnailUrl && (
                <img
                  src={currentSong.thumbnailUrl}
                  alt={currentSong.title}
                  className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-lg mb-4 opacity-50"
                />
              )}
              <div className="text-text-primary font-medium mb-2">Coming Soon</div>
              <div className="text-text-muted text-sm">
                This song is not available yet. Navigate to the next song to continue.
              </div>
            </div>
          )}
        </div>

        {isMinimized && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-white truncate">{currentSong.title}</div>
              {currentSong.artistIds && Array.isArray(currentSong.artistIds) && currentSong.artistIds.length > 0 ? (
                <div className="text-xs text-white/70 truncate">
                  {currentSong.artistIds.length === 1 ? (
                    <button
                      onClick={(e) => handleArtistClick(e, currentSong)}
                      className="hover:text-white transition-colors cursor-pointer"
                      title={`View ${currentSong.artist || 'Unknown Artist'}`}
                    >
                      {currentSong.artist || 'Unknown Artist'}
                    </button>
                  ) : (
                    <button
                      onClick={(e) => handleArtistClick(e, currentSong)}
                      className="hover:text-white transition-colors cursor-pointer"
                      title={`View ${currentSong.artist || 'Unknown Artist'} (and ${currentSong.artistIds.length - 1} more)`}
                    >
                      {currentSong.artist || 'Unknown Artist'}
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-xs text-white/70 truncate">
                  {currentSong.artist || 'Unknown Artist'}
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 ml-2">
              <button
                onClick={togglePlay}
                disabled={!hasYouTubeId}
                className="w-6 h-6 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
              disabled={!hasYouTubeId}
              className="flex-1 h-8 sm:h-9 bg-primary text-white rounded-md flex items-center justify-center hover:bg-primary-dark transition-all font-medium text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
          <>
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs sm:text-sm text-text-muted">
                {currentSong && queue.length > 0 ? (
                  <>
                    {Math.min(currentIndex + 1, queue.length)} of {queue.length}
                  </>
                ) : queue.length > 0 ? (
                  `${queue.length} ${queue.length === 1 ? 'song' : 'songs'} in queue`
                ) : (
                  'No queue'
                )}
              </div>
              <button
                onClick={() => setShowQueue(!showQueue)}
                className="text-xs sm:text-sm text-text-muted hover:text-text-primary transition-colors flex items-center gap-1"
                title={showQueue ? 'Hide queue' : 'Show queue'}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {showQueue ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  )}
                </svg>
                Queue
              </button>
            </div>
            
            {showQueue && queue.length > 0 && (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={(event) => {
                  const { active, over } = event;
                  if (over && active.id !== over.id) {
                    const upcomingSongs = queue.slice(currentIndex + 1);
                    // Extract index from ID (format: queue-item-{index})
                    const activeMatch = active.id.toString().match(/queue-item-(\d+)$/);
                    const overMatch = over.id.toString().match(/queue-item-(\d+)$/);
                    
                    if (activeMatch && overMatch) {
                      const activeActualIndex = parseInt(activeMatch[1]);
                      const overActualIndex = parseInt(overMatch[1]);
                      
                      const activeIdx = activeActualIndex - (currentIndex + 1);
                      const overIdx = overActualIndex - (currentIndex + 1);

                      if (activeIdx >= 0 && overIdx >= 0 && activeIdx < upcomingSongs.length && overIdx < upcomingSongs.length) {
                        const newUpcomingSongs = arrayMove(upcomingSongs, activeIdx, overIdx);
                        const newQueue = [...queue.slice(0, currentIndex + 1), ...newUpcomingSongs];
                        reorderQueue(newQueue);
                      }
                    }
                  }
                }}
              >
                <div className="mt-2 border-t border-border pt-2">
                  <div className="flex items-center justify-between mb-2 px-1">
                    <div className="text-xs font-medium text-text-muted">Up Next</div>
                    <button
                      onClick={() => navigate('/queue')}
                      className="text-xs text-primary hover:text-primary-dark transition-colors flex items-center gap-1"
                      title="View full queue"
                    >
                      {queue.length - currentIndex - 1 > 20 ? (
                        <>
                          View All ({queue.length - currentIndex - 1})
                        </>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      )}
                    </button>
                  </div>
                  <SortableContext
                    items={queue.slice(currentIndex + 1).map((_, idx) => `queue-item-${currentIndex + 1 + idx}`)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div 
                      className="max-h-80 overflow-y-auto space-y-1 pr-1" 
                      style={{ touchAction: 'pan-y' }}
                    >
                      {queue.slice(currentIndex + 1).map((song, idx) => {
                        const actualIndex = currentIndex + 1 + idx;
                        return (
                          <SortableQueueItem
                            key={`${song.id}-${actualIndex}`}
                            song={song}
                            actualIndex={actualIndex}
                            onRemove={removeFromQueue}
                            onPlayNext={(song, index) => {
                              playNext(song);
                              // Move song to be right after current
                              const newQueue = [...queue];
                              const [movedSong] = newQueue.splice(index, 1);
                              newQueue.splice(currentIndex + 1, 0, movedSong);
                              reorderQueue(newQueue);
                            }}
                          />
                        );
                      })}
                    </div>
                  </SortableContext>
                </div>
              </DndContext>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Player;
