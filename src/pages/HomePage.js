import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProducts } from '../redux/slices/productSlice';
import { addToCart } from '../redux/slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '../redux/slices/wishlistSlice';
import { FiShoppingBag, FiHeart, FiX } from 'react-icons/fi';
import formatPrice from '../utils/formatPrice';
import { generateUniqueSlug } from '../utils/slugUtils';
import styled from 'styled-components';
import ApiDebug from '../components/debug/ApiDebug';

const HeroSection = styled.section`
  height: 500px;
  background-color: #fff5e6;
  background-image: url('/images/Untitled design (13).png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0 5%;
  position: relative;
  overflow: hidden;
  
  @media (max-width: 768px) {
    height: 400px;
    padding: 0 3%;
  }
  
  @media (max-width: 480px) {
    height: 350px;
    padding: 0 2%;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.17); /* Black overlay with 50% opacity */
    z-index: 1;
  }
`;

const HeroContent = styled.div`
  width: 100%;
  z-index: 2;
  text-align: center;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

// Update the HeroTitle styling
const HeroTitle = styled.h1`
  font-size: 2.5rem; /* Reduced from 3.3rem */
  font-weight: 900;
  margin-bottom: 0.5rem;
  color: #ffffff;
  font-family: 'Montserrat', sans-serif;
  
  @media (max-width: 768px) {
    font-size: 2.2rem; /* Reduced from 2.8rem */
  }
  
  @media (max-width: 480px) {
    font-size: 1.8rem; /* Reduced from 2.2rem */
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1rem;
  margin-bottom: 1rem;
  color: #ffffff;
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  margin-top: -1px;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.9rem;
    margin-top: -1px;
  }
`;

// Update the SectionTitle styling
const SectionTitle = styled.h2`
  text-align: center;
  margin: 3rem 0 2rem;
  font-size: 2.5rem;
  padding-bottom: 1rem;
  font-family: 'Montserrat';
  font-weight: 600;
  color: #333;
  
  @media (max-width: 768px) {
    font-size: 1.7rem;
    margin: 2.5rem 0 1.5rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.8rem;
    margin: 2rem 0 1.2rem;
    font-family: 'Montserrat';
  }
`;

// Update the CategoryTitle styling
const CategoryTitle = styled.h3`
  margin-bottom: 0.5rem;
  font-family: 'Montserrat', sans-serif;
  font-weight: 500;
  color: #333;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1rem;
  }
`;

// ProductPrice styling
const ProductPrice = styled.p`
  font-weight: 600;
  color: #333;
  margin-bottom: 1rem;
  font-size: 1.2rem;
  font-family: 'Montserrat', sans-serif;
`;

const PriceContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
`;

const DiscountedPrice = styled.span`
  font-weight: 600;
  color: #e74c3c;
  font-size: 1.2rem;
  font-family: 'Montserrat', sans-serif;
`;

const OriginalPrice = styled.span`
  font-weight: 400;
  color: #999;
  font-size: 1rem;
  text-decoration: line-through;
  font-family: 'Montserrat', sans-serif;
`;

const DiscountPercentage = styled.span`
  background: #e74c3c;
  color: white;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  font-family: 'Montserrat', sans-serif;
`;

// Update the ShopNowButton styling
const ShopNowButton = styled(Link)`
  background-color: #48b2ee;
  color: white;
  padding: 0.8rem 1.5rem;
  border-radius: 15px;
  text-decoration: none;
  font-weight: 600;
  font-family: 'Montserrat', sans-serif;
  display: inline-block;
  transition: background-color 0.3s ease;
  width: auto;
  max-width: 150px;
  margin: 0 auto;
  
  &:hover {
    background-color: #48b2ee;
  }
`;

// Update the ServiceItem styling
const ServiceItem = styled.div`
  display: flex;
  align-items: center;
  margin: 0 20px;
  color: #333;
  font-size: 14px;
  font-family: 'Montserrat', sans-serif;
  font-weight: 500;
  padding: 0 15px;
  
  @media (max-width: 768px) {
    margin: 0 10px;
    padding: 0 8px;
    font-size: 12px;
  }
  
  @media (max-width: 480px) {
    margin: 0 5px;
    padding: 0 5px;
    font-size: 10px;
  }
`;

const ServiceIcon = styled.span`
  margin-right: 10px;
  color: #48b2ee;
  font-size: 18px;
  
  @media (max-width: 768px) {
    margin-right: 8px;
    font-size: 16px;
  }
  
  @media (max-width: 480px) {
    margin-right: 5px;
    font-size: 14px;
  }
`;

const PromoCode = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
  color: #333;
  
  @media (max-width: 768px) {
    font-size: 1.3rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.1rem;
    margin-bottom: 1rem;
  }
`;

const HeroImageContainer = styled.div`
  width: 50%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
`;

const HeroImage = styled.div`
  width: 100%;
  height: 100%;
  background-image: url('/images/OIP.webp');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
`;

const CategorySection = styled.section`
  padding: 2rem;
  
  @media (max-width: 768px) {
    padding: 1.5rem 1rem;
  }
  
  @media (max-width: 480px) {
    padding: 1rem 0.5rem;
  }
`;

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
    padding: 0 0.5rem;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 0 0.5rem;
  }
`;

const CategoryCard = styled.div`
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
  
  @media (max-width: 480px) {
    border-radius: 15px;
  }
`;

const CategoryImage = styled.div`
  height: 200px;
  background-color: #f0f0f0;
  background-image: ${props => props.image ? `url(${props.image})` : 'none'};
  background-size: cover;
  background-position: center;
  
  @media (max-width: 480px) {
    height: 150px;
  }
`;

const CategoryContent = styled.div`
  padding: 1.5rem;
  text-align: center;
  
  @media (max-width: 480px) {
    padding: 1rem;
  }
`;

const FeaturedSection = styled.section`
  padding: 2rem;
  background-color: #f8f9fa;
  width: 100%;
  
  @media (max-width: 768px) {
    padding: 1.5rem;
  }
  
  @media (max-width: 480px) {
    padding: 2rem 0 2rem 0;
  }
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
    padding: 0 1rem;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 0 1rem;
  }
`;

// Update the ProductCard styling (around line 230)
const ProductCard = styled.div`
  border-radius: 12px;
  overflow: hidden;
  background-color: #f5f5f5;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease;
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 15px;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

// Update the ProductImage styling
const ProductImage = styled.div`
  height: 200px;
  background-color: #f5f5f5;
  background-image: ${props => props.image ? `url(${props.image})` : 'none'};
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  margin-bottom: 15px;
  border-radius: 8px;
  position: relative;
`;

// Update the ProductContent styling
const ProductContent = styled.div`
  padding: 0.5rem;
  text-align: left;
  background-color: #fff;
  padding:1rem;
  border-radius:10px;
  position: relative; /* Add this to position the wishlist button */
  
`;

// Update the ProductTitle styling
const ProductTitle = styled.h3`
  margin-bottom: 0.5rem;
  font-size: 1rem;
  font-weight: 500;

  color: #333;
  font-family: 'Montserrat', sans-serif;

    
  @media (max-width: 480px) {
  font-size: 12px;
    
`;


// Update the BestSellerBadge styling
const BestSellerBadge = styled.span`
  position: absolute;
  top: 25px;
  left: 25px;
  background-color: #333333;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 500;
  z-index: 1;
`;

// Update the FeaturedBadge styling
const FeaturedBadge = styled.span`
  position: absolute;
  top: 25px;
  left: 25px;
  background-color: #333333;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 500;
  z-index: 1;
`;

// Update the ColorsLabel styling
const ColorsLabel = styled.div`
  font-size: 0.7rem;
  color: #666;
  margin-top: 0.5rem;
  text-align: right;
`;

// Update the ProductPrice styling (make sure this is defined, not ProductPriceStyle)
// Around line 70-80, you already have these declarations:
// const ProductPriceStyle = styled.p`...`;
// const ProductPrice = styled.p`...`;

// Instead of declaring ProductPrice again at line 274, modify the existing declaration at line 80
// to include the new styling. Replace the existing ProductPrice declaration with:
// Around line 80, update the existing ProductPrice declaration with:

// Remove the duplicate ProductPrice declaration at line 274
// Update the discount badge styling
// Add this with your other styled components
const DiscountBadge = styled.span`
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: #e74c3c;
  color: white;
  padding: 4px 8px;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 4px;
  z-index: 2;
`;


// Add a CartButton component
const CartButton = styled.button`
  position: absolute;
  bottom: 10px;
  right: 10px;
  background: white;
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  z-index: 2;
  font-size: 1.2rem;
  color: #999;
  
  &:hover {
    color: #48b2ee;
  }
`;

// Add WishlistButton component
const WishlistButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: white;
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  z-index: 2;
  font-size: 1rem;
  color: ${props => props.isInWishlist ? '#ff4757' : '#999'};
  
  @media (max-width: 768px) {
    width: 24px;
    height: 24px;
    font-size: 0.8rem;
    top: 8px;
    right: 8px;
  }
  
  &:hover {
    color: #ff4757;
    transform: scale(1.1);
  }
`;


// Add CategoryBadge component
const CategoryBadge = styled.span`
  position: absolute;
  top: ${props => props.hasDiscount ? '45px' : '10px'};
  left: 10px;
  background-color: #48b2ee;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  z-index: 1;
  
  @media (max-width: 768px) {
    top: ${props => props.hasDiscount ? '40px' : '8px'};
    left: 8px;
    padding: 3px 6px;
    font-size: 0.6rem;
  }
`;

// Add a ColorsCount component
const ColorsCount = styled.div`
  position: absolute;
  top: 10px;
  right: 50px;
  background: white;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 500;
  color: #666;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  z-index: 2;
  
  @media (max-width: 768px) {
    top: 40px;
    right: 8px;
    padding: 3px 6px;
    font-size: 0.6rem;
  }
`;

const ColorOptions = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  flex-wrap: wrap;
`;

const ColorTooltip = styled.div`
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s;
  z-index: 10;
  margin-bottom: 5px;
`;

const ColorSwatchContainer = styled.div`
  position: relative;
  display: inline-block;
  
  &:hover ${ColorTooltip} {
    opacity: 1;
  }
`;

const ColorSwatch = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: ${props => props.color};
  border: 2px solid ${props => props.selected ? '#48b2ee' : '#ddd'};
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  box-shadow: ${props => props.color === '#F0F8FF' || props.color === '#FFFFFF' ? 'inset 0 0 0 1px rgba(0,0,0,0.1)' : 'none'};
  
  &:hover {
    transform: scale(1.15);
    border-color: #48b2ee;
    box-shadow: 0 2px 8px rgba(192, 138, 51, 0.3);
  }
  
  &:after {
    content: '${props => props.selected ? '✓' : ''}';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: ${props => props.color === '#F0F8FF' || props.color === '#FFFFFF' ? '#333' : 'white'};
    font-size: 12px;
    font-weight: bold;
    text-shadow: ${props => props.color === '#F0F8FF' || props.color === '#FFFFFF' ? 'none' : '0 1px 2px rgba(0,0,0,0.5)'};
  }
`;

const ResponsiveHeading = styled.h2`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: #333;
  font-family: 'Montserrat', sans-serif;
  padding: 0 1rem;
  
  @media (max-width: 768px) {
    font-size: 1.8rem;
    padding: 0 0.5rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.5rem;
    padding: 0 0.5rem;
  }
`;

const ResponsiveParagraph = styled.p`
  font-size: 1.2rem;
  line-height: 1.6;
  margin-bottom: 2rem;
  color: #555;
  font-family: 'Montserrat', sans-serif;
  padding: 0 1rem;
  
  @media (max-width: 768px) {
    padding: 0 0.5rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1rem;
    padding: 0 0.5rem;
  }
`;

// Add this after your other styled components and before the HomePage component
const ReviewsSection = styled.section`
  padding: 4rem 2rem;
  background-color: #f8f9fa;
  text-align: center;
`;

const ReviewsContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  overflow: visible; /* Change from hidden to visible */
  padding: 0 3rem; /* Increase padding for navigation buttons */
`;

// Update the ReviewsCarousel styled component for smoother transitions
const ReviewsCarousel = styled.div`
  display: flex;
  transition: transform 0.3s ease;
  margin: 2rem 0;
  width: 100%;
  justify-content: flex-start;
  gap: 1rem;
  transform: translateX(${props => -props.currentIndex * (33.333)}%);
  overflow: visible;
`;

const ReviewCard = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  margin: 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  flex: 0 0 calc(33.333% - 0.67rem);
  max-width: calc(33.333% - 0.67rem);
  display: flex;
  flex-direction: column;
  text-align: left;
  
  @media (max-width: 768px) {
    flex: 0 0 calc(100% - 1rem);
    max-width: calc(100% - 1rem);
  }
`;

const ReviewHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
`;

const ReviewerImage = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #f0f0f0;
  background-image: ${props => props.image ? `url(${props.image})` : 'none'};
  background-size: cover;
  background-position: center;
  margin-right: 1rem;
`;

const ReviewerInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const ReviewerName = styled.h4`
  margin: 0;
  font-weight: 600;
  color: #333;
`;

const ReviewerTag = styled.span`
  color: #48b2ee;
  font-size: 0.9rem;
  font-weight: 500;
`;

const ReviewText = styled.p`
  color: #666;
  line-height: 1.6;
  flex-grow: 1;
`;

const CarouselButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  z-index: 2;
  font-size: 1.2rem;
  
  &:left {
    left: 10px;
  }
  
  &:right {
    right: 10px;
  }
`;

const LeftButton = styled(CarouselButton)`
  left: 10px;
`;

const RightButton = styled(CarouselButton)`
  right: 10px;
`;

// Removed slider styled components as they are no longer needed

const HomePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: products, status: loading, error } = useSelector(state => state.products);
  const { isAuthenticated } = useSelector(state => state.auth);
  const wishlist = useSelector(state => state.wishlist.items);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [testimonialSlide, setTestimonialSlide] = useState(0);
  const [selectedColors, setSelectedColors] = useState({});
  const [wishlistModal, setWishlistModal] = useState({ isOpen: false, type: '', product: null });
  const [showApiDebug, setShowApiDebug] = useState(false); // Debug panel (set to true to enable)

  // Helper function to calculate discounted price
  const calculateDiscountedPrice = (product) => {
    if (!product.discount || !product.discount.hasDiscount) {
      return null;
    }
    
    const originalPrice = parseFloat(product.price);
    const discountPercentage = product.discount.discountPercentage || 0;
    const discountedPrice = originalPrice - (originalPrice * discountPercentage / 100);
    
    return {
      original: originalPrice,
      discounted: discountedPrice,
      percentage: discountPercentage
    };
  };

  // Testimonial data
  const testimonials = [
    {
      id: 1,
      text: "The atmosphere of the shop is very good and the staff is very professional and guides you according to your needs.",
      author: "Zaheer Sahi",
      role: "Customer",
      rating: 5,
      avatar: "ZS"
    },
    {
      id: 2,
      text: "I visited there they Have best frames ever plus the staff is Highly professional … Totally satisfied Highly recommended 🫶🏻",
      author: "Arid",
      role: "Customer",
      rating: 5,
      avatar: "AR"
    },
    {
      id: 3,
      text: "These glasses completely transformed my look! The quality is outstanding and they're so comfortable to wear all day.",
      author: "Sarah Johnson",
      role: "Fashion Blogger",
      rating: 5,
      avatar: "SJ"
    },
    {
      id: 4,
      text: "Amazing customer service and fast shipping. The frames are exactly as described and fit perfectly.",
      author: "Michael Chen",
      role: "Software Engineer",
      rating: 5,
      avatar: "MC"
    },
    {
      id: 5,
      text: "I've been searching for the perfect sunglasses for months. Finally found them here! Highly recommend.",
      author: "Emma Davis",
      role: "Marketing Director",
      rating: 5,
      avatar: "ED"
    },
    {
      id: 6,
      text: "The style selection is incredible. Found exactly what I was looking for and the quality exceeded my expectations.",
      author: "David Wilson",
      role: "Photographer",
      rating: 5,
      avatar: "DW"
    }
  ];

  // Testimonial navigation functions
  const nextTestimonial = () => {
    if (testimonialSlide < testimonials.length - 3) {
      setTestimonialSlide(testimonialSlide + 1);
    }
  };

  const prevTestimonial = () => {
    if (testimonialSlide > 0) {
      setTestimonialSlide(testimonialSlide - 1);
    }
  };

  // Add handleAddToCart function
  const handleAddToCart = (product) => {
    dispatch(addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1
    }));
  };

  // Add wishlist functions
  const wishlistItems = useSelector(state => state.wishlist?.items || []);
  
  const handleWishlistToggle = (product) => {
    if (!isAuthenticated) {
      setWishlistModal({
        isOpen: true,
        type: 'signin',
        product: product
      });
      return;
    }

    const isInWishlist = wishlistItems.some(item => item.id === product.id);
    
    if (isInWishlist) {
      dispatch(removeFromWishlist(product.id));
    } else {
      dispatch(addToWishlist({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image
      }));
      
      setWishlistModal({
        isOpen: true,
        type: 'success',
        product: product
      });
    }
  };

  const closeModal = () => {
    setWishlistModal({ isOpen: false, type: '', product: null });
  };

  const handleSignIn = () => {
    closeModal();
    navigate('/auth');
  };

  const handleViewWishlist = () => {
    closeModal();
    navigate('/wishlist');
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.id === productId);
  };
  
  // Handle color selection
  const handleColorSelect = (productId, colorIndex) => {
    setSelectedColors(prev => ({
      ...prev,
      [productId]: colorIndex
    }));
  };

  // Fetch products when component mounts
  useEffect(() => {
    console.log('📦 HomePage useEffect - loading:', loading, 'products length:', products?.length);
    console.log('📦 Products data:', products);
    console.log('📦 Environment API URL:', process.env.REACT_APP_PRODUCTS_API_URL);
    
    if (loading === 'idle' && (!products || products.length === 0)) {
      console.log('📦 Dispatching fetchProducts...');
      dispatch(fetchProducts());
    }
  }, [dispatch, loading, products]);
  
  // Removed slider functions as sliders are no longer used
  
  // Filter featured products
  const featuredProducts = products ? products.filter(product => product.featured).map(product => {
    const selectedColorIndex = selectedColors[product.id] || 0;
    const selectedColor = product.colors && product.colors[selectedColorIndex];
    
    return {
      id: product.id,
      name: product.name,
      price: formatPrice(product.price),
      image: selectedColor?.image || product.image,
      link: `/products/${generateUniqueSlug(product.name, product.id)}`,
      colors: product.colors || [],
      badge: 'Featured',
      brand: product.brand || 'Designer Collection',
      discount: product.discount?.discountPercentage ? `${product.discount.discountPercentage}% OFF` : null,
      category: product.category ? product.category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : 'Eyewear'
    };
  }) : [];
  
  // Filter best selling products
  const bestSellingProducts = products ? products.filter(product => product.bestSelling || product.bestSeller).map(product => {
    const selectedColorIndex = selectedColors[product.id] || 0;
    const selectedColor = product.colors && product.colors[selectedColorIndex];
    
    return {
      id: product.id,
      name: product.name,
      price: formatPrice(product.price),
      image: selectedColor?.image || product.image,
      link: `/products/${generateUniqueSlug(product.name, product.id)}`,
      colors: product.colors || [],
      badge: 'Best Seller',
      brand: product.brand || 'Designer Collection',
      discount: product.discount?.discountPercentage ? `${product.discount.discountPercentage}% OFF` : null,
      category: product.category ? product.category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : 'Eyewear'
    };
  }) : [];
  
  // Display products - use actual data if available, otherwise show all products
  const displayFeaturedProducts = featuredProducts.length > 0 ? featuredProducts : (products || []).slice(0, 8);
  const displayBestSellingProducts = bestSellingProducts.length > 0 ? bestSellingProducts : (products || []).slice(0, 8);
  
  // Mock data for categories
  const categories = [
    { id: 1, name: 'Eyeglasses', image: '/images/SP-113-Black-Golden-Thum-4.jpeg', link: '/products?category=eyeglasses' },
    { id: 2, name: 'Sunglasses', image: '/images/sunglasses.webp', link: '/products?category=sunglasses' },
    { id: 3, name: 'Contact Lenses', image: '/images/contacts.jpg', link: '/products?category=contact-lenses' },
    { id: 4, name: 'Accessories', image: '/images/accessories.jpg', link: '/products?category=accessories' },
  ];

  // Style categories data
  const styleCategories = [
    { id: 1, name: 'Classic', image: '/images/Classic_circle_deskt_e9ae020dcc.avif', link: '/products?style=' + encodeURIComponent('Classic') },
    { id: 2, name: 'Eco Friendly', image: '/images/ECO_circle_deskt_3dabb575fb.avif', link: '/products?style=' + encodeURIComponent('Eco Friendly') },
    { id: 3, name: 'Artsy', image: '/images/Artsy_circle_deskt_cff6c1a19d.avif', link: '/products?style=' + encodeURIComponent('Artsy') },
    { id: 4, name: 'Retro', image: '/images/RETRO_circle_deskt_5bdee8988f.avif', link: '/products?style=' + encodeURIComponent('Retro') },
    { id: 5, name: 'Street Style', image: '/images/STREET_circle_deskt_fe41a993fd.avif', link: '/products?style=' + encodeURIComponent('Street Style') },
    { id: 6, name: 'Bold', image: '/images/Bold_circle_deskt_87fc48e0e3.avif', link: '/products?style=' + encodeURIComponent('Bold') },
  ];
  
  // ServiceBar styled component definition
  const ServiceBar = styled.div`
    display: flex;
    margin-bottom:10px;
    justify-content: center;
    align-items: center;
    padding: 1rem 0;
    background-color: rgba(255, 255, 255, 0.8);
    width: 80%;
    position: absolute;
    bottom: 0;
    left: 10%; /* Center the bar by setting left to (100% - width)/2 */
    z-index: 3;
    border-radius: 50px;
    
    @media (max-width: 768px) {
      width: 90%;
      left: 5%;
      padding: 0.8rem 0;
      border-radius: 30px;
    }
    
    @media (max-width: 480px) {
      width: 95%;
      left: 2.5%;
      padding: 0.6rem 0;
      border-radius: 20px;
    }
  `;
  
  // Add the AutoScrollToggle styled component here
  const AutoScrollToggle = styled.button`
    background-color: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    padding: 0.5rem 1rem;
    margin-top: 1rem;
    cursor: pointer;
    font-size: 0.8rem;
    transition: all 0.2s ease;
    
    &:hover {
      background-color: #e9ecef;
    }
  `;

  // Logo Section Styled Components
  const LogoSection = styled.section`
    padding: 3rem 2rem;
    background-color: #f8f9fa;
    text-align: center;
    
    @media (max-width: 768px) {
      padding: 2rem 1rem;
    }
  `;

  const LogoTitle = styled.h3`
    font-size: 1.2rem;
    color: #666;
    margin-bottom: 2rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-family: 'Montserrat', sans-serif;
    
    @media (max-width: 768px) {
      font-size: 1rem;
      margin-bottom: 1.5rem;
    }
  `;

  const LogoContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 3rem;
    max-width: 800px;
    margin: 0 auto;
    
    @media (max-width: 768px) {
      gap: 2rem;
      flex-wrap: wrap;
    }
    
    @media (max-width: 480px) {
      gap: 1.5rem;
    }
  `;

  const LogoImage = styled.img`
    height: 40px;
    width: 120px;
    object-fit: contain;
    filter: grayscale(100%) opacity(0.6);
    transition: all 0.3s ease;
    
    @media (max-width: 768px) {
      height: 32px;
      width: 96px;
    }
    
    @media (max-width: 480px) {
      height: 28px;
      width: 84px;
    }
  `;

  const LogoItem = styled.div`
    opacity: 0.6;
    transition: opacity 0.3s ease;
    
    &:hover {
      opacity: 1;
      
      ${LogoImage} {
        filter: grayscale(0%) opacity(1);
        transform: scale(1.05);
      }
    }
  `;

  const LogoText = styled.span`
    font-size: 1.5rem;
    font-weight: 600;
    color: #999;
    font-family: 'Montserrat', sans-serif;
    
    @media (max-width: 768px) {
      font-size: 1.2rem;
    }
    
    @media (max-width: 480px) {
      font-size: 1rem;
    }
  `;

  // Create loading and error content variables instead of early returns
  let content;
  
  if (loading === 'loading') {
    content = (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <div style={{ textAlign: 'center' }}>
          <h2>Loading products...</h2>
          <p>Please wait while we fetch the latest products</p>
        </div>
      </div>
    );
  } else if (loading === 'failed' || error) {
    content = (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <div style={{ textAlign: 'center' }}>
          <h2>Error loading products</h2>
          <p>{error}</p>
          <button onClick={() => dispatch(fetchProducts())}>Retry</button>
        </div>
      </div>
    );
  } else {
    
    content = (
      <div className="home-page" style={{ overflowX: 'hidden' }}>
      {showApiDebug && <ApiDebug onClose={() => setShowApiDebug(false)} />}
      <HeroSection>
        <HeroContent>
          <HeroTitle>Premium & Stylish Eyewear</HeroTitle>
          <HeroSubtitle>Shop our curated eyewear collection today.</HeroSubtitle>
          <ShopNowButton to="/products">Shop now</ShopNowButton>
        </HeroContent>
        <ServiceBar>
          <ServiceItem>
            <ServiceIcon>🔄</ServiceIcon>
            14-Day Free Returns
          </ServiceItem>
          <ServiceItem>
            <ServiceIcon>🕒</ServiceIcon>
            24/7 Customer Service
          </ServiceItem>
          <ServiceItem>
            <ServiceIcon>🛡️</ServiceIcon>
            Vision Insurance
          </ServiceItem>
        </ServiceBar>
      </HeroSection>
      
      
      
      <PromoSection>
        <PromoContainer>
          <ResponsiveHeading>It's always a good day to buy glasses online.</ResponsiveHeading>
          <ResponsiveParagraph>
            Express your every vision with affordable <Link to="/products?category=eyeglasses" style={{ color: '#48b2ee', textDecoration: 'none', fontWeight: '600' }}>eyeglasses</Link> and prescription <Link to="/products?category=sunglasses" style={{ color: '#48b2ee', textDecoration: 'none', fontWeight: '600' }}>sunglasses</Link>.
            Shop thousands of glasses 2-Day Delivery, and frames starting at just 500 Rs!
          </ResponsiveParagraph>
          <ButtonContainer>
            <ShopButton to="/products?category=eyeglasses">Shop eyeglasses</ShopButton>
            <ShopButton to="/products?category=sunglasses">Shop sunglasses</ShopButton>
          </ButtonContainer>
        </PromoContainer>
      </PromoSection>
      
      {/* Best Selling Products */}
      <FeaturedSection>
        <SectionTitle>Best Selling Products</SectionTitle>
        <ProductGrid>
          {(displayBestSellingProducts || []).slice(0, 8).map(product => (
            <ProductCard key={product.id}>
              {product.discount && product.discount.hasDiscount && (
                <DiscountBadge>
                  {typeof product.discount === 'string' ? product.discount : `${product.discount.discountPercentage}% OFF`}
                </DiscountBadge>
              )}
              <CategoryBadge hasDiscount={product.discount && product.discount.hasDiscount}>
                {product.category}
              </CategoryBadge>
             
              <WishlistButton 
                isInWishlist={isInWishlist(product.id)}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleWishlistToggle(product);
                }}
              >
                <FiHeart fill={isInWishlist(product.id) ? '#ff4757' : 'none'} />
              </WishlistButton>
              
              <Link to={`/products/${generateUniqueSlug(product.name, product.id)}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <ProductImage image={product.image} />
                <ProductContent>
                  <ProductTitle>{product.name}</ProductTitle>
                  <ProductBrand>{product.brand}</ProductBrand>
                  {(() => {
                    const discountInfo = calculateDiscountedPrice(product);
                    
                    if (discountInfo) {
                      return (
                        <PriceContainer>
                          <DiscountedPrice>{formatPrice(discountInfo.discounted)}</DiscountedPrice>
                          <OriginalPrice>{formatPrice(discountInfo.original)}</OriginalPrice>
                          <DiscountPercentage>{discountInfo.percentage}% OFF</DiscountPercentage>
                        </PriceContainer>
                      );
                    } else {
                      return <ProductPrice>{product.price}</ProductPrice>;
                    }
                  })()}
                  <ColorOptions>
                    {product.colors && product.colors.map((color, index) => (
                      <ColorSwatchContainer key={index}>
                        <ColorSwatch 
                          color={color.hex || color}
                          selected={selectedColors[product.id] === index}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleColorSelect(product.id, index);
                          }}
                        />
                        <ColorTooltip>
                          {color.name || `Color ${index + 1}`}
                        </ColorTooltip>
                      </ColorSwatchContainer>
                    ))}
                  </ColorOptions>
                </ProductContent>
              </Link>
            </ProductCard>
          ))}
        </ProductGrid>
        <ButtonContainer2>
          <SectionShopButton to="/products?category=best-sellers">Shop Best Sellers</SectionShopButton>
        </ButtonContainer2>
      </FeaturedSection>
      
      {/* Featured Products */}
      <FeaturedSection>
        <SectionTitle>Featured Products</SectionTitle>
        <ProductGrid>
          {displayFeaturedProducts.slice(0, 8).map(product => (
            <ProductCard key={product.id}>
              {product.discount && product.discount.hasDiscount && (
                <DiscountBadge>
                  {typeof product.discount === 'string' ? product.discount : `${product.discount.discountPercentage}% OFF`}
                </DiscountBadge>
              )}
              <CategoryBadge hasDiscount={product.discount && product.discount.hasDiscount}>
                {product.category}
              </CategoryBadge>
             
              <WishlistButton 
                isInWishlist={isInWishlist(product.id)}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleWishlistToggle(product);
                }}
              >
                <FiHeart fill={isInWishlist(product.id) ? '#ff4757' : 'none'} />
              </WishlistButton>
              
              <Link to={`/products/${generateUniqueSlug(product.name, product.id)}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <ProductImage image={product.image} />
                <ProductContent>
                  <ProductTitle>{product.name}</ProductTitle>
                  <ProductBrand>{product.brand}</ProductBrand>
                  {(() => {
                    const discountInfo = calculateDiscountedPrice(product);
                    
                    if (discountInfo) {
                      return (
                        <PriceContainer>
                          <DiscountedPrice>{formatPrice(discountInfo.discounted)}</DiscountedPrice>
                          <OriginalPrice>{formatPrice(discountInfo.original)}</OriginalPrice>
                          <DiscountPercentage>{discountInfo.percentage}% OFF</DiscountPercentage>
                        </PriceContainer>
                      );
                    } else {
                      return <ProductPrice>{product.price}</ProductPrice>;
                    }
                  })()}
                  <ColorOptions>
                    {product.colors && product.colors.map((color, index) => (
                      <ColorSwatchContainer key={index}>
                        <ColorSwatch 
                          color={color.hex || color}
                          selected={selectedColors[product.id] === index}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleColorSelect(product.id, index);
                          }}
                        />
                        <ColorTooltip>
                          {color.name || `Color ${index + 1}`}
                        </ColorTooltip>
                      </ColorSwatchContainer>
                    ))}
                  </ColorOptions>
                </ProductContent>
              </Link>
            </ProductCard>
          ))}
        </ProductGrid>
        <ButtonContainer2>
          <SectionShopButton to="/products?featured=true">Shop Featured</SectionShopButton>
        </ButtonContainer2>
      </FeaturedSection>
      
      {/* All Products Section */}
      <FeaturedSection>
        <SectionTitle>All Products</SectionTitle>
        <ProductGrid>
          {products ? products.slice(0, 8).map(product => {
            const selectedColorIndex = selectedColors[product.id] || 0;
            const selectedColor = product.colors && product.colors[selectedColorIndex];
            
            const displayProduct = {
              id: product.id,
              name: product.name,
              price: formatPrice(product.price),
              brand: product.brand || 'Eyewear',
              category: product.category,
              image: selectedColor?.image || product.image || '/images/default-glasses.jpg',
              colors: product.colors,
              discount: product.discount
            };
            
            return (
              <ProductCard key={product.id}>
                {product.discount && product.discount.hasDiscount && (
                  <DiscountBadge>
                    {typeof product.discount === 'string' ? product.discount : `${product.discount.discountPercentage}% OFF`}
                  </DiscountBadge>
                )}
                <CategoryBadge hasDiscount={product.discount && product.discount.hasDiscount}>
                  {product.category}
                </CategoryBadge>
               
                <WishlistButton 
                  isInWishlist={isInWishlist(product.id)}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleWishlistToggle(product);
                  }}
                >
                  <FiHeart fill={isInWishlist(product.id) ? '#ff4757' : 'none'} />
                </WishlistButton>
                
                <Link to={`/products/${generateUniqueSlug(product.name, product.id)}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <ProductImage image={displayProduct.image} />
                  <ProductContent>
                    <ProductTitle>{displayProduct.name}</ProductTitle>
                    <ProductBrand>{displayProduct.brand}</ProductBrand>
                    {(() => {
                      const discountInfo = calculateDiscountedPrice(product);
                      
                      if (discountInfo) {
                        return (
                          <PriceContainer>
                            <DiscountedPrice>{formatPrice(discountInfo.discounted)}</DiscountedPrice>
                            <OriginalPrice>{formatPrice(discountInfo.original)}</OriginalPrice>
                            <DiscountPercentage>{discountInfo.percentage}% OFF</DiscountPercentage>
                          </PriceContainer>
                        );
                      } else {
                        return <ProductPrice>{displayProduct.price}</ProductPrice>;
                      }
                    })()}
                    <ColorOptions>
                      {product.colors && product.colors.map((color, index) => (
                        <ColorSwatchContainer key={index}>
                          <ColorSwatch 
                            color={color.hex}
                            selected={selectedColorIndex === index}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleColorSelect(product.id, index);
                            }}
                          />
                        </ColorSwatchContainer>
                      ))}
                    </ColorOptions>
                  </ProductContent>
                </Link>
                
                <CartButton onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleAddToCart(displayProduct);
                }}>
                  <FiShoppingBag />
                </CartButton>
              </ProductCard>
            );
          }) : []}
        </ProductGrid>
        <ButtonContainer2>
          <SectionShopButton to="/products">Shop All Products</SectionShopButton>
        </ButtonContainer2>
      </FeaturedSection>
      
      {/* Style Picker Section */}
      <StylePickerSection>
        <StylePickerTitle>Pick a style, any style:</StylePickerTitle>
        <StyleGrid>
          {styleCategories.map(style => (
            <StyleCard key={style.id} to={style.link}>
              <StyleImageContainer>
                <StyleImage 
                  src={style.image} 
                  alt={style.name}
                  onError={(e) => e.target.src = '/images/placeholder.jpg'}
                />
              </StyleImageContainer>
              <StyleName>{style.name}</StyleName>
            </StyleCard>
          ))}
          
        </StyleGrid>
      </StylePickerSection>

      {/* Add new promotional section */}
      <FeaturedSection>
        
        <PromotionalGrid>
          <PromotionalCard backgroundImage="/images/SS21_Elevated_Eyeglasses_Douglas_10.webp">
            <PromotionalContent>
              <PromotionalTitle>Back to You</PromotionalTitle>
              <PromotionalSubtitle>Eyewear to express all sides of your style.</PromotionalSubtitle>
              <PromotionalButton to="/products" buttonColor="#48b2ee" buttonHoverColor="#48b2ee">Shop now</PromotionalButton>
            </PromotionalContent>
          </PromotionalCard>
          
          <PromotionalCard backgroundImage="/images/B2_Desktop_982_660_23e1e8a124.avif">
            <PromotionalContent>
              <PromotionalTitle>Premium Brands</PromotionalTitle>
              <PromotionalSubtitle>Designer Eyewear at Affordable Prices</PromotionalSubtitle>
              
              <PromotionalButton to="/products?category=designer" buttonColor="#48b2ee" buttonHoverColor="#48b2ee">Shop now</PromotionalButton>
            </PromotionalContent>
          </PromotionalCard>
        </PromotionalGrid>
      </FeaturedSection>

      <LogoSection>
      
        <LogoContainer>
          <LogoItem>
            <LogoImage src="/images/77-772947_15-tom-ford-logo-png-for-free-download.png" alt="CNET" />
          </LogoItem>
          <LogoItem>
            <LogoImage src="/images/CDI.PA_BIG-0bd74bba.png" alt="Dior" />
          </LogoItem>
          <LogoItem>
            <LogoImage src="/images/Coach-logo.png" alt="Cosmopolitan" />
          </LogoItem>
          <LogoItem>
            <LogoImage src="/images/RalphLauren_BrandLogo.webp" alt="Men's Health" />
          </LogoItem>
          <LogoItem>
            <LogoImage src="/images/35367-3-ray-ban-logo-image.webp" alt="NBC" />
          </LogoItem>
        </LogoContainer>
      </LogoSection>

      {/* Testimonials Section */}
      
       
      {/* Newsletter Signup Section */}
      <NewsletterSection>
        <NewsletterContainer>
          <NewsletterTitle>Join The Exclusive Club</NewsletterTitle>
          <NewsletterSubtitle>See our latest collections & exclusive offers before the crowd!</NewsletterSubtitle>
          
          <NewsletterForm>
            <EmailInput type="email" placeholder="Enter your email address" />
            <SubmitButton type="submit">Subscribe</SubmitButton>
          </NewsletterForm>
          
          <NewsletterDisclaimer>
            By subscribing, I confirm that I am over 18 years of age and agree that my personal data can be used to send me news, special offers, and other marketing communications as part of the Loyalty Program.
          </NewsletterDisclaimer>
        </NewsletterContainer>
      </NewsletterSection>
      
      {/* Wishlist Modal */}
      {wishlistModal.isOpen && (
        <ModalOverlay onClick={closeModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalCloseButton onClick={closeModal}>
              <FiX />
            </ModalCloseButton>
            
            {wishlistModal.type === 'signin' ? (
              <>
                <ModalIcon>❤️</ModalIcon>
                <ModalTitle>Sign In Required</ModalTitle>
                <ModalMessage>
                  Please sign in to save this product to your wishlist and access it later.
                </ModalMessage>
                <div>
                  <ModalButton onClick={handleSignIn}>
                    Sign In
                  </ModalButton>
                  <ModalButton className="secondary" onClick={closeModal}>
                    Cancel
                  </ModalButton>
                </div>
              </>
            ) : (
              <>
                <ModalIcon success>✓</ModalIcon>
                <ModalTitle>Added to Wishlist!</ModalTitle>
                <ModalMessage>
                  "{wishlistModal.product?.name}" has been saved to your wishlist.
                </ModalMessage>
                <div>
                  <ModalButton onClick={handleViewWishlist}>
                    View Wishlist
                  </ModalButton>
                  <ModalButton className="secondary" onClick={closeModal}>
                    Continue Shopping
                  </ModalButton>
                </div>
              </>
            )}
          </ModalContent>
        </ModalOverlay>
      )}
      
      </div>
    );
  }
  
  return content;
};

// Add these styled components with your other styled components
const PromoSection = styled.section`
  padding: 4rem 2rem 4rem 2rem;
  background-color: #fff;
  text-align: center;
  
  @media (max-width: 768px) {
    padding: 3rem 1rem 3rem 2rem;
  }
  
  @media (max-width: 480px) {
    padding: 1rem 2rem 1rem 2rem;
  }
`;

const PromoContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
  
  @media (max-width: 768px) {
    padding: 1.5rem 2rem;
  }
  
  @media (max-width: 480px) {
    padding: 2rem;
  }
`;
const ProductBrand = styled.p`
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 0.5rem;


  @media (max-width: 480px) {
    font-size: 9px;
  
`;



const PromoTitle = styled.h2`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: #333;
  font-family: 'Montserrat', sans-serif;
`;

const PromoText = styled.p`
  font-size: 1.2rem;
  line-height: 1.6;
  margin-bottom: 2rem;
  color: #555;
  font-family: 'Montserrat', sans-serif;
`;

const PromoLink = styled(Link)`
  color: #48b2ee;
  text-decoration: none;
  font-weight: 600;
  
  &:hover {
    text-decoration: underline;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 2rem;
  padding: 0 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 0 0.5rem;
  }
  
  @media (max-width: 480px) {
    gap: 0.8rem;
    padding: 0 0.5rem;
  }
`;

const ShopButton = styled(Link)`
  background-color: transparent;
  color: #333;
  border: 2px solid #333;
  padding: 0.8rem 1.5rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 600;
  font-family: 'Montserrat', sans-serif;
  transition: all 0.3s ease;
  display: inline-block;
  
  &:hover {
    background-color: #48b2ee;
    color: #fff;
  }
  
  @media (max-width: 768px) {
    width: 200px;
    text-align: center;
  }
  
  @media (max-width: 480px) {
    width: 180px;
    padding: 0.7rem 1rem;
    font-size: 0.9rem;
  }
`;

// Add these styled components for promotional grid
const PromotionalGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    padding: 0 1rem;
  }
  
  @media (max-width: 480px) {
    gap: 1rem;
    padding: 0 1rem;
    align-items: center;
  }
`;

const PromotionalCard = styled.div`
  position: relative;
  border-radius: 5px;
  overflow: hidden;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-image: url(${props => props.backgroundImage});
  background-size: cover;
  background-position: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.4);
    z-index: 0;
  }
  
  @media (max-width: 768px) {
    height: 250px;
  }
  
  @media (max-width: 480px) {
    height: 400px;
    
    
  }
`;

const PromotionalContent = styled.div`
  text-align: center;
  color: ${props => props.textColor || '#fff'};
  padding: 2rem;
  z-index: 1;
  
  @media (max-width: 768px) {
    padding: 1.5rem;
  }
  
  @media (max-width: 480px) {
    padding: 1rem;
  }
`;

const PromotionalTitle = styled.h3`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  font-family: 'Montserrat', sans-serif;
  
  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.5rem;
  }
`;

const PromotionalSubtitle = styled.p`
  font-size: 1rem;
  margin-bottom: 1.5rem;
  font-family: 'Montserrat', sans-serif;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const PromotionalCode = styled.div`
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const PromotionalButton = styled(Link)`
  background-color: ${props => props.buttonColor || '#48b2ee'};
  color: white;
  padding: 20px;
  border-radius: 15px;
  text-decoration: none;
  font-weight: 600;
  font-family: 'Montserrat', sans-serif;
  display: inline-block;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: ${props => props.buttonHoverColor || '#c85048'};
  }
`;

const SectionShopButton = styled(Link)`
  display: inline-block;
  background-color: transparent;
  color: black;
  font-family: 'Montserrat';
  padding: 12px 30px;
  border-radius: 5px;
  border: 2px solid black;
  text-decoration: none;
  font-weight: 500;
  font-family: 'Montserrat', sans-serif;
  margin-top: 2rem;
  transition: all 0.3s ease;
  
  
  &:hover {
    background-color: transparent;
    transform: translateY(-2px);
    border:1px solid #48b2ee;
    color:#48b2ee;
    
  }
  
  @media (max-width: 768px) {
    padding: 10px 25px;
    font-size: 0.9rem;
  }
`;

const ButtonContainer2 = styled.div`
  text-align: center;
  margin-top: 2rem;
`;

// Style Picker Section Components
const StylePickerSection = styled.section`
  padding: 4rem 2rem;
  background-color: #fff;
  text-align: center;
  
  @media (max-width: 768px) {
    padding: 3rem 1rem;
  }
  
  @media (max-width: 480px) {
    padding: 2rem 0.5rem;
  }
`;

const StylePickerTitle = styled.h2`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 3rem;
  color: #333;
  font-family: 'Montserrat', sans-serif;
  
  @media (max-width: 768px) {
    font-size: 2rem;
    margin-bottom: 2rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.8rem;
    margin-bottom: 1.5rem;
  }
`;

const StyleGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  
  @media (max-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.8rem;
  }
`;

const StyleCard = styled(Link)`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: inherit;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const StyleImageContainer = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
    transform: scale(1.05);
  }
  
  @media (max-width: 768px) {
    width: 100px;
    height: 100px;
  }
  
  @media (max-width: 480px) {
    width: 80px;
    height: 80px;
  }
`;

const StyleImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  
  @media (max-width: 768px) {
    width: 100%;
    height: 100%;
  }
  
  @media (max-width: 480px) {
    width: 100%;
    height: 100%;
  }
`;

const StyleName = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  margin: 0;
  font-family: 'Montserrat', sans-serif;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.8rem;
  }
`;

// Testimonial Slider Components - Matching Reference Image
const TestimonialSection = styled.section`
  padding: 4rem 2rem;
  background: white;
  margin-top: 3rem;
  
  @media (max-width: 768px) {
    padding: 3rem 1rem;
  }
  
  @media (max-width: 480px) {
    padding: 2rem 1rem;
  }
`;

const TestimonialHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3rem;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
`;

const TestimonialTitle = styled.h2`
  font-size: 2.5rem;
  font-weight: 600;
  color: #333;
  display: flex;
  justify-content: space-between;
 
  font-family: 'Montserrat', sans-serif;
  
  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
`;

const TestimonialNavigation = styled.div`
  display: flex;
  gap: 0.5rem;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const NavButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid #48b2ee;
  background: white;
  color: #666;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: #48b2ee;
    color: white;
    border-color: #48b2ee;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Testimonial Carousel Styled Components
const TestimonialCarousel = styled.div`
  position: relative;
  overflow: hidden;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
`;

const TestimonialTrack = styled.div`
  display: flex;
  transition: transform 0.5s ease;
  transform: translateX(-${props => props.currentSlide * (100 / 3)}%);
  
  @media (max-width: 640px) {
    transform: translateX(-${props => props.currentSlide * 100}%);
  }
`;

const TestimonialCard = styled.div`
  flex: 0 0 33.333%;
  padding: 2rem;
  background: ${props => props.isCenter ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white'};
  border-radius: 1rem;
  margin: 0 0.5rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transform: ${props => props.isCenter ? 'scale(1.05)' : 'scale(1)'};
  transition: all 0.3s ease;
  
  @media (max-width: 640px) {
    flex: 0 0 100%;
    margin: 0 1rem;
    transform: scale(1);
  }
`;

const StarRating = styled.div`
  display: flex;
  margin-bottom: 1rem;
  color: ${props => props.isCenter ? '#ffd700' : '#fbbf24'};
  font-size: 1rem;
`;

const TestimonialText = styled.p`
  font-size: 0.95rem;
  line-height: 1.6;
  color: ${props => props.isCenter ? 'rgba(255,255,255,0.9)' : '#4b5563'};
  margin-bottom: 1.5rem;
  
  @media (max-width: 640px) {
    color: rgba(255,255,255,0.9);
  }
`;

const TestimonialAuthor = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const AuthorAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.9rem;
  color: #6b7280;
`;

const AuthorInfo = styled.div`
  text-align: left;
`;

const AuthorName = styled.h4`
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: ${props => props.isCenter ? 'white' : '#111827'};
  
  @media (max-width: 640px) {
    color: white;
  }
`;

const AuthorRole = styled.p`
  margin: 0;
  font-size: 0.8rem;
  color: ${props => props.isCenter ? 'rgba(255,255,255,0.8)' : '#6b7280'};
  
  @media (max-width: 640px) {
    color: rgba(255,255,255,0.8);
  }
`;

// Newsletter Section Styled Components
const NewsletterSection = styled.section`
  background-color: #48b2ee;
  padding: 4rem 2rem;
  text-align: center;
`;

const NewsletterContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const NewsletterTitle = styled.h2`
  color: white;
  font-size: 2.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const NewsletterSubtitle = styled.p`
  color: white;
  font-size: 1.1rem;
  margin-bottom: 2rem;
  opacity: 0.9;
`;

const NewsletterForm = styled.form`
  display: flex;
  max-width: 500px;
  margin: 0 auto 2rem auto;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 60px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    max-width: 90%;
    margin: 0 auto 1.5rem auto;
    border-radius: 25px;
    gap: 0;
  }
  
  @media (max-width: 480px) {
    max-width: 95%;
    margin: 0 auto 1rem auto;
  }
`;

const EmailInput = styled.input`
  flex: 1;
  padding: 1.2rem 2rem;
  border: none;
  outline: none;
  font-size: 1.1rem;
  background: transparent;
  font-family: 'Montserrat', sans-serif;
  font-weight: 500;
  
  &::placeholder {
    color: #666;
    font-weight: 400;
  }
  
  &:focus {
    background: rgba(72, 178, 238, 0.05);
  }
  
  @media (max-width: 768px) {
    padding: 1rem 1.5rem;
    font-size: 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 25px 25px 0 0;
  }
  
  @media (max-width: 480px) {
    padding: 0.9rem 1.2rem;
    font-size: 0.95rem;
  }
`;

const SubmitButton = styled.button`
  background: linear-gradient(135deg, #48b2ee 0%, #3a9bd9 100%);
  border: none;
  padding: 1.2rem 2rem;
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 50px;
  min-width: 120px;
  font-family: 'Montserrat', sans-serif;
  
  &:hover {
    background: linear-gradient(135deg, #3a9bd9 0%, #2980b9 100%);
    transform: scale(1.05);
    box-shadow: 0 4px 15px rgba(72, 178, 238, 0.4);
  }
  
  &:active {
    transform: scale(0.98);
  }
  
  @media (max-width: 768px) {
    padding: 1rem 1.5rem;
    font-size: 1rem;
    min-width: 100px;
    border-radius: 0 0 25px 25px;
    width: 100%;
  }
  
  @media (max-width: 480px) {
    padding: 0.9rem 1.2rem;
    font-size: 0.95rem;
  }
`;

const NewsletterDisclaimer = styled.p`
  color: white;
  font-size: 0.8rem;
  opacity: 0.8;
  line-height: 1.4;
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: 0.75rem;
    max-width: 90%;
    padding: 0 1rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.7rem;
    line-height: 1.3;
  }
`;

// Wishlist Modal Components
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
  max-width: 400px;
  width: 90%;
  text-align: center;
  position: relative;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
`;

const ModalCloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #999;
  cursor: pointer;
  
  &:hover {
    color: #333;
  }
`;

const ModalIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
  color: ${props => props.success ? '#4CAF50' : '#ff4757'};
`;

const ModalTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #333;
`;

const ModalMessage = styled.p`
  color: #666;
  margin-bottom: 1.5rem;
  line-height: 1.5;
`;

const ModalButton = styled.button`
  background: #48b2ee;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  margin: 0 0.5rem;
  transition: background-color 0.2s;
  
  &:hover {
    background: #3a9bd9;
  }
  
  &.secondary {
    background: #f5f5f5;
    color: #333;
    
    &:hover {
      background: #e0e0e0;
    }
  }
`;

export default HomePage;
