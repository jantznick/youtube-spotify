import usePlayerStore from '../store/playerStore';
import { useState } from 'react';

function SongList({ songs, onPlay, playlists, onAddToPlaylist }) {
  const { addToQueue, currentSong } = usePlayerStore();
  const [hoveredSongId, setHoveredSongId] = useState(null);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);

  // Filter out Spotify/YouTube playlists
  const availablePlaylists = playlists?.filter(p => !p.sourceType) || [];

  const handleAddToQueue = (e, song) => {
    e.stopPropagation();
    addToQueue(song);
  };

  const handleAddToPlaylistClick = (e, song) => {
    e.stopPropagation();
    setSelectedSong(song);
    setShowPlaylistModal(true);
  };

  const handleSelectPlaylist = async (playlistId) => {
    if (selectedSong && onAddToPlaylist) {
      await onAddToPlaylist(playlistId, selectedSong.id);
      setShowPlaylistModal(false);
      setSelectedSong(null);
    }
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
      <div className="flex gap-3 sm:gap-4 lg:gap-6 overflow-x-auto pb-4 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 scrollbar-hide">
        {songs.map((song) => (
        <div
          key={song.id}
          className="bg-bg-card p-2 sm:p-3 lg:p-4 rounded-lg sm:rounded-xl hover:bg-bg-hover transition-all group cursor-pointer border border-border hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 flex-shrink-0 w-40 sm:w-48 lg:w-56"
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
              className="absolute inset-0 bg-black/40 md:bg-black/0 md:group-hover:bg-black/50 transition-all rounded-lg flex items-center justify-center gap-2 md:opacity-0 md:group-hover:opacity-100 opacity-100"
              onMouseEnter={() => setHoveredSongId(song.id)}
              onMouseLeave={() => setHoveredSongId(null)}
            >
              <button 
                onClick={(e) => handleAddToPlaylistClick(e, song)}
                className="w-8 h-8 md:w-10 md:h-10 bg-primary/90 hover:bg-primary rounded-full flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform active:scale-95"
                title="Add to playlist"
              >
                <svg className="w-4 h-4 md:w-4 md:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
              <button 
                onClick={(e) => handleAddToQueue(e, song)}
                className="w-8 h-8 md:w-10 md:h-10 bg-accent/90 hover:bg-accent rounded-full flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform active:scale-95"
                title="Add to queue"
              >
                <svg className="w-4 h-4 md:w-4 md:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onPlay(song);
                }}
                className="w-14 h-14 md:w-14 md:h-14 bg-gradient-to-r from-primary to-primary-dark rounded-full flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform active:scale-95"
                title="Play now"
              >
                <svg className="w-6 h-6 md:w-6 md:h-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
              </button>
            </div>
          </div>
          <div className="font-semibold text-xs sm:text-sm lg:text-base text-text-primary truncate mb-0.5 sm:mb-1">{song.title}</div>
          <div className="text-xs sm:text-sm text-text-muted truncate">
            {song.artist || 'Unknown Artist'}
          </div>
        </div>
        ))}
      </div>

      {/* Add to Playlist Modal */}
      {showPlaylistModal && selectedSong && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowPlaylistModal(false);
              setSelectedSong(null);
            }
          }}
        >
          <div 
            className="bg-bg-card border border-border p-4 sm:p-6 rounded-2xl w-full max-w-md shadow-2xl my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl sm:text-2xl font-bold mb-4 text-text-primary">
              Add "{selectedSong.title}" to Playlist
            </h2>
            
            {availablePlaylists.length === 0 ? (
              <div className="text-center text-text-muted py-8">
                <p className="mb-4">You don't have any playlists yet.</p>
                <p className="text-sm">Create a playlist from the sidebar to add songs to it.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {availablePlaylists.map((playlist) => (
                  <button
                    key={playlist.id}
                    onClick={() => handleSelectPlaylist(playlist.id)}
                    className="w-full text-left p-4 rounded-lg bg-bg-hover hover:bg-bg-card border border-border hover:border-primary/30 transition-all"
                  >
                    <div className="font-semibold text-text-primary">{playlist.name}</div>
                    {playlist.description && (
                      <div className="text-sm text-text-muted mt-1">{playlist.description}</div>
                    )}
                    <div className="text-xs text-text-muted mt-1">
                      {playlist.playlistSongs?.length || 0} {playlist.playlistSongs?.length === 1 ? 'song' : 'songs'}
                    </div>
                  </button>
                ))}
              </div>
            )}

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  setShowPlaylistModal(false);
                  setSelectedSong(null);
                }}
                className="px-4 py-2 bg-bg-hover border border-border text-text-primary rounded-lg hover:bg-bg-card transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default SongList;
