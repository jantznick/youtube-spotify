import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { playlistsAPI, songsAPI } from '../api/api';
import usePlayerStore from '../store/playerStore';
import useAuthStore from '../store/authStore';
import Sidebar from '../components/Sidebar';
import AddSongModal from '../components/AddSongModal';
import NotificationModal from '../components/NotificationModal';
import ConfirmModal from '../components/ConfirmModal';
import PlaylistSettingsModal from '../components/PlaylistSettingsModal';

function Playlist() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState(null);
  const [allSongs, setAllSongs] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddSongModal, setShowAddSongModal] = useState(false);
  const [showAddSongToLibraryModal, setShowAddSongToLibraryModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
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
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-6 lg:mb-8">
            <button
              onClick={() => navigate('/')}
              className="mb-4 text-sm sm:text-base text-text-muted hover:text-text-primary transition flex items-center gap-2"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Library
            </button>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-6">
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary mb-3 sm:mb-4 break-words">{playlist.name}</h1>
                {playlist.description && (
                  <p className="text-sm sm:text-base text-text-muted mb-3 sm:mb-4 break-words">{playlist.description}</p>
                )}
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-2">
                  <p className="text-sm sm:text-base text-text-muted">
                    {playlist.playlistSongs?.length || 0} {playlist.playlistSongs?.length === 1 ? 'song' : 'songs'}
                  </p>
                  {playlist.lastSyncedAt && (
                    <p className="text-xs sm:text-sm text-text-secondary">
                      Last synced {formatDate(playlist.lastSyncedAt)}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                <button
                  onClick={handlePlayPlaylist}
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all font-medium flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base"
                >
                  {showPause ? (
                    <>
                      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Pause
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                      Play
                    </>
                  )}
                </button>
                {playlist.sourceUrl && (
                  <button
                    onClick={handleRefresh}
                    className="w-full sm:w-auto px-4 sm:px-6 py-3 sm:py-4 bg-bg-hover border border-border text-text-primary rounded-xl hover:bg-bg-card transition-all font-medium flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base"
                    title="Refresh from source"
                  >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span className="hidden sm:inline">Refresh</span>
                  </button>
                )}
                <button
                  onClick={() => setShowSettingsModal(true)}
                  className="w-full sm:w-auto px-4 sm:px-6 py-3 sm:py-4 bg-bg-hover border border-border text-text-primary rounded-xl hover:bg-bg-card transition-all font-medium flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base"
                  title="Playlist Settings"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="hidden sm:inline">Settings</span>
                </button>
                {!playlist.sourceUrl && (
                  <button
                    onClick={() => setShowAddSongModal(true)}
                    className="w-full sm:w-auto px-4 sm:px-6 py-3 sm:py-4 bg-bg-card border border-border text-text-primary rounded-xl hover:bg-bg-hover transition-all font-medium flex items-center justify-center gap-2 text-sm sm:text-base"
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
                  className="w-full sm:w-auto px-4 sm:px-6 py-3 sm:py-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl transition-all font-medium text-sm sm:text-base"
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
                    className={`flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl transition border group ${
                      isCurrentlyPlaying
                        ? 'bg-primary/10 border-primary/50'
                        : 'bg-bg-card hover:bg-bg-hover border-border hover:border-primary/30'
                    }`}
                  >
                    <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                      <div className="text-text-muted w-6 sm:w-8 text-center font-medium text-sm sm:text-base flex-shrink-0">{index + 1}</div>
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
                    <div className="flex items-center gap-2 w-full sm:w-auto sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handlePlaySong(song, index)}
                        className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-lg hover:shadow-lg hover:shadow-primary/30 transition text-xs sm:text-sm"
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
                        className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition text-xs sm:text-sm"
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
              {!playlist.sourceUrl ? (
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
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
              <div className="bg-bg-card border border-border p-4 sm:p-6 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl my-auto">
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
