# Quick Setup Guide

## Development Setup

### 1. Start Database

```bash
docker-compose up postgres -d
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database URL
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

### Backend (.env)
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/youtube_spotify?schema=public"
SESSION_SECRET="your-secret-key-change-this"
PORT=3001
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"
```

## First Time Setup

1. Start PostgreSQL: `docker-compose up postgres -d`
2. Install backend dependencies: `cd backend && npm install`
3. Install frontend dependencies: `cd frontend && npm install`
4. Generate Prisma client: `cd backend && npm run prisma:generate`
5. Run migrations: `cd backend && npm run prisma:migrate`
6. Start backend: `cd backend && npm run dev`
7. Start frontend: `cd frontend && npm run dev`

## Usage

1. Open http://localhost:5173
2. Register a new account
3. Add songs by providing YouTube URLs
4. Create playlists and add songs
5. Play music using the player controls

## Notes

- YouTube video IDs are automatically extracted from URLs
- Thumbnails are generated from YouTube video IDs
- For better YouTube player control, consider integrating the YouTube IFrame Player API
- Session cookies are used for authentication
