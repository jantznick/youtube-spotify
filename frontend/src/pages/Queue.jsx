import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import usePlayerStore, { playerStore } from '../store/playerStore';
import useAuthStore from '../store/authStore';
import { playlistsAPI, songsAPI } from '../api/api';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import NotificationModal from '../components/NotificationModal';
import ConfirmModal from '../components/ConfirmModal';
import { useAuthModal } from '../contexts/AuthModalContext';

// Sortable Queue Item Component
function SortableQueueItem({ song, index, actualIndex, isCurrentlyPlaying, onPlay, onPlayNext, onRemove, setConfirmModal }) {
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
      className={`flex items-center gap-2 sm:gap-4 p-3 sm:p-4 rounded-xl border group ${
        isCurrentlyPlaying
          ? 'bg-primary/10 border-primary/50'
          : 'bg-bg-card hover:bg-bg-hover border-border hover:border-primary/30'
      }`}
    >
      <div className="flex items-center gap-2">
        <div
          {...attributes}
          {...listeners}
          className="text-text-muted hover:text-text-primary transition cursor-grab active:cursor-grabbing flex-shrink-0 touch-none"
          title="Drag to reorder"
          onClick={(e) => e.stopPropagation()}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </div>
        <div className="text-text-muted w-8 text-center font-medium text-sm flex-shrink-0">
          {index + 1}
        </div>
      </div>
      {song.thumbnailUrl && (
        <img
          src={song.thumbnailUrl}
          alt={song.title}
          className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg flex-shrink-0"
        />
      )}
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm sm:text-base text-text-primary truncate">{song.title}</div>
        <div className="text-xs sm:text-sm text-text-muted truncate">
          {song.artist || 'Unknown Artist'}
        </div>
      </div>
      <div className="flex items-center gap-1.5 opacity-100">
        <button
          onClick={() => onPlayNext(song, actualIndex)}
          className="p-1.5 sm:p-2 bg-accent/10 hover:bg-accent/20 text-accent rounded-md transition text-xs sm:text-sm active:scale-95 flex-shrink-0"
          title="Play next"
        >
          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
        <button
          onClick={() => onPlay(song, actualIndex)}
          className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-primary to-accent text-white rounded-md hover:shadow-lg hover:shadow-primary/30 transition text-xs sm:text-sm active:scale-95 font-medium"
        >
          Play
        </button>
        <button
          onClick={() => {
            setConfirmModal({
              message: `Remove "${song.title}" from queue?`,
              onConfirm: () => {
                onRemove(actualIndex);
                setConfirmModal(null);
              },
              onCancel: () => setConfirmModal(null),
              type: 'warning',
            });
          }}
          className="p-1.5 sm:p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-md transition text-xs sm:text-sm active:scale-95 flex-shrink-0"
          title="Remove from queue"
        >
          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function Queue() {
  const navigate = useNavigate();
  const { openAuthModal } = useAuthModal();
  const { 
    queue, 
    currentIndex, 
    currentSong, 
    removeFromQueue, 
    setCurrentSong, 
    currentPlaylist,
    playNext,
    setYoutubeSearchState,
    reorderQueue,
  } = usePlayerStore();
  const { user, isAuthenticated } = useAuthStore();
  const [notification, setNotification] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const [playlists, setPlaylists] = useState([]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (isAuthenticated) {
      const loadPlaylists = async () => {
        try {
          const data = await playlistsAPI.getAll();
          setPlaylists(data.playlists);
        } catch (error) {
          console.error('Failed to load playlists:', error);
        }
      };
      loadPlaylists();
    }
  }, [isAuthenticated]);

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
  };

  const handlePlaySong = async (song, index) => {
    // When playing a song from the queue:
    // 1. Play the selected song immediately
    // 2. Move the currently playing song to be next (right after the selected song)
    const newQueue = [...queue];
    
    // If there's a currently playing song and it's not the one being clicked
    if (currentSong && currentIndex !== -1 && index !== currentIndex) {
      // Remove the selected song from its current position
      const [selectedSong] = newQueue.splice(index, 1);
      
      // Calculate where the current song is now (after removing selected song)
      let currentSongNewIndex = currentIndex;
      if (index < currentIndex) {
        // Selected song was before current, so current moved left by 1
        currentSongNewIndex = currentIndex - 1;
      }
      
      // Remove the current song from its position
      const [currentPlayingSong] = newQueue.splice(currentSongNewIndex, 1);
      
      // Insert selected song at position 0 (where current was)
      newQueue.splice(0, 0, selectedSong);
      // Insert current playing song right after selected song (at position 1)
      newQueue.splice(1, 0, currentPlayingSong);
      
      // Update queue and play the selected song at index 0 (even without youtubeId)
      reorderQueue(newQueue);
      setCurrentSong(selectedSong, currentPlaylist, 0, !!selectedSong.youtubeId);
      
      // If song doesn't have youtubeId, search in background
      if (!selectedSong.youtubeId) {
        setYoutubeSearchState(true, false);
        songsAPI.findYoutube(selectedSong.id)
          .then((result) => {
            if (result.song && result.song.youtubeId) {
              const updatedSong = result.song;
              const currentState = playerStore.getState();
              if (currentState.currentSong?.id === selectedSong.id) {
                setCurrentSong(updatedSong, currentPlaylist, 0, true);
              }
              const updatedQueue = currentState.queue.map((s) => 
                s.id === selectedSong.id ? updatedSong : s
              );
              playerStore.setState({ queue: updatedQueue });
              setYoutubeSearchState(false, false);
            } else {
              setYoutubeSearchState(false, true);
            }
          })
          .catch((error) => {
            console.error('Error finding YouTube video:', error);
            setYoutubeSearchState(false, true);
          });
      }
    } else {
      // No current song or clicking on current song, just play the selected one (even without youtubeId)
      setCurrentSong(song, currentPlaylist, index, !!song.youtubeId);
      
      // If song doesn't have youtubeId, search in background
      if (!song.youtubeId) {
        setYoutubeSearchState(true, false);
        songsAPI.findYoutube(song.id)
          .then((result) => {
            if (result.song && result.song.youtubeId) {
              const updatedSong = result.song;
              const currentState = playerStore.getState();
              if (currentState.currentSong?.id === song.id) {
                setCurrentSong(updatedSong, currentPlaylist, index, true);
              }
              const updatedQueue = currentState.queue.map((s) => 
                s.id === song.id ? updatedSong : s
              );
              playerStore.setState({ queue: updatedQueue });
              setYoutubeSearchState(false, false);
            } else {
              setYoutubeSearchState(false, true);
            }
          })
          .catch((error) => {
            console.error('Error finding YouTube video:', error);
            setYoutubeSearchState(false, true);
          });
      }
    }
  };

  const handlePlayNext = (song, currentIndex) => {
    // Add to player queue
    playNext(song);
    
    // Find the current playing song's index in the queue
    const currentSongIndex = queue.findIndex(s => s.id === currentSong?.id);
    
    // If we have a current song, move the clicked song right after it
    if (currentSongIndex !== -1) {
      const newQueue = [...queue];
      const [movedSong] = newQueue.splice(currentIndex, 1);
      // Insert right after current song
      const targetIndex = currentSongIndex + 1;
      newQueue.splice(targetIndex, 0, movedSong);
      
      // Update the queue order
      reorderQueue(newQueue);
    }
  };

  const handleRemoveFromQueue = (index) => {
    removeFromQueue(index);
  };

  const handleDragEnd = (event) => {
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
          
          // Update currentIndex if the currently playing song was affected
          let newCurrentIndex = currentIndex;
          if (currentSong && currentIndex >= 0) {
            // Find the new index of the current song
            const currentSongNewIndex = newQueue.findIndex(s => s.id === currentSong.id);
            if (currentSongNewIndex !== -1) {
              newCurrentIndex = currentSongNewIndex;
            }
          }
          
          reorderQueue(newQueue);
          if (newCurrentIndex !== currentIndex) {
            // Update currentIndex if it changed
            setCurrentSong(currentSong, currentPlaylist, newCurrentIndex, true);
          }
        }
      }
    }
  };

  const upcomingSongs = queue.slice(currentIndex + 1);

  // If authenticated, show with sidebar (matching Home/Playlist layout)
  if (isAuthenticated) {
    return (
      <div className="flex h-screen bg-bg-dark">
        <Sidebar
          onLogout={() => navigate('/')}
          username={user?.username}
          email={user?.email}
          playlists={playlists}
          onCreatePlaylist={() => {}}
          onPlaySong={() => {}}
          onDeletePlaylist={() => {}}
          onRefresh={() => {}}
        />
        <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => navigate('/home')}
                className="text-sm sm:text-base text-text-muted hover:text-text-primary transition flex items-center gap-2"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
            </div>

            <div className="mb-4 sm:mb-6 lg:mb-8">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-primary mb-1 sm:mb-2">Queue</h1>
              <p className="text-xs sm:text-sm lg:text-base text-text-muted">
                {upcomingSongs.length} {upcomingSongs.length === 1 ? 'song' : 'songs'} upcoming
              </p>
            </div>

            {currentSong && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-primary/10 border border-primary/30 rounded-xl">
                <div className="text-xs font-medium text-primary mb-2">Now Playing</div>
                <div className="flex items-center gap-3 sm:gap-4">
                  {currentSong.thumbnailUrl && (
                    <img
                      src={currentSong.thumbnailUrl}
                      alt={currentSong.title}
                      className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm sm:text-base text-text-primary truncate">{currentSong.title}</div>
                    <div className="text-xs sm:text-sm text-text-muted truncate">
                      {currentSong.artist || 'Unknown Artist'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {upcomingSongs.length === 0 ? (
              <div className="text-center text-text-muted py-20">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-bg-card flex items-center justify-center">
                  <svg className="w-12 h-12 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
                <p className="text-xl font-medium text-text-primary mb-2">Queue is empty</p>
                <p className="text-text-muted">Add songs to your queue to see them here</p>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={upcomingSongs.map((_, idx) => `queue-item-${currentIndex + 1 + idx}`)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {upcomingSongs.map((song, idx) => {
                      const actualIndex = currentIndex + 1 + idx;
                      const isCurrentlyPlaying = currentSong?.id === song.id;
                      return (
                        <SortableQueueItem
                          key={`${song.id}-${actualIndex}`}
                          song={song}
                          index={idx}
                          actualIndex={actualIndex}
                          isCurrentlyPlaying={isCurrentlyPlaying}
                          onPlay={handlePlaySong}
                          onPlayNext={handlePlayNext}
                          onRemove={handleRemoveFromQueue}
                          setConfirmModal={setConfirmModal}
                        />
                      );
                    })}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        </div>

        {notification && (
          <NotificationModal
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
          />
        )}

        {confirmModal && (
          <ConfirmModal
            message={confirmModal.message}
            onConfirm={confirmModal.onConfirm}
            onCancel={confirmModal.onCancel}
            type={confirmModal.type}
          />
        )}
      </div>
    );
  }

  // If not authenticated, show without sidebar (matching Explore/Artist page layout)
  return (
    <div className="min-h-screen bg-bg-dark">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 lg:py-8">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate('/explore')}
            className="text-sm sm:text-base text-text-muted hover:text-text-primary transition flex items-center gap-2"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        </div>

        <div className="mb-4 sm:mb-6 lg:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-primary mb-1 sm:mb-2">Queue</h1>
          <p className="text-xs sm:text-sm lg:text-base text-text-muted">
            {upcomingSongs.length} {upcomingSongs.length === 1 ? 'song' : 'songs'} upcoming
          </p>
        </div>

        {currentSong && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-primary/10 border border-primary/30 rounded-xl">
            <div className="text-xs font-medium text-primary mb-2">Now Playing</div>
            <div className="flex items-center gap-3 sm:gap-4">
              {currentSong.thumbnailUrl && (
                <img
                  src={currentSong.thumbnailUrl}
                  alt={currentSong.title}
                  className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm sm:text-base text-text-primary truncate">{currentSong.title}</div>
                <div className="text-xs sm:text-sm text-text-muted truncate">
                  {currentSong.artist || 'Unknown Artist'}
                </div>
              </div>
            </div>
          </div>
        )}

        {upcomingSongs.length === 0 ? (
          <div className="text-center text-text-muted py-20">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-bg-card flex items-center justify-center">
              <svg className="w-12 h-12 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
            <p className="text-xl font-medium text-text-primary mb-2">Queue is empty</p>
            <p className="text-text-muted">Add songs to your queue to see them here</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={upcomingSongs.map((_, idx) => `queue-item-${currentIndex + 1 + idx}`)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {upcomingSongs.map((song, idx) => {
                  const actualIndex = currentIndex + 1 + idx;
                  const isCurrentlyPlaying = currentSong?.id === song.id;
                  return (
                    <SortableQueueItem
                      key={`${song.id}-${actualIndex}`}
                      song={song}
                      index={idx}
                      actualIndex={actualIndex}
                      isCurrentlyPlaying={isCurrentlyPlaying}
                      onPlay={handlePlaySong}
                      onPlayNext={handlePlayNext}
                      onRemove={handleRemoveFromQueue}
                      setConfirmModal={setConfirmModal}
                    />
                  );
                })}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {notification && (
        <NotificationModal
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {confirmModal && (
        <ConfirmModal
          message={confirmModal.message}
          onConfirm={confirmModal.onConfirm}
          onCancel={confirmModal.onCancel}
          type={confirmModal.type}
        />
      )}
    </div>
  );
}

export default Queue;
