// Vercel Serverless Function for Comments API with Neon PostgreSQL
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
      case 'DELETE':
        return await handleDelete(req, res);
      default:
        return res.status(405).json({ 
          success: false, 
          error: 'Method not allowed' 
        });
    }
  } catch (error) {
    console.error('Comments API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}

// GET - Fetch all comments
async function handleGet(req, res) {
  try {
    // Ensure comments table exists
    await sql`
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        comment TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    const { limit = 50 } = req.query;
    
    // Get all comments
    const result = await sql`
      SELECT * FROM comments 
      ORDER BY created_at DESC 
      LIMIT ${parseInt(limit)}
    `;
    
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

// POST - Create new comment
async function handlePost(req, res) {
  try {
    const { comment } = req.body;
    
    if (!comment || comment.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Comment cannot be empty'
      });
    }
    
    // Insert new comment
    const result = await sql`
      INSERT INTO comments (comment) 
      VALUES (${comment.trim()}) 
      RETURNING *
    `;
    
    return res.status(201).json({
      success: true,
      data: result[0],
      message: 'Comment created successfully'
    });
    
  } catch (error) {
    throw error;
  }
}

// DELETE - Delete comment
async function handleDelete(req, res) {
  try {
    const { id } = req.query;
    
    // Delete comment
    const result = await sql`
      DELETE FROM comments 
      WHERE id = ${id} 
      RETURNING *
    `;
    
    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Comment not found'
      });
    }
    
    return res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
    
  } catch (error) {
    throw error;
  }
}
