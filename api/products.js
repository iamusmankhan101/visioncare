// Vercel Serverless Function for Products API with Neon PostgreSQL
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
    console.error('API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}

// GET - Fetch all products
async function handleGet(req, res) {
  try {
    // Ensure products table exists
    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        original_price DECIMAL(10,2),
        category VARCHAR(100),
        brand VARCHAR(100),
        material VARCHAR(100),
        shape VARCHAR(100),
        color VARCHAR(100),
        size VARCHAR(50),
        image TEXT,
        gallery TEXT,
        description TEXT,
        features TEXT,
        specifications TEXT,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Ensure comments table exists
    await sql`
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        comment TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Check for specific product ID in query
    const { id, search, category } = req.query;
    
    if (id) {
      // Get single product
      const result = await sql`SELECT * FROM products WHERE id = ${id}`;
      if (result.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Product not found'
        });
      }
      return res.json({
        success: true,
        data: result[0]
      });
    }
    
    if (search) {
      // Search products
      const result = await sql`
        SELECT * FROM products 
        WHERE name ILIKE ${`%${search}%`} 
        OR category ILIKE ${`%${search}%`}
        OR brand ILIKE ${`%${search}%`}
        ORDER BY created_at DESC
      `;
      
      return res.json({
        success: true,
        data: result,
        count: result.length,
        query: search
      });
    }
    
    if (category) {
      // Get products by category
      const result = await sql`
        SELECT * FROM products 
        WHERE category ILIKE ${`%${category}%`}
        ORDER BY created_at DESC
      `;
      
      return res.json({
        success: true,
        data: result,
        count: result.length,
        category
      });
    }
    
    // Get all products
    const result = await sql`SELECT * FROM products ORDER BY created_at DESC`;
    
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

// POST - Create new product
async function handlePost(req, res) {
  try {
    const {
      name,
      price,
      original_price,
      category,
      brand,
      material,
      shape,
      color,
      size,
      image,
      gallery,
      description,
      features,
      specifications,
      status = 'active'
    } = req.body;
    
    // Insert new product
    const result = await sql`
      INSERT INTO products (
        name, price, original_price, category, brand, material, 
        shape, color, size, image, gallery, description, 
        features, specifications, status
      ) VALUES (
        ${name}, ${price}, ${original_price}, ${category}, ${brand}, 
        ${material}, ${shape}, ${color}, ${size}, ${image}, 
        ${gallery}, ${description}, ${features}, ${specifications}, ${status}
      ) RETURNING *
    `;
    
    return res.status(201).json({
      success: true,
      data: result[0],
      message: 'Product created successfully'
    });
    
  } catch (error) {
    throw error;
  }
}

// PUT - Update product
async function handlePut(req, res) {
  try {
    const { id } = req.query;
    const {
      name,
      price,
      original_price,
      category,
      brand,
      material,
      shape,
      color,
      size,
      image,
      gallery,
      description,
      features,
      specifications,
      status
    } = req.body;
    
    // Update product
    const result = await sql`
      UPDATE products SET 
        name = ${name},
        price = ${price},
        original_price = ${original_price},
        category = ${category},
        brand = ${brand},
        material = ${material},
        shape = ${shape},
        color = ${color},
        size = ${size},
        image = ${image},
        gallery = ${gallery},
        description = ${description},
        features = ${features},
        specifications = ${specifications},
        status = ${status},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    
    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    return res.json({
      success: true,
      data: result[0],
      message: 'Product updated successfully'
    });
    
  } catch (error) {
    throw error;
  }
}

// DELETE - Delete product
async function handleDelete(req, res) {
  try {
    const { id } = req.query;
    
    // Delete product
    const result = await sql`
      DELETE FROM products 
      WHERE id = ${id} 
      RETURNING *
    `;
    
    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    return res.json({
      success: true,
      message: 'Product deleted successfully'
    });
    
  } catch (error) {
    throw error;
  }
}
