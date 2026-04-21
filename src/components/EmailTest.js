import React, { useState } from 'react';
import styled from 'styled-components';
import { sendOrderConfirmationEmail, testEmailJSConnection, sendOrderNotificationToAdmin } from '../services/emailService';

const TestContainer = styled.div`
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
`;

const Title = styled.h2`
  color: #333;
  margin-bottom: 1.5rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
`;

const Button = styled.button`
  background: #48b2ee;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  
  &:hover {
    background: #3a9bd9;
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const Result = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 6px;
  background: ${props => props.success ? '#d4edda' : '#f8d7da'};
  color: ${props => props.success ? '#155724' : '#721c24'};
  border: 1px solid ${props => props.success ? '#c3e6cb' : '#f5c6cb'};
`;

const EmailTest = () => {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [testingAdmin, setTestingAdmin] = useState(false);
  const [result, setResult] = useState(null);
  const [connectionResult, setConnectionResult] = useState(null);
  const [adminResult, setAdminResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    // Create test order data
    const testOrderData = {
      orderNumber: `TEST-${Date.now()}`,
      items: [
        {
          name: 'Test Eyeglasses',
          price: 2500,
          quantity: 1
        }
      ],
      subtotal: 2500,
      shipping: 200,
      discount: 0,
      total: 2700,
      customerInfo: {
        firstName,
        lastName,
        email,
        address: 'Test Address 123',
        city: 'Karachi',
        state: 'Sindh',
        zipCode: '75500',
        countryCode: '+92',
        phone: '3001234567'
      },
      paymentMethod: 'cod'
    };

    try {
      const emailResult = await sendOrderConfirmationEmail(testOrderData);
      setResult({
        success: emailResult.success,
        message: emailResult.success 
          ? 'Test email sent successfully! Check your inbox.' 
          : `Email failed: ${emailResult.error}`
      });
    } catch (error) {
      setResult({
        success: false,
        message: `Error: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConnectionTest = async () => {
    setTestingConnection(true);
    setConnectionResult(null);

    try {
      const result = await testEmailJSConnection();
      setConnectionResult({
        success: result.success,
        message: result.success 
          ? 'EmailJS connection test successful!' 
          : `Connection test failed: ${result.error}`
      });
    } catch (error) {
      setConnectionResult({
        success: false,
        message: `Connection test error: ${error.message}`
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleAdminTest = async () => {
    setTestingAdmin(true);
    setAdminResult(null);

    // Create test order data
    const testOrderData = {
      orderNumber: `ADMIN-TEST-${Date.now()}`,
      items: [
        {
          name: 'Test Admin Notification Eyeglasses',
          price: 3500,
          quantity: 1
        }
      ],
      subtotal: 3500,
      shipping: 250,
      discount: 0,
      total: 3750,
      customerInfo: {
        firstName: firstName || 'Test',
        lastName: lastName || 'Customer',
        email: email || 'customer@test.com',
        address: 'Test Address 456',
        city: 'Lahore',
        state: 'Punjab',
        zipCode: '54000',
        countryCode: '+92',
        phone: '3009876543'
      },
      paymentMethod: 'cod'
    };

    try {
      const adminResult = await sendOrderNotificationToAdmin(testOrderData);
      setAdminResult({
        success: adminResult.success,
        message: adminResult.success 
          ? 'Admin notification sent successfully! Check iamusmankhan101@gmail.com' 
          : `Admin notification failed: ${adminResult.error}`
      });
    } catch (error) {
      setAdminResult({
        success: false,
        message: `Admin notification error: ${error.message}`
      });
    } finally {
      setTestingAdmin(false);
    }
  };

  return (
    <TestContainer>
      <Title>EmailJS Test - Order Confirmation</Title>
      <Form onSubmit={handleSubmit}>
        <Input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
        <Input
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />
        <Input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Button type="submit" disabled={loading}>
          {loading ? 'Sending...' : 'Send Test Email'}
        </Button>
        
        <Button type="button" onClick={handleConnectionTest} disabled={testingConnection}>
          {testingConnection ? 'Testing Connection...' : 'Test EmailJS Connection'}
        </Button>
        
        <Button type="button" onClick={handleAdminTest} disabled={testingAdmin}>
          {testingAdmin ? 'Sending Admin Test...' : 'Test Admin Notification'}
        </Button>
      </Form>
      
      {connectionResult && (
        <Result success={connectionResult.success}>
          <strong>Connection Test:</strong> {connectionResult.message}
        </Result>
      )}
      
      {adminResult && (
        <Result success={adminResult.success}>
          <strong>Admin Notification Test:</strong> {adminResult.message}
        </Result>
      )}
      
      {result && (
        <Result success={result.success}>
          <strong>Customer Email Test:</strong> {result.message}
        </Result>
      )}
    </TestContainer>
  );
};

export default EmailTest;
