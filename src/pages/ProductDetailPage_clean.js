import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { FiShoppingBag } from 'react-icons/fi';
import { addToCart } from '../redux/slices/cartSlice';
import { fetchProductById } from '../redux/slices/productSlice';
import formatPrice from '../utils/formatPrice';
import * as reviewService from '../services/reviewService';

// Styled Components
const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.5rem;
  }
`;

const BreadcrumbNav = styled.div`
  margin-bottom: 2rem;
  font-size: 0.9rem;
  
  @media (max-width: 768px) {
    margin-bottom: 1rem;
    font-size: 0.8rem;
  }
  
  a {
    color: #666;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  span {
    margin: 0 0.5rem;
    color: #999;
  }
`;

const ProductLayout = styled.div`
  display: flex;
  margin: 2rem 0;
  gap: 3rem;
  background-color: #f9f9f9;
  padding: 2rem;
  border-radius: 10px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    margin: 1rem 0;
    gap: 1.5rem;
    padding: 1rem;
  }
  
  @media (max-width: 480px) {
    margin: 0.5rem 0;
    gap: 1rem;
    padding: 0.75rem;
  }
`;

const ImageGallery = styled.div`
  flex: 1;
  position: relative;
  max-width: 650px;
  
  @media (max-width: 768px) {
    max-width: 100%;
  }
`;

const MainImage = styled.div`
  width: 100%;
  margin-bottom: 1rem;
  overflow: hidden;
  border-radius: 10px;
  height: 400px;
  
  @media (max-width: 768px) {
    height: 300px;
  }
  
  @media (max-width: 480px) {
    height: 250px;
  }
  
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    background-color: #f5f5f5;
  }
`;

const ProductInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 400px;
  
  @media (max-width: 768px) {
    min-height: auto;
  }
`;

const ProductBrand = styled.div`
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  font-weight: 500;
`;

const ProductTitle = styled.h1`
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #333;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const PriceContainer = styled.div`
  margin-bottom: 1.5rem;
`;

const CurrentPrice = styled.span`
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  margin-right: 1rem;
`;

const OriginalPrice = styled.span`
  font-size: 1.2rem;
  color: #999;
  text-decoration: line-through;
  margin-right: 0.5rem;
`;

const DiscountedPrice = styled.span`
  font-size: 1.5rem;
  font-weight: 600;
  color: #e74c3c;
  margin-right: 1rem;
`;

const DiscountPercentage = styled.span`
  background-color: #e74c3c;
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
`;

const ProductDescription = styled.p`
  color: #666;
  line-height: 1.6;
  margin-bottom: 1.5rem;
`;

const ColorLabel = styled.div`
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #333;
`;

const ColorOptions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`;

const ColorSwatch = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: ${props => props.color};
  border: 2px solid ${props => props.selected ? '#48b2ee' : '#ddd'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: scale(1.1);
    border-color: #48b2ee;
  }
`;

const SizeLabel = styled.div`
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #333;
`;

const SizeOptions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`;

const SizeOption = styled.button`
  padding: 0.5rem 1rem;
  border: 2px solid ${props => props.selected ? '#48b2ee' : '#ddd'};
  background-color: ${props => props.selected ? '#48b2ee' : 'white'};
  color: ${props => props.selected ? 'white' : '#333'};
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #48b2ee;
  }
`;

const FreeShippingBadge = styled.div`
  background-color: #e8f5e8;
  color: #2d5a2d;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  .icon {
    font-size: 1.2rem;
  }
`;

const LensSelectionButton = styled.button`
  width: 100%;
  padding: 1rem;
  border: 2px solid #48b2ee;
  background-color: white;
  color: #48b2ee;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #48b2ee;
    color: white;
  }
  
  .lens-info {
    text-align: left;
  }
  
  .lens-type {
    font-size: 1rem;
    font-weight: 600;
  }
  
  .arrow {
    font-size: 1.2rem;
    font-weight: bold;
  }
`;

const ProductDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { status, error } = useSelector(state => state.products);
  
  const [product, setProduct] = useState(null);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedImage, setSelectedImage] = useState(0);

  // Mock product data for demonstration
  useEffect(() => {
    // Simulate loading product data
    setTimeout(() => {
      setProduct({
        id: id,
        name: 'Ember',
        brand: 'EyeBuyDirect',
        price: 23,
        image: '/images/eyeglasses.webp',
        category: 'Prescription',
        colors: [
          { name: 'Black', hex: '#000000' },
          { name: 'Brown', hex: '#8B4513' },
          { name: 'Silver', hex: '#C0C0C0' }
        ],
        sizes: ['S', 'M', 'L'],
        description: 'Stylish and comfortable eyeglasses perfect for everyday wear.',
        material: 'Premium Acetate',
        shape: 'Rectangle',
        rim: 'Full Rim',
        weight: '28g'
      });
      setSelectedColor('Black');
    }, 500);
  }, [id]);

  const openLensModal = () => {
    // Placeholder for lens modal functionality
    console.log('Opening lens selection modal...');
  };

  // Calculate pricing
  const originalPrice = product?.price || 23;
  const hasDiscount = product?.discount && product?.discount?.discountPercentage > 0;
  const discountedPrice = hasDiscount 
    ? originalPrice * (1 - product?.discount?.discountPercentage / 100)
    : originalPrice;

  if (status === 'loading' || !product) {
    return (
      <PageContainer>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '50px 0' }}>
          <div style={{ textAlign: 'center' }}>
            <h3>Loading product...</h3>
            <p>Please wait while we fetch the product details.</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (status === 'failed' || error) {
    return (
      <PageContainer>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '50px 0' }}>
          <div style={{ textAlign: 'center' }}>
            <h3>Error loading product</h3>
            <p>{error || 'Failed to load product details'}</p>
            <button onClick={() => dispatch(fetchProductById(id))}>Retry</button>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <BreadcrumbNav>
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to="/products">Products</Link>
        <span>/</span>
        <span>{product?.name || 'Product'}</span>
      </BreadcrumbNav>

      <ProductLayout>
        <ImageGallery>
          <MainImage>
            <img 
              src={product?.colors?.[selectedImage]?.image || product?.image || '/images/eyeglasses.webp'} 
              alt={product?.name || 'Product'} 
            />
          </MainImage>
        </ImageGallery>

        <ProductInfo>
          <div>
            <ProductBrand>{product?.brand || 'EyeBuyDirect'}</ProductBrand>
            <ProductTitle>{product?.name || 'Ember'}</ProductTitle>
            
            <PriceContainer>
              {hasDiscount ? (
                <>
                  <DiscountedPrice>{formatPrice(discountedPrice)}</DiscountedPrice>
                  <OriginalPrice>{formatPrice(originalPrice)}</OriginalPrice>
                  <DiscountPercentage>{product?.discount?.discountPercentage}% OFF</DiscountPercentage>
                </>
              ) : (
                <CurrentPrice>{formatPrice(originalPrice)}</CurrentPrice>
              )}
            </PriceContainer>
            
            <ProductDescription>
              {product?.description || 'Stylish and comfortable eyeglasses perfect for everyday wear.'}
            </ProductDescription>
            
            {product?.colors && product.colors.length > 0 && (
              <div>
                <ColorLabel>Color: {selectedColor}</ColorLabel>
                <ColorOptions>
                  {product.colors.map((color, index) => (
                    <ColorSwatch
                      key={index}
                      color={color.hex}
                      selected={selectedColor === color.name}
                      onClick={() => {
                        setSelectedColor(color.name);
                        setSelectedImage(index);
                      }}
                      title={color.name}
                    />
                  ))}
                </ColorOptions>
              </div>
            )}
            
            {product?.sizes && product.sizes.length > 0 && (
              <div>
                <SizeLabel>Size: {selectedSize}</SizeLabel>
                <SizeOptions>
                  {product.sizes.map((size) => (
                    <SizeOption
                      key={size}
                      selected={selectedSize === size}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </SizeOption>
                  ))}
                </SizeOptions>
              </div>
            )}
            
            <FreeShippingBadge>
              <span className="icon">🚚</span>
              FREE SHIPPING on orders above PKR 5,000
            </FreeShippingBadge>
            
            <LensSelectionButton onClick={openLensModal}>
              <div className="lens-info">
                <div className="lens-type">Choose lens type</div>
              </div>
              <div className="arrow">→</div>
            </LensSelectionButton>
          </div>
        </ProductInfo>
      </ProductLayout>
    </PageContainer>
  );
};

export default ProductDetailPage;
