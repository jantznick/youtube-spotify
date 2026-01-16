import { useState } from 'react';
import usePlayerStore from '../store/playerStore';

export default function SearchResultModal({ result, onClose }) {
  const { addToQueue } = usePlayerStore();
  const [expandedReleases, setExpandedReleases] = useState(new Set());

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

  if (result.type === 'song') {
    const song = result.data;
    return (
      <div 
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto animate-fade-in"
        onClick={onClose}
      >
        <div
          className="bg-bg-card border border-border rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-text-primary">Song Details</h2>
              <button
                onClick={onClose}
                className="text-text-muted hover:text-text-primary transition-colors p-1 rounded-lg hover:bg-bg-hover"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex gap-6">
              {song.thumbnailUrl && (
                <img
                  src={song.thumbnailUrl}
                  alt={song.title}
                  className="w-48 h-48 rounded-lg object-cover shadow-lg transition-transform hover:scale-105"
                />
              )}
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-text-primary mb-2">{song.title}</h3>
                <p className="text-text-muted mb-4">{song.artist}</p>

                {song.duration && (
                  <p className="text-text-muted text-sm mb-2">
                    Duration: {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
                  </p>
                )}

                {song.discogsGenres && song.discogsGenres.length > 0 && (
                  <div className="mb-2">
                    <span className="text-text-muted text-sm">Genres: </span>
                    <span className="text-text-primary text-sm">{song.discogsGenres.join(', ')}</span>
                  </div>
                )}

                {song.discogsStyles && song.discogsStyles.length > 0 && (
                  <div className="mb-4">
                    <span className="text-text-muted text-sm">Styles: </span>
                    <span className="text-text-primary text-sm">{song.discogsStyles.join(', ')}</span>
                  </div>
                )}

                {song.discogsCountry && (
                  <p className="text-text-muted text-sm mb-4">Country: {song.discogsCountry}</p>
                )}

                {song.discogsReleased && (
                  <p className="text-text-muted text-sm mb-6">Released: {song.discogsReleased}</p>
                )}

                <button
                  onClick={() => handleAddToQueue(song)}
                  className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent-hover transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Add to Queue
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Artist view
  const artist = result.data;
  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-bg-card border border-border rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-text-primary">Artist Details</h2>
            <button
              onClick={onClose}
              className="text-text-muted hover:text-text-primary transition-colors p-1 rounded-lg hover:bg-bg-hover"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-text-primary mb-2">{artist.name}</h3>
            {artist.profile && (
              <p className="text-text-muted mb-4">{artist.profile}</p>
            )}
          </div>

          <div>
            <h4 className="text-lg font-semibold text-text-primary mb-4">Releases</h4>
            {artist.releases && artist.releases.length > 0 ? (
              <div className="space-y-3">
                {artist.releases.map((release) => (
                  <div key={release.id} className="border border-border rounded-lg overflow-hidden transition-all duration-200 hover:border-accent/50 hover:shadow-lg">
                    <button
                      onClick={() => toggleRelease(release.id)}
                      className="w-full px-4 py-3 bg-bg-secondary hover:bg-bg-hover transition-all duration-200 flex justify-between items-center group"
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
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        expandedReleases.has(release.id) ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
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
