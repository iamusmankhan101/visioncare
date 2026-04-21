import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useSearchParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import { fetchProducts, setFilters, resetFilters } from '../redux/slices/productSlice';
import formatPrice from '../utils/formatPrice';

const PageContainer = styled.div`
  max-width: 1450px;
  margin: 0 auto;
  padding: 2rem 1rem;
  margin-top: 120px;
  
  @media (max-width: 768px) {
    margin-top: 80px;
    padding: 1rem 0.5rem;
  }
`;

const BannerSection = styled.div`
  background: linear-gradient(90deg, rgba(72, 178, 238, 0.8) 0%, rgba(200, 134, 13, 0.1) 100%), 
              url('/images/TreeCityEyeCare-MissingAssets-Hero-ContactLensExamsFittings.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  color: white;
  padding: 2rem 2rem;
  text-align: left;
  margin-bottom: 0;
  position: relative;
  min-height: 200px;
  display: flex;
  align-items: center;
  margin-top: -90px;
  border-radius: 10px;
  
  @media (max-width: 768px) {
    padding: 2rem 1rem;
    text-align: center;
    min-height: 150px;
  }
`;

const BannerContent = styled.div`
  width: 100%;
`;

const PageTitle = styled.h1`
  font-size: 2.8rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  color: white;
  
  @media (max-width: 768px) {
    font-size: 2.2rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.8rem;
  }
`;

const MainContent = styled.div`
  width: 100%;
`;

const CategoryTabs = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid #eee;
  
  @media (max-width: 768px) {
    flex-wrap: wrap;
    gap: 0.5rem;
  }
`;

const CategoryTab = styled.button`
  background: none;
  border: none;
  padding: 1rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  color: ${props => props.active ? '#48b2ee' : '#666'};
  border-bottom: 2px solid ${props => props.active ? '#48b2ee' : 'transparent'};
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    color: #48b2ee;
  }
  
  @media (max-width: 768px) {
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
  }
`;

const ProductsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
`;

const ResultsCount = styled.p`
  color: #666;
  font-size: 0.9rem;
`;

const SortSelect = styled.select`
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
  background: white;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #48b2ee;
  }
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const ProductCard = styled.div`
  border-radius: 12px;
  overflow: hidden;
  background-color: #f5f5f5;
  height: fit-content;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  }
`;

const ProductImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
`;

const ProductContent = styled.div`
  padding: 1rem;
  height: fit-content;
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

const ProductName = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #333;
  line-height: 1.3;
  
  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`;

const ProductPrice = styled.p`
  font-weight: 600;
  color: #333;
  margin-bottom: 0.25rem;
  font-size: 1rem;
`;

const CategoryBadge = styled.span`
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  background-color: rgba(72, 178, 238, 0.9);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  z-index: 2;
`;

const NoResults = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: #666;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 3rem;
  font-size: 1.1rem;
  color: #666;
`;

const LensesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  
  const dispatch = useDispatch();
  const { items: products, loading, filters } = useSelector(state => state.products);
  
  const lensCategories = [
    { key: 'all', label: 'All Lenses', description: 'Browse all available lens types' },
    { key: 'contact-lenses', label: 'Contact Lenses', description: 'Comfortable daily and monthly contact lenses' },
    { key: 'transparent-lenses', label: 'Transparent Lenses', description: 'Clear prescription lenses for everyday wear' },
    { key: 'colored-lenses', label: 'Colored Lenses', description: 'Fashion and cosmetic colored contact lenses' },
    { key: 'prescription-lenses', label: 'Prescription Lenses', description: 'Custom prescription lenses for vision correction' }
  ];
  
  // Get category from URL params
  useEffect(() => {
    const category = searchParams.get('category');
    if (category && lensCategories.find(cat => cat.key === category)) {
      setActiveCategory(category);
    } else {
      setActiveCategory('all');
    }
  }, [searchParams]);
  
  // Fetch products on component mount
  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);
  
  // Filter products to show only lens products
  const filteredProducts = products.filter(product => {
    // Updated lens categories to match admin form
    const lensCategories = ['contact-lenses', 'transparent-lenses', 'colored-lenses', 'prescription-lenses'];
    const lensNames = ['FreshKon Mosaic', 'Acuvue Oasys', 'Bella Elite', 'Dailies AquaComfort', 'Solotica Natural', 'Air Optix Colors'];
    const lensBrands = ['FreshKon', 'Acuvue', 'Bella', 'Alcon', 'Solotica'];
    
    // Include only lens products
    const isLensProduct = lensCategories.includes(product.category) ||
                         lensNames.some(name => product.name.includes(name)) ||
                         lensBrands.includes(product.brand);
    
    if (!isLensProduct) return false;
    
    // Apply category filter if not 'all'
    if (activeCategory === 'all') {
      return true;
    }
    
    const categoryMap = {
      'contact-lenses': 'contact-lenses',
      'transparent-lenses': 'transparent-lenses',
      'colored-lenses': 'colored-lenses',
      'prescription-lenses': 'prescription-lenses'
    };
    
    return product.category === categoryMap[activeCategory];
  });
  
  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'name':
      default:
        return a.name.localeCompare(b.name);
    }
  });
  
  const handleCategoryChange = (categoryKey) => {
    setActiveCategory(categoryKey);
    if (categoryKey === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ category: categoryKey });
    }
  };
  
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };
  
  const currentCategory = lensCategories.find(cat => cat.key === activeCategory);
  
  return (
    <PageContainer>
      <BannerSection>
        <BannerContent>
          <PageTitle>Shop Your Favourite Lenses</PageTitle>
        </BannerContent>
      </BannerSection>
      
      <MainContent>
          <CategoryTabs>
            {lensCategories.map(category => (
              <CategoryTab
                key={category.key}
                active={activeCategory === category.key}
                onClick={() => handleCategoryChange(category.key)}
              >
                {category.label}
              </CategoryTab>
            ))}
          </CategoryTabs>
          
          <ProductsHeader>
            <ResultsCount>
              {sortedProducts.length} {sortedProducts.length === 1 ? 'product' : 'products'} found
            </ResultsCount>
            
            <SortSelect value={sortBy} onChange={handleSortChange}>
              <option value="name">Sort by Name</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </SortSelect>
          </ProductsHeader>
          
          {loading ? (
            <LoadingSpinner>Loading lenses...</LoadingSpinner>
          ) : sortedProducts.length > 0 ? (
            <ProductGrid>
              {sortedProducts.map(product => (
                <ProductCard key={product.id}>
                  <CategoryBadge>{product.category}</CategoryBadge>
                  <Link to={`/lenses/${product.id}`}>
                    <ProductImage 
                      src={product.image || '/images/default-product.jpg'} 
                      alt={product.name}
                      onError={(e) => {
                        e.target.src = '/images/default-product.jpg';
                      }}
                    />
                    <ProductContent>
                      <ProductBrand>{product.brand || 'Vision Care'}</ProductBrand>
                      <ProductName>{product.name}</ProductName>
                      <ProductPrice>{formatPrice(product.price)}</ProductPrice>
                    </ProductContent>
                  </Link>
                </ProductCard>
              ))}
            </ProductGrid>
          ) : (
            <NoResults>
              <h3>No lenses found</h3>
              <p>Try adjusting your filters or browse all categories.</p>
            </NoResults>
          )}
        </MainContent>
    </PageContainer>
  );
};

export default LensesPage;
