import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { playlistsAPI, songsAPI } from '../api/api';
import usePlayerStore from '../store/playerStore';
import useAuthStore from '../store/authStore';
import Sidebar from '../components/Sidebar';
import AddSongModal from '../components/AddSongModal';
import NotificationModal from '../components/NotificationModal';
import ConfirmModal from '../components/ConfirmModal';

function Playlist() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState(null);
  const [allSongs, setAllSongs] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddSongModal, setShowAddSongModal] = useState(false);
  const [showAddSongToLibraryModal, setShowAddSongToLibraryModal] = useState(false);
  const [notification, setNotification] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const { currentSong, setCurrentSong, setQueue, currentPlaylist, isPlaying, togglePlay } = usePlayerStore();
  const { user } = useAuthStore();

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [playlistData, songsData, playlistsData] = await Promise.all([
        playlistsAPI.getOne(id),
        songsAPI.getAll(),
        playlistsAPI.getAll(),
      ]);
      setPlaylist(playlistData.playlist);
      setAllSongs(songsData.songs);
      setPlaylists(playlistsData.playlists);
    } catch (error) {
      console.error('Failed to load data:', error);
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

  const handleAddSong = async (songId) => {
    try {
      await playlistsAPI.addSong(id, songId);
      await loadData();
      showNotification('Song added to playlist!', 'success');
      setShowAddSongModal(false);
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
        <div className="text-xl">Playlist not found</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-bg-dark">
      <Sidebar
        onLogout={() => navigate('/')}
        username={user?.username}
        email={user?.email}
        playlists={playlists}
        songs={allSongs}
        onAddSong={() => setShowAddSongToLibraryModal(true)}
        onCreatePlaylist={() => {}}
        onPlaySong={handlePlaySong}
        onDeletePlaylist={() => {}}
        onRefresh={loadData}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/')}
              className="mb-4 text-text-muted hover:text-text-primary transition flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Library
            </button>
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1">
                <h1 className="text-5xl font-bold text-text-primary mb-4">{playlist.name}</h1>
                {playlist.description && (
                  <p className="text-text-muted mb-4">{playlist.description}</p>
                )}
                <p className="text-text-muted">
                  {playlist.playlistSongs?.length || 0} {playlist.playlistSongs?.length === 1 ? 'song' : 'songs'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePlayPlaylist}
                  className="px-8 py-4 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all font-medium flex items-center gap-3"
                >
                  {showPause ? (
                    <>
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Pause
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                      Play
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowAddSongModal(true)}
                  className="px-6 py-4 bg-bg-card border border-border text-text-primary rounded-xl hover:bg-bg-hover transition-all font-medium flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Songs
                </button>
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
                  className="px-6 py-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl transition-all font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>

          {/* Songs List */}
          {playlist.playlistSongs && playlist.playlistSongs.length > 0 ? (
            <div className="space-y-2">
              {playlist.playlistSongs.map((playlistSong, index) => {
                const song = playlistSong.song;
                const isCurrentlyPlaying = isCurrentPlaylist && currentSong?.id === song.id;
                return (
                  <div
                    key={playlistSong.id}
                    className={`flex items-center gap-4 p-4 rounded-xl transition border group ${
                      isCurrentlyPlaying
                        ? 'bg-primary/10 border-primary/50'
                        : 'bg-bg-card hover:bg-bg-hover border-border hover:border-primary/30'
                    }`}
                  >
                    <div className="text-text-muted w-8 text-center font-medium">{index + 1}</div>
                    {song.thumbnailUrl && (
                      <img
                        src={song.thumbnailUrl}
                        alt={song.title}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-text-primary truncate">{song.title}</div>
                      <div className="text-sm text-text-muted truncate">
                        {song.artist || 'Unknown Artist'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handlePlaySong(song, index)}
                        className="px-4 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-lg hover:shadow-lg hover:shadow-primary/30 transition text-sm"
                      >
                        Play
                      </button>
                      <button
                        onClick={() => {
                          setConfirmModal({
                            message: `Remove "${song.title}" from this playlist?`,
                            onConfirm: () => {
                              handleRemoveSong(song.id);
                              setConfirmModal(null);
                            },
                            onCancel: () => setConfirmModal(null),
                            type: 'warning',
                          });
                        }}
                        className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-text-muted py-20">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-bg-card flex items-center justify-center">
                <svg className="w-12 h-12 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <p className="text-xl font-medium text-text-primary mb-2">No songs in this playlist</p>
              <p className="text-text-muted mb-4">Add songs to get started!</p>
              <button
                onClick={() => setShowAddSongModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all font-medium"
              >
                Add Songs
              </button>
            </div>
          )}

          {/* Add Song Modal */}
          {showAddSongModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-bg-card border border-border p-6 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-text-primary">Add Songs to Playlist</h3>
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

      {showAddSongToLibraryModal && (
        <AddSongModal
          onClose={() => setShowAddSongToLibraryModal(false)}
          onAdd={async (songData) => {
            try {
              const newSong = await songsAPI.create(songData);
              setAllSongs((prev) => [newSong.song, ...prev]);
              setShowAddSongToLibraryModal(false);
              showNotification('Song added to library!', 'success');
            } catch (error) {
              console.error('Failed to add song:', error);
              showNotification('Failed to add song to library', 'error');
              throw error;
            }
          }}
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
    </div>
  );
}

export default Playlist;
