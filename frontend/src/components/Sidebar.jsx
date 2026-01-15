import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { playlistsAPI, userAPI } from '../api/api';
import usePlayerStore from '../store/playerStore';
import useAuthStore from '../store/authStore';
import NotificationModal from './NotificationModal';
import ConfirmModal from './ConfirmModal';

function Sidebar({ onLogout, username, playlists, songs, onAddSong, onCreatePlaylist, onPlaySong, onDeletePlaylist, onRefresh }) {
  const navigate = useNavigate();
  const { setCurrentSong, setQueue, currentSong, currentPlaylist, isPlaying, togglePlay } = usePlayerStore();
  const [showCreatePlaylistModal, setShowCreatePlaylistModal] = useState(false);
  const [showImportPlaylistModal, setShowImportPlaylistModal] = useState(false);
  const [importSource, setImportSource] = useState('youtube'); // 'youtube' or 'spotify'
  const [playlistName, setPlaylistName] = useState('');
  const [playlistDescription, setPlaylistDescription] = useState('');
  const [youtubePlaylistUrl, setYoutubePlaylistUrl] = useState('');
  const [spotifyPlaylistUrl, setSpotifyPlaylistUrl] = useState('');
  const [importPlaylistName, setImportPlaylistName] = useState('');
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState('');
  const [notification, setNotification] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const [showAddCredentialModal, setShowAddCredentialModal] = useState(false);
  const [credentialValue, setCredentialValue] = useState('');
  const [updatingCredential, setUpdatingCredential] = useState(false);
  const { user, setUser } = useAuthStore();

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
  };

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    try {
      await onCreatePlaylist(playlistName, playlistDescription);
      setPlaylistName('');
      setPlaylistDescription('');
      setShowCreatePlaylistModal(false);
      showNotification('Playlist created successfully!', 'success');
    } catch (error) {
      showNotification('Failed to create playlist', 'error');
    }
  };

  const handleImportPlaylist = async (e) => {
    e.preventDefault();
    setImportError('');
    setImporting(true);
    try {
      if (importSource === 'youtube') {
        await playlistsAPI.importYouTube(youtubePlaylistUrl, importPlaylistName);
      } else {
        await playlistsAPI.importSpotify(spotifyPlaylistUrl, importPlaylistName);
      }
      setYoutubePlaylistUrl('');
      setSpotifyPlaylistUrl('');
      setImportPlaylistName('');
      setShowImportPlaylistModal(false);
      // Refresh after a short delay to show the new playlist
      setTimeout(() => {
        onRefresh();
      }, 1000);
      showNotification('Playlist import started! Songs will be added in the background.', 'success');
    } catch (error) {
      setImportError(error.message || 'Failed to start playlist import');
      showNotification(error.message || 'Failed to start playlist import', 'error');
    } finally {
      setImporting(false);
    }
  };

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-bg-card border border-border rounded-lg flex items-center justify-center text-text-primary hover:bg-bg-hover transition-colors"
        aria-label="Toggle menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isMobileMenuOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static
        top-0 left-0
        w-64 h-screen
        bg-bg-card border-r border-border
        flex flex-col
        overflow-y-auto
        z-40
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
      <div className="p-4 lg:p-5 border-b border-border flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-text-primary">MusicDocks</h1>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden text-text-muted hover:text-text-primary transition-colors"
            aria-label="Close menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-text-primary">My Library</span>
          <button
            onClick={onAddSong}
            className="w-7 h-7 rounded-md bg-primary/20 hover:bg-primary/30 text-primary flex items-center justify-center transition-colors"
            title="Add Song"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      <nav className="flex-1 p-3 lg:p-3 space-y-1 flex-shrink-0 overflow-y-auto">
        <div className="mb-3">
          <div className="text-xs font-semibold text-text-muted uppercase tracking-wider px-3 mb-2">Playlists</div>
          <div className="space-y-1">
            {playlists.map((playlist) => {
              const isCurrentPlaylist = currentPlaylist?.id === playlist.id;
              const showPause = isCurrentPlaylist && isPlaying;
              
              // Check if playlist is imported from YouTube or Spotify
              const isYouTubePlaylist = playlist.name && playlist.name.endsWith('- YouTube');
              const isSpotifyPlaylist = playlist.name && playlist.name.endsWith('- Spotify') && !isYouTubePlaylist;
              
              return (
                <button
                  key={playlist.id}
                  onClick={() => {
                    navigate(`/playlist/${playlist.id}`);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-md transition-all flex items-center gap-2.5 hover:bg-bg-hover hover:text-text-primary text-text-secondary group"
                >
                  {isYouTubePlaylist ? (
                    <svg className="w-4 h-4 flex-shrink-0" fill="#FF0000" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  ) : isSpotifyPlaylist ? (
                    <svg className="w-4 h-4 flex-shrink-0" fill="#1DB954" viewBox="0 0 24 24">
                      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.84-.179-.84-.66 0-.419.36-.719.78-.6 4.56.96 8.52 1.32 11.64 1.08.42 0 .66.3.6.66-.06.36-.3.54-.66.54zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  )}
                  <span className="text-sm truncate flex-1">{playlist.name}</span>
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (isCurrentPlaylist && isPlaying) {
                        togglePlay();
                      } else {
                        try {
                          const data = await playlistsAPI.getOne(playlist.id);
                          const playlistSongs = data.playlist.playlistSongs.map((ps) => ps.song);
                          if (playlistSongs.length > 0) {
                            setQueue(playlistSongs);
                            setCurrentSong(playlistSongs[0], playlist, 0);
                          }
                        } catch (error) {
                          console.error('Failed to load playlist:', error);
                        }
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-primary hover:text-primary-dark p-1"
                    title={showPause ? "Pause playlist" : "Play playlist"}
                  >
                    {showPause ? (
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                    )}
                  </button>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      <div className="p-3 lg:p-3 border-t border-border flex-shrink-0 mt-auto space-y-3">
        <div className="flex gap-2">
          <button
            onClick={() => setShowCreatePlaylistModal(true)}
            className="flex-1 px-3 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-md transition-all flex items-center justify-center gap-2 text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add
          </button>
          <button
            onClick={() => setShowImportPlaylistModal(true)}
            className="flex-1 px-3 py-2 bg-accent/10 hover:bg-accent/20 text-accent rounded-md transition-all flex items-center justify-center gap-2 text-sm font-medium"
            title="Import YouTube Playlist"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Import
          </button>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
            {username?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-text-primary truncate">{username || user?.email || 'User'}</div>
          </div>
        </div>
        {/* Show prompt if user is missing email or username */}
        {user && (!user.email || !user.username) && (
          <button
            onClick={() => setShowAddCredentialModal(true)}
            className="w-full px-3 py-2 mb-2 bg-primary/20 hover:bg-primary/30 text-primary rounded-md transition-all flex items-center justify-center gap-2 text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {!user.email ? 'Add Email' : 'Add Username'}
          </button>
        )}
        <button
          onClick={onLogout}
          className="w-full px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-md transition-all flex items-center justify-center gap-2 text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>

      {/* Import Playlist Modal */}
      {showImportPlaylistModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-bg-card border border-border p-4 sm:p-6 rounded-2xl w-full max-w-md shadow-2xl my-auto">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 text-text-primary">Import Playlist</h2>
            <form onSubmit={handleImportPlaylist} className="space-y-4">
              {importError && (
                <div className="bg-red-500/20 text-red-400 p-3 rounded">
                  {importError}
                </div>
              )}
              <div>
                <label className="block mb-2 text-sm font-medium text-text-secondary">Source</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setImportSource('youtube')}
                    className={`flex-1 py-2 px-4 rounded-lg transition ${
                      importSource === 'youtube'
                        ? 'bg-primary text-white'
                        : 'bg-bg-hover border border-border text-text-primary hover:bg-bg-card'
                    }`}
                  >
                    YouTube
                  </button>
                  <button
                    type="button"
                    onClick={() => setImportSource('spotify')}
                    className={`flex-1 py-2 px-4 rounded-lg transition ${
                      importSource === 'spotify'
                        ? 'bg-primary text-white'
                        : 'bg-bg-hover border border-border text-text-primary hover:bg-bg-card'
                    }`}
                  >
                    Spotify
                  </button>
                </div>
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-text-secondary">
                  {importSource === 'youtube' ? 'YouTube' : 'Spotify'} Playlist URL *
                </label>
                <input
                  type="url"
                  value={importSource === 'youtube' ? youtubePlaylistUrl : spotifyPlaylistUrl}
                  onChange={(e) => {
                    if (importSource === 'youtube') {
                      setYoutubePlaylistUrl(e.target.value);
                    } else {
                      setSpotifyPlaylistUrl(e.target.value);
                    }
                  }}
                  placeholder={
                    importSource === 'youtube'
                      ? 'https://www.youtube.com/playlist?list=...'
                      : 'open.spotify.com/playlist/...'
                  }
                  required
                  className="w-full px-4 py-3 bg-bg-hover border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                />
                <p className="text-xs text-text-muted mt-2">
                  {importSource === 'youtube'
                    ? 'Paste a YouTube playlist URL to import all songs'
                    : 'Paste a Spotify playlist URL. Songs will be searched on YouTube and added.'}
                </p>
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-text-secondary">
                  Playlist Name (optional)
                </label>
                <input
                  type="text"
                  value={importPlaylistName}
                  onChange={(e) => setImportPlaylistName(e.target.value)}
                  placeholder="Leave empty to use YouTube playlist name"
                  className="w-full px-4 py-3 bg-bg-hover border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={importing}
                  className="flex-1 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg hover:shadow-lg hover:shadow-primary/30 transition disabled:opacity-50"
                >
                  {importing ? 'Importing...' : 'Import Playlist'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowImportPlaylistModal(false);
                    setYoutubePlaylistUrl('');
                    setSpotifyPlaylistUrl('');
                    setImportPlaylistName('');
                    setImportError('');
                    setImportSource('youtube');
                  }}
                  className="flex-1 py-3 bg-bg-hover border border-border text-text-primary rounded-lg hover:bg-bg-card transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Credential Modal */}
      {showAddCredentialModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-bg-card border border-border p-4 sm:p-6 rounded-2xl w-full max-w-md shadow-2xl my-auto">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 text-text-primary">
              {!user?.email ? 'Add Email Address' : 'Add Username'}
            </h2>
            <p className="text-text-secondary text-sm mb-4">
              {!user?.email 
                ? 'Add an email address to receive magic links and password reset emails.'
                : 'Add a username to make it easier to log in.'}
            </p>
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!credentialValue) return;

              setUpdatingCredential(true);
              try {
                const isEmail = !user?.email;
                const updatedUser = await userAPI.updateCredentials(
                  isEmail ? credentialValue : null,
                  isEmail ? null : credentialValue
                );
                setUser(updatedUser.user);
                setCredentialValue('');
                setShowAddCredentialModal(false);
                showNotification(
                  isEmail ? 'Email added successfully!' : 'Username added successfully!',
                  'success'
                );
              } catch (error) {
                showNotification(error.message || 'Failed to update credential', 'error');
              } finally {
                setUpdatingCredential(false);
              }
            }} className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-text-secondary">
                  {!user?.email ? 'Email Address' : 'Username'}
                </label>
                <input
                  type={!user?.email ? 'email' : 'text'}
                  value={credentialValue}
                  onChange={(e) => setCredentialValue(e.target.value)}
                  placeholder={!user?.email ? 'your@email.com' : 'username'}
                  required
                  className="w-full px-4 py-3 bg-bg-hover border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={updatingCredential}
                  className="flex-1 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg hover:shadow-lg hover:shadow-primary/30 transition disabled:opacity-50"
                >
                  {updatingCredential ? 'Adding...' : 'Add'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddCredentialModal(false);
                    setCredentialValue('');
                  }}
                  className="flex-1 py-3 bg-bg-hover border border-border text-text-primary rounded-lg hover:bg-bg-card transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Playlist Modal */}
      {showCreatePlaylistModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-bg-card border border-border p-4 sm:p-6 rounded-2xl w-full max-w-md shadow-2xl my-auto">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 text-text-primary">Create Playlist</h2>
            <form onSubmit={handleCreatePlaylist} className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-text-secondary">Name</label>
                <input
                  type="text"
                  value={playlistName}
                  onChange={(e) => setPlaylistName(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-bg-hover border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-text-secondary">
                  Description (optional)
                </label>
                <textarea
                  value={playlistDescription}
                  onChange={(e) => setPlaylistDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-bg-hover border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  rows="3"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg hover:shadow-lg hover:shadow-primary/30 transition"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreatePlaylistModal(false);
                    setPlaylistName('');
                    setPlaylistDescription('');
                  }}
                  className="flex-1 py-3 bg-bg-hover border border-border text-text-primary rounded-lg hover:bg-bg-card transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notification Modal */}
      {notification && (
        <NotificationModal
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      </div>
    </>
  );
}

export default Sidebar;
