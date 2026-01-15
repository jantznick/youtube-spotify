import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import usePlayerStore from '../store/playerStore';
import { authAPI, songsAPI, playlistsAPI } from '../api/api';
import Sidebar from '../components/Sidebar';
import SongList from '../components/SongList';
import NotificationModal from '../components/NotificationModal';

function Home() {
  const [songs, setSongs] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { setCurrentSong, setQueue, queue } = usePlayerStore();

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [songsData, playlistsData] = await Promise.all([
        songsAPI.getAll(),
        playlistsAPI.getAll(),
      ]);
      setSongs(songsData.songs);
      setPlaylists(playlistsData.playlists);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
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

  const handleCreatePlaylist = async (name, description) => {
    try {
      const newPlaylist = await playlistsAPI.create({ name, description });
      setPlaylists((prev) => [newPlaylist.playlist, ...prev]);
    } catch (error) {
      console.error('Failed to create playlist:', error);
      throw error;
    }
  };

  const handleDeletePlaylist = async (playlistId) => {
    try {
      await playlistsAPI.delete(playlistId);
      setPlaylists((prev) => prev.filter((p) => p.id !== playlistId));
    } catch (error) {
      console.error('Failed to delete playlist:', error);
    }
  };

  const handleAddToPlaylist = async (playlistId, songId) => {
    try {
      await playlistsAPI.addSong(playlistId, songId);
      showNotification('Song added to playlist!', 'success');
      // Reload playlists to get updated song counts
      const playlistsData = await playlistsAPI.getAll();
      setPlaylists(playlistsData.playlists);
    } catch (error) {
      console.error('Failed to add song to playlist:', error);
      showNotification(error.response?.data?.error || 'Failed to add song to playlist', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-bg-dark">
      <Sidebar
        onLogout={handleLogout}
        username={user?.username}
        email={user?.email}
        playlists={playlists}
        onCreatePlaylist={handleCreatePlaylist}
        onPlaySong={handlePlaySong}
        onDeletePlaylist={handleDeletePlaylist}
        onRefresh={loadData}
      />
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
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
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-2">
                  All Songs
                </h1>
                <p className="text-sm sm:text-base text-text-muted">
                  {songs.length} {songs.length === 1 ? 'song' : 'songs'} available
                </p>
              </div>
            </div>
          </div>

          <SongList
            songs={songs}
            onPlay={handlePlaySong}
            playlists={playlists}
            onAddToPlaylist={handleAddToPlaylist}
          />
        </div>
      </div>

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

export default Home;
