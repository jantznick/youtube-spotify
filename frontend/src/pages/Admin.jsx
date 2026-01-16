import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { adminAPI } from '../api/api';

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

  const handleDelete = async (genre) => {
    if (!confirm(`Delete "${genre}"?`)) return;
    try {
      await adminAPI.deleteFeedEntry(genre);
      await loadFeedEntries();
    } catch (err) {
      setError(err.message || 'Failed to delete feed entry');
    }
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
    <div className="min-h-screen bg-bg-dark p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Admin Panel</h1>
          <p className="text-text-muted">Manage homepage feed</p>
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
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
          >
            {showAddForm ? 'Cancel' : '+ Add Feed Entry'}
          </button>
        </div>

        {showAddForm && (
          <div className="mb-8 p-6 bg-bg-card rounded-lg border border-border">
            <h2 className="text-2xl font-bold mb-4">Add Feed Entry</h2>
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
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition disabled:opacity-50"
              >
                {processing ? 'Processing...' : 'Create Entry'}
              </button>
            </form>
          </div>
        )}

        <div className="space-y-4">
          {feedEntries.map((entry) => {
            const songCount = Array.isArray(entry.songs) ? entry.songs.length : 0;
            return (
              <div key={entry.id} className="p-6 bg-bg-card rounded-lg border border-border">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-bold">{entry.genre}</h3>
                      {entry.sourceType && (
                        <span className="px-2 py-1 text-xs rounded bg-bg-hover">
                          {entry.sourceType}
                        </span>
                      )}
                    </div>
                    {entry.tagline && (
                      <p className="text-text-muted mb-2">{entry.tagline}</p>
                    )}
                    <p className="text-sm text-text-muted">
                      {songCount} songs • Updated: {new Date(entry.updatedAt).toLocaleDateString()}
                    </p>
                    {entry.playlistUrl && (
                      <p className="text-xs text-text-muted mt-1 break-all">{entry.playlistUrl}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRefresh(entry.genre)}
                      disabled={processing || !entry.playlistUrl}
                      className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/80 transition disabled:opacity-50"
                      title="Refresh playlist"
                    >
                      Refresh
                    </button>
                    <button
                      onClick={() => handleDelete(entry.genre)}
                      disabled={processing}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
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
    </div>
  );
}

export default Admin;
