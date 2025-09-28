# Backend Setup Guide

This guide will help you migrate from localStorage-based product storage to a proper backend API with SQLite database.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Seed the Database
```bash
cd server
node seedProducts.js
```

### 3. Start the Product Server
```bash
npm run dev:products
```

### 4. Update Environment Variables
Create a `.env` file in the root directory:
```bash
# Backend API URLs
REACT_APP_PRODUCTS_API_URL=http://localhost:5004/api
```

## 📋 What Changed

### ✅ Before (localStorage)
- Products stored in browser localStorage
- Data lost when clearing browser data
- No cross-browser synchronization
- Limited to ~5-10MB storage
- Client-side only

### ✅ After (Backend API)
- Products stored in SQLite database
- Persistent data across sessions
- Centralized data management
- Unlimited storage capacity
- Proper backend architecture

## 🛠 Backend Architecture

### Product Server (Port 5004)
- **Database**: SQLite (`server/products.db`)
- **API Base**: `http://localhost:5004/api`
- **Endpoints**:
  - `GET /products` - Get all products
  - `GET /products/:id` - Get single product
  - `POST /products` - Create new product
  - `PUT /products/:id` - Update product
  - `DELETE /products/:id` - Delete product
  - `GET /health` - Health check

### Database Schema
```sql
CREATE TABLE products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  price REAL NOT NULL,
  category TEXT,
  material TEXT,
  shape TEXT,
  style TEXT,
  frameColor TEXT,
  description TEXT,
  image TEXT,
  gallery TEXT, -- JSON string
  colors TEXT, -- JSON string
  features TEXT, -- JSON string
  lensTypes TEXT, -- JSON string
  sizes TEXT, -- JSON string
  discount TEXT, -- JSON string
  status TEXT DEFAULT 'In Stock',
  featured BOOLEAN DEFAULT 0,
  bestSeller BOOLEAN DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🔄 Migration Features

### Automatic Fallback
- If backend is unavailable, falls back to localStorage backup
- Graceful error handling with user-friendly messages
- Offline functionality maintained

### Data Backup
- Automatically backs up data to localStorage
- Ensures data availability during server downtime
- Seamless transition between online/offline modes

## 📡 API Usage Examples

### Get All Products
```javascript
fetch('http://localhost:5004/api/products')
  .then(response => response.json())
  .then(products => console.log(products));
```

### Create New Product
```javascript
fetch('http://localhost:5004/api/products', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'New Glasses',
    price: 99.99,
    category: 'Eyeglasses',
    // ... other fields
  })
});
```

### Update Product
```javascript
fetch('http://localhost:5004/api/products/1', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Updated Glasses',
    price: 129.99,
    // ... other fields
  })
});
```

### Delete Product
```javascript
fetch('http://localhost:5004/api/products/1', {
  method: 'DELETE'
});
```

## 🔧 Development Scripts

```bash
# Start product server
npm run products

# Start with auto-reload
npm run dev:products

# Start all servers (including existing ones)
npm run all

# Seed database with sample products
node seedProducts.js
```

## 🚨 Troubleshooting

### Server Won't Start
1. Check if port 5004 is available
2. Ensure SQLite3 is installed: `npm install sqlite3`
3. Check database permissions in `server/` directory

### Database Issues
1. Delete `server/products.db` and re-run `node seedProducts.js`
2. Check database file permissions
3. Ensure SQLite3 native bindings are compiled correctly

### API Connection Issues
1. Verify server is running on http://localhost:5004
2. Check CORS settings if accessing from different domain
3. Ensure `.env` file has correct `REACT_APP_PRODUCTS_API_URL`

### Frontend Fallback
If you see "Backend API failed, using localStorage backup" in console:
1. Check if product server is running
2. Verify API URL in environment variables
3. Check network connectivity

## 🔄 Rollback Plan

If you need to rollback to localStorage:
1. Comment out the new API calls in `src/api/productApi.js`
2. Uncomment the old localStorage functions
3. The app will work as before with localStorage

## 🎯 Next Steps

1. **Production Deployment**: Replace SQLite with PostgreSQL/MySQL
2. **Authentication**: Add JWT-based API authentication
3. **File Upload**: Implement proper image upload to cloud storage
4. **Caching**: Add Redis caching for better performance
5. **Monitoring**: Add logging and monitoring tools

## 📞 Support

If you encounter issues:
1. Check the console logs for detailed error messages
2. Verify all dependencies are installed
3. Ensure ports 5004 is available
4. Check the `server/products.db` file exists after seeding

## 🎉 Success Indicators

✅ **Backend Working**: Console shows "🌐 API Request" logs  
✅ **Database Connected**: Products appear in admin panel  
✅ **CRUD Operations**: Can add/edit/delete products  
✅ **Fallback Working**: App works even when server is down  

The migration is complete when you see API request logs in the browser console and can perform all CRUD operations through the admin panel.
