import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { fetchProducts, setFilters, resetFilters, setSortOption, initializeFilteredItems } from '../redux/slices/productSlice';
import { addToCart } from '../redux/slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '../redux/slices/wishlistSlice';
// Import formatPrice utility
import formatPrice from '../utils/formatPrice';
import { generateUniqueSlug } from '../utils/slugUtils';
// At the top of the file, keep only one import for the icons
import { FiHeart, FiX } from 'react-icons/fi';
// Debug components removed for production build

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


const ProductsContainer = styled.div`
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 2rem;
  padding-top:20px;
  
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
  grid-template-columns: ${props => props.viewMode === 'list' ? '1fr' : 'repeat(3, 1fr)'};
  gap: ${props => props.viewMode === 'list' ? '0.75rem' : '0.75rem'};
  flex: 1;
  min-width: 0;
  
  @media (max-width: 768px) {
    grid-template-columns: ${props => props.viewMode === 'list' ? '1fr' : '1fr 1fr'};
    gap: 1rem;
  }
`;

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
  height: fit-content;
  
  &:hover {
    transform: translateY(-5px);
  }
  
  @media (max-width: 768px) {
    padding: 12px;
  }

  @media (max-width: 480px) {
    padding: 10px;
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
  
  @media (max-width: 768px) {
    height: 150px;
    margin-bottom: 12px;
  }
  
  @media (max-width: 480px) {
    height: 120px;
    margin-bottom: 10px;
  }
`;

// Add a DiscountBadge component
const DiscountBadge = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: #e74c3c;
  color: white;
  padding: 4px 8px;
  font-size: 0.7rem;
  border-radius: 4px;
  font-weight: 600;
  z-index: 3;
`;
const ListingCategoryBadge = styled.span`
  position: absolute;
  top: ${props => props.hasDiscount ? '45px' : '10px'};
  left: 10px;
  background: #48b2ee;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  z-index: 2;
  
  @media (max-width: 768px) {
    top: ${props => props.hasDiscount ? '40px' : '8px'};
    left: 8px;
    font-size: 0.65rem;
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
  
  &:hover {
    color: #ff4757;
    transform: scale(1.1);
  }
`;

const ProductContent = styled.div`
  padding: 0.5rem;
  text-align: left;
  background-color: #fff;
  border-radius: 10px;
  position: relative;
  display: flex;
  flex-direction: column;
  
  @media (max-width: 768px) {
    padding: 0.4rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.3rem;
  }
`;

const ProductTitle = styled.h3`
  margin-bottom: 0.5rem;
  font-size: 1rem;
  font-weight: 500;
  color: #333;
  font-family: 'Montserrat', sans-serif;
  line-height: 1.2;
  
  @media (max-width: 480px) {
    font-size: 12px;
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
    margin-bottom: 1.2rem;
  }
`;

const FilterTag = styled.div`
  display: flex;
  align-items: center;
  background-color: #f0f0f0;
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  font-size: 0.85rem;
  
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

const FilterTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const PromoBanner = styled.div`
   background: linear-gradient(-90deg, rgba(72, 178, 238, 0.8) 0%, rgba(200, 134, 13, 0.1) 100%), 
              url('/images/Untitled design (13).png');
  color: white;
  padding: 1rem;
  
  min-height: 180px;
  border-radius: 8px;
  margin-bottom: 1rem;
  margin-bottom: 0;
   background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
  text-align: center;
`;

const MobileViewToggle = styled.div`
  display: flex;
  background: #f5f5f5;
  border-radius: 6px;
  padding: 0.2rem;
  gap: 0.2rem;
`;

const ViewToggleButton = styled.button`
  flex: 1;
  background: ${props => props.active ? '#48b2ee' : 'transparent'};
  color: ${props => props.active ? 'white' : '#666'};
  border: none;
  padding: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
`;

const ProductBrand = styled.p`
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 0.5rem;
  font-weight: 400;
  
  @media (max-width: 480px) {
    font-size: 9px;
  }
`;
const ProductPrice = styled.p`
  font-weight: 600;
  color: #333;
  margin-bottom: 0.25rem;
  font-size: 1.1rem;
  font-family: 'Montserrat', sans-serif;
`;

const PriceContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
  flex-wrap: wrap;
`;

const DiscountedPrice = styled.span`
  font-weight: 600;
  color: #e74c3c;
  font-size: 1.1rem;
  font-family: 'Montserrat', sans-serif;
`;

const OriginalPrice = styled.span`
  font-weight: 400;
  color: #999;
  font-size: 0.9rem;
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
`;

const ColorOptions = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  flex-wrap: wrap;
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

const MobileFilterModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: ${props => props.show ? 'flex' : 'none'};
  flex-direction: column;
  z-index: 1000;
`;

const MobileFilterHeader = styled.div`
  background: white;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
`;

const MobileFilterTitle = styled.h3`
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
`;

const MobileFilterClose = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
`;

const MobileFilterContent = styled.div`
  flex: 1;
  background: white;
  overflow-y: auto;
  padding: 1rem;
`;

const MobileSortSection = styled.div`
  margin-bottom: 2rem;
`;

const MobileSortLabel = styled.h4`
  margin: 0 0 1rem 0;
  font-size: 1rem;
  font-weight: 600;
`;

const MobileSortOption = styled.button`
  display: block;
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  padding: 0.75rem 0;
  font-size: 1rem;
  cursor: pointer;
  border-bottom: 1px solid #eee;
`;

const MobileFilterSection = styled.div`
  margin-bottom: 1.5rem;
`;

const MobileFilterSectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  cursor: pointer;
  border-bottom: 1px solid #eee;
`;

const MobileFilterSectionTitle = styled.h4`
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const MobileFilterSectionIcon = styled.span`
  font-size: 1.2rem;
  color: #666;
`;

const MobileFilterSectionContent = styled.div`
  padding: 1rem 0;
`;

const MobileFilterOption = styled.button`
  display: block;
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  padding: 0.5rem 0;
  font-size: 0.9rem;
  cursor: pointer;
  color: ${props => props.selected ? '#48b2ee' : '#333'};
  font-weight: ${props => props.selected ? '600' : '400'};
`;

const SelectedFilterValue = styled.span`
  font-size: 0.8rem;
  color: #48b2ee;
  font-weight: 400;
`;

const MobileApplyButton = styled.button`
  background: #48b2ee;
  color: white;
  border: none;
  padding: 1rem;
  width: 100%;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
`;

const TopFiltersContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
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
  white-space: nowrap;
`;

const FilterPills = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const FilterPill = styled.button`
  background: ${props => props.active ? '#48b2ee' : '#f5f5f5'};
  color: ${props => props.active ? 'white' : '#666'};
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.active ? '#3a9bd9' : '#e8e8e8'};
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
  white-space: nowrap;
`;

const SortSelect = styled.select`
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  font-size: 0.9rem;
`;

const MobileFilterBar = styled.div`
  display: none;
  
  @media (max-width: 768px) {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;
    margin-bottom: 1rem;
  }
`;

const MobileFilterButton = styled.button`
  background: #48b2ee;
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const MobileResultsCount = styled.span`
  font-size: 0.9rem;
  color: #666;
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


const ProductListingPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { items, filteredItems, filters, sortOption, status, error } = useSelector(state => state.products);
  const { isAuthenticated } = useSelector(state => state.auth);
  const wishlist = useSelector(state => state.wishlist.items);

  // Use Redux state directly - TEMPORARILY BYPASS FILTERING TO DEBUG
  const effectiveItems = items;
  const effectiveFilteredItems = items; // Use all items instead of filtered items to see all products

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
  
  const [minPrice, setMinPrice] = useState(filters.priceRange.min);
  const [maxPrice, setMaxPrice] = useState(filters.priceRange.max);
  const [showFilters, setShowFilters] = useState(false);
  const [wishlistModal, setWishlistModal] = useState({ isOpen: false, type: '', product: null });
  
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
  const [activeQuickFilter, setActiveQuickFilter] = useState('all');
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
  
  
  // Add this function to handle adding products to cart

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

  // Fetch products when component mounts
  useEffect(() => {
    console.log('🚀 ProductListingPage: Component mounted, fetching products...');
    dispatch(fetchProducts());
    
    // TEMPORARY: Clear all filters on mount to debug
    console.log('🧹 Clearing all filters for debugging...');
    dispatch(resetFilters());
  }, [dispatch]);

  // Debug logging
  useEffect(() => {
    console.log('🔍 ProductListingPage Redux Debug:', {
      itemsCount: effectiveItems.length,
      filteredItemsCount: effectiveFilteredItems.length,
      reduxItemsCount: items.length,
      reduxFilteredItemsCount: filteredItems.length,
      filters,
      sortOption,
      status,
      error,
      activeFilters: Object.keys(filters).filter(key => 
        filters[key] !== null && 
        filters[key] !== '' && 
        (Array.isArray(filters[key]) ? filters[key].length > 0 : true)
      )
    });
    
    // Log individual products
    console.log('📦 Redux items:', items.map(p => ({ id: p.id, name: p.name, category: p.category, brand: p.brand })));
    console.log('📦 Redux filtered items:', filteredItems.map(p => ({ id: p.id, name: p.name, category: p.category, brand: p.brand })));
    
    // Check if there are any active filters
    const hasFilters = Object.keys(filters).some(key => {
      const value = filters[key];
      if (key === 'priceRange') return value.min > 0 || value.max < 1000;
      if (key === 'features') return Array.isArray(value) && value.length > 0;
      return value !== null && value !== '';
    });
    console.log('🎯 Has active filters:', hasFilters);
  }, [effectiveItems, effectiveFilteredItems, items, filteredItems, filters, sortOption, status, error]);

  // Get category, search, featured, best-sellers, style, gender, and type from URL query params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryParam = params.get('category');
    const searchParam = params.get('search');
    const featuredParam = params.get('featured');
    const styleParam = params.get('style');
    const genderParam = params.get('gender');
    const typeParam = params.get('type');
    
    
    const newFilters = {};
    let newActiveQuickFilter = 'all'; // default
    
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
    if (genderParam) {
      newFilters.gender = genderParam;
    }
    if (typeParam) {
      newFilters.type = typeParam;
    }
    
    // Update active quick filter based on URL params
    setActiveQuickFilter(newActiveQuickFilter);
    
    
    // Always reset filters first, then apply new ones
    dispatch(resetFilters());
    
    if (Object.keys(newFilters).length > 0) {
      dispatch(setFilters(newFilters));
    }
    
    // Always initialize filtered items after setting filters
    dispatch(initializeFilteredItems());
  }, [dispatch, location.search, effectiveItems.length]);
  
  
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

  const handleGenderChange = (gender) => {
    const newGender = filters.gender === gender ? null : gender;
    dispatch(setFilters({ gender: newGender }));
  };

  const handleSizeChange = (size) => {
    const newSize = filters.size === size ? null : size;
    dispatch(setFilters({ size: newSize }));
  };

  const handleRimChange = (rim) => {
    const newRim = filters.rim === rim ? null : rim;
    dispatch(setFilters({ rim: newRim }));
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
  const categories = [...new Set(effectiveItems.map(item => item.category))];
  const brands = [...new Set(effectiveItems.filter(item => item.brand).map(item => item.brand))].sort();
  const materials = [...new Set(effectiveItems.filter(item => item.material).map(item => item.material))];
  const shapes = [...new Set(effectiveItems.filter(item => item.shape).map(item => item.shape))];
  const colors = [...new Set(effectiveItems.filter(item => item.color).map(item => item.color))];
  const allFeatures = [...new Set(effectiveItems.filter(item => item.features && Array.isArray(item.features)).flatMap(item => item.features.filter(feature => typeof feature === 'string')))];
  
  // Get active filters for tags
  const activeFilters = [];
  if (filters.category) activeFilters.push({ type: 'category', value: filters.category });
  if (filters.brand) activeFilters.push({ type: 'brand', value: filters.brand });
  if (filters.search) activeFilters.push({ type: 'search', value: filters.search });
  if (filters.material) activeFilters.push({ type: 'material', value: filters.material });
  if (filters.shape) activeFilters.push({ type: 'shape', value: filters.shape });
  if (filters.color) activeFilters.push({ type: 'color', value: filters.color });
  if (filters.gender) activeFilters.push({ type: 'gender', value: filters.gender });
  if (filters.size) activeFilters.push({ type: 'size', value: filters.size });
  if (filters.rim) activeFilters.push({ type: 'rim', value: filters.rim });
  if (filters.type) activeFilters.push({ type: 'type', value: filters.type });
  if (filters.style) activeFilters.push({ type: 'style', value: filters.style });
  filters.features.forEach(feature => activeFilters.push({ type: 'feature', value: feature }));
  
  // Filter categories for sidebar - use actual categories from products
  const filterCategories = categories.filter(category => category).map(category => ({
    id: category,
    name: typeof category === 'string' ? category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : category
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
        <MobileResultsCount>{effectiveFilteredItems.length} Results</MobileResultsCount>
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
              {typeof filter.value === 'string' ? filter.value.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : filter.value}
              <button onClick={() => {
                if (filter.type === 'category') handleCategoryChange(null);
                if (filter.type === 'brand') handleBrandChange(null);
                if (filter.type === 'search') dispatch(setFilters({ search: null }));
                if (filter.type === 'material') handleMaterialChange(null);
                if (filter.type === 'shape') handleShapeChange(null);
                if (filter.type === 'color') handleColorChange(null);
                if (filter.type === 'gender') handleGenderChange(null);
                if (filter.type === 'size') handleSizeChange(null);
                if (filter.type === 'rim') handleRimChange(null);
                if (filter.type === 'type') dispatch(setFilters({ type: null }));
                if (filter.type === 'style') dispatch(setFilters({ style: null }));
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
                  <input 
                    type="radio" 
                    name="gender" 
                    checked={filters.gender === 'men'}
                    onChange={() => handleGenderChange('men')}
                  />
                  Men
                </CheckboxLabel>
                <CheckboxLabel>
                  <input 
                    type="radio" 
                    name="gender" 
                    checked={filters.gender === 'women'}
                    onChange={() => handleGenderChange('women')}
                  />
                  Women
                </CheckboxLabel>
                <CheckboxLabel>
                  <input 
                    type="radio" 
                    name="gender" 
                    checked={filters.gender === 'unisex'}
                    onChange={() => handleGenderChange('unisex')}
                  />
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
                  <input 
                    type="radio" 
                    name="size" 
                    checked={filters.size === 'small'}
                    onChange={() => handleSizeChange('small')}
                  />
                  Small
                </CheckboxLabel>
                <CheckboxLabel>
                  <input 
                    type="radio" 
                    name="size" 
                    checked={filters.size === 'medium'}
                    onChange={() => handleSizeChange('medium')}
                  />
                  Medium
                </CheckboxLabel>
                <CheckboxLabel>
                  <input 
                    type="radio" 
                    name="size" 
                    checked={filters.size === 'large'}
                    onChange={() => handleSizeChange('large')}
                  />
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
                  <input 
                    type="radio" 
                    name="rim" 
                    checked={filters.rim === 'full-rim'}
                    onChange={() => handleRimChange('full-rim')}
                  />
                  Full Rim
                </CheckboxLabel>
                <CheckboxLabel>
                  <input 
                    type="radio" 
                    name="rim" 
                    checked={filters.rim === 'semi-rim'}
                    onChange={() => handleRimChange('semi-rim')}
                  />
                  Semi Rim
                </CheckboxLabel>
                <CheckboxLabel>
                  <input 
                    type="radio" 
                    name="rim" 
                    checked={filters.rim === 'rimless'}
                    onChange={() => handleRimChange('rimless')}
                  />
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
                    {typeof feature === 'string' ? feature.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : feature}
                  </CheckboxLabel>
                ))}
              </FilterSection>
            )}
            
            {activeFilters.length > 0 && (
              <FilterTags>
                {activeFilters.map((filter, index) => (
                  <FilterTag key={index}>
                    {typeof filter.value === 'string' ? filter.value.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : filter.value}
                    <button onClick={() => {
                      if (filter.type === 'category') handleCategoryChange(null);
                      if (filter.type === 'brand') handleBrandChange(null);
                      if (filter.type === 'search') dispatch(setFilters({ search: null }));
                      if (filter.type === 'material') handleMaterialChange(null);
                      if (filter.type === 'shape') handleShapeChange(null);
                      if (filter.type === 'color') handleColorChange(null);
                      if (filter.type === 'gender') handleGenderChange(null);
                      if (filter.type === 'size') handleSizeChange(null);
                      if (filter.type === 'rim') handleRimChange(null);
                      if (filter.type === 'type') dispatch(setFilters({ type: null }));
                      if (filter.type === 'style') dispatch(setFilters({ style: null }));
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
            
            {effectiveFilteredItems.length === 0 && (
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
                  {(() => {
                    console.log('🔍 ProductListingPage Debug:');
                    console.log('📊 Total effectiveFilteredItems:', effectiveFilteredItems.length);
                    console.log('📦 Sample products:', effectiveFilteredItems.slice(0, 3).map(p => ({ name: p.name, category: p.category, brand: p.brand })));
                    
                    const filteredProducts = effectiveFilteredItems.filter(product => {
                      const lensCategories = ['Contact Lenses', 'Transparent Lenses', 'Colored Lenses'];
                      const lensNames = ['FreshKon Mosaic', 'Acuvue Oasys', 'Bella Elite', 'Dailies AquaComfort', 'Solotica Natural', 'Air Optix Colors'];
                      const lensBrands = ['FreshKon', 'Acuvue', 'Bella', 'Alcon', 'Solotica'];
                      
                      // Debug each product
                      const isLensCategory = lensCategories.includes(product.category);
                      const hasLensName = lensNames.some(name => product.name.includes(name));
                      const isLensBrand = lensBrands.includes(product.brand);
                      
                      if (isLensCategory || hasLensName || isLensBrand) {
                        console.log(`🚫 Filtering out: ${product.name} (Category: ${product.category}, Brand: ${product.brand})`);
                        return false;
                      }
                      
                      console.log(`✅ Keeping: ${product.name} (Category: ${product.category}, Brand: ${product.brand})`);
                      return true;
                    });
                    
                    console.log('📊 Final products to show:', filteredProducts.length);
                    
                    if (filteredProducts.length === 0) {
                      return [(
                        <div key="no-products" style={{
                          gridColumn: '1 / -1',
                          textAlign: 'center',
                          padding: '3rem 1rem',
                          color: '#666',
                          fontSize: '1.1rem'
                        }}>
                          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👓</div>
                          <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>No products found</div>
                          <div style={{ fontSize: '0.9rem' }}>
                            {effectiveFilteredItems.length === 0 
                              ? 'No products available in the system' 
                              : 'All products were filtered out (lens products excluded)'
                            }
                          </div>
                          {activeFilters.length > 0 && (
                            <button 
                              onClick={handleResetFilters}
                              style={{
                                marginTop: '1rem',
                                padding: '0.5rem 1rem',
                                background: '#3ABEF9',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                              }}
                            >
                              Clear All Filters
                            </button>
                          )}
                        </div>
                      )];
                    }
                    
                    return filteredProducts;
                  })().map(product => (
                    <ProductCard key={product.id}>
                                  {product.discount && product.discount.hasDiscount && (
                                    <DiscountBadge>
                                      {typeof product.discount === 'string' ? product.discount : `${product.discount.discountPercentage}% OFF`}
                                    </DiscountBadge>
                                  )}
                                  <ListingCategoryBadge hasDiscount={product.discount && product.discount.hasDiscount}>
                                    {product.category}
                                  </ListingCategoryBadge>
                                 
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
                                    <ProductImage image={product.image}>
                                     
                                    </ProductImage>
                                    <ProductContent>
                                      <ProductTitle>{product.name}</ProductTitle>
                                      <ProductBrand>{product.brand || 'Eyewear'}</ProductBrand>
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
                                          return <ProductPrice>{formatPrice(product.price)}</ProductPrice>;
                                        }
                                      })()}
                                      <ColorOptions>
                                        {product.colors && product.colors.map((color, index) => (
                                          <ColorSwatch key={index} color={color.hex || color.name} />
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
                  {typeof category === 'string' ? category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : category}
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
              <MobileFilterOption 
                onClick={() => handleGenderChange('men')}
                style={{ 
                  backgroundColor: filters.gender === 'men' ? '#f0f0f0' : 'transparent',
                  fontWeight: filters.gender === 'men' ? '600' : '400'
                }}
              >
                Men
              </MobileFilterOption>
              <MobileFilterOption 
                onClick={() => handleGenderChange('women')}
                style={{ 
                  backgroundColor: filters.gender === 'women' ? '#f0f0f0' : 'transparent',
                  fontWeight: filters.gender === 'women' ? '600' : '400'
                }}
              >
                Women
              </MobileFilterOption>
              <MobileFilterOption 
                onClick={() => handleGenderChange('unisex')}
                style={{ 
                  backgroundColor: filters.gender === 'unisex' ? '#f0f0f0' : 'transparent',
                  fontWeight: filters.gender === 'unisex' ? '600' : '400'
                }}
              >
                Unisex
              </MobileFilterOption>
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
                  {typeof shape === 'string' ? shape.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : shape}
                </MobileFilterOption>
              ))}
            </MobileFilterSectionContent>
          </MobileFilterSection>
          
          <MobileFilterSection>
            <MobileFilterSectionHeader onClick={() => toggleMobileSection('size')}>
              <MobileFilterSectionTitle>
                Size
                {filters.size && <SelectedFilterValue>{filters.size === 'small' ? 'Small' : filters.size === 'medium' ? 'Medium' : 'Large'}</SelectedFilterValue>}
              </MobileFilterSectionTitle>
              <MobileFilterSectionIcon expanded={mobileExpandedSections.size}>+</MobileFilterSectionIcon>
            </MobileFilterSectionHeader>
            <MobileFilterSectionContent expanded={mobileExpandedSections.size}>
              <MobileFilterOption 
                onClick={() => handleSizeChange('small')}
                style={{ 
                  backgroundColor: filters.size === 'small' ? '#f0f0f0' : 'transparent',
                  fontWeight: filters.size === 'small' ? '600' : '400'
                }}
              >
                Small
              </MobileFilterOption>
              <MobileFilterOption 
                onClick={() => handleSizeChange('medium')}
                style={{ 
                  backgroundColor: filters.size === 'medium' ? '#f0f0f0' : 'transparent',
                  fontWeight: filters.size === 'medium' ? '600' : '400'
                }}
              >
                Medium
              </MobileFilterOption>
              <MobileFilterOption 
                onClick={() => handleSizeChange('large')}
                style={{ 
                  backgroundColor: filters.size === 'large' ? '#f0f0f0' : 'transparent',
                  fontWeight: filters.size === 'large' ? '600' : '400'
                }}
              >
                Large
              </MobileFilterOption>
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
                  {typeof shape === 'string' ? shape.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : shape}
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
                  {typeof color === 'string' ? color.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : color}
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
              <MobileFilterOption 
                onClick={() => handleRimChange('full-rim')}
                style={{ 
                  backgroundColor: filters.rim === 'full-rim' ? '#f0f0f0' : 'transparent',
                  fontWeight: filters.rim === 'full-rim' ? '600' : '400'
                }}
              >
                Full Rim
              </MobileFilterOption>
              <MobileFilterOption 
                onClick={() => handleRimChange('semi-rim')}
                style={{ 
                  backgroundColor: filters.rim === 'semi-rim' ? '#f0f0f0' : 'transparent',
                  fontWeight: filters.rim === 'semi-rim' ? '600' : '400'
                }}
              >
                Semi Rim
              </MobileFilterOption>
              <MobileFilterOption 
                onClick={() => handleRimChange('rimless')}
                style={{ 
                  backgroundColor: filters.rim === 'rimless' ? '#f0f0f0' : 'transparent',
                  fontWeight: filters.rim === 'rimless' ? '600' : '400'
                }}
              >
                Rimless
              </MobileFilterOption>
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
    </PageContainer>
  );
};

export default ProductListingPage;