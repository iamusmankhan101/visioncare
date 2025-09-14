import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { addToCart } from '../redux/slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '../redux/slices/wishlistSlice';
import formatPrice from '../utils/formatPrice';
import { FiHeart, FiShoppingCart, FiUpload } from 'react-icons/fi';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
  margin-top: 120px;
  
  @media (max-width: 768px) {
    margin-top: 80px;
    padding: 1rem 0.5rem;
  }
`;

const ProductContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const ImageSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const MainImageContainer = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  position: relative;
`;

const MainImage = styled.img`
  max-width: 100%;
  max-height: 350px;
  object-fit: contain;
`;

const ThumbnailContainer = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
`;

const Thumbnail = styled.div`
  width: 80px;
  height: 80px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 2px solid ${props => props.active ? '#48b2ee' : 'transparent'};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #48b2ee;
  }
  
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    border-radius: 6px;
  }
`;

const ProductDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ProductTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #333;
  margin: 0;
`;

const PriceSection = styled.div`
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
`;

const PriceLabel = styled.p`
  font-size: 0.9rem;
  color: #666;
  margin: 0 0 0.5rem 0;
`;

const Price = styled.p`
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
  margin: 0;
`;

const OptionSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const OptionLabel = styled.label`
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.9rem;
  background: white;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #48b2ee;
  }
`;

const PrescriptionTable = styled.div`
  margin: 2rem 0;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  background-color: #f8f9fa;
  padding: 1rem;
  border-bottom: 2px solid #e0e0e0;
  font-weight: bold;
  font-size: 1.1rem;
  color: #333;
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  align-items: center;
  padding: 1.5rem 1rem;
  border-bottom: 1px solid #e0e0e0;
  
  &:last-child {
    border-bottom: none;
  }
`;

const EyeLabel = styled.div`
  font-weight: 500;
  color: #333;
  font-size: 1rem;
`;

const PowerDropdown = styled.select`
  padding: 0.75rem 1rem;
  border: 2px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  background-color: white;
  cursor: pointer;
  min-width: 140px;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const SpecValue = styled.div`
  font-size: 1rem;
  color: #666;
  text-align: center;
  font-weight: 500;
`;

const FileUploadSection = styled.div`
  border: 2px dashed #ddd;
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
  background: #fafafa;
`;

const FileInput = styled.input`
  display: none;
`;

const UploadButton = styled.button`
  background: none;
  border: 1px solid #48b2ee;
  color: #48b2ee;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 auto;
  
  &:hover {
    background: #48b2ee;
    color: white;
  }
`;

const LensesNote = styled.div`
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
`;

const NoteTitle = styled.div`
  font-weight: 600;
  color: #856404;
  margin-bottom: 0.5rem;
`;

const NoteText = styled.p`
  font-size: 0.9rem;
  color: #856404;
  margin: 0;
  line-height: 1.4;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
`;

const BuyButton = styled.button`
  flex: 1;
  background: #48b2ee;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  text-transform: uppercase;
  
  &:hover {
    background: #c82333;
  }
`;

const WishlistButton = styled.button`
  background: ${props => props.isInWishlist ? '#ff4757' : 'white'};
  border: 2px solid ${props => props.isInWishlist ? '#ff4757' : '#48b2ee'};
  color: ${props => props.isInWishlist ? 'white' : '#48b2ee'};
  padding: 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.isInWishlist ? '#ff3742' : '#48b2ee'};
    color: white;
    border-color: ${props => props.isInWishlist ? '#ff3742' : '#48b2ee'};
  }
  
  svg {
    fill: ${props => props.isInWishlist ? 'white' : 'none'};
  }
`;

const LensProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [selectedColor, setSelectedColor] = useState('');
  const [rightEyePower, setRightEyePower] = useState('0.00-plain');
  const [leftEyePower, setLeftEyePower] = useState('0.00-plain');
  const [selectedImage, setSelectedImage] = useState(0);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isInWishlist, setIsInWishlist] = useState(false);
  
  const wishlistItems = useSelector(state => state.wishlist.items);
  
  // Mock lens product data - in real app, this would come from Redux store
  const lensProduct = {
    id: 1,
    name: 'FreshKon Mosaic',
    price: 4500,
    images: [
      '/images/freshkon-mosaic.jpg',
      '/images/freshkon-mosaic-color-ainak.pk_.jpg',
      '/images/contact-lenses-solution-bottle-banner_33099-1916.jpg'
    ],
    colors: [
      { name: 'Natural Brown', value: 'natural-brown' },
      { name: 'Honey', value: 'honey' },
      { name: 'Gray', value: 'gray' },
      { name: 'Blue', value: 'blue' }
    ],
    specifications: {
      power: '8.4',
      bc: '14.2',
      dia: '14.2'
    }
  };
  
  const powerOptions = [
    '0.00-plain', '-0.25', '-0.50', '-0.75', '-1.00', '-1.25', '-1.50', '-1.75', '-2.00',
    '-2.25', '-2.50', '-2.75', '-3.00', '-3.25', '-3.50', '-3.75', '-4.00', '-4.25',
    '-4.50', '-4.75', '-5.00', '-5.25', '-5.50', '-5.75', '-6.00'
  ];
  
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedFile(file);
    }
  };
  
  const handleBuyNow = () => {
    const cartItem = {
      id: lensProduct.id,
      name: lensProduct.name,
      price: lensProduct.price,
      image: lensProduct.images[0],
      quantity: 1,
      selectedColor,
      rightEyePower,
      leftEyePower,
      prescriptionFile: uploadedFile?.name || null
    };
    
    dispatch(addToCart(cartItem));
    navigate('/cart');
  };
  
  // Check if product is in wishlist on component mount
  useEffect(() => {
    const productInWishlist = wishlistItems.find(item => item.id === lensProduct.id);
    setIsInWishlist(!!productInWishlist);
  }, [wishlistItems, lensProduct.id]);

  const handleAddToWishlist = () => {
    if (isInWishlist) {
      dispatch(removeFromWishlist(lensProduct.id));
      setIsInWishlist(false);
    } else {
      dispatch(addToWishlist({
        id: lensProduct.id,
        name: lensProduct.name,
        price: lensProduct.price,
        image: lensProduct.images[0]
      }));
      setIsInWishlist(true);
    }
  };
  
  return (
    <PageContainer>
      <ProductContainer>
        <ImageSection>
          <MainImageContainer>
            <MainImage 
              src={lensProduct.images[selectedImage]} 
              alt={lensProduct.name}
              onError={(e) => {
                e.target.src = '/images/default-lens.jpg';
              }}
            />
          </MainImageContainer>
          
          <ThumbnailContainer>
            {lensProduct.images.map((image, index) => (
              <Thumbnail 
                key={index}
                active={selectedImage === index}
                onClick={() => setSelectedImage(index)}
              >
                <img 
                  src={image} 
                  alt={`${lensProduct.name} ${index + 1}`}
                  onError={(e) => {
                    e.target.src = '/images/default-lens.jpg';
                  }}
                />
              </Thumbnail>
            ))}
          </ThumbnailContainer>
        </ImageSection>
        
        <ProductDetails>
          <ProductTitle>{lensProduct.name}</ProductTitle>
          
          <PriceSection>
            <PriceLabel>Price includes</PriceLabel>
            <Price>{formatPrice(lensProduct.price)}</Price>
          </PriceSection>
          
          <OptionSection>
            <OptionLabel>Select Color</OptionLabel>
            <Select 
              value={selectedColor} 
              onChange={(e) => setSelectedColor(e.target.value)}
            >
              <option value="">--</option>
              {lensProduct.colors.map(color => (
                <option key={color.value} value={color.value}>
                  {color.name}
                </option>
              ))}
            </Select>
          </OptionSection>
          
          <PrescriptionTable>
            <TableHeader>
              <div></div>
              <div>POWER</div>
              <div>BC</div>
              <div>DIA</div>
            </TableHeader>
            
            <TableRow>
              <EyeLabel>Right Eye (OD)</EyeLabel>
              <PowerDropdown 
                value={rightEyePower} 
                onChange={(e) => setRightEyePower(e.target.value)}
              >
                {powerOptions.map(power => (
                  <option key={power} value={power}>{power}</option>
                ))}
              </PowerDropdown>
              <SpecValue>8.4</SpecValue>
              <SpecValue>14.2</SpecValue>
            </TableRow>
            
            <TableRow>
              <EyeLabel>Left Eye (OS)</EyeLabel>
              <PowerDropdown 
                value={leftEyePower} 
                onChange={(e) => setLeftEyePower(e.target.value)}
              >
                {powerOptions.map(power => (
                  <option key={power} value={power}>{power}</option>
                ))}
              </PowerDropdown>
              <SpecValue>8.4</SpecValue>
              <SpecValue>14.2</SpecValue>
            </TableRow>
          </PrescriptionTable>
          
          <FileUploadSection>
            <FileInput 
              type="file" 
              id="prescription-upload"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileUpload}
            />
            <UploadButton 
              as="label" 
              htmlFor="prescription-upload"
            >
              <FiUpload />
              {uploadedFile ? uploadedFile.name : 'Choose File'}
            </UploadButton>
            {!uploadedFile && <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem', color: '#666' }}>No file chosen</p>}
          </FileUploadSection>
          
          
          
          <ActionButtons>
            <BuyButton onClick={handleBuyNow}>
              Buy Now
            </BuyButton>
            <WishlistButton 
              onClick={handleAddToWishlist}
              isInWishlist={isInWishlist}
            >
              <FiHeart />
            </WishlistButton>
          </ActionButtons>
        </ProductDetails>
      </ProductContainer>
    </PageContainer>
  );
};

export default LensProductDetailPage;
