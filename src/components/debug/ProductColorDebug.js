import React from 'react';
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

const ProductColorDebug = ({ product, selectedColor, selectedImage }) => {
  if (!product) return null;

  const selectedColorObj = product?.colors?.find(c => c.name === selectedColor);
  
  return (
    <DebugContainer>
      <h3>🔍 Color Image Debug</h3>
      
      <div className="section">
        <div><span className="key">Product ID:</span> <span className="value">{product.id}</span></div>
        <div><span className="key">Product Name:</span> <span className="value">{product.name}</span></div>
        <div><span className="key">Main Image:</span> <span className="value">{product.image || 'None'}</span></div>
      </div>
      
      <div className="section">
        <div><span className="key">Selected Color:</span> <span className="value">{selectedColor || 'None'}</span></div>
        <div><span className="key">Selected Image Index:</span> <span className="value">{selectedImage}</span></div>
      </div>
      
      <div className="section">
        <div><span className="key">Colors Array:</span></div>
        {product.colors && product.colors.length > 0 ? (
          product.colors.map((color, index) => (
            <div key={index} style={{ marginLeft: '10px', marginBottom: '5px' }}>
              <div><span className="key">[{index}] Name:</span> <span className="value">{color.name}</span></div>
              <div><span className="key">[{index}] Hex:</span> <span className="value">{color.hex}</span></div>
              <div><span className="key">[{index}] Image:</span> <span className={color.image ? 'success' : 'error'}>{color.image || 'NO IMAGE'}</span></div>
            </div>
          ))
        ) : (
          <div className="error">No colors array found</div>
        )}
      </div>
      
      <div className="section">
        <div><span className="key">ColorImages Object:</span></div>
        {product.colorImages ? (
          <div style={{ marginLeft: '10px' }}>
            {Object.keys(product.colorImages).map(colorName => (
              <div key={colorName}>
                <span className="key">{colorName}:</span> <span className="value">{JSON.stringify(product.colorImages[colorName])}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="error">No colorImages object found</div>
        )}
      </div>
      
      <div className="section">
        <div><span className="key">Selected Color Object:</span></div>
        {selectedColorObj ? (
          <div style={{ marginLeft: '10px' }}>
            <div><span className="key">Name:</span> <span className="value">{selectedColorObj.name}</span></div>
            <div><span className="key">Image:</span> <span className={selectedColorObj.image ? 'success' : 'error'}>{selectedColorObj.image || 'NO IMAGE'}</span></div>
          </div>
        ) : (
          <div className="error">No selected color object found</div>
        )}
      </div>
      
      <div className="section">
        <div><span className="key">Current Image Source:</span></div>
        <div className="value" style={{ wordBreak: 'break-all' }}>
          {(selectedColor && product?.colors?.find(c => c.name === selectedColor)?.image) ||
           product?.colors?.[selectedImage]?.image || 
           product?.image || 
           '/images/eyeglasses.webp'}
        </div>
      </div>
    </DebugContainer>
  );
};

export default ProductColorDebug;
