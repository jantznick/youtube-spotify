import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { adminAPI } from '../api/api';
import ConfirmModal from '../components/ConfirmModal';

function Admin() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('feed'); // 'feed' or 'reports'
  const [feedEntries, setFeedEntries] = useState([]);
  const [videoReports, setVideoReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportsLoading, setReportsLoading] = useState(false);
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
  const [youtubeIdInputModal, setYoutubeIdInputModal] = useState(null);

  useEffect(() => {
    if (activeTab === 'feed') {
      loadFeedEntries();
    } else if (activeTab === 'reports') {
      loadVideoReports();
    }
  }, [activeTab]);

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

  const loadVideoReports = async () => {
    try {
      setReportsLoading(true);
      const data = await adminAPI.getVideoReports();
      setVideoReports(data.reports || []);
      setError(null);
    } catch (err) {
      console.error('[ADMIN PAGE] Error loading video reports:', err);
      setError(`Failed to load video reports: ${err.message}`);
    } finally {
      setReportsLoading(false);
    }
  };

  const handleResolveReport = async (reportId, newYoutubeId = null, resolutionNote = null) => {
    try {
      setProcessing(true);
      setError(null);
      setSuccessMessage(null);
      await adminAPI.resolveVideoReport(reportId, newYoutubeId, resolutionNote);
      setSuccessMessage(newYoutubeId ? `Report resolved and new video ID set: ${newYoutubeId}` : 'Report resolved and video ID removed');
      await loadVideoReports();
    } catch (err) {
      setError(err.message || 'Failed to resolve report');
    } finally {
      setProcessing(false);
    }
  };

  const handleRemoveAndAddNew = (report) => {
    setYoutubeIdInputModal({
      report,
      onConfirm: (youtubeId) => {
        const cleanId = youtubeId.trim();
        // Basic validation - YouTube IDs are 11 characters
        if (cleanId.length === 11) {
          // Close input modal first, then show confirm modal
          setYoutubeIdInputModal(null);
          // Use setTimeout to ensure state update completes before showing next modal
          setTimeout(() => {
            setConfirmModal({
              message: `Set YouTube ID "${cleanId}" for "${report.Song?.title}"?`,
              onConfirm: () => {
                handleResolveReport(report.id, cleanId);
                setConfirmModal(null);
              },
              onCancel: () => {
                setConfirmModal(null);
              },
              confirmText: 'Set Video ID',
              cancelText: 'Cancel',
              type: 'warning',
            });
          }, 0);
        } else {
          setError('YouTube video ID must be 11 characters long');
          setYoutubeIdInputModal(null);
        }
      },
      onCancel: () => setYoutubeIdInputModal(null),
    });
  };

  const handleDismissReport = async (reportId) => {
    try {
      setProcessing(true);
      setError(null);
      setSuccessMessage(null);
      await adminAPI.dismissVideoReport(reportId);
      setSuccessMessage('Report dismissed');
      await loadVideoReports();
    } catch (err) {
      setError(err.message || 'Failed to dismiss report');
    } finally {
      setProcessing(false);
    }
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
          <p className="text-sm sm:text-base text-text-muted">Manage homepage feed and video reports</p>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-4 border-b border-border">
          <button
            onClick={() => setActiveTab('feed')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'feed'
                ? 'text-primary border-b-2 border-primary'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Feed Entries
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'reports'
                ? 'text-primary border-b-2 border-primary'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Video Reports
            {videoReports.filter(r => r.status === 'pending').length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                {videoReports.filter(r => r.status === 'pending').length}
              </span>
            )}
          </button>
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

        {activeTab === 'feed' && (
          <>
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
          </>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-4">
            {reportsLoading ? (
              <div className="text-center py-8 text-text-muted">Loading reports...</div>
            ) : videoReports.length === 0 ? (
              <div className="text-center py-8 text-text-muted">No video reports</div>
            ) : (
              videoReports.map((report) => (
                <div
                  key={report.id}
                  className={`p-4 sm:p-6 bg-bg-card rounded-lg border ${
                    report.status === 'pending' ? 'border-yellow-500/50' : 'border-border'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-text-primary">{report.Song?.title || 'Unknown Song'}</h3>
                        <span
                          className={`px-2 py-1 text-xs rounded ${
                            report.status === 'pending'
                              ? 'bg-yellow-500/20 text-yellow-500'
                              : report.status === 'resolved'
                              ? 'bg-green-500/20 text-green-500'
                              : 'bg-gray-500/20 text-gray-500'
                          }`}
                        >
                          {report.status}
                        </span>
                      </div>
                      <p className="text-sm text-text-muted mb-1">
                        Artist: {report.Song?.artist || 'Unknown Artist'}
                      </p>
                      <p className="text-xs text-text-muted mb-2">
                        YouTube ID: {report.youtubeId || 'N/A'}
                      </p>
                      <p className="text-xs text-text-muted">
                        Reported: {new Date(report.createdAt).toLocaleString()}
                        {report.Reporter 
                          ? ` by ${report.Reporter.username || report.Reporter.email || 'user'}`
                          : report.reporterName 
                          ? ` by ${report.reporterName}${report.reporterEmail ? ` (${report.reporterEmail})` : ''}`
                          : ' anonymously'}
                      </p>
                      {report.resolvedAt && (
                        <>
                          <p className="text-xs text-text-muted">
                            Resolved: {new Date(report.resolvedAt).toLocaleString()}
                            {report.Resolver && ` by ${report.Resolver.username || report.Resolver.email || 'admin'}`}
                          </p>
                          {report.newYoutubeId && (
                            <p className="text-xs text-green-500 font-medium">
                              Changed to: {report.newYoutubeId}
                            </p>
                          )}
                          {!report.newYoutubeId && (
                            <p className="text-xs text-yellow-500">
                              Video ID removed (not replaced)
                            </p>
                          )}
                        </>
                      )}
                    </div>
                    {report.status === 'pending' && (
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleRemoveAndAddNew(report)}
                          disabled={processing}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50 text-sm"
                        >
                          Remove & Add New
                        </button>
                        <button
                          onClick={() => {
                            setConfirmModal({
                              message: `Remove YouTube ID from "${report.Song?.title}"? (You can search for a new video later)`,
                              onConfirm: () => {
                                handleResolveReport(report.id, false);
                                setConfirmModal(null);
                              },
                              onCancel: () => setConfirmModal(null),
                              confirmText: 'Remove Only',
                              cancelText: 'Cancel',
                              type: 'warning',
                            });
                          }}
                          disabled={processing}
                          className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition disabled:opacity-50 text-sm"
                        >
                          Remove Only
                        </button>
                        <button
                          onClick={() => {
                            setConfirmModal({
                              message: `Dismiss report for "${report.Song?.title}"? (No action will be taken)`,
                              onConfirm: () => {
                                handleDismissReport(report.id);
                                setConfirmModal(null);
                              },
                              onCancel: () => setConfirmModal(null),
                              confirmText: 'Dismiss',
                              cancelText: 'Cancel',
                              type: 'info',
                            });
                          }}
                          disabled={processing}
                          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition disabled:opacity-50 text-sm"
                        >
                          Dismiss
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
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

      {youtubeIdInputModal && (
        <YoutubeIdInputModal
          report={youtubeIdInputModal.report}
          onConfirm={youtubeIdInputModal.onConfirm}
          onCancel={youtubeIdInputModal.onCancel}
        />
      )}
    </div>
  );
}

// YouTube ID Input Modal Component
function YoutubeIdInputModal({ report, onConfirm, onCancel }) {
  const [youtubeId, setYoutubeId] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    const cleanId = youtubeId.trim();
    
    if (!cleanId) {
      setError('YouTube ID is required');
      return;
    }
    
    if (cleanId.length !== 11) {
      setError('YouTube video ID must be exactly 11 characters');
      return;
    }
    
    onConfirm(cleanId);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-bg-card rounded-lg border border-border p-6 max-w-md w-full">
        <h2 className="text-xl font-bold text-text-primary mb-4">
          Enter YouTube Video ID
        </h2>
        <p className="text-sm text-text-muted mb-4">
          For: <strong className="text-text-primary">{report.Song?.title}</strong>
        </p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-text-primary">
              YouTube Video ID
            </label>
            <input
              type="text"
              value={youtubeId}
              onChange={(e) => {
                setYoutubeId(e.target.value);
                setError('');
              }}
              placeholder="dQw4w9WgXcQ"
              className="w-full px-4 py-2 bg-bg-hover border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              maxLength={11}
              autoFocus
            />
            <p className="text-xs text-text-muted mt-1">
              Enter just the 11-character ID (e.g., from youtube.com/watch?v=ID)
            </p>
            {error && (
              <p className="text-xs text-red-500 mt-1">{error}</p>
            )}
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-bg-hover border border-border text-text-primary rounded-lg hover:bg-bg-primary transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={(e) => {
                console.log('[YOUTUBE ID MODAL] Continue button clicked');
                const cleanId = youtubeId.trim();
                console.log('[YOUTUBE ID MODAL] Cleaned ID:', cleanId, 'Length:', cleanId.length);
                
                if (!cleanId) {
                  setError('YouTube ID is required');
                  return;
                }
                
                if (cleanId.length !== 11) {
                  setError('YouTube video ID must be exactly 11 characters');
                  return;
                }
                
                console.log('[YOUTUBE ID MODAL] Calling onConfirm with:', cleanId);
                onConfirm(cleanId);
              }}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
            >
              Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Admin;
