import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { adminAPI } from '../api/api';
import ConfirmModal from '../components/ConfirmModal';

function Admin() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [feedEntries, setFeedEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    genre: '',
    tagline: '',
    playlistUrl: '',
  });
  const [processing, setProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [editingEntry, setEditingEntry] = useState(null);
  const [editFormData, setEditFormData] = useState({
    genre: '',
    tagline: '',
  });
  const [confirmModal, setConfirmModal] = useState(null);

  useEffect(() => {
    loadFeedEntries();
  }, []);

  const loadFeedEntries = async () => {
    try {
      setLoading(true);
      console.log('[ADMIN PAGE] Loading feed entries...');
      const data = await adminAPI.getFeedEntries();
      console.log('[ADMIN PAGE] Received data:', data);
      setFeedEntries(data.feedEntries);
      setError(null);
    } catch (err) {
      console.error('[ADMIN PAGE] Error:', err);
      if (err.message.includes('403') || err.message.includes('Forbidden')) {
        setError('You do not have admin access');
        setTimeout(() => navigate('/home'), 2000);
      } else {
        setError(`Failed to load feed entries: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const response = await adminAPI.createFeedEntry(formData);
      setSuccessMessage(response.message || 'Feed entry created successfully!');
      setShowAddForm(false);
      setFormData({ genre: '', tagline: '', playlistUrl: '' });
      await loadFeedEntries();
      // Auto-refresh after a few seconds to show updated song count
      setTimeout(() => {
        loadFeedEntries();
      }, 5000);
    } catch (err) {
      setError(err.message || 'Failed to create feed entry');
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = (genre) => {
    setConfirmModal({
      message: `Delete "${genre}"?`,
      onConfirm: async () => {
        try {
          await adminAPI.deleteFeedEntry(genre);
          await loadFeedEntries();
          setConfirmModal(null);
        } catch (err) {
          setError(err.message || 'Failed to delete feed entry');
          setConfirmModal(null);
        }
      },
      onCancel: () => setConfirmModal(null),
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger',
    });
  };

  const handleRefresh = async (genre) => {
    try {
      setProcessing(true);
      setError(null);
      setSuccessMessage(null);
      const response = await adminAPI.refreshFeedEntry(genre);
      setSuccessMessage(response.message || 'Refresh started!');
      await loadFeedEntries();
      // Auto-refresh after a few seconds to show updated song count
      setTimeout(() => {
        loadFeedEntries();
      }, 5000);
    } catch (err) {
      setError(err.message || 'Failed to refresh feed entry');
    } finally {
      setProcessing(false);
    }
  };

  const handleEdit = (entry) => {
    setEditingEntry(entry.genre);
    setEditFormData({
      genre: entry.genre,
      tagline: entry.tagline || '',
    });
  };

  const handleCancelEdit = () => {
    setEditingEntry(null);
    setEditFormData({ genre: '', tagline: '' });
  };

  const handleSaveEdit = async (oldGenre) => {
    try {
      setProcessing(true);
      setError(null);
      setSuccessMessage(null);
      await adminAPI.updateFeedEntry(oldGenre, editFormData);
      setSuccessMessage('Feed entry updated successfully!');
      setEditingEntry(null);
      setEditFormData({ genre: '', tagline: '' });
      await loadFeedEntries();
    } catch (err) {
      setError(err.message || 'Failed to update feed entry');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (error && error.includes('admin access')) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-dark p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">Admin Panel</h1>
          <p className="text-sm sm:text-base text-text-muted">Manage homepage feed</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-500">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-4 bg-green-500/20 border border-green-500 rounded-lg text-green-500">
            {successMessage}
          </div>
        )}

        <div className="mb-6">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="w-full sm:w-auto px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition text-sm sm:text-base"
          >
            {showAddForm ? 'Cancel' : '+ Add Feed Entry'}
          </button>
        </div>

        {showAddForm && (
          <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-bg-card rounded-lg border border-border">
            <h2 className="text-xl sm:text-2xl font-bold mb-4">Add Feed Entry</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Genre</label>
                <input
                  type="text"
                  value={formData.genre}
                  onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                  className="w-full px-4 py-2 bg-bg-hover border border-border rounded-lg text-text-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Tagline</label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  className="w-full px-4 py-2 bg-bg-hover border border-border rounded-lg text-text-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Playlist URL</label>
                <input
                  type="url"
                  value={formData.playlistUrl}
                  onChange={(e) => setFormData({ ...formData, playlistUrl: e.target.value })}
                  className="w-full px-4 py-2 bg-bg-hover border border-border rounded-lg text-text-primary"
                  placeholder="https://www.youtube.com/playlist?list=... or https://open.spotify.com/playlist/..."
                  required
                />
              </div>
              <button
                type="submit"
                disabled={processing}
                className="w-full sm:w-auto px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition disabled:opacity-50 text-sm sm:text-base"
              >
                {processing ? 'Processing...' : 'Create Entry'}
              </button>
            </form>
          </div>
        )}

        <div className="space-y-4">
          {feedEntries.map((entry) => {
            const songCount = Array.isArray(entry.songs) ? entry.songs.length : 0;
            const isEditing = editingEntry === entry.genre;
            return (
              <div key={entry.id} className="p-4 sm:p-6 bg-bg-card rounded-lg border border-border">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Genre</label>
                      <input
                        type="text"
                        value={editFormData.genre}
                        onChange={(e) => setEditFormData({ ...editFormData, genre: e.target.value })}
                        className="w-full px-4 py-2 bg-bg-hover border border-border rounded-lg text-text-primary text-sm sm:text-base"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Tagline</label>
                      <input
                        type="text"
                        value={editFormData.tagline}
                        onChange={(e) => setEditFormData({ ...editFormData, tagline: e.target.value })}
                        className="w-full px-4 py-2 bg-bg-hover border border-border rounded-lg text-text-primary text-sm sm:text-base"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => handleSaveEdit(entry.genre)}
                        disabled={processing}
                        className="flex-1 sm:flex-none px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition disabled:opacity-50 text-sm sm:text-base"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        disabled={processing}
                        className="flex-1 sm:flex-none px-4 py-2 bg-bg-hover border border-border text-text-primary rounded-lg hover:bg-bg-card transition disabled:opacity-50 text-sm sm:text-base"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                        <h3 className="text-xl sm:text-2xl font-bold break-words">{entry.genre}</h3>
                        {entry.sourceType && (
                          <span className="px-2 py-1 text-xs rounded bg-bg-hover flex-shrink-0">
                            {entry.sourceType}
                          </span>
                        )}
                      </div>
                      {entry.tagline && (
                        <p className="text-sm sm:text-base text-text-muted mb-2 break-words">{entry.tagline}</p>
                      )}
                      <p className="text-xs sm:text-sm text-text-muted">
                        {songCount} songs • Updated: {new Date(entry.updatedAt).toLocaleDateString()}
                      </p>
                      {entry.playlistUrl && (
                        <p className="text-xs text-text-muted mt-1 break-all">{entry.playlistUrl}</p>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 sm:flex-shrink-0">
                      <button
                        onClick={() => handleEdit(entry)}
                        disabled={processing}
                        className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50 text-xs sm:text-sm"
                        title="Edit genre and tagline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleRefresh(entry.genre)}
                        disabled={processing || !entry.playlistUrl}
                        className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/80 transition disabled:opacity-50 text-xs sm:text-sm"
                        title="Refresh playlist"
                      >
                        Refresh
                      </button>
                      <button
                        onClick={() => handleDelete(entry.genre)}
                        disabled={processing}
                        className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-50 text-xs sm:text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {feedEntries.length === 0 && !showAddForm && (
          <div className="text-center py-12 text-text-muted">
            No feed entries yet. Click "Add Feed Entry" to create one.
          </div>
        )}
      </div>

      {confirmModal && (
        <ConfirmModal
          message={confirmModal.message}
          onConfirm={confirmModal.onConfirm}
          onCancel={confirmModal.onCancel}
          confirmText={confirmModal.confirmText}
          cancelText={confirmModal.cancelText}
          type={confirmModal.type}
        />
      )}
    </div>
  );
}

export default Admin;
