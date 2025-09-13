import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { removeFromCart, clearCart } from '../redux/slices/cartSlice';
import formatPrice from '../utils/formatPrice';

// Styled Components
const PageContainer = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  display: flex;
  gap: 3rem;
  box-sizing: border-box;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 2rem;
    padding: 1rem;
  }
`;

const CartSection = styled.div`
  flex: 2;
`;

const CartHeader = styled.h1`
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 2rem;
  color: #333;
`;

const PromoBar = styled.div`
  background: linear-gradient(135deg, #f8f4e6 0%, #f0e68c 100%);
  border: 1px solid #e6d700;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  .icon {
    font-size: 1.2rem;
    color: #b8860b;
  }
  
  .text {
    color: #333;
    font-size: 0.9rem;
  }
  
  .code {
    font-weight: 600;
    color: #b8860b;
  }
  
  .apply-link {
    color: #48b2ee;
    text-decoration: underline;
    cursor: pointer;
    margin-left: 0.5rem;
    
    &:hover {
      color: #a07828;
    }
  }
`;

const CartItem = styled.div`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  position: relative;
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #999;
  cursor: pointer;
  
  &:hover {
    color: #666;
  }
`;

const ItemContent = styled.div`
  display: flex;
  gap: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const ItemImage = styled.div`
  flex: 0 0 150px;
  
  img {
    width: 100%;
    height: auto;
    border-radius: 8px;
  }
  
  @media (max-width: 768px) {
    flex: 0 0 120px;
  }
`;

const ItemDetails = styled.div`
  flex: 1;
`;

const ItemName = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #333;
`;

const ItemSpecs = styled.div`
  margin-bottom: 1rem;
`;

const SpecLine = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  
  .label {
    color: #666;
  }
  
  .value {
    font-weight: 500;
    color: #333;
  }
`;

const AddOnsSection = styled.div`
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #f0f0f0;
`;

const AddOnItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const AddOnCheckbox = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
`;

const AddOnLabel = styled.label`
  flex: 1;
  font-size: 0.9rem;
  color: #333;
  cursor: pointer;
  
  .description {
    color: #666;
    font-size: 0.8rem;
    margin-top: 0.25rem;
  }
`;

const AddOnPrice = styled.span`
  font-weight: 500;
  color: #333;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const ActionButton = styled.button`
  background: none;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: #48b2ee;
    color: #48b2ee;
  }
`;

const CompleteSection = styled.div`
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid #e0e0e0;
`;

const CompleteTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #333;
`;

const SummarySection = styled.div`
  flex: 1;
  max-width: 400px;
`;

const SummaryCard = styled.div`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 2rem;
  position: sticky;
  top: 2rem;
  box-sizing: border-box;
  width: 400px;
  max-width: 400px;

  @media (max-width: 768px) {
    position: relative;
    top: auto;
    padding: 1.5rem;
  }

  @media (max-width: 480px) {
    padding: 1rem;
    border-radius: 8px;
    width: auto;
  max-width: auto;
    margin: 0;
  }
`;

const SummaryTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #333;
`;

const SummaryLine = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
  
  .label {
    color: #666;
  }
  
  .value {
    font-weight: 500;
    color: #333;
  }
`;

const TotalLine = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  margin-top: 1rem;
  border-top: 1px solid #e0e0e0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
`;

const ShippingInfo = styled.div`
  font-size: 0.8rem;
  color: #666;
  margin: 1rem 0;
`;

const BenefitsList = styled.div`
  margin: 1.5rem 0;
`;

const BenefitItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #333;
  
  .icon {
    color: #4CAF50;
    font-size: 1rem;
  }
`;

const CheckoutButton = styled.button`
  width: 100%;
  background-color: #48b2ee;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 1rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 1rem;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #a07828;
  }
`;

const FastCheckoutButton = styled.button`
  width: 100%;
  background-color: #000;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 1rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  margin-bottom: 1rem;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #333;
  }
`;

const PaymentInfo = styled.div`
  text-align: center;
  font-size: 0.8rem;
  color: #666;
  margin: 1rem 0;
  
  .payment-icons {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }
`;

const PromoCodeSection = styled.div`
  margin: 1.5rem 0;
`;

const PromoCodeInput = styled.div`
  display: flex;
  gap: 0.5rem;
  
  input {
    flex: 1;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 0.9rem;
    
    &:focus {
      outline: none;
      border-color: #48b2ee;
    }
  }
  
  button {
    background-color: #f5f5f5;
    border: 1px solid #ddd;
    border-radius: 6px;
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
    cursor: pointer;
    
    &:hover {
      background-color: #e0e0e0;
    }
  }
`;

const EmptyCartContainer = styled.div`
  display: flex;
  gap: 3rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1.5rem;
  }
  
  @media (max-width: 480px) {
    gap: 1rem;
  }
`;

const EmptyCartContent = styled.div`
  flex: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 4rem 2rem;
  
  @media (max-width: 768px) {
    padding: 2rem 1rem;
  }
  
  @media (max-width: 480px) {
    padding: 1.5rem 0.5rem;
  }
  
  h2 {
    font-size: 1.8rem;
    font-weight: 400;
    margin-bottom: 1rem;
    color: #333;
    
    @media (max-width: 768px) {
      font-size: 1.5rem;
    }
    
    @media (max-width: 480px) {
      font-size: 1.3rem;
    }
  }
  
  p {
    color: #666;
    margin-bottom: 2rem;
    font-size: 1rem;
    
    @media (max-width: 768px) {
      font-size: 0.9rem;
      margin-bottom: 1.5rem;
    }
    
    @media (max-width: 480px) {
      font-size: 0.85rem;
      margin-bottom: 1rem;
    }
  }
`;

const EmptyCartButtons = styled.div`
  display: flex;
  gap: 1rem;
  
  @media (max-width: 768px) {
    gap: 0.75rem;
  }
  
  @media (max-width: 480px) {
    flex-direction: column;
    width: 100%;
    gap: 0.5rem;
  }
`;

const ContinueShoppingButton = styled.button`
  background-color: #48b2ee;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  
  @media (max-width: 768px) {
    padding: 0.65rem 1.25rem;
    font-size: 0.9rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
    width: 100%;
  }
  
  &:hover {
    background-color: #48b2ee;
  }
`;

const SignInButton = styled.button`
  background-color: #48b2ee;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  
  @media (max-width: 768px) {
    padding: 0.65rem 1.25rem;
    font-size: 0.9rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
    width: 100%;
  }
  
  &:hover {
    background-color: #48b2ee;
  }
`;

const EmptyCartSummary = styled.div`
  flex: 1;
  min-width: 0;
  
  @media (max-width: 768px) {
    flex: none;
  }
`;

const FreeShippingBar = styled.div`
  margin: 1rem 0;
  padding: 1rem;
  background: ${props => props.isEligible ? '#e8f5e8' : '#f8f9fa'};
  border: 1px solid ${props => props.isEligible ? '#4CAF50' : '#e0e0e0'};
  border-radius: 8px;
`;

const FreeShippingText = styled.div`
  font-size: 0.9rem;
  color: ${props => props.isEligible ? '#2e7d32' : '#333'};
  margin-bottom: 0.5rem;
  font-weight: 500;
  
  .highlight {
    color: #48b2ee;
    font-weight: 600;
  }
`;

const ProgressBarContainer = styled.div`
  width: 100%;
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
  overflow: hidden;
  margin-top: 0.5rem;
`;

const ProgressBar = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #48b2ee 0%, #4CAF50 100%);
  width: ${props => props.progress}%;
  transition: width 0.3s ease;
  border-radius: 3px;
`;

const ShippingLine = styled(SummaryLine)`
  color: ${props => props.free ? '#4CAF50' : 'inherit'};
  
  .value {
    color: ${props => props.free ? '#4CAF50' : '#333'};
    text-decoration: ${props => props.free ? 'line-through' : 'none'};
  }
  
  .free-text {
    color: #4CAF50;
    font-weight: 600;
    margin-left: 0.5rem;
  }
`;

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, totalQuantity, totalAmount } = useSelector(state => state.cart);
  const { isAuthenticated } = useSelector(state => state.auth);
  
  const [promoCode, setPromoCode] = useState('');
  const [addOns, setAddOns] = useState({});

  const handleRemoveItem = (itemKey) => {
    dispatch(removeFromCart(itemKey));
  };

  const handleAddOnChange = (itemId, addOnType, checked, price = 0) => {
    setAddOns(prev => ({
      ...prev,
      [`${itemId}-${addOnType}`]: checked ? price : 0
    }));
  };

  const calculateItemTotal = (item) => {
    const basePrice = item.price * item.quantity;
    const addOnPrices = Object.keys(addOns)
      .filter(key => key.startsWith(item.id))
      .reduce((sum, key) => sum + addOns[key], 0);
    return basePrice + addOnPrices;
  };

  const calculateSubtotal = () => {
    return items.reduce((total, item) => total + calculateItemTotal(item), 0);
  };

  const calculateShipping = () => {
    const subtotal = calculateSubtotal();
    const FREE_SHIPPING_THRESHOLD = 5000;
    const STANDARD_SHIPPING = 200;
    
    return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping();
  };

  const getFreeShippingProgress = () => {
    const subtotal = calculateSubtotal();
    const FREE_SHIPPING_THRESHOLD = 5000;
    const remaining = FREE_SHIPPING_THRESHOLD - subtotal;
    
    return {
      isEligible: subtotal >= FREE_SHIPPING_THRESHOLD,
      remaining: Math.max(0, remaining),
      progress: Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)
    };
  };

  if (items.length === 0) {
    return (
      <PageContainer>
        <EmptyCartContainer>
          <EmptyCartContent>
            <h2>Your shopping cart is empty</h2>
            <p>{isAuthenticated ? 'You can continue shopping to add items to your cart.' : 'You can continue shopping or sign in to view a previously saved cart.'}</p>
            <EmptyCartButtons>
              <ContinueShoppingButton onClick={() => navigate('/products')}>
                Continue shopping
              </ContinueShoppingButton>
              {!isAuthenticated && (
                <SignInButton onClick={() => navigate('/auth')}>
                  Sign in
                </SignInButton>
              )}
            </EmptyCartButtons>
          </EmptyCartContent>
          
          <EmptyCartSummary>
            <SummaryCard>
              <SummaryTitle>Price Summary</SummaryTitle>
              
              <SummaryLine>
                <span className="label">Items: 0</span>
                <span className="value"></span>
              </SummaryLine>
              
              <TotalLine>
                <span>Order Total</span>
                <span>PKR 0</span>
              </TotalLine>
              
              <ShippingInfo>
                Shipping, Tax and Shipping Protection not included
              </ShippingInfo>
              
              <BenefitsList>
                <BenefitItem>
                  <span className="icon">✓</span>
                  <span>14 days free return, no questions asked</span>
                </BenefitItem>
                <BenefitItem>
                  <span className="icon">✓</span>
                  <span>Vision insurance applicable</span>
                </BenefitItem>
              </BenefitsList>
              
              <CheckoutButton disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                Proceed to checkout
              </CheckoutButton>
              
              <PromoCodeSection>
                <PromoCodeInput>
                  <input 
                    type="text" 
                    placeholder="Promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    disabled
                  />
                  <button disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>Apply</button>
                </PromoCodeInput>
              </PromoCodeSection>
              
              <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '1rem' }}>
                Do you provide a public service? Claim a discount ↓
              </div>
            </SummaryCard>
          </EmptyCartSummary>
        </EmptyCartContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <CartSection>
        <CartHeader>My Cart ({totalQuantity})</CartHeader>
        
        

        {items.map((item) => (
          <CartItem key={item.id}>
            <RemoveButton onClick={() => handleRemoveItem(item.itemKey)}>×</RemoveButton>
            
            <ItemContent>
              <ItemImage>
                <img src={item.image} alt="Cart item" />
              </ItemImage>
              
              <ItemDetails>
                <ItemName>{item.name} ({formatPrice(item.price)})</ItemName>
                
                <ItemSpecs>
                  <SpecLine>
                    <span className="label">{item.selectedColor || 'Matte Black'} {item.selectedSize || 'Large'}</span>
                    <span className="value">{formatPrice(item.price)}</span>
                  </SpecLine>
                  <SpecLine>
                    <span className="label">{item.lensType || 'Single Vision Distance'} (Details)</span>
                    <span className="value">Free</span>
                  </SpecLine>
                </ItemSpecs>

              
              
              </ItemDetails>
            </ItemContent>
          </CartItem>
        ))}

        
      </CartSection>

      <SummarySection>
        <SummaryCard>
          <SummaryTitle>Price Summary</SummaryTitle>
          
          {(() => {
            const shippingProgress = getFreeShippingProgress();
            return (
              <FreeShippingBar isEligible={shippingProgress.isEligible}>
                <FreeShippingText isEligible={shippingProgress.isEligible}>
                  {shippingProgress.isEligible ? (
                    <>🎉 You qualify for <strong>FREE SHIPPING!</strong></>
                  ) : (
                    <>Add <span className="highlight">{formatPrice(shippingProgress.remaining)}</span> more for FREE SHIPPING</>
                  )}
                </FreeShippingText>
                {!shippingProgress.isEligible && (
                  <ProgressBarContainer>
                    <ProgressBar progress={shippingProgress.progress} />
                  </ProgressBarContainer>
                )}
              </FreeShippingBar>
            );
          })()}
          
          <SummaryLine>
            <span className="label">Items: {totalQuantity}</span>
            <span className="value"></span>
          </SummaryLine>
          
          <SummaryLine>
            <span className="label">Subtotal</span>
            <span className="value">{formatPrice(calculateSubtotal())}</span>
          </SummaryLine>
          
          <ShippingLine free={calculateShipping() === 0}>
            <span className="label">Shipping</span>
            <span className="value">
              {calculateShipping() === 0 ? (
                <>
                  <span style={{ textDecoration: 'line-through', color: '#999' }}>PKR 200</span>
                  <span className="free-text">FREE</span>
                </>
              ) : (
                formatPrice(calculateShipping())
              )}
            </span>
          </ShippingLine>
          
          <TotalLine>
            <span>Order Total</span>
            <span>{formatPrice(calculateTotal())}</span>
          </TotalLine>
          
          <ShippingInfo>
            {calculateShipping() === 0 ? 
              'Free shipping applied! Tax and Shipping Protection not included' : 
              'Tax and Shipping Protection not included'
            }
          </ShippingInfo>
          
          <BenefitsList>
            <BenefitItem>
              <span className="icon">✓</span>
              <span>14 days free return, no questions asked</span>
            </BenefitItem>
            <BenefitItem>
              <span className="icon">✓</span>
              <span>Vision Insurance applicable</span>
            </BenefitItem>
          </BenefitsList>
          
          <CheckoutButton onClick={() => navigate('/checkout')}>
            Proceed to checkout
          </CheckoutButton>
          
        
          
  
          
          <PromoCodeSection>
            <PromoCodeInput>
              <input 
                type="text" 
                placeholder="Promo code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
              />
              <button>Apply</button>
            </PromoCodeInput>
          </PromoCodeSection>
        </SummaryCard>
      </SummarySection>
    </PageContainer>
  );
};

export default CartPage;
