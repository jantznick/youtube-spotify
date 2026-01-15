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
import { Link } from 'react-router-dom';
import usePlayerStore from '../store/playerStore';
import useAuthStore from '../store/authStore';
import { playlistsAPI } from '../api/api';
import Sidebar from '../components/Sidebar';
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
      <div className="flex items-center gap-1 sm:gap-2 md:opacity-0 md:group-hover:opacity-100 opacity-100 transition-opacity">
        <button
          onClick={() => onPlayNext(song, actualIndex)}
          className="px-2 sm:px-3 py-1.5 sm:py-2 bg-accent/10 hover:bg-accent/20 text-accent rounded-lg transition text-xs sm:text-sm active:scale-95"
          title="Play next"
        >
          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 inline-block sm:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
          <span className="hidden sm:inline">Next</span>
        </button>
        <button
          onClick={() => onPlay(song, actualIndex)}
          className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-primary to-accent text-white rounded-lg hover:shadow-lg hover:shadow-primary/30 transition text-xs sm:text-sm active:scale-95"
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
          className="px-2 sm:px-4 py-1.5 sm:py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition text-xs sm:text-sm active:scale-95"
          title="Remove from queue"
        >
          <span className="hidden sm:inline">Remove</span>
          <svg className="w-4 h-4 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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

  const handlePlaySong = (song, index) => {
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
      
      // Update queue and play the selected song at index 0
      reorderQueue(newQueue);
      setCurrentSong(selectedSong, currentPlaylist, 0, true);
    } else {
      // No current song or clicking on current song, just play the selected one
      setCurrentSong(song, currentPlaylist, index, true);
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

  return (
    <div className="flex h-screen bg-bg-dark">
      {isAuthenticated && (
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
      )}
      {!isAuthenticated && (
        <header className="fixed top-0 left-0 right-0 z-40 bg-bg-dark/80 backdrop-blur-md border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2 sm:gap-4">
            <Link to="/explore" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <span className="text-lg sm:text-xl font-bold text-text-primary">MusicDocks</span>
            </Link>
            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
              <span className="text-xs sm:text-sm text-text-secondary hidden sm:inline">
                <button onClick={() => openAuthModal('register')} className="text-primary hover:text-primary-dark">
                  Sign up free
                </button> to create playlists and save your favorites
              </span>
            </div>
          </div>
        </header>
      )}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        <div className={`flex-1 overflow-y-auto ${!isAuthenticated ? 'pt-24' : ''} ${isAuthenticated ? 'p-4 sm:p-6 lg:p-8' : ''}`}>
          <div className={!isAuthenticated ? 'max-w-7xl mx-auto px-4 sm:px-6 py-8' : 'p-4 sm:p-6 lg:p-8'}>
            <button
              onClick={() => navigate(isAuthenticated ? '/home' : '/explore')}
              className="mb-4 text-sm sm:text-base text-text-muted hover:text-text-primary transition flex items-center gap-2"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>

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
