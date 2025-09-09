import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, Link } from 'react-router-dom';
import styled from 'styled-components';
import { fetchProducts, setFilters, resetFilters, setSortOption, initializeFilteredItems } from '../redux/slices/productSlice';
import { addToCart } from '../redux/slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '../redux/slices/wishlistSlice';
// Import formatPrice utility
import formatPrice from '../utils/formatPrice';
// At the top of the file, keep only one import for the icons
import { FiShoppingBag, FiHeart } from 'react-icons/fi';

// Styled Components
const PageContainer = styled.div`
  max-width: 100%;
  margin: 0 auto;
  padding: 1rem 2rem;
`;

const PageHeader = styled.div`
  margin-bottom: 1.5rem;
`;

const PageTitle = styled.h1`
  font-size: 2.8rem;
  margin-bottom: 0.5rem;
  font-weight: 800;
  text-align:left;

  @media (max-width: 768px) {
    font-size: 2rem;
  }

  @media (max-width: 480px) {
    font-size: 1.8rem;
  }
`;

const FilterCount = styled.div`
  font-size: 0.8rem;
  color: #666;
`;

const ProductsContainer = styled.div`
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const DesktopFilters = styled.div`
  @media (max-width: 768px) {
    display: none;
  }
`;

const FilterSidebar = styled.div`
  width: 100%;
  overflow: visible;
  
  @media (max-width: 768px) {
    margin-bottom: 2rem;
  }
`;

const ClearFiltersButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  background: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 4px;
  color: #666;
  font-size: 0.85rem;
  cursor: pointer;
  margin-bottom: 1rem;
  transition: all 0.2s ease;
  
  &:hover {
    background: #e9ecef;
    border-color: #333;
    color: #333;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const FilterSection = styled.div`
  border-bottom: 1px solid #eee;
  position: relative;
`;

const FilterContent = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: ${props => props.expanded ? '1px solid #eee' : 'none'};
  border-top: none;
  max-height: ${props => props.expanded ? '300px' : '0'};
  overflow: hidden;
  transition: max-height 0.3s ease;
  padding: ${props => props.expanded ? '1rem' : '0'};
  z-index: 100;
  box-shadow: ${props => props.expanded ? '0 4px 12px rgba(0,0,0,0.15)' : 'none'};
`;

const FilterTitle = styled.h3`
  font-size: 0.9rem;
  margin: 0;
  padding: 1rem 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  border-bottom: 1px solid #eee;
  font-weight: 400;
  color: #333;
  
  &:after {
    content: '${props => props.expanded ? '−' : '+'}';
    font-size: 1.2rem;
    font-weight: normal;
    transition: transform 0.2s ease;
  }
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  cursor: pointer;
  font-size: 0.85rem;
  
  input {
    margin-right: 0.5rem;
  }
`;

const PriceRangeContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const PriceInputs = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  
  input {
    width: 70px;
    padding: 0.3rem;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  
  span {
    font-size: 0.8rem;
    color: #666;
  }
`;

// Update the ProductGrid styling to better match the image
const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: ${props => props.viewMode === 'list' ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))'};
  gap: ${props => props.viewMode === 'list' ? '0.75rem' : '1.5rem'};
  flex: 1;
  min-width: 0;
  
  @media (max-width: 768px) {
    grid-template-columns: ${props => props.viewMode === 'list' ? '1fr' : '1fr 1fr'};
    gap: 1rem;
  }
`;

const ProductCard = styled.div`
  background: #f5f5f5;
  border-radius: ${props => props.viewMode === 'list' ? '8px' : '12px'};
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  position: relative;
  height:375px;
  display: flex;
  flex-direction: ${props => props.viewMode === 'list' ? 'row' : 'column'};
  align-items: ${props => props.viewMode === 'list' ? 'center' : 'stretch'};
  width: ${props => props.viewMode === 'list' ? '100%' : 'auto'};
  min-height: ${props => props.viewMode === 'list' ? '120px' : 'auto'};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  }
  
  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    width: auto;
    min-height: auto;
  }

  @media (max-width: 480px) {
    height: auto;
    padding-bottom:10px;
`;

// Update the ProductImage styling
const ProductImage = styled.div`
  height: ${props => props.viewMode === 'list' ? '210px' : '210px'};
  width: ${props => props.viewMode === 'list' ? '120px' : '100%'};
  background-color: #f5f5f5;
  background-image: url(${props => props.image});
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  position: relative;
  border-radius: 6px;
  margin-bottom: ${props => props.viewMode === 'list' ? '0' : '4px'};
  margin-right: ${props => props.viewMode === 'list' ? '0.8rem' : '0'};
  flex-shrink: 0;
  
  @media (max-width: 768px) {
    height: 80px;
    width: 100%;
    margin-right: 0;
    margin-bottom: 4px;
  }
    @media (max-width: 480px) {
    height: 100px;
    width: 100%;
    margin-right: 0;
    margin-bottom: 4px;
  }
  
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    transition: transform 0.3s ease;
  }
`;

// Add a DiscountBadge component
const DiscountBadge = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: #48b2ee;
  color: white;
  padding: 4px 8px;
  font-size: 0.7rem;
  border-radius: 4px;
  font-weight: 600;
  z-index: 2;
`;
const ListingCategoryBadge = styled.span`
  position: absolute;
  top: 15px;
  left: 15px;
  background: #48b2ee;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  z-index: 3;
  
  @media (max-width: 768px) {
    top: 8px;
    left: 8px;
    font-size: 0.65rem;
    padding: 3px 6px;
    z-index: 10;
  }
`;

const ColorSwatch = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: ${props => props.color};
  border: 1px solid #ddd;
  cursor: pointer;
  
  &:hover {
    transform: scale(1.1);
  }
`;

const ProductContent = styled.div`
  padding: ${props => props.viewMode === 'list' ? '0.4rem' : '0.4rem'};
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: ${props => props.viewMode === 'list' ? 'center' : 'flex-start'};
  padding:1rem;
  text-align: left;
  background-color: #fff;
  width:85%;
  margin: auto;
  border-radius:10px;
  position: relative;
  margin-top:0px;
  height:auto;
  

  @media (max-width: 768px) {
    padding: 0.4rem;
    justify-content: flex-start;
  }
`;

// Update the ProductTitle styling
const ProductTitle = styled.h3`
  font-size: 0.8rem;
  margin-bottom: 0.05rem;
  font-weight: 500;
  color: #333;
  line-height: 1.2;
  
  @media (max-width: 480px) {
    font-size: 0.7rem;
  }
`;

// Add ProductCategory component
const ProductCategory = styled.p`
  font-size: 0.7rem;
  color: #777;
  margin-bottom: 0.1rem;
  font-weight: 400;
  line-height: 1.1;
`;

// Add ProductStyle component
const ProductStyle = styled.p`
  font-size: 0.65rem;
  color: #888;
  margin-bottom: 0.1rem;
  font-weight: 400;
  font-style: italic;
  line-height: 1.1;
`;

// Update the ProductBrand styling
const ProductBrand = styled.p`
  font-size: 0.65rem;
  color: #666;
  margin-bottom: 0.1rem;
  line-height: 1.1;
  
  @media (max-width: 480px) {
    font-size: 0.6rem;
  }
`;

// Update the ProductPrice styling
const ProductPrice = styled.p`
  font-weight: 600;
  font-size: 0.85rem;
  margin-bottom: 0.1rem;
  color: #333;
  line-height: 1.2;
  
  @media (max-width: 480px) {
    font-size: 0.75rem;
  }
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

// Add a BestSeller badge component
const BestSellerBadge = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: #48b2ee;
  color: white;
  padding: 4px 8px;
  font-size: 0.7rem;
  border-radius: 4px;
  font-weight: 600;
  z-index: 2;
`;




const ColorOptions = styled.div`
  display: flex;
  padding-top:10px;
  gap: 0.15rem;
  margin: auto;
  justify-content: center;
  align-items: center;
  width: fit-content;
`;

const ColorOption = styled.div`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: ${props => props.color};
  cursor: pointer;
  border: 1px solid #ddd;
  transition: transform 0.2s ease;
  margin: auto;
  
  &:hover {
    transform: scale(1.1);
  }
`;

const ViewButton = styled(Link)`
  display: block;
  text-align: center;
  background-color: transparent;
  color: #d99b3a;
  padding: 0.5rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  border: 1px solid #d99b3a;
  
  &:hover {
    background-color: #d99b3a;
    color: white;
  }
`;

const NoResults = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: 2rem;
  color: #666;
`;

const ResetButton = styled.button`
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 1rem;
  transition: background-color 0.3s ease;
  font-size: 0.9rem;
  
  &:hover {
    background-color: #e9ecef;
  }
`;

const TopFiltersContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
`;

const FilterPillsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
`;

const FilterPillsLabel = styled.span`
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
`;

const FilterPills = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const FilterPill = styled.button`
  padding: 0.5rem 1rem;
  border: 1px solid ${props => props.active ? '#333' : '#ddd'};
  border-radius: 20px;
  background: ${props => props.active ? '#333' : 'white'};
  color: ${props => props.active ? 'white' : '#333'};
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #333;
    background: ${props => props.active ? '#333' : '#f8f9fa'};
  }
`;

const SortContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SortLabel = styled.span`
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
`;

const SortSelect = styled.select`
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  font-size: 0.85rem;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #333;
  }
`;

const MobileFilterBar = styled.div`
  display: none;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid #eee;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    display: flex;
  }
`;

const MobileFilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  
  &:hover {
    background: #f8f9fa;
  }
`;

const MobileResultsCount = styled.div`
  font-size: 0.9rem;
  color: #666;
`;

const MobileViewToggle = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ViewToggleButton = styled.button`
  background: ${props => props.active ? '#e67e22' : 'transparent'};
  color: ${props => props.active ? 'white' : '#666'};
  border: 1px solid #ddd;
  padding: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  
  &:hover {
    background: ${props => props.active ? '#d35400' : '#f8f9fa'};
  }
`;

const DesktopViewToggle = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const MobileFilterModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: white;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  transform: translateY(${props => props.show ? '0' : '-100%'});
  opacity: ${props => props.show ? '1' : '0'};
  visibility: ${props => props.show ? 'visible' : 'hidden'};
  transition: transform 0.3s ease-in-out, opacity 0.3s ease-in-out, visibility 0.3s ease-in-out;

  @media (min-width: 769px) {
    display: none;
  }
`;

const MobileFilterHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid #eee;
  background: #f8f9fa;
`;

const MobileFilterTitle = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
`;

const MobileFilterClose = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 0;
  
  &:hover {
    color: #333;
  }
`;

const MobileCloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.25rem;
  color: #666;
`;

const MobileClearButton = styled.button`
  background: none;
  border: none;
  color: #e67e22;
  cursor: pointer;
  font-weight: 500;
`;

const MobileFilterContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0;
`;

const MobileSortSection = styled.div`
  padding: 1rem;
  border-bottom: 1px solid #eee;
`;

const MobileSortLabel = styled.div`
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #333;
`;

const MobileSortOption = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 0;
  cursor: pointer;
  color: #e67e22;
  font-weight: 500;
`;

const MobileFilterSection = styled.div`
  border-bottom: 1px solid #eee;
`;

const MobileFilterSectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  cursor: pointer;
  background: white;
  
  &:hover {
    background: #f8f9fa;
  }
`;

const MobileFilterSectionTitle = styled.div`
  font-weight: 500;
  color: #333;
`;

const SelectedFilterValue = styled.span`
  color: #e67e22;
  font-weight: 400;
  font-size: 0.9rem;
  margin-left: 0.5rem;
`;

const MobileFilterSectionIcon = styled.div`
  font-size: 1.2rem;
  color: #666;
  transform: ${props => props.expanded ? 'rotate(45deg)' : 'rotate(0deg)'};
  transition: transform 0.2s ease;
`;

const MobileFilterSectionContent = styled.div`
  max-height: ${props => props.expanded ? '300px' : '0'};
  overflow: hidden;
  transition: max-height 0.3s ease;
  background: #f8f9fa;
`;

const MobileFilterOption = styled.div`
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  
  &:hover {
    background: #e9ecef;
    border-radius: 4px 0 0 4px;
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const MobileApplyButton = styled.button`
  background: #e67e22;
  color: white;
  border: none;
  padding: 1rem;
  margin: 1rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  
  &:hover {
    background: #d35400;
  }
`;

const PromoBanner = styled.div`
  background-image: url('/images/Untitled design (13).png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border-radius: 8px;
  height: 200px;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PromoContent = styled.div`
  flex: 1;
`;

const PromoTitle = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
`;

const PromoText = styled.p`
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
`;

const PromoCode = styled.div`
  font-size: 0.8rem;
  color: #e67e22;
  font-weight: 600;
`;

const ShopNowButton = styled.button`
  background-color: #e67e22;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  margin-top: 0.5rem;
  
  &:hover {
    background-color: #d35400;
  }
`;

const FilterToggle = styled.div`
  display: none;
  
  @media (max-width: 768px) {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.8rem 1rem;
    background-color: #f8f8f8;
    border-radius: 4px;
    margin-bottom: 1rem;
    cursor: pointer;
  }
`;

const FilterTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const FilterTag = styled.div`
  display: flex;
  align-items: center;
  background-color: #f0f0f0;
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  font-size: 0.9rem;
  
  button {
    background: none;
    border: none;
    margin-left: 0.5rem;
    cursor: pointer;
    font-size: 1.2rem;
    line-height: 1;
    color: #666;
  }
`;

const ResultCount = styled.div`
  font-size: 0.9rem;
  color: #666;
`;

const ProductListingPage = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { items, filteredItems, filters, sortOption } = useSelector(state => state.products);
  
  const [minPrice, setMinPrice] = useState(filters.priceRange.min);
  const [maxPrice, setMaxPrice] = useState(filters.priceRange.max);
  const [showFilters, setShowFilters] = useState(false);
  
  // State for collapsible filter sections
  const [expandedSections, setExpandedSections] = useState({
    category: false,
    brands: false,
    material: false,
    shape: false,
    color: false,
    price: false,
    fit: false
  });
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [activeQuickFilter, setActiveQuickFilter] = useState('best-sellers');
  const [mobileExpandedSections, setMobileExpandedSections] = useState({
    glassesType: false,
    gender: false,
    brands: false,
    size: false,
    shape: false,
    color: false,
    material: false,
    rim: false,
    price: false,
    fit: false
  });
  
  // Define featuredProducts here, inside the component
  const displayFeaturedProducts = items ? items.map(product => ({
    id: product.id,
    name: product.name,
    price: formatPrice(product.price),
    image: product.image,
    category: product.category,
    brand: product.brand,
    colors: product.colors,
    discount: product.discount,
    featured: product.featured,
    bestSeller: product.bestSeller,
    fit: false
  })) : [];
  
  
  // Add this function to handle adding products to cart
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
    }
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.id === productId);
  };

  // Fetch products when component mounts
  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  // Get category, search, featured, best-sellers, and style from URL query params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryParam = params.get('category');
    const searchParam = params.get('search');
    const featuredParam = params.get('featured');
    const styleParam = params.get('style');
    
    
    const newFilters = {};
    let newActiveQuickFilter = 'best-sellers'; // default
    
    if (categoryParam) {
      newFilters.category = categoryParam;
    }
    if (searchParam) {
      newFilters.search = searchParam;
    }
    if (featuredParam === 'true') {
      newFilters.featured = true;
      newActiveQuickFilter = 'featured';
    }
    if (styleParam) {
      // Decode the URL parameter to handle spaces
      const decodedStyle = decodeURIComponent(styleParam);
      newFilters.style = decodedStyle;
      newActiveQuickFilter = 'all'; // Set to 'all' when filtering by style
    }
    if (categoryParam === 'best-sellers') {
      newFilters.bestSelling = true;
      newActiveQuickFilter = 'best-sellers';
      // Remove category filter when it's best-sellers to avoid conflicts
      delete newFilters.category;
    }
    
    // Update active quick filter based on URL params
    setActiveQuickFilter(newActiveQuickFilter);
    
    
    // Always reset filters first, then apply new ones
    dispatch(resetFilters());
    
    if (Object.keys(newFilters).length > 0) {
      dispatch(setFilters(newFilters));
    }
    
    // Only initialize if we have items
    if (items.length > 0) {
      dispatch(initializeFilteredItems());
    }
  }, [dispatch, location.search, items.length]);
  
  
  // Handle filter changes
  const handleCategoryChange = (category) => {
    // If the same category is selected, deselect it
    const newCategory = filters.category === category ? null : category;
    dispatch(setFilters({ category: newCategory }));
  };
  
  const handleMaterialChange = (material) => {
    const newMaterial = filters.material === material ? null : material;
    dispatch(setFilters({ material: newMaterial }));
  };
  
  const handleShapeChange = (shape) => {
    const newShape = filters.shape === shape ? null : shape;
    dispatch(setFilters({ shape: newShape }));
  };
  
  const handleColorChange = (color) => {
    const newColor = filters.color === color ? null : color;
    dispatch(setFilters({ color: newColor }));
  };

  const handleBrandChange = (brand) => {
    const newBrand = filters.brand === brand ? null : brand;
    dispatch(setFilters({ brand: newBrand }));
  };

  const handleQuickFilterChange = (filterType) => {
    setActiveQuickFilter(filterType);
    
    // Reset other filters when switching quick filters
    dispatch(resetFilters());
    
    switch (filterType) {
      case 'best-sellers':
        // Filter for best selling products
        dispatch(setFilters({ bestSelling: true }));
        break;
      case 'featured':
        // Filter for featured products
        dispatch(setFilters({ featured: true }));
        break;
      case 'ai-glasses':
        dispatch(setFilters({ category: 'smart-glasses' }));
        break;
      case 'ray-ban':
        dispatch(setFilters({ brand: 'Ray-Ban' }));
        break;
      case 'oakley':
        dispatch(setFilters({ brand: 'Oakley' }));
        break;
      case 'sporty':
        dispatch(setFilters({ category: 'sports-glasses' }));
        break;
      default:
        break;
    }
  };
  
  const handleFeatureToggle = (feature) => {
    const updatedFeatures = filters.features.includes(feature)
      ? filters.features.filter(f => f !== feature)
      : [...filters.features, feature];
    
    dispatch(setFilters({ features: updatedFeatures }));
  };
  
  const handlePriceRangeChange = () => {
    dispatch(setFilters({ priceRange: { min: Number(minPrice), max: Number(maxPrice) } }));
  };
  
    
  const handleResetFilters = () => {
    dispatch(resetFilters());
    setMinPrice(0);
    setMaxPrice(1000);
  };
  

  // Toggle filter section expansion
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const toggleMobileSection = (section) => {
    setMobileExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  // Extract unique values for filter options
  const categories = [...new Set(items.map(item => item.category))];
  const brands = [...new Set(items.filter(item => item.brand).map(item => item.brand))].sort();
  const materials = [...new Set(items.filter(item => item.material).map(item => item.material))];
  const shapes = [...new Set(items.filter(item => item.shape).map(item => item.shape))];
  const colors = [...new Set(items.filter(item => item.color).map(item => item.color))];
  const allFeatures = [...new Set(items.filter(item => item.features).flatMap(item => item.features))];
  
  // Get active filters for tags
  const activeFilters = [];
  if (filters.category) activeFilters.push({ type: 'category', value: filters.category });
  if (filters.brand) activeFilters.push({ type: 'brand', value: filters.brand });
  if (filters.search) activeFilters.push({ type: 'search', value: filters.search });
  if (filters.material) activeFilters.push({ type: 'material', value: filters.material });
  if (filters.shape) activeFilters.push({ type: 'shape', value: filters.shape });
  if (filters.color) activeFilters.push({ type: 'color', value: filters.color });
  filters.features.forEach(feature => activeFilters.push({ type: 'feature', value: feature }));
  
  // Filter categories for sidebar - use actual categories from products
  const filterCategories = categories.filter(category => category).map(category => ({
    id: category,
    name: category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }));
  
  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>
          {filters.search ? `Search results for "${filters.search}"` : 'Shop Your Favourite Eyewear'}
        </PageTitle>
       
      </PageHeader>
      
      <DesktopFilters>
        <TopFiltersContainer>
          <FilterPillsContainer>
            <FilterPillsLabel>Filters ({activeFilters.length})</FilterPillsLabel>
            <FilterPills>
              <FilterPill 
                active={activeQuickFilter === 'best-sellers'}
                onClick={() => handleQuickFilterChange('best-sellers')}
              >
                Best Sellers
              </FilterPill>
              <FilterPill 
                active={activeQuickFilter === 'featured'}
                onClick={() => handleQuickFilterChange('featured')}
              >
                Featured
              </FilterPill>
              
            </FilterPills>
          </FilterPillsContainer>
          <SortContainer>
            <SortLabel>Sort by:</SortLabel>
            <SortSelect value={sortOption} onChange={(e) => dispatch(setSortOption(e.target.value))}>
              <option value="featured">Relevance</option>
              <option value="price-low-high">Price: Low to High</option>
              <option value="price-high-low">Price: High to Low</option>
              <option value="name-a-z">Name: A to Z</option>
              <option value="name-z-a">Name: Z to A</option>
            </SortSelect>
            
          </SortContainer>
        </TopFiltersContainer>
      </DesktopFilters>
      
      <MobileFilterBar>
        <MobileFilterButton onClick={() => setShowFilters(!showFilters)}>
          <span>☰</span>
          Filter & Sort
        </MobileFilterButton>
        <MobileResultsCount>{filteredItems.length} Results</MobileResultsCount>
        <MobileViewToggle>
          <ViewToggleButton 
            active={viewMode === 'grid'} 
            onClick={() => setViewMode('grid')}
          >
            ⊞
          </ViewToggleButton>
          <ViewToggleButton 
            active={viewMode === 'list'} 
            onClick={() => setViewMode('list')}
          >
            ☰
          </ViewToggleButton>
        </MobileViewToggle>
      </MobileFilterBar>
      
      <PromoBanner>
      </PromoBanner>
      
      {activeFilters.length > 0 && (
        <FilterTags>
          {activeFilters.map((filter, index) => (
            <FilterTag key={index}>
              {filter.value.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              <button onClick={() => {
                if (filter.type === 'category') handleCategoryChange(null);
                if (filter.type === 'brand') handleBrandChange(null);
                if (filter.type === 'search') dispatch(setFilters({ search: null }));
                if (filter.type === 'material') handleMaterialChange(null);
                if (filter.type === 'shape') handleShapeChange(null);
                if (filter.type === 'color') handleColorChange(null);
                if (filter.type === 'feature') handleFeatureToggle(filter.value);
              }}>×</button>
            </FilterTag>
          ))}
          {activeFilters.length > 1 && (
            <FilterTag as="button" onClick={handleResetFilters}>
              Clear All
            </FilterTag>
          )}
        </FilterTags>
      )}
      
      <ProductsContainer>
        <DesktopFilters>
          <FilterSidebar>
            <ClearFiltersButton 
              onClick={handleResetFilters}
              disabled={activeFilters.length === 0}
            >
              Clear All Filters ({activeFilters.length})
            </ClearFiltersButton>
            
            <FilterSection>
              <FilterTitle 
                expanded={expandedSections.category} 
                onClick={() => toggleSection('category')}
              >
                Glasses Type
              </FilterTitle>
              <FilterContent expanded={expandedSections.category}>
                {filterCategories.map(category => (
                  <CheckboxLabel key={category.id}>
                    <input 
                      type="radio" 
                      name="category" 
                      checked={filters.category === category.id} 
                      onChange={() => handleCategoryChange(category.id)} 
                    />
                    {category.name}
                  </CheckboxLabel>
                ))}
              </FilterContent>
            </FilterSection>
            
            <FilterSection>
              <FilterTitle 
                expanded={expandedSections.gender} 
                onClick={() => toggleSection('gender')}
              >
                Gender
              </FilterTitle>
              <FilterContent expanded={expandedSections.gender}>
                <CheckboxLabel>
                  <input type="radio" name="gender" />
                  Men
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="radio" name="gender" />
                  Women
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="radio" name="gender" />
                  Unisex
                </CheckboxLabel>
              </FilterContent>
            </FilterSection>
            
            <FilterSection>
              <FilterTitle 
                expanded={expandedSections.brands} 
                onClick={() => toggleSection('brands')}
              >
                Brands
              </FilterTitle>
              <FilterContent expanded={expandedSections.brands}>
                {brands.map(brand => (
                  <CheckboxLabel key={brand}>
                    <input 
                      type="checkbox" 
                      checked={filters.brand === brand}
                      onChange={() => handleBrandChange(brand)}
                    />
                    {brand}
                  </CheckboxLabel>
                ))}
              </FilterContent>
            </FilterSection>
            
            <FilterSection>
              <FilterTitle 
                expanded={expandedSections.size} 
                onClick={() => toggleSection('size')}
              >
                Size
              </FilterTitle>
              <FilterContent expanded={expandedSections.size}>
                <CheckboxLabel>
                  <input type="checkbox" />
                  Small
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" />
                  Medium
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" />
                  Large
                </CheckboxLabel>
              </FilterContent>
            </FilterSection>
            
            <FilterSection>
              <FilterTitle>Price Range</FilterTitle>
              <PriceRangeContainer>
                <PriceInputs>
                  <input 
                    type="number" 
                    min="0" 
                    value={minPrice} 
                    onChange={(e) => setMinPrice(e.target.value)} 
                    onBlur={handlePriceRangeChange}
                  />
                  <span>to</span>
                  <input 
                    type="number" 
                    min="0" 
                    value={maxPrice} 
                    onChange={(e) => setMaxPrice(e.target.value)} 
                    onBlur={handlePriceRangeChange}
                  />
                </PriceInputs>
              </PriceRangeContainer>
            </FilterSection>
            
            <FilterSection>
              <FilterTitle 
                expanded={expandedSections.shape} 
                onClick={() => toggleSection('shape')}
              >
                Shape
              </FilterTitle>
              <FilterContent expanded={expandedSections.shape}>
                {shapes.map(shape => (
                  <CheckboxLabel key={shape}>
                    <input 
                      type="radio" 
                      name="shape" 
                      checked={filters.shape === shape} 
                      onChange={() => handleShapeChange(shape)} 
                    />
                    {shape.charAt(0).toUpperCase() + shape.slice(1)}
                  </CheckboxLabel>
                ))}
              </FilterContent>
            </FilterSection>
            
            <FilterSection>
              <FilterTitle 
                expanded={expandedSections.color} 
                onClick={() => toggleSection('color')}
              >
                Color
              </FilterTitle>
              <FilterContent expanded={expandedSections.color}>
                {colors.map(color => (
                  <CheckboxLabel key={color}>
                    <input 
                      type="radio" 
                      name="color" 
                      checked={filters.color === color} 
                      onChange={() => handleColorChange(color)} 
                    />
                    {color.charAt(0).toUpperCase() + color.slice(1)}
                  </CheckboxLabel>
                ))}
              </FilterContent>
            </FilterSection>
            
            <FilterSection>
              <FilterTitle 
                expanded={expandedSections.material} 
                onClick={() => toggleSection('material')}
              >
                Material
              </FilterTitle>
              <FilterContent expanded={expandedSections.material}>
                {materials.map(material => (
                  <CheckboxLabel key={material}>
                    <input 
                      type="radio" 
                      name="material" 
                      checked={filters.material === material} 
                      onChange={() => handleMaterialChange(material)} 
                    />
                    {material.charAt(0).toUpperCase() + material.slice(1)}
                  </CheckboxLabel>
                ))}
              </FilterContent>
            </FilterSection>
            
            <FilterSection>
              <FilterTitle 
                expanded={expandedSections.rim} 
                onClick={() => toggleSection('rim')}
              >
                Rim
              </FilterTitle>
              <FilterContent expanded={expandedSections.rim}>
                <CheckboxLabel>
                  <input type="checkbox" />
                  Full Rim
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" />
                  Semi Rim
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" />
                  Rimless
                </CheckboxLabel>
              </FilterContent>
            </FilterSection>
            
            <FilterSection>
              <FilterTitle 
                expanded={expandedSections.price} 
                onClick={() => toggleSection('price')}
              >
                Price
              </FilterTitle>
              <FilterContent expanded={expandedSections.price}>
                <CheckboxLabel>
                  <input type="checkbox" />
                  Under $50
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" />
                  $50 - $100
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" />
                  $100 - $200
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" />
                  Over $200
                </CheckboxLabel>
              </FilterContent>
            </FilterSection>
            
            <FilterSection>
              <FilterTitle 
                expanded={expandedSections.fit} 
                onClick={() => toggleSection('fit')}
              >
                Fit
              </FilterTitle>
              <FilterContent expanded={expandedSections.fit}>
                <CheckboxLabel>
                  <input type="checkbox" />
                  Narrow
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" />
                  Medium
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" />
                  Wide
                </CheckboxLabel>
              </FilterContent>
            </FilterSection>
            
            {allFeatures.length > 0 && (
              <FilterSection>
                <FilterTitle>Features</FilterTitle>
                {allFeatures.map(feature => (
                  <CheckboxLabel key={feature}>
                    <input 
                      type="checkbox" 
                      checked={filters.features.includes(feature)} 
                      onChange={() => handleFeatureToggle(feature)} 
                    />
                    {feature.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </CheckboxLabel>
                ))}
              </FilterSection>
            )}
            
            {activeFilters.length > 0 && (
              <FilterTags>
                {activeFilters.map((filter, index) => (
                  <FilterTag key={index}>
                    {filter.value.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    <button onClick={() => {
                      if (filter.type === 'category') handleCategoryChange(null);
                      if (filter.type === 'material') handleMaterialChange(null);
                      if (filter.type === 'shape') handleShapeChange(null);
                      if (filter.type === 'color') handleColorChange(null);
                      if (filter.type === 'feature') handleFeatureToggle(filter.value);
                    }}>×</button>
                  </FilterTag>
                ))}
                {activeFilters.length > 1 && (
                  <FilterTag as="button" onClick={handleResetFilters}>
                    Clear All
                  </FilterTag>
                )}
              </FilterTags>
            )}
            
            {filteredItems.length === 0 && (
              <div style={{ textAlign: 'center', margin: '2rem 0' }}>
                <p>No products match your filters. Try adjusting your criteria.</p>
                <button 
                  onClick={handleResetFilters}
                  style={{
                    background: '#e67e22',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginTop: '1rem'
                  }}
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </FilterSidebar>
        </DesktopFilters>
        
        <ProductGrid viewMode={viewMode}>
                  {filteredItems.map(product => (
                    <ProductCard key={product.id}>
                                  {product.discount && <DiscountBadge>{typeof product.discount === 'string' ? product.discount : `${product.discount.discountPercentage}% OFF`}</DiscountBadge>}
                                  <ListingCategoryBadge>{product.category}</ListingCategoryBadge>
                                 
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
                                  
                                  <Link to={`/products/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <ProductImage image={product.image}>
                                     
                                    </ProductImage>
                                    <ProductContent>
                                      <ProductTitle>{product.name}</ProductTitle>
                                      <ProductBrand>{product.brand}</ProductBrand>
                                      <ProductPrice>PKR {product.price}</ProductPrice>
                                      <ColorOptions>
                                        {product.colors && product.colors.filter(color => color.name && color.hex).map((color, index) => (
                                          <ColorSwatch key={index} color={color.hex || color} />
                                        ))}
                                      </ColorOptions>
                                    </ProductContent>
                                  </Link>
                                </ProductCard>
                  ))}
                </ProductGrid>
      </ProductsContainer>
      
      <MobileFilterModal show={showFilters}>
        <MobileFilterHeader>
          <MobileFilterTitle>Filters</MobileFilterTitle>
          <MobileFilterClose onClick={() => setShowFilters(false)}>×</MobileFilterClose>
        </MobileFilterHeader>
        
        <MobileFilterContent>
          <MobileSortSection>
            <MobileSortLabel>Sort by:</MobileSortLabel>
            <MobileSortOption onClick={() => dispatch(setSortOption('featured'))}>
              Relevance {sortOption === 'featured' && '›'}
            </MobileSortOption>
          </MobileSortSection>
          
          <MobileFilterSection>
            <MobileFilterSectionHeader onClick={() => toggleMobileSection('glassesType')}>
              <MobileFilterSectionTitle>
                  Glasses Type
                  {filters.category && <SelectedFilterValue>{filters.category.replace('-', ' ')}</SelectedFilterValue>}
                </MobileFilterSectionTitle>
              <MobileFilterSectionIcon expanded={mobileExpandedSections.glassesType}>+</MobileFilterSectionIcon>
            </MobileFilterSectionHeader>
            <MobileFilterSectionContent expanded={mobileExpandedSections.glassesType}>
              {categories.map(category => (
                <MobileFilterOption key={category} onClick={() => handleCategoryChange(category)}>
                  {category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </MobileFilterOption>
              ))}
            </MobileFilterSectionContent>
          </MobileFilterSection>
          
          <MobileFilterSection>
            <MobileFilterSectionHeader onClick={() => toggleMobileSection('gender')}>
              <MobileFilterSectionTitle>
                  Gender
                  {filters.gender && <SelectedFilterValue>{filters.gender}</SelectedFilterValue>}
                </MobileFilterSectionTitle>
              <MobileFilterSectionIcon expanded={mobileExpandedSections.gender}>+</MobileFilterSectionIcon>
            </MobileFilterSectionHeader>
            <MobileFilterSectionContent expanded={mobileExpandedSections.gender}>
              <MobileFilterOption>Men</MobileFilterOption>
              <MobileFilterOption>Women</MobileFilterOption>
              <MobileFilterOption>Unisex</MobileFilterOption>
            </MobileFilterSectionContent>
          </MobileFilterSection>
          
          <MobileFilterSection>
            <MobileFilterSectionHeader onClick={() => toggleMobileSection('brands')}>
              <MobileFilterSectionTitle>
                  Brand
                  {filters.brand && <SelectedFilterValue>{filters.brand}</SelectedFilterValue>}
                </MobileFilterSectionTitle>
              <MobileFilterSectionIcon expanded={mobileExpandedSections.brands}>+</MobileFilterSectionIcon>
            </MobileFilterSectionHeader>
            <MobileFilterSectionContent expanded={mobileExpandedSections.brands}>
              {brands.map(brand => (
                <MobileFilterOption 
                  key={brand}
                  onClick={() => handleBrandChange(brand)}
                  style={{ 
                    backgroundColor: filters.brand === brand ? '#f0f0f0' : 'transparent',
                    fontWeight: filters.brand === brand ? '600' : '400'
                  }}
                >
                  {brand}
                </MobileFilterOption>
              ))}
            </MobileFilterSectionContent>
          </MobileFilterSection>
          
          <MobileFilterSection>
            <MobileFilterSectionHeader onClick={() => toggleMobileSection('shape')}>
              <MobileFilterSectionTitle>
                  Frame Style
                  {filters.shape && <SelectedFilterValue>{filters.shape.replace('-', ' ')}</SelectedFilterValue>}
                </MobileFilterSectionTitle>
              <MobileFilterSectionIcon expanded={mobileExpandedSections.shape}>+</MobileFilterSectionIcon>
            </MobileFilterSectionHeader>
            <MobileFilterSectionContent expanded={mobileExpandedSections.shape}>
              {shapes.map(shape => (
                <MobileFilterOption key={shape} onClick={() => handleShapeChange(shape)}>
                  {shape.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </MobileFilterOption>
              ))}
            </MobileFilterSectionContent>
          </MobileFilterSection>
          
          <MobileFilterSection>
            <MobileFilterSectionHeader onClick={() => toggleMobileSection('size')}>
              <MobileFilterSectionTitle>
                Size
                {filters.size && <SelectedFilterValue>{filters.size}</SelectedFilterValue>}
              </MobileFilterSectionTitle>
              <MobileFilterSectionIcon expanded={mobileExpandedSections.size}>+</MobileFilterSectionIcon>
            </MobileFilterSectionHeader>
            <MobileFilterSectionContent expanded={mobileExpandedSections.size}>
              <MobileFilterOption>Small</MobileFilterOption>
              <MobileFilterOption>Medium</MobileFilterOption>
              <MobileFilterOption>Large</MobileFilterOption>
            </MobileFilterSectionContent>
          </MobileFilterSection>
          
          <MobileFilterSection>
            <MobileFilterSectionHeader onClick={() => toggleMobileSection('shape')}>
              <MobileFilterSectionTitle>
                Shape
                {filters.shape && <SelectedFilterValue>{filters.shape.replace('-', ' ')}</SelectedFilterValue>}
              </MobileFilterSectionTitle>
              <MobileFilterSectionIcon expanded={mobileExpandedSections.shape}>+</MobileFilterSectionIcon>
            </MobileFilterSectionHeader>
            <MobileFilterSectionContent expanded={mobileExpandedSections.shape}>
              {shapes.map(shape => (
                <MobileFilterOption key={shape} onClick={() => handleShapeChange(shape)}>
                  {shape.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </MobileFilterOption>
              ))}
            </MobileFilterSectionContent>
          </MobileFilterSection>
          
          <MobileFilterSection>
            <MobileFilterSectionHeader onClick={() => toggleMobileSection('color')}>
              <MobileFilterSectionTitle>
                Color
                {filters.color && <SelectedFilterValue>{filters.color}</SelectedFilterValue>}
              </MobileFilterSectionTitle>
              <MobileFilterSectionIcon expanded={mobileExpandedSections.color}>+</MobileFilterSectionIcon>
            </MobileFilterSectionHeader>
            <MobileFilterSectionContent expanded={mobileExpandedSections.color}>
              {colors.map(color => (
                <MobileFilterOption key={color} onClick={() => handleColorChange(color)}>
                  {color.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </MobileFilterOption>
              ))}
            </MobileFilterSectionContent>
          </MobileFilterSection>
          
                    
          <MobileFilterSection>
            <MobileFilterSectionHeader onClick={() => toggleMobileSection('rim')}>
              <MobileFilterSectionTitle>
                Rim
                {filters.rim && <SelectedFilterValue>{filters.rim}</SelectedFilterValue>}
              </MobileFilterSectionTitle>
              <MobileFilterSectionIcon expanded={mobileExpandedSections.rim}>+</MobileFilterSectionIcon>
            </MobileFilterSectionHeader>
            <MobileFilterSectionContent expanded={mobileExpandedSections.rim}>
              <MobileFilterOption>Full Rim</MobileFilterOption>
              <MobileFilterOption>Semi Rim</MobileFilterOption>
              <MobileFilterOption>Rimless</MobileFilterOption>
            </MobileFilterSectionContent>
          </MobileFilterSection>
          
          <MobileFilterSection>
            <MobileFilterSectionHeader onClick={() => toggleMobileSection('price')}>
              <MobileFilterSectionTitle>
                  Price
                  {filters.priceRange && <SelectedFilterValue>{formatPrice(filters.priceRange.min)} - {formatPrice(filters.priceRange.max)}</SelectedFilterValue>}
                </MobileFilterSectionTitle>
              <MobileFilterSectionIcon expanded={mobileExpandedSections.price}>+</MobileFilterSectionIcon>
            </MobileFilterSectionHeader>
            <MobileFilterSectionContent expanded={mobileExpandedSections.price}>
              <MobileFilterOption>Under $50</MobileFilterOption>
              <MobileFilterOption>$50 - $100</MobileFilterOption>
              <MobileFilterOption>$100 - $200</MobileFilterOption>
              <MobileFilterOption>Over $200</MobileFilterOption>
            </MobileFilterSectionContent>
          </MobileFilterSection>
          
          <MobileFilterSection>
            <MobileFilterSectionHeader onClick={() => toggleMobileSection('fit')}>
              <MobileFilterSectionTitle>
                Fit
                {filters.fit && <SelectedFilterValue>{filters.fit}</SelectedFilterValue>}
              </MobileFilterSectionTitle>
              <MobileFilterSectionIcon expanded={mobileExpandedSections.fit}>+</MobileFilterSectionIcon>
            </MobileFilterSectionHeader>
            <MobileFilterSectionContent expanded={mobileExpandedSections.fit}>
              <MobileFilterOption>Narrow</MobileFilterOption>
              <MobileFilterOption>Medium</MobileFilterOption>
              <MobileFilterOption>Wide</MobileFilterOption>
            </MobileFilterSectionContent>
          </MobileFilterSection>
        </MobileFilterContent>
        
        <MobileApplyButton onClick={() => setShowFilters(false)}>
          Apply
        </MobileApplyButton>
      </MobileFilterModal>
    </PageContainer>
  );
};

export default ProductListingPage;