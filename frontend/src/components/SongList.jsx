import usePlayerStore from '../store/playerStore';
import { useState } from 'react';

function SongList({ songs, onPlay }) {
  const { addToQueue, currentSong } = usePlayerStore();
  const [hoveredSongId, setHoveredSongId] = useState(null);

  const handleAddToQueue = (e, song) => {
    e.stopPropagation();
    addToQueue(song);
  };
  if (songs.length === 0) {
    return (
      <div className="text-center text-text-muted py-20">
        <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-bg-card flex items-center justify-center">
          <svg className="w-12 h-12 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
        </div>
        <p className="text-xl font-medium text-text-primary mb-2">No songs available</p>
        <p className="text-text-muted">Songs will appear here once playlists are imported</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {songs.map((song) => (
        <div
          key={song.id}
          className="bg-bg-card p-4 rounded-xl hover:bg-bg-hover transition-all group cursor-pointer border border-border hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10"
          onClick={() => onPlay(song)}
        >
          <div className="relative mb-4">
            {song.thumbnailUrl ? (
              <img
                src={song.thumbnailUrl}
                alt={song.title}
                className="w-full aspect-square object-cover rounded-lg shadow-lg"
              />
            ) : (
              <div className="w-full aspect-square bg-bg-hover rounded-lg flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-text-muted"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                </svg>
              </div>
            )}
            <div 
              className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all rounded-lg flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100"
              onMouseEnter={() => setHoveredSongId(song.id)}
              onMouseLeave={() => setHoveredSongId(null)}
            >
              <button 
                onClick={(e) => handleAddToQueue(e, song)}
                className="w-12 h-12 bg-accent/90 hover:bg-accent rounded-full flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform"
                title="Add to queue"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
              <button 
                onClick={() => onPlay(song)}
                className="w-14 h-14 bg-gradient-to-r from-primary to-primary-dark rounded-full flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform"
                title="Play now"
              >
                <svg className="w-7 h-7 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
              </button>
            </div>
          </div>
          <div className="font-semibold text-text-primary truncate mb-1">{song.title}</div>
          <div className="text-sm text-text-muted truncate">
            {song.artist || 'Unknown Artist'}
          </div>
        </div>
        ))}
      </div>
    </>
  );
}

export default SongList;
