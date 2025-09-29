@echo off
echo 🚀 Deploying Eyewear Website to Railway + Netlify
echo.

echo 📝 Step 1: Committing changes to Git...
git add .
git commit -m "Deploy to Railway and Netlify"

echo 📤 Step 2: Pushing to GitHub...
git push origin main

echo.
echo ✅ Code pushed to GitHub!
echo.
echo 🚂 Next Steps:
echo    1. Go to Railway.app and deploy from your GitHub repo
echo    2. Set Root Directory to: server
echo    3. Copy your Railway URL (e.g., https://your-app.railway.app)
echo.
echo 🌐 Then for Netlify:
echo    1. Go to Netlify.com and deploy from your GitHub repo
echo    2. Set Build Command: npm run build
echo    3. Set Publish Directory: build
echo    4. Add environment variables with your Railway URL
echo.
echo 📖 Full guide: RAILWAY_NETLIFY_DEPLOYMENT.md
echo.
pause
