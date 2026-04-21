import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #87CEEB 0%, #B0E0E6 50%, #ADD8E6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  padding: 2rem;
`;

const ContentWrapper = styled.div`
  text-align: center;
  z-index: 10;
  max-width: 600px;
`;

const Title = styled.h1`
  font-size: 3.5rem;
  font-weight: 300;
  color: white;
  margin-bottom: 1.5rem;
  letter-spacing: 2px;
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const Description = styled.p`
  font-size: 1.1rem;
  color: white;
  line-height: 1.6;
  margin-bottom: 3rem;
  opacity: 0.9;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
  
  @media (max-width: 768px) {
    font-size: 1rem;
    margin-bottom: 2rem;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`;

const ShopButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  min-width: 160px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateY(-2px);
  }
  
  @media (max-width: 768px) {
    width: 200px;
  }
`;

const EyeglassImage = styled.div`
  position: absolute;
  opacity: 0.6;
  transform: rotate(${props => props.rotation || 0}deg);
  transition: transform 0.3s ease;
  
  img {
    width: ${props => props.size || '80px'};
    height: auto;
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
  }
  
  &:hover {
    transform: rotate(${props => props.rotation || 0}deg) scale(1.1);
  }
`;

const BackgroundGlasses = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
`;

const NotFoundPage = () => {
  const navigate = useNavigate();

  const handleShopEyeglasses = () => {
    navigate('/products?category=eyeglasses');
  };

  const handleShopSunglasses = () => {
    navigate('/products?category=sunglasses');
  };

  return (
    <PageContainer>
      <BackgroundGlasses>
        {/* Top right glasses */}
        <EyeglassImage 
          style={{ top: '10%', right: '15%' }} 
          rotation={15}
          size="100px"
        >
          <img src="/images/413zRAxylXL._UY1100_-removebg-preview.png" alt="glasses" />
        </EyeglassImage>
        
        {/* Middle right glasses */}
        <EyeglassImage 
          style={{ top: '35%', right: '8%' }} 
          rotation={-10}
          size="120px"
        >
          <img src="/images/413zRAxylXL._UY1100_-removebg-preview.png" alt="glasses" />
        </EyeglassImage>
        
        {/* Center left glasses */}
        <EyeglassImage 
          style={{ top: '25%', left: '12%' }} 
          rotation={25}
          size="90px"
        >
          <img src="/images/413zRAxylXL._UY1100_-removebg-preview.png" alt="glasses" />
        </EyeglassImage>
        
        {/* Bottom right glasses */}
        <EyeglassImage 
          style={{ bottom: '15%', right: '20%' }} 
          rotation={-20}
          size="110px"
        >
          <img src="/images/413zRAxylXL._UY1100_-removebg-preview.png" alt="glasses" />
        </EyeglassImage>
        
        {/* Bottom left glasses */}
        <EyeglassImage 
          style={{ bottom: '25%', left: '8%' }} 
          rotation={10}
          size="85px"
        >
          <img src="/images/413zRAxylXL._UY1100_-removebg-preview.png" alt="glasses" />
        </EyeglassImage>
        
        {/* Top left glasses */}
        <EyeglassImage 
          style={{ top: '20%', left: '25%' }} 
          rotation={-15}
          size="95px"
        >
          <img src="/images/413zRAxylXL._UY1100_-removebg-preview.png" alt="glasses" />
        </EyeglassImage>
      </BackgroundGlasses>

      <ContentWrapper>
        <Title>Page Not Found</Title>
        <Description>
          Oops! We can't seem to find the page you're looking for. Please check if you typed the URL correctly, or visit these pages:
        </Description>
        <ButtonContainer>
          <ShopButton onClick={handleShopEyeglasses}>
            Shop Eyeglasses
          </ShopButton>
          <ShopButton onClick={handleShopSunglasses}>
            Shop Sunglasses
          </ShopButton>
        </ButtonContainer>
      </ContentWrapper>
    </PageContainer>
  );
};

export default NotFoundPage;
