# Deployment Guide

This guide will help you deploy the MusicDocks application:
- **Backend API**: Railway (with Railway Postgres)
- **Frontend**: Render

## Prerequisites

1. GitHub repository with your code
2. Railway account (https://railway.app)
3. Render account (https://render.com)
4. Resend account (for email functionality)

## Backend Deployment (Railway)

### Step 1: Create Railway Project

1. Go to [Railway](https://railway.app) and create a new project
2. Select "Deploy from GitHub repo" and connect your repository
3. Select the `backend` folder as the root directory

### Step 2: Add Postgres Database

1. In your Railway project, click "New" → "Database" → "Add PostgreSQL"
2. Railway will automatically create a Postgres database
3. The `DATABASE_URL` environment variable will be automatically set

### Step 3: Configure Environment Variables

In Railway, go to your service → Variables and add:

```
NODE_ENV=production
FRONTEND_URL=https://musicdocks.com
SESSION_SECRET=lkwjeh9724392yru9ohwf
RESEND_API_KEY=
RESEND_FROM_EMAIL=musicdocks@mail.creativeendurancelab.com
```

**Important Notes:**
- `DATABASE_URL` is automatically set by Railway when you add Postgres
- Replace `your-frontend.onrender.com` with your actual Render frontend URL
- Generate a strong `SESSION_SECRET` (you can use: `openssl rand -base64 32`)

### Step 4: Deploy

1. Railway will automatically detect the `railway.json` configuration
2. The build process will:
   - Install dependencies
   - Run `prisma generate`
   - Run `prisma migrate deploy` (applies migrations)
3. The service will start with `npm start`

### Step 5: Get Your Backend URL

After deployment, Railway will provide a URL like:
`https://your-app.railway.app`

Note this URL - you'll need it for the frontend configuration.

## Frontend Deployment (Render)

### Step 1: Create Render Web Service

1. Go to [Render](https://render.com) and click "New" → "Static Site"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `musicdocks-frontend` (or your preferred name)
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

### Step 2: Configure Environment Variables

In Render, go to your service → Environment and add:

```
VITE_API_URL=https://your-app.railway.app/api
```

Replace `your-app.railway.app` with your actual Railway backend URL.

### Step 3: Deploy

1. Click "Create Static Site"
2. Render will build and deploy your frontend
3. Your frontend will be available at a URL like: `https://your-app.onrender.com`

## Post-Deployment Checklist

### Backend (Railway)
- [ ] Database migrations ran successfully
- [ ] Health check endpoint works: `https://your-app.railway.app/api/health`
- [ ] CORS is configured correctly (check `FRONTEND_URL`)
- [ ] Session cookies work (check `SESSION_SECRET` and `secure` flag)

### Frontend (Render)
- [ ] Frontend loads correctly
- [ ] API calls work (check browser console for errors)
- [ ] Authentication works (login/register)
- [ ] CORS errors are resolved

## Troubleshooting

### Backend Issues

**Database Connection Errors:**
- Verify `DATABASE_URL` is set correctly in Railway
- Check that Postgres service is running
- Ensure migrations ran: Check Railway logs for `prisma migrate deploy`

**CORS Errors:**
- Verify `FRONTEND_URL` matches your Render frontend URL exactly
- Check that `credentials: true` is set in CORS config

**Session Issues:**
- Verify `SESSION_SECRET` is set
- Check that `secure: true` is set for production (it should be based on `NODE_ENV`)

### Frontend Issues

**API Connection Errors:**
- Verify `VITE_API_URL` is set correctly in Render
- Check that the URL includes `/api` at the end
- Ensure CORS is configured on the backend

**Build Errors:**
- Check that all dependencies are in `package.json`
- Verify Node version compatibility

## Environment Variables Summary

### Backend (Railway)
```
DATABASE_URL          # Auto-set by Railway Postgres
NODE_ENV              # production
FRONTEND_URL          # Your Render frontend URL
SESSION_SECRET        # Strong random string
RESEND_API_KEY        # From Resend dashboard
RESEND_FROM_EMAIL     # Your verified email domain
```

### Frontend (Render)
```
VITE_API_URL          # Your Railway backend URL + /api
```

## Updating the Application

### Backend Updates
1. Push changes to GitHub
2. Railway will automatically redeploy
3. If you added new migrations, they'll run automatically during build

### Frontend Updates
1. Push changes to GitHub
2. Render will automatically rebuild and redeploy

## Database Migrations

Migrations run automatically during Railway deployment via the `build` script:
```json
"build": "prisma generate && prisma migrate deploy"
```

If you need to run migrations manually:
1. Connect to Railway's database via their dashboard
2. Or use Railway CLI: `railway run npx prisma migrate deploy`

## Security Notes

1. **Never commit `.env` files** - Use environment variables in Railway/Render
2. **Use strong SESSION_SECRET** - Generate with: `openssl rand -base64 32`
3. **Verify email domain** - Make sure your `RESEND_FROM_EMAIL` domain is verified in Resend
4. **HTTPS only** - Both Railway and Render provide HTTPS by default

## Support

If you encounter issues:
1. Check Railway logs: Railway dashboard → Your service → Logs
2. Check Render logs: Render dashboard → Your service → Logs
3. Verify all environment variables are set correctly
4. Test API endpoints directly: `curl https://your-app.railway.app/api/health`
