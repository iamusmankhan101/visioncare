import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useForm } from 'react-hook-form';
import { sendOrderConfirmationEmail } from '../services/emailService';
import { saveOrder } from '../services/orderService';

// Styled Components
const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
  color: #333;
  background-color: #f8f9fa;
  display: flex;
  gap: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.5rem;
  }
`;

const LeftPanel = styled.div`
  flex: 1;
  background-color: #fff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  height: fit-content;
  
  @media (max-width: 768px) {
    padding: 1.5rem;
  }
  
  @media (max-width: 480px) {
    padding: 1rem;
    border-radius: 4px;
  }
`;

const RightPanel = styled.div`
  width: 400px;
  background-color: #fff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  height: fit-content;
  
  @media (max-width: 768px) {
    width: 100%;
    padding: 1.5rem;
  }
  
  @media (max-width: 480px) {
    padding: 1rem;
    border-radius: 4px;
    width:91%
  }
`;

const Section = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #333;
  
  @media (max-width: 480px) {
    font-size: 1.1rem;
    margin-bottom: 0.75rem;
  }
`;

const FormRow = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  @media (max-width: 480px) {
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }
`;

const OrderSummaryTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #333;
  
  @media (max-width: 480px) {
    font-size: 1.3rem;
    margin-bottom: 1rem;
  }
`;

const ProductItem = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid #eee;
  
  &:last-child {
    border-bottom: none;
  }
  
  @media (max-width: 480px) {
    padding: 0.75rem 0;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
`;

const ProductImage = styled.div`
  width: 60px;
  height: 60px;
  background-color: #f5f5f5;
  border-radius: 4px;
  margin-right: 1rem;
  background-image: url(${props => props.image});
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  
  @media (max-width: 480px) {
    width: 50px;
    height: 50px;
    margin-right: 0.75rem;
  }
`;

const ProductDetails = styled.div`
  flex: 1;
`;

const ProductName = styled.div`
  font-weight: 600;
  margin-bottom: 0.25rem;
  
  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`;

const ProductMeta = styled.div`
  font-size: 0.9rem;
  color: #666;
`;

const ProductPrice = styled.div`
  font-weight: 600;
  color: #333;
  
  @media (max-width: 480px) {
    font-size: 0.9rem;
    align-self: flex-end;
  }
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  
  &.total {
    font-weight: 600;
    font-size: 1.1rem;
    padding-top: 1rem;
    border-top: 1px solid #eee;
    margin-top: 1rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.9rem;
    
    &.total {
      font-size: 1rem;
    }
  }
`;

const DiscountInput = styled.div`
  display: flex;
  gap: 0.5rem;
  margin: 1rem 0;
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 0.75rem;
  }
`;

const DiscountCode = styled.input`
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 10px;
  font-size: 1rem;
`;

const ApplyButton = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: #48b2ee;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  
  &:hover {
    background-color: #555;
  }
`;

const FormGroup = styled.div`
  flex: 1;
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 10px;
  font-size: 1rem;
  box-sizing: border-box;
  
  &:focus {
    outline: none;
    border-color: #48b2ee;
  }
  
  @media (max-width: 480px) {
    padding: 0.65rem;
    font-size: 0.95rem;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 10px;
  font-size: 1rem;
  background-color: white;
  box-sizing: border-box;
  
  &:focus {
    outline: none;
    border-color: #48b2ee;
  }
  
  @media (max-width: 480px) {
    padding: 0.65rem;
    font-size: 0.95rem;
  }
`;

const PhoneInputContainer = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const CountryCode = styled.select`
  width: 80px;
  padding: 0.75rem 0.5rem;
  border: 1px solid #ddd;
  border-radius: 10px;
  font-size: 1rem;
  background-color: white;
  box-sizing: border-box;
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const Checkbox = styled.input`
  width: auto;
`;

const CheckboxLabel = styled.label`
  font-size: 0.9rem;
  color: #666;
  margin: 0;
`;

const ShippingOption = styled.div`
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 1rem;
  margin-bottom: 0.5rem;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  &:hover {
    border-color: #48b2ee;
  }
  
  ${props => props.selected && `
    border-color: #48b2ee;
    background-color: #f8f9fa;
  `}
`;

const RadioInput = styled.input`
  margin-right: 0.5rem;
`;

const ShippingDetails = styled.div`
  flex: 1;
`;

const ShippingTitle = styled.div`
  font-weight: 600;
  margin-bottom: 0.25rem;
`;

const ShippingTime = styled.div`
  font-size: 0.9rem;
  color: #666;
`;

const ShippingPrice = styled.div`
  font-weight: 600;
  color: #333;
`;

const PaymentOption = styled.div`
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 1rem;
  margin-bottom: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  
  &:hover {
    border-color: #48b2ee;
  }
  
  ${props => props.selected && `
    border-color: #48b2ee;
    background-color: #f8f9fa;
  `}
`;

const PaymentTitle = styled.div`
  font-weight: 600;
  margin-left: 0.5rem;
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 1rem;
  background-color: #48b2ee;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 2rem;
  
  &:hover {
    background-color: #3a9de8;
  }
  
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
  
  @media (max-width: 480px) {
    padding: 0.875rem;
    font-size: 1rem;
    margin-top: 1.5rem;
  }
`;

const CheckoutPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [selectedShipping, setSelectedShipping] = useState('standard');
  const [selectedPayment, setSelectedPayment] = useState('cod');
  const [saveInfo, setSaveInfo] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const navigate = useNavigate();
  const cartItems = useSelector(state => state.cart.items) || [];

  // Sample cart items for display
  const sampleItems = [
    {
      id: 1,
      name: 'Dining Chair Eaton • 105',
      meta: 'Armchair, Lemon Finish | Color: Antique',
      price: 952,
      image: '/images/chair1.jpg'
    },
    {
      id: 2,
      name: 'Dining Chair Edmund 194',
      meta: 'Armchair, Lemon Finish | Color: Copper Color',
      price: 1490,
      image: '/images/chair2.jpg'
    },
    {
      id: 3,
      name: 'Dining Chair Okavango-231',
      meta: 'Armchair, Metal | Color: Black',
      price: 1306,
      image: '/images/chair3.jpg'
    }
  ];

  const displayItems = cartItems.length > 0 ? cartItems : sampleItems;
  
  // Calculate accurate pricing
  const subtotal = displayItems.reduce((sum, item) => {
    const itemPrice = parseFloat(item.price?.toString().replace(/[^\d.-]/g, '')) || 0;
    const quantity = item.quantity || 1;
    return sum + (itemPrice * quantity);
  }, 0);
  
  // Calculate shipping cost with free shipping logic
  const calculateShippingCost = () => {
    if (subtotal >= 5000) {
      return 0; // Free shipping for orders above PKR 5,000
    }
    return selectedShipping === 'standard' ? 200 : 500;
  };
  
  const shippingCost = calculateShippingCost();
  
  // Apply discount based on discount code
  const applyDiscount = (code, subtotal) => {
    const discountCodes = {
      'SAVE10': 0.10, // 10% off
      'SAVE20': 0.20, // 20% off
      'WELCOME': 0.15, // 15% off for new customers
      'EYEWEAR50': 50, // Fixed PKR 50 off
      'EYEWEAR100': 100 // Fixed PKR 100 off
    };
    
    if (discountCodes[code.toUpperCase()]) {
      const discountValue = discountCodes[code.toUpperCase()];
      if (discountValue < 1) {
        // Percentage discount
        return subtotal * discountValue;
      } else {
        // Fixed amount discount
        return Math.min(discountValue, subtotal);
      }
    }
    return 0;
  };
  
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [discountApplied, setDiscountApplied] = useState(false);
  
  const handleApplyDiscount = () => {
    const discount = applyDiscount(discountCode, subtotal);
    setAppliedDiscount(discount);
    setDiscountApplied(true);
    if (discount > 0) {
      alert(`Discount applied! You saved PKR ${discount.toFixed(2)}`);
    } else {
      alert('Invalid discount code');
      setAppliedDiscount(0);
      setDiscountApplied(false);
    }
  };
  
  const total = subtotal + shippingCost - appliedDiscount;

  const onSubmit = async (data) => {
    console.log('Order submitted:', {
      ...data,
      shipping: selectedShipping,
      payment: selectedPayment,
      items: displayItems,
      total
    });
    
    // Validate required fields
    if (!data.firstName || !data.lastName || !data.address || !data.city || !data.state || !data.zipCode || !data.phone || !data.countryCode || !data.email) {
      alert('Please fill in all required fields');
      return;
    }
    
    const orderData = {
      orderNumber: `EW${Date.now().toString().slice(-6)}`,
      items: displayItems,
      subtotal: subtotal,
      discount: appliedDiscount,
      discountCode: discountApplied ? discountCode : null,
      shipping: shippingCost,
      total: total,
      customerInfo: data,
      shippingAddress: {
        address: data.address,
        city: data.city,
        state: data.state,
        postalCode: data.zipCode,
        country: data.countryCode
      },
      paymentMethod: selectedPayment === 'cod' ? 'Cash on Delivery' : 'Card Payment'
    };
    
    try {
      // Save order to database
      const savedOrder = await saveOrder(orderData);
      console.log('Order saved successfully:', savedOrder);
      
      // Send confirmation email
      const emailResult = await sendOrderConfirmationEmail(orderData);
      if (emailResult.success) {
        console.log('Confirmation email sent successfully');
      } else {
        console.error('Failed to send confirmation email:', emailResult.error);
        // Still proceed with order even if email fails
      }
    } catch (error) {
      console.error('Order processing error:', error);
      // Still proceed to confirmation page even if there are errors
    }
    
    // Navigate to order confirmation page with order data
    navigate('/order-confirmation', {
      state: {
        orderData: orderData
      }
    });
  };

  return (
    <PageContainer>
      <LeftPanel>
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Delivery Address Section */}
          <Section>
            <SectionTitle>Delivery Address</SectionTitle>
            
            <FormRow>
              <FormGroup>
                <Label>First name</Label>
                <Input 
                  {...register('firstName', { required: true })}
                  placeholder="Enter first name"
                />
              </FormGroup>
              <FormGroup>
                <Label>Last name</Label>
                <Input 
                  {...register('lastName', { required: true })}
                  placeholder="Enter last name"
                />
              </FormGroup>
            </FormRow>

            <FormGroup>
              <Label>Address</Label>
              <Input 
                {...register('address', { required: true })}
                placeholder="Enter delivery address"
              />
            </FormGroup>

            <FormRow>
              <FormGroup>
                <Label>City</Label>
                <Select {...register('city', { required: true })}>
                  <option value="">Select</option>
                  <option value="karachi">Karachi</option>
                  <option value="lahore">Lahore</option>
                  <option value="islamabad">Islamabad</option>
                  <option value="rawalpindi">Rawalpindi</option>
                  <option value="faisalabad">Faisalabad</option>
                  <option value="multan">Multan</option>
                </Select>
              </FormGroup>
              <FormGroup>
                <Label>State</Label>
                <Select {...register('state', { required: true })}>
                  <option value="">Select</option>
                  <option value="sindh">Sindh</option>
                  <option value="punjab">Punjab</option>
                  <option value="kpk">KPK</option>
                  <option value="balochistan">Balochistan</option>
                </Select>
              </FormGroup>
              <FormGroup>
                <Label>Zip code</Label>
                <Input 
                  {...register('zipCode', { required: true })}
                  placeholder="Enter zip code"
                />
              </FormGroup>
            </FormRow>

            <FormGroup>
              <Label>Email</Label>
              <Input 
                {...register('email', { 
                  required: true,
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address"
                  }
                })}
                type="email"
                placeholder="Enter your email address"
              />
            </FormGroup>

            <FormGroup>
              <Label>Phone</Label>
              <PhoneInputContainer>
                <CountryCode {...register('countryCode', { required: true })}>
                  <option value="">Select</option>
                  <option value="+92">+92</option>
                  <option value="+1">+1</option>
                  <option value="+44">+44</option>
                </CountryCode>
                <Input 
                  {...register('phone', { required: true })}
                  placeholder="Enter your phone number"
                  style={{ flex: 1 }}
                />
              </PhoneInputContainer>
            </FormGroup>

            <CheckboxContainer>
              <Checkbox 
                type="checkbox"
                checked={saveInfo}
                onChange={(e) => setSaveInfo(e.target.checked)}
              />
              <CheckboxLabel>Save this information for next time</CheckboxLabel>
            </CheckboxContainer>
          </Section>

          {/* Shipping Method Section */}
          <Section>
            <SectionTitle>Shipping method</SectionTitle>
            
            {subtotal >= 5000 && (
              <div style={{ 
                background: '#d4edda', 
                border: '1px solid #c3e6cb', 
                borderRadius: '8px', 
                padding: '0.75rem', 
                marginBottom: '1rem',
                color: '#155724'
              }}>
                🎉 <strong>Congratulations!</strong> You qualify for FREE shipping!
              </div>
            )}
            
            <ShippingOption 
              selected={selectedShipping === 'standard'}
              onClick={() => setSelectedShipping('standard')}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <RadioInput 
                  type="radio"
                  name="shipping"
                  checked={selectedShipping === 'standard'}
                  onChange={() => setSelectedShipping('standard')}
                />
                <ShippingDetails>
                  <ShippingTitle>Standard shipping</ShippingTitle>
                  <ShippingTime>3-5 days</ShippingTime>
                </ShippingDetails>
              </div>
              <ShippingPrice>
                {subtotal >= 5000 ? (
                  <span style={{ color: '#28a745' }}>FREE</span>
                ) : (
                  'PKR 200'
                )}
              </ShippingPrice>
            </ShippingOption>

            <ShippingOption 
              selected={selectedShipping === 'expedited'}
              onClick={() => setSelectedShipping('expedited')}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <RadioInput 
                  type="radio"
                  name="shipping"
                  checked={selectedShipping === 'expedited'}
                  onChange={() => setSelectedShipping('expedited')}
                />
                <ShippingDetails>
                  <ShippingTitle>Expedited shipping</ShippingTitle>
                  <ShippingTime>1-2 days</ShippingTime>
                </ShippingDetails>
              </div>
              <ShippingPrice>PKR 500</ShippingPrice>
            </ShippingOption>
            
            {subtotal < 5000 && (
              <div style={{ 
                background: '#fff3cd', 
                border: '1px solid #ffeaa7', 
                borderRadius: '8px', 
                padding: '0.75rem', 
                marginTop: '1rem',
                color: '#856404',
                fontSize: '0.9rem'
              }}>
                💡 Add PKR {(5000 - subtotal).toFixed(2)} more to your order to get <strong>FREE shipping</strong>!
              </div>
            )}
          </Section>

          {/* Payment Section */}
          <Section>
            <SectionTitle>Payment</SectionTitle>
            
            <PaymentOption 
              selected={selectedPayment === 'cod'}
              onClick={() => setSelectedPayment('cod')}
            >
              <RadioInput 
                type="radio"
                name="payment"
                checked={selectedPayment === 'cod'}
                onChange={() => setSelectedPayment('cod')}
              />
              <PaymentTitle>Cash on Delivery</PaymentTitle>
            </PaymentOption>
          </Section>

          <SubmitButton type="submit">
            Pay now
          </SubmitButton>
        </form>
      </LeftPanel>

      <RightPanel>
        <OrderSummaryTitle>Order Summary</OrderSummaryTitle>
        
        {displayItems.map((item) => (
          <ProductItem key={item.id}>
            <ProductImage image={item.image} />
            <ProductDetails>
              <ProductName>{item.name}</ProductName>
              <ProductMeta>{item.meta || item.brand}</ProductMeta>
            </ProductDetails>
            <ProductPrice>PKR {item.price}</ProductPrice>
          </ProductItem>
        ))}

        <DiscountInput>
          <DiscountCode 
            placeholder="Discount code or gift card"
            value={discountCode}
            onChange={(e) => setDiscountCode(e.target.value)}
          />
          <ApplyButton onClick={handleApplyDiscount}>Apply</ApplyButton>
        </DiscountInput>

        <div style={{ marginTop: '1.5rem' }}>
          <SummaryRow>
            <span>Subtotal</span>
            <span>PKR {subtotal.toFixed(2)}</span>
          </SummaryRow>
          <SummaryRow>
            <span>Shipping</span>
            <span>
              {shippingCost === 0 ? (
                <span style={{ color: '#28a745' }}>FREE</span>
              ) : (
                `PKR ${shippingCost.toFixed(2)}`
              )}
            </span>
          </SummaryRow>
          {appliedDiscount > 0 && (
            <SummaryRow>
              <span>Discount {discountApplied && `(${discountCode.toUpperCase()})`}</span>
              <span style={{ color: '#28a745' }}>-PKR {appliedDiscount.toFixed(2)}</span>
            </SummaryRow>
          )}
          <SummaryRow className="total">
            <span>Total</span>
            <span>PKR {total.toFixed(2)}</span>
          </SummaryRow>
        </div>
      </RightPanel>
    </PageContainer>
  );
};

export default CheckoutPage;
