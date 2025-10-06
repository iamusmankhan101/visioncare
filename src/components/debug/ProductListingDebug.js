import React from 'react';
import styled from 'styled-components';

const DebugContainer = styled.div`
  position: fixed;
  top: 10px;
  left: 10px;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 1rem;
  border-radius: 8px;
  font-family: monospace;
  font-size: 12px;
  max-width: 400px;
  max-height: 500px;
  overflow-y: auto;
  z-index: 9999;
  
  h3 {
    margin: 0 0 0.5rem 0;
    color: #4CAF50;
  }
  
  .section {
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #333;
  }
  
  .key {
    color: #FFD700;
  }
  
  .value {
    color: #87CEEB;
  }
  
  .error {
    color: #FF6B6B;
  }
  
  .success {
    color: #4CAF50;
  }
`;

const ProductListingDebug = ({ items, filteredItems, filters, status, error }) => {
  return (
    <DebugContainer>
      <h3>🔍 Product Listing Debug</h3>
      
      <div className="section">
        <div><span className="key">Status:</span> <span className={status === 'succeeded' ? 'success' : 'error'}>{status}</span></div>
        <div><span className="key">Error:</span> <span className="error">{error || 'None'}</span></div>
      </div>
      
      <div className="section">
        <div><span className="key">All Items:</span> <span className="value">{items?.length || 0}</span></div>
        <div><span className="key">Filtered Items:</span> <span className="value">{filteredItems?.length || 0}</span></div>
      </div>
      
      <div className="section">
        <div><span className="key">Active Filters:</span></div>
        {filters && Object.keys(filters).map(key => {
          const value = filters[key];
          if (value !== null && value !== '' && (Array.isArray(value) ? value.length > 0 : true)) {
            return (
              <div key={key} style={{ marginLeft: '10px' }}>
                <span className="key">{key}:</span> <span className="value">{JSON.stringify(value)}</span>
              </div>
            );
          }
          return null;
        })}
      </div>
      
      <div className="section">
        <div><span className="key">Sample Items:</span></div>
        {items && items.slice(0, 3).map((item, index) => (
          <div key={index} style={{ marginLeft: '10px', marginBottom: '5px' }}>
            <div><span className="key">[{index}] Name:</span> <span className="value">{item.name}</span></div>
            <div><span className="key">[{index}] Category:</span> <span className="value">{item.category}</span></div>
            <div><span className="key">[{index}] Price:</span> <span className="value">{item.price}</span></div>
          </div>
        ))}
      </div>
      
      <div className="section">
        <div><span className="key">Categories Found:</span></div>
        {items && [...new Set(items.map(item => item.category))].map(category => (
          <div key={category} style={{ marginLeft: '10px' }}>
            <span className="value">{category}</span>
          </div>
        ))}
      </div>
    </DebugContainer>
  );
};

export default ProductListingDebug;
