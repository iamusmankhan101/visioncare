import React, { useState } from 'react';
import styled from 'styled-components';
import { sendContactFormNotification, sendContactFormConfirmation } from '../services/emailService';

// Styled Components
const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 4rem 2rem 2rem 2rem; /* Increased top padding from 2rem to 4rem */
  display: flex;
  background-color: #f9f9f9;
  
  @media (max-width: 768px) {
    flex-direction: column;
    padding: 3rem 1rem 1rem 1rem; /* Increased top padding from 1rem to 3rem for mobile */
  }

  @media (max-width: 480px) {
    padding: 2rem 2rem 2rem 2rem;
`;

const ContactInfoSection = styled.div`
  flex: 1;
  padding: 2rem;
  
  @media (max-width: 768px) {
    padding: 1rem 0;
  }

  @media (max-width: 480px) {
    padding-right:10px;
`;

const ContactFormSection = styled.div`
  flex: 1.5;
  background-color: white;
  padding: 2rem 4.25rem 2rem 2rem; /* Increased right padding by 20px (from 2rem to 2.25rem) */
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  
  @media (max-width: 768px) {
    padding: 1.5rem 1.75rem 1.5rem 1.5rem; /* Also increased right padding in mobile view */
    margin-top: 1.5rem;
  }
`;

const Heading = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
  position: relative;
  display: block; /* Changed from inline-block to block for full left alignment */
  text-align: left;
  line-height: 0; /* Added line height for better spacing */
  padding-bottom: 30px;
  
  /* Removed the &:after section that was creating the dash/line */
`;

const SubHeading = styled.p`
  font-size: 1rem;
  color: #666;
  line-height: 1.4; /* Increased from 1.6 for better readability */
  margin-bottom: 2rem;
  margin-top: 2rem; /* Added margin-top to create space below the header */
  max-width: 90%;
  text-align: left;
`;

const ContactDetail = styled.div`
  margin-bottom: 1.5rem;
  text-align: left;

  @media (max-width: 480px) {
  
`;


const ContactLabel = styled.p`
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.3rem;
  text-align: left;
`;

const ContactValue = styled.p`
  font-size: 1.1rem;
  font-weight: 500;
  text-align: left;
  line-height: 1.4; /* Added line height for better spacing */
`;

const AvailabilityInfo = styled.p`
  font-size: 0.8rem;
  color: #888;
  margin-top: 0.3rem;
  text-align: left;
`;

const LiveChatButton = styled.button`
  background-color: #3a9de8;
  color: white;
  border: none;
  padding: .7rem 1.5rem;
  border-radius: 25px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  cursor: pointer;
  margin-top: 2rem;
  
  &:hover {
    background-color: #48b2ee; /* Slightly darker shade for hover state */
  }
`;

const FormRow = styled.div`
  display: flex;
  gap: 3rem; /* Increased from 2rem to 3rem for even more horizontal spacing */
  margin-bottom: 2rem; /* Increased from 1rem to 2rem for more vertical spacing between rows */
  
  @media (max-width: 576px) {
    flex-direction: column;
    gap: 1rem; /* Increased from 0.5rem to 1rem for more spacing in mobile view */
  }
`;

const FormGroup = styled.div`
  flex: 1;
  margin-bottom: 1rem; /* Reduced from 2.5rem to 1.5rem to decrease spacing between form groups */
`;

const FormLabel = styled.label`
  display: block;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: #666;
  text-align: left;
  line-height: 1.4; /* Added line height for better spacing */

  @media (max-width: 480px) {
    width: 90%;
  }
`;

const FormInput = styled.input`
  width: 100%;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  text-align: left;
  line-height: 1.5; /* Added line height for better text input spacing */
  
  @media (max-width: 480px) {
    width: 85%;
    margin: 0 auto;
  }
  
  &:focus {
    outline: none;
    border-color: #999;
  }
`;

const FormTextarea = styled.textarea`
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  min-height: 150px;
  resize: vertical;
  text-align: left;
  line-height: 1.6; /* Added line height for better text spacing in the textarea */
  
  @media (max-width: 480px) {
    width: 85%;
    margin: 0 auto;
  }
  
  &:focus {
    outline: none;
    border-color: #999;
  }
`;

const SendButton = styled.button`
  background-color: #3a9de8;
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 25px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  cursor: pointer;
  margin-left: auto;
  opacity: ${props => props.disabled ? 0.6 : 1};
  
  &:hover {
    background-color: ${props => props.disabled ? '#3a9de8' : '#48b2ee'};
  }
  
  &:disabled {
    cursor: not-allowed;
  }
`;

const ArrowIcon = styled.span`
  display: inline-block;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: white;
  color: black;
  text-align: center;
  line-height: 20px;
  font-size: 0.8rem;
`;

const SuccessMessage = styled.div`
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
  color: #155724;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  animation: slideIn 0.3s ease-out;
  
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const SuccessIcon = styled.span`
  display: inline-block;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: #28a745;
  color: white;
  text-align: center;
  line-height: 20px;
  font-size: 0.8rem;
  font-weight: bold;
`;

const ContactPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    message: ''
  });
  
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setShowSuccess(false);
    
    try {
      console.log('Submitting contact form with data:', formData);
      
      // Send notification to admin email
      const adminResult = await sendContactFormNotification(formData);
      console.log('Admin notification result:', adminResult);
      
      // Send confirmation to customer email
      const customerResult = await sendContactFormConfirmation(formData);
      console.log('Customer confirmation result:', customerResult);
      
      if (adminResult.success || customerResult.success) {
        // Reset form after successful submission
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          message: ''
        });
        
        // Show success message
        setShowSuccess(true);
        
        // Hide success message after 5 seconds
        setTimeout(() => {
          setShowSuccess(false);
        }, 5000);
        
      } else {
        console.error('Both email services failed:', { adminResult, customerResult });
        alert('Failed to send message. Please try again or contact us directly.');
      }
    } catch (error) {
      console.error('Error sending contact form:', error);
      alert('Failed to send message. Please try again or contact us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <PageContainer>
      <ContactInfoSection>
        <Heading>Get in</Heading>
        <Heading>touch with us</Heading>
        <SubHeading>
          We're here to help! Whether you have a question about our
          services, need assistance with your account, or want to
          provide feedback, our team is ready to assist you.
        </SubHeading>
        
        <ContactDetail>
          <ContactLabel>Email:</ContactLabel>
          <ContactValue>Visioncareoptometryclinic@gmail.com</ContactValue>
        </ContactDetail>
        
        <ContactDetail>
          <ContactLabel>Phone:</ContactLabel>
          <ContactValue>+92 311 478 2424</ContactValue>
          <ContactValue>+92 309 557 1676</ContactValue>
         
        </ContactDetail>
        
      
      </ContactInfoSection>
      
      <ContactFormSection>
        {showSuccess && (
          <SuccessMessage>
            <SuccessIcon>✓</SuccessIcon>
            <div>
              <strong>Message sent successfully!</strong>
              <br />
              Thank you for contacting us. We've received your message and will get back to you within 24 hours.
            </div>
          </SuccessMessage>
        )}
        
        <form onSubmit={handleSubmit}>
          <FormRow>
            <FormGroup>
              <FormLabel>First Name</FormLabel>
              <FormInput 
                type="text" 
                name="firstName" 
                value={formData.firstName} 
                onChange={handleChange} 
                placeholder="Enter your first name..." 
                required 
              />
            </FormGroup>
            
            <FormGroup>
              <FormLabel>Last Name</FormLabel>
              <FormInput 
                type="text" 
                name="lastName" 
                value={formData.lastName} 
                onChange={handleChange} 
                placeholder="Enter your last name..." 
                required 
              />
            </FormGroup>
          </FormRow>
          
          <FormGroup>
            <FormLabel>Email</FormLabel>
            <FormInput 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              placeholder="Enter your email address..." 
              required 
            />
          </FormGroup>
          
          <FormGroup>
            <FormLabel>How can we help you?</FormLabel>
            <FormTextarea 
              name="message" 
              value={formData.message} 
              onChange={handleChange} 
              placeholder="Enter your message..." 
              required 
            />
          </FormGroup>
          
          <SendButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Sending...' : 'Send Message'} 
            {!isSubmitting && <ArrowIcon>→</ArrowIcon>}
          </SendButton>
        </form>
      </ContactFormSection>
    </PageContainer>
  );
};

export default ContactPage;