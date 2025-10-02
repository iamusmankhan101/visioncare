import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../redux/slices/productSlice';

const ProductIdDebugger = () => {
  const dispatch = useDispatch();
  const { items: products, status, error } = useSelector(state => state.products);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  if (status === 'loading') {
    return (
      <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <h1>Product ID Debugger</h1>
        <p>Loading products...</p>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <h1>Product ID Debugger</h1>
        <div style={{ backgroundColor: '#ffe8e8', padding: '1rem', borderRadius: '8px' }}>
          <h3 style={{ color: '#d63031', margin: '0 0 1rem 0' }}>Error Loading Products</h3>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>Product ID Debugger</h1>
      <p>This shows all available product IDs in your <strong>Vercel database</strong>:</p>
      <p style={{ fontSize: '0.9rem', color: '#666' }}>
        Backend: <code>https://vision-care-hmn4.vercel.app</code>
      </p>
      
      <div style={{ 
        backgroundColor: '#e8f5e8', 
        padding: '1rem', 
        borderRadius: '8px', 
        margin: '1rem 0'
      }}>
        <h3 style={{ margin: '0 0 0.5rem 0', color: '#2d5a2d' }}>Database Summary</h3>
        <p style={{ margin: '0.25rem 0', fontSize: '0.9rem', color: '#2d5a2d' }}>
          <strong>Total Products:</strong> {products?.length || 0}
        </p>
        <p style={{ margin: '0.25rem 0', fontSize: '0.9rem', color: '#2d5a2d' }}>
          <strong>Status:</strong> {status}
        </p>
      </div>

      {products && products.length > 0 ? (
        <div style={{ display: 'grid', gap: '1rem', marginTop: '2rem' }}>
          <div style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '1rem', 
            borderRadius: '8px',
            overflowX: 'auto'
          }}>
            <h3 style={{ margin: '0 0 1rem 0' }}>Available Product IDs</h3>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse',
              fontSize: '0.9rem'
            }}>
              <thead>
                <tr style={{ backgroundColor: '#e9ecef' }}>
                  <th style={{ padding: '0.5rem', textAlign: 'left', border: '1px solid #dee2e6' }}>ID</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left', border: '1px solid #dee2e6' }}>_ID</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left', border: '1px solid #dee2e6' }}>Name</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left', border: '1px solid #dee2e6' }}>ID Type</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left', border: '1px solid #dee2e6' }}>Category</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left', border: '1px solid #dee2e6' }}>Price</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, index) => {
                  const productId = product.id || product._id;
                  return (
                    <tr key={productId || index} style={{ 
                      backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white' 
                    }}>
                      <td style={{ padding: '0.5rem', border: '1px solid #dee2e6' }}>
                        <code>{product.id || 'N/A'}</code>
                      </td>
                      <td style={{ padding: '0.5rem', border: '1px solid #dee2e6' }}>
                        <code>{product._id || 'N/A'}</code>
                      </td>
                      <td style={{ padding: '0.5rem', border: '1px solid #dee2e6' }}>
                        {product.name || 'Unnamed Product'}
                      </td>
                      <td style={{ padding: '0.5rem', border: '1px solid #dee2e6' }}>
                        <code>{typeof productId}</code>
                      </td>
                      <td style={{ padding: '0.5rem', border: '1px solid #dee2e6' }}>
                        {product.category || 'N/A'}
                      </td>
                      <td style={{ padding: '0.5rem', border: '1px solid #dee2e6' }}>
                        ${product.price || 'N/A'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={{ 
            backgroundColor: '#fff3cd', 
            padding: '1rem', 
            borderRadius: '8px', 
            border: '1px solid #ffeaa7'
          }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#856404' }}>Deletion Tips</h3>
            <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#856404' }}>
              <li>Only delete products that appear in the table above</li>
              <li>Use the exact ID shown in the "ID" or "_ID" column</li>
              <li>If you get "Product not found" errors, the product may have already been deleted</li>
              <li>Refresh this page to see the current state of your database</li>
            </ul>
          </div>
        </div>
      ) : (
        <div style={{ 
          backgroundColor: '#ffe8e8', 
          padding: '1rem', 
          borderRadius: '8px', 
          margin: '1rem 0' 
        }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#d63031' }}>No Products Found</h3>
          <p style={{ margin: '0', color: '#d63031', fontSize: '0.9rem' }}>
            Your database appears to be empty. Add some products first before trying to delete them.
          </p>
        </div>
      )}

      <div style={{ marginTop: '3rem', textAlign: 'center' }}>
        <button
          onClick={() => dispatch(fetchProducts())}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#48b2ee',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '1rem',
            marginRight: '1rem'
          }}
        >
          🔄 Refresh Products
        </button>
        <a
          href="/admin"
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#28a745',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
            fontSize: '1rem'
          }}
        >
          ← Back to Admin
        </a>
      </div>
    </div>
  );
};

export default ProductIdDebugger;
