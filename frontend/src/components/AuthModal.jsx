import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Login from '../pages/Login';
import Register from '../pages/Register';

function AuthModal({ isOpen, onClose, initialTab = 'login' }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchParams] = useSearchParams();

  // Set initial tab based on URL or prop
  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      // Check if it's a register token by checking the URL path
      const path = window.location.pathname;
      if (path.includes('register')) {
        setActiveTab('register');
      } else {
        setActiveTab('login');
      }
    } else if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [searchParams, initialTab]);

  // Block scrolling on body when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="bg-bg-card rounded-2xl border border-border shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-bg-card border-b border-border z-10 flex-shrink-0">
          <div className="flex">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                activeTab === 'login'
                  ? 'text-primary border-b-2 border-primary bg-primary/5'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                activeTab === 'register'
                  ? 'text-primary border-b-2 border-primary bg-primary/5'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              Register
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {activeTab === 'login' ? (
            <Login onClose={onClose} />
          ) : (
            <Register onClose={onClose} />
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthModal;
