import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import cookieParser from 'cookie-parser';
import { PrismaClient } from '@prisma/client';

import authRoutes from './routes/auth.js';
import songRoutes from './routes/songs.js';
import playlistRoutes from './routes/playlists.js';
import userRoutes from './routes/user.js';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Session configuration with PostgreSQL store
const PgSession = connectPgSimple(session);

// Determine cookie domain - use .musicdocks.com for production subdomains
const cookieDomain = process.env.COOKIE_DOMAIN || 
  (process.env.FRONTEND_URL?.includes('musicdocks.com') ? '.musicdocks.com' : undefined);

console.log('Session config:', {
  nodeEnv: process.env.NODE_ENV,
  cookieDomain,
  frontendUrl: process.env.FRONTEND_URL,
  secure: true,
  sameSite: process.env.COOKIE_SAME_SITE || 'lax',
});

app.use(session({
  store: new PgSession({
    conString: process.env.DATABASE_URL,
    tableName: 'session',
    createTableIfMissing: true,
  }),
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-this',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: true, // Always true for HTTPS
    sameSite: process.env.COOKIE_SAME_SITE || 'lax',
    domain: cookieDomain,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  },
}));

// Debug middleware - log session and cookie info for auth routes
app.use((req, res, next) => {
  if (req.path.includes('/magic-token') || req.path.includes('/login') || req.path.includes('/register')) {
    console.log(`\n[DEBUG] ${req.method} ${req.path}`);
    console.log('[DEBUG] Request origin:', req.headers.origin);
    console.log('[DEBUG] Request cookies:', req.headers.cookie);
    console.log('[DEBUG] Session before:', {
      sessionID: req.sessionID,
      userId: req.session?.userId,
      cookie: req.session?.cookie ? {
        domain: req.session.cookie.domain,
        secure: req.session.cookie.secure,
        sameSite: req.session.cookie.sameSite,
        httpOnly: req.session.cookie.httpOnly,
        maxAge: req.session.cookie.maxAge,
      } : 'no session',
    });
    
    // Intercept response to log headers - check multiple times
    const originalEnd = res.end;
    const originalJson = res.json;
    
    // Intercept json to check headers before response is sent
    res.json = function(body) {
      const headersBefore = res.getHeaders();
      console.log('[DEBUG] Headers before json() completes:', headersBefore);
      console.log('[DEBUG] Set-Cookie before json():', res.getHeader('Set-Cookie'));
      const result = originalJson.call(this, body);
      // Check again after
      setTimeout(() => {
        console.log('[DEBUG] Headers after json() (delayed):', res.getHeaders());
        console.log('[DEBUG] Set-Cookie after json() (delayed):', res.getHeader('Set-Cookie'));
      }, 50);
      return result;
    };
    
    res.end = function(chunk, encoding) {
      console.log('[DEBUG] Response status:', res.statusCode);
      const allHeaders = res.getHeaders();
      console.log('[DEBUG] Response headers in res.end():', allHeaders);
      const setCookie = res.getHeader('Set-Cookie');
      console.log('[DEBUG] Set-Cookie header in res.end():', setCookie);
      if (!setCookie) {
        console.error('[DEBUG] WARNING: No Set-Cookie header in response!');
        console.error('[DEBUG] Session state:', {
          sessionID: req.sessionID,
          userId: req.session?.userId,
          cookie: req.session?.cookie,
        });
      }
      return originalEnd.call(this, chunk, encoding);
    };
  }
  next();
});

// Middleware to check authentication
const requireAuth = (req, res, next) => {
  if (req.session && req.session.userId) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/songs', requireAuth, songRoutes);
app.use('/api/playlists', requireAuth, playlistRoutes);
app.use('/api/user', requireAuth, userRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    environment: process.env.NODE_ENV,
    date: new Date().toISOString(),
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

export { prisma };
