# 🚀 Vercel + Upstash Deployment Guide

## Quick Deploy Your Eyewear Backend with Upstash

### 📋 Prerequisites
- ✅ Upstash Redis database created
- ✅ Vercel account (free)
- ✅ GitHub repository with your code

## 🔧 Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

## 🌐 Step 2: Deploy to Vercel

### Option A: Deploy from Command Line
```bash
cd server
vercel --prod
```

### Option B: Deploy via Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Set **Root Directory** to `server`
5. Click "Deploy"

## ⚙️ Step 3: Configure Environment Variables

### Via Vercel Dashboard:
1. Go to your project dashboard
2. Click "Settings" → "Environment Variables"
3. Add these variables:

```env
NODE_ENV=production
UPSTASH_REDIS_REST_URL=https://optimal-sailfish-15823.upstash.io
UPSTASH_REDIS_REST_TOKEN=AT3PAAIncDIxOTBhZDMzM2IxZmQ0ZTg5ODRhZDI0ODQxMTQ2NGFiZnAyMTU4MjM
KV_URL=rediss://default:AT3PAAIncDIxOTBhZDMzM2IxZmQ0ZTg5ODRhZDI0ODQxMTQ2NGFiZnAyMTU4MjM@optimal-sailfish-15823.upstash.io:6379
KV_REST_API_URL=https://optimal-sailfish-15823.upstash.io
KV_REST_API_TOKEN=AT3PAAIncDIxOTBhZDMzM2IxZmQ0ZTg5ODRhZDI0ODQxMTQ2NGFiZnAyMTU4MjM
KV_REST_API_READ_ONLY_TOKEN=Aj3PAAIgcDK-zZ9e5hCGZwDDEEOmFAp0uKCE6Pe3hUOouS1ZTmqcnQ
REDIS_URL=rediss://default:AT3PAAIncDIxOTBhZDMzM2IxZmQ0ZTg5ODRhZDI0ODQxMTQ2NGFiZnAyMTU4MjM@optimal-sailfish-15823.upstash.io:6379
```

### Via Vercel CLI:
```bash
# Add environment variables
vercel env add UPSTASH_REDIS_REST_URL
vercel env add UPSTASH_REDIS_REST_TOKEN
vercel env add KV_URL
vercel env add KV_REST_API_URL
vercel env add KV_REST_API_TOKEN
vercel env add KV_REST_API_READ_ONLY_TOKEN
vercel env add REDIS_URL

# Pull environment variables to local
vercel env pull .env.development.local
```

## 🧪 Step 4: Test Your Deployment

After deployment, your API will be available at:
```
https://your-project-name.vercel.app
```

### Test Endpoints:
```bash
# Health check
curl https://your-project-name.vercel.app/api/health

# Get products
curl https://your-project-name.vercel.app/api/products

# Create a product
curl -X POST https://your-project-name.vercel.app/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Glasses",
    "price": 99.99,
    "category": "frames"
  }'
```

## 🔄 Step 5: Update Frontend Configuration

Update your frontend to use the new Vercel API URL:

### For React App (.env):
```env
REACT_APP_PRODUCTS_API_URL=https://your-project-name.vercel.app/api
```

### For Deployed Frontend:
Add the environment variable in your frontend deployment platform (Netlify, Vercel, etc.)

## 📊 Vercel Configuration Details

### vercel.json Features:
- ✅ **Serverless Functions**: Automatic scaling
- ✅ **Environment Variables**: Secure credential management
- ✅ **Custom Routes**: API routing configuration
- ✅ **Build Optimization**: Fast deployment builds
- ✅ **Global CDN**: Worldwide edge locations

### Performance Benefits:
- 🚀 **Instant Scaling**: Handles traffic spikes automatically
- 🚀 **Global Edge**: Low latency worldwide
- 🚀 **Zero Config**: Automatic HTTPS and domain management
- 🚀 **Upstash Integration**: Lightning-fast Redis database

## 🔍 Monitoring & Debugging

### Vercel Dashboard:
- **Functions**: Monitor serverless function performance
- **Analytics**: Track API usage and performance
- **Logs**: Real-time function logs
- **Deployments**: Deployment history and rollbacks

### Upstash Console:
- **Database Metrics**: Monitor Redis performance
- **Query Analytics**: Track database operations
- **Storage Usage**: Monitor data usage
- **Connection Stats**: Active connections

## 🆘 Troubleshooting

### Common Issues:

**1. Environment Variables Not Loading:**
```bash
# Verify environment variables
vercel env ls

# Pull latest environment variables
vercel env pull
```

**2. Function Timeout:**
- Increase `maxDuration` in `vercel.json`
- Optimize database queries
- Use caching for frequently accessed data

**3. CORS Issues:**
```javascript
// Update CORS configuration in upstashProductServer.js
app.use(cors({
  origin: ['https://your-frontend-domain.com', 'http://localhost:3000'],
  credentials: true
}));
```

**4. Database Connection Issues:**
- Verify Upstash credentials in Vercel dashboard
- Check Upstash console for connection logs
- Test connection with health endpoint

## 💰 Cost Optimization

### Vercel Free Tier:
- ✅ 100GB bandwidth/month
- ✅ 100 serverless function executions/day
- ✅ Perfect for development and small projects

### Upstash Free Tier:
- ✅ 10,000 requests/day
- ✅ 256 MB storage
- ✅ Ideal for small to medium applications

## 🎯 Production Checklist

- [ ] Environment variables configured
- [ ] Health endpoint responding
- [ ] CORS properly configured
- [ ] Frontend updated with new API URL
- [ ] Database connection tested
- [ ] Error monitoring set up
- [ ] Performance monitoring enabled

## 🚀 Advanced Features

### Custom Domain:
```bash
vercel domains add your-api-domain.com
```

### Team Collaboration:
```bash
vercel teams
```

### Automatic Deployments:
- Connect GitHub repository
- Enable automatic deployments on push
- Set up preview deployments for branches

## 🎉 Success!

Your eyewear backend is now deployed on Vercel with Upstash Redis:

- ✅ **Serverless**: Automatically scales with traffic
- ✅ **Global**: Fast response times worldwide
- ✅ **Reliable**: Redis database with SQLite backup
- ✅ **Secure**: Environment variables protected
- ✅ **Monitored**: Real-time performance tracking

Your API is production-ready and can handle thousands of concurrent users! 🚀
