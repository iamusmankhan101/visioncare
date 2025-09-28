# Backend Deployment Guide

## 🚀 Deploy Your Backend API

Your backend is ready to deploy! Here are the best options:

## Option 1: Railway (Recommended - Free & Easy)

### Step 1: Prepare Your Code
✅ Files already created:
- `server/railway.json` - Railway configuration
- `server/Procfile` - Process file
- `server/.env.production` - Production environment variables

### Step 2: Deploy to Railway
1. **Sign up**: Go to [railway.app](https://railway.app) and sign up with GitHub
2. **Create New Project**: Click "New Project" → "Deploy from GitHub repo"
3. **Select Repository**: Choose your eyewearr repository
4. **Configure**:
   - Root Directory: `server`
   - Start Command: `npm run products`
   - Port: `5004`
5. **Deploy**: Railway will automatically build and deploy

### Step 3: Get Your API URL
After deployment, Railway will give you a URL like:
```
https://your-app-name.railway.app
```

### Step 4: Update Frontend
Add this environment variable to your frontend deployment:
```
REACT_APP_PRODUCTS_API_URL=https://your-app-name.railway.app/api
```

---

## Option 2: Heroku

### Step 1: Install Heroku CLI
Download from [heroku.com/cli](https://devcenter.heroku.com/articles/heroku-cli)

### Step 2: Deploy
```bash
cd server
heroku create your-eyewearr-api
git init
git add .
git commit -m "Initial backend deployment"
heroku git:remote -a your-eyewearr-api
git push heroku main
```

### Step 3: Set Environment Variables
```bash
heroku config:set NODE_ENV=production
heroku config:set PORT=5004
```

---

## Option 3: Render

1. Go to [render.com](https://render.com)
2. Connect your GitHub repository
3. Create a new "Web Service"
4. Configure:
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `npm run products`
   - Environment: `NODE_ENV=production`

---

## Option 4: Vercel (Serverless)

### Step 1: Create vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server/productServer.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "server/productServer.js"
    }
  ]
}
```

### Step 2: Deploy
```bash
npm install -g vercel
vercel --prod
```

---

## 🔧 After Deployment

### Update Frontend Environment
Once your backend is deployed, update your frontend with the API URL:

**For Netlify/Vercel Frontend:**
1. Go to your deployment dashboard
2. Add environment variable:
   ```
   REACT_APP_PRODUCTS_API_URL=https://your-backend-url.com/api
   ```
3. Redeploy your frontend

**For Local Development:**
Create `.env` file in your frontend root:
```
REACT_APP_PRODUCTS_API_URL=https://your-backend-url.com/api
```

### Test Your Deployment
Visit: `https://your-backend-url.com/api/health`
Should return: `{"status":"OK","message":"Product API Server is running"}`

---

## 🎉 Success!

After deployment:
- ✅ Your backend API will be live
- ✅ Mobile and desktop will show the same products
- ✅ Admin panel will show "🌐 Live Data"
- ✅ All CRUD operations will work with real database

## 🆘 Need Help?

If you encounter issues:
1. Check deployment logs in your platform dashboard
2. Verify environment variables are set
3. Test the health endpoint
4. Check CORS settings if needed

Choose your preferred platform and follow the steps above!
