import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchAPI, songsAPI } from '../api/api.js';
import usePlayerStore, { playerStore } from '../store/playerStore';

export default function SearchBar() {
  const navigate = useNavigate();
  const { addToQueue, setYoutubeSearchState } = usePlayerStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ artists: [], songs: [] });
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('songs'); // 'songs' or 'artists'
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);
  const queryRef = useRef(query); // Track current query value for race condition checks

  // Update ref whenever query changes
  useEffect(() => {
    queryRef.current = query;
  }, [query]);

  // Debounced search
  useEffect(() => {
    if (query.length < 3) {
      setResults({ artists: [], songs: [] });
      setIsOpen(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      const searchQuery = query; // Capture query at time of API call
      try {
        const data = await searchAPI.search(searchQuery);
        // Only update results if the response matches the CURRENT search bar value (prevents race conditions)
        // Compare with the current query value from the ref (which is always up-to-date)
        if (!(results.artists.length > 0 || results.songs.length > 0) || data.query === queryRef.current) {
          setResults(data);
          setIsOpen(true);
        }
      } catch (error) {
        console.error('Search error:', error);
        // Only clear results if query hasn't changed
        if (queryRef.current === searchQuery) {
          setResults({ artists: [], songs: [] });
        }
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResultClick = async (type, item) => {
    if (type === 'song') {
      // Add song to queue immediately
      addToQueue(item);
      setIsOpen(false);
      setQuery(''); // Clear search after adding
      
      // If song doesn't have youtubeId, search in background and update when found
      if (!item.youtubeId) {
        // Set searching state (only if this song is currently playing)
        const currentState = playerStore.getState();
        if (currentState.currentSong?.id === item.id) {
          setYoutubeSearchState(true, false);
        }
        
        songsAPI.findYoutube(item.id)
          .then((result) => {
            if (result.song && result.song.youtubeId) {
              const updatedSong = result.song;
              
              // Update the queue if this song is in it
              const updatedState = playerStore.getState();
              const updatedQueue = updatedState.queue.map((s) => 
                s.id === item.id ? updatedSong : s
              );
              playerStore.setState({ queue: updatedQueue });
              
              // If this song is currently playing, update it and start playing
              if (updatedState.currentSong?.id === item.id) {
                playerStore.setState({
                  currentSong: updatedSong,
                  isPlaying: true, // Now start playing since we have youtubeId
                });
                // Clear searching state (found successfully)
                setYoutubeSearchState(false, false);
              }
            } else {
              // Search completed but no video found
              const updatedState = playerStore.getState();
              if (updatedState.currentSong?.id === item.id) {
                setYoutubeSearchState(false, true);
              }
            }
          })
          .catch((error) => {
            console.error('Error finding YouTube video:', error);
            // Search failed
            const updatedState = playerStore.getState();
            if (updatedState.currentSong?.id === item.id) {
              setYoutubeSearchState(false, true);
            }
          });
      }
    } else {
      // Navigate to artist page
      navigate(`/artist/${item.id}`);
      setIsOpen(false);
    }
  };

  return (
    <>
      <div className="relative" ref={searchRef}>
        <input
          type="text"
          placeholder="Search songs and artists..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (query.length >= 3 && (results.artists.length > 0 || results.songs.length > 0)) {
              setIsOpen(true);
            }
          }}
          className="w-full px-4 py-2 bg-bg-secondary border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent"
        />

        {isOpen && (results.artists.length > 0 || results.songs.length > 0) && (
          <div
            ref={dropdownRef}
            className="absolute top-full left-0 right-0 mt-2 bg-bg-card border border-border rounded-lg shadow-2xl z-50 max-h-96 overflow-hidden flex flex-col animate-fade-in"
          >
            {/* Tabs */}
            <div className="flex border-b border-border">
              <button
                onClick={() => setActiveTab('songs')}
                className={`flex-1 px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  activeTab === 'songs'
                    ? 'text-accent border-b-2 border-accent bg-bg-hover/50'
                    : 'text-text-muted hover:text-text-primary hover:bg-bg-hover/30'
                }`}
              >
                Songs ({results.songs.length})
              </button>
              <button
                onClick={() => setActiveTab('artists')}
                className={`flex-1 px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  activeTab === 'artists'
                    ? 'text-accent border-b-2 border-accent bg-bg-hover/50'
                    : 'text-text-muted hover:text-text-primary hover:bg-bg-hover/30'
                }`}
              >
                Artists ({results.artists.length})
              </button>
            </div>

            {/* Results */}
            <div className="overflow-y-auto flex-1 min-h-0">
              {activeTab === 'songs' ? (
                <div>
                  {results.songs.length === 0 ? (
                    <div className="p-4 text-center text-text-muted">No songs found</div>
                  ) : (
                    results.songs.map((song) => (
                      <button
                        key={song.id}
                        onClick={() => handleResultClick('song', song)}
                        className="w-full px-4 py-3 text-left hover:bg-bg-hover transition-all duration-200 flex items-center gap-3 group cursor-pointer"
                      >
                        {song.thumbnailUrl && (
                          <img
                            src={song.thumbnailUrl}
                            alt={song.title}
                            className="w-12 h-12 rounded object-cover transition-transform duration-200 group-hover:scale-110"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-text-primary font-medium truncate group-hover:text-accent transition-colors">{song.title}</div>
                          <div className="text-text-muted text-sm truncate">{song.artist}</div>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0">
                          <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              ) : (
                <div>
                  {results.artists.length === 0 ? (
                    <div className="p-4 text-center text-text-muted">No artists found</div>
                  ) : (
                    results.artists.map((artist) => (
                      <button
                        key={artist.id}
                        onClick={() => handleResultClick('artist', artist)}
                        className="w-full px-4 py-3 text-left hover:bg-bg-hover transition-all duration-200 flex items-center justify-between group cursor-pointer"
                      >
                        <div className="text-text-primary font-medium group-hover:text-accent transition-colors">{artist.name}</div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0">
                          <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

    </>
  );
}
