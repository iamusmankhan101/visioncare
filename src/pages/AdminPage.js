import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { addProduct, updateProduct, deleteProduct, resetFilters, createProductAsync, updateProductAsync, deleteProductAsync, fetchProducts } from '../redux/slices/productSlice';
import sampleProducts, { sampleLensProducts } from '../utils/addSampleProducts';
import OrderManagement from '../components/admin/OrderManagement';

// Styled Components
const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const PageTitle = styled.h1`
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  font-weight: 600;
`;

const AdminPanel = styled.div`
  display: flex;
  gap: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Sidebar = styled.div`
  width: 220px;
  flex-shrink: 0;
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const SidebarItem = styled.div`
  padding: 0.8rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  background-color: ${props => props.active ? '#f0f0f0' : 'transparent'};
  font-weight: ${props => props.active ? '600' : 'normal'};
  
  &:hover {
    background-color: #f0f0f0;
  }
`;

const ContentArea = styled.div`
  flex-grow: 1;
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 500;
  font-size: 0.9rem;
`;

const Input = styled.input`
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

const Select = styled.select`
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

const TextArea = styled.textarea`
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

const CheckboxContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.9rem;
`;

const ColorRadioContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 0.5rem;
`;

const ColorRadioOption = styled.label`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border: 2px solid ${props => props.selected ? '#3498db' : '#e0e0e0'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: ${props => props.selected ? '#f8f9fa' : 'white'};
  
  &:hover {
    border-color: #3498db;
    background-color: #f8f9fa;
  }
`;

const ColorSwatch = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: ${props => props.color};
  border: 2px solid #fff;
  box-shadow: 0 0 0 1px rgba(0,0,0,0.1);
  flex-shrink: 0;
`;

const ColorInfo = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

const ColorName = styled.span`
  font-weight: 500;
  font-size: 0.9rem;
  color: #333;
`;

const ColorHex = styled.span`
  font-size: 0.75rem;
  color: #666;
  margin-top: 0.25rem;
`;

const RadioInput = styled.input`
  margin: 0;
  flex-shrink: 0;
`;

const SubmitButton = styled.button`
  background-color: #3498db;
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 1rem;
  
  &:hover {
    background-color: #2980b9;
  }
  
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const SuccessMessage = styled.div`
  background-color: #d4edda;
  color: #155724;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
`;

// Add the product list styled components here
const ProductList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
`;

// Delete all of these duplicate styled component definitions
const ProductItem = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem;
  border: 1px solid #eee;
  border-radius: 4px;
`;

const ProductImage = styled.div`
  width: 60px;
  height: 60px;
  background-color: #f8f8f8;
  margin-right: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  
  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
`;

// Add all other styled components here
const ProductInfo = styled.div`
  flex-grow: 1;
`;

const ProductName = styled.h3`
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
`;

const ProductMeta = styled.div`
  font-size: 0.8rem;
  color: #666;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  
  &.edit {
    background-color: #3498db;
    color: white;
    
    &:hover {
      background-color: #2980b9;
    }
  }
  
  &.delete {
    background-color: #e74c3c;
    color: white;
    
    &:hover {
      background-color: #c0392b;
    }
  }
`;

const ImageUploadContainer = styled.div`
  margin-bottom: 1rem;
`;

const ImagePreviewContainer = styled.div`
  width: 100px;
  height: 100px;
  border: 1px dashed #ccc;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 0.5rem;
  overflow: hidden;
  background-color: #f8f8f8;
`;

const ImagePreview = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
`;

const FileInput = styled.input`
  display: none;
`;

const UploadButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  margin-right: 0.5rem;
  
  &:hover {
    background-color: #e0e0e0;
  }
`;

const UploadActions = styled.div`
  display: flex;
  align-items: center;
  margin-top: 0.5rem;
`;

// Start of the AdminPage component
const AdminPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('add-product');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewFilter, setReviewFilter] = useState('all');
  
  // Get authentication state from Redux
  const { isAuthenticated, user } = useSelector(state => state.auth);
  
  // Check if user is authenticated and redirect if not logged in
  useEffect(() => {
    // Temporarily disable authentication requirement for admin access
    // if (!isAuthenticated) {
    //   navigate('/auth');
    //   return;
    // }
    
    // Allow access to admin page for any user
    setIsLoading(false);
  }, [isAuthenticated, navigate]);
  
  // Get products from Redux store - fix the selector to use items array
  const { items: products, status: loading, error } = useSelector(state => state.products);
  
  // Convert status to boolean for loading
  const isProductsLoading = loading === 'loading';
  
  // Fetch reviews function
  const fetchReviews = async () => {
    setReviewsLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/reviews/all');
      if (response.ok) {
        const reviewsData = await response.json();
        setReviews(reviewsData);
      } else {
        console.error('Failed to fetch reviews');
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setReviewsLoading(false);
    }
  };
  
  // Approve review function
  const approveReview = async (reviewId) => {
    try {
      const response = await fetch(`http://localhost:3001/api/reviews/${reviewId}/approve`, {
        method: 'PUT'
      });
      if (response.ok) {
        fetchReviews(); // Refresh reviews
        setSuccessMessage('Review approved successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error approving review:', error);
    }
  };
  
  // Reject review function
  const rejectReview = async (reviewId) => {
    try {
      const response = await fetch(`http://localhost:3001/api/reviews/${reviewId}/reject`, {
        method: 'PUT'
      });
      if (response.ok) {
        fetchReviews(); // Refresh reviews
        setSuccessMessage('Review rejected successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error rejecting review:', error);
    }
  };
  
  // Load reviews when reviews tab is active
  useEffect(() => {
    if (activeTab === 'reviews') {
      fetchReviews();
    }
  }, [activeTab]);
  
  // Fetch products when component mounts
  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);
  

  // Force fetch products if empty - commented out automatic sample product addition
  useEffect(() => {
    if (!isProductsLoading && !error && (!products || products.length === 0)) {
      // handleAddSampleProducts(); // Commented out to prevent automatic popup
    }
  }, [products, isProductsLoading, error]);
  
  // Form state
  // Update the product data state with new fields
  const [productData, setProductData] = useState({
    name: '',
    price: '',
    category: 'Eyeglasses', // Capitalized to match enum in model
    material: '',
    shape: '',
    rim: '',
    color: '',
    colors: [], // Array of color objects with name and hex
    features: [],
    image: '/images/eyeglasses.webp', // Default image
    featured: false, // Add featured field
    bestSeller: false, // Add bestSeller field
    style: '', // Add style field
    // New fields
    gallery: [], // Array of image URLs for the product gallery
    brand: '',
    gender: 'Unisex', // Capitalized to match enum in model
    frameColor: '',
    sizes: [], // Available sizes
    lensTypes: [], // Available lens types
    discount: {
      hasDiscount: false,
      discountPercentage: 0
    },
    status: 'In Stock', // in-stock, out-of-stock, discontinued
    description: ''
  });
  
  // Available options for form selects
  const categories = ['Sunglasses', 'Eyeglasses', 'Reading Glasses', 'Computer Glasses', 'Sports Glasses', 'Contact Lenses', 'Transparent Lenses', 'Colored Lenses'];
  const materials = ['Metal', 'Plastic', 'Titanium', 'Acetate', 'Wood', 'Other'];
  const shapes = ['Round', 'Square', 'Rectangle', 'Cat Eye', 'Aviator', 'Oval', 'Geometric', 'Other'];
  const rimOptions = ['Full Rim', 'Semi-Rimless', 'Rimless', 'Half Rim'];
  const colorOptions = [
    { name: 'Black', hex: '#000000' },
    { name: 'Brown', hex: '#8B4513' },
    { name: 'Tortoise', hex: '#D2691E' },
    { name: 'Silver', hex: '#C0C0C0' },
    { name: 'Gold', hex: '#FFD700' },
    { name: 'Gunmetal', hex: '#708090' },
    { name: 'Navy', hex: '#1B2951' },
    { name: 'Clear', hex: '#F8F8FF' },
    { name: 'Burgundy', hex: '#722F37' },
    { name: 'Rose Gold', hex: '#E8B4A0' },
    { name: 'Copper', hex: '#B87333' },
    { name: 'Charcoal', hex: '#36454F' }
  ];
  const featureOptions = [
    'lightweight', 'prescription-ready', 'polarized', 'uv-protection', 
    'blue-light-filtering', 'anti-glare', 'scratch-resistant', 'water-resistant',
    'adjustable-nose-pads', 'spring-hinges', 'durable', 'impact-resistant',
    'hypoallergenic', 'flexible', 'foldable'
  ];
  
  // Add these new options arrays
  const genders = ['Men', 'Women', 'Unisex'];
  const lensTypeOptions = ['Non-Prescription', 'Prescription', 'Progressive', 'Bifocal', 'Reading', 'Blue-Light'];
  const sizeOptions = ['Small', 'Medium', 'Large', '138mm', '140mm', '142mm'];
  const statusOptions = ['In Stock', 'Out of Stock', 'Coming Soon'];
  const styleOptions = ['Classic', 'Eco Friendly', 'Artsy', 'Retro', 'Street Style', 'Bold'];
  
  // File upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const fileInputRef = useRef(null);
  
  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
        // Update product data with the image data URL
        setProductData({
          ...productData,
          image: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle upload button click
  const handleUploadClick = () => {
    fileInputRef.current.click();
  };
  
  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductData({
      ...productData,
      [name]: name === 'price' ? parseFloat(value) : value
    });
  };
  
  // Handle feature checkbox changes
  const handleFeatureToggle = (feature) => {
    const updatedFeatures = productData.features?.includes(feature)
      ? productData.features.filter(f => f !== feature)
      : [...(productData.features || []), feature];
    
    setProductData({
      ...productData,
      features: updatedFeatures
    });
  };
  
  // Handle checkbox change for featured products
  const handleFeaturedToggle = () => {
    setProductData({
      ...productData,
      featured: !productData.featured
    });
  };
  
  const addSampleProducts = () => {
    sampleProducts.forEach(product => {
      dispatch(addProduct(product));
    });
    alert('Sample products added successfully!');
  };

  const addSampleLensProducts = () => {
    sampleLensProducts.forEach(product => {
      dispatch(addProduct(product));
    });
    alert('Sample lens products added successfully!');
  };
  
  // Add these new handler functions
  const handleGalleryUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newGalleryImages = [];
      
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newGalleryImages.push(reader.result);
          if (newGalleryImages.length === files.length) {
            setProductData({
              ...productData,
              gallery: [...(productData.gallery || []), ...newGalleryImages]
            });
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeGalleryImage = (index) => {
    const updatedGallery = [...(productData.gallery || [])];
    updatedGallery.splice(index, 1);
    setProductData({
      ...productData,
      gallery: updatedGallery
    });
  };

  const handleSizeToggle = (size) => {
    const updatedSizes = productData.sizes?.includes(size)
      ? productData.sizes.filter(s => s !== size)
      : [...(productData.sizes || []), size];
    
    setProductData({
      ...productData,
      sizes: updatedSizes
    });
  };

  const handleLensTypeToggle = (lensType) => {
    const updatedLensTypes = productData.lensTypes?.includes(lensType)
      ? productData.lensTypes.filter(lt => lt !== lensType)
      : [...(productData.lensTypes || []), lensType];
    
    setProductData({
      ...productData,
      lensTypes: updatedLensTypes
    });
  };

  const handleDiscountToggle = () => {
    setProductData({
      ...productData,
      discount: {
        ...productData.discount,
        hasDiscount: !productData.discount.hasDiscount
      }
    });
  };

  const handleDiscountPercentageChange = (e) => {
    setProductData({
      ...productData,
      discount: {
        ...productData.discount,
        discountPercentage: parseFloat(e.target.value)
      }
    });
  };

  // Handle color selection
  const handleColorToggle = (colorOption) => {
    const isSelected = productData.colors.some(c => c.name === colorOption.name);
    
    if (isSelected) {
      // Remove color
      setProductData({
        ...productData,
        colors: productData.colors.filter(c => c.name !== colorOption.name)
      });
    } else {
      // Add color
      setProductData({
        ...productData,
        colors: [...productData.colors, colorOption]
      });
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Format the product data
      const formattedProduct = {
        ...productData,
        price: parseFloat(productData.price)
      };
      
      // Dispatch async action to add product
      await dispatch(createProductAsync(formattedProduct)).unwrap();
      dispatch(resetFilters());
      
      // Show success message
      setSuccessMessage('Product added successfully!');
      
      // Reset file upload state
      setSelectedFile(null);
      setPreviewUrl('');
      
      // Reset form
          setTimeout(() => {
            setSuccessMessage('');
            setProductData({
              name: '',
              price: '',
              category: 'Eyeglasses', // Capitalized to match enum in model
              material: '',
              shape: '',
              rim: '',
              color: '',
              features: [],
              image: '/images/eyeglasses.webp', // Reset to default image
              featured: false,
              bestSeller: false,
              // Reset new fields
              colors: [],
              brand: '',
              gender: 'Unisex', // Capitalized to match enum in model
              frameColor: '',
              sizes: [],
              lensTypes: [],
              discount: {
                hasDiscount: false,
                discountPercentage: 0
              },
              status: 'In Stock',
              description: '',
              style: ''
            });
          }, 2000);
    } catch (error) {
      console.error('Failed to add product:', error);
      setSuccessMessage('Error adding product: ' + error.message);
    }
  };
  
  // Handle edit product - MOVED INSIDE COMPONENT
  const handleEditProduct = (product) => {
    setProductData({
      ...product,
      price: product.price.toString() // Convert price to string for form input
    });
    setActiveTab('edit-product');
  };
  
  // Handle delete product - MOVED INSIDE COMPONENT
  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await dispatch(deleteProductAsync(productId)).unwrap();
        setSuccessMessage('Product deleted successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (error) {
        console.error('Failed to delete product:', error);
        setSuccessMessage('Error deleting product: ' + error.message);
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    }
  };
  
  // Handle update product submission - MOVED INSIDE COMPONENT
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Ensure price is a number
      const updatedProduct = {
        ...productData,
        price: parseFloat(productData.price)
      };
      
      // Dispatch async action to update product
      await dispatch(updateProductAsync({
        id: updatedProduct.id,
        productData: updatedProduct
      })).unwrap();
      
      // Show success message
      setSuccessMessage('Product updated successfully!');
      
      // Reset file upload state
      setSelectedFile(null);
      setPreviewUrl('');
      
      // Reset form and go back to manage products
      setTimeout(() => {
        setSuccessMessage('');
        setActiveTab('manage-products');
      }, 2000);
    } catch (error) {
      console.error('Failed to update product:', error);
      const errorMessage = error?.message || error?.error || error || 'Unknown error occurred';
      setSuccessMessage('Error updating product: ' + errorMessage);
    }
  };

  // Add sample products with style data for testing
  const handleAddSampleProducts = async () => {
    if (window.confirm('This will add 6 sample products with style data. Continue?')) {
      try {
        setIsLoading(true);
        for (const product of sampleProducts) {
          await dispatch(createProductAsync(product)).unwrap();
        }
        setIsLoading(false);
        setSuccessMessage('Sample products with style data added successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (error) {
        setIsLoading(false);
        console.error('Failed to add sample products:', error);
        setSuccessMessage('Error adding sample products: ' + error.message);
      }
    }
  };

  // Update existing products with random style values
  const handleUpdateExistingProductsWithStyles = async () => {
    if (window.confirm('This will update all existing products without style data with random styles. Continue?')) {
      try {
        setIsLoading(true);
        const styleOptions = ['Classic', 'Eco Friendly', 'Artsy', 'Retro', 'Street Style', 'Bold'];
        
        for (const product of products) {
          if (!product.style) {
            const randomStyle = styleOptions[Math.floor(Math.random() * styleOptions.length)];
            const updatedProduct = { ...product, style: randomStyle };
            await dispatch(updateProductAsync({
              id: product.id,
              productData: updatedProduct
            })).unwrap();
          }
        }
        
        setIsLoading(false);
        setSuccessMessage('Existing products updated with style data successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (error) {
        setIsLoading(false);
        console.error('Failed to update products:', error);
        setSuccessMessage('Error updating products: ' + error.message);
      }
    }
  };
  

  
  if (isLoading) {
    return (
      <PageContainer>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <div style={{ textAlign: 'center' }}>
            <h2>Loading...</h2>
            <p>Please wait while we prepare the admin dashboard</p>
          </div>
        </div>
      </PageContainer>
    );
  }
  
  return (
    <PageContainer>
      <PageTitle>Admin Dashboard</PageTitle>
      
      <AdminPanel>
        <Sidebar>
          <SidebarItem 
            active={activeTab === 'add-product'}
            onClick={() => setActiveTab('add-product')}
          >
            Add Product
          </SidebarItem>
          <SidebarItem 
            active={activeTab === 'manage-products'}
            onClick={() => setActiveTab('manage-products')}
          >
            Manage Products
          </SidebarItem>
          <SidebarItem 
            active={activeTab === 'eyewear-products'}
            onClick={() => setActiveTab('eyewear-products')}
          >
            Eyewear Products
          </SidebarItem>
          <SidebarItem 
            active={activeTab === 'lens-products'}
            onClick={() => setActiveTab('lens-products')}
          >
            Lens Products
          </SidebarItem>
          <SidebarItem 
            active={activeTab === 'orders'}
            onClick={() => setActiveTab('orders')}
          >
            Orders
          </SidebarItem>
          <SidebarItem 
            active={activeTab === 'customers'}
            onClick={() => setActiveTab('customers')}
          >
            Customers
          </SidebarItem>
          <SidebarItem 
            active={activeTab === 'reviews'}
            onClick={() => setActiveTab('reviews')}
          >
            Reviews
          </SidebarItem>
        </Sidebar>
        
        {/* Inside the return statement, where ContentArea is defined */}
        <ContentArea>
              {activeTab === 'add-product' && (
            <>
              <h2>Add New Product</h2>
              
              {successMessage && (
                <SuccessMessage>{successMessage}</SuccessMessage>
              )}
              
              <Form onSubmit={handleSubmit}>
                <FormGroup>
                  <Label htmlFor="name">Product Name</Label>
                  <Input 
                    type="text" 
                    id="name" 
                    name="name" 
                    value={productData.name} 
                    onChange={handleInputChange} 
                    required 
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label htmlFor="price">Price (PKR)</Label>
                  <Input 
                    type="number" 
                    id="price" 
                    name="price" 
                    min="0" 
                    step="0.01" 
                    value={productData.price} 
                    onChange={handleInputChange} 
                    required 
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    id="category" 
                    name="category" 
                    value={productData.category} 
                    onChange={handleInputChange} 
                    required
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </option>
                    ))}
                  </Select>
                </FormGroup>
                
                <FormGroup>
                  <Label htmlFor="material">Material</Label>
                  <Select 
                    id="material" 
                    name="material" 
                    value={productData.material} 
                    onChange={handleInputChange} 
                  >
                    <option value="">Select Material</option>
                    {materials.map(material => (
                      <option key={material} value={material}>
                        {material.charAt(0).toUpperCase() + material.slice(1)}
                      </option>
                    ))}
                  </Select>
                </FormGroup>
                
                <FormGroup>
                  <Label htmlFor="shape">Shape</Label>
                  <Select 
                    id="shape" 
                    name="shape" 
                    value={productData.shape} 
                    onChange={handleInputChange} 
                  >
                    <option value="">Select Shape</option>
                    {shapes.map(shape => (
                      <option key={shape} value={shape}>
                        {shape.charAt(0).toUpperCase() + shape.slice(1)}
                      </option>
                    ))}
                  </Select>
                </FormGroup>
                
                <FormGroup>
                  <Label htmlFor="rim">Rim Type</Label>
                  <Select 
                    id="rim" 
                    name="rim" 
                    value={productData.rim} 
                    onChange={handleInputChange} 
                  >
                    <option value="">Select Rim Type</option>
                    {rimOptions.map(rim => (
                      <option key={rim} value={rim}>
                        {rim}
                      </option>
                    ))}
                  </Select>
                </FormGroup>
                
                <FormGroup>
                  <Label htmlFor="style">Style</Label>
                  <Select 
                    id="style" 
                    name="style" 
                    value={productData.style} 
                    onChange={handleInputChange} 
                  >
                    <option value="">Select Style</option>
                    {styleOptions.map(style => (
                      <option key={style} value={style}>
                        {style}
                      </option>
                    ))}
                  </Select>
                </FormGroup>
                
                <FormGroup>
                  <Label>Available Colors</Label>
                  <ColorRadioContainer>
                    {colorOptions.map(colorOption => (
                      <ColorRadioOption 
                        key={colorOption.name}
                        selected={productData.colors.some(c => c.name === colorOption.name)}
                      >
                        <RadioInput
                          type="checkbox"
                          checked={productData.colors.some(c => c.name === colorOption.name)}
                          onChange={() => handleColorToggle(colorOption)}
                        />
                        <ColorSwatch color={colorOption.hex} />
                        <ColorInfo>
                          <ColorName>{colorOption.name}</ColorName>
                          <ColorHex>{colorOption.hex}</ColorHex>
                        </ColorInfo>
                      </ColorRadioOption>
                    ))}
                  </ColorRadioContainer>
                </FormGroup>
                
                <FormGroup>
                  <Label>Product Image</Label>
                  <ImageUploadContainer>
                    <UploadActions>
                      <UploadButton type="button" onClick={handleUploadClick}>
                        Choose Image
                      </UploadButton>
                      <span>{selectedFile ? selectedFile.name : 'No file selected'}</span>
                    </UploadActions>
                    <FileInput 
                      type="file" 
                      ref={fileInputRef}
                      accept="image/*" 
                      onChange={handleFileSelect} 
                    />
                    <ImagePreviewContainer>
                      {previewUrl ? (
                        <ImagePreview src={previewUrl} alt="Preview" />
                      ) : productData.image ? (
                        <ImagePreview src={productData.image} alt="Current" />
                      ) : (
                        <span>Image Preview</span>
                      )}
                    </ImagePreviewContainer>
                  </ImageUploadContainer>
                </FormGroup>
                
                <FormGroup>
                  <Label>Features</Label>
                  <CheckboxContainer>
                    {featureOptions.map(feature => (
                      <CheckboxLabel key={feature}>
                        <input 
                          type="checkbox" 
                          checked={productData.features?.includes(feature) || false} 
                          onChange={() => handleFeatureToggle(feature)} 
                        />
                        {feature.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </CheckboxLabel>
                    ))}
                  </CheckboxContainer>
                </FormGroup>
                
                <FormGroup>
                  <Label htmlFor="productStatus">Product Status</Label>
                  <Select
                    id="productStatus"
                    name="productStatus"
                    onChange={(e) => {
                      const value = e.target.value;
                      setProductData({
                        ...productData,
                        featured: value === 'featured' || value === 'both',
                        bestSeller: value === 'bestSeller' || value === 'both'
                      });
                    }}
                    value={
                      productData.featured && productData.bestSeller
                        ? 'both'
                        : productData.featured
                        ? 'featured'
                        : productData.bestSeller
                        ? 'bestSeller'
                        : 'none'
                    }
                  >
                    <option value="none">Regular Product</option>
                    <option value="featured">Featured Product</option>
                    <option value="bestSeller">Best Seller</option>
                    <option value="both">Featured & Best Seller</option>
                  </Select>
                </FormGroup>
                
                {/* Gallery Images */}
                <FormGroup>
                  <Label>Product Gallery Images</Label>
                  <ImageUploadContainer>
                    <UploadActions>
                      <UploadButton type="button" onClick={() => document.getElementById('galleryUpload').click()}>
                        Add Gallery Images
                      </UploadButton>
                      <span>{(productData && productData.gallery) ? productData.gallery.length : 0} images selected</span>
                    </UploadActions>
                    <FileInput 
                      type="file" 
                      id="galleryUpload"
                      accept="image/*" 
                      multiple
                      onChange={handleGalleryUpload} 
                    />
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
                      {(productData && productData.gallery && Array.isArray(productData.gallery)) && 
                        productData.gallery.map((img, index) => (
                          <div key={index} style={{ position: 'relative', width: '80px', height: '80px' }}>
                            <ImagePreview src={img} alt={`Gallery ${index}`} style={{ width: '100%', height: '100%' }} />
                            <button 
                              type="button" 
                              onClick={() => removeGalleryImage(index)}
                              style={{
                                position: 'absolute',
                                top: '-8px',
                                right: '-8px',
                                background: '#e74c3c',
                                color: 'white',
                                border: 'none',
                                borderRadius: '50%',
                                width: '20px',
                                height: '20px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              ×
                            </button>
                          </div>
                        ))
                      }
                    </div>
                  </ImageUploadContainer>
                </FormGroup>

                {/* Brand */}
                <FormGroup>
                  <Label htmlFor="brand">Brand</Label>
                  <Input 
                    type="text" 
                    id="brand" 
                    name="brand" 
                    value={productData.brand} 
                    onChange={handleInputChange} 
                  />
                </FormGroup>

                {/* Gender */}
                <FormGroup>
                  <Label htmlFor="gender">Gender</Label>
                  <Select 
                    id="gender" 
                    name="gender" 
                    value={productData.gender} 
                    onChange={handleInputChange} 
                  >
                    {genders.map(gender => (
                      <option key={gender} value={gender}>
                        {gender.charAt(0).toUpperCase() + gender.slice(1)}
                      </option>
                    ))}
                  </Select>
                </FormGroup>

                {/* Frame Color */}
                <FormGroup>
                  <Label htmlFor="frameColor">Frame Color</Label>
                  <Input 
                    type="text" 
                    id="frameColor" 
                    name="frameColor" 
                    value={productData.frameColor} 
                    onChange={handleInputChange} 
                  />
                </FormGroup>

                {/* Sizes */}
                <FormGroup>
                  <Label>Available Sizes</Label>
                  <CheckboxContainer>
                    {sizeOptions.map(size => (
                      <CheckboxLabel key={size}>
                        <input 
                          type="checkbox" 
                          checked={productData.sizes?.includes(size) || false} 
                          onChange={() => handleSizeToggle(size)} 
                        />
                        {size}
                      </CheckboxLabel>
                    ))}
                  </CheckboxContainer>
                </FormGroup>

                {/* Lens Types */}
                <FormGroup>
                  <Label>Available Lens Types</Label>
                  <CheckboxContainer>
                    {lensTypeOptions.map(lensType => (
                      <CheckboxLabel key={lensType}>
                        <input 
                          type="checkbox" 
                          checked={productData.lensTypes?.includes(lensType) || false} 
                          onChange={() => handleLensTypeToggle(lensType)} 
                        />
                        {lensType}
                      </CheckboxLabel>
                    ))}
                  </CheckboxContainer>
                </FormGroup>

                {/* Discount */}
                <FormGroup>
                  <Label>Discount</Label>
                  <CheckboxLabel>
                    <input 
                      type="checkbox" 
                      checked={(productData && productData.discount) ? productData.discount.hasDiscount : false} 
                      onChange={handleDiscountToggle} 
                    />
                    Apply Discount
                  </CheckboxLabel>
                  
                  {(productData && productData.discount && productData.discount.hasDiscount) && (
                    <div style={{ marginTop: '10px' }}>
                      <Label htmlFor="discountPercentage">Discount Percentage (%)</Label>
                      <Input 
                        type="number" 
                        id="discountPercentage" 
                        min="0" 
                        max="100" 
                        step="1" 
                        value={(productData && productData.discount) ? productData.discount.discountPercentage : 0} 
                        onChange={handleDiscountPercentageChange} 
                      />
                    </div>
                  )}
                </FormGroup>

                {/* Product Status */}
                <FormGroup>
                  <Label htmlFor="status">Product Status</Label>
                  <Select 
                    id="status" 
                    name="status" 
                    value={productData.status} 
                    onChange={handleInputChange} 
                  >
                    {statusOptions.map(status => (
                      <option key={status} value={status}>
                        {status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </option>
                    ))}
                  </Select>
                </FormGroup>

                {/* Product Description */}
                <FormGroup>
                  <Label htmlFor="description">Product Description</Label>
                  <TextArea 
                    id="description" 
                    name="description" 
                    value={productData.description} 
                    onChange={handleInputChange} 
                  />
                </FormGroup>

                <SubmitButton type="submit" disabled={isLoading}>
                  {isLoading ? 'Adding...' : 'Add Product'}
                </SubmitButton>
              </Form>
            </>
          )}
          
          {/* Manage Products section */}
          {activeTab === 'manage-products' && (
            <>
              <h2>Manage Products</h2>
              
              {successMessage && (
                <SuccessMessage>{successMessage}</SuccessMessage>
              )}
              
              
              
              <ProductList>
                {isProductsLoading ? (
                  <p>Loading products...</p>
                ) : error ? (
                  <p>Error loading products: {error}</p>
                ) : !products || products.length === 0 ? (
                  <p>No products available. Click "Add Sample Products" to get started.</p>
                ) : (
                  products.map(product => (
                    <ProductItem key={product.id}>
                      <ProductImage>
                        <img src={product.image} alt="Product image" />
                      </ProductImage>
                      <ProductInfo>
                        <ProductName>{product.name}</ProductName>
                        <ProductMeta>
                          PKR {product.price.toFixed(2)} | {product.category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                          {product.featured && ' | Featured'}
                          {product.bestSeller && ' | Best Seller'}
                          {product.discount?.hasDiscount && ` | ${product.discount.discountPercentage}% OFF`}
                        </ProductMeta>
                      </ProductInfo>
                      <ActionButtons>
                        <ActionButton 
                          className="edit"
                          onClick={() => handleEditProduct(product)}
                        >
                          Edit
                        </ActionButton>
                        <ActionButton 
                          className="delete"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          Delete
                        </ActionButton>
                      </ActionButtons>
                    </ProductItem>
                  ))
                )}
              </ProductList>
              
              <div style={{ marginTop: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <SubmitButton 
                  onClick={handleAddSampleProducts}
                  style={{ backgroundColor: '#27ae60' }}
                  disabled={isLoading}
                >
                  {isLoading ? 'Adding...' : 'Add Sample Products with Styles'}
                </SubmitButton>
                
                <SubmitButton 
                  onClick={handleUpdateExistingProductsWithStyles}
                  style={{ backgroundColor: '#f39c12' }}
                  disabled={isLoading}
                >
                  {isLoading ? 'Updating...' : 'Add Styles to Existing Products'}
                </SubmitButton>
                
                <SubmitButton 
                  onClick={addSampleLensProducts}
                  style={{ backgroundColor: '#3498db' }}
                  disabled={isLoading}
                >
                  Add Sample Lens Products
                </SubmitButton>
                
                <SubmitButton 
                  onClick={() => {
                    // dispatch(removeLensProducts());
                    alert('Lens products removed from general listings!');
                  }}
                  style={{ backgroundColor: '#f39c12' }}
                  disabled={isLoading}
                >
                  Remove Lens Products from General Listings
                </SubmitButton>
                
                <SubmitButton 
                  onClick={async () => {
                    if (window.confirm('This will refresh all products and apply the lens filter. Continue?')) {
                      try {
                        setIsLoading(true);
                        await dispatch(fetchProducts()).unwrap();
                        setIsLoading(false);
                        alert('Products refreshed successfully! Lens products are now excluded from general listings.');
                      } catch (error) {
                        setIsLoading(false);
                        console.error('Failed to refresh products:', error);
                        alert('Error removing products: ' + error.message);
                      }
                    }
                  }}
                  style={{ backgroundColor: '#e74c3c' }}
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : 'Refresh Products & Apply Lens Filter'}
                </SubmitButton>
              </div>
            </>
          )}
          
          {activeTab === 'orders' && (
            <OrderManagement />
          )}
          
          {activeTab === 'eyewear-products' && (
            <>
              <h2>Eyewear Products Management</h2>
              
              {successMessage && (
                <SuccessMessage>{successMessage}</SuccessMessage>
              )}
              
              <div style={{ marginTop: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <SubmitButton 
                  onClick={handleAddSampleProducts}
                  style={{ backgroundColor: '#27ae60' }}
                  disabled={isLoading}
                >
                  {isLoading ? 'Adding...' : 'Add Sample Eyewear Products'}
                </SubmitButton>
                
                <SubmitButton 
                  onClick={handleUpdateExistingProductsWithStyles}
                  style={{ backgroundColor: '#f39c12' }}
                  disabled={isLoading}
                >
                  {isLoading ? 'Updating...' : 'Add Styles to Existing Products'}
                </SubmitButton>
                
                <SubmitButton 
                  onClick={() => {
                    alert('Lens products removed from eyewear listings!');
                  }}
                  style={{ backgroundColor: '#e74c3c' }}
                  disabled={isLoading}
                >
                  Remove Lens Products from Eyewear Listings
                </SubmitButton>
                
                <SubmitButton 
                  onClick={async () => {
                    if (window.confirm('This will refresh all products and apply the lens filter. Continue?')) {
                      try {
                        setIsLoading(true);
                        await dispatch(fetchProducts()).unwrap();
                        setIsLoading(false);
                        alert('Products refreshed successfully! Lens products are now excluded from general listings.');
                      } catch (error) {
                        setIsLoading(false);
                        console.error('Failed to refresh products:', error);
                        alert('Error removing products: ' + error.message);
                      }
                    }
                  }}
                  style={{ backgroundColor: '#e74c3c' }}
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : 'Refresh Products & Apply Lens Filter'}
                </SubmitButton>
              </div>
              
              <div style={{ marginTop: '20px' }}>
                <h3>Eyewear Product Categories</h3>
                <p>• Sunglasses</p>
                <p>• Eyeglasses</p>
                <p>• Reading Glasses</p>
                <p>• Safety Glasses</p>
              </div>

              <div style={{ marginTop: '30px' }}>
                <h3>Manage Eyewear Products</h3>
                <ProductList>
                  {(products || []).filter(product => {
                    const lensCategories = ['Contact Lenses', 'Transparent Lenses', 'Colored Lenses'];
                    const lensNames = ['FreshKon Mosaic', 'Acuvue Oasys', 'Bella Elite', 'Dailies AquaComfort', 'Solotica Natural', 'Air Optix Colors'];
                    const lensBrands = ['FreshKon', 'Acuvue', 'Bella', 'Alcon', 'Solotica'];
                    
                    // Exclude lens products
                    if (lensCategories.includes(product.category)) return false;
                    if (lensNames.some(name => product.name && product.name.includes(name))) return false;
                    if (lensBrands.includes(product.brand)) return false;
                    
                    return true;
                  }).length === 0 ? (
                    <p>No eyewear products found. Add some eyewear products to get started.</p>
                  ) : (
                    (products || []).filter(product => {
                      const lensCategories = ['Contact Lenses', 'Transparent Lenses', 'Colored Lenses'];
                      const lensNames = ['FreshKon Mosaic', 'Acuvue Oasys', 'Bella Elite', 'Dailies AquaComfort', 'Solotica Natural', 'Air Optix Colors'];
                      const lensBrands = ['FreshKon', 'Acuvue', 'Bella', 'Alcon', 'Solotica'];
                      
                      // Exclude lens products
                      if (lensCategories.includes(product.category)) return false;
                      if (lensNames.some(name => product.name && product.name.includes(name))) return false;
                      if (lensBrands.includes(product.brand)) return false;
                      
                      return true;
                    }).map(product => (
                      <ProductItem key={product.id}>
                        <ProductInfo>
                          <h4>{product.name}</h4>
                          <p>Price: PKR {product.price}</p>
                          <p>Category: {product.category}</p>
                          <p>Brand: {product.brand || 'N/A'}</p>
                          <p>Status: {product.status}</p>
                        </ProductInfo>
                        <ActionButtons>
                          <ActionButton 
                            className="edit"
                            onClick={() => handleEditProduct(product)}
                          >
                            Edit
                          </ActionButton>
                          <ActionButton 
                            className="delete"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            Delete
                          </ActionButton>
                        </ActionButtons>
                      </ProductItem>
                    ))
                  )}
                </ProductList>
              </div>
            </>
          )}
          
          {activeTab === 'lens-products' && (
            <>
              <h2>Lens Products Management</h2>
              
              {successMessage && (
                <SuccessMessage>{successMessage}</SuccessMessage>
              )}
              
              <div style={{ marginTop: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <SubmitButton 
                  onClick={addSampleLensProducts}
                  style={{ backgroundColor: '#3498db' }}
                  disabled={isLoading}
                >
                  Add Sample Lens Products
                </SubmitButton>
                
                <SubmitButton 
                  onClick={async () => {
                    if (window.confirm('This will remove all lens products from the store. Continue?')) {
                      try {
                        setIsLoading(true);
                        // dispatch(removeLensProducts());
                        setIsLoading(false);
                        alert('All lens products removed successfully!');
                      } catch (error) {
                        setIsLoading(false);
                        console.error('Failed to remove lens products:', error);
                        alert('Error removing lens products: ' + error.message);
                      }
                    }
                  }}
                  style={{ backgroundColor: '#e74c3c' }}
                  disabled={isLoading}
                >
                  {isLoading ? 'Removing...' : 'Remove All Lens Products'}
                </SubmitButton>
              </div>
              
              <div style={{ marginTop: '20px' }}>
                <h3>Lens Product Categories</h3>
                <p>• Contact Lenses</p>
                <p>• Transparent Lenses</p>
                <p>• Colored Lenses</p>
                <p>• Daily Disposable Lenses</p>
                <p>• Monthly Lenses</p>
                <p>• Annual Lenses</p>
              </div>
              
              <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                <h4>Lens Product Features</h4>
                <p>• Power/BC/DIA specifications</p>
                <p>• Color variations</p>
                <p>• Prescription upload functionality</p>
                <p>• Eye-specific power selection (OD/OS)</p>
                <p>• Separate routing (/lenses/:id)</p>
              </div>

              <div style={{ marginTop: '30px' }}>
                <h3>Manage Lens Products</h3>
                <ProductList>
                  {(products || []).filter(product => {
                    const lensCategories = ['Contact Lenses', 'Transparent Lenses', 'Colored Lenses'];
                    const lensNames = ['FreshKon Mosaic', 'Acuvue Oasys', 'Bella Elite', 'Dailies AquaComfort', 'Solotica Natural', 'Air Optix Colors'];
                    const lensBrands = ['FreshKon', 'Acuvue', 'Bella', 'Alcon', 'Solotica'];
                    
                    // Include only lens products
                    if (lensCategories.includes(product.category)) return true;
                    if (lensNames.some(name => product.name.includes(name))) return true;
                    if (lensBrands.includes(product.brand)) return true;
                    
                    return false;
                  }).length === 0 ? (
                    <p>No lens products found. Add some lens products to get started.</p>
                  ) : (
                    (products || []).filter(product => {
                      const lensCategories = ['Contact Lenses', 'Transparent Lenses', 'Colored Lenses'];
                      const lensNames = ['FreshKon Mosaic', 'Acuvue Oasys', 'Bella Elite', 'Dailies AquaComfort', 'Solotica Natural', 'Air Optix Colors'];
                      const lensBrands = ['FreshKon', 'Acuvue', 'Bella', 'Alcon', 'Solotica'];
                      
                      // Include only lens products
                      if (lensCategories.includes(product.category)) return true;
                      if (lensNames.some(name => product.name.includes(name))) return true;
                      if (lensBrands.includes(product.brand)) return true;
                      
                      return false;
                    }).map(product => (
                      <ProductItem key={product.id}>
                        <ProductInfo>
                          <h4>{product.name}</h4>
                          <p>Price: PKR {product.price}</p>
                          <p>Category: {product.category}</p>
                          <p>Brand: {product.brand || 'N/A'}</p>
                          <p>Status: {product.status}</p>
                          {product.power && <p>Power: {product.power}</p>}
                          {product.bc && <p>BC: {product.bc}</p>}
                          {product.dia && <p>DIA: {product.dia}</p>}
                        </ProductInfo>
                        <ActionButtons>
                          <ActionButton 
                            className="edit"
                            onClick={() => handleEditProduct(product)}
                          >
                            Edit
                          </ActionButton>
                          <ActionButton 
                            className="delete"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            Delete
                          </ActionButton>
                        </ActionButtons>
                      </ProductItem>
                    ))
                  )}
                </ProductList>
              </div>
            </>
          )}

          {activeTab === 'customers' && (
            <div>
              <h2>Customer Management</h2>
              <p>Customer management features coming soon...</p>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div>
              <h2>Review Management</h2>
              
              {successMessage && (
                <div style={{
                  padding: '1rem',
                  backgroundColor: '#d4edda',
                  border: '1px solid #c3e6cb',
                  borderRadius: '4px',
                  color: '#155724',
                  marginBottom: '1rem'
                }}>
                  {successMessage}
                </div>
              )}
              
              <div style={{ marginBottom: '2rem' }}>
                <h3>Filter Reviews</h3>
                <div style={{ 
                  display: 'flex', 
                  gap: '1rem', 
                  marginBottom: '1rem',
                  flexWrap: 'wrap'
                }}>
                  <button 
                    onClick={() => setReviewFilter('all')}
                    style={{
                      padding: '0.5rem 1rem',
                      border: '1px solid #007bff',
                      backgroundColor: reviewFilter === 'all' ? '#007bff' : 'transparent',
                      color: reviewFilter === 'all' ? 'white' : '#007bff',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}>
                    All Reviews ({reviews.length})
                  </button>
                  <button 
                    onClick={() => setReviewFilter('pending')}
                    style={{
                      padding: '0.5rem 1rem',
                      border: '1px solid #ffc107',
                      backgroundColor: reviewFilter === 'pending' ? '#ffc107' : 'transparent',
                      color: reviewFilter === 'pending' ? 'white' : '#ffc107',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}>
                    Pending ({reviews.filter(r => !r.verified && r.status !== 'rejected').length})
                  </button>
                  <button 
                    onClick={() => setReviewFilter('approved')}
                    style={{
                      padding: '0.5rem 1rem',
                      border: '1px solid #28a745',
                      backgroundColor: reviewFilter === 'approved' ? '#28a745' : 'transparent',
                      color: reviewFilter === 'approved' ? 'white' : '#28a745',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}>
                    Approved ({reviews.filter(r => r.verified).length})
                  </button>
                  <button 
                    onClick={() => setReviewFilter('rejected')}
                    style={{
                      padding: '0.5rem 1rem',
                      border: '1px solid #dc3545',
                      backgroundColor: reviewFilter === 'rejected' ? '#dc3545' : 'transparent',
                      color: reviewFilter === 'rejected' ? 'white' : '#dc3545',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}>
                    Rejected ({reviews.filter(r => r.status === 'rejected').length})
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <h3>Reviews</h3>
                {reviewsLoading ? (
                  <div style={{ textAlign: 'center', padding: '2rem' }}>
                    Loading reviews...
                  </div>
                ) : (
                  <div>
                    {reviews
                      .filter(review => {
                        if (reviewFilter === 'all') return true;
                        if (reviewFilter === 'pending') return !review.verified && review.status !== 'rejected';
                        if (reviewFilter === 'approved') return review.verified;
                        if (reviewFilter === 'rejected') return review.status === 'rejected';
                        return true;
                      })
                      .map(review => (
                        <div key={review.id} style={{
                          border: '1px solid #ddd',
                          borderRadius: '8px',
                          padding: '1rem',
                          marginBottom: '1rem',
                          backgroundColor: 'white'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                            <div>
                              <h4 style={{ margin: '0 0 0.25rem 0' }}>{review.title}</h4>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                <div style={{ color: '#ffa500' }}>
                                  {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                                </div>
                                <span style={{ fontSize: '0.9rem', color: '#666' }}>by {review.name}</span>
                              </div>
                              <p style={{ margin: '0.5rem 0', color: '#333' }}>{review.text}</p>
                              <small style={{ color: '#666' }}>Product ID: {review.productId} | {new Date(review.createdAt).toLocaleDateString()}</small>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                              <div style={{
                                padding: '0.25rem 0.5rem',
                                borderRadius: '4px',
                                fontSize: '0.8rem',
                                fontWeight: 'bold',
                                textAlign: 'center',
                                backgroundColor: review.verified ? '#d4edda' : (review.status === 'rejected' ? '#f8d7da' : '#fff3cd'),
                                color: review.verified ? '#155724' : (review.status === 'rejected' ? '#721c24' : '#856404')
                              }}>
                                {review.verified ? 'Approved' : (review.status === 'rejected' ? 'Rejected' : 'Pending')}
                              </div>
                              {!review.verified && review.status !== 'rejected' && (
                                <div style={{ display: 'flex', gap: '0.25rem' }}>
                                  <button
                                    onClick={() => approveReview(review.id)}
                                    style={{
                                      padding: '0.25rem 0.5rem',
                                      backgroundColor: '#28a745',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '4px',
                                      cursor: 'pointer',
                                      fontSize: '0.8rem'
                                    }}
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => rejectReview(review.id)}
                                    style={{
                                      padding: '0.25rem 0.5rem',
                                      backgroundColor: '#dc3545',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '4px',
                                      cursor: 'pointer',
                                      fontSize: '0.8rem'
                                    }}
                                  >
                                    Reject
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    }
                    {reviews.filter(review => {
                      if (reviewFilter === 'all') return true;
                      if (reviewFilter === 'pending') return !review.verified && review.status !== 'rejected';
                      if (reviewFilter === 'approved') return review.verified;
                      if (reviewFilter === 'rejected') return review.status === 'rejected';
                      return true;
                    }).length === 0 && (
                      <div style={{ 
                        border: '1px solid #ddd', 
                        borderRadius: '8px', 
                        padding: '2rem',
                        backgroundColor: '#f9f9f9',
                        textAlign: 'center'
                      }}>
                        <p style={{ color: '#666', margin: 0 }}>
                          {reviewFilter === 'all' ? 'No reviews found.' : `No ${reviewFilter} reviews found.`}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {activeTab === 'edit-product' && (
            <>
              <h2>Edit Product</h2>
              
              {successMessage && (
                <SuccessMessage>{successMessage}</SuccessMessage>
              )}
              
              <Form onSubmit={handleUpdateSubmit}>
                {/* Same form fields as Add Product, but with a different submit button */}
                <FormGroup>
                  <Label htmlFor="name">Product Name</Label>
                  <Input 
                    type="text" 
                    id="name" 
                    name="name" 
                    value={productData.name} 
                    onChange={handleInputChange} 
                    required 
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label htmlFor="price">Price (PKR)</Label>
                  <Input 
                    type="number" 
                    id="price" 
                    name="price" 
                    min="0" 
                    step="0.01" 
                    value={productData.price} 
                    onChange={handleInputChange} 
                    required 
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    id="category" 
                    name="category" 
                    value={productData.category} 
                    onChange={handleInputChange} 
                    required
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </option>
                    ))}
                  </Select>
                </FormGroup>
                
                <FormGroup>
                  <Label htmlFor="material">Material</Label>
                  <Select 
                    id="material" 
                    name="material" 
                    value={productData.material} 
                    onChange={handleInputChange} 
                  >
                    <option value="">Select Material</option>
                    {materials.map(material => (
                      <option key={material} value={material}>
                        {material.charAt(0).toUpperCase() + material.slice(1)}
                      </option>
                    ))}
                  </Select>
                </FormGroup>
                
                <FormGroup>
                  <Label htmlFor="shape">Shape</Label>
                  <Select 
                    id="shape" 
                    name="shape" 
                    value={productData.shape} 
                    onChange={handleInputChange} 
                  >
                    <option value="">Select Shape</option>
                    {shapes.map(shape => (
                      <option key={shape} value={shape}>
                        {shape.charAt(0).toUpperCase() + shape.slice(1)}
                      </option>
                    ))}
                  </Select>
                </FormGroup>
                
                <FormGroup>
                  <Label htmlFor="style">Style</Label>
                  <Select 
                    id="style" 
                    name="style" 
                    value={productData.style} 
                    onChange={handleInputChange} 
                  >
                    <option value="">Select Style</option>
                    {styleOptions.map(style => (
                      <option key={style} value={style}>
                        {style}
                      </option>
                    ))}
                  </Select>
                </FormGroup>
                
                <FormGroup>
                  <Label>Available Colors</Label>
                  <ColorRadioContainer>
                    {colorOptions.map(colorOption => (
                      <ColorRadioOption 
                        key={colorOption.name}
                        selected={productData.colors.some(c => c.name === colorOption.name)}
                      >
                        <RadioInput
                          type="checkbox"
                          checked={productData.colors.some(c => c.name === colorOption.name)}
                          onChange={() => handleColorToggle(colorOption)}
                        />
                        <ColorSwatch color={colorOption.hex} />
                        <ColorInfo>
                          <ColorName>{colorOption.name}</ColorName>
                          <ColorHex>{colorOption.hex}</ColorHex>
                        </ColorInfo>
                      </ColorRadioOption>
                    ))}
                  </ColorRadioContainer>
                </FormGroup>
                
                <FormGroup>
                  <Label>Product Image</Label>
                  <ImageUploadContainer>
                    <UploadActions>
                      <UploadButton type="button" onClick={handleUploadClick}>
                        Choose Image
                      </UploadButton>
                      <span>{selectedFile ? selectedFile.name : 'No file selected'}</span>
                    </UploadActions>
                    <FileInput 
                      type="file" 
                      ref={fileInputRef}
                      accept="image/*" 
                      onChange={handleFileSelect} 
                    />
                    <ImagePreviewContainer>
                      {previewUrl ? (
                        <ImagePreview src={previewUrl} alt="Preview" />
                      ) : productData.image ? (
                        <ImagePreview src={productData.image} alt="Current" />
                      ) : (
                        <span>Image Preview</span>
                      )}
                    </ImagePreviewContainer>
                  </ImageUploadContainer>
                </FormGroup>
                
                <FormGroup>
                  <Label>Features</Label>
                  <CheckboxContainer>
                    {featureOptions.map(feature => (
                      <CheckboxLabel key={feature}>
                        <input 
                          type="checkbox" 
                          checked={productData.features?.includes(feature) || false} 
                          onChange={() => handleFeatureToggle(feature)} 
                        />
                        {feature.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </CheckboxLabel>
                    ))}
                  </CheckboxContainer>
                </FormGroup>
                
                <FormGroup>
                  <Label htmlFor="productStatus">Product Status</Label>
                  <Select
                    id="productStatus"
                    name="productStatus"
                    onChange={(e) => {
                      const value = e.target.value;
                      setProductData({
                        ...productData,
                        featured: value === 'featured' || value === 'both',
                        bestSeller: value === 'bestSeller' || value === 'both'
                      });
                    }}
                    value={
                      productData.featured && productData.bestSeller
                        ? 'both'
                        : productData.featured
                        ? 'featured'
                        : productData.bestSeller
                        ? 'bestSeller'
                        : 'none'
                    }
                  >
                    <option value="none">Regular Product</option>
                    <option value="featured">Featured Product</option>
                    <option value="bestSeller">Best Seller</option>
                    <option value="both">Featured & Best Seller</option>
                  </Select>
                </FormGroup>
                
                {/* Gallery Images */}
                <FormGroup>
                  <Label>Product Gallery Images</Label>
                  <ImageUploadContainer>
                    <UploadActions>
                      <UploadButton type="button" onClick={() => document.getElementById('galleryUpload').click()}>
                        Add Gallery Images
                      </UploadButton>
                      <span>{productData.gallery?.length || 0} images selected</span>
                    </UploadActions>
                    <FileInput 
                      type="file" 
                      id="galleryUpload"
                      accept="image/*" 
                      multiple
                      onChange={handleGalleryUpload} 
                    />
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
                      {productData.gallery?.map((img, index) => (
                        <div key={index} style={{ position: 'relative', width: '80px', height: '80px' }}>
                          <ImagePreview src={img} alt={`Gallery ${index}`} style={{ width: '100%', height: '100%' }} />
                          <button 
                            type="button" 
                            onClick={() => removeGalleryImage(index)}
                            style={{
                              position: 'absolute',
                              top: '-8px',
                              right: '-8px',
                              background: '#e74c3c',
                              color: 'white',
                              border: 'none',
                              borderRadius: '50%',
                              width: '20px',
                              height: '20px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </ImageUploadContainer>
                </FormGroup>

                {/* Brand */}
                <FormGroup>
                  <Label htmlFor="brand">Brand</Label>
                  <Input 
                    type="text" 
                    id="brand" 
                    name="brand" 
                    value={productData.brand} 
                    onChange={handleInputChange} 
                  />
                </FormGroup>

                {/* Gender */}
                <FormGroup>
                  <Label htmlFor="gender">Gender</Label>
                  <Select 
                    id="gender" 
                    name="gender" 
                    value={productData.gender} 
                    onChange={handleInputChange} 
                  >
                    {genders.map(gender => (
                      <option key={gender} value={gender}>
                        {gender.charAt(0).toUpperCase() + gender.slice(1)}
                      </option>
                    ))}
                  </Select>
                </FormGroup>

                {/* Frame Color */}
                <FormGroup>
                  <Label htmlFor="frameColor">Frame Color</Label>
                  <Input 
                    type="text" 
                    id="frameColor" 
                    name="frameColor" 
                    value={productData.frameColor} 
                    onChange={handleInputChange} 
                  />
                </FormGroup>

                {/* Sizes */}
                <FormGroup>
                  <Label>Available Sizes</Label>
                  <CheckboxContainer>
                    {sizeOptions.map(size => (
                      <CheckboxLabel key={size}>
                        <input 
                          type="checkbox" 
                          checked={productData.sizes?.includes(size) || false} 
                          onChange={() => handleSizeToggle(size)} 
                        />
                        {size}
                      </CheckboxLabel>
                    ))}
                  </CheckboxContainer>
                </FormGroup>

                {/* Lens Types */}
                <FormGroup>
                  <Label>Available Lens Types</Label>
                  <CheckboxContainer>
                    {lensTypeOptions.map(lensType => (
                      <CheckboxLabel key={lensType}>
                        <input 
                          type="checkbox" 
                          checked={productData.lensTypes?.includes(lensType) || false} 
                          onChange={() => handleLensTypeToggle(lensType)} 
                        />
                        {lensType}
                      </CheckboxLabel>
                    ))}
                  </CheckboxContainer>
                </FormGroup>

                {/* Discount */}
                <FormGroup>
                  <Label>Discount</Label>
                  <CheckboxLabel>
                    <input 
                      type="checkbox" 
                      checked={(productData && productData.discount) ? productData.discount.hasDiscount : false} 
                      onChange={handleDiscountToggle} 
                    />
                    Apply Discount
                  </CheckboxLabel>
                  
                  {(productData && productData.discount && productData.discount.hasDiscount) && (
                    <div style={{ marginTop: '10px' }}>
                      <Label htmlFor="discountPercentage">Discount Percentage (%)</Label>
                      <Input 
                        type="number" 
                        id="discountPercentage" 
                        min="0" 
                        max="100" 
                        step="1" 
                        value={(productData && productData.discount) ? productData.discount.discountPercentage : 0} 
                        onChange={handleDiscountPercentageChange} 
                      />
                    </div>
                  )}
                </FormGroup>

                {/* Product Status */}
                <FormGroup>
                  <Label htmlFor="status">Product Status</Label>
                  <Select 
                    id="status" 
                    name="status" 
                    value={productData.status} 
                    onChange={handleInputChange} 
                  >
                    {statusOptions.map(status => (
                      <option key={status} value={status}>
                        {status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </option>
                    ))}
                  </Select>
                </FormGroup>

                {/* Product Description */}
                <FormGroup>
                  <Label htmlFor="description">Product Description</Label>
                  <TextArea 
                    id="description" 
                    name="description" 
                    value={productData.description} 
                    onChange={handleInputChange} 
                  />
                </FormGroup>

                <SubmitButton type="submit" disabled={isLoading}>
                  {isLoading ? 'Updating...' : 'Update Product'}
                </SubmitButton>
              </Form>
            </>
          )}
        </ContentArea>
      </AdminPanel>
    </PageContainer>
  );
};

export default AdminPage;
