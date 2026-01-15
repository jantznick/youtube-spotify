import { useEffect } from 'react';
import { Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import useAuthStore from './store/authStore';
import { authAPI } from './api/api';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Playlist from './pages/Playlist';
import Landing from './pages/Landing';
import ForgotPassword from './pages/ForgotPassword';
import NotFound from './pages/NotFound';
import Player from './components/Player';

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
  const { setUser, setLoading, isAuthenticated } = useAuthStore();

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

  return (
    <div className="min-h-screen bg-bg-dark text-text-primary">
      <Routes>
        <Route
          path="/login"
          element={<Login />}
        />
        <Route
          path="/register"
          element={<Register />}
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
          path="*"
          element={<NotFound />}
        />
      </Routes>
      {isAuthenticated && <Player />}
    </div>
  );
}

export default App;
