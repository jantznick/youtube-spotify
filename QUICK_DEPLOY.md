# Quick Deployment Checklist

## 🚂 Railway (Backend) - 5 Steps

1. **Create Project**
   - Go to Railway → New Project → Deploy from GitHub
   - Select your repo and set root directory to `backend`

2. **Add Postgres**
   - In Railway project → New → Database → Add PostgreSQL
   - `DATABASE_URL` is automatically set ✅

3. **Set Environment Variables**
   ```
   NODE_ENV=production
   FRONTEND_URL=https://your-frontend.onrender.com
   SESSION_SECRET=<generate-with-openssl-rand-base64-32>
   RESEND_API_KEY=<from-resend-dashboard>
   RESEND_FROM_EMAIL=noreply@yourdomain.com
   ```

4. **Deploy**
   - Railway auto-detects `railway.json`
   - Build runs: `npm run build` (generates Prisma + runs migrations)
   - Service starts: `npm start`

5. **Get Backend URL**
   - Copy your Railway service URL (e.g., `https://your-app.railway.app`)
   - You'll need this for frontend config

## 🎨 Render (Frontend) - 3 Steps

1. **Create Static Site**
   - Render → New → Static Site
   - Connect GitHub repo
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`

2. **Set Environment Variable**
   ```
   VITE_API_URL=https://your-app.railway.app/api
   ```
   (Replace with your actual Railway backend URL)

3. **Deploy**
   - Click "Create Static Site"
   - Render builds and deploys automatically

## ✅ Post-Deployment

1. **Test Backend**
   - Visit: `https://your-app.railway.app/api/health`
   - Should return: `{"status":"ok"}`

2. **Test Frontend**
   - Visit your Render URL
   - Try logging in/registering
   - Check browser console for errors

3. **Update Backend FRONTEND_URL**
   - In Railway, update `FRONTEND_URL` to match your Render URL
   - This fixes CORS and email links

## 🔧 Troubleshooting

**Backend won't start?**
- Check Railway logs
- Verify `DATABASE_URL` is set
- Check migrations ran (look for "prisma migrate deploy" in logs)

**Frontend can't connect to API?**
- Verify `VITE_API_URL` includes `/api` at the end
- Check CORS settings in backend (verify `FRONTEND_URL` matches Render URL)

**Database errors?**
- Ensure Postgres service is running in Railway
- Check `DATABASE_URL` format is correct

## 📝 Environment Variables Quick Reference

### Railway (Backend)
- `DATABASE_URL` - Auto-set ✅
- `NODE_ENV=production`
- `FRONTEND_URL` - Your Render URL
- `SESSION_SECRET` - Random string
- `RESEND_API_KEY` - From Resend
- `RESEND_FROM_EMAIL` - Verified domain

### Render (Frontend)
- `VITE_API_URL` - Railway URL + `/api`

See `DEPLOYMENT.md` for detailed instructions.
