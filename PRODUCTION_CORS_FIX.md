# CORS Fix for Production - Vercel Frontend + Render Backend

## 🔴 Issue
**Error:** `Access to XMLHttpRequest at 'https://rozgar-hackathon.onrender.com/api/auth/login' from origin 'https://rozgar-hackathon.vercel.app' has been blocked by CORS policy`

## ✅ Solution Applied

### Backend Changes (server.js)

#### 1. Updated Allowed Origins
Added Render.com backend URL to allowed origins:

```javascript
const allowedOrigins = [
  'http://localhost:5173', 
  'http://localhost:8080', 
  'http://localhost:3000',
  'https://rozgar-hackathon.vercel.app',  // Production frontend
  'https://rozgar-hackathon.onrender.com' // Production backend (for same-origin)
];
```

#### 2. Enhanced CORS Configuration
Added more headers and options for better compatibility:

```javascript
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['set-cookie'],
  preflightContinue: false,      // Stop preflight at CORS middleware
  optionsSuccessStatus: 204      // Return 204 for successful OPTIONS
}));
```

**Key Changes:**
- Added `PATCH` to methods
- Added `X-Requested-With`, `Accept`, `Origin` to allowed headers
- Set `preflightContinue: false` to handle OPTIONS at CORS middleware
- Set `optionsSuccessStatus: 204` for proper preflight response

#### 3. Explicit OPTIONS Handler
Added explicit handling for all OPTIONS requests:

```javascript
// Handle preflight requests explicitly
app.options('*', cors());
```

This ensures all preflight (OPTIONS) requests are handled before reaching route handlers.

---

## 🚀 Deployment Steps

### 1. Deploy Backend to Render.com

```bash
# Commit changes
git add backend/server.js
git commit -m "fix: Update CORS configuration for production"
git push origin main
```

Render will automatically redeploy when it detects changes.

**Or manually redeploy:**
1. Go to https://render.com/dashboard
2. Find your service "rozgar-hackathon"
3. Click "Manual Deploy" → "Deploy latest commit"

### 2. Verify Backend Environment Variables

Ensure these are set in Render.com:

```env
PORT=4000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
SESSION_SECRET=your_session_secret_key
NODE_ENV=production
```

### 3. Frontend Configuration

Verify your frontend `.env.production` or Vercel environment variables:

```env
VITE_API_BASE_URL=https://rozgar-hackathon.onrender.com
```

**Set in Vercel:**
1. Go to Vercel Dashboard → Your Project
2. Settings → Environment Variables
3. Add: `VITE_API_BASE_URL` = `https://rozgar-hackathon.onrender.com`
4. Redeploy frontend

---

## 🧪 Testing

### 1. Check Backend is Running

```bash
curl https://rozgar-hackathon.onrender.com/
```

Expected response:
```json
{
  "message": "Rozgar API is running",
  "version": "1.0.0",
  "endpoints": {...}
}
```

### 2. Test CORS Preflight

```bash
curl -X OPTIONS https://rozgar-hackathon.onrender.com/api/auth/login \
  -H "Origin: https://rozgar-hackathon.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type, Authorization" \
  -v
```

Should return:
- Status: `204 No Content`
- Header: `Access-Control-Allow-Origin: https://rozgar-hackathon.vercel.app`
- Header: `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH`
- Header: `Access-Control-Allow-Credentials: true`

### 3. Test Login from Production

Open browser console on `https://rozgar-hackathon.vercel.app`:

```javascript
fetch('https://rozgar-hackathon.onrender.com/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'testpassword'
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

---

## 🐛 Troubleshooting

### Issue 1: Still Getting CORS Error

**Check:**
1. Backend is deployed and running
2. Environment variables are set correctly
3. Frontend is using correct API URL

**Solution:**
Clear browser cache and hard refresh (Ctrl+Shift+R)

### Issue 2: 502 Bad Gateway on Render

**Cause:** Render service might be sleeping (free tier)

**Solution:**
1. Wait 30-60 seconds for service to wake up
2. Check Render logs for errors
3. Verify MongoDB connection string is correct

### Issue 3: Credentials Not Working

**Check CORS config includes:**
- `credentials: true`
- Frontend sends `credentials: 'include'` in fetch requests

**Update frontend API calls:**
```javascript
fetch(url, {
  method: 'POST',
  credentials: 'include', // Important!
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(data)
})
```

### Issue 4: No 'Access-Control-Allow-Origin' Header

**Cause:** CORS middleware not running or error in origin validation

**Debug:**
1. Check Render logs for CORS errors
2. Verify allowed origins list
3. Test with browser's origin value

**Quick Fix (temporary):**
For testing only, allow all origins:

```javascript
app.use(cors({
  origin: true, // Allow all origins (NOT for production!)
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));
```

---

## 📝 Additional Render.com Configuration

### Create render.yaml (Optional)

Create `/backend/render.yaml`:

```yaml
services:
  - type: web
    name: rozgar-backend
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 4000
```

### Health Check Endpoint

Add to server.js:

```javascript
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

Configure in Render Dashboard:
- Health Check Path: `/health`
- Health Check Interval: 30 seconds

---

## 🔒 Security Notes

### Production Best Practices

1. **Never use `origin: '*'` in production**
   - Always specify allowed origins
   - Validate origin against whitelist

2. **Use HTTPS Only**
   - Ensure all production URLs use HTTPS
   - Set `cookie: { secure: true }` in production

3. **Limit Allowed Headers**
   - Only include necessary headers
   - Avoid allowing all headers

4. **Rate Limiting**
   Add rate limiting to prevent abuse:

```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

5. **Environment Variables**
   - Never commit secrets to Git
   - Use Render's environment variable manager
   - Rotate secrets regularly

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] Backend responds at root URL
- [ ] OPTIONS requests return 204
- [ ] CORS headers present in responses
- [ ] Login works from production frontend
- [ ] Token authentication works
- [ ] All API endpoints accessible
- [ ] No CORS errors in browser console
- [ ] MongoDB connection successful
- [ ] Environment variables loaded correctly

---

## 📚 References

- [Express CORS Middleware](https://expressjs.com/en/resources/middleware/cors.html)
- [MDN - CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Render.com Docs](https://render.com/docs)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

---

## 🆘 Still Having Issues?

### Check Render Logs

```bash
# In Render Dashboard
Services → rozgar-hackathon → Logs
```

Look for:
- CORS errors
- MongoDB connection errors
- Port binding errors
- Environment variable issues

### Test Backend Locally with Production Config

```bash
cd backend
NODE_ENV=production PORT=4000 npm start
```

Then test from another terminal:

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Origin: https://rozgar-hackathon.vercel.app" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

---

## 📊 Summary

**Files Modified:**
- ✅ `/backend/server.js` - Enhanced CORS configuration

**Changes:**
1. Added Render backend URL to allowed origins
2. Enhanced CORS headers and methods
3. Added explicit OPTIONS handler
4. Set proper preflight options

**Next Steps:**
1. Commit and push changes
2. Wait for Render auto-deploy (or manual deploy)
3. Verify CORS headers in browser Network tab
4. Test login from production frontend

---

**Last Updated:** October 15, 2025  
**Status:** ✅ Ready for Production Deployment
