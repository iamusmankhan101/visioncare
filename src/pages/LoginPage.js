import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

// Styled Components
const PageContainer = styled.div`
  max-width: 400px;
  margin: 80px auto;
  padding: 2rem;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  font-family: 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
`;

const PageTitle = styled.h1`
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  text-align: center;
  color: #2c3e50;
  font-weight: 600;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  color: #555;
  font-weight: 500;
`;

const Input = styled.input`
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s;
  
  &:focus {
    outline: none;
    border-color: #48b2ee;
  }
  
  &.error {
    border-color: #e74c3c;
  }
`;

const SubmitButton = styled.button`
  background-color: #48b2ee;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.8rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-top: 1rem;
  
  &:hover {
    background-color: #c85048;
  }
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  font-size: 0.85rem;
  margin-top: 0.5rem;
`;

const SuccessMessage = styled.div`
  color: #2ecc71;
  font-size: 0.9rem;
  text-align: center;
  margin-bottom: 1rem;
  padding: 0.5rem;
  background-color: #f0fff0;
  border-radius: 4px;
`;

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    // Comment out or remove the automatic redirection
    /* if (token) {
      navigate('/admin');
    } */
  }, [navigate]);
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    
    // Clear error when user starts typing
    if (error) setError('');
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001';
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = { message: text };
      }
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      
      // Store token in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('userRole', data.user?.role || 'user');
      
      // Show success message and redirect to account
      setSuccess('Login successful! Redirecting to your account...');
      
      // Redirect to account page after successful login
      setTimeout(() => {
        navigate('/account');
      }, 1000);
      
    } catch (error) {
      setError(error.message || 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <PageContainer>
      <PageTitle>Login</PageTitle>
      
      {success && <SuccessMessage>{success}</SuccessMessage>}
      {error && <ErrorMessage>{error}</ErrorMessage>}
      
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="email">Email</Label>
          <Input 
            type="email" 
            id="email" 
            name="email" 
            value={formData.email} 
            onChange={handleChange} 
            required 
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="password">Password</Label>
          <Input 
            type="password" 
            id="password" 
            name="password" 
            value={formData.password} 
            onChange={handleChange} 
            required 
          />
        </FormGroup>
        
        <SubmitButton type="submit" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </SubmitButton>
      </Form>
    </PageContainer>
  );
};

export default LoginPage;