import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { FiSearch, FiUser, FiHeart, FiShoppingBag, FiChevronDown, FiMenu, FiX, FiSettings, FiLogOut, FiPhone, FiMail } from 'react-icons/fi';
import { fetchProducts } from '../../redux/slices/productSlice';
import { logout } from '../../redux/slices/authSlice';

const TopBar = styled.div`
  background-color: #48b2ee;
  color: white;
  padding: 0.5rem 2rem;
  font-size: 0.85rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1001;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const TopBarLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
  
  @media (max-width: 768px) {
    gap: 1rem;
  }
`;

const TopBarRight = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const ContactItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  svg {
    font-size: 0.9rem;
  }
  
  a {
    color: white;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const HeaderContainer = styled.header`
  position: fixed;
  top: 30px;
  left: 0;
  right: 0;
  z-index: 1000;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 2rem;
  background-color: #ffffff;
  border-bottom: 1px solid #f0f0f0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  gap: 2rem;
  
  @media (max-width: 768px) {
    top: 0;
    padding: 0.6rem 1rem;
  }
`;

const Logo = styled.div`
  font-size: 1.2rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  
  img {
    height: 24px;
  }
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const Nav = styled.nav`
  display: flex;
  gap: 3rem;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLink = styled(Link)`
  text-decoration: none;
  color: #333;
  font-weight: 500;
  font-size: 0.9rem;
  transition: color 0.3s ease;
  
  &:hover {
    color: #48b2ee;
  }
`;


const DropdownIcon = styled.span`
  margin-left: 4px;
  display: flex;
  align-items: center;
`;

const Dropdown = styled.div`
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  background-color: white;
  min-width: 160px;
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.1);
  z-index: 1;
  border-radius: 4px;
  padding: 0.5rem 0;
  margin-top: 0.5rem;
`;

const DropdownLink = styled(Link)`
  color: #333;
  padding: 0.7rem 1rem;
  text-decoration: none;
  display: block;
  font-size: 0.9rem;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: #f8f8f8;
    color: #ff6b00;
  }
`;

const SearchContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  background-color: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 25px;
  padding: 0.6rem 1rem;
  gap: 0.5rem;
  min-width: 300px;
  max-width: 350px;
  
  @media (max-width: 768px) {
    display: none;
  }

  @media (max-width: 480px) {
    min-width: 120px;
    max-width: 140px;
  }
`;

const SearchInput = styled.input`
  border: none;
  background: transparent;
  outline: none;
  flex: 1;
  font-size: 0.95rem;
  color: #333;
  
  &::placeholder {
    color: #888;
    font-weight: 400;
  }
`;

const SearchMegaMenu = styled.div`
  position: absolute;
  top: 100%;
  left: -50px;
  width: 400px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  z-index: 1000;
  margin-top: 8px;
  padding: 1.5rem;
  display: ${props => props.isOpen ? 'block' : 'none'};
`;

const MegaMenuHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #48b2ee;
  font-size: 1rem;
  font-weight: 600;
  padding: 0;
  
  &:hover {
    text-decoration: underline;
  }
`;

const SuggestedQueries = styled.div`
  margin-bottom: 1.5rem;
`;

const SuggestedQueriesTitle = styled.h4`
  margin: 0 0 0.75rem 0;
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
`;

const QueryTags = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const QueryTag = styled.button`
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  padding: 0.4rem 0.8rem;
  font-size: 0.8rem;
  color: #333;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #48b2ee;
    color: white;
    border-color: #48b2ee;
  }
`;

const SuggestedSection = styled.div`
  display: flex;
  gap: 1.5rem;
`;

const ProductsSection = styled.div`
  flex: 1;
`;

const SectionTitle = styled.h4`
  margin: 0 0 1rem 0;
  font-size: 0.9rem;
  color: #333;
  font-weight: 600;
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
`;

const ProductCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0.5rem;
  border-radius: 8px;
  
  &:hover {
    background: #f8f9fa;
  }
`;

const ProductImage = styled.img`
  width: 80px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
  margin-bottom: 0.5rem;
`;

const ProductName = styled.h5`
  margin: 0 0 0.25rem 0;
  font-size: 0.8rem;
  color: #333;
  font-weight: 500;
`;

const ProductPrice = styled.p`
  margin: 0;
  font-size: 0.8rem;
  color: #333;
  font-weight: 600;
`;

const RecentlyViewed = styled.div`
  width: 80px;
  background: #48b2ee;
  border-radius: 8px;
  padding: 1rem 0.5rem;
  color: white;
  text-align: center;
  font-size: 0.7rem;
  font-weight: 600;
  writing-mode: vertical-rl;
  text-orientation: mixed;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MegaMenuTitle = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  color: #333;
`;

const ProductBrand = styled.p`
  margin: 0 0 0.25rem 0;
  font-size: 0.8rem;
  color: #666;
`;

const SearchOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.3);
  z-index: 999;
  display: ${props => props.isOpen ? 'block' : 'none'};
`;

const IconGroup = styled.div`
  display: flex;
  gap: 1.5rem;
  align-items: center;
  
  @media (max-width: 768px) {
    gap: 0.8rem;
  }
`;

const SignInButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  cursor: pointer;
  padding: 0.5rem 0;
  position: relative;
  
  &:hover {
    color: #48b2ee;
  }
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const UserDropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  z-index: 1000;
  margin-top: 8px;
  min-width: 200px;
  display: ${props => props.isOpen ? 'block' : 'none'};
  animation: ${props => props.isOpen ? 'dropdownSlideIn 0.2s ease-out' : 'none'};
  
  @keyframes dropdownSlideIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const UserInfo = styled.div`
  padding: 1rem;
  border-bottom: 1px solid #f0f0f0;
  background: #f8f9fa;
  border-radius: 8px 8px 0 0;
`;

const UserName = styled.div`
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
`;

const UserEmail = styled.div`
  font-size: 0.8rem;
  color: #666;
`;

const DropdownItem = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: #333;
  text-decoration: none;
  font-size: 0.9rem;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: #f8f9fa;
    color: #48b2ee;
  }
  
  svg {
    font-size: 1rem;
  }
`;

const DropdownButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: #333;
  background: none;
  border: none;
  font-size: 0.9rem;
  cursor: pointer;
  width: 100%;
  text-align: left;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: #f8f9fa;
    color: #48b2ee;
  }
  
  svg {
    font-size: 1rem;
  }
`;

const IconLink = styled(Link)`
  color: #333;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: #48b2ee;
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #333;
  cursor: pointer;
  padding: 0;
  
  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const MobileSearchIcon = styled.div`
  color: #333;
  font-size: 1.2rem;
  display: none;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  
  &:hover {
    color: #48b2ee;
  }
  
  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const MobileSearchOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: white;
  z-index: 1001;
  display: ${props => props.isOpen ? 'flex' : 'none'};
  flex-direction: column;
  padding: 1rem;
  height: 200px;;
`;

const MobileSearchHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f0f0f0;
`;

const MobileSearchInput = styled.input`
  width: 90%;
  padding: 0.75rem 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 25px;
  font-size: 1rem;
  outline: none;
  margin-bottom: 1rem;
  background-color: #f5f5f5;
  
  &:focus {
    border-color: #48b2ee;
    background-color: #fff;
  }
  
  &::placeholder {
    color: #888;
    font-weight: 400;
  }
`;

const MobileProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
  flex: 1;
  overflow-y: auto;
`;

const MobileMenuOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 85%;
  height: 100vh;
  background-color: #ffffff;
  z-index: 1002;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  transform: ${props => props.isOpen ? 'translateX(0)' : 'translateX(-100%)'};
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: ${props => props.isOpen ? '2px 0 10px rgba(0, 0, 0, 0.1)' : 'none'};
  opacity: 1;
  
  @media (max-width: 480px) {
    width: 80%;
  }
`;

const MobileMenuHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f0f0f0;
`;

const MobileMenuNav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  flex: 1;
  animation: ${props => props.isOpen ? 'slideInLinks 0.5s ease-out 0.1s both' : 'none'};
  
  @keyframes slideInLinks {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const MobileNavLink = styled(Link)`
  text-decoration: none;
  color: #333;
  font-weight: 500;
  font-size: 1.1rem;
  padding: 1rem 0;
  border-bottom: 1px solid #f0f0f0;
  transition: color 0.3s ease;
  
  &:hover {
    color: #48b2ee;
  }
`;

const MobileMenuClose = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #333;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MobileMenuBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1001;
  opacity: ${props => props.isOpen ? '1' : '0'};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  transition: opacity 0.3s ease, visibility 0.3s ease;
`;

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMegaMenuOpen, setSearchMegaMenuOpen] = useState(false);
  const [mobileSearchOverlayOpen, setMobileSearchOverlayOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const searchRef = useRef(null);
  const headerRef = useRef(null);
  const userDropdownRef = useRef(null);
  
  const { items: products } = useSelector(state => state.products);
  const { user, isAuthenticated } = useSelector(state => state.auth);
  
  // Fetch products when component mounts
  useEffect(() => {
    if (products.length === 0) {
      dispatch(fetchProducts());
    }
  }, [dispatch, products.length]);
  
  
  // Close mega menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchMegaMenuOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      setSearchMegaMenuOpen(false);
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };
  
  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearchSubmit(e);
    }
  };
  
  const handleSearchIconClick = () => {
    setSearchMegaMenuOpen(!searchMegaMenuOpen);
  };
  
  const handleProductClick = (productId) => {
    setSearchMegaMenuOpen(false);
    setMobileSearchOverlayOpen(false);
    navigate(`/products/${productId}`);
  };
  
  const handleMobileSearchClick = () => {
    setMobileSearchOverlayOpen(true);
  };
  
  const handleMobileSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      setMobileSearchOverlayOpen(false);
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };
  
  const handleSuggestedQuery = (query) => {
    setSearchQuery(query);
    setSearchMegaMenuOpen(false);
    navigate(`/products?search=${encodeURIComponent(query)}`);
  };
  
  const suggestedQueries = ['sunglasses', 'cat eyeglasses', 'reading glasses', 'designer frames'];
  
  const handleSignInClick = () => {
    if (isAuthenticated) {
      setUserDropdownOpen(!userDropdownOpen);
    } else {
      navigate('/auth');
    }
  };
  
  const handleLogout = () => {
    dispatch(logout());
    setUserDropdownOpen(false);
    navigate('/');
  };
  
  // Filter products based on search query
  const filteredProducts = searchQuery.trim() 
    ? products.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.brand && product.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (product.category && product.category.toLowerCase().includes(searchQuery.toLowerCase()))
      ).slice(0, 12) // Limit to 12 products for performance
    : products.slice(0, 12); // Show first 12 products when no search query
  
  
  return (
    <>
      <TopBar>
        <TopBarLeft>
          <ContactItem>
            <FiPhone />
            <a href="tel:+923114782424">+92 311 478 2424</a>
          </ContactItem>
          <ContactItem>
            <FiPhone />
            <a href="tel:+923095571676">+92 309 557 1676</a>
          </ContactItem>
          <ContactItem>
            <FiMail />
            <a href="mailto:Visioncareoptometryclinic@gmail.com">Visioncareoptometryclinic@gmail.com</a>
          </ContactItem>
        </TopBarLeft>
        <TopBarRight>
          <span>Free Shipping on Orders Over PKR 5000</span>
        </TopBarRight>
      </TopBar>
      <HeaderContainer ref={headerRef}>
      <MobileMenuButton onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
        <FiMenu />
      </MobileMenuButton>
      
     <Logo>
  <Link 
    to="/" 
    style={{ textDecoration: 'none', color: '#ff6b00', display: 'flex', alignItems: 'center' }}
  >
    <img 
      src="/images/logo2.png" 
      alt="Vision Care Logo" 
      style={{ height: '60px', marginRight: '8px' }} 
    />
  </Link>
</Logo>

      
      <Nav>
        <NavLink to="/">Home</NavLink>
        <NavLink to="/products?category=eyeglasses">Eyeglasses</NavLink>
        <NavLink to="/products?category=sunglasses">Sunglasses</NavLink>
        <NavLink to="/products?gender=men">Men</NavLink>
        <NavLink to="/products?gender=women">Women</NavLink>
        <NavLink to="/contact">Contact</NavLink>
      </Nav>
      
      <SearchContainer ref={searchRef}>
        <FiSearch 
          onClick={handleSearchIconClick} 
          style={{ cursor: 'pointer', color: '#666', fontSize: '18px' }} 
        />
        <SearchInput 
          placeholder="I'm looking for..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleSearchKeyPress}
          onFocus={() => setSearchMegaMenuOpen(true)}
        />
        {searchMegaMenuOpen && (
          <CloseButton 
            onClick={() => setSearchMegaMenuOpen(false)}
            style={{ 
              position: 'absolute', 
              right: '12px', 
              fontSize: '14px',
              color: '#ff6b00',
              fontWeight: '500'
            }}
          >
            Close
          </CloseButton>
        )}
        
        <SearchMegaMenu isOpen={searchMegaMenuOpen}>
          <MegaMenuHeader>
            <div></div>
            <CloseButton onClick={() => setSearchMegaMenuOpen(false)}>
              Close
            </CloseButton>
          </MegaMenuHeader>
          
          <SuggestedQueries>
            <SuggestedQueriesTitle>Suggested Queries</SuggestedQueriesTitle>
            <QueryTags>
              {suggestedQueries.map((query, index) => (
                <QueryTag key={index} onClick={() => handleSuggestedQuery(query)}>
                  {query}
                </QueryTag>
              ))}
            </QueryTags>
          </SuggestedQueries>
          
          <SuggestedSection>
            <ProductsSection>
              <SectionTitle>Suggested for you:</SectionTitle>
              <ProductGrid>
                {filteredProducts.slice(0, 4).map(product => (
                  <ProductCard key={product.id} onClick={() => handleProductClick(product.id)}>
                    <ProductImage 
                      src={product.image} 
                      alt={product.name}
                      onError={(e) => {
                        e.target.src = '/images/placeholder.jpg';
                      }}
                    />
                    <ProductName>{product.name}</ProductName>
                    <ProductPrice>PKR {product.price}</ProductPrice>
                  </ProductCard>
                ))}
              </ProductGrid>
            </ProductsSection>
            
            
          </SuggestedSection>
        </SearchMegaMenu>
      </SearchContainer>
      
      <SearchOverlay isOpen={searchMegaMenuOpen} onClick={() => setSearchMegaMenuOpen(false)} />
      
      <IconGroup>
        <MobileSearchIcon onClick={handleMobileSearchClick}>
          <FiSearch />
        </MobileSearchIcon>
        <div ref={userDropdownRef} style={{ position: 'relative' }}>
          <SignInButton onClick={handleSignInClick}>
            {isAuthenticated ? (
              <>
                <FiUser />
                {user?.name || 'Account'} <FiChevronDown />
              </>
            ) : (
              <>
                Sign In <FiChevronDown />
              </>
            )}
          </SignInButton>
          
          {isAuthenticated && (
            <UserDropdown isOpen={userDropdownOpen}>
              <UserInfo>
                <UserName>{user?.name || 'User'}</UserName>
                <UserEmail>{user?.email}</UserEmail>
              </UserInfo>
              
              <DropdownItem to="/account" onClick={() => setUserDropdownOpen(false)}>
                <FiUser />
                My Account
              </DropdownItem>
              
              <DropdownItem to="/orders" onClick={() => setUserDropdownOpen(false)}>
                <FiShoppingBag />
                My Orders
              </DropdownItem>
              
              <DropdownItem to="/settings" onClick={() => setUserDropdownOpen(false)}>
                <FiSettings />
                Settings
              </DropdownItem>
              
              <DropdownButton onClick={handleLogout}>
                <FiLogOut />
                Sign Out
              </DropdownButton>
            </UserDropdown>
          )}
        </div>
        <IconLink to="/wishlist"><FiHeart /></IconLink>
        <IconLink to="/cart"><FiShoppingBag /></IconLink>
      </IconGroup>
      
      {/* Mobile Menu Background */}
      <MobileMenuBackdrop 
        isOpen={mobileMenuOpen} 
        onClick={() => setMobileMenuOpen(false)}
      />
      
      {/* Mobile Menu Overlay */}
      <MobileMenuOverlay isOpen={mobileMenuOpen}>
        <MobileMenuHeader>
          <Logo>
            <Link 
              to="/" 
              style={{ textDecoration: 'none', color: '#ff6b00', display: 'flex', alignItems: 'center' }}
              onClick={() => setMobileMenuOpen(false)}
            >
              <img 
                src="/images/logo2.png" 
                alt="Vision Care Logo" 
                style={{ height: '40px', marginRight: '8px' }} 
              />
            </Link>
          </Logo>
          <MobileMenuClose onClick={() => setMobileMenuOpen(false)}>
            <FiX />
          </MobileMenuClose>
        </MobileMenuHeader>
        
        <MobileMenuNav isOpen={mobileMenuOpen}>
          <MobileNavLink to="/" onClick={() => setMobileMenuOpen(false)}>Home</MobileNavLink>
          <MobileNavLink to="/products?category=eyeglasses" onClick={() => setMobileMenuOpen(false)}>Eyeglasses</MobileNavLink>
          <MobileNavLink to="/products?category=sunglasses" onClick={() => setMobileMenuOpen(false)}>Sunglasses</MobileNavLink>
          <MobileNavLink to="/products?gender=men" onClick={() => setMobileMenuOpen(false)}>Men</MobileNavLink>
          <MobileNavLink to="/products?gender=women" onClick={() => setMobileMenuOpen(false)}>Women</MobileNavLink>
          <MobileNavLink to="/contact" onClick={() => setMobileMenuOpen(false)}>Contact</MobileNavLink>
          <MobileNavLink to="/auth" onClick={() => setMobileMenuOpen(false)}>Account</MobileNavLink>
          <MobileNavLink to="/wishlist" onClick={() => setMobileMenuOpen(false)}>Wishlist</MobileNavLink>
          <MobileNavLink to="/cart" onClick={() => setMobileMenuOpen(false)}>Cart</MobileNavLink>
        </MobileMenuNav>
      </MobileMenuOverlay>
      
      {/* Mobile Search Overlay */}
      <MobileSearchOverlay isOpen={mobileSearchOverlayOpen}>
        <MobileSearchHeader>
          <MegaMenuTitle>Search Products</MegaMenuTitle>
          <CloseButton onClick={() => setMobileSearchOverlayOpen(false)}>
            <FiX />
          </CloseButton>
        </MobileSearchHeader>
        
        <MobileSearchInput
          placeholder="Search for eyewear..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleMobileSearchSubmit(e);
            }
          }}
          autoFocus
        />
        
        {/* Search Filter Tags */}
        <div style={{ 
          display: 'flex', 
          gap: '0.5rem', 
          flexWrap: 'wrap', 
          marginBottom: '1rem',
          padding: '0 0.5rem'
        }}>
          {['Ray-Ban', 'Oakley', 'Aviator', 'Cat Eye', 'Round Frames', 'Blue Light', 'Prescription', 'Designer'].map((tag, index) => (
            <button
              key={index}
              onClick={() => {
                setSearchQuery(tag);
                handleMobileSearchSubmit();
              }}
              style={{
                background: '#48b2ee',
                border: '1px solid #48b2ee',
                borderRadius: '20px',
                padding: '0.4rem 0.8rem',
                fontSize: '0.8rem',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                backdropFilter: 'blur(10px)'
              }}
              onMouseOver={(e) => {
                e.target.style.background = '#3a9bd9';
                e.target.style.borderColor = '#3a9bd9';
              }}
              onMouseOut={(e) => {
                e.target.style.background = '#48b2ee';
                e.target.style.borderColor = '#48b2ee';
              }}
            >
              {tag}
            </button>
          ))}
        </div>
        
        <MobileProductGrid>
          {products && products.length > 0 ? (
            searchQuery.trim() ? (
              filteredProducts.length > 0 ? (
                filteredProducts.map(product => (
                  <ProductCard key={product.id} onClick={() => handleProductClick(product.id)}>
                    <ProductImage 
                      src={product.image} 
                      alt={product.name}
                      onError={(e) => {
                        e.target.src = '/images/placeholder.jpg';
                      }}
                    />
                    <ProductName>{product.name}</ProductName>
                    <ProductBrand>{product.brand}</ProductBrand>
                    <ProductPrice>PKR {product.price}</ProductPrice>
                  </ProductCard>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'white' }}>
                  No products found for "{searchQuery}"
                </div>
              )
            ) : (
              products.slice(0, 12).map(product => (
                <ProductCard key={product.id} onClick={() => handleProductClick(product.id)}>
                  <ProductImage 
                    src={product.image} 
                    alt={product.name}
                    onError={(e) => {
                      e.target.src = '/images/placeholder.jpg';
                    }}
                  />
                  <ProductName>{product.name}</ProductName>
                  <ProductBrand>{product.brand}</ProductBrand>
                  <ProductPrice>PKR {product.price}</ProductPrice>
                </ProductCard>
              ))
            )
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'white' }}>
              Loading products...
            </div>
          )}
        </MobileProductGrid>
        
        {filteredProducts.length === 0 && searchQuery.trim() && (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
            No products found for "{searchQuery}"
          </div>
        )}
        
        {filteredProducts.length > 0 && (
          <div style={{ textAlign: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #f0f0f0' }}>
            
          </div>
        )}
      </MobileSearchOverlay>
      </HeaderContainer>
    </>
  );
};

export default Header;