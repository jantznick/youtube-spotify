# MusicDocks

A Spotify-like music player that uses embedded YouTube videos for playback. Built with React, Node.js, Express, PostgreSQL, and Prisma.

Created by [Creative Endurance Lab](https://creativeendurancelab.com/)

## Features

- 🎵 **Music Library**: Save and manage your favorite songs from YouTube
- 📝 **Playlists**: Create and manage playlists
- 🎮 **Player Controls**: Full play, pause, next, and previous controls using YouTube IFrame Player API
- 👤 **User Authentication**: Secure login/register with session cookies and magic token login
- 🎨 **Modern UI**: Beautiful Spotify-inspired interface with Tailwind CSS

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Zustand
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Session-based (cookie sessions)

## Development Setup

### Prerequisites

- Node.js 20+
- Docker (for database)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Update `.env` with your database URL:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/youtube_spotify?schema=public"
SESSION_SECRET="your-secret-key-change-this"
PORT=3001
NODE_ENV=development
```

5. Start the PostgreSQL database with Docker:
```bash
docker-compose up postgres -d
```

6. Run Prisma migrations:
```bash
npm run prisma:generate
npm run prisma:migrate
```

7. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:3001`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## Production Deployment

### Using Docker Compose

1. Create a `.env` file in the root directory with production values:
```
SESSION_SECRET=your-production-secret-key
```

2. Build and start all services:
```bash
docker-compose up -d
```

This will start:
- PostgreSQL database
- Backend API server
- Frontend application

### Manual Deployment

1. Set up PostgreSQL database
2. Update environment variables
3. Run migrations: `npm run prisma:migrate`
4. Build frontend: `cd frontend && npm run build`
5. Start backend: `cd backend && npm start`

## Usage

1. Register a new account or login
2. Add songs by providing YouTube URLs
3. Create playlists and add songs to them
4. Play songs using the player controls at the bottom

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with username/password
- `POST /api/auth/magic-token/request` - Request a magic token (prints to console)
- `POST /api/auth/magic-token/login` - Login with magic token
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user session

### Songs
- `GET /api/songs` - Get all user's songs
- `GET /api/songs/:id` - Get a song
- `POST /api/songs` - Add a new song
- `PUT /api/songs/:id` - Update a song
- `DELETE /api/songs/:id` - Delete a song

### Playlists
- `GET /api/playlists` - Get all user's playlists
- `GET /api/playlists/:id` - Get a playlist
- `POST /api/playlists` - Create a playlist
- `PUT /api/playlists/:id` - Update a playlist
- `DELETE /api/playlists/:id` - Delete a playlist
- `POST /api/playlists/:id/songs` - Add song to playlist
- `DELETE /api/playlists/:id/songs/:songId` - Remove song from playlist
- `PUT /api/playlists/:id/songs/reorder` - Reorder songs in playlist

## Notes

- YouTube video IDs are extracted from URLs automatically
- Thumbnails are generated from YouTube video IDs
- Player uses YouTube IFrame Player API for reliable play/pause control
- Next/previous automatically loads new videos
- Session cookies are used for authentication (no JWTs)
- Magic tokens are printed to the server console (15 minute expiration). In production, these should be sent via email.

## License

ISC
