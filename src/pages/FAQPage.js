import React, { useState } from 'react';
import styled from 'styled-components';
import { FiChevronDown, FiChevronUp, FiShoppingCart, FiPackage, FiEye, FiTruck, FiHeadphones, FiCreditCard, FiRotateCcw, FiSearch } from 'react-icons/fi';

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
  margin-top: 20px;
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

const SearchBox = styled.div`
  max-width: 500px;
  margin: 2rem auto;
  position: relative;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.3s ease;
  
  &:focus {
    border-color: #3ABEF9;
  }
  
  &::placeholder {
    color: #a0aec0;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #a0aec0;
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const CategoriesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
`;

const CategorySection = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #f1f5f9;
  overflow: hidden;
`;

const CategoryHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-bottom: 1px solid #e2e8f0;
`;

const CategoryIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #3ABEF9 0%, #3572EF 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const CategoryTitle = styled.h2`
  font-size: 1.3rem;
  font-weight: 600;
  margin: 0;
  color: #1a202c;
`;

const FAQList = styled.div`
  padding: 0;
`;

const FAQItem = styled.div`
  border-bottom: 1px solid #f1f5f9;
  
  &:last-child {
    border-bottom: none;
  }
`;

const FAQQuestion = styled.button`
  width: 100%;
  padding: 1.5rem;
  text-align: left;
  background: none;
  border: none;
  font-size: 1rem;
  font-weight: 500;
  color: #2d3748;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: #f7fafc;
  }
  
  &:focus {
    outline: none;
    background-color: #f7fafc;
  }
`;

const FAQAnswer = styled.div`
  padding: 0 1.5rem 1.5rem 1.5rem;
  color: #4a5568;
  line-height: 1.6;
  display: ${props => props.isOpen ? 'block' : 'none'};
  
  p {
    margin: 0 0 1rem 0;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  strong {
    color: #2d3748;
  }
`;

const ChevronIcon = styled.div`
  transition: transform 0.2s ease;
  transform: ${props => props.isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
  color: #3ABEF9;
`;

const PrescriptionChart = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
`;

const PrescriptionItem = styled.div`
  display: flex;
  margin-bottom: 0.5rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const PrescriptionLabel = styled.strong`
  min-width: 80px;
  color: #3ABEF9;
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

const FAQPage = () => {
  const [openItems, setOpenItems] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  const toggleFAQ = (categoryId, itemId) => {
    const key = `${categoryId}-${itemId}`;
    setOpenItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const faqCategories = [
    {
      id: 'orders',
      title: 'Orders / General',
      icon: <FiShoppingCart />,
      items: [
        {
          question: 'How do I place an order?',
          answer: 'Just browse our site and choose a frame. Enter your prescription prescribed by your optometrist and choose from the variety of lenses. There is an extra option of coatings for you if you want that. The rest would be taken care of by Vision Care Team.'
        },
        {
          question: 'Where do I find my prescription?',
          answer: 'By law, your optometrist or eye-care professional has to provide you with the prescription following an eye exam.'
        },
        {
          question: 'How is Vision Care easy on the pocket?',
          answer: 'The pricing is reduced by eliminating the role of middlemen and all the cost attached to retail at the same time quality is maintained to the best. Vision Care manufacturing is done under one roof where quality is the prime objective.'
        }
      ]
    },
    {
      id: 'frames',
      title: 'Frames',
      icon: <FiEye />,
      items: [
        {
          question: 'What kind of frames is sold at Vision Care?',
          answer: 'We are putting forward eminence optical frames and lenses that are manufactured for the perfection. Vision Care is offering a wide range of optical products varying from optical frames (Full Rim, Semi Rim and Rimless-frames) to trendy Sunglasses of best variety that fits with every style and budget.'
        },
        {
          question: 'Is there a way to try on Vision Care frames before I buy?',
          answer: 'Absolutely YES, Vision Care has a clever Try-ON tool for the ease of you. It allows your own photo to upload for a virtually try-on. You can compare as many frames upon your desire. It gives you the feeling of looking into the mirror.'
        },
        {
          question: 'Is it possible to order Vision Care frames with nonprescription lenses?',
          answer: 'Yes, you can order it.'
        },
        {
          question: 'Do you offer children\'s frames?',
          answer: 'Vision Care has all variety of frames and we do offers eyeglasses specially made for children.'
        },
        {
          question: 'What about prescription sunglasses?',
          answer: 'You name it and we will make it. We are offering prescription sunglasses to make your look more fashionable even in the blistering heat of the summer. Choose from the variety of our products. Wear it and feel cool and comfy while travelling outside.'
        },
        {
          question: 'Do you offer lenses that become sunglasses only outdoors?',
          answer: 'Vision Care is also offering Photochromic and Transitions™ lenses. These lenses have the characteristic of changing their opacity on direct exposure to sunlight. It became darken and lighten in light and shade.'
        },
        {
          question: 'Can I order lenses that are both color tinted and photochromic?',
          answer: 'We do not suggest it as the function of sunglasses and photochromic are the same.'
        },
        {
          question: 'What are the limitations for bifocals or progressive lenses?',
          answer: 'Bifocal lenses need a minimum frame height of 30mm for a faultless adjustment of the lens.'
        },
        {
          question: 'Can I buy the frames alone?',
          answer: 'Yes, you can buy frames alone.'
        }
      ]
    },
    {
      id: 'delivery',
      title: 'Delivery and Shipping',
      icon: <FiTruck />,
      items: [
        {
          question: 'Can I track my order?',
          answer: 'We are delivering all our packages by TCS and YES you can track your order any time on TCS website.'
        },
        {
          question: 'How long do I have to wait for my glasses after I have ordered them?',
          answer: 'We ensure that your order should reach you in 1-4 business days.'
        },
        {
          question: 'What shipping methods do you offer?',
          answer: 'TCS is our official partner and we have adopted a COD (Cash on Delivery) option for your convenience.'
        }
      ]
    },
    {
      id: 'support',
      title: 'Support',
      icon: <FiHeadphones />,
      items: [
        {
          question: 'Oops! I entered some of my prescription incorrectly. Now what?',
          answer: 'As you find your order placement went wrong, do not panic. Just contact Vision Care on +92 311 478 2424 as soon as you find it and the rest will be managed by our team.'
        }
      ]
    },
    {
      id: 'prescriptions',
      title: 'Prescriptions',
      icon: <FiPackage />,
      items: [
        {
          question: 'Understanding Your Prescription',
          answer: (
            <div>
              <p>The prescription normally has a chart of your vision and it suggest you the vision numbers for a better sight. The chart consists of two rows in general that is one each for both eyes. The chart has four columns that are filled by the numbers suggested by your eye care specialist.</p>
              <PrescriptionChart>
                <PrescriptionItem>
                  <PrescriptionLabel>SPH or Sphere:</PrescriptionLabel>
                  <span>It explains the spherical error of the eye. The measurement of Sphere is in quarters and have (+) or (-) signs.</span>
                </PrescriptionItem>
                <PrescriptionItem>
                  <PrescriptionLabel>CYL or Cylinder:</PrescriptionLabel>
                  <span>It defines the refractive error of the astigmatism, which makes the vision blur or distorted. It is also measured in quarters and with (+) or (-) signs.</span>
                </PrescriptionItem>
                <PrescriptionItem>
                  <PrescriptionLabel>AXIS:</PrescriptionLabel>
                  <span>It refers to your eyes astigmatism alignment and calculated in degrees 1 to 180.</span>
                </PrescriptionItem>
                <PrescriptionItem>
                  <PrescriptionLabel>ADD or NV:</PrescriptionLabel>
                  <span>Near Vision gives the reading correction of the eyes. It increases the immediate vision and always specified by positive sign (+).</span>
                </PrescriptionItem>
                <PrescriptionItem>
                  <PrescriptionLabel>O.D or R:</PrescriptionLabel>
                  <span>It is used for the right eye.</span>
                </PrescriptionItem>
                <PrescriptionItem>
                  <PrescriptionLabel>O.S or L:</PrescriptionLabel>
                  <span>It is used for the left eye.</span>
                </PrescriptionItem>
              </PrescriptionChart>
            </div>
          )
        },
        {
          question: 'Can I use contact lens prescription for ordering glasses?',
          answer: 'No, we do not suggest it to you. Prescriptions for the contact lens differ from the eye-glasses and interchanging these can trouble your sighting vision.'
        }
      ]
    },
    {
      id: 'lenses',
      title: 'Lenses',
      icon: <FiEye />,
      items: [
        {
          question: 'What is Vision Care lenses made of?',
          answer: 'Our lenses are polycarbonate plastic and lightweight CR39. Apart from these, we have high quality lenses that give you the nature clear vision of the objects.'
        },
        {
          question: 'How are bifocal and progressive distances decided?',
          answer: 'Normally, the best ratio is the 60-40%, which means 60% height of the lens is kept for distance vision and 40% of the remaining is reserved for reading.'
        },
        {
          question: 'Can I buy the lenses alone?',
          answer: 'YES, you can order lens pairs separately.'
        }
      ]
    },
    {
      id: 'payment',
      title: 'Payment',
      icon: <FiCreditCard />,
      items: [
        {
          question: 'What payment methods do you accept?',
          answer: 'Our payment method is COD (Cash on Delivery). It means you have to pay only when the package is delivered to you.'
        },
        {
          question: 'May I get a sales invoice?',
          answer: 'Yes, Vision Care adds invoices to your package.'
        },
        {
          question: 'Can I have multiple discounts on one item?',
          answer: 'No, you can not avail multiple discounts on single item or the items that are on sale.'
        }
      ]
    },
    {
      id: 'returns',
      title: 'Returns',
      icon: <FiRotateCcw />,
      items: [
        {
          question: 'What is your return policy?',
          answer: (
            <div>
              <p><strong>Vision Care mission is to provide 100% delighted experience for our valued customers</strong> but if you find anything worrying, simply contact us and return the package back to us within 7 days. We are providing 6 months replacement option on our premium products.</p>
              <p><strong>Note:</strong> The charges for shipping back will be paid by the customer. Vision Care has no liability on that. Return policy varies from product to product and customer will be informed about it once the order is placed.</p>
            </div>
          )
        }
      ]
    }
  ];

  const filteredCategories = faqCategories.map(category => ({
    ...category,
    items: category.items.filter(item =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (typeof item.answer === 'string' && item.answer.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  })).filter(category => category.items.length > 0);

  return (
    <Container>
      <Header>
        <Title>Frequently Asked Questions</Title>
        <Subtitle>
          Find answers to the most common questions about Vision Care eyewear, orders, and services.
        </Subtitle>
      </Header>

      <SearchBox>
        <SearchIcon>
          <FiSearch />
        </SearchIcon>
        <SearchInput
          type="text"
          placeholder="Search for questions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </SearchBox>

      <CategoriesGrid>
        {filteredCategories.map((category) => (
          <CategorySection key={category.id}>
            <CategoryHeader>
              <CategoryIcon>
                {category.icon}
              </CategoryIcon>
              <CategoryTitle>{category.title}</CategoryTitle>
            </CategoryHeader>
            
            <FAQList>
              {category.items.map((item, index) => {
                const isOpen = openItems[`${category.id}-${index}`];
                return (
                  <FAQItem key={index}>
                    <FAQQuestion onClick={() => toggleFAQ(category.id, index)}>
                      {item.question}
                      <ChevronIcon isOpen={isOpen}>
                        {isOpen ? <FiChevronUp /> : <FiChevronDown />}
                      </ChevronIcon>
                    </FAQQuestion>
                    <FAQAnswer isOpen={isOpen}>
                      {typeof item.answer === 'string' ? (
                        <p>{item.answer}</p>
                      ) : (
                        item.answer
                      )}
                    </FAQAnswer>
                  </FAQItem>
                );
              })}
            </FAQList>
          </CategorySection>
        ))}
      </CategoriesGrid>

      <ContactSection>
        <ContactTitle>Still Have Questions?</ContactTitle>
        <ContactInfo>
          Our customer service team is here to help you
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
          We're here to make your eyewear experience as smooth as possible.
        </ContactInfo>
      </ContactSection>
    </Container>
  );
};

export default FAQPage;
