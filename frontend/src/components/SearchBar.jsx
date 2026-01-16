import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchAPI } from '../api/api.js';

export default function SearchBar() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ artists: [], songs: [] });
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('songs'); // 'songs' or 'artists'
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);

  // Debounced search
  useEffect(() => {
    if (query.length < 3) {
      setResults({ artists: [], songs: [] });
      setIsOpen(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        const data = await searchAPI.search(query);
        setResults(data);
        setIsOpen(true);
      } catch (error) {
        console.error('Search error:', error);
        setResults({ artists: [], songs: [] });
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
      // For now, clicking songs does nothing - user flow to be determined
      setIsOpen(false);
      return;
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
            <div className="overflow-y-auto flex-1">
              {activeTab === 'songs' ? (
                <div>
                  {results.songs.length === 0 ? (
                    <div className="p-4 text-center text-text-muted">No songs found</div>
                  ) : (
                    results.songs.map((song) => (
                      <button
                        key={song.id}
                        onClick={() => handleResultClick('song', song)}
                        className="w-full px-4 py-3 text-left hover:bg-bg-hover transition-all duration-200 flex items-center gap-3 group"
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
                        className="w-full px-4 py-3 text-left hover:bg-bg-hover transition-all duration-200 group"
                      >
                        <div className="text-text-primary font-medium group-hover:text-accent transition-colors">{artist.name}</div>
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
