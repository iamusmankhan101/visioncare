import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

// Styled Components using existing website UI patterns
const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Montserrat', 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
  color: #333;
  background-color: #f8f9fa;
  display: flex;
  gap: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const LeftPanel = styled.div`
  flex: 1;
  background-color: #fff;
  padding: 3rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  text-align: center;
`;

const RightPanel = styled.div`
  width: 400px;
  background-color: #f5f5f5;
  padding: 2rem;
  border-radius: 8px;
  
  @media (max-width: 768px) {
    width: 100%;
    
  }

  @media (max-width: 480px) {
    width:85%;
  }
`;

const ThankYouTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 600;
  margin-bottom: 2rem;
  color: #000000;
  line-height: 1.2;
  text-align: center;
`;

const ConfirmationText = styled.p`
  font-size: 1.1rem;
  font-weight: 400;
  color: #000000;
  line-height: 1.6;
  margin-bottom: 1rem;
`;

const HelpSection = styled.div`
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid #eee;
`;

const HelpText = styled.p`
  font-size: 0.9rem;
  color: #666;
  margin: 0;
`;

const OrderHeader = styled.div`
  background-color: #fff;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  text-align: center;
`;

const OrderNumber = styled.div`
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.5rem;
`;

const OrderId = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
`;

const ProductItem = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem;
  background-color: #fff;
  border-radius: 8px;
  margin-bottom: 1rem;
  position: relative;
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #999;
  cursor: pointer;
  
  &:hover {
    color: #666;
  }
`;

const ProductImage = styled.div`
  width: 60px;
  height: 60px;
  background-color: #f5f5f5;
  border-radius: 8px;
  margin-right: 1rem;
  background-image: url(${props => props.image});
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
`;

const ProductDetails = styled.div`
  flex: 1;
`;

const ProductName = styled.div`
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: #333;
`;

const ProductMeta = styled.div`
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.5rem;
`;

const QuantityControls = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
`;

const QuantityButton = styled.button`
  width: 24px;
  height: 24px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    border-color: #48b2ee;
  }
`;

const Quantity = styled.span`
  font-weight: 600;
  min-width: 20px;
  text-align: center;
`;

const ProductPrice = styled.div`
  font-weight: 600;
  color: #333;
  text-align: right;
`;

const OriginalPrice = styled.span`
  text-decoration: line-through;
  color: #999;
  font-size: 0.9rem;
  margin-right: 0.5rem;
`;

const SummarySection = styled.div`
  background-color: #fff;
  padding: 1.5rem;
  border-radius: 8px;
  margin-top: 1rem;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  
  &.total {
    font-weight: 600;
    font-size: 1.1rem;
    padding-top: 1rem;
    border-top: 1px solid #eee;
    margin-top: 1rem;
  }
`;

const PromoSection = styled.div`
  background-color: #fff;
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
  text-align: center;
`;

const PromoCode = styled.div`
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.5rem;
`;

const OrderConfirmationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get order data from navigation state or use sample data
  const orderData = location.state?.orderData || {
    orderNumber: 'YS2705605',
    items: [
      {
        id: 1,
        name: 'Classic Aviator Sunglasses',
        meta: 'Frame Size: Medium | Color: Gold',
        price: 1798.00,
        quantity: 2,
        image: '/images/aviator.jpg'
      },
      {
        id: 2,
        name: 'Modern Reading Glasses',
        meta: 'Frame Size: Large | Color: Black',
        price: 224.10,
        originalPrice: 249.00,
        quantity: 1,
        image: '/images/reading.jpg'
      }
    ],
    subtotal: 2047.00,
    discount: 24.07,
    discountCode: 'YVW10',
    shipping: 0,
    shippingFee: 10.50,
    total: 2032.60
  };

  return (
    <PageContainer>
      <LeftPanel>
        <ThankYouTitle>Thank you.</ThankYouTitle>
        <ConfirmationText>
          Your order was completed successfully.
        </ConfirmationText>
        <ConfirmationText>
          We will send you an email with your order confirmation shortly.
        </ConfirmationText>
        
        <HelpSection>
          <HelpText>
            NEED HELP? Call +92 311 478 2424
          </HelpText>
        </HelpSection>
      </LeftPanel>

      <RightPanel>
        <OrderHeader>
          <OrderNumber>YOUR ORDER NUMBER IS</OrderNumber>
          <OrderId>{orderData.orderNumber}</OrderId>
        </OrderHeader>

        {orderData.items.map((item) => (
          <ProductItem key={item.id}>
            <RemoveButton>×</RemoveButton>
            <ProductImage image={item.image} />
            <ProductDetails>
              <ProductName>{item.name}</ProductName>
              <ProductMeta>{item.meta}</ProductMeta>
              <QuantityControls>
                <QuantityButton>-</QuantityButton>
                <Quantity>{item.quantity}</Quantity>
                <QuantityButton>+</QuantityButton>
              </QuantityControls>
            </ProductDetails>
            <ProductPrice>
              {item.originalPrice && (
                <OriginalPrice>PKR {(typeof item.originalPrice === 'number' ? item.originalPrice : parseFloat(item.originalPrice) || 0).toFixed(2)}</OriginalPrice>
              )}
              PKR {(typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0).toFixed(2)}
            </ProductPrice>
          </ProductItem>
        ))}

        <SummarySection>
          <SummaryRow>
            <span>Subtotal</span>
            <span>PKR {(typeof orderData.subtotal === 'number' ? orderData.subtotal : parseFloat(orderData.subtotal) || 0).toFixed(2)}</span>
          </SummaryRow>
          
          {orderData.discountCode && (
            <SummaryRow>
              <span>{orderData.discountCode}</span>
              <span style={{ color: '#28a745' }}>-PKR {(typeof orderData.discount === 'number' ? orderData.discount : parseFloat(orderData.discount) || 0).toFixed(2)}</span>
            </SummaryRow>
          )}
          
          <SummaryRow>
            <span>Shipping</span>
            <span>{orderData.shipping === 0 ? 'FREE' : `PKR ${(typeof orderData.shipping === 'number' ? orderData.shipping : parseFloat(orderData.shipping) || 0).toFixed(2)}`}</span>
          </SummaryRow>
          
          {orderData.shippingFee > 0 && (
            <SummaryRow>
              <span>California Recycling Fee</span>
              <span>PKR {(typeof orderData.shippingFee === 'number' ? orderData.shippingFee : parseFloat(orderData.shippingFee) || 0).toFixed(2)}</span>
            </SummaryRow>
          )}
          
          <SummaryRow className="total">
            <span>Order Total</span>
            <span>PKR {(typeof orderData.total === 'number' ? orderData.total : parseFloat(orderData.total) || 0).toFixed(2)}</span>
          </SummaryRow>
        </SummarySection>

        <PromoSection>
          <PromoCode>PROMO CODE</PromoCode>
        </PromoSection>
      </RightPanel>
    </PageContainer>
  );
};

export default OrderConfirmationPage;
