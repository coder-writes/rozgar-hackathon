# Quick Deployment Guide - CORS Fix

## 🚀 Deploy Updated Backend

### Step 1: Commit Changes
```bash
cd /home/priyanshu/code/projects/rozgar
git add backend/server.js
git add PRODUCTION_CORS_FIX.md
git commit -m "fix: Enhanced CORS configuration for production deployment"
git push origin main
```

### Step 2: Render Will Auto-Deploy
- Render.com watches your GitHub repository
- It will automatically deploy when it detects the push
- Wait 2-3 minutes for deployment

**Or Deploy Manually:**
1. Go to https://render.com/dashboard
2. Click on "rozgar-hackathon" service
3. Click "Manual Deploy" → "Deploy latest commit"

### Step 3: Verify Backend is Running
```bash
curl https://rozgar-hackathon.onrender.com/
```

Expected response:
```json
{
  "message": "Rozgar API is running",
  "version": "1.0.0",
  ...
}
```

---

## 🌐 Update Frontend Environment Variables

### For Vercel Deployment

1. **Go to Vercel Dashboard:**
   - Visit https://vercel.com/dashboard
   - Select your project "rozgar-hackathon"

2. **Set Environment Variable:**
   - Settings → Environment Variables
   - Add new variable:
     - **Name:** `VITE_API_BASE_URL`
     - **Value:** `https://rozgar-hackathon.onrender.com`
     - **Environments:** Check "Production", "Preview", and "Development"
   - Click "Save"

3. **Redeploy Frontend:**
   - Go to "Deployments" tab
   - Click "..." menu on latest deployment
   - Click "Redeploy"
   
   **OR** push a commit:
   ```bash
   git add frontend/.env.production
   git commit -m "chore: Add production environment configuration"
   git push origin main
   ```

---

## ✅ Test Production

### 1. Open Production Site
Visit: https://rozgar-hackathon.vercel.app

### 2. Open Browser Console (F12)
Go to Network tab

### 3. Try to Login
- Enter credentials
- Click login
- Watch Network tab

### 4. Check for CORS Headers
Click on the login request, check Response Headers:
- ✅ `access-control-allow-origin: https://rozgar-hackathon.vercel.app`
- ✅ `access-control-allow-credentials: true`

### 5. Verify No Errors
Console should show no CORS errors.

---

## 🔍 Quick Diagnostics

### If CORS Error Still Appears:

**1. Check Backend is Awake (Render Free Tier Sleeps)**
```bash
curl https://rozgar-hackathon.onrender.com/health
```
Wait 30 seconds if you get no response (service is waking up)

**2. Verify CORS Headers**
```bash
curl -I -X OPTIONS https://rozgar-hackathon.onrender.com/api/auth/login \
  -H "Origin: https://rozgar-hackathon.vercel.app" \
  -H "Access-Control-Request-Method: POST"
```

Should see:
```
HTTP/1.1 204 No Content
access-control-allow-origin: https://rozgar-hackathon.vercel.app
access-control-allow-methods: GET,POST,PUT,DELETE,OPTIONS,PATCH
access-control-allow-credentials: true
```

**3. Check Render Logs**
- Go to Render Dashboard → Your Service → Logs
- Look for errors or CORS messages

**4. Clear Browser Cache**
- Hard refresh: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
- Or clear browser cache completely

---

## 📋 Checklist

- [ ] Backend changes committed and pushed
- [ ] Render deployment successful
- [ ] Backend health check passes
- [ ] Vercel environment variable set
- [ ] Frontend redeployed
- [ ] Production site loads
- [ ] Login works without CORS errors
- [ ] All API calls successful

---

## 🆘 Emergency Rollback

If something breaks:

### Render:
1. Go to Render Dashboard → rozgar-hackathon
2. Deployments → Select previous working deployment
3. Click "Rollback to this version"

### Vercel:
1. Go to Vercel Dashboard → rozgar-hackathon
2. Deployments → Find previous working deployment
3. Click "..." → "Promote to Production"

---

## 📞 Support

If issues persist, check:
- `PRODUCTION_CORS_FIX.md` for detailed troubleshooting
- Render logs for backend errors
- Browser console for frontend errors
- Network tab for request/response details

---

**Quick Commands:**

```bash
# Test backend
curl https://rozgar-hackathon.onrender.com/

# Test CORS
curl -X OPTIONS https://rozgar-hackathon.onrender.com/api/auth/login \
  -H "Origin: https://rozgar-hackathon.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -v

# Deploy
git add -A
git commit -m "fix: CORS configuration for production"
git push origin main
```

---

**Status:** ✅ Ready to Deploy  
**Estimated Time:** 5-10 minutes  
**Risk:** Low (can rollback if needed)
