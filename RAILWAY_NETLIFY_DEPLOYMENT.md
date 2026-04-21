# 🚀 Railway Backend + Netlify Frontend Deployment Guide

## Overview
This guide will help you deploy your eyewear website with:
- **Backend**: Railway (server/productServer.js)
- **Frontend**: Netlify (React app)

## 📋 Prerequisites
- Railway account (https://railway.app)
- Netlify account (https://netlify.com)
- GitHub repository with your code

---

## 🚂 Step 1: Deploy Backend to Railway

### 1.1 Prepare Your Repository
```bash
# Make sure all changes are committed
git add .
git commit -m "Prepare for Railway deployment"
git push origin main
```

### 1.2 Deploy to Railway
1. **Login to Railway**: https://railway.app
2. **Create New Project**: Click "New Project"
3. **Deploy from GitHub**: Select your repository
4. **Configure Service**:
   - **Root Directory**: `server`
   - **Start Command**: `npm run products`
   - **Port**: Railway will auto-detect from `process.env.PORT`

### 1.3 Environment Variables (Optional)
In Railway dashboard, add these if needed:
```
NODE_ENV=production
PORT=5004
```

### 1.4 Get Your Railway URL
After deployment, Railway will provide a URL like:
```
https://your-app-name.railway.app
```
**Save this URL - you'll need it for the frontend!**

---

## 🌐 Step 2: Configure Frontend for Production

### 2.1 Update Environment Variables
Update your `.env` file with the Railway URL:

```env
# Local development URLs (for local development)
REACT_APP_API_URL=http://localhost:5001/api/products
REACT_APP_API_BASE_URL=http://localhost:5001

# Products API (new backend)
REACT_APP_PRODUCTS_API_URL=http://localhost:5004/api

# Production API URLs - Update with your Railway URL
REACT_APP_API_URL=https://your-app-name.railway.app/api/products
REACT_APP_API_BASE_URL=https://your-app-name.railway.app
REACT_APP_PRODUCTS_API_URL=https://your-app-name.railway.app/api
```

### 2.2 Update CORS Configuration
In `server/productServer.js`, replace the placeholder with your actual Netlify URL:
```javascript
origin: [
  'http://localhost:3000',
  'http://localhost:3001', 
  'https://your-actual-netlify-site.netlify.app', // Replace this!
  /\.netlify\.app$/, // Allow any Netlify subdomain
  /\.railway\.app$/ // Allow Railway domains
],
```

---

## 🌍 Step 3: Deploy Frontend to Netlify

### 3.1 Build Settings
In Netlify dashboard:
- **Build Command**: `npm run build`
- **Publish Directory**: `build`
- **Node Version**: `18`

### 3.2 Environment Variables
In Netlify dashboard, add these environment variables:
```
REACT_APP_API_URL=https://your-app-name.railway.app/api/products
REACT_APP_API_BASE_URL=https://your-app-name.railway.app
REACT_APP_PRODUCTS_API_URL=https://your-app-name.railway.app/api
```

### 3.3 Deploy Methods

#### Option A: Continuous Deployment (Recommended)
1. Connect your GitHub repository to Netlify
2. Set branch to `main`
3. Netlify will auto-deploy on every push

#### Option B: Manual Deployment
```bash
# Build the project locally
npm run build

# Deploy the build folder to Netlify
# (Use Netlify CLI or drag & drop in dashboard)
```

---

## 🔗 Step 4: Connect Backend and Frontend

### 4.1 Update CORS with Actual URLs
After getting your Netlify URL (e.g., `https://amazing-site-123.netlify.app`):

1. **Update productServer.js**:
```javascript
origin: [
  'http://localhost:3000',
  'http://localhost:3001', 
  'https://amazing-site-123.netlify.app', // Your actual Netlify URL
  /\.netlify\.app$/, 
  /\.railway\.app$/
],
```

2. **Redeploy Railway**: Push changes to trigger Railway redeploy

### 4.2 Update Frontend Environment
1. **Update Netlify Environment Variables** with your actual Railway URL
2. **Trigger Netlify Redeploy**

---

## 🧪 Step 5: Test the Connection

### 5.1 Test Backend API
Visit your Railway URL:
```
https://your-app-name.railway.app/api/health
```
Should return: `{"status":"ok","message":"Server is working!"}`

### 5.2 Test Frontend
1. Visit your Netlify site
2. Check browser console for API connection
3. Test admin panel functionality

### 5.3 Test Cross-Origin Requests
1. Open Netlify site
2. Go to admin panel
3. Try to load products - should connect to Railway backend

---

## 🛠️ Troubleshooting

### CORS Errors
```javascript
// Add more specific origins to productServer.js
origin: [
  'https://your-exact-netlify-url.netlify.app',
  'https://deploy-preview-*--your-site.netlify.app', // For preview deploys
  /\.netlify\.app$/
]
```

### Environment Variables Not Working
1. Check Netlify environment variables are set correctly
2. Restart Netlify build after adding variables
3. Verify Railway environment variables

### API Connection Issues
1. Check Railway logs for errors
2. Verify CORS configuration
3. Test API endpoints directly

---

## 📝 Quick Commands

### Railway Deployment
```bash
# From project root
git add .
git commit -m "Deploy to Railway"
git push origin main
```

### Netlify Deployment
```bash
# Build locally
npm run build

# Or push to trigger auto-deploy
git add .
git commit -m "Deploy to Netlify"
git push origin main
```

### Check Deployment Status
- **Railway**: Check dashboard for build logs
- **Netlify**: Check dashboard for deploy logs

---

## 🎯 Final URLs Structure

After successful deployment:
- **Frontend**: `https://your-site.netlify.app`
- **Backend API**: `https://your-app.railway.app/api`
- **Admin Panel**: `https://your-site.netlify.app/admin`
- **Health Check**: `https://your-app.railway.app/api/health`

## 🔐 Security Notes

1. **Environment Variables**: Never commit API URLs to git
2. **CORS**: Only allow your specific domains
3. **HTTPS**: Both Railway and Netlify provide HTTPS by default
4. **API Keys**: Store sensitive keys in Railway environment variables

---

## ✅ Success Checklist

- [ ] Railway backend deployed and accessible
- [ ] Netlify frontend deployed and accessible  
- [ ] CORS configured with actual URLs
- [ ] Environment variables set correctly
- [ ] API connection working from frontend
- [ ] Admin panel functional
- [ ] No console errors on frontend

**Your eyewear website is now live with Railway backend and Netlify frontend!** 🎉
