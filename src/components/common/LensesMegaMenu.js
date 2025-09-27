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
  color: #333;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 8px;
  
  &:hover {
    background: #f8f9fa;
    color: #3ABEF9;
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
  border: 1px solid #e2e8f0;
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
    padding: 1.5rem;
  }
`;

const MenuHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const MenuTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0 0 0.5rem 0;
`;

const MenuSubtitle = styled.p`
  color: #64748b;
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
  background: #f8fafc;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  cursor: pointer;
  border: 2px solid transparent;
  
  &:hover {
    background: #f1f5f9;
    border-color: #3ABEF9;
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(58, 190, 249, 0.15);
  }
`;

const LensImageContainer = styled.div`
  width: 100%;
  height: 200px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 1rem;
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LensImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
  
  ${LensCategory}:hover & {
    transform: scale(1.05);
  }
`;

const LensPlaceholder = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${props => props.color || 'rgba(255, 255, 255, 0.2)'};
  border: 3px solid rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: white;
  backdrop-filter: blur(10px);
`;

const LensInfo = styled.div`
  text-align: center;
`;

const LensTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0 0 0.5rem 0;
`;

const LensDescription = styled.p`
  color: #64748b;
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0 0 1rem 0;
`;

const LensFeatures = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const FeatureIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #3ABEF9;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
`;

const LensPrice = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: #3ABEF9;
`;

const ColorOptions = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin: 1rem 0;
`;

const ColorSwatch = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${props => props.color};
  border: 2px solid white;
  box-shadow: 0 0 0 1px #e2e8f0;
  cursor: pointer;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: scale(1.2);
  }
`;

const BottomSection = styled.div`
  border-top: 1px solid #e2e8f0;
  padding-top: 1.5rem;
  text-align: center;
`;

const ViewAllButton = styled.button`
  background: linear-gradient(135deg, #3ABEF9 0%, #3572EF 100%);
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(58, 190, 249, 0.3);
  }
`;

const LensesMegaMenu = ({ onLensSelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  const lensCategories = [
    {
      id: 'colored',
      title: 'Colored Contact Lenses',
      description: 'Transform your look with vibrant colored lenses. Available in natural and dramatic shades.',
      image: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      price: 'From $25',
      features: [<FiEye key="eye" />, <FiZap key="zap" />],
      colors: ['#8B4513', '#228B22', '#4169E1', '#9932CC', '#FF1493', '#32CD32']
    },
    {
      id: 'transparent',
      title: 'Clear Contact Lenses',
      description: 'Crystal clear vision correction lenses. Comfortable daily wear with UV protection.',
      image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      price: 'From $15',
      features: [<FiShield key="shield" />, <FiSun key="sun" />],
      colors: ['transparent']
    }
  ];

  const handleLensSelect = (lens) => {
    if (onLensSelect) {
      onLensSelect(lens);
    }
    setIsOpen(false);
  };

  const handleClickOutside = (e) => {
    if (!e.target.closest('.mega-menu-container')) {
      setIsOpen(false);
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
    } else {
      document.removeEventListener('click', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <MegaMenuContainer className="mega-menu-container">
      <MenuTrigger 
        isOpen={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      >
        Contact Lenses
        <FiChevronDown />
      </MenuTrigger>
      
      <MegaMenuDropdown isOpen={isOpen}>
        <MenuHeader>
          <MenuTitle>Contact Lenses Collection</MenuTitle>
          <MenuSubtitle>Discover our premium range of contact lenses</MenuSubtitle>
        </MenuHeader>
        
        <LensesGrid>
          {lensCategories.map((lens) => (
            <LensCategory 
              key={lens.id}
              onClick={() => handleLensSelect(lens)}
            >
              <LensImageContainer>
                {lens.image ? (
                  <LensImage src={lens.image} alt={lens.title} />
                ) : (
                  <LensPlaceholder color={lens.id === 'colored' ? '#FF6B6B' : '#4ECDC4'}>
                    {lens.features[0]}
                  </LensPlaceholder>
                )}
              </LensImageContainer>
              
              <LensInfo>
                <LensTitle>{lens.title}</LensTitle>
                <LensDescription>{lens.description}</LensDescription>
                
                <LensFeatures>
                  {lens.features.map((feature, index) => (
                    <FeatureIcon key={index}>
                      {feature}
                    </FeatureIcon>
                  ))}
                </LensFeatures>
                
                {lens.colors[0] !== 'transparent' && (
                  <ColorOptions>
                    {lens.colors.map((color, index) => (
                      <ColorSwatch key={index} color={color} />
                    ))}
                  </ColorOptions>
                )}
                
                <LensPrice>{lens.price}</LensPrice>
              </LensInfo>
            </LensCategory>
          ))}
        </LensesGrid>
        
        <BottomSection>
          <ViewAllButton onClick={() => handleLensSelect({ id: 'all', title: 'All Lenses' })}>
            View All Contact Lenses
          </ViewAllButton>
        </BottomSection>
      </MegaMenuDropdown>
    </MegaMenuContainer>
  );
};

export default LensesMegaMenu;