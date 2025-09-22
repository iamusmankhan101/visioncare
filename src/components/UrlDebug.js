import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProducts } from '../redux/slices/productSlice';
import { generateUniqueSlug } from '../utils/slugUtils';
import styled from 'styled-components';

const DebugContainer = styled.div`
  position: fixed;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 1rem;
  border-radius: 8px;
  font-family: monospace;
  font-size: 12px;
  max-width: 400px;
  max-height: 300px;
  overflow-y: auto;
  z-index: 9999;
  border: 2px solid #48b2ee;
`;

const Title = styled.h4`
  color: #48b2ee;
  margin: 0 0 10px 0;
  font-size: 14px;
`;

const ProductItem = styled.div`
  margin-bottom: 8px;
  padding: 5px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
`;

const ProductName = styled.div`
  color: #fff;
  font-weight: bold;
`;

const UrlInfo = styled.div`
  color: #90EE90;
  font-size: 11px;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 5px;
  right: 5px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 3px;
  padding: 2px 6px;
  cursor: pointer;
  font-size: 12px;
`;

const UrlDebug = ({ onClose }) => {
  const dispatch = useDispatch();
  const { items: products, status } = useSelector(state => state.products);
  const [debugInfo, setDebugInfo] = useState([]);

  useEffect(() => {
    if (!products || products.length === 0) {
      dispatch(fetchProducts());
    }
  }, [dispatch, products]);

  useEffect(() => {
    if (products && products.length > 0) {
      const info = products.slice(0, 5).map(product => ({
        id: product.id,
        name: product.name,
        oldUrl: `/products/${product.id}`,
        newUrl: `/products/${generateUniqueSlug(product.name, product.id)}`,
        slug: generateUniqueSlug(product.name, product.id)
      }));
      setDebugInfo(info);
    }
  }, [products]);

  return (
    <DebugContainer>
      <CloseButton onClick={onClose}>×</CloseButton>
      <Title>URL Debug Info</Title>
      <div style={{ marginBottom: '10px', color: '#ffd700' }}>
        Status: {status} | Products: {products?.length || 0}
      </div>
      
      {debugInfo.map(item => (
        <ProductItem key={item.id}>
          <ProductName>{item.name}</ProductName>
          <UrlInfo>ID: {item.id}</UrlInfo>
          <UrlInfo>Old: {item.oldUrl}</UrlInfo>
          <UrlInfo>New: {item.newUrl}</UrlInfo>
          <UrlInfo>Slug: {item.slug}</UrlInfo>
        </ProductItem>
      ))}
      
      <div style={{ marginTop: '10px', color: '#ffd700', fontSize: '10px' }}>
        Press F12 → Network tab to see actual requests
      </div>
    </DebugContainer>
  );
};

export default UrlDebug;
