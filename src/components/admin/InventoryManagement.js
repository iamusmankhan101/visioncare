import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiPackage, FiAlertTriangle, FiPlus, FiMinus, FiEdit, FiSearch, FiFilter } from 'react-icons/fi';

const InventoryContainer = styled.div`
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const InventoryHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const HeaderTitle = styled.h3`
  margin: 0;
  color: #2c3e50;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const AddProductButton = styled.button`
  background: #28a745;
  color: #fff;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background 0.2s;

  &:hover {
    background: #218838;
  }
`;

const AlertsSection = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
  background: #fff3cd;
`;

const AlertTitle = styled.h4`
  margin: 0 0 1rem;
  color: #856404;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const AlertList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const AlertItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: #fff;
  border-radius: 4px;
  border-left: 3px solid #ffc107;
`;

const ProductName = styled.span`
  font-weight: 500;
  color: #2c3e50;
`;

const StockLevel = styled.span`
  color: #dc3545;
  font-size: 0.9rem;
`;

const FiltersSection = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
`;

const SearchInput = styled.input`
  flex: 1;
  min-width: 200px;
  padding: 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.9rem;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
  }
`;

const FilterSelect = styled.select`
  padding: 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.9rem;
`;

const ProductsTable = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.thead`
  background: #f8f9fa;
`;

const TableRow = styled.tr`
  border-bottom: 1px solid #e9ecef;

  &:hover {
    background: #f8f9fa;
  }
`;

const TableCell = styled.td`
  padding: 1rem;
  text-align: left;
  vertical-align: middle;
`;

const TableHeaderCell = styled.th`
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #495057;
`;

const ProductImage = styled.div`
  width: 50px;
  height: 50px;
  background: #f8f9fa;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
`;

const ProductInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const ProductDetails = styled.div``;

const ProductTitle = styled.div`
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 0.25rem;
`;

const ProductSKU = styled.div`
  color: #6c757d;
  font-size: 0.85rem;
`;

const StockBadge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  background: ${props => {
    if (props.stock <= 0) return '#f8d7da';
    if (props.stock <= props.threshold) return '#fff3cd';
    return '#d4edda';
  }};
  color: ${props => {
    if (props.stock <= 0) return '#721c24';
    if (props.stock <= props.threshold) return '#856404';
    return '#155724';
  }};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  padding: 0.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  background: ${props => {
    switch (props.variant) {
      case 'add': return '#28a745';
      case 'remove': return '#dc3545';
      case 'edit': return '#ffc107';
      default: return '#6c757d';
    }
  }};
  color: ${props => props.variant === 'edit' ? '#212529' : '#fff'};

  &:hover {
    opacity: 0.8;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: #fff;
  border-radius: 8px;
  padding: 2rem;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  margin-bottom: 1.5rem;
`;

const ModalTitle = styled.h3`
  margin: 0;
  color: #2c3e50;
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: #495057;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.9rem;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
  }
`;

const ModalActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
  background: ${props => props.primary ? '#007bff' : '#6c757d'};
  color: #fff;

  &:hover {
    opacity: 0.8;
  }
`;



const InventoryManagement = () => {
  const [products, setProducts] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'add', 'edit', 'stock'
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [stockAdjustment, setStockAdjustment] = useState({
    quantity: '',
    type: 'in',
    reason: ''
  });
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    cost_price: '',
    sku: '',
    category: '',
    brand: '',
    frame_colors: '',
    product_image: '',
    product_gallery: '',
    inventory_quantity: '',
    low_stock_threshold: '10'
  });

  useEffect(() => {
    fetchProducts();
    fetchLowStockProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:5004/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLowStockProducts = async () => {
    try {
      const response = await fetch('http://localhost:5004/api/inventory/low-stock');
      if (response.ok) {
        const data = await response.json();
        setLowStockProducts(data);
      }
    } catch (error) {
      console.error('Error fetching low stock products:', error);
    }
  };

  
  const handleStockAdjustment = async () => {
    try {
      const response = await fetch(`http://localhost:5004/api/products/${selectedProduct.id}/inventory`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(stockAdjustment)
      });

      if (response.ok) {
        await fetchProducts();
        await fetchLowStockProducts();
        setShowModal(false);
        setStockAdjustment({ quantity: '', type: 'in', reason: '' });
      }
    } catch (error) {
      console.error('Error adjusting stock:', error);
    }
  };

  const validateForm = () => {
    if (!productForm.name.trim()) {
      alert('Product name is required');
      return false;
    }
    if (!productForm.category) {
      alert('Category is required');
      return false;
    }
    if (!productForm.price || parseFloat(productForm.price) <= 0) {
      alert('Valid price is required');
      return false;
    }
    return true;
  };

  const handleAddProduct = async () => {
    if (!validateForm()) return;

    try {
      const response = await fetch('http://localhost:5004/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...productForm,
          vendor_id: 1, // Default vendor
          store_id: 1,  // Default store
          status: 'active'
        })
      });

      if (response.ok) {
        await fetchProducts();
        setShowModal(false);
        resetProductForm();
        alert('Product added successfully!');
      } else {
        const errorData = await response.json();
        console.error('Error adding product:', errorData);
        alert('Error adding product: ' + (errorData.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Error adding product: ' + error.message);
    }
  };

  const handleEditProduct = async () => {
    if (!validateForm()) return;

    try {
      const response = await fetch(`http://localhost:5004/api/products/${selectedProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productForm)
      });

      if (response.ok) {
        await fetchProducts();
        setShowModal(false);
        resetProductForm();
        alert('Product updated successfully!');
      } else {
        const errorData = await response.json();
        console.error('Error editing product:', errorData);
        alert('Error editing product: ' + (errorData.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error editing product:', error);
      alert('Error editing product: ' + error.message);
    }
  };

  const resetProductForm = () => {
    setProductForm({
      name: '',
      description: '',
      price: '',
      cost_price: '',
      sku: '',
      category: '',
      brand: '',
      frame_colors: '',
      product_image: '',
      product_gallery: '',
      inventory_quantity: '',
      low_stock_threshold: '10'
    });
    setSelectedProduct(null);
  };

  const openEditModal = (product) => {
    setSelectedProduct(product);
    setProductForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      cost_price: product.cost_price || '',
      sku: product.sku || '',
      category: product.category || '',
      brand: product.brand || '',
      frame_colors: product.frame_colors || '',
      product_image: product.product_image || '',
      product_gallery: product.product_gallery || '',
      inventory_quantity: product.inventory_quantity || '',
      low_stock_threshold: product.low_stock_threshold || '10'
    });
    setModalType('edit');
    setShowModal(true);
  };

  // Predefined categories for eyewear
  const eyewearCategories = [
    'Sunglasses',
    'Reading Glasses',
    'Computer Glasses',
    'Sports Glasses',
    'Fashion Glasses',
    'Safety Glasses',
    'Progressive Glasses',
    'Bifocal Glasses',
    'Blue Light Blocking',
    'Prescription Glasses',
    'Colored Lenses',
    'Transparent Lenses'
  ];

  // Predefined frame colors
  const frameColors = [
    'Black',
    'Brown',
    'Tortoiseshell',
    'Clear',
    'Gold',
    'Silver',
    'Rose Gold',
    'Navy Blue',
    'Red',
    'Green',
    'Purple',
    'Pink',
    'White',
    'Gray',
    'Multi-color'
  ];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

  return (
    <InventoryContainer>
      <InventoryHeader>
        <HeaderTitle>
          <FiPackage />
          Inventory Management
        </HeaderTitle>
        <AddProductButton onClick={() => { 
          resetProductForm(); 
          setModalType('add'); 
          setShowModal(true); 
        }}>
          <FiPlus />
          Add Product
        </AddProductButton>
      </InventoryHeader>

      {lowStockProducts.length > 0 && (
        <AlertsSection>
          <AlertTitle>
            <FiAlertTriangle />
            Low Stock Alerts ({lowStockProducts.length})
          </AlertTitle>
          <AlertList>
            {lowStockProducts.slice(0, 5).map(product => (
              <AlertItem key={product.id}>
                <ProductName>{product.name}</ProductName>
                <StockLevel>{product.inventory_quantity} remaining</StockLevel>
              </AlertItem>
            ))}
          </AlertList>
        </AlertsSection>
      )}

      <FiltersSection>
        <SearchInput
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <FilterSelect
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="all">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </FilterSelect>
      </FiltersSection>

      <ProductsTable>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>Product</TableHeaderCell>
              <TableHeaderCell>SKU</TableHeaderCell>
              <TableHeaderCell>Category</TableHeaderCell>
              <TableHeaderCell>Price</TableHeaderCell>
              <TableHeaderCell>Stock</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <tbody>
            {filteredProducts.map(product => (
              <TableRow key={product.id}>
                <TableCell>
                  <ProductInfo>
                    <ProductImage>
                      <FiPackage />
                    </ProductImage>
                    <ProductDetails>
                      <ProductTitle>{product.name}</ProductTitle>
                      <ProductSKU>Vendor: {product.vendor_name}</ProductSKU>
                    </ProductDetails>
                  </ProductInfo>
                </TableCell>
                <TableCell>{product.sku || 'N/A'}</TableCell>
                <TableCell>{product.category || 'Uncategorized'}</TableCell>
                <TableCell>${product.price}</TableCell>
                <TableCell>
                  <StockBadge stock={product.inventory_quantity} threshold={product.low_stock_threshold}>
                    {product.inventory_quantity}
                  </StockBadge>
                </TableCell>
                <TableCell>{product.status}</TableCell>
                <TableCell>
                  <ActionButtons>
                    <ActionButton 
                      variant="add"
                      onClick={() => {
                        setSelectedProduct(product);
                        setStockAdjustment({...stockAdjustment, type: 'in'});
                        setModalType('stock');
                        setShowModal(true);
                      }}
                    >
                      <FiPlus />
                    </ActionButton>
                    <ActionButton 
                      variant="remove"
                      onClick={() => {
                        setSelectedProduct(product);
                        setStockAdjustment({...stockAdjustment, type: 'out'});
                        setModalType('stock');
                        setShowModal(true);
                      }}
                    >
                      <FiMinus />
                    </ActionButton>
                    <ActionButton 
                      variant="edit"
                      onClick={() => openEditModal(product)}
                    >
                      <FiEdit />
                    </ActionButton>
                  </ActionButtons>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </ProductsTable>

      {showModal && modalType === 'stock' && (
        <Modal onClick={() => setShowModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                {stockAdjustment.type === 'in' ? 'Add Stock' : 'Remove Stock'} - {selectedProduct?.name}
              </ModalTitle>
            </ModalHeader>
            
            <FormGroup>
              <Label>Quantity</Label>
              <Input
                type="number"
                value={stockAdjustment.quantity}
                onChange={(e) => setStockAdjustment({...stockAdjustment, quantity: e.target.value})}
                placeholder="Enter quantity"
              />
            </FormGroup>
            
            <FormGroup>
              <Label>Reason</Label>
              <Input
                type="text"
                value={stockAdjustment.reason}
                onChange={(e) => setStockAdjustment({...stockAdjustment, reason: e.target.value})}
                placeholder="Enter reason for adjustment"
              />
            </FormGroup>
            
            <ModalActions>
              <Button onClick={() => setShowModal(false)}>Cancel</Button>
              <Button primary onClick={handleStockAdjustment}>
                {stockAdjustment.type === 'in' ? 'Add Stock' : 'Remove Stock'}
              </Button>
            </ModalActions>
          </ModalContent>
        </Modal>
      )}

      {showModal && (modalType === 'add' || modalType === 'edit') && (
        <Modal onClick={() => setShowModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                {modalType === 'add' ? 'Add New Product' : 'Edit Product'}
              </ModalTitle>
            </ModalHeader>
            
            <FormGroup>
              <Label>Product Name *</Label>
              <Input
                type="text"
                value={productForm.name}
                onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                placeholder="Enter product name"
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>Description</Label>
              <Input
                type="text"
                value={productForm.description}
                onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                placeholder="Enter product description"
              />
            </FormGroup>

            <FormGroup>
              <Label>SKU</Label>
              <Input
                type="text"
                value={productForm.sku}
                onChange={(e) => setProductForm({...productForm, sku: e.target.value})}
                placeholder="Enter product SKU"
              />
            </FormGroup>

            <FormGroup>
              <Label>Category *</Label>
              <FilterSelect
                value={productForm.category}
                onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                required
              >
                <option value="">Select a category</option>
                {eyewearCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </FilterSelect>
            </FormGroup>

            <FormGroup>
              <Label>Brand</Label>
              <Input
                type="text"
                value={productForm.brand}
                onChange={(e) => setProductForm({...productForm, brand: e.target.value})}
                placeholder="Enter brand name"
              />
            </FormGroup>

            <FormGroup>
              <Label>Frame Colors</Label>
              <FilterSelect
                value={productForm.frame_colors}
                onChange={(e) => setProductForm({...productForm, frame_colors: e.target.value})}
              >
                <option value="">Select frame color</option>
                {frameColors.map(color => (
                  <option key={color} value={color}>{color}</option>
                ))}
              </FilterSelect>
            </FormGroup>

            <FormGroup>
              <Label>Product Image URL</Label>
              <Input
                type="url"
                value={productForm.product_image}
                onChange={(e) => setProductForm({...productForm, product_image: e.target.value})}
                placeholder="Enter main product image URL"
              />
            </FormGroup>

            <FormGroup>
              <Label>Product Gallery URLs</Label>
              <Input
                type="text"
                value={productForm.product_gallery}
                onChange={(e) => setProductForm({...productForm, product_gallery: e.target.value})}
                placeholder="Enter gallery image URLs separated by commas"
              />
              <small style={{color: '#6c757d', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block'}}>
                Enter multiple image URLs separated by commas (e.g., url1.jpg, url2.jpg, url3.jpg)
              </small>
            </FormGroup>

            <FormGroup>
              <Label>Price *</Label>
              <Input
                type="number"
                step="0.01"
                value={productForm.price}
                onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                placeholder="Enter selling price"
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>Cost Price</Label>
              <Input
                type="number"
                step="0.01"
                value={productForm.cost_price}
                onChange={(e) => setProductForm({...productForm, cost_price: e.target.value})}
                placeholder="Enter cost price"
              />
            </FormGroup>

            <FormGroup>
              <Label>Initial Stock Quantity</Label>
              <Input
                type="number"
                value={productForm.inventory_quantity}
                onChange={(e) => setProductForm({...productForm, inventory_quantity: e.target.value})}
                placeholder="Enter initial stock quantity"
              />
            </FormGroup>

            <FormGroup>
              <Label>Low Stock Threshold</Label>
              <Input
                type="number"
                value={productForm.low_stock_threshold}
                onChange={(e) => setProductForm({...productForm, low_stock_threshold: e.target.value})}
                placeholder="Enter low stock threshold"
              />
            </FormGroup>
            
            <ModalActions>
              <Button onClick={() => setShowModal(false)}>Cancel</Button>
              <Button primary onClick={modalType === 'add' ? handleAddProduct : handleEditProduct}>
                {modalType === 'add' ? 'Add Product' : 'Update Product'}
              </Button>
            </ModalActions>
          </ModalContent>
        </Modal>
      )}
    </InventoryContainer>
  );
};

export default InventoryManagement;
