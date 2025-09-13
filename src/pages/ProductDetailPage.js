import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { fetchProductById, fetchProducts } from '../redux/slices/productSlice';
import { FiShoppingBag } from 'react-icons/fi';
import { addToCart } from '../redux/slices/cartSlice';
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
  text-align: left;
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
  text-align: left;
  color: #333;
  margin-right: 1rem;
`;

const OriginalPrice = styled.span`
  font-size: 1.2rem;
  color: #999;
  text-align:left;
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
  text-align:left;
  line-height: 1.6;
  margin-bottom: 1.5rem;
`;

const ColorLabel = styled.div`
  font-weight: 500;
  margin-bottom: 0.5rem;
  text-align:left;
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
  text-align:left;
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

// About Section Styled Components
const AboutSection = styled.section`
  margin: 3rem 0;
  padding: 2rem;
  background-color: #f9f9f9;
  border-radius: 10px;
`;

const AboutTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #333;
`;

const TabsContainer = styled.div`
  width: 100%;
`;

const TabsHeader = styled.div`
  display: flex;
  border-bottom: 2px solid #e0e0e0;
  margin-bottom: 1.5rem;
`;

const Tab = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  background: none;
  font-size: 1rem;
  font-weight: 500;
  color: ${props => props.active ? '#48b2ee' : '#666'};
  border-bottom: 2px solid ${props => props.active ? '#48b2ee' : 'transparent'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    color: #48b2ee;
  }
`;

const AboutContent = styled.div`
  min-height: 200px;
`;

const TabContent = styled.div`
  animation: fadeIn 0.3s ease;
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const SpecsContainer = styled.div`
  display: grid;
  gap: 1rem;
`;

const SpecRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e0e0e0;
  
  &:last-child {
    border-bottom: none;
  }
`;

const SpecLabel = styled.span`
  font-weight: 500;
  color: #666;
`;

const SpecValue = styled.span`
  color: #333;
  font-weight: 500;
`;

// Related Products Styled Components
const RelatedProductsSection = styled.section`
  margin: 3rem 0;
`;

const RelatedProductsTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #333;
  text-align: center;
`;

const RelatedProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }
`;

const RelatedProductCard = styled.div`
  border-radius: 12px;
  overflow: hidden;
  background-color: #f5f5f5;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease;
  cursor: pointer;
  position: relative;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const ProductImage = styled.div`
  height: 200px;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

const ProductContent = styled.div`
  padding: 1rem;
  background-color: white;
`;

const RelatedProductBrand = styled.div`
  color: #666;
  font-size: 0.8rem;
  margin-bottom: 0.25rem;
`;

const ProductPrice = styled.div`
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
`;

const ColorDot = styled.div`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: ${props => props.color};
  border: 1px solid #ddd;
  margin-right: 0.25rem;
`;

const DiscountBadge = styled.span`
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: #e74c3c;
  color: white;
  padding: 4px 8px;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 4px;
  z-index: 1;
`;

const ProductDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { items: products, status, error } = useSelector(state => state.products);
  
  const [product, setProduct] = useState(null);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState('description');

  // Fetch product data from API
  useEffect(() => {
    if (id) {
      dispatch(fetchProductById(id));
    }
  }, [dispatch, id]);

  // Set product from Redux store when data is loaded
  useEffect(() => {
    if (products && products.length > 0) {
      const foundProduct = products.find(p => p.id === parseInt(id));
      if (foundProduct) {
        setProduct(foundProduct);
        // Set default selections
        if (foundProduct.colors && foundProduct.colors.length > 0) {
          setSelectedColor(foundProduct.colors[0].name);
        }
        if (foundProduct.sizes && foundProduct.sizes.length > 0) {
          setSelectedSize(foundProduct.sizes[0]);
        }
      }
    }
  }, [products, id]);

  const openLensModal = () => {
    // Placeholder for lens modal functionality
    console.log('Opening lens selection modal...');
  };

  // Get related products from Redux store (exclude current product)
  const relatedProducts = products
    ? products
        .filter(p => p.id !== parseInt(id)) // Exclude current product
        .slice(0, 4) // Limit to 4 products
        .map(p => ({
          id: p.id,
          name: p.name,
          brand: p.brand,
          price: p.price,
          originalPrice: p.discount?.hasDiscount ? Math.round(p.price / (1 - p.discount.discountPercentage / 100)) : null,
          image: p.image,
          colors: p.colors ? p.colors.map(color => color.hex) : ['#000000'],
          discount: p.discount?.hasDiscount ? `${p.discount.discountPercentage}% OFF` : null
        }))
    : [];

  const renderTabContent = () => {
    switch(activeTab) {
      case 'description':
        return (
          <TabContent>
            <p style={{ lineHeight: '1.6', color: '#666', marginBottom: '1rem', textAlign: 'left' }}>
              {product?.description}
            </p>
            <h4 style={{ marginBottom: '0.5rem', color: '#333', textAlign: 'left' }}>Features:</h4>
            <ul style={{ paddingLeft: '1.5rem', color: '#666', textAlign: 'left' }}>
              {product?.features?.map((feature, index) => (
                <li key={index} style={{ marginBottom: '0.25rem' }}>
                  {typeof feature === 'string' ? feature.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : feature}
                </li>
              )) || (
                <li style={{ marginBottom: '0.25rem' }}>High-quality construction</li>
              )}
            </ul>
          </TabContent>
        );
      case 'specifications':
        return (
          <TabContent>
            <SpecsContainer>
              <SpecRow>
                <SpecLabel>Material:</SpecLabel>
                <SpecValue>{product?.material || 'Premium Quality'}</SpecValue>
              </SpecRow>
              <SpecRow>
                <SpecLabel>Shape:</SpecLabel>
                <SpecValue>{product?.shape || 'Classic'}</SpecValue>
              </SpecRow>
              <SpecRow>
                <SpecLabel>Rim Type:</SpecLabel>
                <SpecValue>{product?.rim || 'Full Rim'}</SpecValue>
              </SpecRow>
              <SpecRow>
                <SpecLabel>Category:</SpecLabel>
                <SpecValue>{product?.category || 'Eyewear'}</SpecValue>
              </SpecRow>
              <SpecRow>
                <SpecLabel>Brand:</SpecLabel>
                <SpecValue>{product?.brand || 'Premium Brand'}</SpecValue>
              </SpecRow>
              <SpecRow>
                <SpecLabel>Available Sizes:</SpecLabel>
                <SpecValue>{product?.sizes?.join(', ') || 'Standard'}</SpecValue>
              </SpecRow>
            </SpecsContainer>
          </TabContent>
        );
      case 'care':
        return (
          <TabContent>
            <h4 style={{ marginBottom: '1rem', color: '#333', textAlign: 'left' }}>Care Instructions:</h4>
            <ul style={{ paddingLeft: '1.5rem', color: '#666', lineHeight: '1.6', textAlign: 'left' }}>
              {product?.careInstructions?.map((instruction, index) => (
                <li key={index} style={{ marginBottom: '0.5rem' }}>{instruction}</li>
              )) || [
                'Clean with microfiber cloth',
                'Store in protective case',
                'Avoid extreme temperatures',
                'Use lens cleaner for stubborn spots'
              ].map((instruction, index) => (
                <li key={index} style={{ marginBottom: '0.5rem' }}>{instruction}</li>
              ))}
            </ul>
          </TabContent>
        );
      default:
        return null;
    }
  };

  // Calculate pricing using actual product data structure
  const originalPrice = product?.price || 0;
  const hasDiscount = product?.discount?.hasDiscount && product?.discount?.discountPercentage > 0;
  const discountedPrice = hasDiscount 
    ? originalPrice * (1 - product?.discount?.discountPercentage / 100)
    : originalPrice;

  // Ensure products are loaded for related products
  useEffect(() => {
    if (products.length === 0) {
      dispatch(fetchProducts());
    }
  }, [dispatch, products.length]);

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

      {/* About This Product Section */}
      <AboutSection>
        <AboutTitle>About this product</AboutTitle>
        <TabsContainer>
          <TabsHeader>
            <Tab 
              active={activeTab === 'description'} 
              onClick={() => setActiveTab('description')}
            >
              Description
            </Tab>
            <Tab 
              active={activeTab === 'specifications'} 
              onClick={() => setActiveTab('specifications')}
            >
              Specifications
            </Tab>
            <Tab 
              active={activeTab === 'care'} 
              onClick={() => setActiveTab('care')}
            >
              Care Instructions
            </Tab>
          </TabsHeader>
          <AboutContent>
            {renderTabContent()}
          </AboutContent>
        </TabsContainer>
      </AboutSection>

      {/* Related Products Section */}
      <RelatedProductsSection>
        <RelatedProductsTitle>You might also like</RelatedProductsTitle>
        <RelatedProductsGrid>
          {relatedProducts.map((relatedProduct) => (
            <RelatedProductCard 
              key={relatedProduct.id}
              onClick={() => navigate(`/products/${relatedProduct.id}`)}
            >
              {relatedProduct.discount && (
                <DiscountBadge>{relatedProduct.discount}</DiscountBadge>
              )}
              <ProductImage>
                <img src={relatedProduct.image} alt={relatedProduct.name} />
              </ProductImage>
              <ProductContent>
                <RelatedProductBrand>{relatedProduct.brand}</RelatedProductBrand>
                <h3 style={{ 
                  fontSize: '1rem', 
                  fontWeight: '600', 
                  margin: '0.25rem 0', 
                  color: '#333' 
                }}>
                  {relatedProduct.name}
                </h3>
                <ProductPrice>
                  ${relatedProduct.price}
                  {relatedProduct.originalPrice && (
                    <span style={{ 
                      textDecoration: 'line-through', 
                      color: '#999', 
                      marginLeft: '0.5rem',
                      fontSize: '0.9rem'
                    }}>
                      ${relatedProduct.originalPrice}
                    </span>
                  )}
                </ProductPrice>
                <div style={{ display: 'flex', alignItems: 'center', marginTop: '0.5rem' }}>
                  {relatedProduct.colors.map((color, index) => (
                    <ColorDot key={index} color={color} />
                  ))}
                </div>
              </ProductContent>
            </RelatedProductCard>
          ))}
        </RelatedProductsGrid>
      </RelatedProductsSection>
    </PageContainer>
  );
};

export default ProductDetailPage;
