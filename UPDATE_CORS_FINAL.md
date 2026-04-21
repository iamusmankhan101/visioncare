# 🔗 Final Integration Step: Update CORS with Netlify URL

## 🎯 What You Need to Do:

### Step 1: Get Your Netlify URL
After deploying to Netlify, you'll get a URL like:
- `https://your-site-name.netlify.app`
- `https://amazing-project-123.netlify.app`

### Step 2: Update CORS Configuration
In `server/productServer.js`, replace this line:
```javascript
'https://your-netlify-site.netlify.app', // Replace with your actual Netlify URL when you get it
```

With your actual Netlify URL:
```javascript
'https://your-actual-netlify-url.netlify.app', // Your real Netlify URL
```

### Step 3: Push Changes to Railway
```bash
git add .
git commit -m "Add Netlify URL to CORS configuration"
git push origin main
```

This will trigger a Railway redeploy with the updated CORS settings.

## 🧪 Test Complete Integration:

### 1. Test Railway Backend:
- Health: `https://web-production-5f625.up.railway.app/api/health`
- Products: `https://web-production-5f625.up.railway.app/api/products`

### 2. Test Netlify Frontend:
- Visit your Netlify site
- Go to admin panel
- Try loading products (should connect to Railway)
- Check browser console for CORS errors

### 3. Test Full Flow:
- Browse products on Netlify site
- Add products via admin panel
- Place test orders
- Verify data flows between Netlify ↔ Railway

## ✅ Success Indicators:
- ✅ Netlify site loads without errors
- ✅ Admin panel connects to Railway backend
- ✅ Products load from Railway database
- ✅ No CORS errors in browser console
- ✅ Orders can be placed and saved to Railway

## 🎉 Final Result:
Your eyewear website will be fully live with:
- **Frontend**: Netlify (React app)
- **Backend**: Railway (Express API + SQLite)
- **Admin Panel**: Full product/order management
- **Integration**: Seamless data flow between platforms
