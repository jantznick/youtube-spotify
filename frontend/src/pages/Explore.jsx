import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import usePlayerStore from '../store/playerStore';
import { songsAPI, playlistsAPI } from '../api/api';
import SongList from '../components/SongList';
import NotificationModal from '../components/NotificationModal';
import AddSongModal from '../components/AddSongModal';
import { useAuthModal } from '../contexts/AuthModalContext';

function Explore() {
  const { openAuthModal } = useAuthModal();
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const navigate = useNavigate();
  const { setCurrentSong, setQueue, addToQueue, queue } = usePlayerStore();

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const songsData = await songsAPI.getAll();
      setSongs(songsData.songs);
    } catch (error) {
      console.error('Failed to load data:', error);
      showNotification('Failed to load songs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaySong = (song) => {
    // If there's already a queue, preserve it and just play the song
    if (queue.length > 0) {
      const songIndex = queue.findIndex((s) => s.id === song.id);
      if (songIndex !== -1) {
        // Song is in queue, play it from there
        setCurrentSong(song, null, songIndex, true);
      } else {
        // Song not in queue, add it and play
        const newQueue = [...queue, song];
        setQueue(newQueue);
        setCurrentSong(song, null, newQueue.length - 1, true);
      }
    } else {
      // No queue, just play the single song (don't create a queue of all songs)
      setCurrentSong(song, null, 0, false);
    }
  };

  const handleImportPlaylist = async (url) => {
    try {
      setShowImportModal(false);
      showNotification('Importing playlist... This may take a moment.', 'info');
      
      // For logged-out users, we'll need to create a backend endpoint that imports without auth
      // For now, show a message that they need to sign in
      showNotification('Please sign in to import playlists. Sign up is free!', 'info');
    } catch (error) {
      console.error('Failed to import playlist:', error);
      showNotification(error.response?.data?.error || 'Failed to import playlist', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-bg-dark">
        <div className="text-xl text-text-primary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-dark">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-bg-dark/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2 sm:gap-4">
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
            <span className="text-lg sm:text-xl font-bold text-text-primary">MusicDocks</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            <button
              onClick={() => setShowImportModal(true)}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg hover:shadow-lg hover:shadow-primary/30 transition-all font-medium text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">Import Playlist</span>
            </button>
            <span className="text-xs sm:text-sm text-text-secondary hidden sm:inline">
              <button onClick={() => openAuthModal('register')} className="text-primary hover:text-primary-dark">
                Sign up free
              </button> to create playlists and save your favorites
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 lg:py-8">
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-primary mb-1 sm:mb-2">
            Explore Music
          </h1>
          <p className="text-xs sm:text-sm lg:text-base text-text-muted">
            {songs.length} {songs.length === 1 ? 'song' : 'songs'} available
          </p>
        </div>

        <SongList
          songs={songs}
          onPlay={handlePlaySong}
          playlists={[]}
          onAddToPlaylist={() => {
            showNotification('Please sign in to add songs to playlists', 'info');
          }}
        />
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-bg-card border border-border p-6 rounded-2xl w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold mb-4 text-text-primary">Import Playlist</h2>
            <p className="text-text-muted mb-6">
              To import playlists from YouTube or Spotify, please{' '}
              <button onClick={() => openAuthModal('register')} className="text-primary hover:text-primary-dark">
                sign up for free
              </button>
              {' '}or{' '}
              <button onClick={() => openAuthModal('login')} className="text-primary hover:text-primary-dark">
                sign in
              </button>
              .
            </p>
            <p className="text-sm text-text-muted mb-6">
              Once you're signed in, you can import playlists, create your own playlists, and save your favorite songs.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowImportModal(false);
                  openAuthModal('register');
                }}
                className="flex-1 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg hover:shadow-lg hover:shadow-primary/30 transition text-center font-medium"
              >
                Sign Up Free
              </button>
              <button
                onClick={() => setShowImportModal(false)}
                className="flex-1 py-3 bg-bg-hover border border-border text-text-primary rounded-lg hover:bg-bg-card transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {notification && (
        <NotificationModal
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}

export default Explore;
