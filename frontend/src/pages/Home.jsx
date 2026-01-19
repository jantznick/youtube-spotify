import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import usePlayerStore, { playerStore } from '../store/playerStore';
import { authAPI, feedAPI, playlistsAPI, songsAPI } from '../api/api';
import Sidebar from '../components/Sidebar';
import SongList from '../components/SongList';
import NotificationModal from '../components/NotificationModal';
import SearchBar from '../components/SearchBar';

function Home() {
  const [homePageFeed, setHomePageFeed] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [stats, setStats] = useState({ artistCount: 0, songCount: 0 });
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { setCurrentSong, setQueue, queue, addToQueue, currentSong, setYoutubeSearchState } = usePlayerStore();

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [feedData, playlistsData, statsData] = await Promise.all([
        feedAPI.getHomePage(),
        playlistsAPI.getAll(),
        feedAPI.getStats(),
      ]);
      setHomePageFeed(feedData.homePageFeed || []);
      setPlaylists(playlistsData.playlists);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };


  const handlePlaySong = async (song) => {
    const state = playerStore.getState();
    
    // Take currently playing song and put it at start of queue
    let newQueue = [...state.queue];
    if (state.currentSong) {
      // Remove current song from queue if it exists
      newQueue = newQueue.filter(s => s.id !== state.currentSong.id);
      // Add it to the front
      newQueue = [state.currentSong, ...newQueue];
    }
    
    // Play immediately (even without youtubeId)
    playerStore.setState({
      queue: [song, ...newQueue],
      currentSong: song,
      isPlaying: !!song.youtubeId, // Only autoplay if already has youtubeId
      currentIndex: 0,
    });
    
    // If song doesn't have youtubeId, search in background and update when found
    if (!song.youtubeId) {
      // Set searching state
      setYoutubeSearchState(true, false);
      
      songsAPI.findYoutube(song.id)
        .then((result) => {
          if (result.song && result.song.youtubeId) {
            const updatedSong = result.song;
            
            // Update the current song in player if it's still the same song
            const currentState = playerStore.getState();
            if (currentState.currentSong?.id === song.id) {
              playerStore.setState({
                currentSong: updatedSong,
                isPlaying: true, // Now start playing since we have youtubeId
              });
            }
            
            // Update the queue if this song is in it
            const updatedQueue = currentState.queue.map((s) => 
              s.id === song.id ? updatedSong : s
            );
            playerStore.setState({ queue: updatedQueue });
            
            // Clear searching state (found successfully)
            setYoutubeSearchState(false, false);
          } else {
            // Search completed but no video found
            setYoutubeSearchState(false, true);
          }
        })
        .catch((error) => {
          console.error('Error finding YouTube video:', error);
          // Search failed
          setYoutubeSearchState(false, true);
        });
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

  const handleAddToPlaylist = async (playlistId, songId) => {
    try {
      await playlistsAPI.addSong(playlistId, songId);
      showNotification('Song added to playlist!', 'success');
      // Reload playlists to get updated song counts
      const playlistsData = await playlistsAPI.getAll();
      setPlaylists(playlistsData.playlists);
    } catch (error) {
      console.error('Failed to add song to playlist:', error);
      showNotification(error.response?.data?.error || 'Failed to add song to playlist', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

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
        onRefresh={loadData}
      />
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mb-6 lg:mb-8">
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('toggle-sidebar'));
                }}
                className="lg:hidden text-text-muted hover:text-text-primary transition-colors"
                aria-label="Toggle menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="flex-1">
                <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-2">
                  Discover
                </h1>
                <p className="text-sm sm:text-base text-text-muted mb-4">
                  Explore music by genre
                </p>
                <div className="max-w-md">
                  <SearchBar />
                </div>
              </div>
            </div>
          </div>

          {homePageFeed.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-text-muted">No content available yet. Check back soon!</p>
            </div>
          ) : (
            <div className="space-y-8">
              {homePageFeed.map((feedItem) => (
                <div key={feedItem.genre} className="mb-8">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h2 className="text-2xl font-bold text-text-primary">{feedItem.genre}</h2>
                        <button
                          onClick={() => {
                            if (feedItem.songs.length > 0) {
                              // Add all songs to queue, then play the first one
                              const newQueue = queue.length > 0 
                                ? [...queue, ...feedItem.songs]
                                : feedItem.songs;
                              setQueue(newQueue);
                              const startIndex = queue.length > 0 ? queue.length : 0;
                              setCurrentSong(feedItem.songs[0], null, startIndex, true);
                            }
                          }}
                          className="px-4 py-1.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition text-sm font-medium flex items-center gap-2"
                          title="Play all songs from this playlist"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                          </svg>
                          Play Playlist
                        </button>
                      </div>
                      {feedItem.tagline && (
                        <div className="flex items-center gap-2">
                          {feedItem.sourceType && (
                            <div className="flex items-center">
                              {feedItem.sourceType === 'youtube' ? (
                                <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                                </svg>
                              ) : (
                                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
                                </svg>
                              )}
                            </div>
                          )}
                          <p className="text-sm text-text-muted">{feedItem.tagline}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <SongList
                    songs={feedItem.songs}
                    onPlay={handlePlaySong}
                    playlists={playlists}
                    onAddToPlaylist={handleAddToPlaylist}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Stats at bottom */}
          <div className="mt-12 pt-8 border-t border-border">
            <div className="flex flex-wrap items-center gap-6 text-sm text-text-muted">
              <div className="flex items-center gap-2">
                <span className="font-medium text-text-primary">{stats.artistCount.toLocaleString()}</span>
                <span>Artists</span>
              </div>
              <div className="w-px h-4 bg-border"></div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-text-primary">{stats.allSongsCount.toLocaleString()}</span>
                <span>Songs Available</span>
              </div>
            </div>
          </div>
        </div>
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

export default Home;
