import React, { useState } from 'react';
import styled from 'styled-components';
import { FiChevronDown, FiEye, FiShield, FiTarget } from 'react-icons/fi';

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
  width: 1200px;
  max-height: 80vh;
  overflow-y: auto;
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
  
  @media (max-width: 1280px) {
    width: 95vw;
    left: 50%;
    transform: translateX(-50%) ${props => props.isOpen ? 'translateY(0)' : 'translateY(-10px)'};
  }
  
  @media (max-width: 768px) {
    width: 95vw;
    left: 50%;
    transform: translateX(-50%) ${props => props.isOpen ? 'translateY(0)' : 'translateY(-10px)'};
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
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
  align-items: start;
  
  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const LensCategory = styled.div`
  background: #f8fafc;
  border-radius: 12px;
  padding: 1.2rem;
  transition: all 0.3s ease;
  cursor: pointer;
  border: 2px solid transparent;
  height: 320px;
  display: flex;
  flex-direction: column;
  
  &:hover {
    background: #f1f5f9;
    border-color: #3ABEF9;
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(58, 190, 249, 0.15);
  }
`;

const LensImageContainer = styled.div`
  width: 100%;
  height: 140px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 1rem;
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
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
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const LensTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0 0 0.5rem 0;
  height: 2.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  line-height: 1.1;
`;

const LensDescription = styled.p`
  color: #64748b;
  font-size: 0.85rem;
  line-height: 1.4;
  margin: 0 0 0.8rem 0;
  flex: 1;
`;

const LensFeatures = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.8rem;
  margin-bottom: 0.8rem;
`;

const FeatureIcon = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #3ABEF9;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
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

  // Main lens categories with subcategories
  const lensCategories = {
    'colored-lenses': {
      title: 'Colored Lenses',
      subtitle: 'Transform your look with natural-looking colored contact lenses',
      image: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      badge: 'NEW',
      features: [
        'Natural color enhancement',
        'Multiple color options',
        'Daily & monthly options',
        'Comfortable wear'
      ],
      subcategories: [
        { name: 'Natural Brown', color: '#8B4513' },
        { name: 'Ocean Blue', color: '#4169E1' },
        { name: 'Emerald Green', color: '#228B22' },
        { name: 'Honey Hazel', color: '#CD853F' },
        { name: 'Violet Purple', color: '#9932CC' }
      ]
    },
    'transparent-lenses': {
      title: 'Transparent Lenses',
      subtitle: 'Crystal clear vision correction without changing your natural eye color',
      image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      badge: 'TRANSPARENT LENSES',
      features: [
        'Crystal clear vision',
        'Invisible on eyes',
        'All-day comfort',
        'Various prescriptions'
      ],
      subcategories: [
        { name: 'Daily Clear', color: 'transparent' },
        { name: 'Monthly Clear', color: 'transparent' },
        { name: 'Toric Clear', color: 'transparent' },
        { name: 'Multifocal Clear', color: 'transparent' },
        { name: 'Extended Wear', color: 'transparent' }
      ]
    },
    'contact-lenses': {
      title: 'Contact Lenses',
      subtitle: 'Premium contact lenses for all-day comfort and clear vision',
      image: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      badge: 'TYPES',
      features: [
        'Daily disposable options',
        'Monthly replacement',
        'Silicone hydrogel material',
        'UV protection available'
      ],
      subcategories: [
        { name: 'Daily Disposable', color: 'transparent' },
        { name: 'Weekly Replacement', color: 'transparent' },
        { name: 'Monthly Replacement', color: 'transparent' },
        { name: 'Extended Wear', color: 'transparent' },
        { name: 'Specialty Lenses', color: 'transparent' }
      ]
    },
    'prescription-lenses': {
      title: 'Prescription Lenses',
      subtitle: 'Custom prescription solutions for all vision correction needs',
      image: 'https://images.unsplash.com/photo-1509695507497-903c140c43b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      badge: 'PRESCRIPTION',
      features: [
        'Custom prescriptions',
        'Advanced lens technology',
        'Anti-reflective coating',
        'Blue light protection'
      ],
      subcategories: [
        { name: 'Single Vision', color: 'transparent', description: 'For nearsightedness or farsightedness' },
        { name: 'Progressive', color: 'transparent', description: 'Seamless multifocal vision' },
        { name: 'Bifocal', color: 'transparent', description: 'Two distinct vision zones' },
        { name: 'Photochromic', color: 'transparent', description: 'Adaptive light-changing lenses' },
        { name: 'High Index', color: 'transparent', description: 'Ultra-thin for strong prescriptions' },
        { name: 'Blue Light Filter', color: 'transparent', description: 'Digital eye strain protection' },
        { name: 'Anti-Glare', color: 'transparent', description: 'Reduces reflections and glare' },
        { name: 'Polarized Prescription', color: 'transparent', description: 'Prescription with polarization' }
      ]
    },

  };

  const handleLensSelect = (lens) => {
    if (onLensSelect) {
      onLensSelect(lens);
    } else {
      // Default navigation to lenses page with category
      if (lens.id === 'all') {
        window.location.href = '/lenses';
      } else {
        window.location.href = `/lenses?category=${lens.category || lens.id}`;
      }
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
        Lenses
        <FiChevronDown />
      </MenuTrigger>

      <MegaMenuDropdown isOpen={isOpen}>
        <MenuHeader>
          <MenuTitle>Complete Lens Collection</MenuTitle>
          <MenuSubtitle>Discover our premium range of contact and prescription lenses</MenuSubtitle>
        </MenuHeader>

        <LensesGrid>
          {Object.entries(lensCategories).map(([categoryId, lens]) => (
            <LensCategory
              key={categoryId}
              onClick={() => handleLensSelect({ ...lens, id: categoryId })}
            >
              <LensImageContainer>
                {lens.image ? (
                  <LensImage src={lens.image} alt={lens.title} />
                ) : (
                  <LensPlaceholder color={categoryId === 'colored-lenses' ? '#FF6B6B' : '#4ECDC4'}>
                    <FiEye />
                  </LensPlaceholder>
                )}
              </LensImageContainer>

              <LensInfo>
                <LensTitle>{lens.title}</LensTitle>
                <LensDescription>{lens.subtitle}</LensDescription>

                <LensFeatures>
                  {lens.features.slice(0, 3).map((feature, index) => {
                    const icons = [<FiEye />, <FiShield />, <FiTarget />];
                    return (
                      <FeatureIcon key={index} title={feature}>
                        {icons[index] || <FiEye />}
                      </FeatureIcon>
                    );
                  })}
                </LensFeatures>

                {lens.subcategories && lens.subcategories.some(sub => sub.color !== 'transparent') && (
                  <ColorOptions>
                    {lens.subcategories
                      .filter(sub => sub.color !== 'transparent')
                      .slice(0, 5)
                      .map((sub, index) => (
                        <ColorSwatch key={index} color={sub.color} title={sub.name} />
                      ))}
                  </ColorOptions>
                )}


              </LensInfo>
            </LensCategory>
          ))}
        </LensesGrid>

        <BottomSection>
          <ViewAllButton onClick={() => handleLensSelect({ id: 'all', title: 'All Lenses' })}>
            View All Lenses
          </ViewAllButton>
        </BottomSection>
      </MegaMenuDropdown>
    </MegaMenuContainer>
  );
};

export default LensesMegaMenu;