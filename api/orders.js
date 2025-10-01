// Vercel Serverless Function for Orders API with Neon PostgreSQL
const { neon } = require('@neondatabase/serverless');

// Initialize Neon database connection
const sql = neon(process.env.DATABASE_URL);

// CORS headers - Allow all origins for API access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Allow-Credentials': 'false'
};

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  // Add CORS headers
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  try {
    switch (req.method) {
      case 'GET':
        return await handleGet(req, res);
      case 'POST':
        return await handlePost(req, res);
      case 'PUT':
        return await handlePut(req, res);
      case 'DELETE':
        return await handleDelete(req, res);
      default:
        return res.status(405).json({ 
          success: false, 
          error: 'Method not allowed' 
        });
    }
  } catch (error) {
    console.error('Orders API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}

// GET - Fetch all orders
async function handleGet(req, res) {
  try {
    // Ensure orders table exists
    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        order_number VARCHAR(100) UNIQUE NOT NULL,
        customer_name VARCHAR(255),
        customer_email VARCHAR(255),
        customer_phone VARCHAR(50),
        total DECIMAL(10,2),
        status VARCHAR(50) DEFAULT 'pending',
        items JSONB,
        shipping_address JSONB,
        payment_method VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    const { id, status, search, limit = 100 } = req.query;
    
    if (id) {
      // Get single order by order_number or id
      const result = await sql`
        SELECT * FROM orders 
        WHERE order_number = ${id} OR id = ${id}
        LIMIT 1
      `;
      
      if (result.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Order not found'
        });
      }
      
      return res.json({
        success: true,
        data: result[0]
      });
    }
    
    // Build query with filters
    let query = `SELECT * FROM orders WHERE 1=1`;
    const params = [];
    
    if (status) {
      query += ` AND status = $${params.length + 1}`;
      params.push(status);
    }
    
    if (search) {
      query += ` AND (customer_name ILIKE $${params.length + 1} OR customer_email ILIKE $${params.length + 2} OR order_number ILIKE $${params.length + 3})`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1}`;
    params.push(parseInt(limit));
    
    // Execute query - using template literal for dynamic query
    const result = await sql`SELECT * FROM orders ORDER BY created_at DESC LIMIT ${parseInt(limit)}`;
    
    return res.json({
      success: true,
      data: result,
      count: result.length,
      source: 'neon'
    });
    
  } catch (error) {
    throw error;
  }
}

// POST - Create new order
async function handlePost(req, res) {
  try {
    const {
      orderNumber = `ORD-${Date.now()}`,
      customerName,
      customerEmail,
      customerPhone,
      total,
      status = 'pending',
      items,
      shippingAddress,
      paymentMethod
    } = req.body;
    
    // Insert new order
    const result = await sql`
      INSERT INTO orders (
        order_number, customer_name, customer_email, customer_phone,
        total, status, items, shipping_address, payment_method
      ) VALUES (
        ${orderNumber}, ${customerName}, ${customerEmail}, ${customerPhone},
        ${total}, ${status}, ${JSON.stringify(items)}, ${JSON.stringify(shippingAddress)}, ${paymentMethod}
      ) RETURNING *
    `;
    
    return res.status(201).json({
      success: true,
      data: result[0],
      message: 'Order created successfully'
    });
    
  } catch (error) {
    throw error;
  }
}

// PUT - Update order
async function handlePut(req, res) {
  try {
    const { id } = req.query;
    const {
      status,
      customerName,
      customerEmail,
      customerPhone,
      total,
      items,
      shippingAddress,
      paymentMethod
    } = req.body;
    
    // Update order
    const result = await sql`
      UPDATE orders SET 
        status = ${status},
        customer_name = ${customerName},
        customer_email = ${customerEmail},
        customer_phone = ${customerPhone},
        total = ${total},
        items = ${items ? JSON.stringify(items) : null},
        shipping_address = ${shippingAddress ? JSON.stringify(shippingAddress) : null},
        payment_method = ${paymentMethod},
        updated_at = NOW()
      WHERE id = ${id} OR order_number = ${id}
      RETURNING *
    `;
    
    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }
    
    return res.json({
      success: true,
      data: result[0],
      message: 'Order updated successfully'
    });
    
  } catch (error) {
    throw error;
  }
}

// DELETE - Delete order
async function handleDelete(req, res) {
  try {
    const { id } = req.query;
    
    // Delete order
    const result = await sql`
      DELETE FROM orders 
      WHERE id = ${id} OR order_number = ${id}
      RETURNING *
    `;
    
    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }
    
    return res.json({
      success: true,
      message: 'Order deleted successfully'
    });
    
  } catch (error) {
    throw error;
  }
}
