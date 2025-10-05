import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { fetchProductById, fetchProducts } from '../redux/slices/productSlice';
import { addToCart } from '../redux/slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '../redux/slices/wishlistSlice';
import { FiShoppingBag, FiX } from 'react-icons/fi';
import formatPrice from '../utils/formatPrice';
import * as reviewService from '../services/reviewService';
import { findProductBySlug, extractIdFromSlug, generateUniqueSlug } from '../utils/slugUtils';

// Styled Components
const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.5rem;
  }
`;

const BreadcrumbNav = styled.div`
  margin-bottom: 2rem;
  font-size: 0.9rem;
  
  @media (max-width: 768px) {
    margin-bottom: 1rem;
    font-size: 0.8rem;
  }
  
  a {
    color: #666;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  span {
    margin: 0 0.5rem;
    color: #999;
  }
`;

const ProductLayout = styled.div`
  display: flex;
  margin: 2rem 0;
  gap: 3rem;
  background-color: #f9f9f9;
  padding: 2rem;
  border-radius: 10px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    margin: 1rem 0;
    gap: 1.5rem;
    padding: 1rem;
  }
  
  @media (max-width: 480px) {
    margin: 0.5rem 0;
    gap: 1rem;
    padding: 0.75rem;
  }
`;

const ImageGallery = styled.div`
  flex: 1;
  position: relative;
  max-width: 650px;
  
  @media (max-width: 768px) {
    max-width: 100%;
  }
`;

const MainImage = styled.div`
  width: 100%;
  margin-bottom: 1rem;
  overflow: hidden;
  border-radius: 10px;
  height: 400px;
  
  @media (max-width: 768px) {
    height: 300px;
  }
  
  @media (max-width: 480px) {
    height: 250px;
  }
  
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    background-color: #f5f5f5;
  }
`;

const ProductInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 400px;
  
  @media (max-width: 768px) {
    min-height: auto;
  }
`;

const ProductBrand = styled.div`
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  font-weight: 500;
`;

const ProductTitle = styled.h1`
  font-size: 2rem;
  font-weight: 600;
  text-align: left;
  margin-bottom: 1rem;
  color: #333;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const PriceContainer = styled.div`
  margin-bottom: 1.5rem;
`;

const CurrentPrice = styled.span`
  font-size: 1.5rem;
  font-weight: 600;
  text-align: left;
  color: #333;
  margin-right: 1rem;
  
  @media (max-width: 768px) {
    font-size: 1.3rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.2rem;
    margin-right: 0.75rem;
  }
`;

const OriginalPrice = styled.span`
  font-size: 1.2rem;
  color: #999;
  text-align:left;
  text-decoration: line-through;
  margin-right: 0.5rem;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1rem;
    margin-right: 0.4rem;
  }
`;

const DiscountedPrice = styled.span`
  font-size: 1.5rem;
  font-weight: 600;
  color: #e74c3c;
  margin-right: 1rem;
  
  @media (max-width: 768px) {
    font-size: 1.3rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.2rem;
    margin-right: 0.75rem;
  }
`;

const DiscountPercentage = styled.span`
  background-color: #e74c3c;
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
`;

const ProductDescription = styled.p`
  color: #666;
  text-align:left;
  line-height: 1.6;
  margin-bottom: 1.5rem;
`;

const ColorLabel = styled.div`
  font-weight: 500;
  margin-bottom: 0.5rem;
  text-align:left;
  color: #333;
`;

const ColorOptions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`;

const ColorSwatch = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: ${props => props.color};
  border: 2px solid ${props => props.selected ? '#48b2ee' : '#ddd'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: scale(1.1);
    border-color: #48b2ee;
  }
`;

const SizeLabel = styled.div`
  font-weight: 500;
  margin-bottom: 0.5rem;
  text-align:left;
  color: #333;
`;

const SizeOptions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`;

const SizeOption = styled.button`
  padding: 0.5rem 1rem;
  border: 2px solid ${props => props.selected ? '#48b2ee' : '#ddd'};
  background-color: ${props => props.selected ? '#48b2ee' : 'white'};
  color: ${props => props.selected ? 'white' : '#333'};
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #48b2ee;
  }
`;

const FreeShippingBadge = styled.div`
  background-color: #e8f5e8;
  color: #2d5a2d;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  .icon {
    font-size: 1.2rem;
  }
`;

const LensSelectionButton = styled.button`
  width: 100%;
  padding: 1rem;
  border: 2px solid #48b2ee;
  background-color: white;
  color: #48b2ee;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #48b2ee;
    color: white;
  }
  
  .lens-info {
    text-align: left;
  }
  
  .lens-type {
    font-size: 1rem;
    font-weight: 600;
  }
  
  .arrow {
    font-size: 1.2rem;
    font-weight: bold;
  }
`;

// Duplicate About Section components removed - using mobile-responsive versions below

const TabContent = styled.div`
  animation: fadeIn 0.3s ease;
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const SpecsContainer = styled.div`
  display: grid;
  gap: 1rem;
`;

const SpecRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e0e0e0;
  
  &:last-child {
    border-bottom: none;
  }
`;

const SpecLabel = styled.span`
  font-weight: 500;
  color: #666;
`;

const SpecValue = styled.span`
  color: #333;
  font-weight: 500;
`;

// Reviews Section Styled Components




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

const ReviewTitle = styled.h4`
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

// About Section Styled Components
const AboutSection = styled.section`
  margin: 3rem 0;
  padding: 2rem;
  background: #f9f9f9;
  border-radius: 12px;
  
  @media (max-width: 768px) {
    margin: 2rem 0;
    padding: 1.5rem;
  }
  
  @media (max-width: 480px) {
    margin: 1.5rem 0;
    padding: 1rem;
    border-radius: 8px;
  }
`;

const AboutTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 1.5rem;
  text-align: left;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.3rem;
    margin-bottom: 0.75rem;
  }
`;

const TabsContainer = styled.div`
  width: 100%;
`;

const TabsHeader = styled.div`
  display: flex;
  border-bottom: 2px solid #e0e0e0;
  margin-bottom: 1.5rem;
  gap: 0.5rem;
  
  @media (max-width: 768px) {
    margin-bottom: 1rem;
    gap: 0.25rem;
  }
  
  @media (max-width: 480px) {
    flex-wrap: wrap;
    gap: 0.5rem;
    border-bottom: 1px solid #e0e0e0;
  }
`;

const Tab = styled.button`
  background: none;
  border: none;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  color: ${props => props.active ? '#48b2ee' : '#666'};
  border-bottom: 2px solid ${props => props.active ? '#48b2ee' : 'transparent'};
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  
  &:hover {
    color: #48b2ee;
  }
  
  @media (max-width: 768px) {
    padding: 0.6rem 1rem;
    font-size: 0.9rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.5rem 0.75rem;
    font-size: 0.85rem;
    flex: 1;
    text-align: center;
    min-width: 0;
  }
`;

const AboutContent = styled.div`
  color: #666;
  line-height: 1.6;
  font-size: 1rem;
  
  @media (max-width: 768px) {
    font-size: 0.95rem;
    line-height: 1.5;
  }
  
  @media (max-width: 480px) {
    font-size: 0.9rem;
    line-height: 1.4;
  }
  
  h3 {
    color: #333;
    font-size: 1.2rem;
    font-weight: 600;
    margin: 1.5rem 0 0.75rem 0;
    
    @media (max-width: 480px) {
      font-size: 1.1rem;
      margin: 1rem 0 0.5rem 0;
    }
  }
  
  ul {
    margin: 0.75rem 0;
    padding-left: 1.5rem;
    
    @media (max-width: 480px) {
      padding-left: 1.25rem;
    }
  }
  
  li {
    margin-bottom: 0.5rem;
    
    @media (max-width: 480px) {
      margin-bottom: 0.4rem;
    }
  }
`;

// Reviews Section Styled Components
const ReviewsSection = styled.section`
  margin: 3rem 0;
  
  @media (max-width: 768px) {
    margin: 2rem 0;
  }
  
  @media (max-width: 480px) {
    margin: 1.5rem 0;
  }
`;

const ReviewsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
    margin-bottom: 1.5rem;
  }
`;

const ReviewsTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 600;
  color: #333;
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.3rem;
  }
`;

const RateButton = styled.button`
  background: #48b2ee;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: #3a9bd8;
  }
  
  @media (max-width: 768px) {
    width: 100%;
    padding: 0.75rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`;

// Related Products Section Styled Components
const RelatedProductsSection = styled.section`
  margin: 3rem 0;
  
  @media (max-width: 768px) {
    margin: 2rem 0;
  }
  
  @media (max-width: 480px) {
    margin: 1.5rem 0;
  }
`;

// Action Buttons Styled Components
const ActionButtonsContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.75rem;
    margin-top: 1.5rem;
  }
  
  @media (max-width: 480px) {
    gap: 0.5rem;
    margin-top: 1rem;
  }
`;

const BuyNowButton = styled.button`
  flex: 1;
  background: #48b2ee;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 1rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background: #3a9bd9;
  }
  
  @media (max-width: 768px) {
    padding: 0.875rem 1.5rem;
    font-size: 1rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.75rem 1rem;
    font-size: 0.95rem;
    min-height: 48px;
  }
`;

const WishlistActionButton = styled.button`
  background: none;
  border: 2px solid #48b2ee;
  border-radius: 8px;
  padding: 1rem;
  font-size: 1rem;
  color: #48b2ee;
  cursor: pointer;
  min-width: 60px;
  transition: all 0.2s;
  
  &:hover {
    background: #48b2ee;
    color: white;
  }
  
  @media (max-width: 768px) {
    padding: 0.875rem 1.5rem;
    font-size: 1rem;
    min-width: auto;
    flex: 1;
  }
  
  @media (max-width: 480px) {
    padding: 0.75rem 1rem;
    font-size: 0.95rem;
    min-height: 48px;
  }
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

const FileUploadSection = styled.div`
  margin-bottom: 1.5rem;
`;

const FileUploadLabel = styled.div`
  font-weight: 500;
  color: #333;
  margin-bottom: 0.5rem;
  text-align: center;
`;

const FileUploadArea = styled.div`
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

const FileUploadText = styled.div`
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
`;

const FileUploadSubtext = styled.div`
  color: #999;
  font-size: 0.8rem;
`;

const FileUploadInput = styled.input`
  display: none;
`;

const SubmitReviewButton = styled.button`
  background: #48b2ee;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: #3a9bd8;
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

// Modal Components for Lens Selection















const RelatedProductsTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #333;
  text-align: center;
`;

const RelatedProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }
`;

const RelatedProductCard = styled.div`
  border-radius: 12px;
  overflow: hidden;
  background-color: #f5f5f5;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease;
  cursor: pointer;
  position: relative;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const ProductImage = styled.div`
  height: 200px;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

const ProductContent = styled.div`
  padding: 1rem;
  background-color: white;
`;

const RelatedProductBrand = styled.div`
  color: #666;
  font-size: 0.8rem;
  margin-bottom: 0.25rem;
`;

const ProductPrice = styled.div`
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
`;

const ColorDot = styled.div`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: ${props => props.color};
  border: 1px solid #ddd;
  margin-right: 0.25rem;
`;

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
  z-index: 1;
`;

// Lens Modal Styled Components
const ModalOverlay = styled.div`
  position: fixed;

  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 0;
  max-width: 1500px;
  width: 99%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  display: flex;
  
  @media (max-width: 768px) {
    flex-direction: column;
    max-width: 95%;
  }
`;

const ModalLeftSection = styled.div`
  flex: 1;
  background-color: #f8f8f8;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 12px 0 0 12px;
  position: sticky;
  top: 0;
  height: 100vh;
  max-height: 600px;
  
  @media (max-width: 768px) {
    border-radius: 12px 12px 0 0;
    padding: 1.5rem;
    position: relative;
    height: auto;
    max-height: none;
  }
`;

const ModalRightSection = styled.div`
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
  max-height: 600px;
  
  @media (max-width: 768px) {
    padding: 1.5rem;
    max-height: none;
    overflow-y: visible;
  }
`;

const ProductImageInModal = styled.img`
  width: 200px;
  height: 200px;
  object-fit: contain;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    width: 150px;
    height: 150px;
  }
`;

const ProductNameInModal = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 0.5rem 0;
  text-align: center;
`;

const ProductSubtitleInModal = styled.p`
  color: #666;
  margin: 0;
  text-align: center;
  font-size: 0.9rem;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  margin: 0;
  padding-bottom: 1rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 0.5rem;
  border-radius: 50%;
  
  &:hover {
    background-color: #f5f5f5;
  }
`;

const LensOptionsGrid = styled.div`
  display: grid;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
`;

const LensOption = styled.div`
  border: 1px solid ${props => props.selected ? '#d4a574' : '#e0e0e0'};
  border-radius: 6px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: ${props => props.selected ? '#fdf7f0' : 'white'};
  
  &:hover {
    border-color: #d4a574;
    background-color: #fdf7f0;
  }
`;

const LensOptionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const LensOptionName = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin: 0;
`;

const LensOptionPrice = styled.span`
  font-size: 1rem;
  font-weight: 600;
  color: ${props => props.free ? '#28a745' : '#48b2ee'};
`;

const LensOptionBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-left: 0.5rem;
  
  ${props => props.type === 'top-pick' && `
    background-color: #007bff;
    color: white;
  `}
  
  ${props => props.type === 'new' && `
    background-color: #28a745;
    color: white;
  `}
`;

const LensOptionBrand = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const BrandLogo = styled.img`
  height: 20px;
  margin-left: 0.5rem;
`;

const LensOptionDescription = styled.p`
  color: #666;
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.4;
`;

const ModalActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
`;

const ModalButton = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${props => props.primary ? `
    background-color: #48b2ee;
    color: white;
    border: none;
    
    &:hover {
      background-color: #3a9bd8;
    }
  ` : `
    background-color: transparent;
    color: #666;
    border: 1px solid #ddd;
    
    &:hover {
      background-color: #f5f5f5;
    }
  `}
`;

const ProductDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { items: products, status, error } = useSelector(state => state.products);
  const { items: wishlistItems } = useSelector(state => state.wishlist);
  const { isAuthenticated, prescriptions } = useSelector(state => state.auth);
  
  const [product, setProduct] = useState(null);
  
  // Check if product is in wishlist
  const isInWishlist = product ? wishlistItems.some(item => item.id === product.id) : false;
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState('description');
  const [wishlistModal, setWishlistModal] = useState({ isOpen: false, type: '', product: null });
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showPrescriptionSelector, setShowPrescriptionSelector] = useState(false);
  const [selectedLensType, setSelectedLensType] = useState(null);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  
  // 4-step checkout flow states
  const [showUsageSelection, setShowUsageSelection] = useState(false);
  const [showLensTypeSelection, setShowLensTypeSelection] = useState(false);
  const [showPrescriptionMethod, setShowPrescriptionMethod] = useState(false);
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
  const [selectedUsage, setSelectedUsage] = useState('');
  const [selectedLensTypeOption, setSelectedLensTypeOption] = useState('');
  const [selectedPrescriptionMethod, setSelectedPrescriptionMethod] = useState('');
  const [showTwoPDNumbers, setShowTwoPDNumbers] = useState(false);
  const [showLensColorSelection, setShowLensColorSelection] = useState(false);
  const [selectedLensColor, setSelectedLensColor] = useState('');
  
  // Prescription form state
  const [prescriptionData, setPrescriptionData] = useState({
    rightEye: { sph: '0.00', cyl: '0.00', axis: '' },
    leftEye: { sph: '0.00', cyl: '0.00', axis: '' },
    pd: '63'
  });
  const [showClearLensOptions, setShowClearLensOptions] = useState(false);
  const [selectedClearLensOption, setSelectedClearLensOption] = useState('');
  const [showBlueLightOptions, setShowBlueLightOptions] = useState(false);
  const [selectedBlueLightOption, setSelectedBlueLightOption] = useState('');
  const [showTransitionsOptions, setShowTransitionsOptions] = useState(false);
  const [selectedTransitionsOption, setSelectedTransitionsOption] = useState('');
  const [showSunOptions, setShowSunOptions] = useState(false);
  const [selectedSunOption, setSelectedSunOption] = useState('');
  const [selectedTintStrength, setSelectedTintStrength] = useState('');
  const [selectedTintColor, setSelectedTintColor] = useState('');
  const [selectedMirroredColor, setSelectedMirroredColor] = useState('');
  const [selectedGradientColor, setSelectedGradientColor] = useState('');
  const [showLensPackage, setShowLensPackage] = useState(false);
  const [selectedLensPackage, setSelectedLensPackage] = useState('');
  const [showReviewSelections, setShowReviewSelections] = useState(false);
  const [showPrescriptionScan, setShowPrescriptionScan] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  
  // Write Review Modal States
  const [showWriteReviewModal, setShowWriteReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewEmail, setReviewEmail] = useState('');
  const [reviewUsername, setReviewUsername] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [reviewPhotos, setReviewPhotos] = useState([]);

  // Fetch all products from API (since we need to search by slug)
  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  // Set product from Redux store when data is loaded
  useEffect(() => {
    console.log('🔍 ProductDetailPage: Looking for product with slug:', slug);
    console.log('📦 Available products:', products?.length || 0);
    
    if (products && products.length > 0) {
      // Log product structure for debugging
      console.log('📋 First product structure:', products[0]);
      
      // Try multiple matching strategies
      let foundProduct = null;
      
      // Strategy 1: Use the existing slug-based matching
      foundProduct = findProductBySlug(products, slug);
      
      // Strategy 2: If slug matching fails, try direct ID matching
      if (!foundProduct) {
        const extractedId = extractIdFromSlug(slug);
        console.log('🔍 Extracted ID from slug:', extractedId);
        
        if (extractedId) {
          // Try numeric ID match
          foundProduct = products.find(p => p.id === extractedId);
          
          // Try string ID match (for MongoDB ObjectIds, etc.)
          if (!foundProduct) {
            foundProduct = products.find(p => p.id === extractedId.toString());
          }
          
          // Try _id field (common in MongoDB)
          if (!foundProduct) {
            foundProduct = products.find(p => p._id === extractedId.toString());
          }
        }
      }
      
      // Strategy 3: If still not found, try partial name matching
      if (!foundProduct && slug) {
        const slugParts = slug.split('-');
        const searchTerm = slugParts.slice(0, -1).join(' '); // Remove last part (ID)
        foundProduct = products.find(p => 
          p.name && p.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        console.log('🔍 Trying name search with term:', searchTerm);
      }
      
      console.log('🎯 Found product:', foundProduct ? foundProduct.name : 'Not found');
      console.log('🎯 Product ID:', foundProduct ? foundProduct.id || foundProduct._id : 'N/A');
      
      if (foundProduct) {
        setProduct(foundProduct);
        // Set default selections
        if (foundProduct.colors && foundProduct.colors.length > 0) {
          setSelectedColor(foundProduct.colors[0].name);
        }
        if (foundProduct.sizes) {
          let sizesArray = [];
          if (typeof foundProduct.sizes === 'string') {
            try {
              sizesArray = JSON.parse(foundProduct.sizes);
            } catch (e) {
              // If not JSON, treat as comma-separated string
              sizesArray = foundProduct.sizes.split(',').map(s => s.trim());
            }
          } else if (Array.isArray(foundProduct.sizes)) {
            sizesArray = foundProduct.sizes;
          }
          
          if (sizesArray && sizesArray.length > 0) {
            setSelectedSize(sizesArray[0]);
          }
        }
      } else {
        console.warn('❌ Product not found for slug:', slug);
        console.warn('❌ Available product IDs:', products.map(p => p.id || p._id).slice(0, 10));
      }
    }
  }, [products, slug]);

  // Calculate discount information
  const hasDiscount = product?.discount?.hasDiscount || false;
  const originalPrice = product?.price || 0;
  const discountedPrice = hasDiscount 
    ? originalPrice - (originalPrice * (product.discount.discountPercentage / 100))
    : originalPrice;

  const openLensModal = () => {
    handleContinueToUsage();
  };

  const handleViewWishlist = () => {
    setWishlistModal({ isOpen: false, type: '', product: null });
    navigate('/wishlist');
  };

  const closeModal = () => {
    setWishlistModal({ isOpen: false, type: '', product: null });
  };

  const handleSignInSuccess = () => {
    // In a real app, this would be handled by the auth system
    // For now, just simulate successful authentication without sample data
    dispatch({
      type: 'auth/loginSuccess',
      payload: {
        user: { id: '1', name: 'User', email: 'user@example.com' },
        prescriptions: [] // Empty array - user will see "No Saved Prescriptions" message
      }
    });
    
    setShowSignInModal(false);
    setShowPrescriptionSelector(true);
    setSelectedPrescriptionMethod('previous');
    setShowPrescriptionMethod(false);
  };

  const closePrescriptionModals = () => {
    setShowSignInModal(false);
    setShowPrescriptionSelector(false);
  };

  const handleLensSelection = (lensType) => {
    setSelectedLensType(lensType);
  };

  // 4-step checkout flow handlers
  const handleContinueToUsage = () => {
    setShowUsageSelection(true);
  };

  const handleContinueToLensType = () => {
    setShowUsageSelection(false);
    
    if (selectedUsage === 'bifocal-progressive') {
      setShowLensTypeSelection(true);
    } else if (selectedUsage === 'non-prescription') {
      // For non-prescription, skip prescription method and go directly to lens color selection
      setSelectedPrescriptionMethod('non-prescription');
      setShowLensColorSelection(true);
    } else {
      // For single-vision and reading, go to prescription method
      setShowPrescriptionMethod(true);
    }
  };

  const handleContinueToPrescriptionMethod = () => {
    setShowLensTypeSelection(false);
    setShowPrescriptionMethod(true);
  };

  const handleContinueToPrescriptionForm = () => {
    setShowPrescriptionMethod(false);
    setShowPrescriptionForm(true);
  };

  const closeAllModals = () => {
    setShowUsageSelection(false);
    setShowLensTypeSelection(false);
    setShowPrescriptionMethod(false);
    setShowPrescriptionForm(false);
    setShowLensColorSelection(false);
    setShowClearLensOptions(false);
    setShowBlueLightOptions(false);
    setShowTransitionsOptions(false);
    setShowSunOptions(false);
    setShowLensPackage(false);
    setShowReviewSelections(false);
    setShowPrescriptionScan(false);
  };

  // Handle file upload for prescription scanning
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type and size
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      const maxSize = 10 * 1024 * 1024; // 10MB
      
      if (!allowedTypes.includes(file.type)) {
        alert('Please upload a JPEG, PNG, or PDF file.');
        return;
      }
      
      if (file.size > maxSize) {
        alert('File size must be less than 10MB.');
        return;
      }
      
      setUploadedFile(file);
      setIsProcessingImage(true);
      
      // Simulate prescription processing
      setTimeout(() => {
        setIsProcessingImage(false);
        // Here you would normally send the file to an OCR service
        // For now, we'll just show success
        alert('Prescription scanned successfully! Please review the extracted data.');
        setShowPrescriptionScan(false);
        setShowPrescriptionForm(true);
      }, 2000);
    }
  };

  // Handle camera capture
  const handleCameraCapture = () => {
    // In a real app, this would open the device camera
    // For now, we'll just trigger the file input
    document.getElementById('camera-input').click();
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
        productId: product?.id,
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

  // Lens type options
  const lensOptions = [
    {
      id: 'standard',
      name: 'Standard Lenses',
      price: 0,
      description: 'Basic prescription lenses with anti-reflective coating'
    },
    {
      id: 'blue-light',
      name: 'Blue Light Blocking',
      price: 49,
      description: 'Reduces eye strain from digital screens and devices'
    },
    {
      id: 'progressive',
      name: 'Progressive Lenses',
      price: 149,
      description: 'Seamless transition for near, intermediate, and distance vision'
    },
    {
      id: 'photochromic',
      name: 'Photochromic (Transitions)',
      price: 99,
      description: 'Automatically darken in sunlight and clear indoors'
    }
  ];

  // Usage options for step 1 - matching the image
  const usageOptions = [
    {
      id: 'single-vision',
      name: 'Single Vision (Distance)',
      description: 'General use lenses for common prescriptions and seeing things from distance.'
    },
    {
      id: 'bifocal-progressive',
      name: 'Bifocal & Progressive',
      description: 'One pair of glasses corrects vision at near, middle, and far distances.'
    },
    {
      id: 'reading',
      name: 'Reading',
      description: 'Lenses that magnify to assist with reading.'
    },
    {
      id: 'non-prescription',
      name: 'Non-Prescription',
      description: 'Basic lenses with no vision correction.'
    }
  ];

  // Lens type options for step 2 - Progressive and Bifocal options
  const lensTypeOptions = [
    {
      id: 'progressive',
      name: 'Progressive',
      description: 'Standard everyday lenses with clear vision for near, intermediate, and distance needs.'
    },
    {
      id: 'bifocal',
      name: 'Bifocal',
      description: 'Classic lenses with a visible line, providing separate areas for reading and distance vision.'
    }
  ];

  // Prescription method options for step 3
  const prescriptionMethods = [
    {
      id: 'upload',
      name: 'Upload Prescription',
      description: 'Upload a photo of your prescription'
    },
    {
      id: 'manual',
      name: 'Enter Manually',
      description: 'Type in your prescription details'
    },
    {
      id: 'previous',
      name: 'Use Previous Prescription',
      description: 'Select from your saved prescriptions'
    },
    {
      id: 'exam',
      name: 'Schedule Eye Exam',
      description: 'Book an appointment with our partners'
    }
  ];

  // Lens color options for step 5
  const lensColorOptions = [
    {
      id: 'clear',
      name: 'Clear',
      description: 'Transparent lenses for enhanced clarity and everyday use.',
      icon: '⚪'
    },
    {
      id: 'blue-light',
      name: 'Blue Light Filtering',
      description: 'Lenses that designed to reduce exposure to blue-violet light from sun and artificial sources (screens, LEDs, digital devices, etc.).',
      icon: '🔵',
      badge: 'Popular'
    },
    {
      id: 'transitions',
      name: 'Transitions® & Photochromic',
      description: '2-in-1 lenses that automatically darken when exposed to direct sunlight.',
      icon: '🌓',
      badge: "Season's best!"
    },
    {
      id: 'sun',
      name: 'Sun',
      description: 'Color tinted lenses with UV protection and polarized options to reduce glare.',
      icon: '🕶️'
    }
  ];

  // Clear lens sub-options
  const clearLensOptions = [
    {
      id: 'kodak-advanced',
      name: 'KODAK Lens - Advanced',
      price: 85.95,
      badges: ['New', 'Up to 25% thinner', 'Great clarity'],
      description: 'KODAK Clean&CleAR 1.6 Advanced index Lenses with premium anti-reflective, water repellent, easy to clean, and durable, with great clarity for sharper vision.',
      brand: 'KODAK',
      logo: true
    },
    {
      id: 'most-popular',
      name: 'Most Popular Lenses',
      price: 19.95,
      badges: ['Up to 20% thinner'],
      description: 'Quality 1.59 index lenses with UV-protective, anti-scratch, anti-reflective coatings.',
      icon: '🛡️'
    },
    {
      id: 'standard',
      name: 'Standard Lenses',
      price: 6.95,
      description: 'Quality 1.5 index lenses with anti-scratch and anti-reflective coatings.',
      icon: '👁️'
    }
  ];

  // Blue light filtering sub-options
  const blueLightOptions = [
    {
      id: 'ebdblue-360',
      name: 'EBDBlue 360™',
      price: 68.95,
      priceFrom: true,
      badge: 'Top pick',
      description: 'Lenses that offer clarity around the clock by blocking 100% of UV rays during the day, filtering blue-violet light, and reducing glare at night.',
      brand: 'EBDBlue',
      logo: 'EBDBLUE360'
    },
    {
      id: 'sightrelax',
      name: 'SightRelax',
      price: 85.95,
      priceFrom: true,
      description: 'Lenses that offer a visual boost via a magnified portion to relax and relieve digital eye strain while filtering blue-violet light. Produced by Essilor.',
      brand: 'SightRelax',
      logo: 'SIGHTRELAX'
    },
    {
      id: 'ebdblue-smart',
      name: 'EBDBlue Smart 1.6',
      price: 78.95,
      description: 'Blue light filtering lenses that change color according to environment to offer responsive UV protection.',
      brand: 'EBDBlue',
      logo: 'EBDBLUESMART'
    },
    {
      id: 'ebdblue-plus',
      name: 'EBDBlue Plus™',
      price: 22.95,
      priceFrom: true,
      description: 'Affordable lenses with advanced blue-violet light filtering technology.',
      brand: 'EBDBlue',
      logo: 'EBDBLUEPLUS'
    }
  ];

  // Transitions & Photochromic sub-options
  const transitionsOptions = [
    {
      id: 'transitions-gen-s',
      name: 'Transitions® GEN S™',
      price: 99,
      badge: 'New',
      description: 'Perfect everyday lenses that are ultra responsive, fading back 2x faster than previous generations, with a spectacular color palette and HD vision at speed of your life.',
      brand: 'Transitions'
    },
    {
      id: 'transitions-xtractive',
      name: 'Transitions® XTRActive®',
      price: 139,
      badge: 'Top pick',
      description: 'The best extra darkness and protection for light-sensitive wearers. Lens activates outdoors, in the car, and in hot temperatures while indoor clarity is clear with a hint of protective tint.',
      brand: 'Transitions'
    },
    {
      id: 'transitions-drivewear',
      name: 'Transitions® Drivewear®',
      price: 149,
      description: 'Best adaptive sunglass lenses for driving that change color according to environment with UV and polarized protection for comfort and safety behind the wheel.',
      brand: 'Transitions'
    },
    {
      id: 'photochromic',
      name: 'Photochromic',
      price: 45.95,
      description: 'Standard lenses that are clear indoors and darken outdoors.',
      brand: 'Standard'
    }
  ];

  // Sun lens sub-options
  const sunOptions = [
    {
      id: 'basic',
      name: 'Basic',
      price: 6.95,
      description: 'Stylish sun tints in a range of colors with UV protection.',
      icon: '🕶️'
    },
    {
      id: 'polarized',
      name: 'Polarized',
      price: 59,
      description: 'Polarized lenses reduce extra bright light glares and hazy vision. An option that offers superior clarity and eye protection.',
      icon: '🌟'
    },
    {
      id: 'mirrored',
      name: 'Mirrored',
      price: 29,
      description: 'Reflective lenses that combine fashion and function to reduce the amount of light entering the eye.',
      icon: '🪞'
    },
    {
      id: 'gradient',
      name: 'Gradient',
      price: 12.95,
      description: 'Combine fashion with function with trendy gradient lenses that go from dark on the top to light on the bottom.',
      icon: '🌈'
    }
  ];


  // Get related products from Redux store (exclude current product)
  const relatedProducts = products
    ? products
        .filter(p => p.id !== product?.id) // Exclude current product
        .slice(0, 4) // Limit to 4 products
        .map(p => ({
          id: p.id,
          name: p.name,
          brand: p.brand,
          price: p.price,
          originalPrice: p.discount?.hasDiscount ? Math.round(p.price / (1 - p.discount.discountPercentage / 100)) : null,
          image: p.image,
          colors: Array.isArray(p.colors) ? p.colors.map(color => color.hex) : ['#000000'],
          discount: p.discount?.hasDiscount ? `${p.discount.discountPercentage}% OFF` : null
        }))
    : [];

  const renderTabContent = () => {
    switch(activeTab) {
      case 'description':
        return (
          <TabContent>
            <p style={{ lineHeight: '1.6', color: '#666', marginBottom: '1rem', textAlign: 'left' }}>
              {product?.description}
            </p>
            <h4 style={{ marginBottom: '0.5rem', color: '#333', textAlign: 'left' }}>Features:</h4>
            <ul style={{ paddingLeft: '1.5rem', color: '#666', textAlign: 'left' }}>
              {(Array.isArray(product?.features) ? product.features : []).map((feature, index) => (
                <li key={index} style={{ marginBottom: '0.25rem' }}>
                  {typeof feature === 'string' ? feature.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : feature}
                </li>
              ))}
              {(!product?.features || !Array.isArray(product.features) || product.features.length === 0) && (
                <li style={{ marginBottom: '0.25rem' }}>High-quality construction</li>
              )}
            </ul>
          </TabContent>
        );
      case 'specifications':
        return (
          <TabContent>
            <SpecsContainer>
              <SpecRow>
                <SpecLabel>Material:</SpecLabel>
                <SpecValue>{product?.material || 'Premium Quality'}</SpecValue>
              </SpecRow>
              <SpecRow>
                <SpecLabel>Shape:</SpecLabel>
                <SpecValue>{product?.shape || 'Classic'}</SpecValue>
              </SpecRow>
              {product?.frameColor && (
                <SpecRow>
                  <SpecLabel>Frame Color:</SpecLabel>
                  <SpecValue>{product.frameColor}</SpecValue>
                </SpecRow>
              )}
              <SpecRow>
                <SpecLabel>Rim Type:</SpecLabel>
                <SpecValue>{product?.rim || 'Full Rim'}</SpecValue>
              </SpecRow>
              <SpecRow>
                <SpecLabel>Category:</SpecLabel>
                <SpecValue>{product?.category || 'Eyewear'}</SpecValue>
              </SpecRow>
              <SpecRow>
                <SpecLabel>Brand:</SpecLabel>
                <SpecValue>{product?.brand || 'Premium Brand'}</SpecValue>
              </SpecRow>
              <SpecRow>
                <SpecLabel>Available Sizes:</SpecLabel>
                <SpecValue>{product?.sizes?.join(', ') || 'Standard'}</SpecValue>
              </SpecRow>
            </SpecsContainer>
          </TabContent>
        );
      case 'care':
        return (
          <TabContent>
            <h4 style={{ marginBottom: '1rem', color: '#333', textAlign: 'left' }}>Care Instructions:</h4>
            <ul style={{ paddingLeft: '1.5rem', color: '#666', lineHeight: '1.6', textAlign: 'left' }}>
              {(Array.isArray(product?.careInstructions) ? product.careInstructions : [
                'Clean with microfiber cloth',
                'Store in protective case',
                'Avoid extreme temperatures',
                'Use lens cleaner for stubborn spots'
              ]).map((instruction, index) => (
                <li key={index} style={{ marginBottom: '0.5rem' }}>{instruction}</li>
              ))}
            </ul>
          </TabContent>
        );
      default:
        return null;
    }
  };


  // Ensure products are loaded for related products
  useEffect(() => {
    if (products.length === 0) {
      dispatch(fetchProducts());
    }
  }, [dispatch, products.length]);

  if (status === 'loading') {
    return (
      <PageContainer>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '50px 0' }}>
          <div style={{ textAlign: 'center' }}>
            <h2>Loading product details...</h2>
            <p>Please wait while we fetch the product information.</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (!product && status === 'succeeded') {
    return (
      <PageContainer>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '50px 0' }}>
          <div style={{ textAlign: 'center', maxWidth: '600px' }}>
            <h2>Product Not Found</h2>
            <p>The product you're looking for doesn't exist or has been removed.</p>
            
            <div style={{ 
              backgroundColor: '#f8f9fa', 
              padding: '1rem', 
              borderRadius: '8px', 
              margin: '1rem 0',
              textAlign: 'left'
            }}>
              <h4 style={{ margin: '0 0 0.5rem 0' }}>Debug Information:</h4>
              <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}>
                <strong>Looking for slug:</strong> <code>{slug}</code>
              </p>
              <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}>
                <strong>Available products:</strong> {products?.length || 0}
              </p>
              {products?.length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                  <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>
                    <strong>Valid product slugs:</strong>
                  </p>
                  <ul style={{ margin: 0, paddingLeft: '1rem', fontSize: '0.8rem' }}>
                    {products.slice(0, 5).map(p => (
                      <li key={p.id}>
                        <Link 
                          to={`/products/${generateUniqueSlug(p.name, p.id)}`}
                          style={{ color: '#48b2ee', textDecoration: 'none' }}
                        >
                          {p.name} → {generateUniqueSlug(p.name, p.id)}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <div style={{ marginTop: '2rem' }}>
              <Link 
                to="/products" 
                style={{ 
                  color: '#48b2ee', 
                  textDecoration: 'none',
                  marginRight: '1rem'
                }}
              >
                ← Back to Products
              </Link>
              <Link 
                to="/product-detail-test" 
                style={{ 
                  color: '#48b2ee', 
                  textDecoration: 'none'
                }}
              >
                Test Product Links
              </Link>
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (status === 'failed' || error) {
    return (
      <PageContainer>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '50px 0' }}>
          <div style={{ textAlign: 'center' }}>
            <h3>Error loading product</h3>
            <p>{error || 'Failed to load product details'}</p>
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <BreadcrumbNav>
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to="/products">Products</Link>
        <span>/</span>
        <span>{product?.name || 'Product'}</span>
      </BreadcrumbNav>

      <ProductLayout>
        <ImageGallery>
          <MainImage>
            <img 
              src={product?.colors?.[selectedImage]?.image || product?.image || '/images/eyeglasses.webp'} 
              alt={product?.name || 'Product'} 
            />
          </MainImage>
        </ImageGallery>

        <ProductInfo>
          <div>
            <ProductBrand>{product?.brand || 'EyeBuyDirect'}</ProductBrand>
            <ProductTitle>{product?.name || 'Ember'}</ProductTitle>
            
            <PriceContainer>
              {hasDiscount ? (
                <>
                  <DiscountedPrice>{formatPrice(discountedPrice)}</DiscountedPrice>
                  <OriginalPrice>{formatPrice(originalPrice)}</OriginalPrice>
                  <DiscountPercentage>{product?.discount?.discountPercentage}% OFF</DiscountPercentage>
                </>
              ) : (
                <CurrentPrice>{formatPrice(originalPrice)}</CurrentPrice>
              )}
            </PriceContainer>
            
            <ProductDescription>
              {product?.description || 'Stylish and comfortable eyeglasses perfect for everyday wear.'}
            </ProductDescription>
            
            {product?.frameColor && (
              <div style={{ marginBottom: '1rem' }}>
                <ColorLabel>Frame Color: {product.frameColor}</ColorLabel>
              </div>
            )}
            
            {product?.colors && product.colors.length > 0 && (
              <div>
                <ColorLabel>Color: {selectedColor}</ColorLabel>
                <ColorOptions>
                  {(Array.isArray(product?.colors) ? product.colors : []).map((color, index) => (
                    <ColorSwatch
                      key={index}
                      color={color.hex}
                      selected={selectedColor === color.name}
                      onClick={() => setSelectedColor(color.name)}
                      title={color.name}
                    />
                  ))}
                </ColorOptions>
              </div>
            )}
            
            {/* Handle sizes - check if it's a JSON string or array */}
            {(() => {
              let sizesArray = [];
              
              if (product?.sizes) {
                if (typeof product.sizes === 'string') {
                  try {
                    sizesArray = JSON.parse(product.sizes);
                  } catch (e) {
                    // If not JSON, treat as comma-separated string
                    sizesArray = product.sizes.split(',').map(s => s.trim());
                  }
                } else if (Array.isArray(product.sizes)) {
                  sizesArray = product.sizes;
                }
              }
              
              return sizesArray && sizesArray.length > 0 ? (
                <div>
                  <SizeLabel>Size: {selectedSize}</SizeLabel>
                  <SizeOptions>
                    {sizesArray.map((size) => (
                      <SizeOption
                        key={size}
                        selected={selectedSize === size}
                        onClick={() => setSelectedSize(size)}
                      >
                        {size}
                      </SizeOption>
                    ))}
                  </SizeOptions>
                </div>
              ) : null;
            })()}
            
            <FreeShippingBadge>
              <span className="icon">🚚</span>
              FREE SHIPPING on orders above PKR 5,000
            </FreeShippingBadge>
            
            <LensSelectionButton onClick={openLensModal}>
              <div className="lens-info">
                <div className="lens-type">
                  {selectedUsage || selectedLensTypeOption || selectedPrescriptionMethod || selectedLensColor || selectedClearLensOption || selectedBlueLightOption || selectedTransitionsOption || selectedSunOption || selectedLensPackage ? (
                    <div>
                      <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Lens Options Selected</div>
                      <div style={{ fontSize: '0.85rem', opacity: '0.8' }}>
                        {selectedUsage && `Usage: ${selectedUsage.replace('-', ' ')} • `}
                        {selectedLensTypeOption && `Type: ${selectedLensTypeOption} • `}
                        {selectedBlueLightOption && `Blue Light • `}
                        {selectedTransitionsOption && `Transitions • `}
                        {selectedSunOption && `Sun Protection • `}
                        {selectedClearLensOption && `Clear Lens • `}
                        {selectedLensPackage && `Package • `}
                        Click to modify
                      </div>
                    </div>
                  ) : (
                    'Choose lens type'
                  )}
                </div>
              </div>
              <div className="arrow">→</div>
            </LensSelectionButton>
            
            <ActionButtonsContainer>
              <BuyNowButton
                onClick={() => {
                  // Add product to cart and navigate to cart page
                  if (!product) return;
                  
                  // Calculate lens pricing based on selections
                  let lensPrice = 0;
                  let customizations = {};
                  
                  // Add usage selection
                  if (selectedUsage) {
                    customizations.usage = selectedUsage;
                  }
                  
                  // Add lens type selection and pricing
                  if (selectedLensTypeOption) {
                    customizations.lensType = selectedLensTypeOption;
                    if (selectedLensTypeOption === 'blue-light') lensPrice += 49;
                    else if (selectedLensTypeOption === 'progressive') lensPrice += 149;
                    else if (selectedLensTypeOption === 'photochromic') lensPrice += 99;
                  }
                  
                  // Add prescription method
                  if (selectedPrescriptionMethod) {
                    customizations.prescriptionMethod = selectedPrescriptionMethod;
                  }
                  
                  // Add lens color selections and pricing
                  if (selectedLensColor) {
                    customizations.lensColor = selectedLensColor;
                  }
                  
                  // Add clear lens option pricing
                  if (selectedClearLensOption) {
                    customizations.clearLensOption = selectedClearLensOption;
                    if (selectedClearLensOption === 'kodak-advanced') lensPrice += 85.95;
                    else if (selectedClearLensOption === 'most-popular') lensPrice += 19.95;
                    else if (selectedClearLensOption === 'standard') lensPrice += 6.95;
                  }
                  
                  // Add blue light option pricing
                  if (selectedBlueLightOption) {
                    customizations.blueLightOption = selectedBlueLightOption;
                    if (selectedBlueLightOption === 'ebdblue-360') lensPrice += 68.95;
                    else if (selectedBlueLightOption === 'sightrelax') lensPrice += 85.95;
                    else if (selectedBlueLightOption === 'ebdblue-smart') lensPrice += 78.95;
                    else if (selectedBlueLightOption === 'ebdblue-plus') lensPrice += 22.95;
                  }
                  
                  // Add transitions option pricing
                  if (selectedTransitionsOption) {
                    customizations.transitionsOption = selectedTransitionsOption;
                    if (selectedTransitionsOption === 'transitions-gen-s') lensPrice += 99;
                    else if (selectedTransitionsOption === 'transitions-xtractive') lensPrice += 139;
                    else if (selectedTransitionsOption === 'transitions-drivewear') lensPrice += 149;
                    else if (selectedTransitionsOption === 'photochromic') lensPrice += 45.95;
                  }
                  
                  // Add sun option pricing
                  if (selectedSunOption) {
                    customizations.sunOption = selectedSunOption;
                    if (selectedSunOption === 'basic') lensPrice += 6.95;
                    else if (selectedSunOption === 'polarized') lensPrice += 59;
                    else if (selectedSunOption === 'mirrored') lensPrice += 29;
                    else if (selectedSunOption === 'gradient') lensPrice += 12.95;
                    
                    // Add tint colors
                    if (selectedTintColor) customizations.tintColor = selectedTintColor;
                    if (selectedMirroredColor) customizations.mirroredColor = selectedMirroredColor;
                    if (selectedGradientColor) customizations.gradientColor = selectedGradientColor;
                  }
                  
                  // Add lens package pricing
                  if (selectedLensPackage) {
                    customizations.lensPackage = selectedLensPackage;
                    if (selectedLensPackage === 'standard') lensPrice += 43;
                    else if (selectedLensPackage === 'popular') lensPrice += 73;
                  }
                  
                  const totalPrice = product.price + lensPrice;
                  
                  const cartItem = {
                    id: product.id,
                    name: product.name,
                    brand: product.brand || 'EyeBuyDirect',
                    originalPrice: product.price,
                    price: totalPrice,
                    image: product.colors?.[selectedImage]?.image || product.image || '/images/eyeglasses.webp',
                    color: selectedColor || product.colors?.[0]?.name || 'Black',
                    size: selectedSize || product.sizes?.[0] || 'Medium',
                    quantity: 1,
                    customizations: Object.keys(customizations).length > 0 ? customizations : null
                  };
                  
                  dispatch(addToCart(cartItem));
                  navigate('/cart');
                }}
              >
                Buy Now
              </BuyNowButton>
              
              <WishlistActionButton
                onClick={() => {
                  // Add to wishlist functionality
                  if (isInWishlist) {
                    dispatch(removeFromWishlist(product.id));
                  } else {
                    dispatch(addToWishlist(product));
                  }
                }}
              >
                {isInWishlist ? '♥' : '♡'}
              </WishlistActionButton>
            </ActionButtonsContainer>
          </div>
        </ProductInfo>
      </ProductLayout>

      {/* About This Product Section */}
      <AboutSection>
        <AboutTitle>About this product</AboutTitle>
        <TabsContainer>
          <TabsHeader>
            <Tab 
              active={activeTab === 'description'} 
              onClick={() => setActiveTab('description')}
            >
              Description
            </Tab>
            <Tab 
              active={activeTab === 'specifications'} 
              onClick={() => setActiveTab('specifications')}
            >
              Specifications
            </Tab>
            <Tab 
              active={activeTab === 'care'} 
              onClick={() => setActiveTab('care')}
            >
              Care Instructions
            </Tab>
          </TabsHeader>
          <AboutContent>
            {renderTabContent()}
          </AboutContent>
        </TabsContainer>
      </AboutSection>

      {/* Reviews Section */}
      <ReviewsSection>
        <ReviewsHeader>
          <div>
            <ReviewsTitle>Reviews</ReviewsTitle>
          </div>
          <RateButton onClick={handleOpenWriteReview}>
            Rate this Product
          </RateButton>
        </ReviewsHeader>
      </ReviewsSection>

      {/* Related Products Section */}
      <RelatedProductsSection>
        <RelatedProductsTitle>You might also like</RelatedProductsTitle>
        <RelatedProductsGrid>
          {relatedProducts.map((relatedProduct) => (
            <RelatedProductCard 
              key={relatedProduct.id}
              onClick={() => navigate(`/products/${generateUniqueSlug(relatedProduct.name, relatedProduct.id)}`)}
            >
              {relatedProduct.discount && (
                <DiscountBadge>{relatedProduct.discount}</DiscountBadge>
              )}
              <ProductImage>
                <img src={relatedProduct.image} alt={relatedProduct.name} />
              </ProductImage>
              <ProductContent>
                <RelatedProductBrand>{relatedProduct.brand}</RelatedProductBrand>
                <h3 style={{ 
                  fontSize: '1rem', 
                  fontWeight: '600', 
                  margin: '0.25rem 0', 
                  color: '#333' 
                }}>
                  {relatedProduct.name}
                </h3>
                <ProductPrice>
                  PKR {relatedProduct.price}
                  {relatedProduct.originalPrice && (
                    <span style={{ 
                      textDecoration: 'line-through', 
                      color: '#999', 
                      marginLeft: '0.5rem',
                      fontSize: '0.9rem'
                    }}>
                      PKR {relatedProduct.originalPrice}
                    </span>
                  )}
                </ProductPrice>
                <div style={{ display: 'flex', alignItems: 'center', marginTop: '0.5rem' }}>
                  {(Array.isArray(relatedProduct?.colors) ? relatedProduct.colors : []).map((color, index) => (
                    <ColorDot key={index} color={color} />
                  ))}
                </div>
              </ProductContent>
            </RelatedProductCard>
          ))}
        </RelatedProductsGrid>
      </RelatedProductsSection>

      {/* Step 1: Choose Your Usage */}
      {showUsageSelection && (
        <ModalOverlay onClick={closeAllModals}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalLeftSection>
              <ProductImageInModal 
                src={product?.image || '/images/eyeglasses.webp'} 
                alt={product?.name || 'Product'} 
              />
              <ProductNameInModal>{product?.name || 'Vinyl'}</ProductNameInModal>
              <ProductSubtitleInModal>
                {product?.shape || 'Square'} {product?.brand || 'Black'} Eyeglasses
              </ProductSubtitleInModal>
            </ModalLeftSection>
            
            <ModalRightSection>
              <ModalHeader>
                <div>
                  <span 
                    style={{ 
                      color: '#48b2ee', 
                      fontSize: '0.9rem', 
                      marginRight: '0.5rem',
                      cursor: 'pointer'
                    }}
                    onClick={() => {
                      setShowUsageSelection(false);
                    }}
                  >
                    ← Back to {product?.name || 'Vinyl'}
                  </span>
                </div>
                <CloseButton onClick={closeAllModals}>×</CloseButton>
              </ModalHeader>
              
              <ModalTitle style={{ marginBottom: '0.5rem' }}>Choose your usage</ModalTitle>
              
              
              <LensOptionsGrid>
                {usageOptions.map((option) => (
                  <LensOption
                    key={option.id}
                    selected={selectedUsage === option.id}
                    onClick={() => {
                      setSelectedUsage(option.id);
                      // Auto-advance logic based on selection
                      setTimeout(() => {
                        setShowUsageSelection(false);
                        if (option.id === 'bifocal-progressive') {
                          // For bifocal & progressive, show lens type selection
                          setShowLensTypeSelection(true);
                        } else {
                          // For other options, go directly to prescription method
                          setShowPrescriptionMethod(true);
                        }
                      }, 300);
                    }}
                    style={{ 
                      padding: '1.5rem',
                      border: selectedUsage === option.id ? '2px solid #48b2ee' : '1px solid #e0e0e0',
                      borderRadius: '8px',
                      marginBottom: '1rem',
                      cursor: 'pointer',
                      backgroundColor: selectedUsage === option.id ? '#f8f9fa' : 'white'
                    }}
                  >
                    <div style={{ textAlign: 'left' }}>
                      <h3 style={{ 
                        margin: '0 0 0.5rem 0',
                        fontSize: '1.1rem',
                        fontWeight: '600',
                        color: '#333'
                      }}>
                        {option.name}
                      </h3>
                      <p style={{ 
                        margin: 0,
                        fontSize: '0.95rem',
                        color: '#666',
                        lineHeight: '1.4'
                      }}>
                        {option.description}
                      </p>
                    </div>
                  </LensOption>
                ))}
              </LensOptionsGrid>
              
              {/* Continue buttons removed - auto-advance on selection */}
            </ModalRightSection>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* Step 2: Choose Lens Type */}
      {showLensTypeSelection && (
        <ModalOverlay onClick={closeAllModals}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalLeftSection>
              <ProductImageInModal 
                src={product?.image || '/images/eyeglasses.webp'} 
                alt={product?.name || 'Product'} 
              />
              <ProductNameInModal>{product?.name || 'Vinyl'}</ProductNameInModal>
              <ProductSubtitleInModal>
                {product?.shape || 'Square'} {product?.brand || 'Black'} Eyeglasses
              </ProductSubtitleInModal>
            </ModalLeftSection>
            
            <ModalRightSection>
              <ModalHeader>
                <div>
                  <button
                    style={{ 
                      background: 'none',
                      border: 'none',
                      color: '#48b2ee', 
                      fontSize: '0.9rem', 
                      marginRight: '0.5rem',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      padding: '0.5rem',
                      borderRadius: '4px'
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Back button clicked');
                      setShowLensTypeSelection(false);
                      setShowUsageSelection(true);
                    }}
                  >
                    ← Back to Usage Selection
                  </button>
                </div>
                <CloseButton onClick={closeAllModals}>×</CloseButton>
              </ModalHeader>
              
              <ModalTitle style={{ marginBottom: '0.5rem' }}>Choose Lens Type</ModalTitle>
              
              
              <LensOptionsGrid>
                {lensTypeOptions.map((option) => (
                  <LensOption
                    key={option.id}
                    selected={selectedLensTypeOption === option.id}
                    onClick={() => {
                      setSelectedLensTypeOption(option.id);
                      // Auto-advance to prescription method for all options
                      setTimeout(() => {
                        setShowLensTypeSelection(false);
                        setShowPrescriptionMethod(true);
                      }, 300);
                    }}
                  >
                    <LensOptionHeader>
                      <div>
                        <LensOptionName>
                          {option.name}
                          {option.badge && (
                            <LensOptionBadge type={option.badge === 'Top pick' ? 'top-pick' : 'new'}>
                              {option.badge}
                            </LensOptionBadge>
                          )}
                          {option.brand && (
                            <LensOptionBadge type="brand" style={{ backgroundColor: '#ff6b35', color: 'white' }}>
                              {option.brand}
                            </LensOptionBadge>
                          )}
                        </LensOptionName>
                      </div>
                      {/* Price removed */}
                    </LensOptionHeader>
                    <LensOptionDescription>
                      {option.description}
                    </LensOptionDescription>
                  </LensOption>
                ))}
              </LensOptionsGrid>
              
              {/* Continue buttons removed - auto-advance on selection */}
            </ModalRightSection>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* Step 3: Prescription Method */}
      {showPrescriptionMethod && (
        <ModalOverlay onClick={closeAllModals}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalLeftSection>
              <ProductImageInModal 
                src={product?.image || '/images/eyeglasses.webp'} 
                alt={product?.name || 'Product'} 
              />
              <ProductNameInModal>{product?.name || 'Vinyl'}</ProductNameInModal>
              <ProductSubtitleInModal>
                {product?.shape || 'Square'} {product?.brand || 'Black'} Eyeglasses
              </ProductSubtitleInModal>
            </ModalLeftSection>
            
            <ModalRightSection>
              <ModalHeader>
                <div>
                  <span 
                    style={{ 
                      color: '#48b2ee', 
                      fontSize: '0.9rem', 
                      marginRight: '0.5rem',
                      cursor: 'pointer'
                    }}
                    onClick={() => {
                      setShowPrescriptionMethod(false);
                      if (selectedUsage === 'bifocal-progressive') {
                        setShowLensTypeSelection(true);
                      } else {
                        setShowUsageSelection(true);
                      }
                    }}
                  >
                    ← Usage
                  </span>
                </div>
                <CloseButton onClick={closeAllModals}>×</CloseButton>
              </ModalHeader>
              
              <ModalTitle style={{ marginBottom: '1.5rem' }}>How would you like to add your prescription?</ModalTitle>
              
              <LensOptionsGrid>
                <LensOption
                  selected={selectedPrescriptionMethod === 'previous'}
                  onClick={() => {
                    setSelectedPrescriptionMethod('previous');
                    // Auto-advance after selection
                    setTimeout(() => {
                      if (!isAuthenticated) {
                        setShowSignInModal(true);
                      } else {
                        setShowPrescriptionSelector(true);
                        setShowPrescriptionMethod(false);
                      }
                    }, 300);
                  }}
                  style={{ marginBottom: '1rem' }}
                >
                  <LensOptionHeader>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ fontSize: '1.2rem', marginRight: '0.75rem' }}>🕒</span>
                      <LensOptionName>Choose from previous</LensOptionName>
                    </div>
                  </LensOptionHeader>
                </LensOption>

                <LensOption
                  selected={selectedPrescriptionMethod === 'manual'}
                  onClick={() => {
                    setSelectedPrescriptionMethod('manual');
                    // Auto-advance after selection
                    setTimeout(() => {
                      setShowPrescriptionMethod(false);
                      setShowPrescriptionForm(true);
                    }, 300);
                  }}
                  style={{ marginBottom: '1rem' }}
                >
                  <LensOptionHeader>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ fontSize: '1.2rem', marginRight: '0.75rem' }}>📝</span>
                      <LensOptionName>Add new</LensOptionName>
                    </div>
                  </LensOptionHeader>
                </LensOption>

                <LensOption
                  key="scan"
                  selected={selectedPrescriptionMethod === 'scan'}
                  onClick={() => {
                    setSelectedPrescriptionMethod('scan');
                    // Auto-advance after selection
                    setTimeout(() => {
                      setShowPrescriptionScan(true);
                      setShowPrescriptionMethod(false);
                    }, 300);
                  }}
                  style={{ marginBottom: '1rem', position: 'relative' }}
                >
                  <LensOptionBadge style={{ 
                    position: 'absolute', 
                    top: '0.5rem', 
                    right: '0.5rem',
                    backgroundColor: '#28a745',
                    color: 'white',
                    fontSize: '0.7rem',
                    padding: '0.2rem 0.4rem'
                  }}>
                    New
                  </LensOptionBadge>
                  <LensOptionHeader>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ fontSize: '1.2rem', marginRight: '0.75rem' }}>📷</span>
                      <LensOptionName>Scan your prescription</LensOptionName>
                    </div>
                  </LensOptionHeader>
                </LensOption>
              </LensOptionsGrid>
              
              {/* Continue buttons removed - auto-advance on selection */}
            </ModalRightSection>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* Step 4: Prescription Form */}
      {showPrescriptionForm && (
        <ModalOverlay onClick={closeAllModals}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalLeftSection>
              <ProductImageInModal 
                src={product?.image || '/images/eyeglasses.webp'} 
                alt={product?.name || 'Product'} 
              />
              <ProductNameInModal>{product?.name || 'Vinyl'}</ProductNameInModal>
              <ProductSubtitleInModal>
                {product?.shape || 'Square'} {product?.brand || 'Black'} Eyeglasses
              </ProductSubtitleInModal>
            </ModalLeftSection>
            
            <ModalRightSection>
              <ModalHeader>
                <div>
                  <span 
                    style={{ 
                      color: '#48b2ee', 
                      fontSize: '0.9rem', 
                      marginRight: '0.5rem',
                      cursor: 'pointer'
                    }}
                    onClick={() => {
                      setShowPrescriptionForm(false);
                      setShowPrescriptionMethod(true);
                    }}
                  >
                    ← Input Method
                  </span>
                </div>
                <CloseButton onClick={closeAllModals}>×</CloseButton>
              </ModalHeader>
              
              <ModalTitle style={{ marginBottom: '0.5rem' }}>Enter your prescription</ModalTitle>
             
              <div style={{ marginBottom: '1.5rem' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', padding: '0.5rem 0', fontSize: '0.9rem', color: '#666' }}></th>
                      <th style={{ textAlign: 'center', padding: '0.5rem', fontSize: '0.9rem', color: '#666' }}>SPH</th>
                      <th style={{ textAlign: 'center', padding: '0.5rem', fontSize: '0.9rem', color: '#666' }}>CYL</th>
                      <th style={{ textAlign: 'center', padding: '0.5rem', fontSize: '0.9rem', color: '#666' }}>AXIS</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: '0.5rem 0', fontSize: '0.9rem', color: '#333' }}>
                        <strong>OD</strong><br/>
                        <span style={{ fontSize: '0.8rem', color: '#666' }}>right eye</span>
                      </td>
                      <td style={{ padding: '0.25rem' }}>
                        <select 
                          value={prescriptionData.rightEye.sph}
                          onChange={(e) => setPrescriptionData(prev => ({
                            ...prev,
                            rightEye: { ...prev.rightEye, sph: e.target.value }
                          }))}
                          style={{ 
                            width: '100%', 
                            padding: '0.5rem', 
                            border: '1px solid #ddd', 
                            borderRadius: '4px',
                            fontSize: '0.9rem'
                          }}>
                          <option value="0.00">0.00</option>
                          {Array.from({length: 112}, (_, i) => {
                            const value = (-16 + i * 0.25).toFixed(2);
                            return <option key={value} value={value}>{value > 0 ? `+${value}` : value}</option>;
                          })}
                        </select>
                      </td>
                      <td style={{ padding: '0.25rem' }}>
                        <select 
                          value={prescriptionData.rightEye.cyl}
                          onChange={(e) => setPrescriptionData(prev => ({
                            ...prev,
                            rightEye: { ...prev.rightEye, cyl: e.target.value }
                          }))}
                          style={{ 
                            width: '100%', 
                            padding: '0.5rem', 
                            border: '1px solid #ddd', 
                            borderRadius: '4px',
                            fontSize: '0.9rem'
                          }}>
                          <option value="0.00">0.00</option>
                          {Array.from({length: 48}, (_, i) => {
                            const value = (-6 + i * 0.25).toFixed(2);
                            return <option key={value} value={value}>{value > 0 ? `+${value}` : value}</option>;
                          })}
                        </select>
                      </td>
                      <td style={{ padding: '0.25rem' }}>
                        <input 
                          type="text" 
                          placeholder="---"
                          value={prescriptionData.rightEye.axis}
                          onChange={(e) => setPrescriptionData(prev => ({
                            ...prev,
                            rightEye: { ...prev.rightEye, axis: e.target.value }
                          }))}
                          style={{ 
                            width: '100%', 
                            padding: '0.5rem', 
                            border: '1px solid #ddd', 
                            borderRadius: '4px',
                            fontSize: '0.9rem',
                            textAlign: 'center'
                          }}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '0.5rem 0', fontSize: '0.9rem', color: '#333' }}>
                        <strong>OS</strong><br/>
                        <span style={{ fontSize: '0.8rem', color: '#666' }}>left eye</span>
                      </td>
                      <td style={{ padding: '0.25rem' }}>
                        <select 
                          value={prescriptionData.leftEye.sph}
                          onChange={(e) => setPrescriptionData(prev => ({
                            ...prev,
                            leftEye: { ...prev.leftEye, sph: e.target.value }
                          }))}
                          style={{ 
                            width: '100%', 
                            padding: '0.5rem', 
                            border: '1px solid #ddd', 
                            borderRadius: '4px',
                            fontSize: '0.9rem'
                          }}>
                          <option value="0.00">0.00</option>
                          {Array.from({length: 112}, (_, i) => {
                            const value = (-16 + i * 0.25).toFixed(2);
                            return <option key={value} value={value}>{value > 0 ? `+${value}` : value}</option>;
                          })}
                        </select>
                      </td>
                      <td style={{ padding: '0.25rem' }}>
                        <select 
                          value={prescriptionData.leftEye.cyl}
                          onChange={(e) => setPrescriptionData(prev => ({
                            ...prev,
                            leftEye: { ...prev.leftEye, cyl: e.target.value }
                          }))}
                          style={{ 
                            width: '100%', 
                            padding: '0.5rem', 
                            border: '1px solid #ddd', 
                            borderRadius: '4px',
                            fontSize: '0.9rem'
                          }}>
                          <option value="0.00">0.00</option>
                          {Array.from({length: 48}, (_, i) => {
                            const value = (-6 + i * 0.25).toFixed(2);
                            return <option key={value} value={value}>{value > 0 ? `+${value}` : value}</option>;
                          })}
                        </select>
                      </td>
                      <td style={{ padding: '0.25rem' }}>
                        <input 
                          type="text" 
                          placeholder="---"
                          value={prescriptionData.leftEye.axis}
                          onChange={(e) => setPrescriptionData(prev => ({
                            ...prev,
                            leftEye: { ...prev.leftEye, axis: e.target.value }
                          }))}
                          style={{ 
                            width: '100%', 
                            padding: '0.5rem', 
                            border: '1px solid #ddd', 
                            borderRadius: '4px',
                            fontSize: '0.9rem',
                            textAlign: 'center'
                          }}
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.9rem', color: '#333', marginRight: '0.5rem' }}>
                    <strong>PD</strong> ⓘ
                  </span>
                  {!showTwoPDNumbers ? (
                    <select 
                      value={prescriptionData.pd}
                      onChange={(e) => setPrescriptionData(prev => ({
                        ...prev,
                        pd: e.target.value
                      }))}
                      style={{ 
                        padding: '0.5rem', 
                        border: '1px solid #ddd', 
                        borderRadius: '4px',
                        fontSize: '0.9rem',
                        marginRight: '1rem'
                      }}>
                      <option value="58">58</option>
                      <option value="59">59</option>
                      <option value="60">60</option>
                      <option value="61">61</option>
                      <option value="62">62</option>
                      <option value="63">63</option>
                      <option value="64">64</option>
                      <option value="65">65</option>
                      <option value="66">66</option>
                      <option value="67">67</option>
                      <option value="68">68</option>
                    </select>
                  ) : (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <select style={{ 
                          padding: '0.5rem', 
                          border: '1px solid #ddd', 
                          borderRadius: '4px',
                          fontSize: '0.9rem',
                          width: '80px'
                        }}>
                          <option>31.5</option>
                        </select>
                        <span style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>OD</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <select style={{ 
                          padding: '0.5rem', 
                          border: '1px solid #ddd', 
                          borderRadius: '4px',
                          fontSize: '0.9rem',
                          width: '80px'
                        }}>
                          <option>31.5</option>
                        </select>
                        <span style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>OS</span>
                      </div>
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <input 
                    type="checkbox" 
                    id="pdNumbers" 
                    checked={showTwoPDNumbers}
                    onChange={(e) => setShowTwoPDNumbers(e.target.checked)}
                    style={{ marginRight: '0.5rem' }} 
                  />
                  <label htmlFor="pdNumbers" style={{ fontSize: '0.9rem', color: '#666' }}>
                    2 PD numbers
                  </label>
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <button style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: '#48b2ee', 
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}>
                  More options ˅
                </button>
              </div>

              <ModalActions>
                <ModalButton 
                  primary 
                  onClick={() => {
                    setShowPrescriptionForm(false);
                    setShowLensColorSelection(true);
                  }}
                  style={{ 
                    backgroundColor: '#48b2ee', 
                    width: '100%',
                    padding: '0.75rem 1.5rem'
                  }}
                >
                  Save & Continue
                </ModalButton>
              </ModalActions>
            </ModalRightSection>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* Step 5: Lens Color Selection */}
      {showLensColorSelection && (
        <ModalOverlay onClick={closeAllModals}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalLeftSection>
              <ProductImageInModal 
                src={product?.image || '/images/eyeglasses.webp'} 
                alt={product?.name || 'Product'} 
              />
              <ProductNameInModal>{product?.name || 'Vinyl'}</ProductNameInModal>
              <ProductSubtitleInModal>
                {product?.shape || 'Square'} {product?.brand || 'Black'} Eyeglasses
              </ProductSubtitleInModal>
            </ModalLeftSection>
            
            <ModalRightSection>
              <ModalHeader>
                <div>
                  <span 
                    style={{ 
                      color: '#48b2ee', 
                      fontSize: '0.9rem', 
                      marginRight: '0.5rem',
                      cursor: 'pointer'
                    }}
                    onClick={() => {
                      setShowLensColorSelection(false);
                      setShowPrescriptionForm(true);
                    }}
                  >
                    ← Prescription
                  </span>
                </div>
                <CloseButton onClick={closeAllModals}>×</CloseButton>
              </ModalHeader>
              
              <ModalTitle style={{ marginBottom: '1.5rem' }}>Choose Lens Color</ModalTitle>
              
              <LensOptionsGrid>
                {lensColorOptions.map((option) => (
                  <LensOption
                    key={option.id}
                    selected={selectedLensColor === option.id}
                    onClick={() => {
                      setSelectedLensColor(option.id);
                      if (option.id === 'clear') {
                        setShowClearLensOptions(true);
                        setShowLensColorSelection(false);
                      } else if (option.id === 'blue-light') {
                        setShowBlueLightOptions(true);
                        setShowLensColorSelection(false);
                      } else if (option.id === 'transitions') {
                        setShowTransitionsOptions(true);
                        setShowLensColorSelection(false);
                      } else if (option.id === 'sun') {
                        setShowSunOptions(true);
                        setShowLensColorSelection(false);
                      }
                    }}
                    style={{ marginBottom: '1rem', position: 'relative' }}
                  >
                    {option.badge && (
                      <LensOptionBadge 
                        type={option.badge === 'Popular' ? 'top-pick' : 'new'} 
                        style={{ 
                          position: 'absolute', 
                          top: '0.5rem', 
                          right: '0.5rem',
                          backgroundColor: option.badge === 'Popular' ? '#007bff' : '#ff6b35',
                          color: 'white',
                          fontSize: '0.7rem',
                          padding: '0.2rem 0.4rem'
                        }}
                      >
                        {option.badge}
                      </LensOptionBadge>
                    )}
                    <LensOptionHeader>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ fontSize: '1.5rem', marginRight: '0.75rem' }}>{option.icon}</span>
                        <LensOptionName>{option.name}</LensOptionName>
                      </div>
                    </LensOptionHeader>
                    <LensOptionDescription>
                      {option.description}
                    </LensOptionDescription>
                  </LensOption>
                ))}
              </LensOptionsGrid>
              
              <ModalActions>
                <ModalButton 
                  primary 
                  onClick={() => {
                    setShowLensColorSelection(false);
                    setShowReviewSelections(true);
                  }}
                  disabled={!selectedLensColor}
                  style={{ backgroundColor: '#48b2ee' }}
                >
                  Continue to Review
                </ModalButton>
              </ModalActions>
            </ModalRightSection>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* Prescription Scan Modal */}
      {showPrescriptionScan && (
        <ModalOverlay onClick={closeAllModals}>
          <ModalContent onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', position: 'relative' }}>
            <CloseButton 
              onClick={closeAllModals}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                zIndex: 10,
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#666',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ×
            </CloseButton>
            
            <div style={{ padding: '2rem', textAlign: 'left' }}>
              <div style={{ marginBottom: '1rem' }}>
                <span style={{ 
                  backgroundColor: '#28a745',
                  color: 'white',
                  padding: '0.3rem 0.6rem',
                  borderRadius: '4px',
                  fontSize: '0.8rem',
                  fontWeight: 'bold'
                }}>
                  New
                </span>
              </div>
              
              <ModalTitle style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>
                Scan your prescription
              </ModalTitle>
              
              <p style={{ 
                color: '#666', 
                marginBottom: '2rem',
                fontSize: '1.1rem'
              }}>
                Take a photo of your prescription or choose a file.
              </p>
              
              {/* File Upload Area */}
              <div 
                style={{
                  border: '2px dashed #d4a574',
                  borderRadius: '8px',
                  padding: '4rem 2rem',
                  marginBottom: '1.5rem',
                  backgroundColor: '#fefefe',
                  cursor: 'pointer',
                  position: 'relative',
                  minHeight: '200px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onClick={() => document.getElementById('file-upload').click()}
              >
                <input
                  id="file-upload"
                  type="file"
                  accept="image/jpeg,image/png,application/pdf"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
                
                {isProcessingImage ? (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
                    <p style={{ color: '#666', margin: 0 }}>Processing your prescription...</p>
                  </div>
                ) : uploadedFile ? (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                    <p style={{ color: '#28a745', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>
                      {uploadedFile.name}
                    </p>
                    <p style={{ color: '#666', fontSize: '0.9rem', margin: 0 }}>
                      File uploaded successfully
                    </p>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                      width: '60px',
                      height: '60px',
                      backgroundColor: '#e8f4fd',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 1.5rem auto',
                      position: 'relative'
                    }}>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        backgroundColor: '#48b2ee',
                        borderRadius: '4px',
                        position: 'relative'
                      }}>
                        <div style={{
                          position: 'absolute',
                          top: '-8px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: 0,
                          height: 0,
                          borderLeft: '6px solid transparent',
                          borderRight: '6px solid transparent',
                          borderBottom: '8px solid #ff4757'
                        }}></div>
                      </div>
                    </div>
                    <p style={{ 
                      color: '#d4a574',
                      fontSize: '1rem',
                      fontWeight: '500',
                      margin: 0
                    }}>
                      jpeg, png, pdf. max 10 MB
                    </p>
                  </div>
                )}
              </div>
              
              {/* Camera Option */}
              <div style={{ marginBottom: '2rem' }}>
                <button
                  onClick={handleCameraCapture}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#d4a574',
                    fontSize: '1.1rem',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Or use camera
                </button>
                <input
                  id="camera-input"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
              </div>
            </div>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* Clear Lens Options Modal */}
      {showClearLensOptions && (
        <ModalOverlay onClick={closeAllModals}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalLeftSection>
              <ProductImageInModal 
                src={product?.image || '/images/eyeglasses.webp'} 
                alt={product?.name || 'Product'} 
              />
              <ProductNameInModal>{product?.name || 'Vinyl'}</ProductNameInModal>
              <ProductSubtitleInModal>
                {product?.shape || 'Square'} {product?.brand || 'Black'} Eyeglasses
              </ProductSubtitleInModal>
            </ModalLeftSection>
            
            <ModalRightSection>
              <ModalHeader>
                <div>
                  <span 
                    style={{ 
                      color: '#48b2ee', 
                      fontSize: '0.9rem', 
                      marginRight: '0.5rem',
                      cursor: 'pointer'
                    }}
                    onClick={() => {
                      setShowClearLensOptions(false);
                      setShowLensColorSelection(true);
                    }}
                  >
                    ← Lens Color
                  </span>
                </div>
                <CloseButton onClick={closeAllModals}>×</CloseButton>
              </ModalHeader>
              
              <ModalTitle style={{ marginBottom: '1.5rem' }}>Clear Lens Options</ModalTitle>
              
              <LensOptionsGrid>
                {clearLensOptions.map((option) => (
                  <LensOption
                    key={option.id}
                    selected={selectedClearLensOption === option.id}
                    onClick={() => setSelectedClearLensOption(option.id)}
                    style={{ marginBottom: '1rem', position: 'relative', padding: '1.5rem' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        {option.logo && (
                          <div style={{ 
                            backgroundColor: '#ff6b35', 
                            color: 'white', 
                            padding: '0.25rem 0.5rem', 
                            borderRadius: '4px', 
                            fontSize: '0.8rem', 
                            fontWeight: 'bold',
                            marginRight: '0.75rem'
                          }}>
                            KODAK
                          </div>
                        )}
                        {option.icon && (
                          <span style={{ fontSize: '1.5rem', marginRight: '0.75rem' }}>{option.icon}</span>
                        )}
                        <div>
                          <LensOptionName style={{ fontSize: '1.1rem', fontWeight: '600' }}>
                            {option.name}
                          </LensOptionName>
                          {option.badges && (
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                              {option.badges.map((badge, index) => (
                                <LensOptionBadge 
                                  key={index}
                                  type={badge === 'New' ? 'new' : 'feature'}
                                  style={{ 
                                    backgroundColor: badge === 'New' ? '#28a745' : '#17a2b8',
                                    color: 'white',
                                    fontSize: '0.7rem',
                                    padding: '0.2rem 0.4rem'
                                  }}
                                >
                                  {badge}
                                </LensOptionBadge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <LensOptionPrice style={{ fontSize: '1.2rem', fontWeight: '700', color: '#333' }}>
                          PKR {option.price}
                        </LensOptionPrice>
                      </div>
                    </div>
                    <LensOptionDescription style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>
                      {option.description}
                    </LensOptionDescription>
                  </LensOption>
                ))}
              </LensOptionsGrid>
              
              <ModalActions>
                <ModalButton onClick={() => {
                  setShowClearLensOptions(false);
                  setShowLensColorSelection(true);
                }}>
                  Back
                </ModalButton>
                <ModalButton 
                  primary 
                  onClick={() => {
                    setShowClearLensOptions(false);
                    setShowReviewSelections(true);
                  }}
                  disabled={!selectedClearLensOption}
                  style={{ backgroundColor: '#48b2ee' }}
                >
                  Continue to Review
                </ModalButton>
              </ModalActions>
            </ModalRightSection>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* Blue Light Filtering Options Modal */}
      {showBlueLightOptions && (
        <ModalOverlay onClick={closeAllModals}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalLeftSection>
              <ProductImageInModal 
                src={product?.image || '/images/eyeglasses.webp'} 
                alt={product?.name || 'Product'} 
              />
              <ProductNameInModal>{product?.name || 'Vinyl'}</ProductNameInModal>
              <ProductSubtitleInModal>
                {product?.shape || 'Square'} {product?.brand || 'Black'} Eyeglasses
              </ProductSubtitleInModal>
            </ModalLeftSection>
            
            <ModalRightSection>
              <ModalHeader>
                <div>
                  <span 
                    style={{ 
                      color: '#48b2ee', 
                      fontSize: '0.9rem', 
                      marginRight: '0.5rem',
                      cursor: 'pointer'
                    }}
                    onClick={() => {
                      setShowBlueLightOptions(false);
                      setShowLensColorSelection(true);
                    }}
                  >
                    ← Lens Color
                  </span>
                </div>
                <CloseButton onClick={closeAllModals}>×</CloseButton>
              </ModalHeader>
              
              <ModalTitle style={{ marginBottom: '1.5rem' }}>Blue Light Filtering Options</ModalTitle>
              
              <LensOptionsGrid>
                {blueLightOptions.map((option) => (
                  <LensOption
                    key={option.id}
                    selected={selectedBlueLightOption === option.id}
                    onClick={() => setSelectedBlueLightOption(option.id)}
                    style={{ marginBottom: '1rem', position: 'relative', padding: '1.5rem' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                        <div style={{ 
                          backgroundColor: '#007bff', 
                          color: 'white', 
                          padding: '0.5rem', 
                          borderRadius: '8px', 
                          fontSize: '0.7rem', 
                          fontWeight: 'bold',
                          marginRight: '1rem',
                          minWidth: '60px',
                          textAlign: 'center'
                        }}>
                          {option.logo}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <LensOptionName style={{ fontSize: '1.1rem', fontWeight: '600', marginRight: '0.5rem' }}>
                              {option.name}
                            </LensOptionName>
                            {option.badge && (
                              <LensOptionBadge 
                                type="top-pick"
                                style={{ 
                                  backgroundColor: '#007bff',
                                  color: 'white',
                                  fontSize: '0.7rem',
                                  padding: '0.2rem 0.4rem'
                                }}
                              >
                                {option.badge}
                              </LensOptionBadge>
                            )}
                          </div>
                          <LensOptionPrice style={{ fontSize: '1rem', fontWeight: '600', color: '#333', marginBottom: '0.5rem' }}>
                            {option.priceFrom ? 'From ' : ''}PKR {option.price}
                          </LensOptionPrice>
                        </div>
                      </div>
                    </div>
                    <LensOptionDescription style={{ fontSize: '0.9rem', lineHeight: '1.5', color: '#666' }}>
                      {option.description}
                    </LensOptionDescription>
                  </LensOption>
                ))}
              </LensOptionsGrid>
              
              <ModalActions>
                <ModalButton onClick={() => {
                  setShowBlueLightOptions(false);
                  setShowLensColorSelection(true);
                }}>
                  Back
                </ModalButton>
                <ModalButton 
                  primary 
                  onClick={() => {
                    setShowBlueLightOptions(false);
                    setShowReviewSelections(true);
                  }}
                  disabled={!selectedBlueLightOption}
                  style={{ backgroundColor: '#48b2ee' }}
                >
                  Continue to Review
                </ModalButton>
              </ModalActions>
            </ModalRightSection>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* Transitions & Photochromic Options Modal */}
      {showTransitionsOptions && (
        <ModalOverlay onClick={closeAllModals}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalLeftSection>
              <ProductImageInModal 
                src={product?.image || '/images/eyeglasses.webp'} 
                alt={product?.name || 'Product'} 
              />
              <ProductNameInModal>{product?.name || 'Vinyl'}</ProductNameInModal>
              <ProductSubtitleInModal>
                {product?.shape || 'Square'} {product?.brand || 'Black'} Eyeglasses
              </ProductSubtitleInModal>
            </ModalLeftSection>
            
            <ModalRightSection>
              <ModalHeader>
                <div>
                  <span 
                    style={{ 
                      color: '#48b2ee', 
                      fontSize: '0.9rem', 
                      marginRight: '0.5rem',
                      cursor: 'pointer'
                    }}
                    onClick={() => {
                      setShowTransitionsOptions(false);
                      setShowLensColorSelection(true);
                    }}
                  >
                    ← Lens Color
                  </span>
                </div>
                <CloseButton onClick={closeAllModals}>×</CloseButton>
              </ModalHeader>
              
              <ModalTitle style={{ marginBottom: '1.5rem' }}>Transitions & Photochromic Options</ModalTitle>
              
              <LensOptionsGrid>
                {transitionsOptions.map((option) => (
                  <LensOption
                    key={option.id}
                    selected={selectedTransitionsOption === option.id}
                    onClick={() => setSelectedTransitionsOption(option.id)}
                    style={{ marginBottom: '1rem', position: 'relative', padding: '1.5rem' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <LensOptionName style={{ fontSize: '1.1rem', fontWeight: '600', marginRight: '0.5rem' }}>
                            {option.name}
                          </LensOptionName>
                          {option.badge && (
                            <LensOptionBadge 
                              type={option.badge === 'Top pick' ? 'top-pick' : 'new'}
                              style={{ 
                                backgroundColor: option.badge === 'Top pick' ? '#007bff' : '#28a745',
                                color: 'white',
                                fontSize: '0.7rem',
                                padding: '0.2rem 0.4rem'
                              }}
                            >
                              {option.badge}
                            </LensOptionBadge>
                          )}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <LensOptionPrice style={{ fontSize: '1.2rem', fontWeight: '700', color: '#333' }}>
                          PKR {option.price}
                        </LensOptionPrice>
                      </div>
                    </div>
                    <LensOptionDescription style={{ fontSize: '0.9rem', lineHeight: '1.5', color: '#666' }}>
                      {option.description}
                    </LensOptionDescription>
                  </LensOption>
                ))}
              </LensOptionsGrid>
              
              <ModalActions>
                <ModalButton onClick={() => {
                  setShowTransitionsOptions(false);
                  setShowLensColorSelection(true);
                }}>
                  Back
                </ModalButton>
                <ModalButton 
                  primary 
                  onClick={() => {
                    setShowTransitionsOptions(false);
                    setShowReviewSelections(true);
                  }}
                  disabled={!selectedTransitionsOption}
                  style={{ backgroundColor: '#48b2ee' }}
                >
                  Continue to Review
                </ModalButton>
              </ModalActions>
            </ModalRightSection>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* Sun Options Modal */}
      {showSunOptions && (
        <ModalOverlay onClick={closeAllModals}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalLeftSection>
              <ProductImageInModal 
                src={product?.image || '/images/eyeglasses.webp'} 
                alt={product?.name || 'Product'} 
              />
              <ProductNameInModal>{product?.name || 'Vinyl'}</ProductNameInModal>
              <ProductSubtitleInModal>
                {product?.shape || 'Square'} {product?.brand || 'Black'} Eyeglasses
              </ProductSubtitleInModal>
            </ModalLeftSection>
            
            <ModalRightSection>
              <ModalHeader>
                <div>
                  <span 
                    style={{ 
                      color: '#48b2ee', 
                      fontSize: '0.9rem', 
                      marginRight: '0.5rem',
                      cursor: 'pointer'
                    }}
                    onClick={() => {
                      setShowSunOptions(false);
                      setShowLensColorSelection(true);
                    }}
                  >
                    ← Lens Color
                  </span>
                </div>
                <CloseButton onClick={closeAllModals}>×</CloseButton>
              </ModalHeader>
              
              <ModalTitle style={{ marginBottom: '1.5rem' }}>Sun Protection Options</ModalTitle>
              
              <LensOptionsGrid>
                {sunOptions.map((option) => (
                  <LensOption
                    key={option.id}
                    selected={selectedSunOption === option.id}
                    onClick={() => setSelectedSunOption(option.id)}
                    style={{ marginBottom: '1rem', position: 'relative', padding: '1.5rem' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        {option.icon && (
                          <span style={{ fontSize: '1.5rem', marginRight: '0.75rem' }}>{option.icon}</span>
                        )}
                        <div>
                          <LensOptionName style={{ fontSize: '1.1rem', fontWeight: '600' }}>
                            {option.name}
                          </LensOptionName>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <LensOptionPrice style={{ fontSize: '1.2rem', fontWeight: '700', color: '#333' }}>
                          PKR {option.price}
                        </LensOptionPrice>
                      </div>
                    </div>
                    <LensOptionDescription style={{ fontSize: '0.9rem', lineHeight: '1.5', color: '#666' }}>
                      {option.description}
                    </LensOptionDescription>
                    
                    {/* Tint options for Basic selection */}
                    {option.id === 'basic' && selectedSunOption === 'basic' && (
                      <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #eee' }}>
                        {/* Tint Strength */}
                        <div style={{ marginBottom: '1.5rem' }}>
                          <h4 style={{ 
                            margin: '0 0 0.75rem 0', 
                            fontSize: '1rem', 
                            fontWeight: '600',
                            color: '#333'
                          }}>
                            Tint Strength: <span style={{ color: '#666', fontWeight: '400' }}>{
                              selectedTintStrength === 'dark-80' ? 'Dark (80%)' :
                              selectedTintStrength === 'medium-50' ? 'Medium (50%)' :
                              selectedTintStrength === 'light-20' ? 'Light (20%)' :
                              'Select strength'
                            }</span>
                          </h4>
                          <div style={{ display: 'flex', gap: '1rem' }}>
                            {[
                              { id: 'dark-80', label: 'Dark (80%)', checked: true },
                              { id: 'medium-50', label: 'Medium (50%)', checked: false },
                              { id: 'light-20', label: 'Light (20%)', checked: false }
                            ].map((strength) => (
                              <label 
                                key={strength.id}
                                style={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  cursor: 'pointer',
                                  fontSize: '0.95rem'
                                }}
                              >
                                <input
                                  type="radio"
                                  name="tintStrength"
                                  value={strength.id}
                                  checked={selectedTintStrength === strength.id}
                                  onChange={(e) => setSelectedTintStrength(e.target.value)}
                                  style={{ 
                                    marginRight: '0.5rem',
                                    accentColor: '#48b2ee'
                                  }}
                                />
                                {strength.label}
                              </label>
                            ))}
                          </div>
                        </div>
                        
                        {/* Color Selection */}
                        <div>
                          <h4 style={{ 
                            margin: '0 0 0.75rem 0', 
                            fontSize: '1rem', 
                            fontWeight: '600',
                            color: '#333'
                          }}>
                            Color: <span style={{ color: '#666', fontWeight: '400' }}>
                              {[
                                { id: 'gray', name: 'Gray' },
                                { id: 'brown', name: 'Brown' },
                                { id: 'green', name: 'Green' },
                                { id: 'purple', name: 'Purple' },
                                { id: 'blue', name: 'Blue' },
                                { id: 'amber', name: 'Amber' },
                                { id: 'bronze', name: 'Bronze' },
                                { id: 'rose', name: 'Rose' },
                                { id: 'teal', name: 'Teal' },
                                { id: 'burgundy', name: 'Burgundy' }
                              ].find(color => color.id === selectedTintColor)?.name || 'Select color'}
                            </span>
                          </h4>
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {[
                              { id: 'gray', color: '#4a4a4a', name: 'Gray' },
                              { id: 'brown', color: '#8b4513', name: 'Brown' },
                              { id: 'green', color: '#2d5016', name: 'Green' },
                              { id: 'purple', color: '#663399', name: 'Purple' },
                              { id: 'blue', color: '#1e3a8a', name: 'Blue' },
                              { id: 'amber', color: '#92400e', name: 'Amber' },
                              { id: 'bronze', color: '#a16207', name: 'Bronze' },
                              { id: 'rose', color: '#9f1239', name: 'Rose' },
                              { id: 'teal', color: '#0f766e', name: 'Teal' },
                              { id: 'burgundy', color: '#7c2d12', name: 'Burgundy' }
                            ].map((color) => (
                              <button
                                key={color.id}
                                onClick={() => setSelectedTintColor(color.id)}
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '50%',
                                  backgroundColor: color.color,
                                  border: selectedTintColor === color.id ? '3px solid #48b2ee' : '2px solid #ddd',
                                  cursor: 'pointer',
                                  padding: 0,
                                  outline: 'none',
                                  boxShadow: selectedTintColor === color.id ? '0 0 0 2px rgba(72, 178, 238, 0.2)' : 'none'
                                }}
                                title={color.name}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Tint options for Polarized selection */}
                    {option.id === 'polarized' && selectedSunOption === 'polarized' && (
                      <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #eee' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          {/* Basic tint option */}
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            padding: '1rem',
                            border: '1px solid #e0e0e0',
                            borderRadius: '8px',
                            backgroundColor: '#fafafa'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <span style={{ 
                                fontSize: '1rem', 
                                fontWeight: '500',
                                color: '#333'
                              }}>
                                Basic tint
                              </span>
                              <div style={{
                                width: '16px',
                                height: '16px',
                                borderRadius: '50%',
                                backgroundColor: '#666',
                                border: '2px solid #ccc',
                                marginLeft: '0.5rem',
                                cursor: 'help'
                              }} title="Basic polarized tint"></div>
                            </div>
                            <span style={{ 
                              fontSize: '1.1rem', 
                              fontWeight: '600',
                              color: '#333'
                            }}>
                              PKR 59
                            </span>
                          </div>
                          
                          {/* Mirrored tint option */}
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            padding: '1rem',
                            border: '1px solid #e0e0e0',
                            borderRadius: '8px',
                            backgroundColor: '#fafafa'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <span style={{ 
                                fontSize: '1rem', 
                                fontWeight: '500',
                                color: '#333'
                              }}>
                                Mirrored tint
                              </span>
                              <div style={{
                                width: '16px',
                                height: '16px',
                                borderRadius: '50%',
                                background: 'linear-gradient(45deg, #c0c0c0, #808080)',
                                border: '2px solid #ccc',
                                marginLeft: '0.5rem',
                                cursor: 'help'
                              }} title="Mirrored polarized tint"></div>
                            </div>
                            <span style={{ 
                              fontSize: '1.1rem', 
                              fontWeight: '600',
                              color: '#333'
                            }}>
                              PKR 88
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Color options for Mirrored selection */}
                    {option.id === 'mirrored' && selectedSunOption === 'mirrored' && (
                      <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #eee' }}>
                        <div>
                          <h4 style={{ 
                            margin: '0 0 0.75rem 0', 
                            fontSize: '1rem', 
                            fontWeight: '600',
                            color: '#333'
                          }}>
                            Color: <span style={{ color: '#666', fontWeight: '400' }}>{
                              [
                                { id: 'silver', name: 'Silver' },
                                { id: 'gold', name: 'Gold' },
                                { id: 'blue', name: 'Blue' },
                                { id: 'purple', name: 'Purple' },
                                { id: 'green', name: 'Green' }
                              ].find(color => color.id === selectedMirroredColor)?.name || 'Select color'
                            }</span>
                          </h4>
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {[
                              { id: 'silver', color: 'linear-gradient(45deg, #c0c0c0, #808080)', name: 'Silver' },
                              { id: 'gold', color: 'linear-gradient(45deg, #ffd700, #b8860b)', name: 'Gold' },
                              { id: 'blue', color: 'linear-gradient(45deg, #4169e1, #1e3a8a)', name: 'Blue' },
                              { id: 'purple', color: 'linear-gradient(45deg, #9370db, #663399)', name: 'Purple' },
                              { id: 'green', color: 'linear-gradient(45deg, #32cd32, #228b22)', name: 'Green' }
                            ].map((color) => (
                              <button
                                key={color.id}
                                onClick={() => setSelectedMirroredColor(color.id)}
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '50%',
                                  background: color.color,
                                  border: selectedMirroredColor === color.id ? '3px solid #48b2ee' : '2px solid #ddd',
                                  cursor: 'pointer',
                                  padding: 0,
                                  outline: 'none',
                                  boxShadow: selectedMirroredColor === color.id ? '0 0 0 2px rgba(72, 178, 238, 0.2)' : 'none'
                                }}
                                title={color.name}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Gradient options for Gradient selection */}
                    {option.id === 'gradient' && selectedSunOption === 'gradient' && (
                      <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #eee' }}>
                        {/* Tint Strength */}
                        <div style={{ marginBottom: '1.5rem' }}>
                          <h4 style={{ 
                            margin: '0 0 0.75rem 0', 
                            fontSize: '1rem', 
                            fontWeight: '600',
                            color: '#333'
                          }}>
                            Tint Strength: <span style={{ color: '#666', fontWeight: '400', fontStyle: 'italic' }}>80% to 10% gradient</span>
                          </h4>
                        </div>
                        
                        {/* Color Selection */}
                        <div>
                          <h4 style={{ 
                            margin: '0 0 0.75rem 0', 
                            fontSize: '1rem', 
                            fontWeight: '600',
                            color: '#333'
                          }}>
                            Color: <span style={{ color: '#666', fontWeight: '400' }}>
                              {[
                                { id: 'gray', name: 'Gray' },
                                { id: 'brown', name: 'Brown' },
                                { id: 'green', name: 'Green' },
                                { id: 'purple', name: 'Purple' },
                                { id: 'blue', name: 'Blue' }
                              ].find(color => color.id === selectedGradientColor)?.name || 'Select color'}
                            </span>
                          </h4>
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {[
                              { id: 'gray', gradient: 'linear-gradient(to bottom, #4a4a4a, rgba(74, 74, 74, 0.1))', name: 'Gray' },
                              { id: 'brown', gradient: 'linear-gradient(to bottom, #8b4513, rgba(139, 69, 19, 0.1))', name: 'Brown' },
                              { id: 'green', gradient: 'linear-gradient(to bottom, #2d5016, rgba(45, 80, 22, 0.1))', name: 'Green' },
                              { id: 'purple', gradient: 'linear-gradient(to bottom, #663399, rgba(102, 51, 153, 0.1))', name: 'Purple' },
                              { id: 'blue', gradient: 'linear-gradient(to bottom, #1e3a8a, rgba(30, 58, 138, 0.1))', name: 'Blue' }
                            ].map((color) => (
                              <button
                                key={color.id}
                                onClick={() => setSelectedGradientColor(color.id)}
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '50%',
                                  background: color.gradient,
                                  border: selectedGradientColor === color.id ? '3px solid #48b2ee' : '2px solid #ddd',
                                  cursor: 'pointer',
                                  padding: 0,
                                  outline: 'none',
                                  boxShadow: selectedGradientColor === color.id ? '0 0 0 2px rgba(72, 178, 238, 0.2)' : 'none'
                                }}
                                title={color.name}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </LensOption>
                ))}
              </LensOptionsGrid>
              
              <ModalActions>
                <ModalButton onClick={() => {
                  setShowSunOptions(false);
                  setShowLensColorSelection(true);
                }}>
                  Back
                </ModalButton>
                <ModalButton 
                  primary 
                  onClick={() => {
                    setShowSunOptions(false);
                    setShowReviewSelections(true);
                  }}
                  disabled={!selectedSunOption}
                  style={{ backgroundColor: '#48b2ee' }}
                >
                  Continue to Review
                </ModalButton>
              </ModalActions>
            </ModalRightSection>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* Lens Package Selection Modal */}
      {showLensPackage && (
        <ModalOverlay onClick={closeAllModals}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalLeftSection>
              <ProductImageInModal 
                src={product?.image || '/images/eyeglasses.webp'} 
                alt={product?.name || 'Product'} 
              />
              <ProductNameInModal>{product?.name || 'Vinyl'}</ProductNameInModal>
              <ProductSubtitleInModal>
                {product?.shape || 'Square'} {product?.brand || 'Black'} Eyeglasses
              </ProductSubtitleInModal>
            </ModalLeftSection>
            
            <ModalRightSection>
              <ModalHeader>
                <div>
                  <span 
                    style={{ 
                      color: '#48b2ee', 
                      fontSize: '0.9rem', 
                      marginRight: '0.5rem',
                      cursor: 'pointer'
                    }}
                    onClick={() => {
                      setShowLensPackage(false);
                      setShowSunOptions(true);
                    }}
                  >
                    ← Sun Protection
                  </span>
                </div>
                <CloseButton onClick={closeAllModals}>×</CloseButton>
              </ModalHeader>
              
              <ModalTitle style={{ marginBottom: '0.5rem' }}>Choose a lens package</ModalTitle>
              
              <div style={{ 
                backgroundColor: '#fff8e1', 
                border: '1px solid #ffd54f',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '1.2rem', marginRight: '0.5rem' }}>⭐</span>
                <span style={{ fontSize: '0.9rem', color: '#333' }}>
                  All our lenses include <strong>scratch-resistant</strong> and <strong>anti-reflective</strong> coatings.
                </span>
              </div>
              
              <LensOptionsGrid>
                {/* Standard Lenses */}
                <LensOption
                  selected={selectedLensPackage === 'standard'}
                  onClick={() => setSelectedLensPackage('standard')}
                  style={{ 
                    padding: '1.5rem',
                    border: selectedLensPackage === 'standard' ? '2px solid #48b2ee' : '1px solid #e0e0e0',
                    borderRadius: '8px',
                    marginBottom: '1rem',
                    cursor: 'pointer',
                    backgroundColor: selectedLensPackage === 'standard' ? '#f8f9fa' : 'white'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={{ marginRight: '1rem' }}>
                        <div style={{ 
                          width: '40px', 
                          height: '40px', 
                          backgroundColor: '#f0f0f0',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <span style={{ fontSize: '1.2rem' }}>👓</span>
                        </div>
                      </div>
                      <div>
                        <h3 style={{ 
                          margin: '0 0 0.25rem 0',
                          fontSize: '1.1rem',
                          fontWeight: '600',
                          color: '#333'
                        }}>
                          Standard Lenses
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '0.8rem', color: '#666' }}>Up to 25% thinner</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ 
                        fontSize: '1.2rem', 
                        fontWeight: '700',
                        color: '#333'
                      }}>
                        PKR 42.95
                      </span>
                    </div>
                  </div>
                  <p style={{ 
                    margin: 0,
                    fontSize: '0.9rem',
                    color: '#666',
                    lineHeight: '1.4'
                  }}>
                    Quality 1.6 index lenses with UV-protective, anti-scratch, anti-reflective coatings.
                  </p>
                </LensOption>

                {/* Most Popular Lenses */}
                <LensOption
                  selected={selectedLensPackage === 'popular'}
                  onClick={() => setSelectedLensPackage('popular')}
                  style={{ 
                    padding: '1.5rem',
                    border: selectedLensPackage === 'popular' ? '2px solid #48b2ee' : '1px solid #e0e0e0',
                    borderRadius: '8px',
                    marginBottom: '1rem',
                    cursor: 'pointer',
                    backgroundColor: selectedLensPackage === 'popular' ? '#f8f9fa' : 'white'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={{ marginRight: '1rem' }}>
                        <div style={{ 
                          width: '40px', 
                          height: '40px', 
                          backgroundColor: '#f0f0f0',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <span style={{ fontSize: '1.2rem' }}>👓</span>
                        </div>
                      </div>
                      <div>
                        <h3 style={{ 
                          margin: '0 0 0.25rem 0',
                          fontSize: '1.1rem',
                          fontWeight: '600',
                          color: '#333'
                        }}>
                          Most Popular Lenses
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '0.8rem', color: '#666' }}>Up to 30% thinner</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ 
                        fontSize: '1.2rem', 
                        fontWeight: '700',
                        color: '#333'
                      }}>
                        PKR 72.95
                      </span>
                    </div>
                  </div>
                  <p style={{ 
                    margin: 0,
                    fontSize: '0.9rem',
                    color: '#666',
                    lineHeight: '1.4'
                  }}>
                    Quality 1.67 index lenses with UV-protective, anti-scratch, anti-reflective coatings.
                  </p>
                </LensOption>
              </LensOptionsGrid>
              
              <div style={{ 
                textAlign: 'center', 
                marginTop: '1.5rem',
                paddingTop: '1rem',
                borderTop: '1px solid #eee'
              }}>
                <button
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#48b2ee',
                    fontSize: '0.9rem',
                    textDecoration: 'underline',
                    cursor: 'pointer'
                  }}
                >
                  Or customize your lenses
                </button>
              </div>
              
              <ModalActions>
                <ModalButton 
                  primary 
                  onClick={() => {
                    setShowLensPackage(false);
                    setShowReviewSelections(true);
                  }}
                  disabled={!selectedLensPackage}
                  style={{ backgroundColor: '#48b2ee' }}
                >
                  Continue
                </ModalButton>
              </ModalActions>
            </ModalRightSection>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* Review Selections Modal */}
      {showReviewSelections && (
        <ModalOverlay onClick={(e) => e.stopPropagation()}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalLeftSection>
              <ProductImageInModal 
                src={product?.image || '/images/eyeglasses.webp'} 
                alt={product?.name || 'Product'} 
              />
              <ProductNameInModal>{product?.name || 'Vinyl'}</ProductNameInModal>
              <ProductSubtitleInModal>
                {product?.shape || 'Square'} {product?.brand || 'Black'} Eyeglasses
              </ProductSubtitleInModal>
            </ModalLeftSection>
            
            <ModalRightSection>
              <ModalHeader>
                <div>
                  <span 
                    style={{ 
                      color: '#48b2ee', 
                      fontSize: '0.9rem', 
                      marginRight: '0.5rem',
                      cursor: 'pointer'
                    }}
                    onClick={() => {
                      setShowReviewSelections(false);
                      
                      // Smart back navigation - go to the specific step of the last selection
                      if (selectedLensPackage) {
                        // Go back to the specific lens package selection
                        setShowLensPackage(true);
                      } else if (selectedClearLensOption) {
                        // Go back to the specific clear lens options where KODAK was selected
                        setShowClearLensOptions(true);
                        setShowLensColorSelection(false);
                      } else if (selectedBlueLightOption) {
                        // Go back to the specific blue light options
                        setShowBlueLightOptions(true);
                        setShowLensColorSelection(false);
                      } else if (selectedTransitionsOption) {
                        // Go back to the specific transitions options
                        setShowTransitionsOptions(true);
                        setShowLensColorSelection(false);
                      } else if (selectedSunOption) {
                        // Go back to the specific sun options
                        setShowSunOptions(true);
                        setShowLensColorSelection(false);
                      } else if (selectedLensColor) {
                        // Go back to lens color selection
                        setShowLensColorSelection(true);
                      } else if (selectedPrescriptionMethod) {
                        // Go back to prescription method selection
                        setShowPrescriptionMethod(true);
                      } else if (selectedLensTypeOption) {
                        // Go back to lens type selection
                        setShowLensTypeSelection(true);
                      } else if (selectedUsage) {
                        // Go back to usage selection
                        setShowUsageSelection(true);
                      } else {
                        // Default fallback - go to usage selection
                        setShowUsageSelection(true);
                      }
                    }}
                  >
                    ← {(() => {
                      if (selectedLensPackage) return 'Back to Lens Package';
                      if (selectedClearLensOption) return 'Back to Clear Lens Options';
                      if (selectedBlueLightOption) return 'Back to Blue Light Options';
                      if (selectedTransitionsOption) return 'Back to Transitions Options';
                      if (selectedSunOption) return 'Back to Sun Protection Options';
                      if (selectedLensColor) return 'Back to Lens Color';
                      if (selectedPrescriptionMethod) return 'Back to Prescription Method';
                      if (selectedLensTypeOption) return 'Back to Lens Type';
                      if (selectedUsage) return 'Back to Usage Selection';
                      return 'Back to Edit';
                    })()}
                  </span>
                </div>
                <CloseButton onClick={closeAllModals}>×</CloseButton>
              </ModalHeader>
              
              <ModalTitle style={{ marginBottom: '1.5rem', textAlign: 'center', fontSize: '1.5rem', fontWeight: '600' }}>Review your selections</ModalTitle>
              
              <div style={{ 
                fontSize: '0.9rem',
                color: '#888',
                marginBottom: '2rem',
                textAlign: 'center',
                lineHeight: '1.5'
              }}>
                All orders include <strong style={{ color: '#666' }}>14-Day Free Returns, 24/7 Customer Service</strong>, and can be reimbursed with <strong style={{ color: '#666' }}>FSA & HSA</strong>.
              </div>

              {/* Prescription Details Table */}
              {selectedPrescription && (
                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{ 
                    fontSize: '1.1rem', 
                    fontWeight: '600', 
                    color: '#888', 
                    marginBottom: '1rem',
                    textAlign: 'center'
                  }}>
                    Prescription Details
                  </h3>
                  <table style={{ 
                    width: '100%', 
                    borderCollapse: 'collapse',
                    border: '1px solid #e0e0e0',
                    marginBottom: '1rem'
                  }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8f9fa' }}>
                        <th style={{ padding: '0.75rem', border: '1px solid #e0e0e0', fontSize: '0.9rem', fontWeight: '600' }}></th>
                        <th style={{ padding: '0.75rem', border: '1px solid #e0e0e0', fontSize: '0.9rem', fontWeight: '600' }}>SPH</th>
                        <th style={{ padding: '0.75rem', border: '1px solid #e0e0e0', fontSize: '0.9rem', fontWeight: '600' }}>CYL</th>
                        <th style={{ padding: '0.75rem', border: '1px solid #e0e0e0', fontSize: '0.9rem', fontWeight: '600' }}>Axis</th>
                        <th style={{ padding: '0.75rem', border: '1px solid #e0e0e0', fontSize: '0.9rem', fontWeight: '600' }}>ADD</th>
                        <th style={{ padding: '0.75rem', border: '1px solid #e0e0e0', fontSize: '0.9rem', fontWeight: '600' }}>PD</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ padding: '0.75rem', border: '1px solid #e0e0e0', fontWeight: '600' }}>OD</td>
                        <td style={{ padding: '0.75rem', border: '1px solid #e0e0e0', textAlign: 'center' }}>
                          {selectedPrescription.rightEye?.sph || '0.00'}
                        </td>
                        <td style={{ padding: '0.75rem', border: '1px solid #e0e0e0', textAlign: 'center' }}>
                          {selectedPrescription.rightEye?.cyl || '0.00'}
                        </td>
                        <td style={{ padding: '0.75rem', border: '1px solid #e0e0e0', textAlign: 'center' }}>
                          {selectedPrescription.rightEye?.axis || '-'}
                        </td>
                        <td style={{ padding: '0.75rem', border: '1px solid #e0e0e0', textAlign: 'center' }}>-</td>
                        <td rowSpan="2" style={{ 
                          padding: '0.75rem', 
                          border: '1px solid #e0e0e0', 
                          textAlign: 'center', 
                          verticalAlign: 'middle',
                          fontSize: '1.1rem',
                          fontWeight: '600'
                        }}>
                          {selectedPrescription.pd || '63'}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: '0.75rem', border: '1px solid #e0e0e0', fontWeight: '600' }}>OS</td>
                        <td style={{ padding: '0.75rem', border: '1px solid #e0e0e0', textAlign: 'center' }}>
                          {selectedPrescription.leftEye?.sph || '-1.00'}
                        </td>
                        <td style={{ padding: '0.75rem', border: '1px solid #e0e0e0', textAlign: 'center' }}>
                          {selectedPrescription.leftEye?.cyl || '0.00'}
                        </td>
                        <td style={{ padding: '0.75rem', border: '1px solid #e0e0e0', textAlign: 'center' }}>
                          {selectedPrescription.leftEye?.axis || '-'}
                        </td>
                        <td style={{ padding: '0.75rem', border: '1px solid #e0e0e0', textAlign: 'center' }}>-</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
              
              {/* Product Details */}
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '1rem',
                  fontSize: '1.1rem',
                  fontWeight: '600'
                }}>
                  <span style={{ color: '#333' }}>
                    {product?.name || 'Vinyl'} | {product?.brand || 'Black'} | {product?.size || 'Medium'}
                  </span>
                  <span style={{ color: '#333' }}>
                    {formatPrice(product?.price || 59)}
                  </span>
                </div>
                
                {/* Dynamic Usage Selection */}
                {selectedUsage && (
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '0.5rem'
                  }}>
                    <span style={{ fontSize: '0.95rem', color: '#333' }}>
                      • Usage: {
                        selectedUsage === 'single-vision' ? 'Single Vision (Distance)' :
                        selectedUsage === 'bifocal-progressive' ? 'Bifocal & Progressive' :
                        selectedUsage === 'reading' ? 'Reading' :
                        selectedUsage === 'non-prescription' ? 'Non-Prescription' :
                        selectedUsage
                      }
                    </span>
                    <span style={{ fontSize: '0.95rem', color: '#888' }}>
                      Free
                    </span>
                  </div>
                )}
                
                {/* Dynamic Lens Type Selection */}
                {selectedLensTypeOption && (
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '0.5rem'
                  }}>
                    <span style={{ fontSize: '0.95rem', color: '#333' }}>
                      • Lens Type: {
                        selectedLensTypeOption === 'progressive' ? 'Progressive' :
                        selectedLensTypeOption === 'bifocal' ? 'Bifocal' :
                        selectedLensTypeOption
                      }
                    </span>
                    <span style={{ fontSize: '0.95rem', color: '#888' }}>
                      Free
                    </span>
                  </div>
                )}
                
                {/* Dynamic Lens Color */}
                {selectedLensColor && (
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '0.5rem'
                  }}>
                    <span style={{ fontSize: '0.95rem', color: '#333' }}>
                      • Lens Color: {
                        selectedLensColor === 'clear' ? 'Clear' :
                        selectedLensColor === 'blue-light' ? 'Blue Light Filtering' :
                        selectedLensColor === 'transitions' ? 'Transitions® & Photochromic' :
                        selectedLensColor === 'sun' ? 'Sun' :
                        selectedLensColor
                      }
                    </span>
                    <span style={{ fontSize: '0.95rem', color: '#888' }}>
                      Free
                    </span>
                  </div>
                )}
                
                {/* Dynamic Clear Lens Option */}
                {selectedClearLensOption && (
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '0.5rem'
                  }}>
                    <span style={{ fontSize: '0.95rem', color: '#333' }}>
                      • Clear Lens: {
                        selectedClearLensOption === 'kodak-advanced' ? 'KODAK Lens - Advanced' :
                        selectedClearLensOption === 'most-popular' ? 'Most Popular Lenses' :
                        selectedClearLensOption === 'standard' ? 'Standard Lenses' :
                        selectedClearLensOption
                      }
                    </span>
                    <span style={{ fontSize: '0.95rem', color: '#888' }}>
                      {selectedClearLensOption === 'kodak-advanced' ? formatPrice(85.95) :
                       selectedClearLensOption === 'most-popular' ? formatPrice(19.95) :
                       selectedClearLensOption === 'standard' ? formatPrice(6.95) : 'Free'}
                    </span>
                  </div>
                )}
                
                {/* Dynamic Blue Light Option */}
                {selectedBlueLightOption && (
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '0.5rem'
                  }}>
                    <span style={{ fontSize: '0.95rem', color: '#333' }}>
                      • Blue Light: {
                        selectedBlueLightOption === 'ebdblue-360' ? 'EBDBlue 360™' :
                        selectedBlueLightOption === 'sightrelax' ? 'SightRelax' :
                        selectedBlueLightOption === 'ebdblue-smart' ? 'EBDBlue Smart 1.6' :
                        selectedBlueLightOption === 'ebdblue-plus' ? 'EBDBlue Plus™' :
                        selectedBlueLightOption
                      }
                    </span>
                    <span style={{ fontSize: '0.95rem', color: '#888' }}>
                      {selectedBlueLightOption === 'ebdblue-360' ? formatPrice(68.95) :
                       selectedBlueLightOption === 'sightrelax' ? formatPrice(85.95) :
                       selectedBlueLightOption === 'ebdblue-smart' ? formatPrice(78.95) :
                       selectedBlueLightOption === 'ebdblue-plus' ? formatPrice(22.95) : 'Free'}
                    </span>
                  </div>
                )}
                
                {/* Dynamic Transitions Option */}
                {selectedTransitionsOption && (
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '0.5rem'
                  }}>
                    <span style={{ fontSize: '0.95rem', color: '#333' }}>
                      • Transitions: {
                        selectedTransitionsOption === 'transitions-gen-s' ? 'Transitions® GEN S™' :
                        selectedTransitionsOption === 'transitions-xtractive' ? 'Transitions® XTRActive®' :
                        selectedTransitionsOption === 'transitions-drivewear' ? 'Transitions® Drivewear®' :
                        selectedTransitionsOption === 'photochromic' ? 'Photochromic' :
                        selectedTransitionsOption
                      }
                    </span>
                    <span style={{ fontSize: '0.95rem', color: '#888' }}>
                      {selectedTransitionsOption === 'transitions-gen-s' ? formatPrice(99) :
                       selectedTransitionsOption === 'transitions-xtractive' ? formatPrice(139) :
                       selectedTransitionsOption === 'transitions-drivewear' ? formatPrice(149) :
                       selectedTransitionsOption === 'photochromic' ? formatPrice(45.95) : 'Free'}
                    </span>
                  </div>
                )}
                
                {/* Dynamic Sun Option */}
                {selectedSunOption && (
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '0.5rem'
                  }}>
                    <span style={{ fontSize: '0.95rem', color: '#333' }}>
                      • Sun Protection: {
                        selectedSunOption === 'basic' ? 'Basic Tint' :
                        selectedSunOption === 'polarized' ? 'Polarized' :
                        selectedSunOption === 'mirrored' ? 'Mirrored' :
                        selectedSunOption === 'gradient' ? 'Gradient' :
                        selectedSunOption
                      }
                      {selectedTintColor && ` (${selectedTintColor})`}
                      {selectedMirroredColor && ` (${selectedMirroredColor})`}
                      {selectedGradientColor && ` (${selectedGradientColor})`}
                    </span>
                    <span style={{ fontSize: '0.95rem', color: '#888' }}>
                      {selectedSunOption === 'basic' ? formatPrice(6.95) :
                       selectedSunOption === 'polarized' ? formatPrice(59) :
                       selectedSunOption === 'mirrored' ? formatPrice(29) :
                       selectedSunOption === 'gradient' ? formatPrice(12.95) : 'Free'}
                    </span>
                  </div>
                )}
                
                {/* Dynamic Lens Package */}
                {selectedLensPackage && (
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '1.5rem'
                  }}>
                    <span style={{ fontSize: '0.95rem', color: '#333' }}>
                      • Lens Package: {
                        selectedLensPackage === 'standard' ? 'Standard Lenses' :
                        selectedLensPackage === 'popular' ? 'Most Popular Lenses' :
                        selectedLensPackage
                      }
                    </span>
                    <span style={{ fontSize: '0.95rem', color: '#888' }}>
                      {selectedLensPackage === 'standard' ? formatPrice(43) :
                       selectedLensPackage === 'popular' ? formatPrice(73) : 'Free'}
                    </span>
                  </div>
                )}
                
                {/* Subtotal Section */}
                <div style={{ 
                  borderTop: '1px solid #e0e0e0',
                  paddingTop: '1rem',
                  marginTop: '1rem'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '1rem'
                  }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: '600', color: '#333' }}>
                      Subtotal
                    </span>
                    <span style={{ fontSize: '1.3rem', fontWeight: '700', color: '#333' }}>
                      {(() => {
                        let lensPrice = 0;
                        if (selectedClearLensOption === 'kodak-advanced') lensPrice += 85.95;
                        else if (selectedClearLensOption === 'most-popular') lensPrice += 19.95;
                        else if (selectedClearLensOption === 'standard') lensPrice += 6.95;
                        if (selectedBlueLightOption === 'ebdblue-360') lensPrice += 68.95;
                        else if (selectedBlueLightOption === 'sightrelax') lensPrice += 85.95;
                        else if (selectedBlueLightOption === 'ebdblue-smart') lensPrice += 78.95;
                        else if (selectedBlueLightOption === 'ebdblue-plus') lensPrice += 22.95;
                        if (selectedTransitionsOption === 'transitions-gen-s') lensPrice += 99;
                        else if (selectedTransitionsOption === 'transitions-xtractive') lensPrice += 139;
                        else if (selectedTransitionsOption === 'transitions-drivewear') lensPrice += 149;
                        else if (selectedTransitionsOption === 'photochromic') lensPrice += 45.95;
                        if (selectedSunOption === 'basic') lensPrice += 6.95;
                        else if (selectedSunOption === 'polarized') lensPrice += 59;
                        else if (selectedSunOption === 'mirrored') lensPrice += 29;
                        else if (selectedSunOption === 'gradient') lensPrice += 12.95;
                        if (selectedLensPackage === 'standard') lensPrice += 43;
                        else if (selectedLensPackage === 'popular') lensPrice += 73;
                        return formatPrice((product?.price || 59) + lensPrice);
                      })()}
                    </span>
                  </div>
                  
                  <div style={{ 
                    fontSize: '0.85rem', 
                    color: '#666', 
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                   
                  </div>
                </div>
              </div>
              
              <ModalActions>
                <ModalButton 
                  primary 
                  onClick={() => {
                    // Calculate lens pricing based on selections
                    let lensPrice = 0;
                    let customizations = {};
                    
                    // Add usage selection
                    if (selectedUsage) {
                      customizations.usage = selectedUsage;
                    }
                    
                    // Add lens type selection
                    if (selectedLensTypeOption) {
                      customizations.lensType = selectedLensTypeOption;
                    }
                    
                    // Add prescription method
                    if (selectedPrescriptionMethod) {
                      customizations.prescriptionMethod = selectedPrescriptionMethod;
                    }
                    
                    // Add lens color selections
                    if (selectedLensColor) {
                      customizations.lensColor = selectedLensColor;
                    }
                    
                    // Add clear lens option pricing
                    if (selectedClearLensOption) {
                      customizations.clearLensOption = selectedClearLensOption;
                      if (selectedClearLensOption === 'kodak-advanced') lensPrice += 85.95;
                      else if (selectedClearLensOption === 'most-popular') lensPrice += 19.95;
                      else if (selectedClearLensOption === 'standard') lensPrice += 6.95;
                    }
                    
                    // Add blue light option pricing
                    if (selectedBlueLightOption) {
                      customizations.blueLightOption = selectedBlueLightOption;
                      if (selectedBlueLightOption === 'ebdblue-360') lensPrice += 68.95;
                      else if (selectedBlueLightOption === 'sightrelax') lensPrice += 85.95;
                      else if (selectedBlueLightOption === 'ebdblue-smart') lensPrice += 78.95;
                      else if (selectedBlueLightOption === 'ebdblue-plus') lensPrice += 22.95;
                    }
                    
                    // Add transitions option pricing
                    if (selectedTransitionsOption) {
                      customizations.transitionsOption = selectedTransitionsOption;
                      if (selectedTransitionsOption === 'transitions-gen-s') lensPrice += 99;
                      else if (selectedTransitionsOption === 'transitions-xtractive') lensPrice += 139;
                      else if (selectedTransitionsOption === 'transitions-drivewear') lensPrice += 149;
                      else if (selectedTransitionsOption === 'photochromic') lensPrice += 45.95;
                    }
                    
                    // Add sun option pricing
                    if (selectedSunOption) {
                      customizations.sunOption = selectedSunOption;
                      if (selectedSunOption === 'basic') lensPrice += 6.95;
                      else if (selectedSunOption === 'polarized') lensPrice += 59;
                      else if (selectedSunOption === 'mirrored') lensPrice += 29;
                      else if (selectedSunOption === 'gradient') lensPrice += 12.95;
                      
                      // Add tint colors
                      if (selectedTintColor) customizations.tintColor = selectedTintColor;
                      if (selectedMirroredColor) customizations.mirroredColor = selectedMirroredColor;
                      if (selectedGradientColor) customizations.gradientColor = selectedGradientColor;
                    }
                    
                    // Add lens package pricing
                    if (selectedLensPackage) {
                      customizations.lensPackage = selectedLensPackage;
                      if (selectedLensPackage === 'standard') lensPrice += 43;
                      else if (selectedLensPackage === 'popular') lensPrice += 73;
                    }
                    
                    const totalPrice = (product?.price || 59) + lensPrice;
                    
                    const cartItem = {
                      id: product?.id || Date.now(),
                      name: product?.name || 'Vinyl',
                      brand: product?.brand || 'EyeBuyDirect',
                      originalPrice: product?.price || 59,
                      price: totalPrice,
                      image: product?.colors?.[selectedImage]?.image || product?.image || '/images/eyeglasses.webp',
                      color: selectedColor || product?.colors?.[0]?.name || 'Black',
                      size: selectedSize || product?.sizes?.[0] || 'Medium',
                      quantity: 1,
                      customizations: Object.keys(customizations).length > 0 ? customizations : null
                    };

                    // Add to cart
                    dispatch(addToCart(cartItem));
                    
                    // Close all modals
                    closeAllModals();
                    
                    // Navigate to cart page
                    navigate('/cart');
                  }}
                  style={{ 
                    backgroundColor: '#48b2ee',
                    width: '100%',
                    padding: '1rem',
                    fontSize: '1rem',
                    fontWeight: '600'
                  }}
                >
                  Confirm & add to cart
                </ModalButton>
              </ModalActions>
            </ModalRightSection>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* Sign In Modal for Prescription Selection */}
      {showSignInModal && (
        <ModalOverlay onClick={closePrescriptionModals}>
          <ModalContent onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <CloseButton onClick={closePrescriptionModals}>×</CloseButton>
            
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👤</div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '1rem', color: '#333' }}>
                Sign In Required
              </h3>
              <p style={{ color: '#666', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                Please sign in to access your saved prescriptions and choose from your previous orders.
              </p>
              <div>
                <button
                  style={{
                    background: '#48b2ee',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.75rem 1.5rem',
                    fontSize: '1rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    margin: '0 0.5rem',
                    transition: 'background-color 0.2s'
                  }}
                  onClick={() => {
                    // Instead of navigating to auth page, simulate sign-in success
                    // In a real app, this would trigger the auth flow and return here
                    handleSignInSuccess();
                  }}
                >
                  Sign In
                </button>
                <button
                  style={{
                    background: '#f5f5f5',
                    color: '#333',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.75rem 1.5rem',
                    fontSize: '1rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    margin: '0 0.5rem',
                    transition: 'background-color 0.2s'
                  }}
                  onClick={closePrescriptionModals}
                >
                  Cancel
                </button>
              </div>
            </div>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* Prescription Selector Modal */}
      {showPrescriptionSelector && (
        <ModalOverlay onClick={closePrescriptionModals}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalLeftSection>
              <ProductImageInModal 
                src={product?.image || '/images/eyeglasses.webp'} 
                alt={product?.name || 'Product'} 
              />
              <ProductNameInModal>{product?.name || 'Vinyl'}</ProductNameInModal>
              <ProductSubtitleInModal>
                {product?.shape || 'Square'} {product?.brand || 'Black'} Eyeglasses
              </ProductSubtitleInModal>
            </ModalLeftSection>
            
            <ModalRightSection>
              <ModalHeader>
                <div>
                  <span 
                    style={{ color: '#48b2ee', fontSize: '0.9rem', marginRight: '0.5rem', cursor: 'pointer' }}
                    onClick={() => {
                      setShowPrescriptionSelector(false);
                      setShowPrescriptionMethod(true);
                    }}
                  >
                    ← Back to Prescription Method
                  </span>
                </div>
                <CloseButton onClick={closePrescriptionModals}>×</CloseButton>
              </ModalHeader>
              
              <ModalTitle style={{ marginBottom: '1.5rem' }}>Choose from your saved prescriptions</ModalTitle>
              
              <div style={{ marginBottom: '2rem' }}>
                {prescriptions && prescriptions.length > 0 ? (
                  prescriptions.map((prescription, index) => (
                    <div 
                      key={prescription.id || index}
                      style={{ 
                        border: selectedPrescription?.id === prescription.id ? '2px solid #48b2ee' : '1px solid #e0e0e0', 
                        borderRadius: '8px', 
                        padding: '1rem', 
                        marginBottom: '1rem',
                        cursor: 'pointer',
                        backgroundColor: selectedPrescription?.id === prescription.id ? '#f8f9ff' : 'white'
                      }}
                      onClick={() => setSelectedPrescription(prescription)}
                    >
                      <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
                        {prescription.name || `Prescription ${index + 1}`}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
                        OD: SPH {prescription.rightEye?.sph || 'N/A'}, CYL {prescription.rightEye?.cyl || 'N/A'}, AXIS {prescription.rightEye?.axis || 'N/A'}°
                      </div>
                      <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
                        OS: SPH {prescription.leftEye?.sph || 'N/A'}, CYL {prescription.leftEye?.cyl || 'N/A'}, AXIS {prescription.leftEye?.axis || 'N/A'}°
                      </div>
                      {prescription.pd && (
                        <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
                          PD: {prescription.pd}mm
                        </div>
                      )}
                      <div style={{ fontSize: '0.8rem', color: '#999' }}>
                        Added: {prescription.dateAdded ? new Date(prescription.dateAdded).toLocaleDateString() : 'Unknown'}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '2rem', 
                    color: '#666',
                    border: '1px dashed #ddd',
                    borderRadius: '8px'
                  }}>
                    <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>👓</div>
                    <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>No Saved Prescriptions</div>
                    <div style={{ fontSize: '0.9rem' }}>
                      You haven't saved any prescriptions yet. Add your first prescription to get started.
                    </div>
                  </div>
                )}
              </div>
              
              <ModalActions>
                <ModalButton onClick={() => {
                  setShowPrescriptionSelector(false);
                  setShowPrescriptionMethod(true);
                }}>
                  Back
                </ModalButton>
                <ModalButton 
                  primary 
                  disabled={!selectedPrescription}
                  onClick={() => {
                    if (selectedPrescription) {
                      setShowPrescriptionSelector(false);
                      setShowLensColorSelection(true);
                    }
                  }}
                  style={{
                    opacity: selectedPrescription ? 1 : 0.5,
                    cursor: selectedPrescription ? 'pointer' : 'not-allowed'
                  }}
                >
                  Continue with Selected
                </ModalButton>
              </ModalActions>
            </ModalRightSection>
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
                src={product?.image || '/images/eyeglasses.webp'} 
                alt={product?.name || 'Product'}
              />
              <ProductPreviewInfo>
                <ProductPreviewName>{product?.name || 'FreshKon MOSAIC'}</ProductPreviewName>
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

            <FileUploadSection>
              <FileUploadLabel>Upload your photos (optional).</FileUploadLabel>
              <FileUploadArea onClick={() => document.getElementById('review-photo-upload').click()}>
                <FileUploadText>Select an image one here</FileUploadText>
                <FileUploadSubtext>(maximum file size is 10MB)</FileUploadSubtext>
                <FileUploadInput
                  id="review-photo-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleReviewPhotoUpload}
                />
              </FileUploadArea>
              {reviewPhotos.length > 0 && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
                  {reviewPhotos.length} file(s) selected
                </div>
              )}
            </FileUploadSection>

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

export default ProductDetailPage;
