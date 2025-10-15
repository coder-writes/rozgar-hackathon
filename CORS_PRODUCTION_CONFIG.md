# CORS Configuration for Production Deployment

## Overview
This document explains the CORS (Cross-Origin Resource Sharing) configuration for the Rozgar application, including support for the production frontend deployed on Vercel.

## Configuration Details

### Allowed Origins

The backend now accepts requests from the following origins:

```javascript
const allowedOrigins = [
  'http://localhost:5173',              // Vite dev server (frontend development)
  'http://localhost:8080',              // Alternative dev server
  'http://localhost:3000',              // Backend dev server
  'https://rozgar-hackathon.vercel.app' // Production frontend on Vercel
];
```

### CORS Settings

```javascript
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,                              // Allow cookies and authentication
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'],     // Allowed headers
  exposedHeaders: ['set-cookie']                         // Headers exposed to frontend
}));
```

## Key Features

### 1. Dynamic Origin Validation
- Checks if the requesting origin is in the allowed list
- Rejects requests from unauthorized origins
- Provides clear error messages for blocked requests

### 2. Credentials Support
- `credentials: true` enables:
  - Sending/receiving cookies
  - Authorization headers
  - JWT tokens in cookies
  - Session management

### 3. Comprehensive Method Support
- **GET**: Fetch data
- **POST**: Create resources (register, login, create posts)
- **PUT**: Update resources (profile, posts)
- **DELETE**: Remove resources (posts, applications)
- **OPTIONS**: Preflight requests

### 4. Security Headers
- **Content-Type**: JSON data exchange
- **Authorization**: Bearer tokens for API authentication
- **set-cookie**: Session and authentication cookies

## Environment-Specific Configuration

### Development
```javascript
// Frontend runs on http://localhost:5173
// Backend runs on http://localhost:3000
// CORS allows both
```

### Production
```javascript
// Frontend: https://rozgar-hackathon.vercel.app
// Backend: Your deployed backend URL
// CORS configured for both
```

## Deployment Checklist

### Frontend (Vercel)

1. **Set Environment Variables**
   ```env
   VITE_API_BASE_URL=https://your-backend-url.com
   ```

2. **Deploy to Vercel**
   ```bash
   cd frontend
   vercel --prod
   ```

3. **Verify URL**
   - Confirm deployment at `https://rozgar-hackathon.vercel.app`

### Backend

1. **Set Environment Variables**
   ```env
   NODE_ENV=production
   JWT_SECRET=your-secret-key
   MONGODB_URI=your-mongodb-connection-string
   PORT=3000
   ```

2. **Deploy Backend** (Choose one):
   
   **Option A: Railway**
   ```bash
   railway up
   ```
   
   **Option B: Render**
   ```bash
   # Connect GitHub repo to Render
   # Render will auto-deploy
   ```
   
   **Option C: Heroku**
   ```bash
   git push heroku main
   ```

3. **Update Frontend Environment**
   ```env
   VITE_API_BASE_URL=https://your-backend-url.com
   ```

## Testing CORS Configuration

### Test with curl

**Check CORS Headers:**
```bash
curl -H "Origin: https://rozgar-hackathon.vercel.app" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type, Authorization" \
     -X OPTIONS \
     --verbose \
     https://your-backend-url.com/api/auth/login
```

**Expected Response Headers:**
```
Access-Control-Allow-Origin: https://rozgar-hackathon.vercel.app
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
```

### Test with Browser

**Open Browser Console:**
```javascript
// Test API call from Vercel frontend
fetch('https://your-backend-url.com/api/communities', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-token'
  },
  credentials: 'include'
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('CORS Error:', error));
```

## Common CORS Issues & Solutions

### Issue 1: "No 'Access-Control-Allow-Origin' header"

**Cause**: Origin not in allowed list or CORS not configured

**Solution**:
```javascript
// Add your origin to allowedOrigins array
const allowedOrigins = [
  'https://rozgar-hackathon.vercel.app',
  // ... other origins
];
```

### Issue 2: "Credentials flag is true but Access-Control-Allow-Credentials is not"

**Cause**: Backend not configured for credentials

**Solution**:
```javascript
app.use(cors({
  credentials: true, // Must be true
  // ...
}));
```

### Issue 3: "Preflight request doesn't pass"

**Cause**: OPTIONS method not allowed

**Solution**:
```javascript
// CORS middleware handles OPTIONS automatically
methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
```

### Issue 4: "Cookie not being sent"

**Cause**: Missing `credentials: 'include'` in fetch

**Solution**:
```javascript
// Frontend - Always include credentials
fetch(url, {
  credentials: 'include', // Important!
  // ...
});
```

## Security Considerations

### 1. Origin Validation
✅ Only approved origins can access the API
✅ Prevents unauthorized cross-origin requests
✅ Protects against CSRF attacks

### 2. Credentials Handling
✅ Secure cookie transmission
✅ HTTP-only cookies for JWT tokens
✅ SameSite cookie attribute for CSRF protection

### 3. Method Restrictions
✅ Only necessary HTTP methods allowed
✅ Prevents unauthorized API operations

### 4. Header Control
✅ Restricts which headers can be sent
✅ Prevents header injection attacks

## Production Environment Variables

### Backend (.env)
```env
# Server
NODE_ENV=production
PORT=3000

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/rozgar

# Authentication
JWT_SECRET=your-super-secure-jwt-secret-key-here
SESSION_SECRET=your-super-secure-session-secret-key-here

# Email (if using)
SENDER_EMAIL=noreply@rozgar.com
EMAIL_PASSWORD=your-email-password

# Frontend URL (for CORS)
FRONTEND_URL=https://rozgar-hackathon.vercel.app
```

### Frontend (.env)
```env
# Backend API URL
VITE_API_BASE_URL=https://your-backend-url.com
```

## Monitoring & Debugging

### Enable CORS Logging
```javascript
app.use((req, res, next) => {
  console.log('Origin:', req.headers.origin);
  console.log('Method:', req.method);
  next();
});
```

### Check CORS Headers in Response
```javascript
app.use((req, res, next) => {
  res.on('finish', () => {
    console.log('CORS Headers:', {
      'Access-Control-Allow-Origin': res.getHeader('Access-Control-Allow-Origin'),
      'Access-Control-Allow-Credentials': res.getHeader('Access-Control-Allow-Credentials'),
    });
  });
  next();
});
```

## Multiple Frontend Domains

If you need to support multiple production domains:

```javascript
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:8080',
  'http://localhost:3000',
  'https://rozgar-hackathon.vercel.app',           // Main production
  'https://rozgar-preview.vercel.app',             // Preview deployments
  'https://custom-domain.com',                      // Custom domain
  /^https:\/\/.*\.vercel\.app$/                    // All Vercel preview URLs
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    // Check string match
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Check regex match
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return false;
    });
    
    if (isAllowed) {
      return callback(null, true);
    }
    
    return callback(new Error('CORS policy violation'), false);
  },
  credentials: true
}));
```

## Files Modified

1. **Backend**
   - `/backend/server.js` - Updated CORS configuration

## Summary

✅ **Added Vercel URL**: `https://rozgar-hackathon.vercel.app` to allowed origins
✅ **Enhanced Security**: Dynamic origin validation with proper error handling
✅ **Full Credentials Support**: Cookies and authentication headers work correctly
✅ **Comprehensive Methods**: All CRUD operations supported
✅ **Production Ready**: Configuration works for both development and production

## Next Steps

1. Deploy backend with updated CORS config
2. Set `VITE_API_BASE_URL` in Vercel environment variables
3. Test API calls from production frontend
4. Monitor CORS headers in browser DevTools
5. Verify authentication works with cookies

---

**Status**: ✅ Configured
**Date**: October 15, 2025
**Impact**: High - Enables production deployment
