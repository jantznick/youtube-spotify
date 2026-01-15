import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { playlistsAPI } from '../api/api';
import NotificationModal from './NotificationModal';

function AddSongModal({ onClose, onAdd, onImportPlaylist }) {
  const navigate = useNavigate();
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPlaylistPrompt, setShowPlaylistPrompt] = useState(false);
  const [playlistName, setPlaylistName] = useState('');
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
  };

  // Extract YouTube video ID from URL
  const extractVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  // Extract playlist ID from URL
  const extractPlaylistId = (url) => {
    const regExp = /[&?]list=([a-zA-Z0-9_-]+)/;
    const match = url.match(regExp);
    return match ? match[1] : null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!youtubeUrl) {
        setError('YouTube URL is required');
        setLoading(false);
        return;
      }

      // Check if URL contains a playlist parameter
      const playlistId = extractPlaylistId(youtubeUrl);
      const videoId = extractVideoId(youtubeUrl);

      if (playlistId && videoId) {
        // URL contains both video and playlist - ask user
        setShowPlaylistPrompt(true);
        setLoading(false);
        return;
      }

      // Just a single video, add it normally
      await onAdd({
        youtubeUrl,
      });

      // Clear the input but don't close the modal
      setYoutubeUrl('');
    } catch (err) {
      setError(err.message || 'Failed to add song');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSingleSong = async () => {
    setError('');
    setLoading(true);
    try {
      // Extract just the video URL (remove playlist params)
      const videoId = extractVideoId(youtubeUrl);
      const cleanUrl = `https://www.youtube.com/watch?v=${videoId}`;
      
      await onAdd({
        youtubeUrl: cleanUrl,
      });

      // Clear the input but don't close the modal
      setYoutubeUrl('');
      setShowPlaylistPrompt(false);
    } catch (err) {
      setError(err.message || 'Failed to add song');
    } finally {
      setLoading(false);
    }
  };

  const handleImportPlaylist = async () => {
    setError('');
    setLoading(true);
    try {
      const response = await playlistsAPI.importYouTube(youtubeUrl, playlistName);
      setYoutubeUrl('');
      setPlaylistName('');
      setShowPlaylistPrompt(false);
      onClose();
      
      // Navigate to the new playlist page immediately
      if (response.playlist?.id) {
        navigate(`/playlist/${response.playlist.id}`);
      } else {
        showNotification('Playlist import started! Songs will be added in the background.', 'success');
      }
    } catch (err) {
      setError(err.message || 'Failed to start playlist import');
      showNotification(err.message || 'Failed to start playlist import', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (showPlaylistPrompt) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-bg-card border border-border p-4 sm:p-6 rounded-2xl w-full max-w-md shadow-2xl my-auto">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 text-text-primary">This URL contains a playlist</h2>
          <p className="text-text-muted mb-4">
            Would you like to import the entire playlist or just add this single song?
          </p>
          {error && (
            <div className="bg-red-500/20 text-red-400 p-3 rounded mb-4">
              {error}
            </div>
          )}
          <div className="space-y-3">
            <div>
              <label className="block mb-2 text-sm font-medium text-text-secondary">
                Playlist Name (optional, for import)
              </label>
              <input
                type="text"
                value={playlistName}
                onChange={(e) => setPlaylistName(e.target.value)}
                placeholder="Leave empty to use YouTube playlist name"
                className="w-full px-4 py-3 bg-bg-hover border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleImportPlaylist}
                disabled={loading}
                className="flex-1 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg hover:shadow-lg hover:shadow-primary/30 transition disabled:opacity-50"
              >
                {loading ? 'Importing...' : 'Import Playlist'}
              </button>
              <button
                onClick={handleAddSingleSong}
                disabled={loading}
                className="flex-1 py-3 bg-bg-hover border border-border text-text-primary rounded-lg hover:bg-bg-card transition disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Single Song'}
              </button>
            </div>
            <button
              onClick={() => {
                setShowPlaylistPrompt(false);
                setPlaylistName('');
                setError('');
              }}
              className="w-full py-2 text-text-muted hover:text-text-primary transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={(e) => {
        // Only close if clicking the backdrop, not the modal content
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="bg-bg-card border border-border p-4 sm:p-6 rounded-2xl w-full max-w-md shadow-2xl my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-text-primary">Add Song</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/20 text-red-400 p-3 rounded">
              {error}
            </div>
          )}
          <div>
            <label className="block mb-2 text-sm font-medium text-text-secondary">
              YouTube URL *
            </label>
            <input
              type="url"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=... or youtube.com/watch?v=..."
              required
              className="w-full px-4 py-3 bg-bg-hover border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
            />
            <p className="text-xs text-text-muted mt-2">
              Song title, artist, and thumbnail will be automatically extracted from YouTube
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 bg-gradient-to-r from-primary to-primary-dark text-white rounded hover:shadow-lg hover:shadow-primary/30 transition disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Song'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 bg-bg-hover border border-border text-text-primary rounded hover:bg-bg-card transition"
            >
              Cancel
            </button>
          </div>
        </form>
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

export default AddSongModal;
