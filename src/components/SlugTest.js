import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProducts } from '../redux/slices/productSlice';
import { generateUniqueSlug } from '../utils/slugUtils';
import styled from 'styled-components';

const TestContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Segoe UI', Roboto, sans-serif;
`;

const Title = styled.h1`
  color: #333;
  margin-bottom: 2rem;
  text-align: center;
`;

const Section = styled.div`
  margin-bottom: 3rem;
  padding: 2rem;
  background: #f9f9f9;
  border-radius: 8px;
`;

const SectionTitle = styled.h2`
  color: #48b2ee;
  margin-bottom: 1rem;
`;

const ProductList = styled.div`
  display: grid;
  gap: 1rem;
`;

const ProductItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: white;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const ProductInfo = styled.div`
  flex: 1;
`;

const ProductName = styled.h3`
  margin: 0 0 0.5rem 0;
  color: #333;
`;

const ProductDetails = styled.p`
  margin: 0;
  color: #666;
  font-size: 0.9rem;
`;

const UrlInfo = styled.div`
  flex: 1;
  margin-left: 2rem;
`;

const OldUrl = styled.div`
  color: #e74c3c;
  font-family: monospace;
  margin-bottom: 0.5rem;
`;

const NewUrl = styled.div`
  color: #27ae60;
  font-family: monospace;
  margin-bottom: 0.5rem;
`;

const TestLink = styled(Link)`
  color: #48b2ee;
  text-decoration: none;
  font-weight: 600;
  
  &:hover {
    text-decoration: underline;
  }
`;

const Status = styled.div`
  padding: 1rem;
  margin-bottom: 2rem;
  border-radius: 6px;
  text-align: center;
  font-weight: 600;
  
  &.success {
    background: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
  }
  
  &.loading {
    background: #fff3cd;
    color: #856404;
    border: 1px solid #ffeaa7;
  }
  
  &.error {
    background: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
  }
`;

const SlugTest = () => {
  const dispatch = useDispatch();
  const { items: products, status, error } = useSelector(state => state.products);
  const [testResults, setTestResults] = useState([]);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  useEffect(() => {
    if (products && products.length > 0) {
      const results = products.map(product => {
        const slug = generateUniqueSlug(product.name, product.id);
        return {
          ...product,
          slug,
          oldUrl: `/products/${product.id}`,
          newUrl: `/products/${slug}`
        };
      });
      setTestResults(results);
    }
  }, [products]);

  const getStatusMessage = () => {
    if (status === 'loading') return { text: 'Loading products...', class: 'loading' };
    if (status === 'failed') return { text: `Error: ${error}`, class: 'error' };
    if (testResults.length > 0) return { text: `✅ Successfully generated slugs for ${testResults.length} products`, class: 'success' };
    return { text: 'No products found', class: 'error' };
  };

  const statusInfo = getStatusMessage();

  return (
    <TestContainer>
      <Title>Product URL Slug Test</Title>
      
      <Status className={statusInfo.class}>
        {statusInfo.text}
      </Status>

      {testResults.length > 0 && (
        <>
          <Section>
            <SectionTitle>URL Transformation Results</SectionTitle>
            <ProductList>
              {testResults.map(product => (
                <ProductItem key={product.id}>
                  <ProductInfo>
                    <ProductName>{product.name}</ProductName>
                    <ProductDetails>
                      ID: {product.id} | Brand: {product.brand} | Price: ${product.price}
                    </ProductDetails>
                  </ProductInfo>
                  
                  <UrlInfo>
                    <OldUrl>OLD: {product.oldUrl}</OldUrl>
                    <NewUrl>NEW: {product.newUrl}</NewUrl>
                    <TestLink to={product.newUrl}>
                      Test New URL →
                    </TestLink>
                  </UrlInfo>
                </ProductItem>
              ))}
            </ProductList>
          </Section>

          <Section>
            <SectionTitle>Quick Test Links</SectionTitle>
            <ProductList>
              {testResults.slice(0, 3).map(product => (
                <ProductItem key={`test-${product.id}`}>
                  <ProductInfo>
                    <ProductName>{product.name}</ProductName>
                  </ProductInfo>
                  <UrlInfo>
                    <TestLink to={product.newUrl}>
                      Visit Product Page
                    </TestLink>
                  </UrlInfo>
                </ProductItem>
              ))}
            </ProductList>
          </Section>

          <Section>
            <SectionTitle>Implementation Summary</SectionTitle>
            <div style={{ color: '#666', lineHeight: '1.6' }}>
              <p><strong>✅ Completed:</strong></p>
              <ul>
                <li>Created slug utility functions</li>
                <li>Updated App.js routing to use :slug parameter</li>
                <li>Updated ProductDetailPage to find products by slug</li>
                <li>Updated all product links in HomePage, ProductListingPage, and Header</li>
                <li>Added backend API route for slug-based lookups</li>
              </ul>
              
              <p><strong>🎯 Benefits:</strong></p>
              <ul>
                <li>SEO-friendly URLs with product names</li>
                <li>Better user experience with readable URLs</li>
                <li>Backward compatibility with ID-based URLs</li>
                <li>Unique slug generation prevents conflicts</li>
              </ul>
              
              <p><strong>📝 URL Format:</strong></p>
              <p><code>/products/[product-name-slug]-[id]</code></p>
              <p>Example: <code>/products/classic-aviator-sunglasses-1</code></p>
            </div>
          </Section>
        </>
      )}
    </TestContainer>
  );
};

export default SlugTest;
