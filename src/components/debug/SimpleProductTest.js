import React from 'react';
import { useSelector } from 'react-redux';
import sampleProducts from '../../utils/addSampleProducts';

const SimpleProductTest = () => {
  const { items, filteredItems, status, error } = useSelector(state => state.products);
  
  console.log('🔍 SimpleProductTest Debug:', {
    reduxItems: items?.length || 0,
    reduxFilteredItems: filteredItems?.length || 0,
    sampleProductsLength: sampleProducts?.length || 0,
    status,
    error,
    reduxState: { items, filteredItems }
  });

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'red',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <h4>Product Debug</h4>
      <div>Redux Items: {items?.length || 0}</div>
      <div>Redux Filtered: {filteredItems?.length || 0}</div>
      <div>Sample Products: {sampleProducts?.length || 0}</div>
      <div>Status: {status}</div>
      <div>Error: {error || 'None'}</div>
      
      {items?.length > 0 && (
        <div>
          <strong>First Product:</strong>
          <div>{items[0]?.name}</div>
          <div>${items[0]?.price}</div>
        </div>
      )}
      
      {sampleProducts?.length > 0 && (
        <div>
          <strong>Sample Product:</strong>
          <div>{sampleProducts[0]?.name}</div>
          <div>${sampleProducts[0]?.price}</div>
        </div>
      )}
    </div>
  );
};

export default SimpleProductTest;
