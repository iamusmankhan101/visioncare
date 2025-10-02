import React from 'react';
import { Link } from 'react-router-dom';
import { generateUniqueSlug } from '../utils/slugUtils';

const ProductDetailTest = () => {
  // Sample products for testing
  const testProducts = [
    { id: 1, name: "Classic Aviator Sunglasses" },
    { id: 2, name: "Eco-Friendly Bamboo Frames" },
    { id: 3, name: "Bold Statement Glasses" },
    { id: 4, name: "Retro Round Glasses" },
    { id: 5, name: "Street Style Urban Frames" },
    { id: 6, name: "Artsy Designer Frames" }
  ];

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Product Detail Page Test</h1>
      <p>Click on any product link below to test the product detail page:</p>
      
      <div style={{ display: 'grid', gap: '1rem', marginTop: '2rem' }}>
        {testProducts.map(product => {
          const slug = generateUniqueSlug(product.name, product.id);
          return (
            <div key={product.id} style={{ 
              padding: '1rem', 
              border: '1px solid #ddd', 
              borderRadius: '8px',
              backgroundColor: '#f9f9f9'
            }}>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>
                {product.name}
              </h3>
              <p style={{ margin: '0 0 1rem 0', color: '#666', fontSize: '0.9rem' }}>
                Slug: <code>{slug}</code>
              </p>
              <Link 
                to={`/products/${slug}`}
                style={{
                  display: 'inline-block',
                  padding: '0.5rem 1rem',
                  backgroundColor: '#48b2ee',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '4px',
                  fontSize: '0.9rem'
                }}
              >
                View Product Details →
              </Link>
            </div>
          );
        })}
      </div>
      
      <div style={{ marginTop: '3rem', padding: '1rem', backgroundColor: '#e8f5e8', borderRadius: '8px' }}>
        <h3 style={{ margin: '0 0 1rem 0', color: '#2d5a2d' }}>Debug Information</h3>
        <p style={{ margin: '0', color: '#2d5a2d', fontSize: '0.9rem' }}>
          If a product detail page shows blank, check the browser console for debug logs. 
          The page will show "Product Not Found" if the slug doesn't match any products.
        </p>
      </div>
      
      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <Link 
          to="/"
          style={{
            color: '#48b2ee',
            textDecoration: 'none',
            fontSize: '1rem'
          }}
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
};

export default ProductDetailTest;
