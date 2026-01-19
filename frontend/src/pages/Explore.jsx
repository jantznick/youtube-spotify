import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import usePlayerStore, { playerStore } from '../store/playerStore';
import { feedAPI, songsAPI } from '../api/api';
import SongList from '../components/SongList';
import SearchBar from '../components/SearchBar';
import Header from '../components/Header';
import NotificationModal from '../components/NotificationModal';
import AddSongModal from '../components/AddSongModal';
import { useAuthModal } from '../contexts/AuthModalContext';

function Explore() {
  const { openAuthModal } = useAuthModal();
  const [homePageFeed, setHomePageFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const navigate = useNavigate();
  const { setCurrentSong, setQueue, addToQueue, queue, setYoutubeSearchState } = usePlayerStore();

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const feedData = await feedAPI.getHomePage();
      setHomePageFeed(feedData.homePageFeed || []);
    } catch (error) {
      console.error('Failed to load data:', error);
      showNotification('Failed to load feed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaySong = async (song) => {
    const state = playerStore.getState();
    
    // Take currently playing song and put it at start of queue
    let newQueue = [...state.queue];
    if (state.currentSong) {
      // Add it to the front
      newQueue = [state.currentSong, ...newQueue];
    }

    newQueue = [song, ...newQueue];
    
    // Play immediately (even without youtubeId)
    playerStore.setState({
      queue: newQueue,
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

  const handleImportPlaylist = async (url) => {
    try {
      setShowImportModal(false);
      showNotification('Importing playlist... This may take a moment.', 'info');
      
      // For logged-out users, we'll need to create a backend endpoint that imports without auth
      // For now, show a message that they need to sign in
      showNotification('Please sign in to import playlists. Sign up is free!', 'info');
    } catch (error) {
      console.error('Failed to import playlist:', error);
      showNotification(error.response?.data?.error || 'Failed to import playlist', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-bg-dark">
        <div className="text-xl text-text-primary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-dark">
      <Header showImportButton={true} onImportClick={() => setShowImportModal(true)} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 lg:py-8">
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-primary mb-1 sm:mb-2">
            Discover
          </h1>
          <p className="text-xs sm:text-sm lg:text-base text-text-muted mb-4">
            Explore music by genre
          </p>
          <div className="max-w-md">
            <SearchBar />
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
                  playlists={[]}
                  onAddToPlaylist={() => {
                    showNotification('Please sign in to add songs to playlists', 'info');
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-bg-card border border-border p-6 rounded-2xl w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold mb-4 text-text-primary">Import Playlist</h2>
            <p className="text-text-muted mb-6">
              To import playlists from YouTube or Spotify, please{' '}
              <button onClick={() => openAuthModal('register')} className="text-primary hover:text-primary-dark">
                sign up for free
              </button>
              {' '}or{' '}
              <button onClick={() => openAuthModal('login')} className="text-primary hover:text-primary-dark">
                sign in
              </button>
              .
            </p>
            <p className="text-sm text-text-muted mb-6">
              Once you're signed in, you can import playlists, create your own playlists, and save your favorite songs.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowImportModal(false);
                  openAuthModal('register');
                }}
                className="flex-1 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg hover:shadow-lg hover:shadow-primary/30 transition text-center font-medium"
              >
                Sign Up Free
              </button>
              <button
                onClick={() => setShowImportModal(false)}
                className="flex-1 py-3 bg-bg-hover border border-border text-text-primary rounded-lg hover:bg-bg-card transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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

export default Explore;
