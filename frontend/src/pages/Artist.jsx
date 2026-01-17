import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { searchAPI, playlistsAPI } from '../api/api';
import usePlayerStore from '../store/playerStore';
import useAuthStore from '../store/authStore';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { authAPI } from '../api/api';

export default function Artist() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToQueue } = usePlayerStore();
  const { user, isAuthenticated } = useAuthStore();
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedReleases, setExpandedReleases] = useState(new Set());
  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
    loadArtist();
    if (isAuthenticated) {
      loadPlaylists();
    }
  }, [id, isAuthenticated]);

  const loadArtist = async () => {
    try {
      setLoading(true);
      const data = await searchAPI.getArtist(id);
      setArtist(data);
    } catch (err) {
      console.error('Error loading artist:', err);
      setError('Failed to load artist');
    } finally {
      setLoading(false);
    }
  };

  const loadPlaylists = async () => {
    try {
      const data = await playlistsAPI.getAll();
      setPlaylists(data.playlists || []);
    } catch (err) {
      console.error('Error loading playlists:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
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

  const handlePlaySong = (song) => {
    // Placeholder - will be implemented later
  };

  const toggleRelease = (releaseId) => {
    const newExpanded = new Set(expandedReleases);
    if (newExpanded.has(releaseId)) {
      newExpanded.delete(releaseId);
    } else {
      newExpanded.add(releaseId);
    }
    setExpandedReleases(newExpanded);
  };

  const handleAddToQueue = (song) => {
    addToQueue(song);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-bg-dark">
        <div className="text-xl text-text-primary">Loading...</div>
      </div>
    );
  }

  if (error || !artist) {
    return (
      <div className="flex items-center justify-center h-screen bg-bg-dark">
        <div className="text-xl text-text-muted">{error || 'Artist not found'}</div>
      </div>
    );
  }

  // If authenticated, show with sidebar (matching Home/Playlist layout)
  if (isAuthenticated) {
    return (
      <div className="flex h-screen bg-bg-dark">
        <Sidebar
          onLogout={handleLogout}
          username={user?.username}
          email={user?.email}
          playlists={playlists}
          onCreatePlaylist={handleCreatePlaylist}
          onPlaySong={handlePlaySong}
          onDeletePlaylist={handleDeletePlaylist}
          onRefresh={loadPlaylists}
        />
        <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <div className="mb-6 lg:mb-8">
              <div className="flex items-center gap-3 mb-4">
                <button
                  onClick={() => navigate(-1)}
                  className="text-text-muted hover:text-text-primary transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-2">
                {artist.name}
              </h1>
              {artist.profile && (
                <p className="text-text-muted max-w-3xl">{artist.profile}</p>
              )}
            </div>

          {/* Releases */}
          <div>
            <h2 className="text-2xl font-semibold text-text-primary mb-6">Releases</h2>
            {artist.releases && artist.releases.length > 0 ? (
              <div className="space-y-3">
                {artist.releases.map((release) => (
                  <div key={release.id} className="border border-border rounded-lg overflow-hidden transition-all duration-200 hover:border-accent/50 hover:shadow-lg">
                    <button
                      onClick={() => toggleRelease(release.id)}
                      className="w-full px-4 py-3 bg-bg-card hover:bg-bg-hover transition-all duration-200 flex justify-between items-center group"
                    >
                      <div className="text-left flex-1">
                        <div className="text-text-primary font-medium group-hover:text-accent transition-colors">{release.title}</div>
                        <div className="text-text-muted text-sm">
                          {release.released && `Released: ${release.released}`}
                          {release.genres && release.genres.length > 0 && ` • ${release.genres.join(', ')}`}
                        </div>
                      </div>
                      <span className="text-text-muted transition-transform duration-200 ml-4" style={{
                        transform: expandedReleases.has(release.id) ? 'rotate(90deg)' : 'rotate(0deg)'
                      }}>
                        ▶
                      </span>
                    </button>

                    <div 
                      className={`overflow-scroll transition-all duration-300 ease-in-out ${
                        expandedReleases.has(release.id) ? 'max-h-[50vh] opacity-100' : 'max-h-0 opacity-0'
                      }`}
                    >
                      {release.songs && release.songs.length > 0 && (
                        <div className="p-4 bg-bg-primary border-t border-border">
                          <div className="space-y-2">
                            {release.songs.map((song) => (
                              <div
                                key={song.id}
                                className="flex items-center justify-between p-3 rounded-lg hover:bg-bg-hover transition-all duration-200 group/item"
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="text-text-primary group-hover/item:text-accent transition-colors">
                                    {song.discogsTrackPosition && (
                                      <span className="text-text-muted mr-2 font-mono text-xs">{song.discogsTrackPosition}</span>
                                    )}
                                    {song.title}
                                  </div>
                                  {song.duration && (
                                    <div className="text-text-muted text-sm mt-1">
                                      {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
                                    </div>
                                  )}
                                </div>
                                <button
                                  onClick={() => handleAddToQueue(song)}
                                  className="px-4 py-2 text-sm bg-accent text-white rounded-lg hover:bg-accent-hover transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:scale-105 ml-4"
                                >
                                  Add to Queue
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-text-muted">No releases found</p>
            )}
          </div>
          </div>
        </div>
      </div>
    );
  }

  // If not authenticated, show without sidebar (matching Explore page layout)
  return (
    <div className="min-h-screen bg-bg-dark">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 text-text-muted hover:text-text-primary transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-2">
            {artist.name}
          </h1>
          {artist.profile && (
            <p className="text-text-muted max-w-3xl">{artist.profile}</p>
          )}
        </div>

        {/* Releases */}
        <div>
          <h2 className="text-2xl font-semibold text-text-primary mb-6">Releases</h2>
          {artist.releases && artist.releases.length > 0 ? (
            <div className="space-y-3">
              {artist.releases.map((release) => (
                <div key={release.id} className="border border-border rounded-lg overflow-hidden transition-all duration-200 hover:border-accent/50 hover:shadow-lg">
                  <button
                    onClick={() => toggleRelease(release.id)}
                    className="w-full px-4 py-3 bg-bg-card hover:bg-bg-hover transition-all duration-200 flex justify-between items-center group"
                  >
                    <div className="text-left flex-1">
                      <div className="text-text-primary font-medium group-hover:text-accent transition-colors">{release.title}</div>
                      <div className="text-text-muted text-sm">
                        {release.released && `Released: ${release.released}`}
                        {release.genres && release.genres.length > 0 && ` • ${release.genres.join(', ')}`}
                      </div>
                    </div>
                    <span className="text-text-muted transition-transform duration-200 ml-4" style={{
                      transform: expandedReleases.has(release.id) ? 'rotate(90deg)' : 'rotate(0deg)'
                    }}>
                      ▶
                    </span>
                  </button>

                  <div 
                    className={`overflow-scroll transition-all duration-300 ease-in-out ${
                      expandedReleases.has(release.id) ? 'max-h-[50vh] opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    {release.songs && release.songs.length > 0 && (
                      <div className="p-4 bg-bg-primary border-t border-border">
                        <div className="space-y-2">
                          {release.songs.map((song) => (
                            <div
                              key={song.id}
                              className="flex items-center justify-between p-3 rounded-lg hover:bg-bg-hover transition-all duration-200 group/item"
                            >
                              <div className="flex-1 min-w-0">
                                <div className="text-text-primary group-hover/item:text-accent transition-colors">
                                  {song.discogsTrackPosition && (
                                    <span className="text-text-muted mr-2 font-mono text-xs">{song.discogsTrackPosition}</span>
                                  )}
                                  {song.title}
                                </div>
                                {song.duration && (
                                  <div className="text-text-muted text-sm mt-1">
                                    {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
                                  </div>
                                )}
                              </div>
                              <button
                                onClick={() => handleAddToQueue(song)}
                                className="px-4 py-2 text-sm bg-accent text-white rounded-lg hover:bg-accent-hover transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:scale-105 ml-4"
                              >
                                Add to Queue
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-muted">No releases found</p>
          )}
        </div>
      </div>
    </div>
  );
}
