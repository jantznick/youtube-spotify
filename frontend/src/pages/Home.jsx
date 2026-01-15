import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import usePlayerStore from '../store/playerStore';
import { authAPI, songsAPI, playlistsAPI } from '../api/api';
import Sidebar from '../components/Sidebar';
import SongList from '../components/SongList';
import AddSongModal from '../components/AddSongModal';
import NotificationModal from '../components/NotificationModal';

function Home() {
  const [songs, setSongs] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddSong, setShowAddSong] = useState(false);
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { setCurrentSong, setQueue } = usePlayerStore();

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

  const handleAddSong = async (songData) => {
    try {
      const newSong = await songsAPI.create(songData);
      setSongs((prev) => [newSong.song, ...prev]);
      setShowAddSong(false);
    } catch (error) {
      console.error('Failed to add song:', error);
      throw error;
    }
  };

  const handleDeleteSong = async (songId) => {
    try {
      await songsAPI.delete(songId);
      setSongs((prev) => prev.filter((s) => s.id !== songId));
    } catch (error) {
      console.error('Failed to delete song:', error);
    }
  };

  const handlePlaySong = (song) => {
    // Set queue to all songs and find the index of the current song
    const songIndex = songs.findIndex((s) => s.id === song.id);
    setQueue(songs);
    setCurrentSong(song, null, songIndex >= 0 ? songIndex : 0);
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
        songs={songs}
        onAddSong={() => setShowAddSong(true)}
        onCreatePlaylist={handleCreatePlaylist}
        onPlaySong={handlePlaySong}
        onDeletePlaylist={handleDeletePlaylist}
        onRefresh={loadData}
      />
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mb-6 lg:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-2">
                My Library
              </h1>
              <p className="text-sm sm:text-base text-text-muted">
                {songs.length} {songs.length === 1 ? 'song' : 'songs'} in your collection
              </p>
            </div>
            <button
              onClick={() => setShowAddSong(true)}
              className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all font-medium flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Song
            </button>
          </div>

          <SongList
            songs={songs}
            onPlay={handlePlaySong}
            onDelete={handleDeleteSong}
          />
        </div>
      </div>

      {showAddSong && (
        <AddSongModal
          onClose={() => setShowAddSong(false)}
          onAdd={handleAddSong}
          onImportPlaylist={async (url, name) => {
            try {
              await playlistsAPI.importYouTube(url, name);
              await loadData();
              showNotification('Playlist import started! Songs will be added in the background.', 'success');
            } catch (error) {
              console.error('Failed to import playlist:', error);
              showNotification(error.message || 'Failed to start playlist import', 'error');
              throw error;
            }
          }}
        />
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

export default Home;
