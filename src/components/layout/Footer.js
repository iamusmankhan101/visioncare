import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FiMapPin, FiPhone, FiMail } from 'react-icons/fi';
import { FaFacebook, FaInstagram, FaYoutube, FaLinkedin } from 'react-icons/fa';

const FooterContainer = styled.footer`
  background-color:rgb(31, 31, 31);
  padding: 3rem 2rem;
  margin-top: 2rem;
  border-top: 1px solid #eee;
  font-family: 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
  
  @media (max-width: 768px) {
    padding: 2rem 1rem;
  }
  
  @media (max-width: 480px) {
    padding: 1.5rem 1rem;
  }
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 2rem;
  }
  
  @media (max-width: 480px) {
    gap: 1.5rem;
  }
`;

const LogoSection = styled.div`
  flex: 1;
  min-width: 250px;
  
  @media (max-width: 768px) {
    min-width: auto;
    text-align: center;
  }
`;

const Logo = styled.div`
  margin-bottom: 1.5rem;
  
  img {
    height: 40px;
  }
  
  span {
    font-size: 1.5rem;
    font-weight: 600;
    color: #48b2ee;
    display: flex;
    align-items: center;
  }
`;

const LogoDescription = styled.p`
  color: #ffffff;
  font-size: 0.9rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  text-align: left;
  
  @media (max-width: 768px) {
    text-align: center;
    font-size: 0.85rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.8rem;
    margin-bottom: 1rem;
  }
`;

const MenuSection = styled.div`
  flex: 1;
  min-width: 160px;
  color: #ffffff;
  
  @media (max-width: 768px) {
    min-width: auto;
    text-align: center;
  }
  
  @media (max-width: 480px) {
    margin-bottom: 1rem;
  }
`;

const ContactSection = styled.div`
  flex: 1;
  min-width: 250px;
  color: #ffffff;
  
  @media (max-width: 768px) {
    min-width: auto;
    text-align: center;
  }
`;

const FooterTitle = styled.h3`
  font-size: 1.1rem;
  margin-bottom: 1.2rem;
  font-weight: 600;
  color: #ffffff;
  position: relative;
  padding-bottom: 0.5rem;
  
  &:after {
    content: '';
    position: absolute;
    left: 0;
    bottom: 0;
    width: 40px;
    height: 2px;
    background-color: #48b2ee;
  }
  
  @media (max-width: 768px) {
    text-align: center;
    
    &:after {
      left: 50%;
      transform: translateX(-50%);
    }
  }
  
  @media (max-width: 480px) {
    font-size: 1rem;
    margin-bottom: 1rem;
  }
`;

const FooterLink = styled(Link)`
  text-decoration: none;
  color: #ffffff;
  margin-bottom: 0.8rem;
  display: block;
  font-size: 0.9rem;
  transition: color 0.3s ease;
  
  &:hover {
    color: #48b2ee;
  }
`;

const ContactItem = styled.div`
  display: flex;
  align-items: flex-start;
  margin-bottom: 1rem;
  color: #ffffff;
  font-size: 0.9rem;
  text-align: left;
  
  @media (max-width: 768px) {
    justify-content: center;
    text-align: center;
  }
  
  @media (max-width: 480px) {
    font-size: 0.85rem;
    margin-bottom: 0.75rem;
  }
`;

const ContactIcon = styled.div`
  margin-right: 0.8rem;
  color: #48b2ee;
  font-size: 1.1rem;
  padding-top: 0.2rem;
`;

const SocialIcons = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  
  @media (max-width: 768px) {
    justify-content: center;
  }
  
  @media (max-width: 480px) {
    gap: 0.75rem;
    margin-top: 1rem;
  }
`;

const SocialIcon = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #f5f5f5;
  color: #666;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: #48b2ee;
    color: white;
  }
`;

const Copyright = styled.div`
  text-align: center;
  margin-top: 3rem;
  padding-top: 1.5rem;
  border-top: 1px solid #eee;
  color: #ffffff;
  font-size: 0.9rem;
  
  @media (max-width: 768px) {
    margin-top: 2rem;
    padding-top: 1rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.8rem;
    margin-top: 1.5rem;
  }
`;

const Footer = () => {
  return (
    <FooterContainer>
      <FooterContent>
        <LogoSection>
          <Logo>
  <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
    <img 
      src="/images/logo2.png" 
      alt="eyebuydirect logo" 
      style={{ height: '62px', marginRight: '8px' , filter: 'invert(1)' }} 
    />

  </Link>
</Logo>

          <LogoDescription>
            Transformação digital que realmente funciona. Oferecemos os melhores óculos com preços acessíveis e qualidade premium.
          </LogoDescription>
          <SocialIcons>
            <SocialIcon href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
              <FaLinkedin />
            </SocialIcon>
            <SocialIcon href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <FaInstagram />
            </SocialIcon>
            <SocialIcon href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <FaFacebook />
            </SocialIcon>
            <SocialIcon href="https://youtube.com" target="_blank" rel="noopener noreferrer">
              <FaYoutube />
            </SocialIcon>
          </SocialIcons>
        </LogoSection>
        
        <MenuSection>
          <FooterTitle>Useful Links</FooterTitle>
          <FooterLink to="/">Home</FooterLink>
          <FooterLink to="/about">About</FooterLink>
          <FooterLink to="/collections">Collections</FooterLink>
          <FooterLink to="/contact">Contact</FooterLink>
        </MenuSection>
        
        <MenuSection>
          <FooterTitle>Help</FooterTitle>
          <FooterLink to="/size-guide">Size Guide</FooterLink>
          <FooterLink to="/prescription-guide">Prescription Guide</FooterLink>
          <FooterLink to="/returns-exchanges">Returns & Exchanges</FooterLink>
          <FooterLink to="/faq">FAQ</FooterLink>
        </MenuSection>
        
        <ContactSection>
          <FooterTitle>Contact Us</FooterTitle>
          <ContactItem>
            <ContactIcon>
              <FiMail />
            </ContactIcon>
            <div>Visioncareoptometryclinic@gmail.com</div>
          </ContactItem>
          <ContactItem>
            <ContactIcon>
              <FiPhone />
            </ContactIcon>
            <div>+92 311 478 2424</div>
          </ContactItem>
          <ContactItem>
            <ContactIcon>
              <FiPhone />
            </ContactIcon>
            <div>+92 309 557 1676</div>
          </ContactItem>
          <ContactItem>
            <ContactIcon>
              <FiMapPin />
            </ContactIcon>
            <div>Shop # 1-A/3 H block Commercial, Valencia, Lahore</div>
          </ContactItem>
        </ContactSection>
      </FooterContent>
      
      <Copyright>
        <div>© {new Date().getFullYear()} Eyewearr. All Rights Reserved.</div>
        
      </Copyright>
    </FooterContainer>
  );
};

export default Footer;