import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProducts, setFilters, resetFilters } from '../redux/slices/productSlice';

const StyleFilterTest = () => {
  const dispatch = useDispatch();
  const { items, filteredItems, filters } = useSelector(state => state.products);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const testStyleFilter = (style) => {
    console.log('Testing style filter:', style);
    dispatch(resetFilters());
    dispatch(setFilters({ style }));
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', margin: '20px' }}>
      <h3>Style Filter Test</h3>
      
      <div style={{ marginBottom: '20px' }}>
        <p><strong>Total Products:</strong> {items.length}</p>
        <p><strong>Filtered Products:</strong> {filteredItems.length}</p>
        <p><strong>Current Style Filter:</strong> {filters.style || 'None'}</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h4>Products with Style Data:</h4>
        {items.filter(item => item.style).map(item => (
          <div key={item.id} style={{ padding: '5px', border: '1px solid #ccc', margin: '5px' }}>
            <strong>{item.name}</strong> - Style: {item.style}
          </div>
        ))}
      </div>

      <div>
        <h4>Test Style Filters:</h4>
        {['Classic', 'Eco Friendly', 'Artsy', 'Retro', 'Street Style', 'Bold'].map(style => (
          <button 
            key={style}
            onClick={() => testStyleFilter(style)}
            style={{ 
              margin: '5px', 
              padding: '10px', 
              backgroundColor: filters.style === style ? '#007bff' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {style}
          </button>
        ))}
        <button 
          onClick={() => dispatch(resetFilters())}
          style={{ 
            margin: '5px', 
            padding: '10px', 
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Clear Filters
        </button>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h4>Filtered Results:</h4>
        {filteredItems.map(item => (
          <div key={item.id} style={{ padding: '5px', border: '1px solid #007bff', margin: '5px' }}>
            <strong>{item.name}</strong> - Style: {item.style || 'No style'}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StyleFilterTest;
