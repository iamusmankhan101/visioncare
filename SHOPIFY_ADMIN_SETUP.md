# Shopify-like Admin Backend Setup Guide

This guide will help you set up and run the Shopify-like admin backend system that integrates with your existing eyewear website.

## 🚀 Quick Start

### 1. Start the Admin Backend Server

```bash
cd server
npm run dev:admin
```

The admin backend will run on `http://localhost:5003`

### 2. Access the Admin Dashboard

Navigate to: `http://localhost:3000/admin/shopify`

## 📋 Features Overview

### ✅ Completed Features

1. **Store Management**
   - Create and manage multiple stores
   - Customize store themes and colors
   - Store settings and configuration

2. **Vendor Management**
   - Add and manage vendors
   - Approve/reject vendor applications
   - Track vendor performance and revenue

3. **Order Management**
   - View and manage all orders
   - Update order status and tracking
   - Order analytics and reporting

4. **Inventory Management**
   - Track product inventory
   - Low stock alerts
   - Stock adjustments and movements

5. **Analytics Dashboard**
   - Sales analytics and reporting
   - Revenue tracking
   - Customer insights
   - Top products analysis

## 🗄️ Database Structure

The system creates the following tables automatically:

- `stores` - Store information and settings
- `vendors` - Vendor profiles and status
- `vendor_products` - Products with vendor association
- `admin_orders` - Enhanced order management
- `admin_order_items` - Order line items
- `inventory_movements` - Stock tracking
- `analytics_data` - Analytics and reporting data

## 🔧 API Endpoints

### Store Management
- `GET /api/stores` - Get all stores
- `POST /api/stores` - Create new store
- `PUT /api/stores/:id` - Update store

### Vendor Management
- `GET /api/vendors` - Get all vendors
- `POST /api/vendors` - Create new vendor
- `PATCH /api/vendors/:id/status` - Update vendor status

### Product Management
- `GET /api/products` - Get all products
- `POST /api/products` - Create new product
- `PATCH /api/products/:id/inventory` - Update inventory

### Order Management
- `GET /api/orders` - Get orders with pagination
- `PATCH /api/orders/:id/status` - Update order status

### Analytics
- `GET /api/analytics/dashboard` - Get dashboard metrics
- `GET /api/analytics/sales` - Get sales data

### Inventory
- `GET /api/inventory/low-stock` - Get low stock products
- `GET /api/inventory/movements` - Get inventory movements

## 🔐 Configuration

### Environment Variables

Copy `server/.env.example` to `server/.env` and configure:

```env
ADMIN_PORT=5003
DATABASE_PATH=../src/database.sqlite
JWT_SECRET=your_jwt_secret_key_here
```

## 🎯 Integration with Existing Website

The admin backend is designed to work alongside your existing eyewear website:

1. **Shared Database**: Uses the same SQLite database as your main application
2. **API Integration**: Frontend components connect to `http://localhost:5003/api/*`
3. **Redux Integration**: Uses existing Redux store with new slices for admin functionality

## 📊 Admin Dashboard Navigation

Access different sections via the sidebar:

- **Overview** - Dashboard with key metrics
- **Store Builder** - Create and customize stores
- **Orders** - Manage all orders
- **Vendors** - Vendor management
- **Products** - Inventory management
- **Analytics** - Detailed reporting

## 🔄 Running Multiple Servers

You can run multiple servers simultaneously:

```bash
# Terminal 1 - Main React App
npm start

# Terminal 2 - Admin Backend
cd server
npm run dev:admin

# Terminal 3 - Notification Server (if needed)
cd server
npm run dev:notifications

# Terminal 4 - WhatsApp Server (if needed)
cd server
npm run dev:whatsapp
```

## 🛠️ Development Commands

```bash
# Start admin backend in development mode
npm run dev:admin

# Start admin backend in production mode
npm run admin

# Check admin backend health
curl http://localhost:5003/api/health
```

## 📈 Next Steps

### Pending Features (Future Development)

1. **Authentication & Authorization**
   - JWT-based authentication
   - Role-based access control
   - Admin user management

2. **Payment Processing**
   - Stripe integration
   - PayPal integration
   - Multiple payment gateways

3. **Advanced Features**
   - Email notifications
   - Advanced reporting
   - Customer support tools
   - Multi-language support

## 🐛 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Change port in server/.env
   ADMIN_PORT=5004
   ```

2. **Database Connection Issues**
   - Ensure SQLite database exists in `src/database.sqlite`
   - Check database permissions

3. **CORS Issues**
   - Admin backend includes CORS middleware
   - Ensure frontend makes requests to correct port

### Health Check

Visit `http://localhost:5003/api/health` to verify the server is running.

## 📝 Notes

- The admin backend runs independently of your main React application
- All data is stored in the same SQLite database for consistency
- The system is designed to scale and can be extended with additional features
- Redux slices are already connected and ready to use

## 🎉 Success!

Your Shopify-like admin backend is now ready! Access the admin dashboard at:
`http://localhost:3000/admin/shopify`

The backend API is running at:
`http://localhost:5003`
