import { useState, useEffect } from 'react';
import { playlistsAPI, songsAPI } from '../api/api';
import usePlayerStore from '../store/playerStore';
import NotificationModal from './NotificationModal';
import ConfirmModal from './ConfirmModal';

function PlaylistList({
  playlists,
  songs,
  onPlay,
  onCreate,
  onDelete,
  onRefresh,
}) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [playlistName, setPlaylistName] = useState('');
  const [playlistDescription, setPlaylistDescription] = useState('');
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [notification, setNotification] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const { setCurrentSong, setQueue } = usePlayerStore();

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
  };

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    try {
      await onCreate(playlistName, playlistDescription);
      setPlaylistName('');
      setPlaylistDescription('');
      setShowCreateModal(false);
      showNotification('Playlist created successfully!', 'success');
    } catch (error) {
      showNotification('Failed to create playlist', 'error');
    }
  };

  const handlePlayPlaylist = async (playlist) => {
    try {
      const data = await playlistsAPI.getOne(playlist.id);
      const songs = data.playlist.playlistSongs.map((ps) => ps.song);
      if (songs.length > 0) {
        setQueue(songs);
        setCurrentSong(songs[0], playlist, 0);
      }
    } catch (error) {
      console.error('Failed to load playlist:', error);
    }
  };

  if (playlists.length === 0 && !showCreateModal) {
    return (
      <div className="text-center text-text-muted py-12">
        <p className="text-lg">No playlists yet</p>
        <button
          onClick={() => setShowCreateModal(true)}
          className="mt-4 px-6 py-2 bg-gradient-to-r from-primary to-primary-dark text-text-primary rounded-full hover:shadow-lg hover:shadow-primary/30 transition"
        >
          Create Playlist
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-2 bg-gradient-to-r from-primary to-primary-dark text-text-primary rounded-full hover:shadow-lg hover:shadow-primary/30 transition"
        >
          Create Playlist
        </button>
      </div>

      <div className="space-y-4">
        {playlists.map((playlist) => (
          <div
            key={playlist.id}
            className="bg-bg-card p-4 rounded-lg hover:bg-bg-hover transition"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-xl font-semibold">{playlist.name}</h3>
                {playlist.description && (
                  <p className="text-sm text-text-muted mt-1">
                    {playlist.description}
                  </p>
                )}
                <p className="text-sm text-gray-500 mt-2">
                  {playlist.playlistSongs?.length || 0} songs
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedPlaylist(playlist)}
                  className="px-4 py-2 bg-bg-hover rounded-lg hover:bg-bg-hover/80 transition-all text-text-primary"
                >
                  View
                </button>
                <button
                  onClick={() => handlePlayPlaylist(playlist)}
                  className="px-4 py-2 bg-gradient-to-r from-primary to-primary-dark rounded hover:shadow-lg hover:shadow-primary/30 transition"
                >
                  Play
                </button>
                <button
                  onClick={() => {
                    setConfirmModal({
                      message: 'Are you sure you want to delete this playlist?',
                      onConfirm: () => {
                        onDelete(playlist.id);
                        setConfirmModal(null);
                      },
                      onCancel: () => setConfirmModal(null),
                      type: 'danger',
                    });
                  }}
                  className="px-4 py-2 bg-red-600 rounded hover:bg-red-700 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-bg-card p-6 rounded-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Create Playlist</h2>
            <form onSubmit={handleCreatePlaylist} className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium">Name</label>
                <input
                  type="text"
                  value={playlistName}
                  onChange={(e) => setPlaylistName(e.target.value)}
                  required
                  className="w-full px-4 py-2 bg-bg-hover rounded text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium">
                  Description (optional)
                </label>
                <textarea
                  value={playlistDescription}
                  onChange={(e) => setPlaylistDescription(e.target.value)}
                  className="w-full px-4 py-2 bg-bg-hover rounded text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  rows="3"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-gradient-to-r from-primary to-primary-dark text-text-primary rounded hover:shadow-lg hover:shadow-primary/30 transition"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setPlaylistName('');
                    setPlaylistDescription('');
                  }}
                  className="flex-1 py-2 bg-bg-hover text-text-primary rounded hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedPlaylist && (
        <PlaylistDetail
          playlist={selectedPlaylist}
          songs={songs}
          onClose={() => setSelectedPlaylist(null)}
          onPlay={onPlay}
          onRefresh={onRefresh}
        />
      )}
    </div>
  );
}

function PlaylistDetail({ playlist, songs: allSongs, onClose, onPlay, onRefresh }) {
  const [playlistSongs, setPlaylistSongs] = useState(playlist.playlistSongs || []);
  const [showAddSong, setShowAddSong] = useState(false);

  useEffect(() => {
    loadPlaylist();
  }, [playlist.id]);

  const loadPlaylist = async () => {
    try {
      const data = await playlistsAPI.getOne(playlist.id);
      setPlaylistSongs(data.playlist.playlistSongs || []);
    } catch (error) {
      console.error('Failed to load playlist:', error);
    }
  };

  const handleAddSong = async (songId) => {
    try {
      await playlistsAPI.addSong(playlist.id, songId);
      await loadPlaylist();
      onRefresh();
      setShowAddSong(false);
    } catch (error) {
      showNotification('Failed to add song to playlist', 'error');
    }
  };

  const handleRemoveSong = async (songId) => {
    try {
      await playlistsAPI.removeSong(playlist.id, songId);
      await loadPlaylist();
    } catch (error) {
      showNotification('Failed to remove song from playlist', 'error');
    }
  };

  // Get songs not already in playlist
  const availableSongs = allSongs.filter(
    (song) => !playlistSongs.some((ps) => ps.song.id === song.id)
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-bg-card border border-border p-6 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">{playlist.name}</h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {playlist.description && (
          <p className="text-text-muted mb-4">{playlist.description}</p>
        )}

        <div className="mb-4">
          <button
            onClick={() => setShowAddSong(!showAddSong)}
            className="px-4 py-2 bg-gradient-to-r from-primary to-primary-dark text-text-primary rounded hover:shadow-lg hover:shadow-primary/30 transition"
          >
            {showAddSong ? 'Hide' : 'Add Songs'}
          </button>
        </div>

        {showAddSong && availableSongs.length > 0 && (
          <div className="mb-6 p-4 bg-bg-hover rounded">
            <h3 className="font-semibold mb-3">Add Songs to Playlist</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {availableSongs.map((song) => (
                <div
                  key={song.id}
                  className="flex items-center justify-between p-2 hover:bg-bg-card rounded"
                >
                  <div className="flex-1">
                    <div className="font-medium">{song.title}</div>
                    <div className="text-sm text-text-muted">
                      {song.artist || 'Unknown Artist'}
                    </div>
                  </div>
                  <button
                    onClick={() => handleAddSong(song.id)}
                    className="px-3 py-1 bg-gradient-to-r from-primary to-primary-dark rounded hover:shadow-lg hover:shadow-primary/30 transition text-sm"
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {showAddSong && availableSongs.length === 0 && (
          <div className="mb-6 p-4 bg-bg-hover rounded text-center text-text-muted">
            <p>All your songs are already in this playlist</p>
          </div>
        )}

        <div className="space-y-2">
          {playlistSongs.map((playlistSong, index) => (
            <div
              key={playlistSong.id}
              className="flex items-center gap-4 p-3 bg-bg-hover rounded hover:bg-gray-600 transition"
            >
              <div className="text-text-muted w-8">{index + 1}</div>
              <div className="flex-1">
                <div className="font-semibold">{playlistSong.song.title}</div>
                <div className="text-sm text-text-muted">
                  {playlistSong.song.artist || 'Unknown Artist'}
                </div>
              </div>
              <button
                onClick={() => onPlay(playlistSong.song)}
                className="px-3 py-1 bg-gradient-to-r from-primary to-primary-dark rounded hover:shadow-lg hover:shadow-primary/30 transition"
              >
                Play
              </button>
              <button
                onClick={() => handleRemoveSong(playlistSong.song.id)}
                className="px-3 py-1 bg-red-600 rounded hover:bg-red-700 transition"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {playlistSongs.length === 0 && (
          <div className="text-center text-text-muted py-8">
            <p>No songs in this playlist</p>
            {allSongs.length > 0 && (
              <button
                onClick={() => setShowAddSong(true)}
                className="mt-4 px-4 py-2 bg-gradient-to-r from-primary to-primary-dark text-text-primary rounded hover:shadow-lg hover:shadow-primary/30 transition"
              >
                Add Songs
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default PlaylistList;
