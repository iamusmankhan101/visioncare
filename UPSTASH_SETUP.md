# 🚀 Upstash Database Setup Guide

## What is Upstash?
Upstash is a serverless Redis database that's perfect for:
- ✅ **Fast caching** - Lightning-fast data retrieval
- ✅ **Session storage** - User sessions and authentication
- ✅ **Real-time data** - Product inventory, order tracking
- ✅ **Analytics** - Page views, user interactions
- ✅ **Scalable** - Automatically scales with your traffic

## 🔧 Setup Instructions

### Step 1: Get Your Upstash Credentials
1. Go to [console.upstash.com](https://console.upstash.com)
2. Sign up/login with GitHub or email
3. Click **"Create Database"**
4. Choose:
   - **Name**: `eyewearr-db`
   - **Region**: Choose closest to your users
   - **Type**: Regional (free tier)
5. Click **"Create"**

### Step 2: Get Connection Details
After creating the database:
1. Click on your database name
2. Copy these values:
   - **UPSTASH_REDIS_REST_URL**: `https://your-db-name.upstash.io`
   - **UPSTASH_REDIS_REST_TOKEN**: `your-token-here`

### Step 3: Configure Environment Variables

#### For Local Development:
Create `.env` file in the `server/` directory:
```env
# Upstash Redis Configuration
UPSTASH_REDIS_REST_URL=https://your-db-name.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here
```

#### For Production Deployment:
Add these environment variables to your hosting platform:

**Railway:**
```bash
UPSTASH_REDIS_REST_URL=https://your-db-name.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here
```

**Vercel:**
```bash
UPSTASH_REDIS_REST_URL=https://your-db-name.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here
```

**Netlify:**
```bash
UPSTASH_REDIS_REST_URL=https://your-db-name.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here
```

### Step 4: Install Dependencies
```bash
cd server
npm install @upstash/redis
```

### Step 5: Start the Upstash Server
```bash
# Development mode with auto-restart
npm run dev:upstash

# Production mode
npm run upstash
```

## 🧪 Test Your Setup

### 1. Health Check
Visit: `http://localhost:5004/api/health`

Should return:
```json
{
  "status": "OK",
  "message": "Upstash Product API Server is running",
  "upstash": {
    "status": "connected",
    "message": "Upstash Redis is healthy"
  }
}
```

### 2. Test Product Storage
```bash
# Create a test product
curl -X POST http://localhost:5004/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Glasses",
    "price": 99.99,
    "category": "frames"
  }'

# Get all products
curl http://localhost:5004/api/products
```

## 🔄 Migration from SQLite

Your app now uses **hybrid storage**:
- **Primary**: Upstash Redis (fast, scalable)
- **Backup**: SQLite (local fallback)

### Benefits:
- ✅ **Faster performance** with Redis caching
- ✅ **Cross-browser compatibility** (no more IndexedDB issues)
- ✅ **Scalable** for high traffic
- ✅ **Reliable** with SQLite backup
- ✅ **Real-time** data synchronization

## 📊 What's Stored in Upstash

### Products:
- Product details and inventory
- Categories and brands
- Image galleries
- Search indexes

### Orders:
- Order history and status
- Customer information
- Order analytics

### Analytics:
- Product view counts
- Popular categories
- User behavior data

### Cache:
- Frequently accessed data
- API response caching
- Session data

## 🚀 Deployment Options

### Option 1: Railway (Recommended)
1. Push your code to GitHub
2. Connect Railway to your repository
3. Set environment variables in Railway dashboard
4. Deploy automatically

### Option 2: Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel --prod`
3. Set environment variables in Vercel dashboard

### Option 3: Netlify Functions
1. Create `netlify.toml` configuration
2. Deploy via Netlify CLI or GitHub integration

## 🔍 Monitoring & Analytics

### Upstash Console:
- Real-time database metrics
- Query performance
- Storage usage
- Connection statistics

### API Endpoints:
- `/api/analytics/stats` - Product statistics
- `/api/health` - System health check
- `/api/products/search/:query` - Search functionality

## 🆘 Troubleshooting

### Connection Issues:
1. **Check credentials**: Verify URL and token are correct
2. **Network**: Ensure your hosting platform can reach Upstash
3. **Fallback**: App will use SQLite if Upstash is unavailable

### Performance:
1. **Caching**: Upstash automatically caches frequently accessed data
2. **Indexing**: Products are indexed by category and brand
3. **Compression**: Large data is automatically compressed

### Debugging:
```bash
# Enable debug logging
DEBUG=upstash:* npm run dev:upstash
```

## 💰 Pricing

### Free Tier:
- ✅ 10,000 requests/day
- ✅ 256 MB storage
- ✅ Perfect for development and small sites

### Paid Plans:
- 🚀 Unlimited requests
- 🚀 More storage
- 🚀 Advanced analytics
- 🚀 Multiple regions

## 🎉 Next Steps

1. **Test your setup** with the health check endpoint
2. **Deploy your backend** to your preferred platform
3. **Update frontend** to use the new API URL
4. **Monitor performance** in Upstash console
5. **Scale up** as your traffic grows

Your eyewear app is now powered by Upstash for lightning-fast performance! 🚀
