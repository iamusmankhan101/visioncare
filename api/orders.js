// Vercel Serverless Function for Orders API
export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { method, url } = req;
  const urlPath = url.split('?')[0];

  try {
    // Health check for orders
    if (urlPath === '/api/orders/health') {
      return res.status(200).json({
        status: 'OK',
        message: 'Orders API Server is running on Vercel',
        timestamp: new Date().toISOString()
      });
    }

    // Get all orders (return proper structure for frontend)
    if (method === 'GET' && urlPath === '/api/orders') {
      return res.status(200).json({
        orders: [], // Empty array but proper structure
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: 20
        }
      });
    }

    // Create new order
    if (method === 'POST' && urlPath === '/api/orders') {
      const orderData = req.body;
      
      // Generate order ID and return proper structure
      const orderId = Date.now();
      const orderNumber = orderData.order_number || `ORD-${orderId}`;
      
      return res.status(201).json({
        id: orderId,
        order_number: orderNumber,
        message: 'Order created successfully'
      });
    }

    // Route not found
    return res.status(404).json({
      success: false,
      message: 'Orders API endpoint not found'
    });

  } catch (error) {
    console.error('Orders API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}
