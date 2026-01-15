# Environment Variables Reference

## Backend (Railway)

Set these in Railway dashboard → Your Service → Variables:

```
DATABASE_URL          # Automatically set by Railway when you add Postgres
NODE_ENV              # Set to: production
FRONTEND_URL          # Your Render frontend URL (e.g., https://your-app.onrender.com)
SESSION_SECRET        # Generate with: openssl rand -base64 32
RESEND_API_KEY        # From your Resend dashboard
RESEND_FROM_EMAIL     # Your verified email domain (e.g., noreply@yourdomain.com)
```

## Frontend (Render)

Set these in Render dashboard → Your Service → Environment:

```
VITE_API_URL          # Your Railway backend URL + /api (e.g., https://your-app.railway.app/api)
```

## Local Development

### Backend (.env in backend/ folder)
```
DATABASE_URL="postgresql://user:password@localhost:5432/musicdocks?schema=public"
PORT=3001
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"
SESSION_SECRET="dev-secret-key"
RESEND_API_KEY="your-resend-api-key"
RESEND_FROM_EMAIL="noreply@yourdomain.com"
```

### Frontend (.env in frontend/ folder)
```
# Leave empty to use Vite proxy for local development
VITE_API_URL=""
```
