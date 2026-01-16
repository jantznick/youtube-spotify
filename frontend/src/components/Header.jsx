import { Link } from 'react-router-dom';
import { useAuthModal } from '../contexts/AuthModalContext';

export default function Header({ showImportButton = false, onImportClick }) {
  const { openAuthModal } = useAuthModal();

  return (
    <header className="sticky top-0 z-40 bg-bg-dark/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2 sm:gap-4">
        <Link to="/explore" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </div>
          <span className="text-lg sm:text-xl font-bold text-text-primary">MusicDocks</span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          {showImportButton && (
            <button
              onClick={onImportClick}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg hover:shadow-lg hover:shadow-primary/30 transition-all font-medium text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">Import Playlist</span>
            </button>
          )}
          <span className="text-xs sm:text-sm text-text-secondary hidden sm:inline">
            <button onClick={() => openAuthModal('register')} className="text-primary hover:text-primary-dark">
              Sign up free
            </button> to create playlists and save your favorites
          </span>
        </div>
      </div>
    </header>
  );
}
