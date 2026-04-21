import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { loginStart, loginSuccess, loginFailure, registerStart, registerSuccess, registerFailure, clearError } from '../redux/slices/authSlice';

// Keyframes for gradient animation
const gradientShift = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

// Styled Components
const PageContainer = styled.div`
  height: 100vh;
  max-height: 100vh;
  display: flex;
  font-family: 'Inter', 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
  overflow-x: hidden;
  position: relative;
  
  @media (max-width: 768px) {
    flex-direction: column;
    height: 100vh;
    overflow-x: hidden;
  }
`;

const LeftPanel = styled.div`
  flex: 1;
  background: 
    linear-gradient(rgba(26, 0, 51, 0.7), rgba(255, 51, 102, 0.7)),
    url('/images/young-smiling-woman-sunglasses-green-natural-background-woman-portrait-green-leaf-background.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 3rem;
  overflow-y: hidden;
  color: white;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") repeat;
    opacity: 0.05;
  }
  
  @media (max-width: 768px) {
    height: 30vh;
    min-height: 200px;
    padding: 1.5rem;
    
    img {
      max-width: 120px !important;
    }
  }
  
  @media (max-width: 480px) {
    height: 25vh;
    min-height: 180px;
    padding: 1rem;
    
    img {
      max-width: 100px !important;
    }
  }
`;

const BrandSection = styled.div`
  position: relative;
  z-index: 2;
`;

const Quote = styled.div`
  font-size: 0.85rem;
  font-weight: 500;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-bottom: 2rem;
  opacity: 0.8;
`;

const MainHeading = styled.h1`
  font-size: 3.5rem;
  font-weight: 700;
  line-height: 1.1;
  margin: 0;
  background: linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const SubHeading = styled.p`
  font-size: 1.1rem;
  line-height: 1.6;
  margin-top: 1.5rem;
  opacity: 0.9;
  max-width: 400px;
`;

const BrandLogo = styled.div`
  position: absolute;
  bottom: 3rem;
  left: 3rem;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  
  &::before {
    content: '👓';
    font-size: 1.5rem;
  }
`;

const RightPanel = styled.div`
  flex: 1;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 2rem;
  overflow: hidden;
  height: 100%;
  
  @media (max-width: 768px) {
    flex: 1;
    width: 100%;
    padding: 1rem;
    overflow: hidden;
    min-height: 70vh;
    align-items: flex-start;
    padding-top: 2rem;
    padding-bottom: 2rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.5rem;
    min-height: 100vh;
    padding-top: 1rem;
    padding-bottom: 2rem;
    overflow: hidden;
  }
`;

const FormContainer = styled.div`
  width: 100%;
  max-width: 350px;
  box-sizing: border-box;
  
  @media (max-width: 768px) {
    max-width: 320px;
    padding: 0;
  }
  
  @media (max-width: 480px) {
    max-width: 320px;
    padding: 0;
  }
`;

const WelcomeTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 0.25rem 0;
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: 1.75rem;
    margin: 0 0 0.5rem 0;
  }
  
  @media (max-width: 480px) {
    font-size: 1.5rem;
    padding-top: 1rem;
  }
`;

const WelcomeSubtitle = styled.p`
  font-size: 0.9rem;
  color: #666;
  margin: 0 0 1rem 0;
  text-align: center;
  line-height: 1.4;
  
  @media (max-width: 768px) {
    font-size: 0.85rem;
    margin: 0 0 1.25rem 0;
  }
  
  @media (max-width: 480px) {
    font-size: 0.8rem;
    margin: 0 0 1rem 0;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 0.75rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 0.75rem;
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #1a1a1a;
  font-size: 0.9rem;
`;

const InputContainer = styled.div`
  position: relative;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  font-size: 0.9rem;
  box-sizing: border-box;
  transition: all 0.3s ease;
  background: #f8f9fa;
  min-width: 0;
  
  &:focus {
    outline: none;
    border-color: #007bff;
    background: white;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }
  
  &::placeholder {
    color: #9ca3af;
  }
  
  &.error {
    border-color: #dc3545;
  }
  
  @media (max-width: 768px) {
    padding: 0.875rem;
    font-size: 1rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.75rem;
    font-size: 0.95rem;
  }
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  
  &:hover {
    color: #374151;
    background: #f3f4f6;
  }
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0.75rem 0;
  
  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Checkbox = styled.input`
  width: 16px;
  height: 16px;
  accent-color: #007bff;
`;

const CheckboxLabel = styled.label`
  font-size: 0.9rem;
  color: #374151;
  margin: 0;
`;

const ForgotPassword = styled.a`
  color: #007bff;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  
  &:hover {
    text-decoration: underline;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  background-color: #48b2ee;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 0.75rem;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: #3a9de8;
    transform: translateY(-1px);
  }
  
  &:disabled {
    background-color: #9ca3af;
    cursor: not-allowed;
    transform: none;
  }
  
  @media (max-width: 768px) {
    padding: 1rem;
    font-size: 1rem;
    margin-bottom: 1rem;
  }
  
  @media (max-width: 480px) {
    padding: 1.125rem;
    font-size: 1rem;
  }
`;

const GoogleButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  background: white;
  color: #374151;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  transition: all 0.3s ease;
  margin-bottom: 1rem;
  
  &:hover {
    background: #f8f9fa;
    border-color: #d1d5db;
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const SignUpPrompt = styled.div`
  text-align: center;
  font-size: 0.9rem;
  color: #6b7280;
  
  a {
    color: #007bff;
    text-decoration: none;
    font-weight: 600;
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  @media (max-width: 768px) {
    font-size: 1rem;
    margin-top: 0.5rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.95rem;
  }
`;

const ErrorMessage = styled.div`
  background: #fef2f2;
  color: #dc2626;
  padding: 0.75rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  border: 1px solid #fecaca;
`;

const AuthPage = () => {
  const [activeTab, setActiveTab] = useState('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    rememberMe: false
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error } = useSelector(state => state.auth);

  const from = location.state?.from?.pathname || '/';

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    
    if (!formData.email || !formData.password) {
      dispatch(loginFailure('Please fill in all fields'));
      return;
    }

    dispatch(loginStart());
    
    try {
      // Simulate API call
      setTimeout(() => {
        // Mock successful login
        const userData = {
          user: {
            id: Date.now(),
            email: formData.email,
            firstName: formData.email.split('@')[0],
            lastName: '',
            name: formData.email.split('@')[0]
          }
        };
        
        dispatch(loginSuccess(userData));
        navigate('/account', { replace: true });
      }, 1000);
    } catch (error) {
      dispatch(loginFailure('Invalid email or password'));
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    
    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
      dispatch(registerFailure('Please fill in all fields'));
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      dispatch(registerFailure('Passwords do not match'));
      return;
    }

    dispatch(registerStart());
    
    try {
      // Simulate API call
      setTimeout(() => {
        // Mock successful registration
        const userData = {
          user: {
            id: Date.now(),
            email: formData.email,
            firstName: formData.firstName,
            lastName: formData.lastName,
            name: `${formData.firstName} ${formData.lastName}`
          }
        };
        
        dispatch(registerSuccess(userData));
        navigate('/account', { replace: true });
      }, 1000);
    } catch (error) {
      dispatch(registerFailure('Registration failed. Please try again.'));
    }
  };


  return (
    <PageContainer>
      <LeftPanel>
        <BrandSection>
          <img 
            src="/images/logo2.png" 
            alt="Eyewearr Logo" 
            style={{
              maxWidth: '200px',
              height: 'auto',
              filter: 'brightness(0) invert(1)'
            }} 
          />
        </BrandSection>
        
      </LeftPanel>

      <RightPanel>
        <FormContainer>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          
          {activeTab === 'signin' ? (
            <form onSubmit={handleSignIn}>
              <WelcomeTitle>Welcome Back</WelcomeTitle>
              <WelcomeSubtitle>Enter your email and password to access your account</WelcomeSubtitle>
              
              <FormGroup>
                <Label>Email</Label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Password</Label>
                <InputContainer>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    required
                  />
                  <PasswordToggle
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </PasswordToggle>
                </InputContainer>
              </FormGroup>

              <CheckboxContainer>
                <CheckboxGroup>
                  <Checkbox
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                  />
                  <CheckboxLabel>Remember me</CheckboxLabel>
                </CheckboxGroup>
                <ForgotPassword href="#forgot">Forgot Password</ForgotPassword>
              </CheckboxContainer>

              <SubmitButton type="submit" disabled={loading}>
                {loading ? 'Signing In...' : 'Sign In'}
              </SubmitButton>

              

              <SignUpPrompt>
                Don't have an account? <button type="button" onClick={() => setActiveTab('register')} style={{background: 'none', border: 'none', color: '#48b2ee', textDecoration: 'underline', cursor: 'pointer', padding: 0, font: 'inherit'}}>Sign Up</button>
              </SignUpPrompt>
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              <WelcomeTitle>Create Account</WelcomeTitle>
              <WelcomeSubtitle>Enter your details to create your new account</WelcomeSubtitle>
              
              <FormRow>
                <FormGroup>
                  <Label>First Name</Label>
                  <Input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Enter your first name"
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Last Name</Label>
                  <Input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Enter your last name"
                    required
                  />
                </FormGroup>
              </FormRow>

              <FormGroup>
                <Label>Email</Label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Password</Label>
                <InputContainer>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Create a password"
                    required
                  />
                  <PasswordToggle
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </PasswordToggle>
                </InputContainer>
              </FormGroup>

              <FormGroup>
                <Label>Confirm Password</Label>
                <Input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your password"
                  required
                />
              </FormGroup>

              <SubmitButton type="submit" disabled={loading}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </SubmitButton>

            

              <SignUpPrompt>
                Already have an account? <button type="button" onClick={() => setActiveTab('signin')} style={{background: 'none', border: 'none', color: '#48b2ee', textDecoration: 'underline', cursor: 'pointer', padding: 0, font: 'inherit'}}>Sign In</button>
              </SignUpPrompt>
            </form>
          )}
        </FormContainer>
      </RightPanel>
    </PageContainer>
  );
};

export default AuthPage;
