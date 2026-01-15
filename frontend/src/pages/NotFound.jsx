import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="min-h-screen bg-bg-dark flex items-center justify-center px-6">
      <div className="text-center max-w-2xl">
        <h1 className="text-9xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-4xl font-bold text-text-primary mb-6">Page Not Found</h2>
        <p className="text-xl text-text-secondary mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            to="/"
            className="px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg hover:shadow-lg hover:shadow-primary/30 transition-all font-medium"
          >
            Go Home
          </Link>
          <Link
            to="/home"
            className="px-6 py-3 bg-bg-card border border-border text-text-primary rounded-lg hover:bg-bg-hover transition-all font-medium"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
