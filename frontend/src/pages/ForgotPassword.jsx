import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '../api/api';

function ForgotPassword() {
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState('request'); // 'request' or 'reset'
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Check for token in URL
  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      setStep('reset');
    }
  }, [searchParams]);

  const handleRequestReset = async (e) => {
    e.preventDefault();
    if (!usernameOrEmail) {
      setError('Username or email is required');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Determine if it's an email or username
      const isEmail = usernameOrEmail.includes('@');
      await authAPI.forgotPassword(isEmail ? usernameOrEmail : undefined, isEmail ? undefined : usernameOrEmail);
      setSuccess('If an account with that email or username exists, a password reset link has been sent.');
      setUsernameOrEmail('');
    } catch (err) {
      setError(err.message || 'Failed to request password reset');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (!newPassword || !confirmPassword) {
      setError('Please enter and confirm your new password');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    const token = searchParams.get('token');
    if (!token) {
      setError('Invalid reset token');
      return;
    }

    setLoading(true);

    try {
      await authAPI.resetPassword(token, newPassword);
      setSuccess('Password has been reset successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-bg-dark via-bg-dark to-bg-card flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        <div className="bg-bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-2xl">
          <div className="text-center mb-6 sm:mb-8">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
              {step === 'request' ? 'Forgot Password?' : 'Reset Password'}
            </h1>
            <p className="text-text-secondary">
              {step === 'request'
                ? 'Enter your email or username to receive a password reset link'
                : 'Enter your new password below'}
            </p>
          </div>

          {error && (
            <div className="bg-red-500/20 text-red-400 p-3 rounded mb-4 border border-red-500/30">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-500/20 text-green-400 p-3 rounded mb-4 border border-green-500/30">
              {success}
            </div>
          )}

          {step === 'request' ? (
            <form onSubmit={handleRequestReset} className="space-y-4">
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
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label htmlFor="newPassword" className="block mb-2 text-sm font-medium">
                  New Password
                </label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
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
                  minLength={6}
                  className="w-full px-4 py-3 bg-bg-hover rounded-lg text-text-primary border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-primary hover:text-primary-dark transition-colors text-sm"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
