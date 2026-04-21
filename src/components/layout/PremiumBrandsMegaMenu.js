import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const MegaMenuContainer = styled.div`
  position: absolute;
  top: 100%;
  left: -200px;
  width: 800px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  z-index: 1000;
  margin-top: 8px;
  padding: 2rem;
  display: none;
  
  @media (max-width: 1024px) {
    left: -150px;
    width: 600px;
  }
  
  @media (max-width: 768px) {
    left: -100px;
    width: 400px;
    padding: 1rem;
  }
`;

const MegaMenuTitle = styled.h3`
  margin: 0 0 1.5rem 0;
  font-size: 1.4rem;
  color: #333;
  text-align: center;
  font-weight: 600;
`;

const BrandsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }
`;

const BrandCard = styled(Link)`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 1.5rem 1rem;
  border-radius: 12px;
  border: 2px solid transparent;
  background: #f8f9fa;
  text-decoration: none;
  color: inherit;
  position: relative;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.1);
    border-color: #48b2ee;
    background: white;
  }
  
  @media (max-width: 768px) {
    padding: 1rem 0.5rem;
  }
`;

const BrandLogo = styled.div`
  width: 120px;
  height: 80px;
  background: white;
  border-radius: 8px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e0e0e0;
  position: relative;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    padding: 0.5rem;
  }
  
  @media (max-width: 768px) {
    width: 100px;
    height: 60px;
  }
  
  @media (max-width: 480px) {
    width: 80px;
    height: 50px;
  }
`;

const BrandName = styled.h4`
  margin: 0;
  font-size: 1rem;
  color: #333;
  font-weight: 600;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;


const PremiumBrandsMegaMenu = ({ isOpen, onClose }) => {
  const premiumBrands = [
    {
      id: 'ray-ban',
      name: 'Ray-Ban',
      logo: '/images/brands/ray-ban-logo.png',
      link: '/products?brand=ray-ban'
    },
    {
      id: 'coach',
      name: 'Coach',
      logo: '/images/brands/coach-logo.png',
      link: '/products?brand=coach'
    },
    {
      id: 'vogue',
      name: 'Vogue Eyewear',
      logo: '/images/brands/vogue-logo.svg',
      link: '/products?brand=vogue'
    },
    {
      id: 'ralph',
      name: 'Ralph',
      logo: '/images/brands/ralph-logo.png',
      link: '/products?brand=ralph'
    },
    {
      id: 'oakley',
      name: 'Oakley',
      logo: '/images/brands/oakley-logo.svg',
      link: '/products?brand=oakley'
    },
    {
      id: 'armani',
      name: 'Armani Exchange',
      logo: '/images/brands/armani-logo.svg',
      link: '/products?brand=armani-exchange'
    },
    {
      id: 'arnette',
      name: 'ARNETTE',
      logo: '/images/brands/arnette-logo.svg',
      link: '/products?brand=arnette'
    },
    {
      id: 'rflkt',
      name: 'RFLKT®',
      logo: '/images/brands/rflkt-logo.svg',
      link: '/products?brand=rflkt'
    }
  ];


  const handleBrandClick = () => {
    if (onClose) onClose();
  };

  return (
    <MegaMenuContainer style={{ display: isOpen ? 'block' : 'none' }}>
      <MegaMenuTitle>Premium Brands</MegaMenuTitle>
      
      <BrandsGrid>
        {premiumBrands.map(brand => (
          <BrandCard 
            key={brand.id} 
            to={brand.link}
            onClick={handleBrandClick}
          >
            <BrandLogo>
              <img 
                src={brand.logo} 
                alt={brand.name}
                onError={(e) => {
                  // Fallback to text if image fails to load
                  e.target.style.display = 'none';
                  e.target.parentNode.innerHTML = `<span style="font-weight: 600; color: #333; font-size: 0.9rem;">${brand.name}</span>`;
                }}
              />
            </BrandLogo>
            <BrandName>{brand.name}</BrandName>
          </BrandCard>
        ))}
      </BrandsGrid>
      
    </MegaMenuContainer>
  );
};

export default PremiumBrandsMegaMenu;
