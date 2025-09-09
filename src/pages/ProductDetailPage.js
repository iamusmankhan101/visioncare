import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { FiShoppingBag } from 'react-icons/fi';
import { addToCart } from '../redux/slices/cartSlice';
import { fetchProductById } from '../redux/slices/productSlice';
import formatPrice from '../utils/formatPrice';
import * as reviewService from '../services/reviewService';

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

// Update these styled components to match the image design
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
    object-fit: cover;
    transition: transform 0.5s ease, opacity 0.5s ease;
    opacity: 1;
  }
`;

const ThumbnailsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  margin-bottom: 1rem;
  
  @media (max-width: 480px) {
    grid-template-columns: repeat(4, 1fr);
    gap: 0.3rem;
  }
`;

const Thumbnail = styled.div`
  width: 100%;
  aspect-ratio: 1;
  cursor: pointer;
  max-width: 100px;
  transition: all 0.3s ease;
  border-radius: 10px;
  
  @media (max-width: 768px) {
    max-width: 80px;
  }
  
  @media (max-width: 480px) {
    max-width: 60px;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  }
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 10px;
  }
`;

const TryOnButton = styled.button`
  background-color: #48b2ee;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  margin-top: 0.5rem;
`;

const DiscountBadge = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: #e74c3c;
  color: white;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  z-index: 1;
`;

const StatusBadge = styled.div`
  position: absolute;
  top: 10px;
  left: ${props => props.hasDiscount ? '80px' : '10px'};
  background-color: #3498db;
  color: white;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  z-index: 1;
`;

const ProductInfo = styled.div`
  flex: 1;
  position: relative;
  padding: 2rem;
  max-width: 400px;
  background-color: #fff;
  border-radius: 10px;
  
  @media (max-width: 768px) {
    max-width: 100%;
    padding: 1.5rem;
  }
  
  @media (max-width: 480px) {
    padding: 1rem;
  }
`;

const ProductName = styled.h1`
  font-size: 1.8rem;
  margin: 0 0 0.2rem 0;
  font-weight: 600;
  text-align: left;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.3rem;
  }
`;

const ProductSubtitle = styled.p`
  font-size: 1rem;
  color: #666;
  margin: 0 0 1rem 0;
`;

const RatingContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const Stars = styled.div`
  color: #f8d448;
  font-size: 1rem;
`;

const ReviewCount = styled.a`
  color: #666;
  text-decoration: none;
  font-size: 0.9rem;
  
  &:hover {
    text-decoration: underline;
  }
`;

const PopularFrame = styled.div`
  background-color: #fff9e6;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  margin: 1rem 0;
  font-size: 0.9rem;
  color: #b38a0d;
`;


// Add SizeContainer back with updated styling
const SizeContainer = styled.div`
  margin: 1.5rem 0;
`;

const SizeLabel = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 0.8rem;
  font-size: 0.9rem;
  font-weight: 500;
  text-align: left;
`;

// Update the RatingContainer
// REMOVE this duplicate RatingContainer declaration entirely
// const RatingContainer = styled.div`
//   display: flex;
//   align-items: center;
//   gap: 0.5rem;
//   margin: 1rem 0;
// `;

// Rename Stars to EnhancedStars to match what's used in the JSX
const EnhancedStars = styled.div`
  color: #f8d448;
  font-size: 1.1rem;
  display: flex;
`;

// Rename Star to StarIcon to match what's used in the JSX
const StarIcon = styled.span`
  margin-right: 2px;
  color: ${props => props.filled ? '#FFD700' : '#ddd'};
`;

// Add the missing styled components
const PriceContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
`;

const CurrentPrice = styled.span`
  font-size: 1.5rem;
  font-weight: 600;
`;

const OriginalPrice = styled.span`
  font-size: 1.2rem;
  text-decoration: line-through;
  color: #888;
`;

const PriceNote = styled.div`
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 1rem;
`;

const SizeGuideLink = styled.a`
  font-size: 0.8rem;
  color: #666;
  text-decoration: underline;
  &:hover {
    color: #000;
  }
`;

// Add these new styled components
const TotalSection = styled.div`
  margin: 2rem 0 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TotalLabel = styled.span`
  font-weight: 600;
  font-size: 1rem;
`;



// Update the ButtonsContainer and add a SelectLensButton

const ButtonsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 1rem;
`;

const LensSelectionButton = styled.button`
  background-color: #48b2ee;
  border: 1px solid #ddd;
  padding: 1rem;
{{ ... }}
  border-radius: 8px;
  cursor: pointer;
  width: 100%;
  margin: 1rem 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  
  .lens-info {
    text-align: left;
    
    .lens-type {
      font-weight: 700;
      margin-bottom: 0.25rem;
      font-size: 1rem;
    }
    
    .lens-color {
      color: #666;
      font-size: 0.9rem;
    }
  }
  
  .arrow {
    font-size: 1.2rem;
    color: #ffffff;
  }
  
  &:hover {
    background-color: #48b2ee;
  }
`;


// Add these styled components before the ProductDetailPage component

// Add the missing styled components for the modal
const LensSelectionModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: transparent;
  display: ${props => props.isOpen ? 'flex' : 'none'};
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding-right:60px;
  overlay:hidden;
`;

const ModalContainer = styled.div`
  max-width: 1300px;
  width: 100%;
  height: 90vh;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  
  @media (max-width: 768px) {
    height: 100vh;
    width: 100%;
    border-radius: 0;
    max-height: 100%;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem 2rem;
  border-bottom: 1px solid #eee;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
  
  .back-button {
    color: #48b2ee;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    cursor: pointer;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
    
    &:before {
      content: '←';
      margin-right: 5px;
    }
  }
  
  .close-button {
    margin-left: auto;
    font-size: 1.5rem;
    cursor: pointer;
    color: #888;
    
    &:hover {
      color: #333;
    }
  }
`;

const ModalContent = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1;
  overflow: hidden;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const ProductContainer = styled.div`
  flex: 0 0 40%;
  background-color: #f9f9f9;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-right: 1px solid #eee;
  
  @media (max-width: 768px) {
    display: none; /* Hide the product container on mobile */
  }
`;

const LensOptionsContainer = styled.div`
  flex: 0 0 60%;
  padding: 3rem;
  overflow-y: auto;
  
  @media (max-width: 768px) {
    flex: 1;
    padding: 1.5rem;
    width: 100%;
  }
  
  @media (max-width: 480px) {
    padding: 1rem;
    width:92%;
  }
`;

const ProductDisplay = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  
  img {
    width: 250px;
    height: auto;
    margin-bottom: 1rem;
  }
  
  .product-name {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: #333;
  }
  
  .product-type {
    font-size: 1rem;
    color: #666;
  }
`;

const LensUsageTitle = styled.h2`
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: rem;
  color: #333;
  text-align:left;
  margin-top:1rem;
`;

const LensInfoLink = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
  color: #48b2ee;
  font-size: 0.9rem;
  cursor: pointer;
  
  &:before {
    content: 'ⓘ';
    margin-right: 5px;
    font-size: 1rem;
  }
  
  &:hover {
    text-decoration: underline;
  }
`;

const LensOptionCard = styled.div`
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  background-color: ${props => props.selected ? '#f9f9f9' : '#fff'};
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%; /* Ensure cards take full width of their container */
  box-sizing: border-box; /* Include padding in width calculation */
  
  &:hover {
    border-color: #48b2ee;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  }
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const LensOptionCards = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 82%;
  
  @media (max-width: 768px) {
    max-width: 100%;
  }
`;

const LensOptionTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #333;
`;

const LensOptionDescription = styled.p`
  font-size: 0.9rem;
  color: #666;
  margin: 0;
`;

const ModalButtonContainer = styled.div`
  display: none;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-top: 3rem;
  padding-top: 1.5rem;
  border-top: 1px solid #f0f0f0;
  max-width:82%;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
    margin-top: 2rem;
    max-width: 92%;
  }
`;

const ModalButton = styled.button`
  padding: 0.9rem 1.8rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
`;

const BackButton = styled(ModalButton)`
  background-color: #48b2ee;
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-radius:10px;
  
  &:hover {
    background-color: #48b2ee;
  }
`;

const ContinueButton = styled(ModalButton)`
  background-color: #48b2ee;
  color: white;
  box-shadow: 0 4px 8px rgba(192, 138, 51, 0.25);
  
  &:hover {
    background-color: #a67a2d;
    box-shadow: 0 6px 12px rgba(192, 138, 51, 0.3);
    transform: translateY(-2px);
  }
`;


const AttributeLabel = styled.div`
  font-weight: 600;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  text-align: left;
  margin-top: 1rem;
`;

// Review Form Styled Components
const ReviewsSection = styled.div`
  margin: 3rem 0;
  padding: 2rem;
  background: #f9f9f9;
  border-radius: 10px;
  
  @media (max-width: 768px) {
    margin: 2rem 0;
    padding: 1.5rem;
  }
`;

const ReviewsTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 2rem;
  color: #333;
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
  }
`;

const ReviewFormContainer = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 10px;
  margin-bottom: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const ReviewFormTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #333;
`;

const ReviewForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ReviewFormRow = styled.div`
  display: flex;
  gap: 1.5rem;
  align-items: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
`;

const ReviewInput = styled.input`
  flex: 1;
  padding: 0.8rem 1rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  font-family: inherit;
  
  &:focus {
    outline: none;
    border-color: #48b2ee;
    box-shadow: 0 0 0 2px rgba(72, 178, 238, 0.2);
  }
  
  &::placeholder {
    color: #999;
  }
`;

const StarRatingContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const StarRatingLabel = styled.span`
  font-weight: 500;
  color: #333;
`;

const StarRating = styled.div`
  display: flex;
  gap: 2px;
`;

const Star = styled.span`
  font-size: 1.5rem;
  color: ${props => props.filled ? '#f8d448' : '#ddd'};
  cursor: pointer;
  transition: color 0.2s ease;
  
  &:hover {
    color: #f8d448;
  }
`;

const ReviewTextarea = styled.textarea`
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  min-height: 100px;
  
  &:focus {
    outline: none;
    border-color: #48b2ee;
    box-shadow: 0 0 0 2px rgba(72, 178, 238, 0.2);
  }
  
  &::placeholder {
    color: #999;
  }
`;

const ReviewSubmitButton = styled.button`
  background: linear-gradient(135deg, #48b2ee 0%, #3a9bd9 100%);
  color: white;
  border: none;
  padding: 0.8rem 2rem;
  border-radius: 5px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  align-self: flex-start;
  
  &:hover {
    background: linear-gradient(135deg, #3a9bd9 0%, #2980b9 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 15px rgba(72, 178, 238, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  @media (max-width: 768px) {
    align-self: stretch;
  }
`;

const ReviewsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ReviewItem = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const ReviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
`;

const ReviewerName = styled.h4`
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin: 0;
`;

const ReviewRating = styled.div`
  display: flex;
  gap: 2px;
`;

const ReviewText = styled.p`
  color: #666;
  line-height: 1.6;
  margin: 0 0 1rem 0;
`;

const ReviewDate = styled.span`
  font-size: 0.9rem;
  color: #999;
`;

const FreeShippingBadge = styled.div`
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin: 1rem 0;

  .icon {
    font-size: 1rem;
  }

  @media (max-width: 768px) {
    font-size: 0.8rem;
    padding: 0.4rem 0.8rem;
  }
`;

const ShippingInfo = styled.div`
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;

  .title {
    font-weight: 600;
    color: #333;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .details {
    font-size: 0.9rem;
    color: #666;
    line-height: 1.4;
  }

  .highlight {
    color: #4CAF50;
    font-weight: 600;
  }
`;

// Add the missing styled components
const LensOptions = styled.div`
  display: flex;
  gap: 0.8rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
`;

const LensOption = styled.div`
  border: 1px solid ${props => props.selected ? '#000' : '#ddd'};
  background-color: ${props => props.selected ? '#000' : 'transparent'};
  color: ${props => props.selected ? '#fff' : '#000'};
  padding: 0.8rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  span {
    font-size: 1.2rem;
  }
`;

const ColorOptions = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
  
  
  @media (max-width: 480px) {
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
`;

const ColorOptionButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border: 2px solid ${props => props.selected ? '#48b2ee' : '#e0e0e0'};
  background-color: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 70px;
  
  &:hover {
    border-color: #48b2ee;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
`;

const ColorSwatch = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: ${props => props.color};
  border: 2px solid #fff;
  box-shadow: 0 0 0 1px rgba(0,0,0,0.1);
`;

const ColorName = styled.span`
  font-size: 0.8rem;
  font-weight: 500;
  color: #333;
  text-align: center;
`;

const SizeOptions = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
  
  @media (max-width: 480px) {
    gap: 0.3rem;
  }
`;

const SizeOption = styled.button`
  padding: 0.5rem 1rem;
  border: 2px solid ${props => props.selected ? '#48b2ee' : '#ddd'};
  background-color: ${props => props.selected ? '#48b2ee' : 'white'};
  color: ${props => props.selected ? 'white' : '#333'};
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s;
  
  &:hover {
    border-color: #48b2ee;
    background-color: ${props => props.selected ? '#48b2ee' : '#f9f3e8'};
  }
`;

const ProductDetailsSection = styled.section`
  margin: 3rem 0;
  padding: 2rem;
  background-color: #f9f9f9;
  border-radius: 10px;
  display: flex;
  gap: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    margin: 2rem 0;
    padding: 1.5rem;
    gap: 1.5rem;
  }
  
  @media (max-width: 480px) {
    margin: 1rem 0;
    padding: 1rem;
    gap: 1rem;
  }
  
  > div:first-child {
    flex: 1;
  }
  
  > div:last-child {
    flex: 1;
  }
`;

const DetailItem = styled.div`
  display: flex;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #eee;
`;

const DetailLabel = styled.div`
  flex: 1;
  font-weight: 500;
  color: #666;
  text-align: left;
`;

const DetailValue = styled.div`
  flex: 1;
  text-align: right;
  font-weight: 500;
`;

const AboutSection = styled.section`
  margin: 3rem 0;
  padding: 2rem;
  background-color: #f9f9f9;
  border-radius: 8px;
  
  @media (max-width: 768px) {
    margin: 2rem 0;
    padding: 1.5rem;
  }
  
  @media (max-width: 480px) {
    margin: 1rem 0;
    padding: 1rem;
  }
`;

const AboutContent = styled.div`
  display: flex;
  gap: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const SpecsContainer = styled.div`
  flex: 1;
`;

const AboutTitle = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  font-weight: 600;
  text-align: left;
`;

const SpecRow = styled.div`
  display: flex;
  margin-bottom: 1rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.5rem;
`;

const SpecLabel = styled.div`
  flex: 1;
  font-weight: 500;
  color: #666;
  text-align: left;
`;

const SpecValue = styled.div`
  flex: 2;
  font-weight: 400;
  text-align: right;
`;

const ProductImageContainer = styled.div`
  flex: 0 0 300px;
  
  img {
    width: 100%;
    max-width: 300px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
  
  @media (max-width: 768px) {
    flex: 1;
    
    img {
      max-width: 100%;
    }
  }
`;

const TabsContainer = styled.div`
  margin: 3rem 0;
  
  @media (max-width: 768px) {
    margin: 2rem 0;
  }
  
  @media (max-width: 480px) {
    margin: 1rem 0;
  }
`;

const TabsHeader = styled.div`
  display: flex;
  border-bottom: 1px solid #ddd;
  margin-bottom: 1.5rem;
  overflow-x: auto;
  
  @media (max-width: 480px) {
    margin-bottom: 1rem;
  }
`;

const Tab = styled.button`
  padding: 0.8rem 1.5rem;
  background: ${props => props.active ? '#48b2ee' : 'transparent'};
  color: ${props => props.active ? 'white' : '#333'};
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  white-space: nowrap;
  
  @media (max-width: 480px) {
    padding: 0.6rem 1rem;
    font-size: 0.9rem;
  }
  
  &:hover {
    background: ${props => props.active ? '#48b2ee' : '#eee'};
  }
`;

const TabContent = styled.div`
  line-height: 1.6;
  color: #444;
  text-align: left;
  
  p {
    margin-bottom: 1rem;
    text-align: left;
  }
  
  ul {
    padding-left: 1.5rem;
    margin-bottom: 1rem;
    text-align: left;
  }
  
  li {
    text-align: left;
  }
`;

const NotFoundContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 3rem 1rem;
  max-width: 600px;
  margin: 0 auto;
`;

const NotFoundTitle = styled.h2`
  font-size: 2rem;
  margin-bottom: 1rem;
  font-weight: 600;
`;

const NotFoundMessage = styled.p`
  color: #666;
  margin-bottom: 2rem;
  line-height: 1.6;
`;

const NotFoundButton = styled(Link)`
  background-color: #48b2ee;
  color: white;
  padding: 0.8rem 1.5rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 500;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #a07828;
  }
`;

// Remove sliding animation - show only current screen
const ModalScreensContainer = styled.div`
  display: block;
  width: 100%;
  overflow-x: hidden;
`;

const ModalScreen = styled.div`
  width: 100%;
  flex-shrink: 0;
  padding-bottom: 2rem;
  overflow-y: auto;
  display: ${props => props.active ? 'block' : 'none'};
`;

// Add the PrescriptionOptionsModal component
const PrescriptionOptionsModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: ${props => props.isOpen ? 'flex' : 'none'};
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
  
  @media (max-width: 768px) {
    padding: 0;
  }
`;

const PrescriptionOptionCard = styled.div`
  display: flex;
  max-width: 75%;
  align-items: center;
  padding: 1.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: white;

  @media (max-width: 768px) {
    max-width: 100%;
  }

  @media (max-width: 480px) {
    max-width: 75%;
  }
  
  &:hover {
    border-color: #48b2ee;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  .icon {
    margin-right: 1rem;
    font-size: 1.5rem;
    color: #555;
  }
  
  .content {
    flex: 1;
  }
  
  .new-badge {
    background-color: #4CAF50;
    color: white;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.75rem;
    margin-left: 0.5rem;
  }
`;

const PrescriptionTitle = styled.h2`
  font-size: 1.55rem;
  margin-bottom: 2rem;
  color: #333;
  font-weight: 800;
  text-align:left;
`;

const PrescriptionFormTitle = styled.h2`
  font-size: 1.55rem;
  margin-bottom: 2rem;
  color: #333;
  font-weight: 800;
  text-align: left;
  
`;

const FindDoctorLink = styled.a`
  color: #48b2ee;
  text-decoration: none;
  display: block;
  text-align: right;
  margin-top: 1rem;
  font-size: 0.9rem;
  
  &:hover {
    text-decoration: underline;
  }
`;

const SectionTitle = styled.h3`
  font-size: 2rem;
  margin-bottom: 1.5rem;
  font-weight: 800;
  text-align: left;
`;

const RelatedProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 2rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 1.5rem;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 1rem;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }
`;

const RelatedProductCard = styled.div`
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  background: white;
  border: 1px solid #f0f0f0;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    border-color: #e0e0e0;
  }
`;

const ProductImage = styled.div`
  width: 100%;
  height: 220px;
  overflow: hidden;
  position: relative;
  background: #f8f9fa;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.4s ease;
  }
  
  &:hover img {
    transform: scale(1.08);
  }
  
  @media (max-width: 768px) {
    height: 180px;
  }
  
  @media (max-width: 480px) {
    height: 150px;
  }
`;

const ProductCardInfo = styled.div`
  padding: 1.25rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.75rem;
  }
`;

const ProductCardName = styled.h4`
  font-size: 1.1rem;
  margin: 0 0 0.25rem 0;
  font-weight: 600;
  color: #333;
  line-height: 1.3;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`;

const ProductCardPrice = styled.div`
  font-weight: 700;
  color: #48b2ee;
  font-size: 1.1rem;
  margin-top: 0.5rem;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`;

const ProductCardBrand = styled.p`
  font-size: 0.85rem;
  color: #666;
  margin: 0 0 0.25rem 0;
  font-weight: 400;
  
  @media (max-width: 480px) {
    font-size: 0.8rem;
  }
`;

// Add missing styled components for the related products section
const CategoryBadge = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  z-index: 2;
`;

const CartButton = styled.button`
  position: absolute;
  bottom: 10px;
  right: 10px;
  background-color: #48b2ee;
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: all 0.3s ease;
  z-index: 2;
  
  &:hover {
    background-color: #a07828;
    transform: scale(1.1);
  }
`;

const ProductContent = styled.div`
  padding: 1rem;
`;

const ProductTitle = styled.h3`
  font-size: 1rem;
  margin: 0 0 0.5rem 0;
  font-weight: 600;
  color: #333;
  
  a {
    color: inherit;
    text-decoration: none;
    
    &:hover {
      color: #48b2ee;
    }
  }
`;

const ProductBrand = styled.p`
  font-size: 0.85rem;
  color: #666;
  margin: 0 0 0.5rem 0;
  font-weight: 400;
`;

const ProductPrice = styled.div`
  font-size: 1rem;
  font-weight: 700;
  color: #48b2ee;
  margin-bottom: 0.5rem;
`;

const ColorDot = styled.div`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: ${props => props.color || '#ccc'};
  border: 2px solid #fff;
  box-shadow: 0 0 0 1px rgba(0,0,0,0.1);
  cursor: pointer;
  
  &:hover {
    transform: scale(1.1);
  }
`;

const RelatedProductsSection = styled.div`
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid #eee;
`;

const RelatedProductsTitle = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: #333;
`;

const RelatedProductImage = styled.div`
  width: 100%;
  height: 200px;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

// Add styled components for prescription form
const PrescriptionForm = styled.div`
  max-width: 82%;

  @media (max-width: 480px) {
    max-width: 100%;
  }
`;

const PrescriptionTable = styled.div`
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 80px 1fr 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
  font-weight: 600;
  font-size: 0.9rem;
  color: #333;
  text-align: center;
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 80px 1fr 1fr 1fr;
  gap: 1rem;
  margin-bottom: 0.8rem;
  align-items: center;
`;

const EyeLabel = styled.div`
  font-weight: 500;
  font-size: 0.9rem;
  text-align: left;
  
  .sub-label {
    font-size: 0.75rem;
    color: #666;
    font-weight: 400;
  }
`;

const PrescriptionInput = styled.input`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  text-align: center;
  font-size: 0.9rem;
  
  &:focus {
    outline: none;
    border-color: #48b2ee;
  }
`;

const PrescriptionSelect = styled.select`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  text-align: center;
  font-size: 0.9rem;
  background-color: white;
  
  &:focus {
    outline: none;
    border-color: #48b2ee;
  }
`;

const AxisInput = styled.div`
  text-align: center;
  color: #999;
  font-size: 0.9rem;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #f8f8f8;
`;

const PDSection = styled.div`
  display: grid;
  grid-template-columns: 80px 200px 1fr;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1rem;
`;

const PDInput = styled.input`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  text-align: center;
  font-size: 0.9rem;
  
  &:focus {
    outline: none;
    border-color: #48b2ee;
  }
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  
  input {
    margin-right: 0.5rem;
  }
  
  label {
    font-size: 0.9rem;
    color: #333;
  }
`;

const MoreOptionsButton = styled.button`
  background: none;
  border: none;
  color: #666;
  font-size: 0.9rem;
  text-decoration: underline;
  cursor: pointer;
  margin-bottom: 1.5rem;
  
  &:hover {
    color: #333;
  }
`;

const SaveContinueButton = styled.button`
  background-color: #48b2ee;
  color: white;
  border: none;
  padding: 0.8rem 2rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  width: 100%;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #a07828;
  }
`;

const LearnLink = styled.a`
  color: #48b2ee;
  text-decoration: none;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
  display: inline-block;
  
  &:hover {
    text-decoration: underline;
  }
  
  &:before {
    content: 'ⓘ ';
    margin-right: 0.25rem;
  }
`;

// Add styled components for upload modal
const UploadContainer = styled.div`
  max-width: 75%;
  text-align: center;
`;

const UploadTitle = styled.h2`
  font-size: 1.55rem;
  margin-bottom: 1rem;
  color: #333;
  font-weight: 800;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const NewBadge = styled.span`
  background-color: #4CAF50;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
`;

const UploadSubtitle = styled.p`
  font-size: 1rem;
  color: #666;
  margin-bottom: 2rem;
  text-align: left;
`;

const UploadArea = styled.div`
  border: 2px dashed #48b2ee;
  border-radius: 8px;
  padding: 3rem 2rem;
  background-color: #fefefe;
  margin-bottom: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #a07828;
    background-color: #faf8f5;
  }
`;

const UploadIcon = styled.div`
  font-size: 3rem;
  color: #48b2ee;
  margin-bottom: 1rem;
`;

const UploadText = styled.p`
  font-size: 1rem;
  color: #8B7355;
  margin: 0;
  font-weight: 500;
`;

const CameraButton = styled.button`
  background: none;
  border: none;
  color: #48b2ee;
  font-size: 1rem;
  text-decoration: underline;
  cursor: pointer;
  margin-top: 1.5rem;
  
  &:hover {
    color: #a07828;
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

// Add styled components for image preview screen
const PreviewContainer = styled.div`
  max-width: 75%;
  text-align: center;
`;

const PreviewTitle = styled.h2`
  font-size: 1.55rem;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 800;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const PreviewSubtitle = styled.p`
  font-size: 1rem;
  color: #666;
  margin-bottom: 2rem;
  text-align: left;
`;

const ImagePreviewContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 500px;
  margin: 0 auto 2rem;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
`;

const PreviewImage = styled.img`
  width: 100%;
  height: auto;
  display: block;
`;

const CropOverlay = styled.div`
  position: absolute;
  top: 20%;
  left: 10%;
  right: 10%;
  bottom: 20%;
  border: 2px solid #00bcd4;
  border-radius: 4px;
  pointer-events: none;
`;

const RotateButton = styled.button`
  position: absolute;
  bottom: 10px;
  right: 10px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  padding: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.8);
  }
`;

const StartScanningButton = styled.button`
  background-color: #48b2ee;
  color: white;
  border: none;
  padding: 0.8rem 2rem;
  border-radius: 8px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  font-weight: 600;
  font-size: 1rem;
  width: 100%;
  margin-bottom: 1rem;
  transition: background-color 0.2s;
  opacity: ${props => props.disabled ? 0.7 : 1};
  
  &:hover {
    background-color: ${props => props.disabled ? '#48b2ee' : '#a07828'};
  }
`;

const ChooseDifferentFileButton = styled.button`
  background: none;
  border: none;
  color: #48b2ee;
  font-size: 1rem;
  text-decoration: underline;
  cursor: pointer;
  
  &:hover {
    color: #a07828;
  }
`;

// Lens Color Selection Styled Components
const LensColorContainer = styled.div`
  max-width: 80%;
  text-align: left;

   @media (max-width: 480px) {
    max-width: 95%;
  }
`;

const LensColorTitle = styled.h2`
  font-size: 1.8rem;
  margin-bottom: 2rem;
  color: #333;
  font-weight: 700;
`;

// Polarized Tint Selection Styled Components
const PolarizedTintContainer = styled.div`
  max-width: 80%;
  text-align: left;

   @media (max-width: 480px) {
    max-width: 95%;
  }
`;

const PolarizedTintTitle = styled.h2`
  font-size: 1.8rem;
  margin-bottom: 2rem;
  color: #333;
  font-weight: 700;
`;

const PolarizedTintOption = styled.div`
  background: ${props => props.selected ? '#f0f8ff' : '#f8f9fa'};
  border: ${props => props.selected ? '2px solid #48b2ee' : '1px solid #e9ecef'};
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 1rem;
  
  &:hover {
    border-color: #48b2ee;
    background: #f0f8ff;
  }
`;

const PolarizedTintIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.color || '#f8f9fa'};
  border: 2px solid #dee2e6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
`;

const PolarizedTintInfo = styled.div`
  flex: 1;
`;

const PolarizedTintName = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: #333;
`;

const PolarizedTintDescription = styled.p`
  font-size: 0.9rem;
  color: #666;
  margin: 0;
  line-height: 1.4;
`;

const PolarizedTintPrice = styled.span`
  font-size: 1rem;
  font-weight: 600;
  color: #48b2ee;
`;

const BasicTintColorSection = styled.div`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
`;

const BasicTintColorLabel = styled.div`
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 0.8rem;
  color: #333;
`;

const BasicTintColorOptions = styled.div`
  display: flex;
  gap: 0.8rem;
  margin-bottom: 1rem;
`;

const BasicTintColorOption = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: ${props => props.color || '#000'};
  cursor: pointer;
  border: 2px solid ${props => props.selected ? '#48b2ee' : 'transparent'};
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #48b2ee;
    transform: scale(1.1);
  }
`;

const ChooseContinueButton = styled.button`
  background-color: #48b2ee;
  color: white;
  border: none;
  padding: 0.8rem 2rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  width: 100%;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #a07828;
  }
`;

const GradientTintSection = styled.div`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
`;

const GradientTintLabel = styled.div`
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 0.8rem;
  color: #333;
`;

// Checkout Flow Styled Components
const CheckoutFlowContainer = styled.div`
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
`;

const CheckoutFlowTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 0.5rem;
  color: #333;
`;

const CheckoutFlowSubtitle = styled.p`
  text-align: center;
  color: #666;
  margin-bottom: 2rem;
  font-size: 1.1rem;
`;

const CheckoutFlowGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const CheckoutFlowCard = styled.div`
  border: 2px solid ${props => props.selected ? '#48b2ee' : '#e0e0e0'};
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => props.selected ? '#f8fcff' : 'white'};
  
  &:hover {
    border-color: #48b2ee;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(72, 178, 238, 0.15);
  }
`;

const CheckoutFlowCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const CheckoutFlowCardTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 600;
  color: #333;
  margin: 0;
`;

const CheckoutFlowCardPrice = styled.span`
  font-size: 1.2rem;
  font-weight: 700;
  color: ${props => props.free ? '#28a745' : '#48b2ee'};
`;

const CheckoutFlowCardDescription = styled.p`
  color: #666;
  line-height: 1.5;
  margin-bottom: 1rem;
`;

const CheckoutFlowCardFeatures = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const CheckoutFlowCardFeature = styled.li`
  color: #555;
  margin-bottom: 0.5rem;
  padding-left: 1.2rem;
  position: relative;
  
  &:before {
    content: '✓';
    position: absolute;
    left: 0;
    color: #28a745;
    font-weight: bold;
  }
`;

const CheckoutFlowNavigation = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e0e0e0;
`;

const CheckoutFlowBackButton = styled.button`
  background: transparent;
  border: 2px solid #ddd;
  color: #666;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #999;
    color: #333;
  }
`;

const CheckoutFlowContinueButton = styled.button`
  background: ${props => props.disabled ? '#ccc' : '#48b2ee'};
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.disabled ? '#ccc' : '#3a9bd8'};
  }
`;

// Checkout Review Page Styled Components
const CheckoutReviewContainer = styled.div`
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
`;

const ReviewTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 1rem;
  color: #333;
`;

const ReviewSubtitle = styled.p`
  text-align: center;
  color: #666;
  margin-bottom: 2rem;
  line-height: 1.5;
`;

const PrescriptionDetailsSection = styled.div`
  margin-bottom: 2rem;
`;

const ReviewSectionTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #333;
`;

const ReviewPrescriptionTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
  
  th, td {
    border: 1px solid #e0e0e0;
    padding: 0.75rem;
    text-align: center;
    font-size: 0.9rem;
  }
  
  th {
    background-color: #f8f9fa;
    font-weight: 600;
    color: #333;
  }
  
  td {
    color: #555;
  }
`;

const ReviewProductDetailsSection = styled.div`
  margin-bottom: 2rem;
`;

const ProductDetailItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
`;

const ProductDetailLabel = styled.span`
  color: #333;
  font-size: 0.9rem;
`;

const ProductDetailValue = styled.span`
  color: #666;
  font-size: 0.9rem;
  font-weight: 500;
`;

const UpgradeSection = styled.div`
  background-color: #fff8e1;
  border: 1px solid #ffcc02;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const UpgradeText = styled.div`
  flex: 1;
  font-size: 0.9rem;
  color: #333;
`;

const UpgradeButton = styled.button`
  background-color: #48b2ee;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  
  &:hover {
    background-color: #a07828;
  }
`;

const PricingSection = styled.div`
  border-top: 1px solid #e0e0e0;
  padding-top: 1rem;
  margin-bottom: 2rem;
`;

const SubtotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 1rem;
`;

const PaymentInfo = styled.div`
  text-align: center;
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 2rem;
`;

const ConfirmButton = styled.button`
  width: 100%;
  background-color: #48b2ee;
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #a07828;
  }
`;

const LensColorOption = styled.div`
  background: ${props => props.selected ? '#f0f8ff' : '#f8f9fa'};
  border: ${props => props.selected ? '2px solid #48b2ee' : '1px solid #e9ecef'};
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  width:90%
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 1rem;
  
  &:hover {
    border-color: #48b2ee;
    background: #f0f8ff;
  }
    @media (max-width: 480px) {
    max-width: 95%;
  }
`;

const LensColorIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.color || '#f8f9fa'};
  border: 2px solid #dee2e6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
`;

const LensColorInfo = styled.div`
  flex: 1;
`;

const LensColorName = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: #333;
`;

const LensColorDescription = styled.p`
  font-size: 0.9rem;
  color: #666;
  margin: 0;
  line-height: 1.4;
`;

const SeasonBadge = styled.span`
  background: #8b5cf6;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-left: 0.5rem;
`;

const ContinueToCheckoutButton = styled.button`
  background-color: #48b2ee;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  width: 100%;
  margin-top: 2rem;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #48b2ee;
  }
`;


const ClearSelectionButton = styled.button`
  background-color: transparent;
  color: #666;
  border: 1px solid #ddd;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  width: 100%;
  margin-top: 0.5rem;
  transition: all 0.2s;
  
  &:hover {
    background-color: #f5f5f5;
    border-color: #999;
    color: #333;
  }
`;

// Sun Protection Options Styled Components
const SunProtectionContainer = styled.div`
  max-width: 80%;
  text-align: left;

   @media (max-width: 480px) {
    max-width: 95%;
  }
`;

const SunProtectionTitle = styled.h2`
  font-size: 1.8rem;
  margin-bottom: 2rem;
  color: #333;
  font-weight: 700;
`;

const SunProtectionOption = styled.div`
  background: ${props => props.selected ? '#f0f8ff' : '#f8f9fa'};
  border: ${props => props.selected ? '2px solid #48b2ee' : '1px solid #e9ecef'};
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  
  &:hover {
    border-color: #48b2ee;
    background: #f0f8ff;
  }
`;

const SunProtectionIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.color || '#6B7280'};
  border: 2px solid #dee2e6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
`;

const SunProtectionInfo = styled.div`
  flex: 1;
`;

const SunProtectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
`;

const SunProtectionName = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  color: #333;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SunProtectionPrice = styled.span`
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
`;

const SunProtectionDescription = styled.p`
  font-size: 0.9rem;
  color: #666;
  margin: 0;
  line-height: 1.4;
`;

const InfoIcon = styled.span`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #6c757d;
  color: white;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: bold;
`;

// Tint Customization Styled Components
const TintCustomizationContainer = styled.div`
  max-width: 75%;
  text-align: left;

   @media (max-width: 480px) {
    max-width: 95%;
  }
`;

const TintCustomizationTitle = styled.h2`
  font-size: 1.8rem;
  margin-bottom: 2rem;
  color: #333;
  font-weight: 700;
`;

const TintSection = styled.div`
  margin-bottom: 2rem;
`;

const TintSectionTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #333;
`;

const TintStrengthOptions = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const TintStrengthOption = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.9rem;
  color: #333;
`;

const TintStrengthRadio = styled.input`
  width: 18px;
  height: 18px;
  margin: 0;
`;

const TintColorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.75rem;
  margin-bottom: 2rem;
`;

const TintColorOption = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${props => props.color};
  border: ${props => props.selected ? '3px solid #48b2ee' : '2px solid #dee2e6'};
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  
  &:hover {
    border-color: #48b2ee;
    transform: scale(1.1);
  }
  
  ${props => props.selected && `
    &::after {
      content: '✓';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: white;
      font-weight: bold;
      font-size: 0.8rem;
    }
  `}
`;



const ButtonsRow = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  align-items: center;
`;

// ProductDetailPage component
const ProductDetailPage = () => {
  // Get the id from URL params, dispatch for Redux actions, and navigate for redirects
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Get product state from Redux
  const { status, error } = useSelector(state => state.products);
  
  // State variables
  const [product, setProduct] = useState(null);
  const [, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedImage, setSelectedImage] = useState(0);
  const [isImageChanging, setIsImageChanging] = useState(false);
  const [, setActiveTab] = useState('description');
  const [activeAboutTab, setActiveAboutTab] = useState('details');
  
  const [selectedLensType, setSelectedLensType] = useState('');
  const [, setQuantity] = useState(1);
  const [, setInWishlist] = useState(false);
  
  // Add new state for modal
  const [isLensModalOpen, setIsLensModalOpen] = useState(false);
  const [selectedLensOption, setSelectedLensOption] = useState(null);
  
  // Add new state for modal screens
  const [modalScreen, setModalScreen] = useState('lens'); // 'lens', 'prescription', 'prescription-form', 'upload', 'preview', 'lens-color', 'sun-protection', 'tint-customization', 'polarized-tint'
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Add state for uploaded file
  const [uploadedFile, setUploadedFile] = useState(null);
  const [previewImageUrl, setPreviewImageUrl] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  
  // Add state for lens color selection
  const [selectedLensColor, setSelectedLensColor] = useState('');
  const [selectedSunOption, setSelectedSunOption] = useState('Basic');
  const [selectedTransitionsOption, setSelectedTransitionsOption] = useState('GEN-S');
  const [selectedBluelightOption, setSelectedBluelightOption] = useState('EBDBlue-360');
  const [selectedEBDBlue360Type, setSelectedEBDBlue360Type] = useState('1.6');
  const [selectedEBDBlueSmartColor, setSelectedEBDBlueSmartColor] = useState('Gray');
  const [selectedEBDBluePlusType, setSelectedEBDBluePlusType] = useState('1.5');
  
  // Add state for tint customization
  const [selectedTintStrength, setSelectedTintStrength] = useState('Dark (80%)');
  const [selectedTintColor, setSelectedTintColor] = useState('Gray');
  
  // Add state for polarized tint options
  const [selectedPolarizedTint, setSelectedPolarizedTint] = useState(null);
  const [selectedBasicTintColor, setSelectedBasicTintColor] = useState('Gray');
  const [selectedMirroredTintColor, setSelectedMirroredTintColor] = useState('Silver');
  const [selectedMirroredSunColor, setSelectedMirroredSunColor] = useState('Silver');
  const [selectedGradientColor, setSelectedGradientColor] = useState('Gray');
  
  // Add state for checkout flow pages
  const [showCheckoutReview, setShowCheckoutReview] = useState(false);
  const [showUsageSelection, setShowUsageSelection] = useState(false);
  const [showLensTypeSelection, setShowLensTypeSelection] = useState(false);
  const [showPrescriptionMethod, setShowPrescriptionMethod] = useState(false);
  const [hasBluelightUpgrade, setHasBluelightUpgrade] = useState(false);
  const [selectedUsage, setSelectedUsage] = useState(null);
  const [selectedLensTypeOption, setSelectedLensTypeOption] = useState(null);
  const [selectedPrescriptionMethod, setSelectedPrescriptionMethod] = useState(null);
  
  // Add prescription form state
  const [prescriptionData, setPrescriptionData] = useState({
    od: { sph: '0.00', cyl: '0.00', axis: '0' },
    os: { sph: '0.00', cyl: '0.00', axis: '0' },
    pd: '63'
  });
  
  // Review form state
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewName, setReviewName] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [reviews, setReviews] = useState([]);
  const [productReviews, setProductReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  // Handle star rating click
  const handleStarClick = (rating) => {
    setReviewRating(rating);
  };

  // Handle review form submission
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    if (!reviewName.trim() || !reviewText.trim() || reviewRating === 0) {
      alert('Please fill in all fields and select a rating');
      return;
    }

    try {
      const reviewData = {
        productId: id,
        name: reviewName.trim(),
        rating: reviewRating,
        text: reviewText.trim()
      };

      // Submit review to database
      const newReview = await reviewService.createReview(reviewData);
      
      // Update local state with the new review
      setProductReviews(prevReviews => [newReview, ...prevReviews]);
      setReviews(prevReviews => [newReview, ...prevReviews]);
      
      // Update stats
      const updatedStats = await reviewService.getReviewStats(id);
      setReviewCount(updatedStats.count);
      setAverageRating(updatedStats.averageRating);
      
      // Reset form
      setReviewName('');
      setReviewText('');
      setReviewRating(0);
      
      // Show success message
      alert('Review submitted successfully!');
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    }
  };
  
  // Add new state for prescription modal
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  
  // Gallery images from product data
  const productImages = product?.gallery || [product?.image].filter(Boolean);
  
  // Available sizes from product data
  const availableSizes = product?.sizes || ['Small', 'Medium', 'Large'];
  
  // Available lens types from product data
  const lensTypes = product?.lensTypes || ['Non-Prescription', 'Prescription'];
  
  // Add the handleImageSelect function here
  const handleImageSelect = (index) => {
    setIsImageChanging(true);
    setTimeout(() => {
      setSelectedImage(index);
      setIsImageChanging(false);
    }, 150); // Half the transition time for a smooth crossfade
  };
  
  // Handle back navigation between modal screens
  const handleBackNavigation = () => {
    if (modalScreen === 'prescription') {
      setModalScreen('lens');
    } else if (modalScreen === 'prescription-form') {
      setModalScreen('prescription');
    } else if (modalScreen === 'upload') {
      setModalScreen('prescription');
    } else if (modalScreen === 'preview') {
      setModalScreen('upload');
    } else if (modalScreen === 'lens-color') {
      setModalScreen('prescription-form');
    } else if (modalScreen === 'sun-protection') {
      setModalScreen('lens-color');
    } else if (modalScreen === 'tint-customization') {
      setModalScreen('sun-protection');
    } else if (modalScreen === 'polarized-tint') {
      setModalScreen('sun-protection');
    }
  };

  // Update the lens selection handler
  const handleLensSelection = (lensType) => {
    setSelectedLensType(lensType);
    setSelectedLensOption(lensType);
    
    // Navigate to prescription screen for prescription lenses
    if (lensType === 'Single Vision' || lensType === 'Bifocal' || lensType === 'Reading') {
      setIsAnimating(true);
      setTimeout(() => {
        setModalScreen('prescription');
        setIsAnimating(false);
      }, 300);
    }
    // For Non-Prescription, go to lens color selection
    else if (lensType === 'Non-Prescription') {
      setIsAnimating(true);
      setTimeout(() => {
        setModalScreen('lens-color');
        setIsAnimating(false);
      }, 300);
    }
  };
  
  // Add function to handle prescription option selection
  const handlePrescriptionOptionSelect = (option) => {
    // Handle different prescription options
    switch(option) {
      case 'previous':
        // Navigate to choose from previous prescriptions page
        navigate(`/prescriptions/previous?product=${id}&lens=${selectedLensType}`);
        break;
      case 'new':
        // Show prescription form screen
        setModalScreen('prescription-form');
        break;
      case 'scan':
        // Show upload screen
        setModalScreen('upload');
        break;
      default:
        break;
    }
    
    // Only close modal for external navigation
    if (option !== 'new' && option !== 'scan') {
      setIsLensModalOpen(false);
    }
  };
  
  // Add function to go back to lens selection
  const goBackToLensSelection = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setModalScreen('lens');
      setIsAnimating(false);
    }, 300); // Match this with the CSS transition time
  };
  
  // Add function to close prescription modal
  const closePrescriptionModal = () => {
    setIsPrescriptionModalOpen(false);
  };
  
  // Add function to handle modal open/close
  const openLensModal = () => {
    setIsLensModalOpen(true);
    
    // For sunglasses, skip lens selection and go directly to lens color
    if (product?.category?.toLowerCase() === 'sunglasses') {
      setSelectedLensType('Non-Prescription'); // Set default for sunglasses
      setModalScreen('lens-color');
    } else {
      setModalScreen('lens'); // Default lens selection screen for other categories
    }
  };
  
  const closeLensModal = () => {
    setIsLensModalOpen(false);
  };
  
  // Navigation functions for checkout flow
  const handleContinueToUsage = () => {
    console.log('Starting checkout flow - Going to checkout review');
    setIsLensModalOpen(false);
    setShowCheckoutReview(true);
  };
  
  const handleContinueToLensType = () => {
    console.log('Moving to Step 2: Lens Type Selection');
    setShowUsageSelection(false);
    setShowLensTypeSelection(true);
  };
  
  const handleContinueToPrescriptionMethod = () => {
    console.log('Moving to Step 3: Prescription Method Selection');
    setShowLensTypeSelection(false);
    setShowPrescriptionMethod(true);
  };
  
  const handleContinueToPrescriptionForm = () => {
    console.log('Moving to Step 4: Prescription Form');
    setShowPrescriptionMethod(false);
    // Clear all checkout flow states
    setShowUsageSelection(false);
    setShowLensTypeSelection(false);
    setShowPrescriptionMethod(false);
    setIsLensModalOpen(true);
    setModalScreen('prescription-form');
  };
  
  const handleContinueToCheckout = () => {
    setIsLensModalOpen(false);
    setShowCheckoutReview(true);
  };
  
  // Back navigation functions
  const handleBackToUsage = () => {
    setShowLensTypeSelection(false);
    setShowUsageSelection(true);
  };
  
  const handleBackToLensType = () => {
    setShowPrescriptionMethod(false);
    setShowLensTypeSelection(true);
  };
  
  const handleBackToPrescriptionMethod = () => {
    setIsLensModalOpen(false);
    setShowPrescriptionMethod(true);
  };
  
  // Enhanced prescription scanning function with realistic OCR simulation
  const scanPrescriptionFromImage = async () => {
    setIsScanning(true);
    
    // Simulate OCR processing delay
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    // Enhanced OCR simulation with pattern recognition and validation
    const extractPrescriptionFromImage = () => {
      // Simulate OCR text recognition patterns commonly found on prescriptions
      const prescriptionPatterns = [
        // Pattern 1: Moderate myopia with astigmatism
        {
          od: { sph: '-2.75', cyl: '-1.25', axis: '90' },
          os: { sph: '-3.00', cyl: '-0.75', axis: '85' },
          pd: '62'
        },
        // Pattern 2: Mild hyperopia
        {
          od: { sph: '+1.50', cyl: '-0.50', axis: '180' },
          os: { sph: '+1.25', cyl: '-0.25', axis: '175' },
          pd: '64'
        },
        // Pattern 3: High myopia
        {
          od: { sph: '-5.25', cyl: '-2.00', axis: '15' },
          os: { sph: '-4.75', cyl: '-1.75', axis: '20' },
          pd: '58'
        },
        // Pattern 4: Reading glasses
        {
          od: { sph: '+2.25', cyl: '0.00', axis: '--' },
          os: { sph: '+2.00', cyl: '0.00', axis: '--' },
          pd: '63'
        },
        // Pattern 5: Asymmetric prescription
        {
          od: { sph: '-1.75', cyl: '-0.75', axis: '45' },
          os: { sph: '-2.25', cyl: '-1.00', axis: '135' },
          pd: '66'
        }
      ];
      
      // Randomly select a realistic prescription pattern
      const selectedPattern = prescriptionPatterns[Math.floor(Math.random() * prescriptionPatterns.length)];
      
      // Add slight OCR "errors" to simulate real-world scanning imperfections
      const addOCRVariation = (value) => {
        if (value === '--' || value === '0.00') return value;
        const num = parseFloat(value);
        const variation = (Math.random() - 0.5) * 0.25; // ±0.125 variation
        return (num + variation).toFixed(2);
      };
      
      return {
        od: {
          sph: selectedPattern.od.sph,
          cyl: selectedPattern.od.cyl,
          axis: selectedPattern.od.axis
        },
        os: {
          sph: selectedPattern.os.sph,
          cyl: selectedPattern.os.cyl,
          axis: selectedPattern.os.axis
        },
        pd: selectedPattern.pd,
        pdRight: (parseFloat(selectedPattern.pd) / 2).toFixed(1),
        pdLeft: (parseFloat(selectedPattern.pd) / 2).toFixed(1),
        twoPDNumbers: Math.random() > 0.8 // 20% chance of dual PD
      };
    };
    
    const scannedData = extractPrescriptionFromImage();
    
    // Update prescription form with scanned data
    setPrescriptionData(scannedData);
    setIsScanning(false);
    
    // Navigate to prescription form
    setModalScreen('prescription-form');
  };
  
  // Fetch product by ID directly using the thunk
  useEffect(() => {
    setLoading(true);
    dispatch(fetchProductById(id))
      .unwrap()
      .then(productData => {
        setProduct(productData);
        // Set initial color from product's available colors
        if (productData.colors && productData.colors.length > 0) {
          setSelectedColor(productData.colors[0].name);
        } else if (productData.color) {
          setSelectedColor(productData.color);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching product:', err);
        // Set fallback product data if API fails
        setProduct({
          id: id,
          name: 'Ember Eyeglasses',
          price: 23,
          image: '/images/eyeglasses.webp',
          category: 'Prescription',
          colors: [
            { name: 'Black', hex: '#000000' },
            { name: 'Brown', hex: '#8B4513' },
            { name: 'Silver', hex: '#C0C0C0' }
          ],
          description: 'Stylish and comfortable eyeglasses perfect for everyday wear.'
        });
        setSelectedColor('Black');
        setLoading(false);
      });
  }, [id, dispatch]);

  // Load product reviews when product ID changes
  useEffect(() => {
    const loadReviews = async () => {
      if (id) {
        try {
          const reviews = await reviewService.getProductReviews(id);
          const stats = await reviewService.getReviewStats(id);
          
          setProductReviews(reviews);
          setReviewCount(stats.count);
          setAverageRating(stats.averageRating);
        } catch (error) {
          console.error('Error loading reviews:', error);
          // Fallback to empty state
          setProductReviews([]);
          setReviewCount(0);
          setAverageRating(0);
        }
      }
    };
    
    loadReviews();
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      dispatch(addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        color: selectedColor,
        size: selectedSize,
        quantity: 1
      }));
      navigate('/cart');
    }
  };

  // Get related products from Redux store
  const { items: allProducts } = useSelector(state => state.products);
  
  // Get related products - prioritize same category, then others
  let relatedProducts = [];
  
  if (allProducts.length > 0) {
    // First, get products from same category
    const sameCategoryProducts = allProducts.filter(p => 
      p.id !== product?.id && 
      p.category === product?.category
    );
    
    // Then get products from other categories
    const otherProducts = allProducts.filter(p => 
      p.id !== product?.id && 
      p.category !== product?.category
    );
    
    // Combine and limit to 8 products
    relatedProducts = [...sameCategoryProducts, ...otherProducts].slice(0, 8);
  }
  
  // Calculate pricing
  const calculateSubtotal = () => {
    let subtotal = parseFloat(product?.price) || 23; // Use actual product price
    
    // Add lens option pricing based on selections
    if (selectedLensColor === 'Transitions') {
      if (selectedTransitionsOption === 'GEN-S') {
        subtotal += 149;
      } else if (selectedTransitionsOption === 'XTRActive') {
        subtotal += 179;
      } else if (selectedTransitionsOption === 'Drivewear') {
        subtotal += 199;
      }
    } else if (selectedLensColor === 'Blue Light Filtering') {
      if (selectedBluelightOption === 'EBDBlue-360') {
        if (selectedEBDBlue360Type === '1.6') {
          subtotal += 68.95;
        } else if (selectedEBDBlue360Type === '1.74') {
          subtotal += 78.95;
        }
      } else if (selectedBluelightOption === 'SightRelax') {
        subtotal += 85.95;
      } else if (selectedBluelightOption === 'EBDBlue-Smart') {
        subtotal += 78.95;
      } else if (selectedBluelightOption === 'EBDBlue-Plus') {
        if (selectedEBDBluePlusType === '1.59') {
          subtotal += 35.95;
        } else if (selectedEBDBluePlusType === '1.5') {
          subtotal += 22.95;
        } else if (selectedEBDBluePlusType === '1.6') {
          subtotal += 58.95;
        }
      }
    } else if (selectedLensColor === 'Sun') {
      if (selectedSunOption === 'Basic') {
        subtotal += 4.95;
      } else if (selectedSunOption === 'Polarized') {
        subtotal += 89;
      }
    }
    
    return subtotal.toFixed(2);
  };

  // Define content variable and pricing logic
  let content;
  
  // Calculate pricing variables
  const originalPrice = product?.price || 23;
  const hasDiscount = product?.discount && product?.discount?.discountPercentage > 0;
  const discountedPrice = hasDiscount 
    ? originalPrice * (1 - product.discount.discountPercentage / 100)
    : originalPrice;

  // Debug: Log current state
  console.log('Current state:', {
    showUsageSelection,
    showLensTypeSelection,
    showPrescriptionMethod,
    isLensModalOpen,
    modalScreen
  });


  
  // Show checkout review if requested
  if (showCheckoutReview) {
    return (
      <PageContainer>
        <CheckoutReviewContainer>
          <ReviewTitle>Review your selections</ReviewTitle>
          <ReviewSubtitle>
            All orders include <strong>14-Day Free Returns</strong>, <strong>24/7 Customer Service</strong>.
          </ReviewSubtitle>
          
          <PrescriptionDetailsSection>
            <ReviewSectionTitle>Prescription Details</ReviewSectionTitle>
            <ReviewPrescriptionTable>
              <thead>
                <tr>
                  <th></th>
                  <th>SPH</th>
                  <th>CYL</th>
                  <th>Axis</th>
                  <th>ADD</th>
                  <th>PD</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>OD</strong></td>
                  <td>{prescriptionData.od.sph}</td>
                  <td>{prescriptionData.od.cyl}</td>
                  <td>{prescriptionData.od.axis}</td>
                  <td></td>
                  <td rowSpan="2">{prescriptionData.pd}</td>
                </tr>
                <tr>
                  <td><strong>OS</strong></td>
                  <td>{prescriptionData.os.sph}</td>
                  <td>{prescriptionData.os.cyl}</td>
                  <td>{prescriptionData.os.axis}</td>
                  <td></td>
                </tr>
              </tbody>
            </ReviewPrescriptionTable>
          </PrescriptionDetailsSection>
          
          <ReviewProductDetailsSection>
            <ProductDetailItem>
              <ProductDetailLabel>{product?.name} | {selectedColor} | {selectedSize}</ProductDetailLabel>
              <ProductDetailValue>{formatPrice(product?.price)}</ProductDetailValue>
            </ProductDetailItem>
            
            {/* Show selected lens options */}
            {selectedLensColor === 'Clear' && (
              <ProductDetailItem>
                <ProductDetailLabel>• Clear Lenses</ProductDetailLabel>
                <ProductDetailValue>Free</ProductDetailValue>
              </ProductDetailItem>
            )}
            
            {selectedLensColor === 'Transitions' && (
              <ProductDetailItem>
                <ProductDetailLabel>• Transitions® {selectedTransitionsOption === 'GEN-S' ? 'GEN S™' : selectedTransitionsOption === 'XTRActive' ? 'XTRActive®' : 'Drivewear®'}</ProductDetailLabel>
                <ProductDetailValue>
                  {selectedTransitionsOption === 'GEN-S' ? 'PKR 149' : 
                   selectedTransitionsOption === 'XTRActive' ? 'PKR 179' : 'PKR 199'}
                </ProductDetailValue>
              </ProductDetailItem>
            )}
            
            {selectedLensColor === 'Blue Light Filtering' && (
              <ProductDetailItem>
                <ProductDetailLabel>
                  • {selectedBluelightOption === 'EBDBlue-360' ? `EBDBlue 360™ ${selectedEBDBlue360Type}` :
                     selectedBluelightOption === 'SightRelax' ? 'SightRelax' :
                     selectedBluelightOption === 'EBDBlue-Smart' ? `EBDBlue Smart 1.6 (${selectedEBDBlueSmartColor})` :
                     selectedBluelightOption === 'EBDBlue-Plus' ? `EBDBlue Plus™ ${selectedEBDBluePlusType}` : 'Blue Light Filtering'}
                </ProductDetailLabel>
                <ProductDetailValue>
                  {selectedBluelightOption === 'EBDBlue-360' ? 
                    (selectedEBDBlue360Type === '1.6' ? 'PKR 68.95' : 'PKR 78.95') :
                   selectedBluelightOption === 'SightRelax' ? 'PKR 85.95' :
                   selectedBluelightOption === 'EBDBlue-Smart' ? 'PKR 78.95' :
                   selectedBluelightOption === 'EBDBlue-Plus' ? 
                    (selectedEBDBluePlusType === '1.59' ? 'PKR 35.95' : 
                     selectedEBDBluePlusType === '1.5' ? 'PKR 22.95' : 'PKR 58.95') : 'PKR 0'}
                </ProductDetailValue>
              </ProductDetailItem>
            )}
            
            {selectedLensColor === 'Sun' && (
              <ProductDetailItem>
                <ProductDetailLabel>
                  • Sun Protection ({selectedSunOption})
                  {selectedSunOption === 'Basic' && selectedBasicTintColor && ` - ${selectedBasicTintColor}`}
                  {selectedSunOption === 'Gradient' && selectedGradientColor && ` - ${selectedGradientColor} Gradient`}
                </ProductDetailLabel>
                <ProductDetailValue>
                  {selectedSunOption === 'Basic' ? 'PKR 4.95' : 
                   selectedSunOption === 'Polarized' ? 'PKR 89' : 'Free'}
                </ProductDetailValue>
              </ProductDetailItem>
            )}
          </ReviewProductDetailsSection>
          
          
          
          <PricingSection>
            <SubtotalRow>
              <span>Subtotal</span>
              <span>{formatPrice(calculateSubtotal())}</span>
            </SubtotalRow>
           
          </PricingSection>
          
          <ConfirmButton onClick={() => {
            dispatch(addToCart({
              id: product?.id || id,
              name: product?.name || 'Ember',
              price: calculateSubtotal(),
              image: product?.image || '/images/eyeglasses.webp',
              quantity: 1,
              lensType: selectedLensType,
              lensColor: selectedLensColor,
              prescription: prescriptionData
            }));
            setShowCheckoutReview(false);
            navigate('/cart');
          }}>
            Confirm & add to cart
          </ConfirmButton>
        </CheckoutReviewContainer>
      </PageContainer>
    );
  } else if (status === 'failed') {
    content = (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '50px 0' }}>
        <div style={{ textAlign: 'center', color: '#e74c3c' }}>
          <h3>Error loading product</h3>
          <p>{error || 'An unexpected error occurred'}</p>
          <button 
            onClick={() => dispatch(fetchProductById(id))}
            style={{ padding: '8px 16px', background: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '10px' }}
          >
            Try Again
          </button>
          <button 
            onClick={() => navigate('/products')}
            style={{ padding: '8px 16px', background: '#2c3e50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  } else if (!product) {
    content = (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '50px 0' }}>
        <div style={{ textAlign: 'center', color: '#e74c3c' }}>
          <h3>Product Not Found</h3>
          <p>The product you're looking for doesn't exist or has been removed.</p>
          <button 
            onClick={() => navigate('/products')}
            style={{ padding: '8px 16px', background: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  } else {
    // Main product content when everything is loaded successfully
    content = (
      <>
       
        
        <ProductLayout>
          <ImageGallery>
            {hasDiscount && <DiscountBadge>SALE {product?.discount?.discountPercentage}% OFF</DiscountBadge>}
            <MainImage>
              <img 
                src={selectedImage === 0 ? product.image : (product.gallery ? product.gallery[selectedImage-1] : productImages[selectedImage])} 
                alt={product.name} 
                style={{ opacity: isImageChanging ? 0.5 : 1 }}
              />
            </MainImage>
            
            <ThumbnailsContainer>
              {[product.image, ...(product.gallery || productImages.slice(1))].slice(0, 6).map((img, index) => (
                <Thumbnail 
                  key={index} 
                  active={selectedImage === index}
                  onClick={() => handleImageSelect(index)}
                >
                  <img src={img} alt={`${product.name} view ${index + 1}`} />
                </Thumbnail>
              ))}
            </ThumbnailsContainer>
            
           
          </ImageGallery>
          
          <ProductInfo>
            <div>
              <ProductName>{product.name}</ProductName>
              
              
              <RatingContainer>
                <EnhancedStars>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon key={star} filled={star <= Math.round(averageRating)}>★</StarIcon>
                  ))}
                </EnhancedStars>
                <ReviewCount href="#reviews">{reviewCount} Review{reviewCount !== 1 ? 's' : ''}</ReviewCount>
              </RatingContainer>
              
              <PriceContainer>
                <CurrentPrice>{formatPrice(discountedPrice)}</CurrentPrice>
                {hasDiscount && <OriginalPrice>{formatPrice(originalPrice)}</OriginalPrice>}
              </PriceContainer>
              
              {product?.colors && product.colors.length > 0 && (
                <div>
                  <AttributeLabel>Frame Color:</AttributeLabel>
                  <ColorOptions>
                    {product.colors.filter(colorOption => colorOption.name && colorOption.hex).map((colorOption, index) => (
                      <ColorOptionButton 
                        key={index}
                        selected={selectedColor === colorOption.name}
                        onClick={() => setSelectedColor(colorOption.name)}
                        color={colorOption.hex}
                      >
                        <ColorSwatch color={colorOption.hex} />
                        <ColorName>{colorOption.name}</ColorName>
                      </ColorOptionButton>
                    ))}
                  </ColorOptions>
                </div>
              )}
              
              {availableSizes && availableSizes.length > 0 && (
                <div>
                  <AttributeLabel>Size:</AttributeLabel>
                  <SizeOptions>
                    {availableSizes.map((size, index) => (
                      <SizeOption 
                        key={index}
                        selected={selectedSize === size}
                        onClick={() => setSelectedSize(size)}
                      >
                        {size}
                      </SizeOption>
                    ))}
                  </SizeOptions>
                </div>
              )}
              
              <FreeShippingBadge>
                <span className="icon">🚚</span>
                FREE SHIPPING on orders above PKR 5,000
              </FreeShippingBadge>
              
              
              
              <LensSelectionButton onClick={openLensModal}>
                <div className="lens-info">
                  <div className="lens-type">{selectedLensType || 'Choose lens type'}</div>
                  
                </div>
                <div className="arrow">→</div>
              </LensSelectionButton>
              
              
              
              
            </div>
          </ProductInfo>
        </ProductLayout>
        
        <AboutSection>
          <AboutTitle>About this product</AboutTitle>
          <TabsContainer>
            <TabsHeader>
              <Tab 
                active={activeAboutTab === 'details'} 
                onClick={() => setActiveAboutTab('details')}
              >
                Details
              </Tab>
              <Tab 
                active={activeAboutTab === 'features'} 
                onClick={() => setActiveAboutTab('features')}
              >
                Features
              </Tab>
              <Tab 
                active={activeAboutTab === 'care'} 
                onClick={() => setActiveAboutTab('care')}
              >
                Care Instructions
              </Tab>
            </TabsHeader>
            
            <AboutContent>
              <SpecsContainer>
                {activeAboutTab === 'details' && (
                  <TabContent>
                    <SpecRow>
                      <SpecLabel>Material</SpecLabel>
                      <SpecValue>{product?.material || 'Premium Acetate'}</SpecValue>
                    </SpecRow>
                    <SpecRow>
                      <SpecLabel>Shape</SpecLabel>
                      <SpecValue>{product?.shape || 'Rectangle'}</SpecValue>
                    </SpecRow>
                    <SpecRow>
                      <SpecLabel>Rim</SpecLabel>
                      <SpecValue>{product?.rim || 'Full Rim'}</SpecValue>
                    </SpecRow>
                  
                    
                    <SpecRow>
                      <SpecLabel>Weight</SpecLabel>
                      <SpecValue>{product?.weight || '28g'}</SpecValue>
                    </SpecRow>
                  </TabContent>
                )}
                
                {activeAboutTab === 'features' && (
                  <TabContent>
                    <ul>
                      <li>Lightweight and comfortable for all-day wear</li>
                      <li>Durable acetate construction</li>
                      <li>Spring hinges for enhanced flexibility</li>
                      <li>Anti-slip nose pads</li>
                      <li>Scratch-resistant coating</li>
                      <li>UV protection ready</li>
                      <li>Hypoallergenic materials</li>
                      <li>Adjustable nose pads for custom fit</li>
                    </ul>
                  </TabContent>
                )}
                
                {activeAboutTab === 'care' && (
                  <TabContent>
                    <p>
                      Clean with a microfiber cloth and lens cleaner. Store in the provided case when not in use. 
                      Avoid exposure to extreme temperatures and chemicals.
                    </p>
                    <p>
                      <strong>Daily Care:</strong> Rinse with lukewarm water and dry with a clean microfiber cloth.
                    </p>
                    <p>
                      <strong>Storage:</strong> Always store in the protective case to prevent scratches and damage.
                    </p>
                    <p>
                      <strong>Avoid:</strong> Paper towels, clothing, or tissues for cleaning as they may scratch the lenses.
                    </p>
                  </TabContent>
                )}
              </SpecsContainer>
              
              
            </AboutContent>
          </TabsContainer>
        </AboutSection>
        
        <RelatedProductsSection>
          <RelatedProductsTitle>You may also like</RelatedProductsTitle>
          <RelatedProductsGrid>
            {relatedProducts.map((relatedProduct) => (
              <RelatedProductCard key={relatedProduct.id} onClick={() => navigate(`/products/${relatedProduct.id}`)}>
                {relatedProduct.discount?.hasDiscount && <DiscountBadge>{relatedProduct.discount.discountPercentage}% OFF</DiscountBadge>}
                
                
                <ProductImage>
                  <img src={relatedProduct.image} alt={relatedProduct.name} />
                  
                </ProductImage>
                
                <ProductContent>
                  <ProductTitle>
                    {relatedProduct.name}
                  </ProductTitle>
                  <ProductBrand>{relatedProduct.brand || 'EyeBuyDirect'}</ProductBrand>
                  <ProductPrice>{formatPrice(relatedProduct.price)}</ProductPrice>
                  <ColorOptions>
                    {relatedProduct.colors && relatedProduct.colors.slice(0, 4).map((color, index) => (
                      <ColorDot 
                        key={index} 
                        color={color.hex || color} 
                        title={color.name || `Color ${index + 1}`}
                      />
                    ))}
                  </ColorOptions>
                </ProductContent>
              </RelatedProductCard>
            ))}
          </RelatedProductsGrid>
        </RelatedProductsSection>
      </>
    );
  }

  // Show checkout review if requested
  if (showCheckoutReview) {
    return (
      <PageContainer>
        <CheckoutReviewContainer>
          <ReviewTitle>Review your selections</ReviewTitle>
          <ReviewSubtitle>
            All orders include <strong>14-Day Free Returns</strong>, <strong>24/7 Customer Service</strong>
          </ReviewSubtitle>
          
          <PrescriptionDetailsSection>
            <ReviewSectionTitle>Prescription Details</ReviewSectionTitle>
            <ReviewPrescriptionTable>
              <thead>
                <tr>
                  <th></th>
                  <th>SPH</th>
                  <th>CYL</th>
                  <th>Axis</th>
                  <th>ADD</th>
                  <th>PD</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>OD</strong></td>
                  <td>{prescriptionData.od.sph}</td>
                  <td>{prescriptionData.od.cyl}</td>
                  <td>{prescriptionData.od.axis}</td>
                  <td></td>
                  <td rowSpan="2">{prescriptionData.pd}</td>
                </tr>
                <tr>
                  <td><strong>OS</strong></td>
                  <td>{prescriptionData.os.sph}</td>
                  <td>{prescriptionData.os.cyl}</td>
                  <td>{prescriptionData.os.axis}</td>
                  <td></td>
                </tr>
              </tbody>
            </ReviewPrescriptionTable>
          </PrescriptionDetailsSection>
          
          <ReviewProductDetailsSection>
            <ProductDetailItem>
              <ProductDetailLabel>{product?.name} | {selectedColor} | {selectedSize}</ProductDetailLabel>
              <ProductDetailValue>{formatPrice(product?.price)}</ProductDetailValue>
            </ProductDetailItem>
            
            {/* Show selected lens options */}
            {selectedLensColor === 'Clear' && (
              <ProductDetailItem>
                <ProductDetailLabel>• Clear Lenses</ProductDetailLabel>
                <ProductDetailValue>Free</ProductDetailValue>
              </ProductDetailItem>
            )}
            
            {selectedLensColor === 'Transitions' && (
              <ProductDetailItem>
                <ProductDetailLabel>• Transitions® {selectedTransitionsOption === 'GEN-S' ? 'GEN S™' : selectedTransitionsOption === 'XTRActive' ? 'XTRActive®' : 'Drivewear®'}</ProductDetailLabel>
                <ProductDetailValue>
                  {selectedTransitionsOption === 'GEN-S' ? 'PKR 149' : 
                   selectedTransitionsOption === 'XTRActive' ? 'PKR 179' : 'PKR 199'}
                </ProductDetailValue>
              </ProductDetailItem>
            )}
            
            {selectedLensColor === 'Blue Light Filtering' && (
              <ProductDetailItem>
                <ProductDetailLabel>
                  • {selectedBluelightOption === 'EBDBlue-360' ? `EBDBlue 360™ ${selectedEBDBlue360Type}` :
                     selectedBluelightOption === 'SightRelax' ? 'SightRelax' :
                     selectedBluelightOption === 'EBDBlue-Smart' ? `EBDBlue Smart 1.6 (${selectedEBDBlueSmartColor})` :
                     selectedBluelightOption === 'EBDBlue-Plus' ? `EBDBlue Plus™ ${selectedEBDBluePlusType}` : 'Blue Light Filtering'}
                </ProductDetailLabel>
                <ProductDetailValue>
                  {selectedBluelightOption === 'EBDBlue-360' ? 
                    (selectedEBDBlue360Type === '1.6' ? 'PKR 68.95' : 'PKR 78.95') :
                   selectedBluelightOption === 'SightRelax' ? 'PKR 85.95' :
                   selectedBluelightOption === 'EBDBlue-Smart' ? 'PKR 78.95' :
                   selectedBluelightOption === 'EBDBlue-Plus' ? 
                    (selectedEBDBluePlusType === '1.59' ? 'PKR 35.95' : 
                     selectedEBDBluePlusType === '1.5' ? 'PKR 22.95' : 'PKR 58.95') : 'PKR 0'}
                </ProductDetailValue>
              </ProductDetailItem>
            )}
            
            {selectedLensColor === 'Sun' && (
              <ProductDetailItem>
                <ProductDetailLabel>
                  • Sun Protection ({selectedSunOption})
                  {selectedSunOption === 'Basic' && selectedBasicTintColor && ` - ${selectedBasicTintColor}`}
                  {selectedSunOption === 'Gradient' && selectedGradientColor && ` - ${selectedGradientColor} Gradient`}
                </ProductDetailLabel>
                <ProductDetailValue>
                  {selectedSunOption === 'Basic' ? 'PKR 4.95' : 
                   selectedSunOption === 'Polarized' ? 'PKR 89' : 'Free'}
                </ProductDetailValue>
              </ProductDetailItem>
            )}
          </ReviewProductDetailsSection>
          
          
          
          <PricingSection>
            <SubtotalRow>
              <span>Subtotal</span>
              <span>{formatPrice(calculateSubtotal())}</span>
            </SubtotalRow>
            <PaymentInfo>
              4 interest-free payments of {formatPrice(calculateSubtotal() / 4)} 🅂 Afterpay Klarna ⓘ
            </PaymentInfo>
          </PricingSection>
          
          <ConfirmButton onClick={() => {
            dispatch(addToCart({
              id: product?.id || id,
              name: product?.name || 'Ember',
              price: calculateSubtotal(),
              image: product?.image || '/images/eyeglasses.webp',
              quantity: 1,
              lensType: selectedLensType,
              lensColor: selectedLensColor,
              prescription: prescriptionData
            }));
            setShowCheckoutReview(false);
            navigate('/cart');
          }}>
            Confirm & add to cart
          </ConfirmButton>
        </CheckoutReviewContainer>
      </PageContainer>
    );
  }
  
  // Always return the PageContainer with the appropriate content
  return (
    <PageContainer>
      {content}
      
      {/* Reviews Section */}
      <ReviewsSection>
        <ReviewsTitle>Customer Reviews</ReviewsTitle>
        
        {/* Add Review Form */}
        <ReviewFormContainer>
          <ReviewFormTitle>Write a Review</ReviewFormTitle>
          <ReviewForm onSubmit={handleReviewSubmit}>
            <ReviewFormRow>
              <ReviewInput 
                type="text" 
                placeholder="Your Name" 
                value={reviewName}
                onChange={(e) => setReviewName(e.target.value)}
                required 
              />
              <StarRatingContainer>
                <StarRatingLabel>Rating:</StarRatingLabel>
                <StarRating>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star}
                      filled={star <= reviewRating}
                      onClick={() => handleStarClick(star)}
                    >
                      ★
                    </Star>
                  ))}
                </StarRating>
              </StarRatingContainer>
            </ReviewFormRow>
            
            <ReviewTextarea 
              placeholder="Share your experience with this product..."
              rows="4"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              required
            />
            
            <ReviewSubmitButton type="submit">
              Submit Review
            </ReviewSubmitButton>
          </ReviewForm>
        </ReviewFormContainer>
        
        {/* Display product reviews */}
        {productReviews.length > 0 && (
          <ReviewsList>
            {productReviews.map((review) => (
              <ReviewItem key={review.id}>
                <ReviewHeader>
                  <ReviewerName>{review.name}</ReviewerName>
                  <ReviewRating>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} filled={star <= review.rating}>★</Star>
                    ))}
                  </ReviewRating>
                </ReviewHeader>
                <ReviewText>{review.text}</ReviewText>
                <ReviewDate>{review.date}</ReviewDate>
              </ReviewItem>
            ))}
          </ReviewsList>
        )}
        
        {/* Display submitted reviews */}
        {reviews.length > 0 && (
          <ReviewsList>
            {reviews.map((review) => (
              <ReviewItem key={review.id}>
                <ReviewHeader>
                  <ReviewerName>{review.name}</ReviewerName>
                  <ReviewRating>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} filled={star <= review.rating}>★</Star>
                    ))}
                  </ReviewRating>
                </ReviewHeader>
                <ReviewText>{review.text}</ReviewText>
                <ReviewDate>{review.date}</ReviewDate>
              </ReviewItem>
            ))}
          </ReviewsList>
        )}
      </ReviewsSection>
      
      {/* Lens Selection Modal with sliding screens */}
      <LensSelectionModal isOpen={isLensModalOpen}>
        <ModalContainer>
          <ModalHeader>
            {modalScreen === 'lens' ? (
              <div className="back-button" onClick={closeLensModal}>back to {product?.name}</div>
            ) : (
              <div className="back-button" onClick={goBackToLensSelection}>back to lens selection</div>
            )}
            <div className="close-button" onClick={closeLensModal}>×</div>
          </ModalHeader>
          
          <ModalContent>
            {/* Left container - Product details */}
            <ProductContainer>
              <ProductDisplay>
                <img src={product?.image} alt={product?.name} />
                <div className="product-name">{product?.name}</div>
                <div className="product-type">{product?.category} Eyeglasses</div>
                <div style={{ fontWeight: 'bold', color: '#48b2ee', fontSize: '1.2rem', marginTop: '1rem' }}>
                  {product ? formatPrice(product.price) : ''}
                </div>
              </ProductDisplay>
            </ProductContainer>
            
            {/* Right container with conditional screens */}
            <LensOptionsContainer>
              <ModalScreensContainer>
                {/* Lens Selection Screen */}
                <ModalScreen active={modalScreen === 'lens'}>
                  <LensUsageTitle>Choose your usage</LensUsageTitle>
                  
                  <LensOptionCards>
                    <LensOptionCard 
                      selected={selectedLensOption === 'Single Vision'}
                      onClick={() => handleLensSelection('Single Vision')}
                    >
                      <LensOptionTitle>Single Vision (Distance)</LensOptionTitle>
                      <LensOptionDescription>General use lenses for common prescriptions and seeing things from distance.</LensOptionDescription>
                    </LensOptionCard>
                    
                    <LensOptionCard 
                      selected={selectedLensOption === 'Bifocal'}
                      onClick={() => handleLensSelection('Bifocal')}
                    >
                      <LensOptionTitle>Bifocal & Progressive</LensOptionTitle>
                      <LensOptionDescription>One pair of glasses corrects vision at near, middle, and far distances.</LensOptionDescription>
                    </LensOptionCard>
                    
                    <LensOptionCard 
                      selected={selectedLensOption === 'Reading'}
                      onClick={() => handleLensSelection('Reading')}
                    >
                      <LensOptionTitle>Reading</LensOptionTitle>
                      <LensOptionDescription>Lenses that magnify to assist with reading.</LensOptionDescription>
                    </LensOptionCard>
                    
                    <LensOptionCard 
                      selected={selectedLensOption === 'Non-Prescription'}
                      onClick={() => handleLensSelection('Non-Prescription')}
                    >
                      <LensOptionTitle>Non-Prescription</LensOptionTitle>
                      <LensOptionDescription>Basic lenses with no vision correction.</LensOptionDescription>
                    </LensOptionCard>
                  </LensOptionCards>
                  
                  <ModalButtonContainer>
                    <BackButton onClick={closeLensModal}>Back</BackButton>
                    <ContinueButton 
                      onClick={handleContinueToUsage}
                      disabled={!selectedLensOption}
                    >
                      Continue
                    </ContinueButton>
                  </ModalButtonContainer>
                </ModalScreen>
                
                {/* Prescription Options Screen */}
                <ModalScreen active={modalScreen === 'prescription'}>
                  <BackButton onClick={handleBackNavigation}>
                    ← Back
                  </BackButton>
                  <PrescriptionTitle>How would you like to add your prescription?</PrescriptionTitle>
                  
                  <PrescriptionOptionCard onClick={() => handlePrescriptionOptionSelect('previous')}>
                    <div className="icon">⏱️</div>
                    <div className="content">Choose from previous</div>
                  </PrescriptionOptionCard>
                  
                  <PrescriptionOptionCard onClick={() => handlePrescriptionOptionSelect('new')}>
                    <div className="icon">📝</div>
                    <div className="content">Add new</div>
                  </PrescriptionOptionCard>
                  
                  <PrescriptionOptionCard onClick={() => handlePrescriptionOptionSelect('scan')}>
                    <div className="icon">📷</div>
                    <div className="content">Scan your prescription</div>
                    <span className="new-badge">New</span>
                  </PrescriptionOptionCard>
                </ModalScreen>
                
                {/* Prescription Form Screen */}
                <ModalScreen active={modalScreen === 'prescription-form'}>
                  <PrescriptionForm>
                    <BackButton onClick={handleBackNavigation}>
                      ← Back
                    </BackButton>
                    <PrescriptionFormTitle>Enter your prescription</PrescriptionFormTitle>
                    
                    <PrescriptionTable>
                        <TableHeader>
                          <div></div>
                          <div>SPH</div>
                          <div>CYL</div>
                          <div>AXIS</div>
                        </TableHeader>
                        
                        <TableRow>
                          <EyeLabel>
                            <div><strong>OD</strong></div>
                            <div className="sub-label">right eye</div>
                          </EyeLabel>
                          <PrescriptionSelect 
                            value={prescriptionData.od.sph}
                            onChange={(e) => setPrescriptionData({
                              ...prescriptionData,
                              od: { ...prescriptionData.od, sph: e.target.value }
                            })}
                          >
                            <option value="+6.00">+6.00</option>
                            <option value="+5.75">+5.75</option>
                            <option value="+5.50">+5.50</option>
                            <option value="+5.25">+5.25</option>
                            <option value="+5.00">+5.00</option>
                            <option value="+4.75">+4.75</option>
                            <option value="+4.50">+4.50</option>
                            <option value="+4.25">+4.25</option>
                            <option value="+4.00">+4.00</option>
                            <option value="+3.75">+3.75</option>
                            <option value="+3.50">+3.50</option>
                            <option value="+3.25">+3.25</option>
                            <option value="+3.00">+3.00</option>
                            <option value="+2.75">+2.75</option>
                            <option value="+2.50">+2.50</option>
                            <option value="+2.25">+2.25</option>
                            <option value="+2.00">+2.00</option>
                            <option value="+1.75">+1.75</option>
                            <option value="+1.50">+1.50</option>
                            <option value="+1.25">+1.25</option>
                            <option value="+1.00">+1.00</option>
                            <option value="+0.75">+0.75</option>
                            <option value="+0.50">+0.50</option>
                            <option value="+0.25">+0.25</option>
                            <option value="0.00">0.00</option>
                            <option value="-0.25">-0.25</option>
                            <option value="-0.50">-0.50</option>
                            <option value="-0.75">-0.75</option>
                            <option value="-1.00">-1.00</option>
                            <option value="-1.25">-1.25</option>
                            <option value="-1.50">-1.50</option>
                            <option value="-1.75">-1.75</option>
                            <option value="-2.00">-2.00</option>
                            <option value="-2.25">-2.25</option>
                            <option value="-2.50">-2.50</option>
                            <option value="-2.75">-2.75</option>
                            <option value="-3.00">-3.00</option>
                            <option value="-3.25">-3.25</option>
                            <option value="-3.50">-3.50</option>
                            <option value="-3.75">-3.75</option>
                            <option value="-4.00">-4.00</option>
                            <option value="-4.25">-4.25</option>
                            <option value="-4.50">-4.50</option>
                            <option value="-4.75">-4.75</option>
                            <option value="-5.00">-5.00</option>
                            <option value="-5.25">-5.25</option>
                            <option value="-5.50">-5.50</option>
                            <option value="-5.75">-5.75</option>
                            <option value="-6.00">-6.00</option>
                            <option value="-6.25">-6.25</option>
                            <option value="-6.50">-6.50</option>
                            <option value="-6.75">-6.75</option>
                            <option value="-7.00">-7.00</option>
                            <option value="-7.25">-7.25</option>
                            <option value="-7.50">-7.50</option>
                            <option value="-7.75">-7.75</option>
                            <option value="-8.00">-8.00</option>
                          </PrescriptionSelect>
                          <PrescriptionSelect 
                            value={prescriptionData.od.cyl}
                            onChange={(e) => setPrescriptionData({
                              ...prescriptionData,
                              od: { ...prescriptionData.od, cyl: e.target.value }
                            })}
                          >
                            <option value="0.00">0.00</option>
                            <option value="-0.25">-0.25</option>
                            <option value="-0.50">-0.50</option>
                            <option value="-0.75">-0.75</option>
                            <option value="-1.00">-1.00</option>
                            <option value="-1.25">-1.25</option>
                            <option value="-1.50">-1.50</option>
                            <option value="-1.75">-1.75</option>
                            <option value="-2.00">-2.00</option>
                            <option value="-2.25">-2.25</option>
                            <option value="-2.50">-2.50</option>
                            <option value="-2.75">-2.75</option>
                            <option value="-3.00">-3.00</option>
                          </PrescriptionSelect>
                          <PrescriptionSelect 
                            value={prescriptionData.od.axis}
                            onChange={(e) => setPrescriptionData({
                              ...prescriptionData,
                              od: { ...prescriptionData.od, axis: e.target.value }
                            })}
                          >
                            <option value="--">--</option>
                            <option value="1">1</option>
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="15">15</option>
                            <option value="20">20</option>
                            <option value="25">25</option>
                            <option value="30">30</option>
                            <option value="35">35</option>
                            <option value="40">40</option>
                            <option value="45">45</option>
                            <option value="50">50</option>
                            <option value="55">55</option>
                            <option value="60">60</option>
                            <option value="65">65</option>
                            <option value="70">70</option>
                            <option value="75">75</option>
                            <option value="80">80</option>
                            <option value="85">85</option>
                            <option value="90">90</option>
                            <option value="95">95</option>
                            <option value="100">100</option>
                            <option value="105">105</option>
                            <option value="110">110</option>
                            <option value="115">115</option>
                            <option value="120">120</option>
                            <option value="125">125</option>
                            <option value="130">130</option>
                            <option value="135">135</option>
                            <option value="140">140</option>
                            <option value="145">145</option>
                            <option value="150">150</option>
                            <option value="155">155</option>
                            <option value="160">160</option>
                            <option value="165">165</option>
                            <option value="170">170</option>
                            <option value="175">175</option>
                            <option value="180">180</option>
                          </PrescriptionSelect>
                        </TableRow>
                        
                        <TableRow>
                          <EyeLabel>
                            <div><strong>OS</strong></div>
                            <div className="sub-label">left eye</div>
                          </EyeLabel>
                          <PrescriptionSelect 
                            value={prescriptionData.os.sph}
                            onChange={(e) => setPrescriptionData({
                              ...prescriptionData,
                              os: { ...prescriptionData.os, sph: e.target.value }
                            })}
                          >
                            <option value="+6.00">+6.00</option>
                            <option value="+5.75">+5.75</option>
                            <option value="+5.50">+5.50</option>
                            <option value="+5.25">+5.25</option>
                            <option value="+5.00">+5.00</option>
                            <option value="+4.75">+4.75</option>
                            <option value="+4.50">+4.50</option>
                            <option value="+4.25">+4.25</option>
                            <option value="+4.00">+4.00</option>
                            <option value="+3.75">+3.75</option>
                            <option value="+3.50">+3.50</option>
                            <option value="+3.25">+3.25</option>
                            <option value="+3.00">+3.00</option>
                            <option value="+2.75">+2.75</option>
                            <option value="+2.50">+2.50</option>
                            <option value="+2.25">+2.25</option>
                            <option value="+2.00">+2.00</option>
                            <option value="+1.75">+1.75</option>
                            <option value="+1.50">+1.50</option>
                            <option value="+1.25">+1.25</option>
                            <option value="+1.00">+1.00</option>
                            <option value="+0.75">+0.75</option>
                            <option value="+0.50">+0.50</option>
                            <option value="+0.25">+0.25</option>
                            <option value="0.00">0.00</option>
                            <option value="-0.25">-0.25</option>
                            <option value="-0.50">-0.50</option>
                            <option value="-0.75">-0.75</option>
                            <option value="-1.00">-1.00</option>
                            <option value="-1.25">-1.25</option>
                            <option value="-1.50">-1.50</option>
                            <option value="-1.75">-1.75</option>
                            <option value="-2.00">-2.00</option>
                            <option value="-2.25">-2.25</option>
                            <option value="-2.50">-2.50</option>
                            <option value="-2.75">-2.75</option>
                            <option value="-3.00">-3.00</option>
                          </PrescriptionSelect>
                          <PrescriptionSelect 
                            value={prescriptionData.os.cyl}
                            onChange={(e) => setPrescriptionData({
                              ...prescriptionData,
                              os: { ...prescriptionData.os, cyl: e.target.value }
                            })}
                          >
                            <option value="0.00">0.00</option>
                            <option value="-0.25">-0.25</option>
                            <option value="-0.50">-0.50</option>
                            <option value="-0.75">-0.75</option>
                            <option value="-1.00">-1.00</option>
                            <option value="-1.25">-1.25</option>
                            <option value="-1.50">-1.50</option>
                            <option value="-1.75">-1.75</option>
                            <option value="-2.00">-2.00</option>
                            <option value="-2.25">-2.25</option>
                            <option value="-2.50">-2.50</option>
                            <option value="-2.75">-2.75</option>
                            <option value="-3.00">-3.00</option>
                          </PrescriptionSelect>
                          <PrescriptionSelect 
                            value={prescriptionData.os.axis}
                            onChange={(e) => setPrescriptionData({
                              ...prescriptionData,
                              os: { ...prescriptionData.os, axis: e.target.value }
                            })}
                          >
                            <option value="--">--</option>
                            <option value="1">1</option>
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="15">15</option>
                            <option value="20">20</option>
                            <option value="25">25</option>
                            <option value="30">30</option>
                            <option value="35">35</option>
                            <option value="40">40</option>
                            <option value="45">45</option>
                            <option value="50">50</option>
                            <option value="55">55</option>
                            <option value="60">60</option>
                            <option value="65">65</option>
                            <option value="70">70</option>
                            <option value="75">75</option>
                            <option value="80">80</option>
                            <option value="85">85</option>
                            <option value="90">90</option>
                            <option value="95">95</option>
                            <option value="100">100</option>
                            <option value="105">105</option>
                            <option value="110">110</option>
                            <option value="115">115</option>
                            <option value="120">120</option>
                            <option value="125">125</option>
                            <option value="130">130</option>
                            <option value="135">135</option>
                            <option value="140">140</option>
                            <option value="145">145</option>
                            <option value="150">150</option>
                            <option value="155">155</option>
                            <option value="160">160</option>
                            <option value="165">165</option>
                            <option value="170">170</option>
                            <option value="175">175</option>
                            <option value="180">180</option>
                          </PrescriptionSelect>
                        </TableRow>
                        
                        <PDSection>
                          <EyeLabel><strong>PD</strong></EyeLabel>
                          {!prescriptionData.twoPDNumbers ? (
                            <PDInput 
                              type="number"
                              value={prescriptionData.pd}
                              onChange={(e) => setPrescriptionData({
                                ...prescriptionData,
                                pd: e.target.value
                              })}
                            />
                          ) : (
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <PDInput 
                                type="number"
                                placeholder="Right"
                                value={prescriptionData.pdRight}
                                onChange={(e) => setPrescriptionData({
                                  ...prescriptionData,
                                  pdRight: e.target.value
                                })}
                              />
                              <PDInput 
                                type="number"
                                placeholder="Left"
                                value={prescriptionData.pdLeft}
                                onChange={(e) => setPrescriptionData({
                                  ...prescriptionData,
                                  pdLeft: e.target.value
                                })}
                              />
                            </div>
                          )}
                          <div></div>
                        </PDSection>
                        
                        <CheckboxContainer>
                          <input 
                            type="checkbox" 
                            id="twoPD"
                            checked={prescriptionData.twoPDNumbers}
                            onChange={(e) => setPrescriptionData({
                              ...prescriptionData,
                              twoPDNumbers: e.target.checked
                            })}
                          />
                          <label htmlFor="twoPD">2 PD numbers</label>
                        </CheckboxContainer>
                      </PrescriptionTable>
                      
                      <SaveContinueButton onClick={() => setModalScreen('lens-color')}>
                        Save & Continue
                      </SaveContinueButton>
                    </PrescriptionForm>
                </ModalScreen>
                
                {/* Upload Prescription Screen */}
                <ModalScreen active={modalScreen === 'upload'}>
                  <UploadContainer>
                    <BackButton onClick={handleBackNavigation}>
                      ← Back
                    </BackButton>
                    <UploadTitle>
                      <NewBadge>New</NewBadge>
                      Scan your prescription
                    </UploadTitle>
                    
                    <UploadSubtitle>
                      Take a photo of your prescription or choose a file.
                    </UploadSubtitle>
                    
                    <UploadArea onClick={() => document.getElementById('fileInput').click()}>
                      <UploadIcon>📤</UploadIcon>
                      <UploadText>jpeg, png, pdf. max 10 MB</UploadText>
                    </UploadArea>
                    
                    <HiddenFileInput
                      id="fileInput"
                      type="file"
                      accept=".jpeg,.jpg,.png,.pdf"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setUploadedFile(file);
                          const imageUrl = URL.createObjectURL(file);
                          setPreviewImageUrl(imageUrl);
                          setModalScreen('preview');
                        }
                      }}
                    />
                    
                    <CameraButton onClick={() => {
                      // Handle camera functionality
                      console.log('Open camera');
                    }}>
                      Or use camera
                    </CameraButton>
                  </UploadContainer>
                </ModalScreen>
                
                {/* Image Preview Screen */}
                <ModalScreen active={modalScreen === 'preview'}>
                  <PreviewContainer>
                    <BackButton onClick={handleBackNavigation}>
                      ← Back
                    </BackButton>
                    <PreviewTitle>
                      <NewBadge>New</NewBadge>
                      Scan your prescription
                    </PreviewTitle>
                    
                    <PreviewSubtitle>
                      Review your prescription image before scanning.
                    </PreviewSubtitle>
                    
                    {previewImageUrl && (
                      <ImagePreviewContainer>
                        <PreviewImage src={previewImageUrl} alt="Prescription preview" />
                        <RotateButton>
                          Rotate ↻
                        </RotateButton>
                      </ImagePreviewContainer>
                    )}
                    
                    <StartScanningButton 
                      disabled={isScanning}
                      onClick={scanPrescriptionFromImage}
                    >
                      {isScanning ? 'Scanning prescription...' : 'Start scanning'}
                    </StartScanningButton>
                    
                    <ChooseDifferentFileButton onClick={() => setModalScreen('upload')}>
                      Choose a different file
                    </ChooseDifferentFileButton>
                  </PreviewContainer>
                </ModalScreen>
                
                {/* Lens Color Selection Screen */}
                <ModalScreen active={modalScreen === 'lens-color'}>
                  <LensColorContainer>
                    <BackButton onClick={handleBackNavigation}>
                      ← Back
                    </BackButton>
                    <LensColorTitle>Choose Lens Type</LensColorTitle>
                    
                    <LensColorOption 
                      selected={selectedLensColor === 'Clear'}
                      onClick={() => setSelectedLensColor('Clear')}
                    >
                      <LensColorIcon color="transparent">👁️</LensColorIcon>
                      <LensColorInfo>
                        <LensColorName>Clear</LensColorName>
                        <LensColorDescription>
                          Transparent lenses for enhanced clarity and everyday use.
                        </LensColorDescription>
                      </LensColorInfo>
                    </LensColorOption>
                    
                    <LensColorOption 
                      selected={selectedLensColor === 'Blue Light Filtering'}
                      onClick={() => {
                        setSelectedLensColor('Blue Light Filtering');
                        setModalScreen('blue-light-options');
                      }}
                    >
                      <LensColorIcon color="#4A90E2">☀️</LensColorIcon>
                      <LensColorInfo>
                        <LensColorName>Blue Light Filtering</LensColorName>
                        <LensColorDescription>
                          Lenses that designed to reduce exposure to blue-violet light from sun and artificial sources (screens, LEDs, digital devices, etc.).
                        </LensColorDescription>
                      </LensColorInfo>
                    </LensColorOption>
                    
                    <LensColorOption 
                      selected={selectedLensColor === 'Transitions'}
                      onClick={() => {
                        setSelectedLensColor('Transitions');
                        setModalScreen('transitions-options');
                      }}
                    >
                      <LensColorIcon color="#6B7280">🔄</LensColorIcon>
                      <LensColorInfo>
                        <LensColorName>
                          Transitions® & Photochromic
                         
                        </LensColorName>
                        <LensColorDescription>
                          2-in-1 lenses that automatically darken when exposed to direct sunlight.
                        </LensColorDescription>
                      </LensColorInfo>
                    </LensColorOption>
                    
                    <LensColorOption 
                      selected={selectedLensColor === 'Sun'}
                      onClick={() => {
                        setSelectedLensColor('Sun');
                        setModalScreen('sun-protection');
                      }}
                    >
                      <LensColorIcon color="#374151">🕶️</LensColorIcon>
                      <LensColorInfo>
                        <LensColorName>Sun</LensColorName>
                        <LensColorDescription>
                          Color tinted lenses with UV protection and polarized options to reduce glare.
                        </LensColorDescription>
                      </LensColorInfo>
                    </LensColorOption>
                    
                    <ContinueToCheckoutButton onClick={handleContinueToUsage}>
                      Continue to checkout
                    </ContinueToCheckoutButton>
                  </LensColorContainer>
                </ModalScreen>
                
                {/* Transitions® Options Screen */}
                <ModalScreen active={modalScreen === 'transitions-options'}>
                  <SunProtectionContainer>
                    <BackButton onClick={handleBackNavigation}>
                      ← Back
                    </BackButton>
                    <SunProtectionTitle>Transitions® & Photochromic</SunProtectionTitle>
                    
                    <SunProtectionOption 
                      selected={selectedTransitionsOption === 'GEN-S'}
                      onClick={() => {
                        setSelectedTransitionsOption('GEN-S');
                      }}
                    >
                      <SunProtectionIcon color="#6B7280">🔄</SunProtectionIcon>
                      <SunProtectionInfo>
                        <SunProtectionHeader>
                          <SunProtectionName>
                            Transitions® GEN S™ <InfoIcon>i</InfoIcon>
                            <span style={{backgroundColor: '#17a2b8', color: 'white', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', marginLeft: '8px'}}>New</span>
                          </SunProtectionName>
                          <SunProtectionPrice>PKR 149</SunProtectionPrice>
                        </SunProtectionHeader>
                        <SunProtectionDescription>
                          Perfect everyday lenses that are ultra responsive, fading back 2x faster than previous generations, with a spectacular color palette and HD vision at speed of your life.
                        </SunProtectionDescription>
                      </SunProtectionInfo>
                    </SunProtectionOption>
                    
                    <SunProtectionOption 
                      selected={selectedTransitionsOption === 'XTRActive'}
                      onClick={() => {
                        setSelectedTransitionsOption('XTRActive');
                      }}
                    >
                      <SunProtectionIcon color="#4F46E5">🔄</SunProtectionIcon>
                      <SunProtectionInfo>
                        <SunProtectionHeader>
                          <SunProtectionName>
                            Transitions® XTRActive® <InfoIcon>i</InfoIcon>
                            <span style={{backgroundColor: '#007bff', color: 'white', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', marginLeft: '8px'}}>Top pick</span>
                          </SunProtectionName>
                          <SunProtectionPrice>PKR 179</SunProtectionPrice>
                        </SunProtectionHeader>
                        <SunProtectionDescription>
                          The best extra darkness and protection for light-sensitive wearers. Lens activates outdoors, in the car, and in hot temperatures while indoor clarity is clear with a hint of protective tint.
                        </SunProtectionDescription>
                      </SunProtectionInfo>
                    </SunProtectionOption>
                    
                    <SunProtectionOption 
                      selected={selectedTransitionsOption === 'Drivewear'}
                      onClick={() => {
                        setSelectedTransitionsOption('Drivewear');
                      }}
                    >
                      <SunProtectionIcon color="#059669">🚗</SunProtectionIcon>
                      <SunProtectionInfo>
                        <SunProtectionHeader>
                          <SunProtectionName>
                            Transitions® Drivewear® <InfoIcon>i</InfoIcon>
                          </SunProtectionName>
                          <SunProtectionPrice>PKR 199</SunProtectionPrice>
                        </SunProtectionHeader>
                        <SunProtectionDescription>
                          Best adaptive sunglass lenses for driving that change color according to environment with UV and polarized protection for comfort and safety behind the wheel.
                        </SunProtectionDescription>
                      </SunProtectionInfo>
                    </SunProtectionOption>
                    
                    <ContinueToCheckoutButton onClick={handleContinueToUsage}>
                      Continue to checkout
                    </ContinueToCheckoutButton>
                  </SunProtectionContainer>
                </ModalScreen>
                
                {/* Blue Light Filtering Options Screen */}
                <ModalScreen active={modalScreen === 'blue-light-options'}>
                  <SunProtectionContainer>
                    <BackButton onClick={handleBackNavigation}>
                      ← Back
                    </BackButton>
                    <SunProtectionTitle>Blue Light Filtering</SunProtectionTitle>
                    
                    <SunProtectionOption 
                      selected={selectedBluelightOption === 'EBDBlue-360'}
                      onClick={() => {
                        setSelectedBluelightOption('EBDBlue-360');
                      }}
                    >
                      <SunProtectionIcon color="#4A90E2">🛡️</SunProtectionIcon>
                      <SunProtectionInfo>
                        <SunProtectionHeader>
                          <SunProtectionName>
                            EBDBlue 360™ <InfoIcon>i</InfoIcon>
                            <span style={{backgroundColor: '#007bff', color: 'white', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', marginLeft: '8px'}}>Top pick</span>
                          </SunProtectionName>
                          <SunProtectionPrice>From PKR 68.95</SunProtectionPrice>
                        </SunProtectionHeader>
                        <SunProtectionDescription>
                          Lenses that offer clarity around the clock by blocking 100% of UV rays during the day, filtering blue-violet light, and reducing glare at night.
                        </SunProtectionDescription>
                        
                        {selectedBluelightOption === 'EBDBlue-360' && (
                          <div style={{marginTop: '16px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0'}}>
                            <div style={{fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#374151'}}>
                              Choose Lens Thickness:
                            </div>
                            <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                              <div 
                                style={{
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'space-between',
                                  padding: '8px 12px', 
                                  backgroundColor: selectedEBDBlue360Type === '1.6' ? '#dbeafe' : 'white',
                                  border: selectedEBDBlue360Type === '1.6' ? '2px solid #3b82f6' : '1px solid #d1d5db',
                                  borderRadius: '6px',
                                  cursor: 'pointer'
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedEBDBlue360Type('1.6');
                                }}
                              >
                                <span style={{fontSize: '13px', color: '#374151'}}>EBDBlue 360 1.6 <span style={{color: '#6b7280'}}>ⓘ</span></span>
                                <span style={{fontSize: '13px', fontWeight: '600', color: '#374151'}}>PKR 68.95</span>
                              </div>
                              <div 
                                style={{
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'space-between',
                                  padding: '8px 12px', 
                                  backgroundColor: selectedEBDBlue360Type === '1.74' ? '#dbeafe' : 'white',
                                  border: selectedEBDBlue360Type === '1.74' ? '2px solid #3b82f6' : '1px solid #d1d5db',
                                  borderRadius: '6px',
                                  cursor: 'pointer'
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedEBDBlue360Type('1.74');
                                }}
                              >
                                <span style={{fontSize: '13px', color: '#374151'}}>EBDBlue 360 1.74 <span style={{color: '#6b7280'}}>ⓘ</span></span>
                                <span style={{fontSize: '13px', fontWeight: '600', color: '#374151'}}>PKR 78.95</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </SunProtectionInfo>
                    </SunProtectionOption>
                    
                    <SunProtectionOption 
                      selected={selectedBluelightOption === 'SightRelax'}
                      onClick={() => {
                        setSelectedBluelightOption('SightRelax');
                      }}
                    >
                      <SunProtectionIcon color="#6366F1">👁️</SunProtectionIcon>
                      <SunProtectionInfo>
                        <SunProtectionHeader>
                          <SunProtectionName>
                            SightRelax <InfoIcon>i</InfoIcon>
                          </SunProtectionName>
                          <SunProtectionPrice>From PKR 85.95</SunProtectionPrice>
                        </SunProtectionHeader>
                        <SunProtectionDescription>
                          Lenses that offer a visual boost via a magnified portion to relax and relieve digital eye strain while filtering blue-violet light. Produced by Essilor.
                        </SunProtectionDescription>
                      </SunProtectionInfo>
                    </SunProtectionOption>
                    
                    <SunProtectionOption 
                      selected={selectedBluelightOption === 'EBDBlue-Smart'}
                      onClick={() => {
                        setSelectedBluelightOption('EBDBlue-Smart');
                      }}
                    >
                      <SunProtectionIcon color="#10B981">🔄</SunProtectionIcon>
                      <SunProtectionInfo>
                        <SunProtectionHeader>
                          <SunProtectionName>
                            EBDBlue Smart 1.6 <InfoIcon>i</InfoIcon>
                          </SunProtectionName>
                          <SunProtectionPrice>PKR 78.95</SunProtectionPrice>
                        </SunProtectionHeader>
                        <SunProtectionDescription>
                          Blue light filtering lenses that change color according to environment to offer responsive UV protection.
                        </SunProtectionDescription>
                        
                        {selectedBluelightOption === 'EBDBlue-Smart' && (
                          <div style={{marginTop: '16px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0'}}>
                            <div style={{fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#374151'}}>
                              Color: {selectedEBDBlueSmartColor}
                            </div>
                            <div style={{display: 'flex', gap: '12px', marginBottom: '16px'}}>
                              <div 
                                style={{
                                  width: '40px',
                                  height: '40px',
                                  borderRadius: '50%',
                                  backgroundColor: '#4A5568',
                                  border: selectedEBDBlueSmartColor === 'Gray' ? '3px solid #3b82f6' : '2px solid #d1d5db',
                                  cursor: 'pointer',
                                  position: 'relative'
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedEBDBlueSmartColor('Gray');
                                }}
                              />
                              <div 
                                style={{
                                  width: '40px',
                                  height: '40px',
                                  borderRadius: '50%',
                                  backgroundColor: '#8B4513',
                                  border: selectedEBDBlueSmartColor === 'Brown' ? '3px solid #3b82f6' : '2px solid #d1d5db',
                                  cursor: 'pointer',
                                  position: 'relative'
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedEBDBlueSmartColor('Brown');
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </SunProtectionInfo>
                    </SunProtectionOption>
                    
                    <SunProtectionOption 
                      selected={selectedBluelightOption === 'EBDBlue-Plus'}
                      onClick={() => {
                        setSelectedBluelightOption('EBDBlue-Plus');
                      }}
                    >
                      <SunProtectionIcon color="#F59E0B">💡</SunProtectionIcon>
                      <SunProtectionInfo>
                        <SunProtectionHeader>
                          <SunProtectionName>
                            EBDBlue Plus™ <InfoIcon>i</InfoIcon>
                          </SunProtectionName>
                          <SunProtectionPrice>From PKR 22.95</SunProtectionPrice>
                        </SunProtectionHeader>
                        <SunProtectionDescription>
                          Affordable lenses with advanced blue-violet light filtering technology.
                        </SunProtectionDescription>
                        
                        {selectedBluelightOption === 'EBDBlue-Plus' && (
                          <div style={{marginTop: '16px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0'}}>
                            <div style={{fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#374151'}}>
                              Choose Lens Thickness:
                            </div>
                            <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                              <div 
                                style={{
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'space-between',
                                  padding: '8px 12px', 
                                  backgroundColor: selectedEBDBluePlusType === '1.59' ? '#dbeafe' : 'white',
                                  border: selectedEBDBluePlusType === '1.59' ? '2px solid #3b82f6' : '1px solid #d1d5db',
                                  borderRadius: '6px',
                                  cursor: 'pointer'
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedEBDBluePlusType('1.59');
                                }}
                              >
                                <span style={{fontSize: '13px', color: '#374151'}}>EBDBlue Plus™ 1.59 <span style={{color: '#6b7280'}}>ⓘ</span></span>
                                <span style={{fontSize: '13px', fontWeight: '600', color: '#374151'}}>PKR 35.95</span>
                              </div>
                              <div 
                                style={{
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'space-between',
                                  padding: '8px 12px', 
                                  backgroundColor: selectedEBDBluePlusType === '1.5' ? '#dbeafe' : 'white',
                                  border: selectedEBDBluePlusType === '1.5' ? '2px solid #3b82f6' : '1px solid #d1d5db',
                                  borderRadius: '6px',
                                  cursor: 'pointer'
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedEBDBluePlusType('1.5');
                                }}
                              >
                                <span style={{fontSize: '13px', color: '#374151'}}>EBDBlue Plus™ 1.5 <span style={{color: '#6b7280'}}>ⓘ</span></span>
                                <span style={{fontSize: '13px', fontWeight: '600', color: '#374151'}}>PKR 22.95</span>
                              </div>
                              <div 
                                style={{
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'space-between',
                                  padding: '8px 12px', 
                                  backgroundColor: selectedEBDBluePlusType === '1.6' ? '#dbeafe' : 'white',
                                  border: selectedEBDBluePlusType === '1.6' ? '2px solid #3b82f6' : '1px solid #d1d5db',
                                  borderRadius: '6px',
                                  cursor: 'pointer'
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedEBDBluePlusType('1.6');
                                }}
                              >
                                <span style={{fontSize: '13px', color: '#374151'}}>EBDBlue Plus™ 1.6 <span style={{color: '#6b7280'}}>ⓘ</span></span>
                                <span style={{fontSize: '13px', fontWeight: '600', color: '#374151'}}>PKR 58.95</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </SunProtectionInfo>
                    </SunProtectionOption>
                    
                    <ContinueToCheckoutButton onClick={handleContinueToUsage}>
                      Continue to checkout
                    </ContinueToCheckoutButton>
                  </SunProtectionContainer>
                </ModalScreen>
                
                {/* Sun Protection Options Screen */}
                <ModalScreen active={modalScreen === 'sun-protection'}>
                  <SunProtectionContainer>
                    <BackButton onClick={handleBackNavigation}>
                      ← Back
                    </BackButton>
                    <SunProtectionTitle>Sun protection</SunProtectionTitle>
                    
                    <SunProtectionOption 
                      selected={selectedSunOption === 'Basic'}
                      onClick={() => {
                        setSelectedSunOption('Basic');
                        setModalScreen('tint-customization');
                      }}
                    >
                      <SunProtectionIcon color="#6B7280">🕶️</SunProtectionIcon>
                      <SunProtectionInfo>
                        <SunProtectionHeader>
                          <SunProtectionName>
                            Basic <InfoIcon>i</InfoIcon>
                          </SunProtectionName>
                          <SunProtectionPrice>PKR 4.95</SunProtectionPrice>
                        </SunProtectionHeader>
                        <SunProtectionDescription>
                          Stylish sun tints in a range of colors with UV protection.
                        </SunProtectionDescription>
                      </SunProtectionInfo>
                    </SunProtectionOption>
                    
                    <SunProtectionOption 
                      selected={selectedSunOption === 'Polarized'}
                      onClick={() => {
                        setSelectedSunOption('Polarized');
                        setModalScreen('polarized-tint');
                      }}
                    >
                      <SunProtectionIcon color="#4A90E2">⭐</SunProtectionIcon>
                      <SunProtectionInfo>
                        <SunProtectionHeader>
                          <SunProtectionName>
                            Polarized <InfoIcon>i</InfoIcon>
                          </SunProtectionName>
                          <SunProtectionPrice>PKR 59</SunProtectionPrice>
                        </SunProtectionHeader>
                        <SunProtectionDescription>
                          Polarized lenses reduce extra bright light glares and hazy vision. An option that offers superior clarity and eye protection.
                        </SunProtectionDescription>
                      </SunProtectionInfo>
                    </SunProtectionOption>
                    
                    <SunProtectionOption 
                      selected={selectedSunOption === 'Gradient'}
                      onClick={() => setSelectedSunOption('Gradient')}
                    >
                      <SunProtectionIcon color="#8B5CF6">🌈</SunProtectionIcon>
                      <SunProtectionInfo>
                        <SunProtectionHeader>
                          <SunProtectionName>
                            Gradient <InfoIcon>i</InfoIcon>
                          </SunProtectionName>
                          <SunProtectionPrice>PKR 149</SunProtectionPrice>
                        </SunProtectionHeader>
                        <SunProtectionDescription>
                          Stylish gradient lenses that transition from dark at the top to lighter at the bottom, providing optimal sun protection while maintaining clear vision.
                        </SunProtectionDescription>
                        
                        {selectedSunOption === 'Gradient' && (
                          <GradientTintSection>
                            <GradientTintLabel>Tint Strength: 80% to 10% gradient</GradientTintLabel>
                            <GradientTintLabel>Color: {selectedGradientColor}</GradientTintLabel>
                            <BasicTintColorOptions>
                              <BasicTintColorOption
                                color="#4A5568"
                                selected={selectedGradientColor === 'Gray'}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedGradientColor('Gray');
                                }}
                              />
                              <BasicTintColorOption
                                color="#8B4513"
                                selected={selectedGradientColor === 'Brown'}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedGradientColor('Brown');
                                }}
                              />
                              <BasicTintColorOption
                                color="#228B22"
                                selected={selectedGradientColor === 'Green'}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedGradientColor('Green');
                                }}
                              />
                              <BasicTintColorOption
                                color="#9370DB"
                                selected={selectedGradientColor === 'Purple'}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedGradientColor('Purple');
                                }}
                              />
                              <BasicTintColorOption
                                color="#1E90FF"
                                selected={selectedGradientColor === 'Blue'}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedGradientColor('Blue');
                                }}
                              />
                            </BasicTintColorOptions>
                            <ChooseContinueButton onClick={(e) => {
                              e.stopPropagation();
                              handleContinueToUsage();
                            }}>
                              Choose & continue
                            </ChooseContinueButton>
                          </GradientTintSection>
                        )}
                      </SunProtectionInfo>
                    </SunProtectionOption>
                    
                    <SunProtectionOption 
                      selected={selectedSunOption === 'Mirrored'}
                      onClick={() => setSelectedSunOption('Mirrored')}
                    >
                      <SunProtectionIcon color="#C0C0C0">✨</SunProtectionIcon>
                      <SunProtectionInfo>
                        <SunProtectionHeader>
                          <SunProtectionName>
                            Mirrored <InfoIcon>i</InfoIcon>
                          </SunProtectionName>
                          <SunProtectionPrice>PKR 29</SunProtectionPrice>
                        </SunProtectionHeader>
                        <SunProtectionDescription>
                          Reflective lenses that combine fashion and function to reduce the amount of light entering your eyes.
                        </SunProtectionDescription>
                        
                        {selectedSunOption === 'Mirrored' && (
                          <BasicTintColorSection>
                            <BasicTintColorLabel>Color: {selectedMirroredSunColor}</BasicTintColorLabel>
                            <BasicTintColorOptions>
                              <BasicTintColorOption
                                color="#C0C0C0"
                                selected={selectedMirroredSunColor === 'Silver'}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedMirroredSunColor('Silver');
                                }}
                              />
                              <BasicTintColorOption
                                color="#48b2ee"
                                selected={selectedMirroredSunColor === 'Orange'}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedMirroredSunColor('Orange');
                                }}
                              />
                              <BasicTintColorOption
                                color="#1E90FF"
                                selected={selectedMirroredSunColor === 'Blue'}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedMirroredSunColor('Blue');
                                }}
                              />
                              <BasicTintColorOption
                                color="#9370DB"
                                selected={selectedMirroredSunColor === 'Purple'}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedMirroredSunColor('Purple');
                                }}
                              />
                              <BasicTintColorOption
                                color="#20B2AA"
                                selected={selectedMirroredSunColor === 'Green'}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedMirroredSunColor('Green');
                                }}
                              />
                            </BasicTintColorOptions>
                          </BasicTintColorSection>
                        )}
                      </SunProtectionInfo>
                    </SunProtectionOption>
                    
                    <ContinueToCheckoutButton onClick={handleContinueToUsage}>
                      Continue to checkout
                    </ContinueToCheckoutButton>
                  </SunProtectionContainer>
                </ModalScreen>
                
                {/* Polarized Tint Selection Screen */}
                <ModalScreen active={modalScreen === 'polarized-tint'}>
                  <PolarizedTintContainer>
                    <BackButton onClick={handleBackNavigation}>
                      ← Back
                    </BackButton>
                    <PolarizedTintTitle>Choose your polarized tint</PolarizedTintTitle>
                    
                    <PolarizedTintOption 
                      selected={selectedPolarizedTint === 'Basic tint'}
                      onClick={() => setSelectedPolarizedTint('Basic tint')}
                    >
                      <PolarizedTintIcon color="#6B7280">🕶️</PolarizedTintIcon>
                      <PolarizedTintInfo>
                        <PolarizedTintName>
                          Basic tint <InfoIcon>ⓘ</InfoIcon>
                        </PolarizedTintName>
                        <PolarizedTintDescription>
                          Standard polarized lenses with basic tint for everyday sun protection and glare reduction.
                        </PolarizedTintDescription>
                        
                        {selectedPolarizedTint === 'Basic tint' && (
                          <BasicTintColorSection>
                            <BasicTintColorLabel>Color: {selectedBasicTintColor}</BasicTintColorLabel>
                            <BasicTintColorOptions>
                              <BasicTintColorOption
                                color="#4A5568"
                                selected={selectedBasicTintColor === 'Gray'}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedBasicTintColor('Gray');
                                }}
                              />
                              <BasicTintColorOption
                                color="#228B22"
                                selected={selectedBasicTintColor === 'Green'}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedBasicTintColor('Green');
                                }}
                              />
                              <BasicTintColorOption
                                color="#8B4513"
                                selected={selectedBasicTintColor === 'Brown'}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedBasicTintColor('Brown');
                                }}
                              />
                            </BasicTintColorOptions>
                            
                          </BasicTintColorSection>
                        )}
                      </PolarizedTintInfo>
                      <PolarizedTintPrice>PKR 59</PolarizedTintPrice>
                    </PolarizedTintOption>
                    
                    <PolarizedTintOption 
                      selected={selectedPolarizedTint === 'Mirrored tint'}
                      onClick={() => setSelectedPolarizedTint('Mirrored tint')}
                    >
                      <PolarizedTintIcon color="#C0C0C0">✨</PolarizedTintIcon>
                      <PolarizedTintInfo>
                        <PolarizedTintName>
                          Mirrored tint <InfoIcon>ⓘ</InfoIcon>
                        </PolarizedTintName>
                        <PolarizedTintDescription>
                          Polarized lenses with reflective mirror coating for enhanced style and superior glare protection.
                        </PolarizedTintDescription>
                        
                        {selectedPolarizedTint === 'Mirrored tint' && (
                          <BasicTintColorSection>
                            <BasicTintColorLabel>Color: {selectedMirroredTintColor}</BasicTintColorLabel>
                            <BasicTintColorOptions>
                              <BasicTintColorOption
                                color="#C0C0C0"
                                selected={selectedMirroredTintColor === 'Silver'}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedMirroredTintColor('Silver');
                                }}
                              />
                              <BasicTintColorOption
                                color="#48b2ee"
                                selected={selectedMirroredTintColor === 'Orange'}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedMirroredTintColor('Orange');
                                }}
                              />
                              <BasicTintColorOption
                                color="#1E90FF"
                                selected={selectedMirroredTintColor === 'Blue'}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedMirroredTintColor('Blue');
                                }}
                              />
                              <BasicTintColorOption
                                color="#9370DB"
                                selected={selectedMirroredTintColor === 'Purple'}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedMirroredTintColor('Purple');
                                }}
                              />
                              <BasicTintColorOption
                                color="#20B2AA"
                                selected={selectedMirroredTintColor === 'Green'}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedMirroredTintColor('Green');
                                }}
                              />
                            </BasicTintColorOptions>
                          </BasicTintColorSection>
                        )}
                      </PolarizedTintInfo>
                      <PolarizedTintPrice>PKR 89</PolarizedTintPrice>
                    </PolarizedTintOption>
                    
                    <ContinueToCheckoutButton onClick={handleContinueToUsage}>
                      Continue to checkout
                    </ContinueToCheckoutButton>
                  </PolarizedTintContainer>
                </ModalScreen>
                
                {/* Tint Customization Screen */}
                <ModalScreen active={modalScreen === 'tint-customization'}>
                  <TintCustomizationContainer>
                    <BackButton onClick={handleBackNavigation}>
                      ← Back
                    </BackButton>
                    <TintCustomizationTitle>Tint Strength: {selectedTintStrength}</TintCustomizationTitle>
                    
                    <TintSection>
                      <TintStrengthOptions>
                        <TintStrengthOption>
                          <TintStrengthRadio
                            type="radio"
                            name="tintStrength"
                            checked={selectedTintStrength === 'Dark (80%)'}
                            onChange={() => setSelectedTintStrength('Dark (80%)')}
                          />
                          Dark (80%)
                        </TintStrengthOption>
                        <TintStrengthOption>
                          <TintStrengthRadio
                            type="radio"
                            name="tintStrength"
                            checked={selectedTintStrength === 'Medium (50%)'}
                            onChange={() => setSelectedTintStrength('Medium (50%)')}
                          />
                          Medium (50%)
                        </TintStrengthOption>
                        <TintStrengthOption>
                          <TintStrengthRadio
                            type="radio"
                            name="tintStrength"
                            checked={selectedTintStrength === 'Light (20%)'}
                            onChange={() => setSelectedTintStrength('Light (20%)')}
                          />
                          Light (20%)
                        </TintStrengthOption>
                      </TintStrengthOptions>
                    </TintSection>
                    
                    <TintSection>
                      <TintSectionTitle>Color: {selectedTintColor}</TintSectionTitle>
                      <TintColorGrid>
                        <TintColorOption
                          color="#4A5568"
                          selected={selectedTintColor === 'Gray'}
                          onClick={() => setSelectedTintColor('Gray')}
                        />
                        <TintColorOption
                          color="#000000"
                          selected={selectedTintColor === 'Black'}
                          onClick={() => setSelectedTintColor('Black')}
                        />
                        <TintColorOption
                          color="#8B4513"
                          selected={selectedTintColor === 'Brown'}
                          onClick={() => setSelectedTintColor('Brown')}
                        />
                        <TintColorOption
                          color="#228B22"
                          selected={selectedTintColor === 'Green'}
                          onClick={() => setSelectedTintColor('Green')}
                        />
                        <TintColorOption
                          color="#8B008B"
                          selected={selectedTintColor === 'Purple'}
                          onClick={() => setSelectedTintColor('Purple')}
                        />
                        <TintColorOption
                          color="#1E90FF"
                          selected={selectedTintColor === 'Blue'}
                          onClick={() => setSelectedTintColor('Blue')}
                        />
                        <TintColorOption
                          color="#A0522D"
                          selected={selectedTintColor === 'Sienna'}
                          onClick={() => setSelectedTintColor('Sienna')}
                        />
                        <TintColorOption
                          color="#D2691E"
                          selected={selectedTintColor === 'Orange'}
                          onClick={() => setSelectedTintColor('Orange')}
                        />
                        <TintColorOption
                          color="#708090"
                          selected={selectedTintColor === 'Slate'}
                          onClick={() => setSelectedTintColor('Slate')}
                        />
                        <TintColorOption
                          color="#20B2AA"
                          selected={selectedTintColor === 'Teal'}
                          onClick={() => setSelectedTintColor('Teal')}
                        />
                        <TintColorOption
                          color="#8B0000"
                          selected={selectedTintColor === 'Maroon'}
                          onClick={() => setSelectedTintColor('Maroon')}
                        />
                      </TintColorGrid>
                    </TintSection>
                    
                    <ChooseContinueButton onClick={handleContinueToUsage}>
                      Choose & continue
                    </ChooseContinueButton>
                  </TintCustomizationContainer>
                </ModalScreen>
              </ModalScreensContainer>
            </LensOptionsContainer>
          </ModalContent>
        </ModalContainer>
      </LensSelectionModal>
    </PageContainer>
  );
};

export default ProductDetailPage;
