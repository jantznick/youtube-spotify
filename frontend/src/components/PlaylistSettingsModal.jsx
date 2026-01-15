import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { playlistsAPI } from '../api/api';
import NotificationModal from './NotificationModal';
import ConfirmModal from './ConfirmModal';

function PlaylistSettingsModal({ playlist, onClose, onUpdate }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [urlWarning, setUrlWarning] = useState(null);
  const [showUrlConfirm, setShowUrlConfirm] = useState(false);
  const [pendingSourceUrl, setPendingSourceUrl] = useState(null);

  useEffect(() => {
    if (playlist) {
      setName(playlist.name || '');
      setDescription(playlist.description || '');
      setSourceUrl(playlist.sourceUrl || '');
    }
  }, [playlist]);

  // Detect source type from URL
  const detectSourceType = (url) => {
    if (!url) return null;
    const normalizedUrl = url.toLowerCase();
    if (normalizedUrl.includes('youtube.com') || normalizedUrl.includes('youtu.be')) {
      return 'youtube';
    }
    if (normalizedUrl.includes('spotify.com')) {
      return 'spotify';
    }
    return null;
  };

  // Validate URL format
  const validateUrl = (url) => {
    if (!url || url.trim() === '') return { valid: true, type: null };
    
    const trimmed = url.trim();
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      return { valid: false, error: 'URL must start with http:// or https://' };
    }
    
    const sourceType = detectSourceType(trimmed);
    if (!sourceType) {
      return { valid: false, error: 'URL must be a YouTube or Spotify playlist URL' };
    }
    
    return { valid: true, type: sourceType };
  };

  const handleSourceUrlChange = (newUrl) => {
    setSourceUrl(newUrl);
    
    // Check if URL changed from existing one
    if (playlist.sourceUrl && newUrl !== playlist.sourceUrl) {
      const validation = validateUrl(newUrl);
      if (validation.valid && newUrl.trim() !== '') {
        // Show warning if changing existing URL
        setUrlWarning('Changing the source URL may result in drastic changes to your playlist if the URLs point to different playlists.');
      } else {
        setUrlWarning(null);
      }
    } else {
      setUrlWarning(null);
    }
  };

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      showNotification('Playlist name is required', 'error');
      return;
    }

    // Validate source URL if provided
    const trimmedSourceUrl = sourceUrl.trim();
    if (trimmedSourceUrl) {
      const validation = validateUrl(trimmedSourceUrl);
      if (!validation.valid) {
        showNotification(validation.error, 'error');
        return;
      }
    }

    // Check if source URL is being changed and show confirmation
    if (playlist.sourceUrl && trimmedSourceUrl !== playlist.sourceUrl && trimmedSourceUrl !== '') {
      setPendingSourceUrl(trimmedSourceUrl);
      setShowUrlConfirm(true);
      return;
    }

    // Proceed with update
    await performUpdate(trimmedSourceUrl || null);
  };

  const performUpdate = async (finalSourceUrl) => {
    setLoading(true);
    try {
      const updatedPlaylist = await playlistsAPI.update(playlist.id, {
        name: name.trim(),
        description: description.trim() || null,
        sourceUrl: finalSourceUrl,
      });
      
      showNotification('Playlist updated successfully!', 'success');
      if (onUpdate) {
        onUpdate(updatedPlaylist.playlist);
      }
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      console.error('Failed to update playlist:', error);
      showNotification(error.response?.data?.error || 'Failed to update playlist', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!playlist) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-bg-card border border-border p-4 sm:p-6 rounded-2xl w-full max-w-md shadow-2xl my-auto">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-text-primary">Playlist Settings</h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors p-1"
            aria-label="Close"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-2">
              Name *
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 bg-bg-hover border border-border rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Playlist name"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-text-primary mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 sm:px-4 py-2 bg-bg-hover border border-border rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              placeholder="Playlist description (optional)"
            />
          </div>

          <div className="pt-2 border-t border-border">
            <label htmlFor="sourceUrl" className="block text-sm font-medium text-text-primary mb-2">
              Source URL
            </label>
            <input
              id="sourceUrl"
              type="url"
              value={sourceUrl}
              onChange={(e) => handleSourceUrlChange(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 bg-bg-hover border border-border rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="YouTube or Spotify playlist URL (optional)"
            />
            {urlWarning && (
              <div className="mt-2 p-2 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
                <p className="text-xs sm:text-sm text-yellow-400">{urlWarning}</p>
              </div>
            )}
            <p className="text-xs text-text-secondary mt-1">
              Add a YouTube or Spotify playlist URL to enable manual refresh from the source.
            </p>
          </div>



          <div className="flex gap-2 sm:gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 sm:py-3 bg-bg-hover border border-border text-text-primary rounded-lg hover:bg-bg-card transition font-medium text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 sm:py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg hover:shadow-lg hover:shadow-primary/30 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm sm:text-base"
            >
              {loading ? 'Saving...' : 'Save Changes'}
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
      {showUrlConfirm && (
        <ConfirmModal
          message="Changing the source URL may result in drastic changes to your playlist if the URLs point to different playlists. Are you sure you want to continue?"
          onConfirm={() => {
            setShowUrlConfirm(false);
            performUpdate(pendingSourceUrl);
          }}
          onCancel={() => {
            setShowUrlConfirm(false);
            setPendingSourceUrl(null);
          }}
          confirmText="Yes, Update URL"
          cancelText="Cancel"
          type="warning"
        />
      )}
    </div>
  );

  return createPortal(modalContent, document.body);
}

export default PlaylistSettingsModal;
