import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { addToCart } from '../redux/slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '../redux/slices/wishlistSlice';
import { fetchProducts } from '../redux/slices/productSlice';
import formatPrice from '../utils/formatPrice';
import { FiHeart, FiUpload, FiX } from 'react-icons/fi';

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

// Reviews Section Styled Components
const ReviewsSection = styled.section`
  margin: 3rem 0;
  padding: 2rem;
  background-color: #f9f9f9;
  border-radius: 10px;
`;

const ReviewsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

const ReviewsTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  margin: 0;
`;

const RatingsSummary = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const OverallRating = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const RatingScore = styled.span`
  font-size: 2rem;
  font-weight: 700;
  color: #e74c3c;
`;

const StarRating = styled.div`
  display: flex;
  gap: 0.2rem;
  
  .star {
    color: #e74c3c;
    font-size: 1.2rem;
  }
`;

const OverallScoreText = styled.span`
  color: #666;
  font-size: 0.9rem;
  margin-left: 0.5rem;
`;

const RateButton = styled.button`
  background-color: #48b2ee;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: #48b2ee;
  }
`;

const ReviewsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ReviewCard = styled.div`
  background-color: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const ReviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.5rem;
  }
`;

const ReviewerInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const ReviewerName = styled.span`
  font-weight: 600;
  color: #333;
  margin-bottom: 0.25rem;
`;

const ReviewDate = styled.span`
  color: #666;
  font-size: 0.9rem;
`;

const ReviewRating = styled.div`
  display: flex;
  gap: 0.2rem;
  margin-bottom: 0.5rem;
  
  .star {
    color: #e74c3c;
    font-size: 1rem;
  }
`;

const ReviewTitleText = styled.h4`
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 0.5rem 0;
`;

const ReviewText = styled.p`
  color: #666;
  line-height: 1.5;
  margin: 0;
`;

const ReviewMeta = styled.div`
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: #999;
`;

// Write Review Modal Styled Components
const WriteReviewModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const WriteReviewContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
`;

const WriteReviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
`;

const WriteReviewTitle = styled.h2`
  margin: 0;
  color: #333;
  font-size: 1.3rem;
  font-weight: 600;
`;

const WriteReviewCloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 0.5rem;
  
  &:hover {
    color: #333;
  }
`;

const ProductPreview = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
`;

const ProductPreviewImage = styled.img`
  width: 60px;
  height: 60px;
  object-fit: contain;
  border-radius: 6px;
`;

const ProductPreviewInfo = styled.div`
  flex: 1;
`;

const ProductPreviewName = styled.div`
  font-weight: 600;
  color: #333;
  margin-bottom: 0.25rem;
`;

const RatingSection = styled.div`
  margin-bottom: 1.5rem;
`;

const RatingLabel = styled.div`
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
  text-align: center;
`;

const StarRatingInput = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const StarInput = styled.button`
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: ${props => props.filled ? '#ffd700' : '#ddd'};
  transition: color 0.2s ease;
  
  &:hover {
    color: #ffd700;
  }
`;

const FormSection = styled.div`
  margin-bottom: 1.5rem;
`;

const FormLabel = styled.label`
  display: block;
  font-weight: 500;
  color: #333;
  margin-bottom: 0.5rem;
`;

const FormInput = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.9rem;
  
  &:focus {
    outline: none;
    border-color: #48b2ee;
  }
`;

const FormTextarea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.9rem;
  min-height: 100px;
  resize: vertical;
  font-family: inherit;
  
  &:focus {
    outline: none;
    border-color: #48b2ee;
  }
`;

const CharacterCount = styled.div`
  text-align: right;
  font-size: 0.8rem;
  color: #666;
  margin-top: 0.25rem;
`;

const ReviewFileUploadSection = styled.div`
  margin-bottom: 1.5rem;
`;

const ReviewFileUploadLabel = styled.div`
  font-weight: 500;
  color: #333;
  margin-bottom: 0.5rem;
  text-align: center;
`;

const ReviewFileUploadArea = styled.div`
  border: 2px dashed #ddd;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  background: #fafafa;
  cursor: pointer;
  transition: border-color 0.2s ease;
  
  &:hover {
    border-color: #48b2ee;
  }
`;

const ReviewFileUploadText = styled.div`
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
`;

const ReviewFileUploadSubtext = styled.div`
  color: #999;
  font-size: 0.8rem;
`;

const ReviewFileUploadInput = styled.input`
  display: none;
`;

const SubmitReviewButton = styled.button`
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: #c82333;
  }
  
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

// Review Modal Styles
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
`;

const ModalTitle = styled.h2`
  margin: 0;
  color: #333;
  font-size: 1.5rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 0.5rem;
  
  &:hover {
    color: #333;
  }
`;

const ReviewSection = styled.div`
  margin-bottom: 1.5rem;
`;

const ReviewTitle = styled.h3`
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1.2rem;
`;

const ReviewItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
`;

const ReviewLabel = styled.span`
  color: #666;
  font-weight: 500;
`;

const ReviewValue = styled.span`
  color: #333;
  font-weight: 600;
`;

const ModalActions = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
`;

const ConfirmButton = styled.button`
  flex: 1;
  background: #48b2ee;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  
  &:hover {
    background: #3a9bd8;
  }
`;

const CancelButton = styled.button`
  flex: 1;
  background: white;
  color: #666;
  border: 2px solid #ddd;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  
  &:hover {
    background: #f8f9fa;
    border-color: #999;
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
  const [showReviewModal, setShowReviewModal] = useState(false);
  
  // Write Review Modal States
  const [showWriteReviewModal, setShowWriteReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewEmail, setReviewEmail] = useState('');
  const [reviewUsername, setReviewUsername] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [reviewPhotos, setReviewPhotos] = useState([]);
  
  const wishlistItems = useSelector(state => state.wishlist.items);
  const { items: products, status: loading, error } = useSelector(state => state.products);

  // Fetch products when component mounts
  useEffect(() => {
    if (!products || products.length === 0) {
      dispatch(fetchProducts());
    }
  }, [dispatch, products]);

  // Find the lens product by ID from Redux store
  const lensProduct = products?.find(product => product.id === parseInt(id));

  // Fallback mock data if product not found
  const fallbackProduct = {
    id: parseInt(id) || 1,
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

  // Use actual product data or fallback
  const currentProduct = lensProduct || fallbackProduct;
  
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
    setShowReviewModal(true);
  };

  const handleConfirmPurchase = () => {
    const cartItem = {
      id: currentProduct.id,
      name: currentProduct.name,
      price: currentProduct.price,
      image: currentProduct.images?.[0] || currentProduct.image,
      quantity: 1,
      selectedColor,
      rightEyePower,
      leftEyePower,
      prescriptionFile: uploadedFile?.name || null
    };
    
    dispatch(addToCart(cartItem));
    setShowReviewModal(false);
    navigate('/cart');
  };

  const handleCloseModal = () => {
    setShowReviewModal(false);
  };
  
  // Check if product is in wishlist on component mount
  useEffect(() => {
    const productInWishlist = wishlistItems.find(item => item.id === currentProduct.id);
    setIsInWishlist(!!productInWishlist);
  }, [wishlistItems, currentProduct.id]);

  const handleAddToWishlist = () => {
    if (isInWishlist) {
      dispatch(removeFromWishlist(currentProduct.id));
      setIsInWishlist(false);
    } else {
      dispatch(addToWishlist({
        id: currentProduct.id,
        name: currentProduct.name,
        price: currentProduct.price,
        image: currentProduct.images?.[0] || currentProduct.image
      }));
      setIsInWishlist(true);
    }
  };

  // Write Review Modal Handlers
  const handleOpenWriteReview = () => {
    setShowWriteReviewModal(true);
  };

  const handleCloseWriteReview = () => {
    setShowWriteReviewModal(false);
    // Reset form
    setReviewRating(0);
    setReviewTitle('');
    setReviewEmail('');
    setReviewUsername('');
    setReviewText('');
    setReviewPhotos([]);
  };

  const handleStarClick = (rating) => {
    setReviewRating(rating);
  };

  const handleReviewPhotoUpload = (event) => {
    const files = Array.from(event.target.files);
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        alert(`File ${file.name} is too large. Maximum size is 10MB.`);
        return false;
      }
      return true;
    });
    
    setReviewPhotos(prev => [...prev, ...validFiles]);
  };

  const handleSubmitReview = async () => {
    if (reviewRating === 0) {
      alert('Please select a rating');
      return;
    }
    
    if (!reviewTitle.trim()) {
      alert('Please enter a review title');
      return;
    }
    
    if (!reviewText.trim()) {
      alert('Please enter your review');
      return;
    }
    
    try {
      const reviewData = {
        productId: currentProduct.id,
        name: reviewUsername || 'Anonymous',
        email: reviewEmail,
        rating: reviewRating,
        title: reviewTitle,
        text: reviewText,
        verified: false // Reviews start as unverified for moderation
      };
      
      const response = await fetch('http://localhost:3001/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData)
      });
      
      if (response.ok) {
        alert('Thank you for your review! It will be published after moderation.');
        // Reset form
        setReviewRating(0);
        setReviewTitle('');
        setReviewEmail('');
        setReviewUsername('');
        setReviewText('');
        setReviewPhotos([]);
        handleCloseWriteReview();
      } else {
        throw new Error('Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Sorry, there was an error submitting your review. Please try again.');
    }
  };
  
  return (
    <PageContainer>
      <ProductContainer>
        <ImageSection>
          <MainImageContainer>
            <MainImage 
              src={currentProduct.images?.[selectedImage] || currentProduct.image} 
              alt={currentProduct.name}
              onError={(e) => {
                e.target.src = '/images/default-lens.jpg';
              }}
            />
          </MainImageContainer>
          
          <ThumbnailContainer>
            {(currentProduct.images || [currentProduct.image]).map((image, index) => (
              <Thumbnail 
                key={index}
                active={selectedImage === index}
                onClick={() => setSelectedImage(index)}
              >
                <img 
                  src={image} 
                  alt={`${currentProduct.name} ${index + 1}`}
                  onError={(e) => {
                    e.target.src = '/images/default-lens.jpg';
                  }}
                />
              </Thumbnail>
            ))}
          </ThumbnailContainer>
        </ImageSection>
        
        <ProductDetails>
          <ProductTitle>{currentProduct.name}</ProductTitle>
          
          <PriceSection>
            <PriceLabel>Price includes</PriceLabel>
            <Price>{formatPrice(currentProduct.price)}</Price>
          </PriceSection>
          
          <OptionSection>
            <OptionLabel>Select Color</OptionLabel>
            <Select 
              value={selectedColor} 
              onChange={(e) => setSelectedColor(e.target.value)}
            >
              <option value="">--</option>
              {(currentProduct.colors || fallbackProduct.colors).map(color => (
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

      {/* Reviews Section */}
      <ReviewsSection>
        <ReviewsHeader>
          <div>
            <ReviewsTitle>Reviews</ReviewsTitle>
          </div>
          <RateButton onClick={handleOpenWriteReview}>
            Rate this lense
          </RateButton>
        </ReviewsHeader>
      </ReviewsSection>

      {/* Review Modal */}
      {showReviewModal && (
        <ModalOverlay onClick={handleCloseModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Review Your Selection</ModalTitle>
              <CloseButton onClick={handleCloseModal}>
                <FiX />
              </CloseButton>
            </ModalHeader>

            <ReviewSection>
              <ReviewTitle>Product Details</ReviewTitle>
              <ReviewItem>
                <ReviewLabel>Product:</ReviewLabel>
                <ReviewValue>{currentProduct.name}</ReviewValue>
              </ReviewItem>
              <ReviewItem>
                <ReviewLabel>Price:</ReviewLabel>
                <ReviewValue>{formatPrice(currentProduct.price)}</ReviewValue>
              </ReviewItem>
              <ReviewItem>
                <ReviewLabel>Color:</ReviewLabel>
                <ReviewValue>{selectedColor || 'Not selected'}</ReviewValue>
              </ReviewItem>
            </ReviewSection>

            <ReviewSection>
              <ReviewTitle>Prescription Details</ReviewTitle>
              <ReviewItem>
                <ReviewLabel>Right Eye Power:</ReviewLabel>
                <ReviewValue>{rightEyePower}</ReviewValue>
              </ReviewItem>
              <ReviewItem>
                <ReviewLabel>Left Eye Power:</ReviewLabel>
                <ReviewValue>{leftEyePower}</ReviewValue>
              </ReviewItem>
              <ReviewItem>
                <ReviewLabel>Prescription File:</ReviewLabel>
                <ReviewValue>{uploadedFile ? uploadedFile.name : 'No file uploaded'}</ReviewValue>
              </ReviewItem>
            </ReviewSection>

            <ReviewSection>
              <ReviewTitle>Order Summary</ReviewTitle>
              <ReviewItem>
                <ReviewLabel>Quantity:</ReviewLabel>
                <ReviewValue>1 pair</ReviewValue>
              </ReviewItem>
              <ReviewItem>
                <ReviewLabel>Total:</ReviewLabel>
                <ReviewValue>{formatPrice(currentProduct.price)}</ReviewValue>
              </ReviewItem>
            </ReviewSection>

            <ModalActions>
              <CancelButton onClick={handleCloseModal}>
                Cancel
              </CancelButton>
              <ConfirmButton onClick={handleConfirmPurchase}>
                Add to Cart
              </ConfirmButton>
            </ModalActions>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* Write Review Modal */}
      {showWriteReviewModal && (
        <WriteReviewModal onClick={handleCloseWriteReview}>
          <WriteReviewContent onClick={(e) => e.stopPropagation()}>
            <WriteReviewHeader>
              <WriteReviewTitle>Write a Review for</WriteReviewTitle>
              <WriteReviewCloseButton onClick={handleCloseWriteReview}>
                ×
              </WriteReviewCloseButton>
            </WriteReviewHeader>

            <ProductPreview>
              <ProductPreviewImage 
                src={currentProduct.images?.[0] || currentProduct.image} 
                alt={currentProduct.name}
                onError={(e) => {
                  e.target.src = '/images/default-lens.jpg';
                }}
              />
              <ProductPreviewInfo>
                <ProductPreviewName>{currentProduct.name}</ProductPreviewName>
              </ProductPreviewInfo>
            </ProductPreview>

            <RatingSection>
              <RatingLabel>Rate this lense!*</RatingLabel>
              <StarRatingInput>
                {[...Array(5)].map((_, index) => (
                  <StarInput
                    key={index}
                    filled={index < reviewRating}
                    onClick={() => handleStarClick(index + 1)}
                  >
                    ★
                  </StarInput>
                ))}
              </StarRatingInput>
            </RatingSection>

            <FormSection>
              <FormLabel>What do you think of your new frames?*</FormLabel>
            </FormSection>

            <FormSection>
              <FormInput
                type="text"
                placeholder="Review title"
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
              />
            </FormSection>

            <FormSection>
              <FormInput
                type="email"
                placeholder="Email"
                value={reviewEmail}
                onChange={(e) => setReviewEmail(e.target.value)}
              />
            </FormSection>

            <FormSection>
              <FormInput
                type="text"
                placeholder="Username"
                value={reviewUsername}
                onChange={(e) => setReviewUsername(e.target.value)}
              />
            </FormSection>

            <FormSection>
              <FormTextarea
                placeholder="Your thoughts..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                maxLength={700}
              />
              <CharacterCount>{reviewText.length}/700</CharacterCount>
            </FormSection>

            <ReviewFileUploadSection>
              <ReviewFileUploadLabel>Upload your photos (optional).</ReviewFileUploadLabel>
              <ReviewFileUploadArea onClick={() => document.getElementById('lens-review-photo-upload').click()}>
                <ReviewFileUploadText>Select an image one here</ReviewFileUploadText>
                <ReviewFileUploadSubtext>(maximum file size is 10MB)</ReviewFileUploadSubtext>
                <ReviewFileUploadInput
                  id="lens-review-photo-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleReviewPhotoUpload}
                />
              </ReviewFileUploadArea>
              {reviewPhotos.length > 0 && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
                  {reviewPhotos.length} file(s) selected
                </div>
              )}
            </ReviewFileUploadSection>

            <SubmitReviewButton 
              onClick={handleSubmitReview}
              disabled={reviewRating === 0 || !reviewTitle.trim() || !reviewText.trim()}
            >
              Submit review
            </SubmitReviewButton>
          </WriteReviewContent>
        </WriteReviewModal>
      )}
    </PageContainer>
  );
};

export default LensProductDetailPage;
