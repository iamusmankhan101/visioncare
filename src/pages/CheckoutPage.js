import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useForm } from 'react-hook-form';
import { sendOrderConfirmationEmail, sendOrderNotificationToAdmin } from '../services/emailService';
import { saveOrder } from '../services/orderService';
import { sendOrderWhatsAppNotification } from '../services/whatsappService';
import formatPrice from '../utils/formatPrice';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #333;
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 2rem;
  color: #333;
`;

const CheckoutContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const FormSection = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const OrderSummary = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  height: fit-content;
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  margin-bottom: 1.5rem;
  color: #333;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  box-sizing: border-box;
  
  &:focus {
    outline: none;
    border-color: #48b2ee;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  background-color: white;
  box-sizing: border-box;
  
  &:focus {
    outline: none;
    border-color: #48b2ee;
  }
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
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
  margin-top: 2rem;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #3a9de8;
  }
  
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const OrderItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid #eee;
  
  &:last-child {
    border-bottom: none;
  }
`;

const ItemInfo = styled.div`
  flex: 1;
`;

const ItemName = styled.div`
  font-weight: 500;
  margin-bottom: 0.25rem;
`;

const ItemDetails = styled.div`
  font-size: 0.9rem;
  color: #666;
`;

const ItemPrice = styled.div`
  font-weight: 600;
  color: #333;
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
`;

const DiscountSection = styled.div`
  margin: 1rem 0;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 4px;
`;

const DiscountInput = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const DiscountCode = styled.input`
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const ApplyButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: #48b2ee;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background-color: #3a9de8;
  }
`;

const PaymentSection = styled.div`
  margin-top: 2rem;
`;

const PaymentOption = styled.div`
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-bottom: 1rem;
  overflow: hidden;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #48b2ee;
  }
`;

const PaymentHeader = styled.div`
  padding: 1rem;
  background-color: ${props => props.selected ? '#f8f9ff' : '#f8f9fa'};
  border-bottom: ${props => props.selected ? '1px solid #48b2ee' : 'none'};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: #f0f8ff;
  }
`;

const PaymentTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
  color: #333;
`;

const PaymentRadio = styled.input`
  width: 18px;
  height: 18px;
  accent-color: #48b2ee;
`;

const PaymentIcon = styled.div`
  font-size: 1.2rem;
`;

const AccordionIcon = styled.div`
  font-size: 1rem;
  color: #666;
  transform: ${props => props.expanded ? 'rotate(180deg)' : 'rotate(0deg)'};
  transition: transform 0.3s ease;
`;

const PaymentContent = styled.div`
  max-height: ${props => props.expanded ? '400px' : '0'};
  overflow: hidden;
  transition: max-height 0.3s ease;
  background-color: white;
`;

const PaymentForm = styled.div`
  padding: 1.5rem;
  border-top: 1px solid #eee;
`;

const CardFormRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const CODInfo = styled.div`
  padding: 1.5rem;
  background-color: #f8f9fa;
  border-top: 1px solid #eee;
  
  h4 {
    margin: 0 0 0.5rem 0;
    color: #333;
    font-size: 1rem;
  }
  
  p {
    margin: 0;
    color: #666;
    font-size: 0.9rem;
    line-height: 1.4;
  }
  
  ul {
    margin: 0.5rem 0 0 1rem;
    color: #666;
    font-size: 0.9rem;
    
    li {
      margin-bottom: 0.25rem;
    }
  }
`;

const CheckoutPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [discountCode, setDiscountCode] = useState('');
  const [selectedPayment, setSelectedPayment] = useState('card');
  const navigate = useNavigate();
  const cartItems = useSelector(state => state.cart.items) || [];

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => {
    const itemPrice = parseFloat(item.price?.toString().replace(/[^\d.-]/g, '')) || 0;
    const quantity = item.quantity || 1;
    return sum + (itemPrice * quantity);
  }, 0);

  // Shipping logic: PKR 200 if order below PKR 5000, free above
  const shipping = subtotal < 5000 ? 200 : 0;
  const total = subtotal + shipping;

  const [appliedDiscount, setAppliedDiscount] = useState(0);

  const handleApplyDiscount = () => {
    // Simple discount logic
    if (discountCode.toUpperCase() === 'SAVE10') {
      setAppliedDiscount(subtotal * 0.1);
    } else if (discountCode.toUpperCase() === 'WELCOME') {
      setAppliedDiscount(25);
    } else {
      setAppliedDiscount(0);
      alert('Invalid discount code');
    }
  };

  const finalTotal = total - appliedDiscount;

  const onSubmit = async (data) => {
    const orderData = {
      orderNumber: `EW${Date.now().toString().slice(-6)}`,
      items: cartItems,
      subtotal,
      shippingCost: shipping,
      discountAmount: appliedDiscount,
      taxAmount: 0, // Add tax amount (0 for now)
      total: finalTotal,
      customerInfo: {
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        phone: data.phone || ''
      },
      shippingAddress: {
        street: data.address || '',
        city: data.city || '',
        state: data.state || '',
        zipCode: data.zipCode || '',
        country: data.country || 'Pakistan'
      },
      billingAddress: {
        street: data.address || '',
        city: data.city || '',
        state: data.state || '',
        zipCode: data.zipCode || '',
        country: data.country || 'Pakistan'
      },
      paymentMethod: selectedPayment,
      notes: data.notes || ''
    };

    try {
      console.log('🛒 Checkout: Starting order submission...');
      console.log('📦 Checkout: Order data:', orderData);
      
      // Save order first
      const savedOrder = await saveOrder(orderData);
      console.log('✅ Checkout: Order saved successfully:', savedOrder);
      
      // Send email confirmation to customer
      const emailResult = await sendOrderConfirmationEmail(orderData);
      if (emailResult.success) {
        console.log('Order confirmation email sent successfully');
      } else {
        console.warn('Email confirmation failed:', emailResult.error);
        // Don't block the order process if email fails
      }
      
      // Send order notification to admin
      const adminEmailResult = await sendOrderNotificationToAdmin(orderData);
      if (adminEmailResult.success) {
        console.log('Admin order notification sent successfully');
      } else {
        console.warn('Admin email notification failed:', adminEmailResult.error);
        // Don't block the order process if admin email fails
      }
      
      // Send WhatsApp notification to business owner for order dispatch
      const whatsappResult = await sendOrderWhatsAppNotification(orderData);
      if (whatsappResult.success) {
        console.log('WhatsApp notification sent successfully');
      } else {
        console.warn('WhatsApp notification failed:', whatsappResult.error);
        // Don't block the order process if WhatsApp fails
      }
      
      // Send push notification to admin mobile devices
      try {
        if (window.notificationInit && window.notificationInit.isInitialized) {
          await window.notificationInit.handleNewOrder(orderData);
          console.log('Push notifications sent successfully');
        } else {
          console.warn('Push notification service not available');
        }
      } catch (error) {
        console.warn('Push notification failed:', error);
        // Don't block the order process if push notifications fail
      }
      
      navigate('/order-confirmation', { state: { orderData } });
    } catch (error) {
      console.error('❌ Checkout: Order processing error:', error);
      console.error('❌ Checkout: Error details:', error.message);
      console.error('❌ Checkout: Error stack:', error.stack);
      alert(`There was an error processing your order: ${error.message}. Please try again.`);
    }
  };

  return (
    <Container>
      <Title>Checkout</Title>
      <CheckoutContainer>
        <FormSection>
          <form onSubmit={handleSubmit(onSubmit)}>
            <SectionTitle>Billing Information</SectionTitle>
            
            <FormRow>
              <FormGroup>
                <Label>First Name</Label>
                <Input 
                  {...register('firstName', { required: 'First name is required' })}
                  placeholder="John"
                />
                {errors.firstName && <span style={{color: 'red', fontSize: '0.8rem'}}>{errors.firstName.message}</span>}
              </FormGroup>
              <FormGroup>
                <Label>Last Name</Label>
                <Input 
                  {...register('lastName', { required: 'Last name is required' })}
                  placeholder="Doe"
                />
                {errors.lastName && <span style={{color: 'red', fontSize: '0.8rem'}}>{errors.lastName.message}</span>}
              </FormGroup>
            </FormRow>

            <FormGroup>
              <Label>Email</Label>
              <Input 
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address"
                  }
                })}
                type="email"
                placeholder="john@example.com"
              />
              {errors.email && <span style={{color: 'red', fontSize: '0.8rem'}}>{errors.email.message}</span>}
            </FormGroup>

            <FormGroup>
              <Label>Phone</Label>
              <Input 
                {...register('phone', { required: 'Phone number is required' })}
                placeholder="+1 (555) 123-4567"
              />
              {errors.phone && <span style={{color: 'red', fontSize: '0.8rem'}}>{errors.phone.message}</span>}
            </FormGroup>

            <SectionTitle style={{marginTop: '2rem'}}>Shipping Address</SectionTitle>
            
            <FormGroup>
              <Label>Address</Label>
              <Input 
                {...register('address', { required: 'Address is required' })}
                placeholder="123 Main Street"
              />
              {errors.address && <span style={{color: 'red', fontSize: '0.8rem'}}>{errors.address.message}</span>}
            </FormGroup>

            <FormRow>
              <FormGroup>
                <Label>City</Label>
                <Input 
                  {...register('city', { required: 'City is required' })}
                  placeholder="New York"
                />
                {errors.city && <span style={{color: 'red', fontSize: '0.8rem'}}>{errors.city.message}</span>}
              </FormGroup>
              <FormGroup>
                <Label>State</Label>
                <Select {...register('state', { required: 'State is required' })}>
                  <option value="">Select State</option>
                  <option value="NY">New York</option>
                  <option value="CA">California</option>
                  <option value="TX">Texas</option>
                  <option value="FL">Florida</option>
                </Select>
                {errors.state && <span style={{color: 'red', fontSize: '0.8rem'}}>{errors.state.message}</span>}
              </FormGroup>
            </FormRow>

            <FormRow>
              <FormGroup>
                <Label>ZIP Code</Label>
                <Input 
                  {...register('zipCode', { required: 'ZIP code is required' })}
                  placeholder="10001"
                />
                {errors.zipCode && <span style={{color: 'red', fontSize: '0.8rem'}}>{errors.zipCode.message}</span>}
              </FormGroup>
              <FormGroup>
                <Label>Country</Label>
                <Select {...register('country', { required: 'Country is required' })} defaultValue="US">
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="UK">United Kingdom</option>
                </Select>
                {errors.country && <span style={{color: 'red', fontSize: '0.8rem'}}>{errors.country.message}</span>}
              </FormGroup>
            </FormRow>

            <PaymentSection>
              <SectionTitle>Payment Information</SectionTitle>
              
              {/* Credit Card Payment Option */}
              <PaymentOption>
                <PaymentHeader 
                  selected={selectedPayment === 'card'}
                  onClick={() => setSelectedPayment('card')}
                >
                  <PaymentTitle>
                    <PaymentRadio
                      type="radio"
                      name="payment"
                      value="card"
                      checked={selectedPayment === 'card'}
                      onChange={(e) => setSelectedPayment(e.target.value)}
                    />
                    <PaymentIcon>💳</PaymentIcon>
                    Credit / Debit Card
                  </PaymentTitle>
                  <AccordionIcon expanded={selectedPayment === 'card'}>
                    ▼
                  </AccordionIcon>
                </PaymentHeader>
                
                <PaymentContent expanded={selectedPayment === 'card'}>
                  <PaymentForm>
                    <FormGroup>
                      <Label>Card Number</Label>
                      <Input 
                        {...register('cardNumber', { 
                          required: selectedPayment === 'card' ? 'Card number is required' : false 
                        })}
                        placeholder="1234 5678 9012 3456"
                      />
                      {errors.cardNumber && <span style={{color: 'red', fontSize: '0.8rem'}}>{errors.cardNumber.message}</span>}
                    </FormGroup>

                    <CardFormRow>
                      <FormGroup>
                        <Label>Expiry Date</Label>
                        <Input 
                          {...register('expiryDate', { 
                            required: selectedPayment === 'card' ? 'Expiry date is required' : false 
                          })}
                          placeholder="MM/YY"
                        />
                        {errors.expiryDate && <span style={{color: 'red', fontSize: '0.8rem'}}>{errors.expiryDate.message}</span>}
                      </FormGroup>
                      <FormGroup>
                        <Label>CVV</Label>
                        <Input 
                          {...register('cvv', { 
                            required: selectedPayment === 'card' ? 'CVV is required' : false 
                          })}
                          placeholder="123"
                        />
                        {errors.cvv && <span style={{color: 'red', fontSize: '0.8rem'}}>{errors.cvv.message}</span>}
                      </FormGroup>
                    </CardFormRow>

                    <FormGroup>
                      <Label>Cardholder Name</Label>
                      <Input 
                        {...register('cardholderName', { 
                          required: selectedPayment === 'card' ? 'Cardholder name is required' : false 
                        })}
                        placeholder="John Doe"
                      />
                      {errors.cardholderName && <span style={{color: 'red', fontSize: '0.8rem'}}>{errors.cardholderName.message}</span>}
                    </FormGroup>
                  </PaymentForm>
                </PaymentContent>
              </PaymentOption>

              {/* Cash on Delivery Option */}
              <PaymentOption>
                <PaymentHeader 
                  selected={selectedPayment === 'cod'}
                  onClick={() => setSelectedPayment('cod')}
                >
                  <PaymentTitle>
                    <PaymentRadio
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={selectedPayment === 'cod'}
                      onChange={(e) => setSelectedPayment(e.target.value)}
                    />
                    <PaymentIcon>💵</PaymentIcon>
                    Cash on Delivery (COD)
                  </PaymentTitle>
                  <AccordionIcon expanded={selectedPayment === 'cod'}>
                    ▼
                  </AccordionIcon>
                </PaymentHeader>
                
                <PaymentContent expanded={selectedPayment === 'cod'}>
                  <CODInfo>
                    <h4>Cash on Delivery</h4>
                    <p>Pay with cash when your order arrives.</p>
                  </CODInfo>
                </PaymentContent>
              </PaymentOption>
            </PaymentSection>

            <CheckoutButton type="submit">
              Complete Order
            </CheckoutButton>
          </form>
        </FormSection>

        <OrderSummary>
          <SectionTitle>Order Summary</SectionTitle>
          
          {cartItems.length === 0 ? (
            <div style={{textAlign: 'center', color: '#666', padding: '2rem'}}>
              Your cart is empty
            </div>
          ) : (
            <>
              {cartItems.map((item) => (
                <OrderItem key={item.id}>
                  <ItemInfo>
                    <ItemName>{item.name}</ItemName>
                    <ItemDetails>
                      {item.selectedColor && `Color: ${item.selectedColor}`}
                      {item.selectedSize && ` • Size: ${item.selectedSize}`}
                      {item.quantity && ` • Qty: ${item.quantity}`}
                    </ItemDetails>
                  </ItemInfo>
                  <ItemPrice>{formatPrice(item.price * (item.quantity || 1))}</ItemPrice>
                </OrderItem>
              ))}

              <DiscountSection>
                <div style={{marginBottom: '0.5rem', fontWeight: '500'}}>Discount Code</div>
                <DiscountInput>
                  <DiscountCode
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    placeholder="Enter code"
                  />
                  <ApplyButton onClick={handleApplyDiscount}>
                    Apply
                  </ApplyButton>
                </DiscountInput>
              </DiscountSection>

              <div style={{marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #eee'}}>
                <SummaryRow>
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </SummaryRow>
                <SummaryRow>
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
                </SummaryRow>
                {appliedDiscount > 0 && (
                  <SummaryRow>
                    <span>Discount</span>
                    <span style={{color: 'green'}}>-{formatPrice(appliedDiscount)}</span>
                  </SummaryRow>
                )}
                <SummaryRow className="total">
                  <span>Total</span>
                  <span>{formatPrice(finalTotal)}</span>
                </SummaryRow>
              </div>
            </>
          )}
        </OrderSummary>
      </CheckoutContainer>
    </Container>
  );
};

export default CheckoutPage;
