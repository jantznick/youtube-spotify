import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useSearchParams, useLocation } from 'react-router-dom';
import useAuthStore from './store/authStore';
import { authAPI } from './api/api';
import Home from './pages/Home';
import Playlist from './pages/Playlist';
import Queue from './pages/Queue';
import Landing from './pages/Landing';
import Explore from './pages/Explore';
import ForgotPassword from './pages/ForgotPassword';
import NotFound from './pages/NotFound';
import Admin from './pages/Admin';
import Player from './components/Player';
import AuthModal from './components/AuthModal';
import { AuthModalContext } from './contexts/AuthModalContext';

// Wrapper component to check for reset token in URL
function ResetPasswordRoute() {
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuthStore();
  const token = searchParams.get('token');
  
  // Allow access to reset-password page even if authenticated, as long as there's a token
  // This allows users to reset their password even if they're logged in
  if (isAuthenticated && !token) {
    return <Navigate to="/home" />;
  }
  
  return <ForgotPassword />;
}

function App() {
  const { setUser, setLoading, isAuthenticated, isLoading } = useAuthStore();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login');
  const location = useLocation();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const data = await authAPI.me();
        setUser(data.user);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [setUser, setLoading]);

  // Open auth modal when navigating to /login or /register
  useEffect(() => {
    if (location.pathname === '/login' || location.pathname === '/register') {
      if (!isAuthenticated) {
        setAuthModalTab(location.pathname === '/register' ? 'register' : 'login');
        setAuthModalOpen(true);
      }
    }
  }, [location.pathname, isAuthenticated]);

  // Close modal and navigate away when authenticated
  useEffect(() => {
    if (isAuthenticated && authModalOpen) {
      setAuthModalOpen(false);
    }
  }, [isAuthenticated, authModalOpen]);

  const handleCloseAuthModal = () => {
    setAuthModalOpen(false);
    // Navigate back to previous page or landing
    if (location.pathname === '/login' || location.pathname === '/register') {
      const token = searchParams.get('token');
      if (!token) {
        // Only navigate back if there's no token (token URLs should stay)
        window.history.replaceState({}, '', '/');
      }
    }
  };

  const openAuthModal = (tab = 'login') => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  };

  return (
    <AuthModalContext.Provider value={{ openAuthModal }}>
      <div className="min-h-screen bg-bg-dark text-text-primary">
        <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/home" /> : <Landing />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/home" /> : <Landing />}
        />
        <Route
          path="/forgot-password"
          element={isAuthenticated ? <Navigate to="/home" /> : <ForgotPassword />}
        />
        <Route
          path="/reset-password"
          element={<ResetPasswordRoute />}
        />
        <Route
          path="/"
          element={isAuthenticated ? <Navigate to="/home" /> : <Landing />}
        />
        <Route
          path="/home"
          element={isAuthenticated ? <Home /> : <Navigate to="/" />}
        />
        <Route
          path="/playlist/:id"
          element={isAuthenticated ? <Playlist /> : <Navigate to="/" />}
        />
        <Route
          path="/queue"
          element={<Queue />}
        />
        <Route
          path="/explore"
          element={<Explore />}
        />
        <Route
          path="/admin"
          element={
            isLoading ? (
              <div className="flex items-center justify-center h-screen">
                <div className="text-xl">Loading...</div>
              </div>
            ) : isAuthenticated ? (
              <Admin />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="*"
          element={<NotFound />}
        />
        </Routes>
        <Player />
        <AuthModal 
          isOpen={authModalOpen} 
          onClose={handleCloseAuthModal}
          initialTab={authModalTab}
        />
      </div>
    </AuthModalContext.Provider>
  );
}

export default App;
