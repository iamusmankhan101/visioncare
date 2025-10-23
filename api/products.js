// Vercel Serverless Function for Products API with Neon PostgreSQL
import { neon } from '@neondatabase/serverless';

// Initialize Neon database connection
const sql = neon(process.env.DATABASE_URL);

// Helper function to transform database product to frontend format
function transformProduct(product) {
  console.log('🔧 Transforming product:', product?.id, product?.name);
  
  if (!product) {
    console.error('❌ Product is null or undefined');
    return null;
  }

  try {
    // Start with basic transformation
    const transformed = {
      ...product,
      frameColor: product.framecolor || null,
      lensTypes: product.lenstypes || null,
      colorImages: null,
      colors: [],
      sizes: null,
      gallery: null,
      features: null
    };

    // Safely parse colorImages
    if (product.colorimages && typeof product.colorimages === 'string') {
      try {
        if (product.colorimages.trim().startsWith('{') || product.colorimages.trim().startsWith('[')) {
          transformed.colorImages = JSON.parse(product.colorimages);
          console.log('✅ Parsed colorImages for product:', product.id, 'Keys:', Object.keys(transformed.colorImages || {}));
        }
      } catch (e) {
        console.warn('⚠️ Failed to parse colorImages for product:', product.id, e.message);
        console.warn('⚠️ Raw colorImages data:', product.colorimages);
      }
    } else if (product.colorimages && typeof product.colorimages === 'object') {
      // Handle case where colorImages is already an object
      transformed.colorImages = product.colorimages;
      console.log('✅ Using object colorImages for product:', product.id, 'Keys:', Object.keys(transformed.colorImages || {}));
    }

    // Safely create colors array
    if (product.color && typeof product.color === 'string') {
      try {
        const colorNames = product.color.split(',').map(c => c.trim()).filter(c => c.length > 0);
        const colorMap = {
          'Black': '#000000', 'Brown': '#8B4513', 'Gold': '#FFD700', 'Silver': '#C0C0C0',
          'Blue': '#0066CC', 'Red': '#CC0000', 'Green': '#00CC00', 'Purple': '#6600CC',
          'Pink': '#FF69B4', 'Clear': '#FFFFFF', 'Tortoiseshell': '#8B4513', 'Gray': '#808080'
        };

        transformed.colors = colorNames.map(colorName => {
          const colorObj = {
            name: colorName,
            hex: colorMap[colorName] || '#000000',
            image: product.image || null
          };
          
          // Add color-specific image if available
          if (transformed.colorImages && transformed.colorImages[colorName]) {
            const colorImage = transformed.colorImages[colorName];
            colorObj.image = Array.isArray(colorImage) ? colorImage[0] : colorImage;
            console.log(`🎨 Assigned color-specific image for ${colorName}:`, colorObj.image);
          } else {
            console.log(`⚠️ No color-specific image found for ${colorName}, using default:`, colorObj.image);
          }
          
          return colorObj;
        });
        console.log('✅ Created colors array for product:', product.id, 'colors:', transformed.colors.length);
      } catch (e) {
        console.warn('⚠️ Failed to create colors array for product:', product.id, e.message);
        transformed.colors = [];
      }
    }

    // Safely parse other JSON fields
    ['sizes', 'gallery', 'features'].forEach(field => {
      if (product[field] && typeof product[field] === 'string') {
        try {
          if (product[field].trim().startsWith('[') || product[field].trim().startsWith('{')) {
            transformed[field] = JSON.parse(product[field]);
          } else {
            transformed[field] = product[field];
          }
        } catch (e) {
          console.warn(`⚠️ Failed to parse ${field} for product:`, product.id, e.message);
          transformed[field] = product[field];
        }
      }
    });

    // Transform discount from decimal to object format expected by frontend
    if (product.discount && parseFloat(product.discount) > 0) {
      transformed.discount = {
        hasDiscount: true,
        discountPercentage: parseFloat(product.discount)
      };
      console.log('✅ Transformed discount for product:', product.id, 'discount:', transformed.discount);
    } else {
      transformed.discount = {
        hasDiscount: false,
        discountPercentage: 0
      };
    }

    console.log('✅ Successfully transformed product:', product.id);
    return transformed;

  } catch (error) {
    console.error('❌ Critical error transforming product:', product?.id, error.message);
    console.error('❌ Error stack:', error.stack);
    
    // Return minimal safe transformation
    return {
      ...product,
      frameColor: product.framecolor || null,
      lensTypes: product.lenstypes || null,
      colorImages: null,
      colors: [],
      sizes: product.sizes || null,
      gallery: product.gallery || null,
      features: product.features || null
    };
  }
}

// Database initialization function
async function initializeDatabase() {
  try {
    console.log('🔧 Initializing database schema...');
    
    // Ensure products table exists with all required columns
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
        updated_at TIMESTAMP DEFAULT NOW(),
        framecolor VARCHAR(100),
        style VARCHAR(100),
        rim VARCHAR(100),
        gender VARCHAR(50),
        type VARCHAR(100),
        featured BOOLEAN DEFAULT false,
        bestseller BOOLEAN DEFAULT false,
        sizes TEXT,
        lenstypes TEXT,
        discount DECIMAL(5,2),
        colorimages TEXT
      )
    `;
    
    console.log('✅ Products table created/verified with all columns');

    // Add missing columns if they don't exist (for existing tables)
    try {
      console.log('🔧 Adding missing columns to existing products table...');
      
      // Add ALL potentially missing columns
      await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS original_price DECIMAL(10,2)`;
      await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS color VARCHAR(100)`;
      await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS size VARCHAR(50)`;
      await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS framecolor VARCHAR(100)`;
      await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS style VARCHAR(100)`;
      await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS rim VARCHAR(100)`;
      await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS gender VARCHAR(50)`;
      await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS type VARCHAR(100)`;
      await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false`;
      await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS bestseller BOOLEAN DEFAULT false`;
      await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS sizes TEXT`;
      await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS lenstypes TEXT`;
      await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS discount DECIMAL(5,2)`;
      await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS colorimages TEXT`;
      
      console.log('✅ Database schema updated successfully - all columns added');
    } catch (alterError) {
      console.error('⚠️ Some columns may already exist or failed to add:', alterError.message);
    }

    // Ensure comments table exists
    await sql`
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        comment TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    
    console.log('✅ Database initialization completed');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

// CORS headers - Allow multiple origins for API access
const getAllowedOrigins = () => {
  return [
    'https://visioncare-sigma.vercel.app',
    'https://vision-care-hmn4.vercel.app',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000'
  ];
};

const corsHeaders = {
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Allow-Credentials': 'true'
};

export default async function handler(req, res) {
  // Handle dynamic CORS origin
  const origin = req.headers.origin;
  const allowedOrigins = getAllowedOrigins();
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    // Fallback to allow all origins for now
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  
  // Add other CORS headers
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    console.log(`🌐 API Request: ${req.method} /api/products`);
    console.log(`🔍 Query params:`, req.query);
    
    // Initialize database schema on every request to ensure it exists
    await initializeDatabase();
    
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
    console.error('❌ API Error:', error);
    console.error('❌ Error name:', error.name);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    
    // Check if it's a database connection error
    if (error.message.includes('column') && error.message.includes('does not exist')) {
      console.error('🔧 Database schema issue detected - attempting to fix...');
    }
    
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message,
      details: error.name
    });
  }
}

// GET - Fetch all products
async function handleGet(req, res) {
  try {
    console.log('📦 GET /api/products - Fetching products');

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
      // Transform database field names to frontend-expected field names
      console.log('🔧 Transforming single product:', result[0]?.id, result[0]?.name);
      const transformedProduct = transformProduct(result[0]);
      console.log('✅ Successfully transformed single product:', transformedProduct?.id);
      
      return res.json({
        success: true,
        data: transformedProduct
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
      
      // Transform database field names to frontend-expected field names
      console.log('🔧 Transforming search results:', result.length, 'products');
      const transformedProducts = result.map(transformProduct).filter(p => p !== null);
      console.log('✅ Successfully transformed search results:', transformedProducts.length, 'products');
      
      return res.json({
        success: true,
        data: transformedProducts,
        count: transformedProducts.length,
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
      
      // Transform database field names to frontend-expected field names
      console.log('🔧 Transforming category results:', result.length, 'products');
      const transformedProducts = result.map(transformProduct).filter(p => p !== null);
      console.log('✅ Successfully transformed category results:', transformedProducts.length, 'products');
      
      return res.json({
        success: true,
        products: transformedProducts,
        count: transformedProducts.length,
        category
      });
    }
    
    // Get all products
    const result = await sql`SELECT * FROM products ORDER BY created_at DESC`;
    
    // Transform database field names to frontend-expected field names
    console.log('🔧 Transforming', result.length, 'products');
    const transformedProducts = result.map(transformProduct).filter(p => p !== null);
    console.log('✅ Successfully transformed', transformedProducts.length, 'products');
    
    return res.json({
      success: true,
      products: transformedProducts,
      count: transformedProducts.length,
      source: 'neon'
    });
    
  } catch (error) {
    throw error;
  }
}

// POST - Create new product
async function handlePost(req, res) {
  try {
    console.log('📦 POST /api/products - Creating new product');
    console.log('🔍 Request body keys:', Object.keys(req.body));
    console.log('🔍 Request body:', JSON.stringify(req.body, null, 2));
    
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
      status = 'active',
      framecolor,
      frameColor, // Handle both naming conventions
      style,
      rim,
      gender,
      type,
      featured = false,
      bestseller = false,
      sizes,
      lenstypes,
      lensTypes, // Handle both naming conventions
      discount,
      colorimages,
      colorImages // Handle both naming conventions
    } = req.body;
    
    console.log('📦 Creating product:', name);
    console.log('💰 Price:', price);
    console.log('📂 Category:', category);
    console.log('🔍 Debug fields - gender:', gender);
    console.log('🔍 Debug fields - style:', style);
    console.log('🔍 Debug fields - framecolor:', framecolor);
    console.log('🔍 Debug fields - frameColor:', frameColor);
    
    // Handle field name variations and null values
    const finalFrameColor = framecolor || frameColor || null;
    const finalLensTypes = lenstypes || lensTypes || null;
    const finalColorImages = colorimages || colorImages || null;
    const finalGender = gender || 'Unisex';
    const finalStyle = style || 'Classic';
    const finalStatus = status || 'active';
    
    // Convert arrays to JSON strings if they exist
    const finalSize = size ? (Array.isArray(size) ? JSON.stringify(size) : size) : null;
    const finalSizes = sizes ? (Array.isArray(sizes) ? JSON.stringify(sizes) : sizes) : null;
    const finalLensTypesStr = finalLensTypes ? (Array.isArray(finalLensTypes) ? JSON.stringify(finalLensTypes) : finalLensTypes) : null;
    const finalGallery = gallery ? (Array.isArray(gallery) ? JSON.stringify(gallery) : gallery) : null;
    const finalFeatures = features ? (Array.isArray(features) ? JSON.stringify(features) : features) : null;
    const finalColorImagesStr = finalColorImages ? (typeof finalColorImages === 'object' ? JSON.stringify(finalColorImages) : finalColorImages) : null;
    
    // Process discount - convert from object format to decimal for database storage
    let finalDiscount = 0;
    if (discount && typeof discount === 'object' && discount.hasDiscount && discount.discountPercentage) {
      finalDiscount = parseFloat(discount.discountPercentage);
    } else if (discount && typeof discount === 'number') {
      finalDiscount = parseFloat(discount);
    } else if (discount && typeof discount === 'string') {
      finalDiscount = parseFloat(discount) || 0;
    }
    console.log('💰 Discount processing - raw:', discount, 'final:', finalDiscount);
    
    console.log('🔧 Final processed values:');
    console.log('  - color (raw):', color);
    console.log('  - image (raw):', image);
    console.log('  - gallery (raw):', gallery);
    console.log('  - gallery (processed):', finalGallery);
    console.log('  - colorimages (raw):', colorimages);
    console.log('  - colorimages (processed):', finalColorImagesStr);
    console.log('  - size (raw):', size);
    console.log('  - size (processed):', finalSize);
    console.log('  - sizes (raw):', sizes);
    console.log('  - sizes (processed):', finalSizes);
    console.log('  - framecolor:', finalFrameColor);
    console.log('  - gender:', finalGender);
    console.log('  - style:', finalStyle);
    console.log('  - status:', finalStatus);
    
    // Insert new product with all fields
    const result = await sql`
      INSERT INTO products (
        name, price, original_price, category, brand, material, 
        shape, color, size, image, gallery, description, 
        features, specifications, status, framecolor, style, rim,
        gender, type, featured, bestseller, sizes, lenstypes,
        discount, colorimages
      ) VALUES (
        ${name}, ${price}, ${original_price}, ${category}, ${brand}, 
        ${material}, ${shape}, ${color}, ${finalSize}, ${image}, 
        ${finalGallery}, ${description}, ${finalFeatures}, ${specifications}, ${finalStatus},
        ${finalFrameColor}, ${finalStyle}, ${rim}, ${finalGender}, ${type}, ${featured},
        ${bestseller}, ${finalSizes}, ${finalLensTypesStr}, ${finalDiscount}, ${finalColorImagesStr}
      ) RETURNING *
    `;
    
    console.log('✅ Product created successfully:', result[0].name);
    
    // Transform database field names to frontend-expected field names
    console.log('🔧 Transforming created product:', result[0]?.id, result[0]?.name);
    const transformedProduct = transformProduct(result[0]);
    console.log('✅ Successfully transformed created product:', transformedProduct?.id);
    
    return res.status(201).json({
      success: true,
      data: transformedProduct,
      message: 'Product created successfully'
    });
    
  } catch (error) {
    console.error('❌ Error creating product:', error);
    console.error('❌ Error name:', error.name);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    
    // Check for specific database errors
    if (error.message.includes('column') && error.message.includes('does not exist')) {
      console.error('🔧 Database column missing:', error.message);
      
      // Try to fix the missing column immediately
      try {
        const columnMatch = error.message.match(/column "(\w+)"/);
        if (columnMatch) {
          const missingColumn = columnMatch[1];
          console.log(`🔧 Attempting to add missing column: ${missingColumn}`);
          
          // Add the missing column based on common column types
          const columnDefinitions = {
            'size': 'VARCHAR(50)',
            'color': 'VARCHAR(100)',
            'original_price': 'DECIMAL(10,2)',
            'framecolor': 'VARCHAR(100)',
            'style': 'VARCHAR(100)',
            'rim': 'VARCHAR(100)',
            'gender': 'VARCHAR(50)',
            'type': 'VARCHAR(100)',
            'featured': 'BOOLEAN DEFAULT false',
            'bestseller': 'BOOLEAN DEFAULT false',
            'sizes': 'TEXT',
            'lenstypes': 'TEXT',
            'discount': 'DECIMAL(5,2)',
            'colorimages': 'TEXT'
          };
          
          const columnType = columnDefinitions[missingColumn] || 'TEXT';
          const alterQuery = `ALTER TABLE products ADD COLUMN IF NOT EXISTS ${missingColumn} ${columnType}`;
          await sql.unsafe(alterQuery);
          console.log(`✅ Successfully added missing column: ${missingColumn}`);
          
          return res.status(500).json({
            success: false,
            error: 'Database schema fixed',
            message: `Missing column "${missingColumn}" has been added. Please try your request again.`,
            details: 'The database schema has been automatically updated.'
          });
        }
      } catch (fixError) {
        console.error('❌ Failed to fix missing column:', fixError.message);
      }
      
      return res.status(500).json({
        success: false,
        error: 'Database schema error',
        message: `Missing database column: ${error.message}`,
        details: 'The database table is missing required columns. Please check the schema.'
      });
    }
    
    if (error.message.includes('relation') && error.message.includes('does not exist')) {
      console.error('🔧 Database table missing:', error.message);
      return res.status(500).json({
        success: false,
        error: 'Database table error',
        message: 'The products table does not exist',
        details: 'Database initialization may have failed'
      });
    }
    
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
      status,
      framecolor,
      style,
      rim,
      gender,
      type,
      featured,
      bestseller,
      sizes,
      lenstypes,
      discount,
      colorimages
    } = req.body;
    
    // Process discount - convert from object format to decimal for database storage
    let finalDiscount = 0;
    if (discount && typeof discount === 'object' && discount.hasDiscount && discount.discountPercentage) {
      finalDiscount = parseFloat(discount.discountPercentage);
    } else if (discount && typeof discount === 'number') {
      finalDiscount = parseFloat(discount);
    } else if (discount && typeof discount === 'string') {
      finalDiscount = parseFloat(discount) || 0;
    }
    console.log('💰 Update discount processing - raw:', discount, 'final:', finalDiscount);
    
    // Update product with all fields
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
        framecolor = ${framecolor},
        style = ${style},
        rim = ${rim},
        gender = ${gender},
        type = ${type},
        featured = ${featured},
        bestseller = ${bestseller},
        sizes = ${sizes},
        lenstypes = ${lenstypes},
        discount = ${finalDiscount},
        colorimages = ${colorimages},
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
    
    console.log('🗑️ DELETE request received for product ID:', id);
    console.log('🗑️ ID type:', typeof id);
    console.log('🗑️ Full query params:', req.query);
    
    if (!id) {
      console.log('❌ No ID provided in DELETE request');
      return res.status(400).json({
        success: false,
        error: 'Product ID is required'
      });
    }
    
    // First check if product exists
    console.log('🔍 Checking if product exists...');
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
    
    // Delete product
    console.log('🗑️ Deleting product from database...');
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
    console.error('❌ Error in handleDelete:', error);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    throw error;
  }
}
