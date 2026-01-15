import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
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
import { playlistsAPI, songsAPI } from '../api/api';
import usePlayerStore from '../store/playerStore';
import useAuthStore from '../store/authStore';
import Sidebar from '../components/Sidebar';
import AddSongModal from '../components/AddSongModal';
import NotificationModal from '../components/NotificationModal';
import ConfirmModal from '../components/ConfirmModal';
import PlaylistSettingsModal from '../components/PlaylistSettingsModal';

// Sortable Song Item Component
function SortableSongItem({ playlistSong, index, isCurrentlyPlaying, onPlay, onRemove, onPlayNext, onAddToQueue, setConfirmModal, isSortable }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: playlistSong.id, disabled: !isSortable });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 300ms cubic-bezier(0.2, 0, 0.2, 1), opacity 200ms ease',
    opacity: isDragging ? 0.5 : 1,
  };

  const song = playlistSong.song;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border group ${
        isCurrentlyPlaying
          ? 'bg-primary/10 border-primary/50'
          : 'bg-bg-card hover:bg-bg-hover border-border hover:border-primary/30'
      }`}
    >
      <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
        <div className="flex items-center gap-2">
          {isSortable && (
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
          )}
          <div className="text-text-muted w-6 sm:w-8 text-center font-medium text-sm sm:text-base flex-shrink-0">{index + 1}</div>
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
      </div>
                    <div className="flex items-center gap-1.5 w-full sm:w-auto sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddToQueue(song);
                        }}
                        className="p-1.5 sm:p-2 bg-accent/10 hover:bg-accent/20 text-accent rounded-md transition text-xs sm:text-sm flex-shrink-0"
                        title="Add to queue"
                      >
                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                      </button>
                      <button
                        onClick={() => onPlayNext(song, index)}
                        className="p-1.5 sm:p-2 bg-accent/10 hover:bg-accent/20 text-accent rounded-md transition text-xs sm:text-sm flex-shrink-0"
                        title="Play next"
                      >
                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
        <button
          onClick={() => onPlay(song, index)}
          className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-primary to-accent text-white rounded-md hover:shadow-lg hover:shadow-primary/30 transition text-xs sm:text-sm font-medium"
        >
          Play
        </button>
        <button
          onClick={() => {
            setConfirmModal({
              message: `Remove "${song.title}" from this playlist?`,
              onConfirm: () => {
                onRemove(song.id);
                setConfirmModal(null);
              },
              onCancel: () => setConfirmModal(null),
              type: 'warning',
            });
          }}
          className="p-1.5 sm:p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-md transition text-xs sm:text-sm flex-shrink-0"
          title="Remove from playlist"
        >
          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function Playlist() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState(null);
  const [allSongs, setAllSongs] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddSongModal, setShowAddSongModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [notification, setNotification] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const [expectedSongCount, setExpectedSongCount] = useState(null);
  const [initialSongCount, setInitialSongCount] = useState(null);
  const [pollingCount, setPollingCount] = useState(0);
  const [socketConnected, setSocketConnected] = useState(false);
  const socketRef = useRef(null);
  const { currentSong, setCurrentSong, setQueue, currentPlaylist, isPlaying, togglePlay, playNext, addToQueue } = usePlayerStore();
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  const { user } = useAuthStore();

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
  };

  useEffect(() => {
    // Remove expectedSongs from URL if present (legacy support)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('expectedSongs')) {
      window.history.replaceState({}, '', `/playlist/${id}`);
    }
    
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Socket.io connection for real-time updates (when import is in progress or metadata is loading)
  useEffect(() => {
    if (!user?.id || !playlist) return;
    
    // Get expectedSongCount from playlist object (from API) or state
    const apiExpectedCount = playlist.expectedSongCount;
    const currentExpectedCount = expectedSongCount || apiExpectedCount;
    const currentCount = playlist.playlistSongs?.length || 0;
    
    // Connect if:
    // 1. Metadata is still loading (name is "Loading Playlist...")
    // 2. Import is in progress (expectedSongCount is set and not complete)
    const isLoadingMetadata = playlist.name === 'Loading Playlist...' && !currentExpectedCount;
    const isImportInProgress = currentExpectedCount && currentCount < currentExpectedCount;
    
    if (!isLoadingMetadata && !isImportInProgress) {
      console.log('No import or metadata loading in progress, skipping Socket.io connection', {
        name: playlist.name,
        currentExpectedCount,
        currentCount,
        isLoadingMetadata,
        isImportInProgress,
      });
      return;
    }
    
    console.log('Connecting to Socket.io:', {
      isLoadingMetadata,
      isImportInProgress,
      currentExpectedCount,
      currentCount,
    });

    // Construct Socket.io URL from API URL
    let SOCKET_URL;
    if (import.meta.env.VITE_API_URL) {
      // Parse the API URL and remove /api if present
      const apiUrl = import.meta.env.VITE_API_URL;
      // Remove trailing /api if it exists
      SOCKET_URL = apiUrl.replace(/\/api\/?$/, '');
      // Ensure it doesn't have a trailing slash
      SOCKET_URL = SOCKET_URL.replace(/\/$/, '');
    } else {
      // Development fallback
      SOCKET_URL = window.location.origin.replace(':5173', ':3001');
    }

    console.log('Connecting to Socket.io for import progress:', SOCKET_URL);
    
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      auth: {
        sessionId: document.cookie
          .split('; ')
          .find(row => row.startsWith('connect.sid='))
          ?.split('=')[1],
      },
    });

    socket.on('connect', () => {
      console.log('Socket.io connected:', socket.id);
      socket.emit('join', user.id);
      setSocketConnected(true);
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket.io disconnected:', reason);
      setSocketConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket.io connection error:', error);
      setSocketConnected(false);
    });

    // Listen for playlist metadata ready event
    socket.on('playlist-metadata-ready', (data) => {
      console.log('Received playlist-metadata-ready event:', data);
      if (data.playlistId === id) {
        // Update playlist with metadata
        setPlaylist(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            name: data.name,
            expectedSongCount: data.songCount,
            sourceType: data.sourceType,
          };
        });
        setExpectedSongCount(data.songCount);
        // Reload to get full playlist data
        loadData();
      }
    });

    // Listen for playlist song added events
    socket.on('playlist-song-added', (data) => {
      console.log('Received playlist-song-added event:', data);
      if (data.playlistId === id && data.song) {
        // Update state directly with the new song instead of fetching entire playlist
        setPlaylist(prev => {
          if (!prev) return prev;
          
          // Check if song already exists in playlist
          const existingIndex = prev.playlistSongs?.findIndex(
            ps => ps.song.id === data.song.id
          );
          
          if (existingIndex !== -1 && existingIndex !== undefined) {
            // Song already exists, return unchanged
            return prev;
          }
          
          // Create new playlistSong object
          const newPlaylistSong = {
            id: `temp-${Date.now()}-${data.song.id}`, // Temporary ID until we reload
            song: data.song,
            position: data.position ?? (prev.playlistSongs?.length || 0),
          };
          
          // Append to the end (backend manages positions correctly)
          const newPlaylistSongs = [...(prev.playlistSongs || []), newPlaylistSong];
          
          return {
            ...prev,
            playlistSongs: newPlaylistSongs,
          };
        });
      }
    });

    // Listen for import completion
    socket.on('playlist-import-complete', (data) => {
      console.log('Received playlist-import-complete event:', data);
      if (data.playlistId === id) {
        // Stop polling and clear expected count
        setExpectedSongCount(null);
        setInitialSongCount(null);
        setPollingCount(0);
        // Reload once to get proper IDs and updated expectedSongCount (should be null now)
        loadData();
      }
    });

    // Listen for refresh completion
    socket.on('playlist-refresh-complete', (data) => {
      console.log('Received playlist-refresh-complete event:', data);
      if (data.playlistId === id) {
        // Reload to get final state
        loadData();
      }
    });

    socketRef.current = socket;

    return () => {
      console.log('Cleaning up Socket.io connection');
      socket.disconnect();
    };
  }, [user?.id, id, expectedSongCount, playlist?.expectedSongCount, playlist?.name, playlist?.playlistSongs?.length]);

  // Set initial song count when playlist loads and we're expecting songs
  useEffect(() => {
    if (playlist && expectedSongCount && initialSongCount === null) {
      const currentCount = Array.isArray(playlist.playlistSongs) ? playlist.playlistSongs.length : 0;
      const targetCount = currentCount + expectedSongCount;
      console.log('Setting initial song count:', currentCount, 'Target:', targetCount);
      setInitialSongCount(currentCount);
      
      // If we've already reached the target, reload to get updated expectedSongCount from API
      if (currentCount >= targetCount) {
        console.log('Import already complete when page loaded');
        setExpectedSongCount(null);
        setInitialSongCount(null);
        loadData();
      }
    }
  }, [playlist?.id, expectedSongCount, initialSongCount, id]);

  // Polling effect for importing playlists (fallback if WebSocket is not connected)
  useEffect(() => {
    // Only poll if WebSocket is not connected
    if (socketConnected) {
      console.log('WebSocket connected, skipping polling');
      return;
    }

    if (!playlist || !expectedSongCount || initialSongCount === null) {
      if (expectedSongCount && initialSongCount === null) {
        console.log('Polling not started - waiting for initial song count. Expected:', expectedSongCount);
      }
      return;
    }

    const currentSongCount = Array.isArray(playlist.playlistSongs) ? playlist.playlistSongs.length : 0;
    const targetCount = initialSongCount + expectedSongCount;
    console.log('Polling check (WebSocket fallback):', { 
      currentSongCount, 
      initialSongCount,
      expectedSongCount,
      targetCount,
      pollingCount,
      playlistId: playlist.id,
    });
    
    // Stop polling if we've reached the target count (initial + expected)
    if (currentSongCount >= targetCount) {
      console.log('Import complete! Reached target song count.');
      setExpectedSongCount(null);
      setInitialSongCount(null);
      setPollingCount(0);
      // Reload to get updated expectedSongCount from API (should be null)
      loadData();
      return;
    }

    // Stop polling if we've had 3 consecutive polls with no new songs
    if (pollingCount >= 3) {
      console.log('Stopping polling - 3 consecutive polls with no new songs');
      setExpectedSongCount(null);
      setInitialSongCount(null);
      setPollingCount(0);
      // Reload to get updated expectedSongCount from API
      loadData();
      return;
    }

    console.log('Starting polling interval (WebSocket fallback)...');
    // Set up polling interval (10 seconds) - only used if WebSocket is disconnected
    const interval = setInterval(async () => {
      try {
        const previousSongCount = Array.isArray(playlist.playlistSongs) ? playlist.playlistSongs.length : 0;
        console.log('Polling - fetching updated playlist. Previous count:', previousSongCount);
        
        // Fetch updated playlist data
        const playlistData = await playlistsAPI.getOne(id);
        const newSongCount = Array.isArray(playlistData.playlist.playlistSongs) ? playlistData.playlist.playlistSongs.length : 0;
        console.log('Polling - new count:', newSongCount);
        
        // Update playlist state and expectedSongCount from API
        setPlaylist(playlistData.playlist);
        if (playlistData.playlist.expectedSongCount) {
          setExpectedSongCount(playlistData.playlist.expectedSongCount);
        } else {
          setExpectedSongCount(null);
        }
        
        if (newSongCount === previousSongCount) {
          // No new songs, increment polling count
          console.log('No new songs, incrementing polling count');
          setPollingCount(prev => prev + 1);
        } else {
          // Got new songs, reset polling count
          console.log('Got new songs! Resetting polling count.');
          setPollingCount(0);
        }
      } catch (error) {
        console.error('Error polling playlist:', error);
        setPollingCount(prev => prev + 1);
      }
    }, 10000); // Poll every 10 seconds

    return () => {
      console.log('Cleaning up polling interval');
      clearInterval(interval);
    };
  }, [socketConnected, playlist?.id, playlist?.playlistSongs?.length, expectedSongCount, initialSongCount, pollingCount, id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [playlistData, songsData, playlistsData] = await Promise.all([
        playlistsAPI.getOne(id),
        songsAPI.getAll(),
        playlistsAPI.getAll(),
      ]);
      console.log('Loaded playlist data:', {
        id: playlistData.playlist?.id,
        name: playlistData.playlist?.name,
        songCount: playlistData.playlist?.playlistSongs?.length || 0,
        expectedSongCount: playlistData.playlist?.expectedSongCount,
        sourceType: playlistData.playlist?.sourceType,
      });
      setPlaylist(playlistData.playlist);
      setAllSongs(songsData.songs);
      setPlaylists(playlistsData.playlists);
      
      // Set expectedSongCount from API if import is in progress
      if (playlistData.playlist?.expectedSongCount) {
        setExpectedSongCount(playlistData.playlist.expectedSongCount);
      } else {
        setExpectedSongCount(null);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      console.error('Error details:', error.response?.data || error.message);
      showNotification('Failed to load playlist', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaySong = (song, index) => {
    const playlistSongs = playlist.playlistSongs.map((ps) => ps.song);
    setQueue(playlistSongs);
    setCurrentSong(song, playlist, index);
  };

  const handlePlayPlaylist = () => {
    if (currentPlaylist?.id === playlist.id && isPlaying) {
      togglePlay();
    } else {
      const playlistSongs = playlist.playlistSongs.map((ps) => ps.song);
      if (playlistSongs.length > 0) {
        setQueue(playlistSongs);
        setCurrentSong(playlistSongs[0], playlist, 0);
      }
    }
  };

  const handleRefresh = async () => {
    if (!playlist.sourceUrl) {
      showNotification('This playlist does not have a source URL to refresh from', 'error');
      return;
    }

    try {
      await playlistsAPI.refresh(playlist.id);
      showNotification('Playlist refresh started! Songs will be updated in the background.', 'success');
      // Reload data after a short delay to show updated timestamp
      setTimeout(() => {
        loadData();
      }, 2000);
    } catch (error) {
      console.error('Failed to refresh playlist:', error);
      showNotification(error.response?.data?.error || 'Failed to refresh playlist', 'error');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleAddSong = async (songId) => {
    try {
      await playlistsAPI.addSong(id, songId);
      await loadData();
      showNotification('Song added to playlist!', 'success');
      // Don't close modal - allow adding multiple songs
    } catch (error) {
      showNotification('Failed to add song to playlist', 'error');
    }
  };

  const handleRemoveSong = async (songId) => {
    try {
      await playlistsAPI.removeSong(id, songId);
      await loadData();
      showNotification('Song removed from playlist', 'success');
    } catch (error) {
      showNotification('Failed to remove song from playlist', 'error');
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = playlist.playlistSongs.findIndex(ps => ps.id === active.id);
      const newIndex = playlist.playlistSongs.findIndex(ps => ps.id === over.id);

      const newPlaylistSongs = arrayMove(playlist.playlistSongs, oldIndex, newIndex);

      // Update local state optimistically
      setPlaylist({
        ...playlist,
        playlistSongs: newPlaylistSongs,
      });

      // If this playlist is currently playing, update the player queue and currentIndex
      if (currentPlaylist?.id === playlist.id) {
        const updatedPlaylist = {
          ...playlist,
          playlistSongs: newPlaylistSongs,
        };
        
        // Create new queue from reordered playlist
        const newQueue = newPlaylistSongs.map(ps => ps.song);
        const currentSongId = currentSong?.id;
        const newCurrentIndex = newQueue.findIndex(song => song.id === currentSongId);
        
        // Update everything together - setCurrentSong will set the queue from the playlist
        if (newCurrentIndex !== -1) {
          setCurrentSong(newQueue[newCurrentIndex], updatedPlaylist, newCurrentIndex);
        } else {
          // Fallback: just update queue if current song not found
          setQueue(newQueue);
        }
      }

      // Send reorder request to backend
      try {
        const songIds = newPlaylistSongs.map(ps => ps.song.id);
        await playlistsAPI.reorder(id, songIds);
        showNotification('Playlist reordered', 'success');
      } catch (error) {
        // Revert on error
        await loadData();
        showNotification('Failed to reorder playlist', 'error');
      }
    }
  };

  const handlePlayNext = async (song, currentIndex) => {
    // Find the current playing song's index in the playlist
    const currentSongIndex = playlist.playlistSongs.findIndex(
      ps => ps.song.id === currentSong?.id
    );
    
    // If we have a current song and it's in this playlist, move the clicked song right after it
    if (currentSongIndex !== -1 && currentPlaylist?.id === playlist.id) {
      const newPlaylistSongs = [...playlist.playlistSongs];
      const [movedSong] = newPlaylistSongs.splice(currentIndex, 1);
      // Insert right after current song
      const targetIndex = currentSongIndex + 1;
      newPlaylistSongs.splice(targetIndex, 0, movedSong);
      
      // Update local state first for smooth animation
      const updatedPlaylist = {
        ...playlist,
        playlistSongs: newPlaylistSongs,
      };
      setPlaylist(updatedPlaylist);
      
      // Update the player queue to match the new playlist order
      const newQueue = newPlaylistSongs.map(ps => ps.song);
      const newCurrentIndex = newQueue.findIndex(s => s.id === currentSong?.id);
      
      // Update queue and currentIndex together
      setQueue(newQueue);
      if (newCurrentIndex !== -1) {
        setCurrentSong(newQueue[newCurrentIndex], updatedPlaylist, newCurrentIndex);
      }
      
      // Send reorder request to backend
      try {
        const songIds = newPlaylistSongs.map(ps => ps.song.id);
        await playlistsAPI.reorder(id, songIds);
      } catch (error) {
        // Revert on error
        await loadData();
        showNotification('Failed to reorder playlist', 'error');
      }
    } else {
      // No current song or not in this playlist, just add to queue
      playNext(song);
    }
  };

  const handleDeletePlaylist = async () => {
    try {
      await playlistsAPI.delete(id);
      showNotification('Playlist deleted', 'success');
      navigate('/home');
    } catch (error) {
      showNotification('Failed to delete playlist', 'error');
    }
  };

  const availableSongs = allSongs.filter(
    (song) => !playlist?.playlistSongs?.some((ps) => ps.song.id === song.id)
  );

  const isCurrentPlaylist = currentPlaylist?.id === playlist?.id;
  const showPause = isCurrentPlaylist && isPlaying;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-xl mb-2">Loading Playlist Data...</div>
          <div className="text-text-muted">Fetching playlist information...</div>
        </div>
      </div>
    );
  }
  
  // Show loading state if playlist name is still "Loading Playlist..."
  const isLoadingMetadata = playlist.name === 'Loading Playlist...' && !expectedSongCount;

  return (
    <div className="flex h-screen bg-bg-dark">
      <Sidebar
        onLogout={() => navigate('/')}
        username={user?.username}
        email={user?.email}
        playlists={playlists}
        onCreatePlaylist={() => {}}
        onPlaySong={handlePlaySong}
        onDeletePlaylist={() => {}}
        onRefresh={loadData}
      />
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-6 lg:mb-8">
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('toggle-sidebar'));
                }}
                className="lg:hidden text-text-muted hover:text-text-primary transition-colors"
                aria-label="Toggle menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <button
                onClick={() => navigate('/')}
                className="text-sm sm:text-base text-text-muted hover:text-text-primary transition flex items-center gap-2"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Library
              </button>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-6">
              <div className="flex-1 min-w-0">
                {isLoadingMetadata ? (
                  <div className="mb-3 sm:mb-4">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary mb-2 break-words">Loading Playlist Data...</h1>
                    <p className="text-sm sm:text-base text-text-muted">Fetching playlist information from source...</p>
                  </div>
                ) : (
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary mb-3 sm:mb-4 break-words">{playlist.name}</h1>
                )}
                {playlist.description && (
                  <p className="text-sm sm:text-base text-text-muted mb-3 sm:mb-4 break-words">{playlist.description}</p>
                )}
                <div className="flex flex-col gap-3 sm:gap-4 mb-2">
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                    <p className="text-sm sm:text-base text-text-muted">
                      {playlist.playlistSongs?.length || 0} {playlist.playlistSongs?.length === 1 ? 'song' : 'songs'}
                    </p>
                  </div>
                  {expectedSongCount && initialSongCount !== null && (playlist.playlistSongs?.length || 0) < (initialSongCount + expectedSongCount) && (
                    <div className="w-full max-w-md">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-accent">Importing songs...</span>
                        <span className="text-sm text-text-muted">
                          {playlist.playlistSongs?.length || 0} / {initialSongCount + expectedSongCount}
                        </span>
                      </div>
                      <div className="w-full bg-bg-hover rounded-full h-2.5 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-primary via-primary-dark to-primary rounded-full transition-all duration-500 ease-out relative overflow-hidden"
                          style={{ 
                            width: `${Math.min(100, ((playlist.playlistSongs?.length || 0) / (initialSongCount + expectedSongCount)) * 100)}%` 
                          }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                        </div>
                      </div>
                    </div>
                  )}
                  {playlist.lastSyncedAt && !expectedSongCount && (
                    <p className="text-xs sm:text-sm text-text-secondary">
                      Last synced {formatDate(playlist.lastSyncedAt)}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-2">
                <button
                  onClick={handlePlayPlaylist}
                  className="px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg hover:shadow-lg hover:shadow-primary/30 transition-all font-medium flex items-center justify-center gap-2 text-sm"
                >
                  {showPause ? (
                    <>
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <span className="hidden sm:inline">Pause</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                      <span className="hidden sm:inline">Play</span>
                    </>
                  )}
                </button>
                {playlist.sourceUrl && (
                  <button
                    onClick={handleRefresh}
                    className="px-3 sm:px-4 py-2 sm:py-2.5 bg-bg-hover border border-border text-text-muted hover:text-text-primary rounded-lg hover:bg-bg-card transition-all flex items-center justify-center gap-1.5 text-sm"
                    title="Refresh from source"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span className="hidden sm:inline">Refresh</span>
                  </button>
                )}
                <button
                  onClick={() => setShowSettingsModal(true)}
                  className="px-3 sm:px-4 py-2 sm:py-2.5 bg-bg-hover border border-border text-text-muted hover:text-text-primary rounded-lg hover:bg-bg-card transition-all flex items-center justify-center gap-1.5 text-sm"
                  title="Playlist Settings"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="hidden sm:inline">Settings</span>
                </button>
                {!playlist.sourceType && (
                  <button
                    onClick={() => setShowAddSongModal(true)}
                    className="px-3 sm:px-4 py-2 sm:py-2.5 bg-bg-hover border border-border text-text-muted hover:text-text-primary rounded-lg hover:bg-bg-card transition-all flex items-center justify-center gap-1.5 text-sm"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="hidden sm:inline">Add Songs</span>
                    <span className="sm:hidden">Add</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    setConfirmModal({
                      message: 'Are you sure you want to delete this playlist?',
                      onConfirm: () => {
                        handleDeletePlaylist();
                        setConfirmModal(null);
                      },
                      onCancel: () => setConfirmModal(null),
                      type: 'danger',
                    });
                  }}
                  className="px-3 sm:px-4 py-2 sm:py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg transition-all flex items-center justify-center gap-1.5 text-sm"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span className="hidden sm:inline">Delete</span>
                </button>
              </div>
            </div>
          </div>

          {/* Songs List */}
          {Array.isArray(playlist.playlistSongs) && playlist.playlistSongs.length > 0 ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={playlist.playlistSongs.map(ps => ps.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {playlist.playlistSongs.map((playlistSong, index) => {
                    const song = playlistSong.song;
                    const isCurrentlyPlaying = isCurrentPlaylist && currentSong?.id === song.id;
                    const isSortable = true; // Allow sorting for all playlists
                    return (
                      <SortableSongItem
                        key={playlistSong.id}
                        playlistSong={playlistSong}
                        index={index}
                        isCurrentlyPlaying={isCurrentlyPlaying}
                        onPlay={handlePlaySong}
                        onRemove={handleRemoveSong}
                        onPlayNext={handlePlayNext}
                        onAddToQueue={addToQueue}
                        setConfirmModal={setConfirmModal}
                        isSortable={isSortable}
                      />
                    );
                  })}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            <div className="text-center text-text-muted py-20">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-bg-card flex items-center justify-center">
                <svg className="w-12 h-12 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <p className="text-xl font-medium text-text-primary mb-2">No songs in this playlist</p>
              {expectedSongCount && initialSongCount !== null && (playlist.playlistSongs?.length || 0) < (initialSongCount + expectedSongCount) ? (
                <div className="w-full max-w-sm mx-auto mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-accent">Importing songs...</span>
                    <span className="text-sm text-text-muted">
                      {playlist.playlistSongs?.length || 0} / {initialSongCount + expectedSongCount}
                    </span>
                  </div>
                  <div className="w-full bg-bg-hover rounded-full h-3 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary via-primary-dark to-primary rounded-full transition-all duration-500 ease-out relative overflow-hidden"
                      style={{ 
                        width: `${Math.min(100, ((playlist.playlistSongs?.length || 0) / (initialSongCount + expectedSongCount)) * 100)}%` 
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                    </div>
                  </div>
                </div>
              ) : !playlist.sourceType ? (
                <>
                  <p className="text-text-muted mb-4">Add songs to get started!</p>
                  <button
                    onClick={() => setShowAddSongModal(true)}
                    className="px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all font-medium"
                  >
                    Add Songs
                  </button>
                </>
              ) : (
                <p className="text-text-muted mb-4">
                  This playlist is synced from {playlist.sourceType === 'youtube' ? 'YouTube' : 'Spotify'}. 
                  Use the Refresh button to update songs from the source.
                </p>
              )}
            </div>
          )}

          {/* Add Song Modal */}
          {showAddSongModal && (
            <div 
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
              onClick={(e) => {
                // Only close if clicking the backdrop, not the modal content
                if (e.target === e.currentTarget) {
                  setShowAddSongModal(false);
                }
              }}
            >
              <div 
                className="bg-bg-card border border-border p-4 sm:p-6 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl my-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl sm:text-2xl font-bold text-text-primary">Add Songs to Playlist</h3>
                  <button
                    onClick={() => setShowAddSongModal(false)}
                    className="text-text-muted hover:text-text-primary transition"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                {availableSongs.length === 0 ? (
                  <div className="text-center text-text-muted py-8">
                    <p>All your songs are already in this playlist</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {availableSongs.map((song) => (
                      <div
                        key={song.id}
                        className="flex items-center justify-between p-4 hover:bg-bg-hover rounded-lg transition border border-border"
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          {song.thumbnailUrl && (
                            <img
                              src={song.thumbnailUrl}
                              alt={song.title}
                              className="w-12 h-12 object-cover rounded-md flex-shrink-0"
                            />
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-text-primary truncate">{song.title}</div>
                            <div className="text-sm text-text-muted truncate">{song.artist || 'Unknown Artist'}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleAddSong(song.id)}
                          className="px-4 py-2 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg hover:shadow-lg hover:shadow-primary/30 transition text-sm flex-shrink-0 ml-4"
                        >
                          Add
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
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

      {showSettingsModal && playlist && (
        <PlaylistSettingsModal
          playlist={playlist}
          onClose={() => setShowSettingsModal(false)}
          onUpdate={(updatedPlaylist) => {
            setPlaylist(updatedPlaylist);
            setShowSettingsModal(false);
          }}
        />
      )}
    </div>
  );
}

export default Playlist;
