import { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { 
  getAllOrders, 
  updateOrderStatus, 
  deleteOrder, 
  getOrderStats,
  searchOrders,
  getOrdersByStatus
} from '../../services/orderService';
import { FiSearch, FiFilter, FiDownload, FiEye, FiEdit, FiTrash2, FiPackage, FiTruck, FiCheck, FiX, FiClock, FiDollarSign, FiUser, FiCalendar, FiPhone, FiMail, FiMapPin, FiRefreshCw, FiPrinter } from 'react-icons/fi';

// Styled Components
const OrderContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: ${props => props.color || '#f8f9fa'};
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const StatNumber = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${props => props.textColor || '#333'};
`;

const StatLabel = styled.div`
  font-size: 0.8rem;
  color: #666;
  margin-top: 0.25rem;
`;

const ToolbarContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid #f1f5f9;
`;

const ToolbarTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
`;

const ToolbarLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  min-width: 300px;
`;

const ToolbarRight = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const SearchContainer = styled.div`
  position: relative;
  flex: 1;
  max-width: 400px;
`;

const SearchInputStyled = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.875rem;
  background: #f8fafc;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    background: white;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  &::placeholder {
    color: #94a3b8;
  }
`;

const SearchIconStyled = styled(FiSearch)`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  width: 16px;
  height: 16px;
  pointer-events: none;
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: ${props => props.active ? '#3b82f6' : 'white'};
  color: ${props => props.active ? 'white' : '#64748b'};
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.active ? '#2563eb' : '#f8fafc'};
    border-color: ${props => props.active ? '#2563eb' : '#cbd5e1'};
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &.primary {
    background: #3b82f6;
    color: white;
    
    &:hover {
      background: #2563eb;
    }
  }
  
  &.secondary {
    background: #f8fafc;
    color: #64748b;
    border: 1px solid #e2e8f0;
    
    &:hover {
      background: #f1f5f9;
      color: #475569;
    }
  }
  
  &.success {
    background: #10b981;
    color: white;
    
    &:hover {
      background: #059669;
    }
  }
  
  &.danger {
    background: #ef4444;
    color: white;
    
    &:hover {
      background: #dc2626;
    }
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const FiltersContainer = styled.div`
  display: ${props => props.show ? 'flex' : 'none'};
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #f1f5f9;
  flex-wrap: wrap;
  align-items: center;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const FilterLabel = styled.label`
  font-size: 0.75rem;
  font-weight: 500;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.025em;
`;

const SearchInput = styled.input`
  flex: 1;
  min-width: 200px;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

const FilterSelect = styled.select`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  min-width: 120px;
  
  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

const OrdersTable = styled.div`
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 40px 120px 1fr 150px 120px 200px 120px 150px;
  background: #f8fafc;
  padding: 1rem 1.5rem;
  font-weight: 600;
  font-size: 0.875rem;
  color: #374151;
  border-bottom: 1px solid #f1f5f9;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
`;

const OrderRow = styled.div`
  display: grid;
  grid-template-columns: 40px 120px 1fr 150px 120px 200px 120px 150px;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  align-items: center;
  transition: all 0.2s ease;
  background: ${props => props.selected ? '#f0f9ff' : 'white'};
  
  &:hover {
    background: ${props => props.selected ? '#e0f2fe' : '#f8fafc'};
  }
  
  &:last-child {
    border-bottom: none;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 0.5rem;
    padding: 1rem 0.5rem;
  }
`;

const OrderNumber = styled.div`
  font-weight: 600;
  color: #3498db;
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
`;

const CustomerInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const CustomerName = styled.div`
  font-weight: 500;
`;

const CustomerEmail = styled.div`
  font-size: 0.8rem;
  color: #666;
`;

const StatusBadge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: capitalize;
  
  ${props => {
    switch (props.status) {
      case 'pending':
        return 'background: #fff3cd; color: #856404;';
      case 'processing':
        return 'background: #cce5ff; color: #004085;';
      case 'shipped':
        return 'background: #d4edda; color: #155724;';
      case 'delivered':
        return 'background: #d1ecf1; color: #0c5460;';
      case 'cancelled':
        return 'background: #f8d7da; color: #721c24;';
      default:
        return 'background: #e2e3e5; color: #383d41;';
    }
  }}
`;

const StatusSelect = styled.select`
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.8rem;
  
  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const OrderModal = styled.div`
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
  background: white;
  border-radius: 8px;
  padding: 2rem;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
`;

const ModalTitle = styled.h3`
  margin: 0;
  color: #333;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  
  &:hover {
    color: #333;
  }
`;

const OrderDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const DetailSection = styled.div`
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 4px;
`;

const SectionTitle = styled.h4`
  margin: 0 0 0.5rem 0;
  color: #333;
`;

const ItemList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const OrderItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: white;
  border-radius: 4px;
`;

const BulkActionsBar = styled.div`
  display: ${props => props.show ? 'flex' : 'none'};
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  margin-bottom: 1rem;
`;

const BulkActionsLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const BulkActionsRight = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const SelectedCount = styled.span`
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  padding: 1.5rem;
  background: white;
  border-top: 1px solid #f1f5f9;
  border-radius: 0 0 12px 12px;
`;

const PaginationInfo = styled.div`
  font-size: 0.875rem;
  color: #64748b;
`;

const PaginationControls = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: auto;
`;

const PaginationButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: ${props => props.active ? '#3b82f6' : 'white'};
  color: ${props => props.active ? 'white' : '#64748b'};
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background: ${props => props.active ? '#2563eb' : '#f8fafc'};
    border-color: ${props => props.active ? '#2563eb' : '#cbd5e1'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

const Checkbox = styled.input`
  width: 16px;
  height: 16px;
  cursor: pointer;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #64748b;
  background: white;
  border-radius: 12px;
  border: 1px solid #f1f5f9;
`;

const EmptyIcon = styled.div`
  width: 64px;
  height: 64px;
  margin: 0 auto 1rem;
  background: #f8fafc;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 32px;
    height: 32px;
    color: #94a3b8;
  }
`;

const EmptyTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
`;

const EmptyDescription = styled.p`
  margin: 0;
  font-size: 0.875rem;
  color: #64748b;
`;

const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: #64748b;
  background: white;
  border-radius: 12px;
  border: 1px solid #f1f5f9;
  
  svg {
    width: 24px;
    height: 24px;
    margin-right: 0.75rem;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [stats, setStats] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Load orders and stats
  useEffect(() => {
    loadOrders();
    loadStats();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const orderData = await getAllOrders();
      setOrders(orderData);
      setFilteredOrders(orderData);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await getOrderStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // Enhanced filtering and sorting
  const filteredAndSortedOrders = useMemo(() => {
    let filtered = [...orders];

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Filter by date
    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          filtered = filtered.filter(order => new Date(order.orderDate) >= filterDate);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          filtered = filtered.filter(order => new Date(order.orderDate) >= filterDate);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          filtered = filtered.filter(order => new Date(order.orderDate) >= filterDate);
          break;
        case 'quarter':
          filterDate.setMonth(now.getMonth() - 3);
          filtered = filtered.filter(order => new Date(order.orderDate) >= filterDate);
          break;
      }
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(order =>
        order.orderNumber.toLowerCase().includes(term) ||
        order.customerInfo.email.toLowerCase().includes(term) ||
        order.customerInfo.firstName.toLowerCase().includes(term) ||
        order.customerInfo.lastName.toLowerCase().includes(term) ||
        order.customerInfo.phone.includes(term) ||
        order.items?.some(item => item.name.toLowerCase().includes(term))
      );
    }

    // Sort orders
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.orderDate) - new Date(a.orderDate);
        case 'oldest':
          return new Date(a.orderDate) - new Date(b.orderDate);
        case 'highest':
          return (b.total || 0) - (a.total || 0);
        case 'lowest':
          return (a.total || 0) - (b.total || 0);
        case 'customer':
          return `${a.customerInfo.firstName} ${a.customerInfo.lastName}`.localeCompare(
            `${b.customerInfo.firstName} ${b.customerInfo.lastName}`
          );
        default:
          return new Date(b.orderDate) - new Date(a.orderDate);
      }
    });

    return filtered;
  }, [orders, searchTerm, statusFilter, dateFilter, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedOrders.length / ordersPerPage);
  const paginatedOrders = filteredAndSortedOrders.slice(
    (currentPage - 1) * ordersPerPage,
    currentPage * ordersPerPage
  );

  // Update filtered orders when filters change
  useEffect(() => {
    setFilteredOrders(filteredAndSortedOrders);
    setCurrentPage(1); // Reset to first page when filters change
  }, [filteredAndSortedOrders]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      await loadOrders();
      await loadStats();
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await deleteOrder(orderId);
        await loadOrders();
        await loadStats();
      } catch (error) {
        console.error('Error deleting order:', error);
        alert('Failed to delete order');
      }
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    await loadStats();
    setRefreshing(false);
  };

  const handleSelectOrder = (orderId) => {
    setSelectedOrders(prev => {
      if (prev.includes(orderId)) {
        return prev.filter(id => id !== orderId);
      } else {
        return [...prev, orderId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedOrders.length === paginatedOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(paginatedOrders.map(order => order.id));
    }
  };

  const handleBulkStatusUpdate = async (newStatus) => {
    if (selectedOrders.length === 0) return;
    
    try {
      await Promise.all(
        selectedOrders.map(orderId => updateOrderStatus(orderId, newStatus))
      );
      await loadOrders();
      await loadStats();
      setSelectedOrders([]);
      setShowBulkActions(false);
    } catch (error) {
      console.error('Error updating orders:', error);
      alert('Failed to update orders');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedOrders.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedOrders.length} orders?`)) {
      try {
        await Promise.all(
          selectedOrders.map(orderId => deleteOrder(orderId))
        );
        await loadOrders();
        await loadStats();
        setSelectedOrders([]);
        setShowBulkActions(false);
      } catch (error) {
        console.error('Error deleting orders:', error);
        alert('Failed to delete orders');
      }
    }
  };

  const exportOrders = () => {
    const csvContent = [
      ['Order Number', 'Customer Name', 'Email', 'Phone', 'Date', 'Status', 'Total', 'Items'],
      ...filteredAndSortedOrders.map(order => [
        order.orderNumber,
        `${order.customerInfo.firstName} ${order.customerInfo.lastName}`,
        order.customerInfo.email,
        order.customerInfo.phone,
        formatDate(order.orderDate),
        order.status,
        order.total,
        order.items?.map(item => `${item.name} (${item.quantity})`).join('; ') || ''
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return `PKR ${amount?.toFixed(2) || '0.00'}`;
  };

  if (loading) {
    return (
      <LoadingState>
        <FiRefreshCw />
        Loading orders...
      </LoadingState>
    );
  }

  return (
    <OrderContainer>
      <h2>Order Management</h2>
      
      {/* Statistics */}
      <StatsContainer>
        <StatCard color="#e3f2fd">
          <StatNumber textColor="#1976d2">{stats.total || 0}</StatNumber>
          <StatLabel>Total Orders</StatLabel>
        </StatCard>
        <StatCard color="#fff3e0">
          <StatNumber textColor="#f57c00">{stats.pending || 0}</StatNumber>
          <StatLabel>Pending</StatLabel>
        </StatCard>
        <StatCard color="#e8f5e8">
          <StatNumber textColor="#388e3c">{stats.delivered || 0}</StatNumber>
          <StatLabel>Delivered</StatLabel>
        </StatCard>
        <StatCard color="#f3e5f5">
          <StatNumber textColor="#7b1fa2">{formatCurrency(stats.totalRevenue)}</StatNumber>
          <StatLabel>Total Revenue</StatLabel>
        </StatCard>
      </StatsContainer>

      {/* Enhanced Toolbar */}
      <ToolbarContainer>
        <ToolbarTop>
          <ToolbarLeft>
            <SearchContainer>
              <SearchIconStyled />
              <SearchInputStyled
                type="text"
                placeholder="Search orders, customers, or products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </SearchContainer>
            <FilterButton
              active={showFilters}
              onClick={() => setShowFilters(!showFilters)}
            >
              <FiFilter />
              Filters
            </FilterButton>
          </ToolbarLeft>
          
          <ToolbarRight>
            <ActionButton
              className="secondary"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <FiRefreshCw style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
              Refresh
            </ActionButton>
            <ActionButton
              className="secondary"
              onClick={exportOrders}
            >
              <FiDownload />
              Export
            </ActionButton>
          </ToolbarRight>
        </ToolbarTop>

        {/* Advanced Filters */}
        <FiltersContainer show={showFilters}>
          <FilterGroup>
            <FilterLabel>Status</FilterLabel>
            <FilterSelect
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </FilterSelect>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>Date Range</FilterLabel>
            <FilterSelect
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="quarter">Last 3 Months</option>
            </FilterSelect>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>Sort By</FilterLabel>
            <FilterSelect
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Value</option>
              <option value="lowest">Lowest Value</option>
              <option value="customer">Customer Name</option>
            </FilterSelect>
          </FilterGroup>
        </FiltersContainer>
      </ToolbarContainer>

      {/* Bulk Actions Bar */}
      <BulkActionsBar show={selectedOrders.length > 0}>
        <BulkActionsLeft>
          <SelectedCount>
            {selectedOrders.length} order{selectedOrders.length !== 1 ? 's' : ''} selected
          </SelectedCount>
        </BulkActionsLeft>
        <BulkActionsRight>
          <ActionButton
            className="secondary"
            onClick={() => handleBulkStatusUpdate('processing')}
          >
            <FiClock />
            Mark Processing
          </ActionButton>
          <ActionButton
            className="success"
            onClick={() => handleBulkStatusUpdate('shipped')}
          >
            <FiTruck />
            Mark Shipped
          </ActionButton>
          <ActionButton
            className="primary"
            onClick={() => handleBulkStatusUpdate('delivered')}
          >
            <FiCheck />
            Mark Delivered
          </ActionButton>
          <ActionButton
            className="danger"
            onClick={handleBulkDelete}
          >
            <FiTrash2 />
            Delete
          </ActionButton>
        </BulkActionsRight>
      </BulkActionsBar>

      {/* Orders Table */}
      {filteredAndSortedOrders.length === 0 ? (
        <EmptyState>
          <EmptyIcon>
            <FiPackage />
          </EmptyIcon>
          <EmptyTitle>
            {searchTerm || statusFilter !== 'all' || dateFilter !== 'all'
              ? 'No orders found'
              : 'No orders yet'}
          </EmptyTitle>
          <EmptyDescription>
            {searchTerm || statusFilter !== 'all' || dateFilter !== 'all'
              ? 'Try adjusting your search criteria or filters.'
              : 'Orders will appear here when customers place them.'}
          </EmptyDescription>
        </EmptyState>
      ) : (
        <OrdersTable>
          <TableHeader>
            <div>
              <Checkbox
                type="checkbox"
                checked={selectedOrders.length === paginatedOrders.length && paginatedOrders.length > 0}
                onChange={handleSelectAll}
              />
            </div>
            <div>Order #</div>
            <div>Customer</div>
            <div>Date</div>
            <div>Total</div>
            <div>Items</div>
            <div>Status</div>
            <div>Actions</div>
          </TableHeader>
          
          {paginatedOrders.map(order => (
            <OrderRow 
              key={order.id}
              selected={selectedOrders.includes(order.id)}
            >
              <div>
                <Checkbox
                  type="checkbox"
                  checked={selectedOrders.includes(order.id)}
                  onChange={() => handleSelectOrder(order.id)}
                />
              </div>
              
              <OrderNumber onClick={() => setSelectedOrder(order)}>
                {order.orderNumber}
              </OrderNumber>
              
              <CustomerInfo>
                <CustomerName>
                  {order.customerInfo.firstName} {order.customerInfo.lastName}
                </CustomerName>
                <CustomerEmail>{order.customerInfo.email}</CustomerEmail>
              </CustomerInfo>
              
              <div>{formatDate(order.orderDate)}</div>
              
              <div>{formatCurrency(order.total)}</div>
              
              <div>
                {order.items?.map((item, index) => (
                  <div key={index} style={{ fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                    <strong>{item.name}</strong> x{item.quantity || 1}
                    {item.selectedColor && <span style={{ color: '#64748b' }}> - {item.selectedColor}</span>}
                    {item.selectedSize && <span style={{ color: '#64748b' }}> - {item.selectedSize}</span>}
                  </div>
                )) || 'No items'}
              </div>
              
              <div>
                <StatusSelect
                  value={order.status}
                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </StatusSelect>
              </div>
              
              <ActionButtons>
                <ActionButton 
                  className="view"
                  onClick={() => setSelectedOrder(order)}
                >
                  <FiEye />
                </ActionButton>
                <ActionButton 
                  className="delete"
                  onClick={() => handleDeleteOrder(order.id)}
                >
                  <FiTrash2 />
                </ActionButton>
              </ActionButtons>
            </OrderRow>
          ))}

          {/* Pagination */}
          <PaginationContainer>
            <PaginationInfo>
              Showing {((currentPage - 1) * ordersPerPage) + 1} to {Math.min(currentPage * ordersPerPage, filteredAndSortedOrders.length)} of {filteredAndSortedOrders.length} orders
            </PaginationInfo>
            
            <PaginationControls>
              <PaginationButton
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                ‹
              </PaginationButton>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(currentPage - 2 + i, totalPages - 4 + i));
                return (
                  <PaginationButton
                    key={pageNum}
                    active={pageNum === currentPage}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </PaginationButton>
                );
              })}
              
              <PaginationButton
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                ›
              </PaginationButton>
            </PaginationControls>
          </PaginationContainer>
        </OrdersTable>
      )}

      {/* Enhanced Order Details Modal */}
      {selectedOrder && (
        <OrderModal onClick={() => setSelectedOrder(null)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <div>
                <ModalTitle>Order #{selectedOrder.orderNumber}</ModalTitle>
                <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
                  Placed on {formatDate(selectedOrder.orderDate)}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <ActionButton className="secondary" onClick={() => window.print()}>
                  <FiPrinter />
                  Print
                </ActionButton>
                <CloseButton onClick={() => setSelectedOrder(null)}>×</CloseButton>
              </div>
            </ModalHeader>
            
            <OrderDetails>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <DetailSection>
                  <SectionTitle>
                    <FiUser style={{ marginRight: '0.5rem' }} />
                    Customer Information
                  </SectionTitle>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div><strong>Name:</strong> {selectedOrder.customerInfo.firstName} {selectedOrder.customerInfo.lastName}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FiMail size={14} />
                      <a href={`mailto:${selectedOrder.customerInfo.email}`} style={{ color: '#3b82f6', textDecoration: 'none' }}>
                        {selectedOrder.customerInfo.email}
                      </a>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FiPhone size={14} />
                      <a href={`tel:${selectedOrder.customerInfo.phone}`} style={{ color: '#3b82f6', textDecoration: 'none' }}>
                        {selectedOrder.customerInfo.phone}
                      </a>
                    </div>
                  </div>
                </DetailSection>

                <DetailSection>
                  <SectionTitle>
                    <FiMapPin style={{ marginRight: '0.5rem' }} />
                    Shipping Address
                  </SectionTitle>
                  {selectedOrder.shippingAddress ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <div>{selectedOrder.shippingAddress.address}</div>
                      <div>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.postalCode}</div>
                      <div>{selectedOrder.shippingAddress.country}</div>
                    </div>
                  ) : (
                    <div style={{ color: '#64748b', fontStyle: 'italic' }}>No shipping address provided</div>
                  )}
                </DetailSection>
              </div>

              <DetailSection>
                <SectionTitle>
                  <FiPackage style={{ marginRight: '0.5rem' }} />
                  Order Items ({selectedOrder.items?.length || 0} items)
                </SectionTitle>
                <ItemList>
                  {selectedOrder.items?.map((item, index) => (
                    <OrderItem key={index}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                        <div style={{ 
                          width: '48px', 
                          height: '48px', 
                          background: '#f8fafc', 
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.5rem'
                        }}>
                          👓
                        </div>
                        <div>
                          <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{item.name}</div>
                          <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                            Quantity: {item.quantity || 1}
                            {item.selectedColor && ` • Color: ${item.selectedColor}`}
                            {item.selectedSize && ` • Size: ${item.selectedSize}`}
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: '600' }}>{formatCurrency(item.price * (item.quantity || 1))}</div>
                        <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                          {formatCurrency(item.price)} each
                        </div>
                      </div>
                    </OrderItem>
                  ))}
                </ItemList>
              </DetailSection>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <DetailSection>
                  <SectionTitle>
                    <FiDollarSign style={{ marginRight: '0.5rem' }} />
                    Payment Information
                  </SectionTitle>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div><strong>Payment Method:</strong> {selectedOrder.paymentMethod || 'Not specified'}</div>
                    <div><strong>Payment Status:</strong> 
                      <span style={{ 
                        marginLeft: '0.5rem',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        background: selectedOrder.paymentStatus === 'paid' ? '#dcfce7' : '#fef3c7',
                        color: selectedOrder.paymentStatus === 'paid' ? '#166534' : '#92400e'
                      }}>
                        {selectedOrder.paymentStatus || 'Pending'}
                      </span>
                    </div>
                  </div>
                </DetailSection>

                <DetailSection>
                  <SectionTitle>Order Summary</SectionTitle>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Subtotal:</span>
                      <span>{formatCurrency(selectedOrder.subtotal || selectedOrder.total)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Shipping:</span>
                      <span>{formatCurrency(selectedOrder.shipping || 0)}</span>
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      paddingTop: '0.5rem',
                      borderTop: '1px solid #f1f5f9',
                      fontWeight: '600',
                      fontSize: '1.125rem'
                    }}>
                      <span>Total:</span>
                      <span>{formatCurrency(selectedOrder.total)}</span>
                    </div>
                    <div style={{ marginTop: '1rem' }}>
                      <strong>Status:</strong>
                      <StatusBadge status={selectedOrder.status} style={{ marginLeft: '0.5rem' }}>
                        {selectedOrder.status}
                      </StatusBadge>
                    </div>
                  </div>
                </DetailSection>
              </div>

              {/* Quick Actions */}
              <div style={{ 
                marginTop: '2rem', 
                padding: '1rem', 
                background: '#f8fafc', 
                borderRadius: '8px',
                display: 'flex',
                gap: '0.75rem',
                justifyContent: 'flex-end'
              }}>
                <ActionButton 
                  className="secondary"
                  onClick={() => handleStatusChange(selectedOrder.id, 'processing')}
                  disabled={selectedOrder.status === 'processing'}
                >
                  <FiClock />
                  Mark Processing
                </ActionButton>
                <ActionButton 
                  className="primary"
                  onClick={() => handleStatusChange(selectedOrder.id, 'shipped')}
                  disabled={selectedOrder.status === 'shipped' || selectedOrder.status === 'delivered'}
                >
                  <FiTruck />
                  Mark Shipped
                </ActionButton>
                <ActionButton 
                  className="success"
                  onClick={() => handleStatusChange(selectedOrder.id, 'delivered')}
                  disabled={selectedOrder.status === 'delivered'}
                >
                  <FiCheck />
                  Mark Delivered
                </ActionButton>
              </div>
            </OrderDetails>
          </ModalContent>
        </OrderModal>
      )}
    </OrderContainer>
  );
};

export default OrderManagement;
