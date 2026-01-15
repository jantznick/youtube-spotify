import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { authAPI } from '../api/api';

function Register() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [requestingToken, setRequestingToken] = useState(false);
  const [tokenRequested, setTokenRequested] = useState(false);
  const [sixDigitCode, setSixDigitCode] = useState(['', '', '', '', '', '']);
  const navigate = useNavigate();
  const { setUser, isAuthenticated } = useAuthStore();

  // Check for token in URL
  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      setLoading(true);
      authAPI.registerWithMagicToken(token)
        .then((data) => {
          setUser(data.user);
          navigate('/home');
        })
        .catch((err) => {
          setError(err.message || 'Failed to register with magic token');
          setLoading(false);
        });
    }
  }, [searchParams, setUser, navigate]);

  // Redirect if already authenticated and no token in URL
  useEffect(() => {
    const token = searchParams.get('token');
    if (isAuthenticated && !token) {
      navigate('/home');
    }
  }, [isAuthenticated, navigate, searchParams]);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const data = await authAPI.register(usernameOrEmail, password);
      setUser(data.user);
      navigate('/home');
    } catch (err) {
      setError(err.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestMagicLink = async (e) => {
    e.preventDefault();
    if (!usernameOrEmail) {
      setError('Username or email is required');
      return;
    }

    setError('');
    setRequestingToken(true);

    try {
      await authAPI.requestRegisterToken(usernameOrEmail);
      setTokenRequested(true);
    } catch (err) {
      setError(err.message || 'Failed to request magic link');
    } finally {
      setRequestingToken(false);
    }
  };

  const handleMagicTokenSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Ensure we have a string, not an array
      const code = Array.isArray(sixDigitCode) ? sixDigitCode.join('') : String(sixDigitCode);
      
      if (code.length !== 6) {
        setError('Please enter the complete 6-digit code');
        setLoading(false);
        return;
      }
      
      const data = await authAPI.registerWithMagicToken(code);
      setUser(data.user);
      navigate('/home');
    } catch (err) {
      setError(err.message || 'Failed to register with magic token');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-dark p-4">
      <div className="w-full max-w-md p-8 bg-bg-card rounded-2xl border border-border shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Register</h1>
          <p className="text-text-muted">Create your MusicDocks account</p>
        </div>

        {error && (
          <div className="bg-red-500/20 text-red-400 p-3 rounded mb-4">
            {error}
          </div>
        )}

        {!tokenRequested ? (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label htmlFor="usernameOrEmail" className="block mb-2 text-sm font-medium">
                Username or Email
              </label>
              <input
                id="usernameOrEmail"
                type="text"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                placeholder="username or your@email.com"
                required
                className="w-full px-4 py-3 bg-bg-hover rounded-lg text-text-primary border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              />
              <button
                type="button"
                onClick={handleRequestMagicLink}
                disabled={requestingToken || !usernameOrEmail}
                className="mt-2 text-sm text-primary hover:text-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {requestingToken ? 'Sending...' : 'Send me a magic link instead'}
              </button>
            </div>
            <div>
              <label htmlFor="password" className="block mb-2 text-sm font-medium">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-bg-hover rounded-lg text-text-primary border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-bg-hover rounded-lg text-text-primary border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50"
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleMagicTokenSubmit} className="space-y-4">
            <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3 text-sm text-blue-400 mb-4">
              {usernameOrEmail.includes('@')
                ? `We've sent a magic link to ${usernameOrEmail}. Check your email or enter the 6-digit code below.`
                : 'Check the server console for your magic link and 6-digit code.'}
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium">
                6-Digit Code
              </label>
              <div className="flex gap-2 justify-center">
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <input
                    key={index}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={sixDigitCode[index]}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value) {
                        const newCode = [...sixDigitCode];
                        newCode[index] = value;
                        setSixDigitCode(newCode);
                        // Auto-focus next input
                        if (index < 5 && e.target.nextSibling) {
                          e.target.nextSibling.focus();
                        }
                      } else {
                        const newCode = [...sixDigitCode];
                        newCode[index] = '';
                        setSixDigitCode(newCode);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !sixDigitCode[index] && index > 0) {
                        e.target.previousSibling?.focus();
                      }
                    }}
                    className="w-12 h-12 text-center text-2xl font-mono bg-bg-hover border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  />
                ))}
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50"
            >
              {loading ? 'Registering...' : 'Register with Code'}
            </button>
            <button
              type="button"
              onClick={() => {
                setTokenRequested(false);
                setSixDigitCode(['', '', '', '', '', '']);
                setError('');
              }}
              className="w-full py-2 text-text-muted hover:text-text-primary transition text-sm"
            >
              Back to Password Registration
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-text-muted">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:text-primary-light font-medium transition-colors">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
