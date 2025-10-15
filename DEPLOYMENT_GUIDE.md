# Quick Deployment Guide - Vercel Frontend

## ✅ CORS Already Configured!

Your backend now accepts requests from:
- ✅ `https://rozgar-hackathon.vercel.app`
- ✅ `http://localhost:5173` (dev)
- ✅ `http://localhost:8080` (dev)
- ✅ `http://localhost:3000` (dev)

## Frontend Deployment (Vercel)

### Step 1: Set Environment Variable

In Vercel Dashboard:
1. Go to your project: `rozgar-hackathon`
2. Settings → Environment Variables
3. Add new variable:
   - **Name**: `VITE_API_BASE_URL`
   - **Value**: `https://your-backend-url.com`
   - **Environments**: ☑️ Production, ☑️ Preview, ☑️ Development

### Step 2: Deploy

```bash
cd frontend
git add .
git commit -m "Add production CORS support"
git push origin main
# Vercel will auto-deploy
```

Or manual deploy:
```bash
vercel --prod
```

## Backend Deployment Options

### Option A: Railway (Recommended)

1. **Install Railway CLI**
   ```bash
   npm i -g @railway/cli
   ```

2. **Login & Deploy**
   ```bash
   cd backend
   railway login
   railway init
   railway up
   ```

3. **Set Environment Variables**
   ```bash
   railway variables set MONGODB_URI="your-mongodb-uri"
   railway variables set JWT_SECRET="your-jwt-secret"
   railway variables set NODE_ENV="production"
   ```

4. **Get Backend URL**
   ```bash
   railway domain
   # Copy the URL (e.g., https://your-app.railway.app)
   ```

### Option B: Render

1. **Create Account**: https://render.com
2. **New Web Service** → Connect GitHub repo
3. **Configure**:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Add Environment Variables:
     ```
     MONGODB_URI=your-mongodb-uri
     JWT_SECRET=your-jwt-secret
     NODE_ENV=production
     ```

### Option C: Heroku

```bash
cd backend
heroku create your-app-name
heroku config:set MONGODB_URI="your-mongodb-uri"
heroku config:set JWT_SECRET="your-jwt-secret"
heroku config:set NODE_ENV="production"
git push heroku main
```

## Update Frontend with Backend URL

After deploying backend:

1. **Get your backend URL** (e.g., `https://rozgar-api.railway.app`)

2. **Update Vercel Environment Variable**:
   - Go to Vercel Dashboard
   - Project Settings → Environment Variables
   - Update `VITE_API_BASE_URL` to your backend URL
   - Redeploy: Settings → Deployments → Latest → Redeploy

## Testing Checklist

### 1. Test Backend CORS
```bash
curl -H "Origin: https://rozgar-hackathon.vercel.app" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://your-backend-url.com/api/auth/login
```

Expected: Should see `Access-Control-Allow-Origin: https://rozgar-hackathon.vercel.app`

### 2. Test Frontend API Call
1. Open https://rozgar-hackathon.vercel.app
2. Open Browser Console (F12)
3. Try to login/register
4. Check Network tab - API calls should succeed
5. No CORS errors in console

### 3. Test Authentication
- ✅ Login works
- ✅ Token is saved
- ✅ Protected routes work
- ✅ Logout works

### 4. Test Features
- ✅ View communities
- ✅ Create posts
- ✅ Join communities
- ✅ View jobs
- ✅ Apply to jobs

## Common Issues & Fixes

### Issue: "CORS Policy Error"
**Fix**: Verify backend URL in Vercel environment variables matches actual backend URL

### Issue: "Network Error"
**Fix**: Check backend is running and accessible at the URL

### Issue: "401 Unauthorized"
**Fix**: Login again, token might have expired

### Issue: "Cookies not working"
**Fix**: Backend CORS already has `credentials: true` ✅

## Environment Variables Summary

### Frontend (Vercel)
```env
VITE_API_BASE_URL=https://your-backend-url.com
```

### Backend (Railway/Render/Heroku)
```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/rozgar
JWT_SECRET=your-super-secure-secret
SESSION_SECRET=your-session-secret
SENDER_EMAIL=noreply@rozgar.com
EMAIL_PASSWORD=your-email-password
```

## Quick Commands

### Deploy Frontend
```bash
cd frontend
git push origin main
# Or: vercel --prod
```

### Deploy Backend (Railway)
```bash
cd backend
railway up
```

### View Logs (Railway)
```bash
railway logs
```

### View Logs (Render)
Check dashboard → Logs tab

### View Logs (Heroku)
```bash
heroku logs --tail
```

## Support URLs

- **Frontend**: https://rozgar-hackathon.vercel.app
- **Backend**: https://your-backend-url.com
- **API Docs**: https://your-backend-url.com/api

---

**Status**: ✅ Ready to Deploy
**CORS**: ✅ Configured for Production
**Date**: October 15, 2025
