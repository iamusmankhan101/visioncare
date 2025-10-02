import React from 'react';
import { generateUniqueSlug } from '../utils/slugUtils';

const SlugDebugger = () => {
  // Sample products for testing
  const testProducts = [
    { id: 1, name: "Classic Aviator Sunglasses" },
    { id: 2, name: "Eco-Friendly Bamboo Frames" },
    { id: 3, name: "Bold Statement Glasses" },
    { id: 4, name: "Retro Round Glasses" },
    { id: 5, name: "Street Style Urban Frames" },
    { id: 6, name: "Artsy Designer Frames" },
    { id: 7, name: "Elegant Women's Sunglasses" }
  ];

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Slug Debugger</h1>
      <p>This shows the correct slugs for all products:</p>
      
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
              <p style={{ margin: '0 0 0.5rem 0', color: '#666', fontSize: '0.9rem' }}>
                <strong>ID:</strong> {product.id}
              </p>
              <p style={{ margin: '0 0 1rem 0', color: '#666', fontSize: '0.9rem' }}>
                <strong>Generated Slug:</strong> <code>{slug}</code>
              </p>
              <p style={{ margin: '0', color: '#666', fontSize: '0.9rem' }}>
                <strong>Full URL:</strong> <code>/products/{slug}</code>
              </p>
            </div>
          );
        })}
      </div>
      
      <div style={{ marginTop: '3rem', padding: '1rem', backgroundColor: '#ffe8e8', borderRadius: '8px' }}>
        <h3 style={{ margin: '0 0 1rem 0', color: '#d63031' }}>Current Issue</h3>
        <p style={{ margin: '0', color: '#d63031', fontSize: '0.9rem' }}>
          The URL shows <code>tyu-7</code> but this doesn't match any of our product slugs above.
          The correct slug for product ID 7 should be <code>elegant-womens-sunglasses-7</code>.
        </p>
      </div>
    </div>
  );
};

export default SlugDebugger;
