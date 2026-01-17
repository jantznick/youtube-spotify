import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthModal } from '../contexts/AuthModalContext';
import { feedAPI } from '../api/api';

function Landing() {
  const { openAuthModal } = useAuthModal();
  const [stats, setStats] = useState({ artistCount: 0, songCount: 0 });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const statsData = await feedAPI.getStats();
        setStats(statsData);
      } catch (error) {
        console.error('Failed to load stats:', error);
      }
    };
    loadStats();
  }, []);
  return (
    <div className="min-h-screen bg-gradient-to-b from-bg-dark via-bg-dark to-bg-card">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-bg-dark/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
            <span className="text-lg sm:text-xl font-bold text-text-primary">MusicDocks</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => openAuthModal('register')}
              className="px-4 sm:px-6 py-1.5 sm:py-2 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg hover:shadow-lg hover:shadow-primary/30 transition-all font-medium text-sm sm:text-base"
            >
              Sign Up
            </button>
            <button 
              onClick={() => openAuthModal('login')}
              className="text-text-primary transition-all font-medium text-sm sm:text-base"
            >
              Sign In
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 sm:pt-32 md:pt-40 pb-16 sm:pb-24 md:pb-32 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary mb-6 sm:mb-8 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Your Music, Your Way
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-text-secondary mb-8 sm:mb-10 md:mb-12 max-w-3xl mx-auto leading-relaxed px-2">
            Build playlists from YouTube, import from Spotify, and create your perfect music collection. All powered by YouTube's vast library.
          </p>
          
          {/* Stats Section */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-8 sm:mb-10 md:mb-12">
            <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-text-primary bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {stats.songCount.toLocaleString()}
            </span>
            <span className="text-base sm:text-lg md:text-xl text-text-secondary">songs from</span>
            <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-text-primary bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {stats.artistCount.toLocaleString()}
            </span>
            <span className="text-base sm:text-lg md:text-xl text-text-secondary">artists</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            <Link
              to="/explore"
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all font-medium text-base sm:text-lg"
            >
              Start Listening Free
            </Link>
          </div>
        </div>
      </section>

      {/* Hero Image */}
      <section className="px-6 pb-32">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-2xl overflow-hidden border border-border shadow-2xl">
            <img
              src="/screenshots/hero-dashboard.png"
              alt="MusicDocks Dashboard"
              className="w-full h-auto"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="hidden w-full aspect-video bg-bg-card items-center justify-center border border-border">
              <div className="text-center">
                <svg className="w-16 h-16 text-text-muted mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-text-muted">Screenshot: hero-dashboard.png</p>
                <p className="text-sm text-text-muted mt-2">Main dashboard view showing library and playlists</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-6 bg-bg-card">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary text-center mb-6">
            Everything You Need
          </h2>
          <p className="text-lg text-text-secondary text-center mb-20 max-w-2xl mx-auto leading-relaxed">
            Powerful features to organize, discover, and enjoy your music collection
          </p>

          <div className="grid md:grid-cols-3 gap-10">
            {/* Feature 1 */}
            <div className="bg-bg-dark p-10 rounded-2xl border border-border hover:border-primary/30 transition-all">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center mb-8">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-4">YouTube Integration</h3>
              <p className="text-text-secondary leading-relaxed">
                Access millions of songs directly from YouTube. Add any track with just a URL, and we'll automatically extract all the metadata.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-bg-dark p-10 rounded-2xl border border-border hover:border-primary/30 transition-all">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-8">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.84-.179-.84-.66 0-.419.36-.719.78-.6 4.56.96 8.52 1.32 11.64 1.08.42 0 .66.3.6.66-.06.36-.3.54-.66.54zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-4">Spotify Import</h3>
              <p className="text-text-secondary leading-relaxed">
                Import your favorite Spotify playlists with one click. We'll automatically find the songs on YouTube and add them to your collection.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-bg-dark p-10 rounded-2xl border border-border hover:border-primary/30 transition-all">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent to-pink-600 flex items-center justify-center mb-8">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-4">Smart Playlists</h3>
              <p className="text-text-secondary leading-relaxed">
                Create unlimited playlists, organize your music library, and discover new tracks. All with a beautiful, intuitive interface.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary text-center mb-6">
            How It Works
          </h2>
          <p className="text-lg text-text-secondary text-center mb-20 max-w-2xl mx-auto leading-relaxed">
            Get started in minutes. No credit card required.
          </p>

          <div className="grid md:grid-cols-3 gap-16">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center mx-auto mb-8 text-2xl font-bold text-white">
                1
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-5">Sign Up Free</h3>
              <p className="text-text-secondary leading-relaxed">
                Create your account in seconds. Use password or magic link authentication for quick access.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center mx-auto mb-8 text-2xl font-bold text-white">
                2
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-5">Add Your Music</h3>
              <p className="text-text-secondary leading-relaxed">
                Import playlists from YouTube or Spotify, or add individual songs. We handle all the metadata automatically.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center mx-auto mb-8 text-2xl font-bold text-white">
                3
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-5">Start Listening</h3>
              <p className="text-text-secondary leading-relaxed">
                Enjoy your music with our beautiful floating player. Play, pause, skip, and control everything from anywhere.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Screenshots Section */}
      <section className="py-32 px-6 bg-bg-card">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary text-center mb-6">
            See It In Action
          </h2>
          <p className="text-lg text-text-secondary text-center mb-20 max-w-2xl mx-auto leading-relaxed">
            Beautiful design meets powerful functionality
          </p>

          <div className="grid md:grid-cols-2 gap-10 mb-16">
            {/* Screenshot 1 */}
            <div className="rounded-2xl overflow-hidden border border-border shadow-2xl">
              <img
                src="/screenshots/playlist-view.png"
                alt="Playlist View"
                className="w-full h-auto"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="hidden w-full aspect-video bg-bg-dark items-center justify-center border border-border">
                <div className="text-center">
                  <svg className="w-16 h-16 text-text-muted mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-text-muted">Screenshot: playlist-view.png</p>
                  <p className="text-sm text-text-muted mt-2">Individual playlist page showing songs</p>
                </div>
              </div>
            </div>

            {/* Screenshot 2 */}
            <div className="rounded-2xl overflow-hidden border border-border shadow-2xl">
              <img
                src="/screenshots/player-toast.png"
                alt="Floating Player"
                className="w-full h-auto"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="hidden w-full aspect-video bg-bg-dark items-center justify-center border border-border">
                <div className="text-center">
                  <svg className="w-16 h-16 text-text-muted mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-text-muted">Screenshot: player-toast.png</p>
                  <p className="text-sm text-text-muted mt-2">Floating mini-player in action</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {/* Screenshot 3 */}
            <div className="rounded-2xl overflow-hidden border border-border shadow-2xl">
              <img
                src="/screenshots/library-view.png"
                alt="Library View"
                className="w-full h-auto"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="hidden w-full aspect-video bg-bg-dark items-center justify-center border border-border">
                <div className="text-center">
                  <svg className="w-16 h-16 text-text-muted mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-text-muted">Screenshot: library-view.png</p>
                  <p className="text-sm text-text-muted mt-2">Main library with song grid</p>
                </div>
              </div>
            </div>

            {/* Screenshot 4 */}
            <div className="rounded-2xl overflow-hidden border border-border shadow-2xl">
              <img
                src="/screenshots/import-modal.png"
                alt="Import Playlist"
                className="w-full h-auto"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="hidden w-full aspect-video bg-bg-dark items-center justify-center border border-border">
                <div className="text-center">
                  <svg className="w-16 h-16 text-text-muted mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-text-muted">Screenshot: import-modal.png</p>
                  <p className="text-sm text-text-muted mt-2">Import playlist modal</p>
                </div>
              </div>
            </div>

            {/* Screenshot 5 */}
            <div className="rounded-2xl overflow-hidden border border-border shadow-2xl">
              <img
                src="/screenshots/mini-player.png"
                alt="Mini Player"
                className="w-full h-auto"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="hidden w-full aspect-video bg-bg-dark items-center justify-center border border-border">
                <div className="text-center">
                  <svg className="w-16 h-16 text-text-muted mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-text-muted">Screenshot: mini-player.png</p>
                  <p className="text-sm text-text-muted mt-2">Minimized player view</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Detail */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-20 items-center mb-20">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-8">
                Import from Anywhere
              </h2>
              <p className="text-lg text-text-secondary mb-8 leading-relaxed">
                Bring your music from YouTube or Spotify. Our smart import system automatically finds the best matches and creates your playlists in seconds.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-text-secondary">Import entire YouTube playlists with one click</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-text-secondary">Sync your Spotify playlists automatically</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-text-secondary">Automatic metadata extraction from YouTube</span>
                </li>
              </ul>
            </div>
            <div className="rounded-2xl overflow-hidden border border-border shadow-2xl">
              <img
                src="/screenshots/import-feature.png"
                alt="Import Feature"
                className="w-full h-auto"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="hidden w-full aspect-video bg-bg-dark items-center justify-center border border-border">
                <div className="text-center">
                  <svg className="w-16 h-16 text-text-muted mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-text-muted">Screenshot: import-feature.png</p>
                  <p className="text-sm text-text-muted mt-2">Import modal showing YouTube/Spotify options</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-20 items-center">
            <div className="order-2 md:order-1 rounded-2xl overflow-hidden border border-border shadow-2xl">
              <img
                src="/screenshots/player-feature.png"
                alt="Player Feature"
                className="w-full h-auto"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="hidden w-full aspect-video bg-bg-dark items-center justify-center border border-border">
                <div className="text-center">
                  <svg className="w-16 h-16 text-text-muted mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-text-muted">Screenshot: player-feature.png</p>
                  <p className="text-sm text-text-muted mt-2">Player showing controls and queue</p>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-8">
                Beautiful Player Experience
              </h2>
              <p className="text-lg text-text-secondary mb-8 leading-relaxed">
                Enjoy your music with our elegant floating player. Minimize it to keep working, or expand it for full control. Seamlessly integrated with YouTube's player.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-text-secondary">Floating mini-player that stays out of your way</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-text-secondary">Minimize to a compact mini player</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-text-secondary">Full playlist queue management</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-8">
            Ready to Build Your Music Library?
          </h2>
          <p className="text-lg text-text-secondary mb-12 leading-relaxed">
            Join thousands of music lovers organizing their collections with MusicDocks. Free forever, no credit card required.
          </p>
          <div className="flex items-center justify-center gap-6 flex-wrap">
            <button
              onClick={() => openAuthModal('register')}
              className="px-8 py-4 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all font-medium text-lg"
            >
              Get Started Free
            </button>
            <button
              onClick={() => openAuthModal('login')}
              className="px-8 py-4 bg-bg-card border border-border text-text-primary rounded-xl hover:bg-bg-hover transition-all font-medium text-lg"
            >
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <span className="text-lg font-bold text-text-primary">MusicDocks</span>
            </div>
            <div className="text-text-muted text-sm">
              © {new Date().getFullYear()} <a href="https://creativeendurancelab.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-dark transition-colors">Creative Endurance Lab</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
