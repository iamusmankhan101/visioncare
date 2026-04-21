import React from 'react';
import styled from 'styled-components';
import { FiClock, FiPackage, FiEye, FiShield, FiDollarSign, FiAlertCircle } from 'react-icons/fi';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Montserrat', 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  color: #333;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Header = styled.div`
  text-align: center;
  margin-top:20px;
  margin-bottom: 3rem;
  padding: 2rem 0;
  background: linear-gradient(135deg, #3ABEF9 0%, #3572EF 100%);
  border-radius: 16px;
  color: white;
  
  @media (max-width: 768px) {
    margin-bottom: 2rem;
    padding: 1.5rem 1rem;
  }
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  margin: 0;
  opacity: 0.9;
  max-width: 600px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
`;

const PolicySection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #f1f5f9;
  
  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f1f5f9;
`;

const SectionIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #3ABEF9 0%, #3572EF 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  
  svg {
    width: 24px;
    height: 24px;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  color: #1a202c;
`;

const PolicyList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const PolicyItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
  border-left: 4px solid #3ABEF9;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const PolicyIcon = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #3ABEF9;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  font-weight: bold;
  flex-shrink: 0;
  margin-top: 2px;
`;

const PolicyText = styled.p`
  margin: 0;
  color: #4a5568;
  font-size: 0.95rem;
`;

const ImportantNote = styled.div`
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  padding: 1rem;
  margin: 1.5rem 0;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
`;

const NoteIcon = styled.div`
  color: #d69e2e;
  flex-shrink: 0;
  margin-top: 2px;
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const NoteText = styled.p`
  margin: 0;
  color: #744210;
  font-size: 0.9rem;
  font-weight: 500;
`;

const ContactSection = styled.div`
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  margin-top: 2rem;
`;

const ContactTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  color: #1a202c;
`;

const ContactInfo = styled.p`
  margin: 0.5rem 0;
  color: #4a5568;
  font-size: 1rem;
`;

const ContactLink = styled.a`
  color: #3ABEF9;
  text-decoration: none;
  font-weight: 500;
  
  &:hover {
    text-decoration: underline;
  }
`;

const ExchangeReturnPage = () => {
  return (
    <Container>
      <Header>
        <Title>Exchange & Return Policy</Title>
        <Subtitle>
          At Vision Care, your satisfaction is our top priority. We want you to shop with confidence, 
          which is why we have a clear and transparent exchange and return policy.
        </Subtitle>
      </Header>

      <ContentGrid>
        <PolicySection>
          <SectionHeader>
            <SectionIcon>
              <FiPackage />
            </SectionIcon>
            <SectionTitle>Frames & Sunglasses</SectionTitle>
          </SectionHeader>
          
          <PolicyList>
            <PolicyItem>
              <PolicyIcon>
                <FiClock />
              </PolicyIcon>
              <PolicyText>
                You may request an exchange or return within <strong>7 days</strong> of receiving your order.
              </PolicyText>
            </PolicyItem>
            <PolicyItem>
              <PolicyIcon>✓</PolicyIcon>
              <PolicyText>
                The product must be <strong>unused, undamaged</strong>, and returned in its <strong>original packaging</strong>.
              </PolicyText>
            </PolicyItem>
          </PolicyList>
        </PolicySection>

        <PolicySection>
          <SectionHeader>
            <SectionIcon>
              <FiEye />
            </SectionIcon>
            <SectionTitle>Eyesight Glasses & Eyesight Sunglasses</SectionTitle>
          </SectionHeader>
          
          <ImportantNote>
            <NoteIcon>
              <FiAlertCircle />
            </NoteIcon>
            <NoteText>
              Since these are customized products made according to your prescription, 
              <strong> no exchange or return is applicable</strong>.
            </NoteText>
          </ImportantNote>
        </PolicySection>

        <PolicySection>
          <SectionHeader>
            <SectionIcon>
              <FiShield />
            </SectionIcon>
            <SectionTitle>Contact Lenses</SectionTitle>
          </SectionHeader>
          
          <PolicyList>
            <PolicyItem>
              <PolicyIcon>✗</PolicyIcon>
              <PolicyText>
                <strong>No returns</strong> are accepted on contact lenses due to <strong>hygiene and safety reasons</strong>.
              </PolicyText>
            </PolicyItem>
            <PolicyItem>
              <PolicyIcon>✓</PolicyIcon>
              <PolicyText>
                Exchange is only possible for <strong>sealed and unopened packs</strong>.
              </PolicyText>
            </PolicyItem>
            <PolicyItem>
              <PolicyIcon>✗</PolicyIcon>
              <PolicyText>
                <strong>Opened or used lenses</strong> cannot be exchanged or returned.
              </PolicyText>
            </PolicyItem>
          </PolicyList>
        </PolicySection>

        <PolicySection>
          <SectionHeader>
            <SectionIcon>
              <FiDollarSign />
            </SectionIcon>
            <SectionTitle>Refunds</SectionTitle>
          </SectionHeader>
          
          <PolicyList>
            <PolicyItem>
              <PolicyIcon>💳</PolicyIcon>
              <PolicyText>
                For orders paid via <strong>Bank Transfer</strong>, the <strong>full amount will be refunded</strong>.
              </PolicyText>
            </PolicyItem>
            <PolicyItem>
              <PolicyIcon>💰</PolicyIcon>
              <PolicyText>
                For <strong>Cash on Delivery (COD)</strong> orders, a <strong>4% deduction will apply</strong> (as per government tax regulations).
              </PolicyText>
            </PolicyItem>
          </PolicyList>
        </PolicySection>

        <PolicySection>
          <SectionHeader>
            <SectionIcon>
              <FiAlertCircle />
            </SectionIcon>
            <SectionTitle>General Conditions</SectionTitle>
          </SectionHeader>
          
          <PolicyList>
            <PolicyItem>
              <PolicyIcon>⏰</PolicyIcon>
              <PolicyText>
                All exchange/return requests must be made within the <strong>specified period (7 days)</strong>.
              </PolicyText>
            </PolicyItem>
            <PolicyItem>
              <PolicyIcon>🚚</PolicyIcon>
              <PolicyText>
                <strong>Shipping costs</strong> for returns or exchanges will be <strong>borne by the customer</strong>, 
                unless the product received is faulty or incorrect.
              </PolicyText>
            </PolicyItem>
          </PolicyList>
        </PolicySection>
      </ContentGrid>

      <ContactSection>
        <ContactTitle>Need Help with Returns or Exchanges?</ContactTitle>
        <ContactInfo>
          Contact our customer service team for assistance
        </ContactInfo>
        <ContactInfo>
          📞 Phone: <ContactLink href="tel:+923114782424">+92 311 478 2424</ContactLink>
        </ContactInfo>
        <ContactInfo>
          📞 Phone: <ContactLink href="tel:+923095571676">+92 309 557 1676</ContactLink>
        </ContactInfo>
        <ContactInfo>
          📧 Email: <ContactLink href="mailto:visioncareoptometryclinic@gmail.com">visioncareoptometryclinic@gmail.com</ContactLink>
        </ContactInfo>
        <ContactInfo style={{ marginTop: '1rem', fontSize: '0.9rem', opacity: 0.8 }}>
          Our team is here to help you with any questions about our exchange and return policy.
        </ContactInfo>
      </ContactSection>
    </Container>
  );
};

export default ExchangeReturnPage;
