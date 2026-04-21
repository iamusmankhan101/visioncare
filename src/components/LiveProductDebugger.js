import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchProducts } from '../redux/slices/productSlice';
import { generateUniqueSlug } from '../utils/slugUtils';

const LiveProductDebugger = () => {
  const dispatch = useDispatch();
  const { items: products, status, error } = useSelector(state => state.products);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  if (status === 'loading') {
    return (
      <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <h1>Live Product Debugger</h1>
        <p>Loading products from live database...</p>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <h1>Live Product Debugger</h1>
        <div style={{ backgroundColor: '#ffe8e8', padding: '1rem', borderRadius: '8px' }}>
          <h3 style={{ color: '#d63031', margin: '0 0 1rem 0' }}>Error Loading Products</h3>
          <p style={{ color: '#d63031', margin: 0 }}>{error || 'Failed to load products'}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>Live Product Debugger</h1>
      <p>This shows your live database products and their generated URLs:</p>
      
      <div style={{ 
        backgroundColor: '#e8f5e8', 
        padding: '1rem', 
        borderRadius: '8px', 
        margin: '1rem 0' 
      }}>
        <h3 style={{ margin: '0 0 0.5rem 0', color: '#2d5a2d' }}>Database Status</h3>
        <p style={{ margin: '0.25rem 0', fontSize: '0.9rem', color: '#2d5a2d' }}>
          <strong>Status:</strong> {status}
        </p>
        <p style={{ margin: '0.25rem 0', fontSize: '0.9rem', color: '#2d5a2d' }}>
          <strong>Products Found:</strong> {products?.length || 0}
        </p>
        <p style={{ margin: '0.25rem 0', fontSize: '0.9rem', color: '#2d5a2d' }}>
          <strong>Data Source:</strong> {products?.length > 0 ? 'Live Database' : 'No Data'}
        </p>
      </div>

      {products && products.length > 0 && (
        <>
          <div style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '1rem', 
            borderRadius: '8px', 
            margin: '1rem 0' 
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0' }}>First Product Structure</h3>
            <pre style={{ 
              fontSize: '0.8rem', 
              overflow: 'auto', 
              backgroundColor: '#fff', 
              padding: '0.5rem', 
              borderRadius: '4px',
              border: '1px solid #ddd'
            }}>
              {JSON.stringify(products[0], null, 2)}
            </pre>
          </div>

          <div style={{ display: 'grid', gap: '1rem', marginTop: '2rem' }}>
            {products.map((product, index) => {
              const productId = product.id || product._id || index;
              const slug = generateUniqueSlug(product.name || 'Unnamed Product', productId);
              
              return (
                <div key={productId} style={{ 
                  padding: '1rem', 
                  border: '1px solid #ddd', 
                  borderRadius: '8px',
                  backgroundColor: '#f9f9f9'
                }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>
                    {product.name || 'Unnamed Product'}
                  </h3>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem' }}>
                    <div>
                      <p style={{ margin: '0.25rem 0', color: '#666' }}>
                        <strong>ID:</strong> {productId}
                      </p>
                      <p style={{ margin: '0.25rem 0', color: '#666' }}>
                        <strong>ID Type:</strong> {typeof productId}
                      </p>
                      <p style={{ margin: '0.25rem 0', color: '#666' }}>
                        <strong>Price:</strong> ${product.price || 'N/A'}
                      </p>
                      <p style={{ margin: '0.25rem 0', color: '#666' }}>
                        <strong>Category:</strong> {product.category || 'N/A'}
                      </p>
                    </div>
                    
                    <div>
                      <p style={{ margin: '0.25rem 0', color: '#666' }}>
                        <strong>Generated Slug:</strong> <code>{slug}</code>
                      </p>
                      <p style={{ margin: '0.25rem 0', color: '#666' }}>
                        <strong>Full URL:</strong> <code>/products/{slug}</code>
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
                          fontSize: '0.9rem',
                          marginTop: '0.5rem'
                        }}
                      >
                        Test Product Page →
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {(!products || products.length === 0) && (
        <div style={{ 
          backgroundColor: '#ffe8e8', 
          padding: '1rem', 
          borderRadius: '8px', 
          margin: '1rem 0' 
        }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#d63031' }}>No Products Found</h3>
          <p style={{ margin: '0', color: '#d63031', fontSize: '0.9rem' }}>
            Your live database appears to be empty or there's a connection issue.
            Check the browser console for API errors.
          </p>
        </div>
      )}

      <div style={{ marginTop: '3rem', textAlign: 'center' }}>
        <Link
          to="/"
          style={{
            color: '#48b2ee',
            textDecoration: 'none',
            fontSize: '1rem',
            marginRight: '2rem'
          }}
        >
          ← Back to Home
        </Link>
        <Link
          to="/products"
          style={{
            color: '#48b2ee',
            textDecoration: 'none',
            fontSize: '1rem'
          }}
        >
          View Products Page →
        </Link>
      </div>
    </div>
  );
};

export default LiveProductDebugger;
