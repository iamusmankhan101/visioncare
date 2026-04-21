// Vercel Serverless Function for Individual Product Operations (GET, PUT, DELETE)
import { neon } from '@neondatabase/serverless';

// Initialize Neon database connection
const sql = neon(process.env.DATABASE_URL);

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Allow-Credentials': 'false'
};

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    Object.entries(corsHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
    return res.status(200).json({});
  }

  // Add CORS headers
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  const { id } = req.query;

  try {
    switch (req.method) {
      case 'GET':
        return await handleGetSingle(req, res, id);
      case 'PUT':
        return await handlePut(req, res, id);
      case 'DELETE':
        return await handleDelete(req, res, id);
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

// GET - Get single product by ID
async function handleGetSingle(req, res, id) {
  try {
    console.log('🔍 Getting product with ID:', id);
    
    const result = await sql`SELECT * FROM products WHERE id = ${id}`;
    
    if (result.length === 0) {
      console.log('❌ Product not found:', id);
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    console.log('✅ Product found:', result[0].name);
    return res.json({
      success: true,
      data: result[0]
    });
    
  } catch (error) {
    console.error('❌ Error getting product:', error);
    throw error;
  }
}

// PUT - Update product by ID
async function handlePut(req, res, id) {
  try {
    console.log('✏️ Updating product with ID:', id);
    
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
      console.log('❌ Product not found for update:', id);
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    console.log('✅ Product updated successfully:', result[0].name);
    return res.json({
      success: true,
      data: result[0],
      message: 'Product updated successfully'
    });
    
  } catch (error) {
    console.error('❌ Error updating product:', error);
    throw error;
  }
}

// DELETE - Delete product by ID
async function handleDelete(req, res, id) {
  try {
    console.log('🗑️ Deleting product with ID:', id);
    console.log('🗑️ ID type:', typeof id);
    
    // First, check if product exists
    const existingProduct = await sql`SELECT * FROM products WHERE id = ${id}`;
    
    if (existingProduct.length === 0) {
      console.log('❌ Product not found for deletion:', id);
      return res.status(404).json({
        success: false,
        error: 'Product not found',
        message: 'Product not found'
      });
    }
    
    console.log('📦 Found product to delete:', existingProduct[0].name);
    
    // Delete the product
    const result = await sql`
      DELETE FROM products 
      WHERE id = ${id} 
      RETURNING *
    `;
    
    console.log('✅ Product deleted successfully:', result[0].name);
    
    return res.json({
      success: true,
      message: 'Product deleted successfully',
      data: result[0]
    });
    
  } catch (error) {
    console.error('❌ Error deleting product:', error);
    console.error('❌ Error details:', error.message);
    throw error;
  }
}
