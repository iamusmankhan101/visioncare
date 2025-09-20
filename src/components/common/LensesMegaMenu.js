import React, { useState } from 'react';
import styled from 'styled-components';
import { FiChevronDown, FiEye, FiSun, FiShield, FiZap } from 'react-icons/fi';

const MegaMenuContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const MenuTrigger = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  color: #333;
  transition: all 0.3s ease;
  border-radius: 8px;
  
  &:hover {
    background: #f8f9fa;
    color: #007bff;
  }
  
  svg {
    transition: transform 0.3s ease;
    transform: ${props => props.isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
  }
`;

const MegaMenuDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  width: 800px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  border: 1px solid #e9ecef;
  z-index: 1000;
  opacity: ${props => props.isOpen ? 1 : 0};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  transform: translateX(-50%) ${props => props.isOpen ? 'translateY(0)' : 'translateY(-10px)'};
  transition: all 0.3s ease;
  padding: 2rem;
  margin-top: 0.5rem;
  
  @media (max-width: 768px) {
    width: 95vw;
    left: 2.5vw;
    transform: none;
    margin-top: 0.5rem;
  }
`;

const MenuHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const MenuTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
`;

const MenuSubtitle = styled.p`
  color: #6c757d;
  margin: 0;
  font-size: 1rem;
`;

const LensesGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const LensCategory = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  cursor: pointer;
  border: 2px solid transparent;
  
  &:hover {
    background: #e9ecef;
    border-color: #007bff;
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 123, 255, 0.15);
  }
`;

const LensImage = styled.div`
  width: 100%;
  height: 150px;
  border-radius: 8px;
  margin-bottom: 1rem;
  position: relative;
  overflow: hidden;
  background: ${props => props.gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LensVisual = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${props => props.lensColor || 'rgba(255, 255, 255, 0.9)'};
  border: 3px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.8);
  }
`;

const LensTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
`;

const LensDescription = styled.p`
  color: #6c757d;
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0 0 1rem 0;
`;

const LensFeatures = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const FeatureTag = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.75rem;
  background: ${props => props.color || '#007bff'};
  color: white;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  
  svg {
    width: 12px;
    height: 12px;
  }
`;

const ColorOptions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const ColorSwatch = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${props => props.color};
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: scale(1.1);
  }
`;

const BottomSection = styled.div`
  border-top: 1px solid #e9ecef;
  padding-top: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
`;

const ContactInfo = styled.div`
  color: #6c757d;
  font-size: 0.9rem;
`;

const CTAButton = styled.button`
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 123, 255, 0.3);
  }
`;

const LensesMegaMenu = ({ onLensSelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  const lensCategories = [
    {
      id: 'colored',
      title: 'Colored Contact Lenses',
      description: 'Transform your look with our premium colored contact lenses. Available in natural and vibrant colors.',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      lensColor: 'rgba(102, 126, 234, 0.7)',
      features: [
        { text: 'UV Protection', icon: <FiSun />, color: '#ffc107' },
        { text: 'Comfort Fit', icon: <FiEye />, color: '#28a745' },
        { text: 'Daily/Monthly', icon: <FiShield />, color: '#17a2b8' }
      ],
      colors: ['#8B4513', '#228B22', '#4169E1', '#9932CC', '#FF6347', '#32CD32']
    },
    {
      id: 'transparent',
      title: 'Transparent Contact Lenses',
      description: 'Crystal clear vision correction lenses for everyday comfort and natural appearance.',
      gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      lensColor: 'rgba(255, 255, 255, 0.9)',
      features: [
        { text: 'Crystal Clear', icon: <FiEye />, color: '#007bff' },
        { text: 'Breathable', icon: <FiZap />, color: '#28a745' },
        { text: 'All Day Comfort', icon: <FiShield />, color: '#6f42c1' }
      ],
      colors: ['rgba(255,255,255,0.9)', 'rgba(240,248,255,0.9)', 'rgba(248,248,255,0.9)']
    }
  ];

  const handleLensSelect = (category) => {
    if (onLensSelect) {
      onLensSelect(category);
    }
    setIsOpen(false);
  };

  return (
    <MegaMenuContainer>
      <MenuTrigger 
        isOpen={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
      >
        Contact Lenses
        <FiChevronDown />
      </MenuTrigger>

      <MegaMenuDropdown isOpen={isOpen}>
        <MenuHeader>
          <MenuTitle>Premium Contact Lenses</MenuTitle>
          <MenuSubtitle>Discover our collection of high-quality contact lenses</MenuSubtitle>
        </MenuHeader>

        <LensesGrid>
          {lensCategories.map((category) => (
            <LensCategory 
              key={category.id}
              onClick={() => handleLensSelect(category)}
            >
              <LensImage gradient={category.gradient}>
                <LensVisual lensColor={category.lensColor} />
              </LensImage>
              
              <LensTitle>{category.title}</LensTitle>
              <LensDescription>{category.description}</LensDescription>
              
              <LensFeatures>
                {category.features.map((feature, index) => (
                  <FeatureTag key={index} color={feature.color}>
                    {feature.icon}
                    {feature.text}
                  </FeatureTag>
                ))}
              </LensFeatures>

              {category.id === 'colored' && (
                <ColorOptions>
                  {category.colors.map((color, index) => (
                    <ColorSwatch key={index} color={color} />
                  ))}
                </ColorOptions>
              )}
            </LensCategory>
          ))}
        </LensesGrid>

        <BottomSection>
          <ContactInfo>
            Need help choosing? Call us at <strong>(555) 123-4567</strong>
          </ContactInfo>
          <CTAButton onClick={() => handleLensSelect({ id: 'all', title: 'All Lenses' })}>
            View All Lenses
          </CTAButton>
        </BottomSection>
      </MegaMenuDropdown>
    </MegaMenuContainer>
  );
};

export default LensesMegaMenu;