import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { Pool } from 'pg';
import cookieParser from 'cookie-parser';
import { PrismaClient } from '@prisma/client';
import { createServer } from 'http';
import { Server } from 'socket.io';

import authRoutes from './routes/auth.js';
import songRoutes from './routes/songs.js';
import playlistRoutes from './routes/playlists.js';
import userRoutes from './routes/user.js';
import feedRoutes from './routes/feed.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const prisma = new PrismaClient();

const PORT = process.env.PORT || 3001;

// Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

// Socket.io authentication middleware
// Note: We'll verify the user when they emit 'join' with their userId
// For now, allow connection and verify on join event
io.use((socket, next) => {
  // Allow connection - we'll verify user on 'join' event
  next();
});

// Store user sessions for Socket.io
const userSockets = new Map(); // userId -> Set of socket IDs

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);
  
  // When user joins, associate socket with user ID
  socket.on('join', (userId) => {
    if (userId) {
      if (!userSockets.has(userId)) {
        userSockets.set(userId, new Set());
      }
      userSockets.get(userId).add(socket.id);
      socket.userId = userId;
      console.log(`User ${userId} joined. Total sockets for user:`, userSockets.get(userId).size);
    }
  });
  
  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
    if (socket.userId && userSockets.has(socket.userId)) {
      userSockets.get(socket.userId).delete(socket.id);
      if (userSockets.get(socket.userId).size === 0) {
        userSockets.delete(socket.userId);
      }
    }
  });
});

// Helper function to emit to a specific user
const emitToUser = (userId, event, data) => {
  if (userSockets.has(userId)) {
    const sockets = userSockets.get(userId);
    sockets.forEach(socketId => {
      io.to(socketId).emit(event, data);
    });
  }
};

// Trust proxy in production (needed for secure cookies behind reverse proxy)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Session configuration with PostgreSQL store (matching parlay-streak setup)
const PgSession = connectPgSimple(session);

// Create PostgreSQL connection pool for sessions
const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Determine cookie domain - use .musicdocks.com for production subdomains
const isProduction = process.env.NODE_ENV === 'production';
const cookieDomain = process.env.COOKIE_DOMAIN || 
  (isProduction ? '.musicdocks.com' : undefined);

console.log('Session config:', {
  nodeEnv: process.env.NODE_ENV,
  isProduction,
  cookieDomain,
  frontendUrl: process.env.FRONTEND_URL,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  proxy: isProduction,
});

app.use(session({
  store: new PgSession({
    pool: pgPool,
    tableName: 'session',
    createTableIfMissing: false, // Table is managed by Prisma migrations
  }),
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-this',
  resave: false,
  saveUninitialized: false, // Don't save uninitialized sessions (matching parlay-streak)
  name: 'connect.sid',
  cookie: {
    secure: isProduction, // true in production (requires HTTPS)
    httpOnly: true, // Prevent client-side JS from accessing cookie
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    sameSite: isProduction ? 'none' : 'lax', // 'none' required for cross-subdomain cookies in production
    domain: cookieDomain, // Allow cookies across subdomains in production
    path: '/', // Ensure cookie is available for all paths
  },
  rolling: false,
  proxy: isProduction, // Trust proxy for secure cookies behind reverse proxy
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

const requireAdmin = async (req, res, next) => {
  console.log('[ADMIN] Checking admin access for request:', req.path);
  
  if (!req.session || !req.session.userId) {
    console.log('[ADMIN] No session or userId');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.session.userId },
      select: { email: true },
    });

    console.log('[ADMIN] User found:', { userId: req.session.userId, email: user?.email });

    if (!user || !user.email) {
      console.log('[ADMIN] User has no email');
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    // Check if user's email is in ADMIN_EMAIL env variable
    const adminEmails = process.env.ADMIN_EMAIL;
    console.log('[ADMIN] ADMIN_EMAIL env var:', adminEmails ? 'SET' : 'NOT SET');
    
    if (!adminEmails) {
      console.log('[ADMIN] ADMIN_EMAIL not configured');
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    const emailList = adminEmails.split(',').map(email => email.trim().toLowerCase());
    const userEmail = user.email.toLowerCase();
    
    console.log('[ADMIN] Checking email:', userEmail, 'against list:', emailList);

    if (!emailList.includes(userEmail)) {
      console.log('[ADMIN] Email not in admin list');
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    console.log('[ADMIN] Access granted');
    next();
  } catch (error) {
    console.error('[ADMIN] Admin check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Routes
app.use('/api/auth', authRoutes);
// Songs GET endpoint is public, but PUT requires auth
app.use('/api/songs', songRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/playlists', requireAuth, playlistRoutes);
app.use('/api/user', requireAuth, userRoutes);
app.use('/api/admin', requireAuth, requireAdmin, adminRoutes);

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

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.io server ready`);
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

export { prisma, io, emitToUser };
