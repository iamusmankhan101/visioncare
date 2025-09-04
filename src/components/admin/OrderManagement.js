import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  getAllOrders, 
  updateOrderStatus, 
  deleteOrder, 
  searchOrders, 
  getOrderStats 
} from '../../services/orderService';

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

const SearchContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  align-items: center;
  flex-wrap: wrap;
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
  grid-template-columns: 120px 1fr 150px 120px 100px 120px 150px;
  background: #f8f9fa;
  padding: 1rem;
  font-weight: 600;
  border-bottom: 1px solid #eee;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
`;

const OrderRow = styled.div`
  display: grid;
  grid-template-columns: 120px 1fr 150px 120px 100px 120px 150px;
  padding: 1rem;
  border-bottom: 1px solid #eee;
  align-items: center;
  
  &:hover {
    background: #f8f9fa;
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

const ActionButton = styled.button`
  padding: 0.5rem 0.75rem;
  border: none;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  
  &.view {
    background: #3498db;
    color: white;
    
    &:hover {
      background: #2980b9;
    }
  }
  
  &.delete {
    background: #e74c3c;
    color: white;
    
    &:hover {
      background: #c0392b;
    }
  }
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

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #666;
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 2rem;
  color: #666;
`;

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [stats, setStats] = useState({});

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

  // Filter orders based on search and status
  useEffect(() => {
    let filtered = orders;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(order =>
        order.orderNumber.toLowerCase().includes(term) ||
        order.customerInfo.email.toLowerCase().includes(term) ||
        order.customerInfo.firstName.toLowerCase().includes(term) ||
        order.customerInfo.lastName.toLowerCase().includes(term) ||
        order.customerInfo.phone.includes(term)
      );
    }

    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter]);

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
    return <LoadingState>Loading orders...</LoadingState>;
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

      {/* Search and Filters */}
      <SearchContainer>
        <SearchInput
          type="text"
          placeholder="Search by order number, customer name, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
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
      </SearchContainer>

      {/* Orders Table */}
      {filteredOrders.length === 0 ? (
        <EmptyState>
          {searchTerm || statusFilter !== 'all' 
            ? 'No orders found matching your criteria.' 
            : 'No orders yet. Orders will appear here when customers place them.'}
        </EmptyState>
      ) : (
        <OrdersTable>
          <TableHeader>
            <div>Order #</div>
            <div>Customer</div>
            <div>Date</div>
            <div>Total</div>
            <div>Items</div>
            <div>Status</div>
            <div>Actions</div>
          </TableHeader>
          
          {filteredOrders.map(order => (
            <OrderRow key={order.id}>
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
              
              <div>{order.items?.length || 0}</div>
              
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
                  View
                </ActionButton>
                <ActionButton 
                  className="delete"
                  onClick={() => handleDeleteOrder(order.id)}
                >
                  Delete
                </ActionButton>
              </ActionButtons>
            </OrderRow>
          ))}
        </OrdersTable>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderModal onClick={() => setSelectedOrder(null)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Order Details - {selectedOrder.orderNumber}</ModalTitle>
              <CloseButton onClick={() => setSelectedOrder(null)}>×</CloseButton>
            </ModalHeader>
            
            <OrderDetails>
              <DetailSection>
                <SectionTitle>Customer Information</SectionTitle>
                <div><strong>Name:</strong> {selectedOrder.customerInfo.firstName} {selectedOrder.customerInfo.lastName}</div>
                <div><strong>Email:</strong> {selectedOrder.customerInfo.email}</div>
                <div><strong>Phone:</strong> {selectedOrder.customerInfo.phone}</div>
              </DetailSection>

              <DetailSection>
                <SectionTitle>Shipping Address</SectionTitle>
                <div>{selectedOrder.shippingAddress.address}</div>
                <div>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.postalCode}</div>
                <div>{selectedOrder.shippingAddress.country}</div>
              </DetailSection>

              <DetailSection>
                <SectionTitle>Order Items</SectionTitle>
                <ItemList>
                  {selectedOrder.items?.map((item, index) => (
                    <OrderItem key={index}>
                      <div>
                        <div><strong>{item.name}</strong></div>
                        <div>Qty: {item.quantity}</div>
                      </div>
                      <div>{formatCurrency(item.price * item.quantity)}</div>
                    </OrderItem>
                  ))}
                </ItemList>
              </DetailSection>

              <DetailSection>
                <SectionTitle>Order Summary</SectionTitle>
                <div><strong>Subtotal:</strong> {formatCurrency(selectedOrder.subtotal)}</div>
                <div><strong>Shipping:</strong> {formatCurrency(selectedOrder.shipping)}</div>
                <div><strong>Total:</strong> {formatCurrency(selectedOrder.total)}</div>
                <div><strong>Payment Method:</strong> {selectedOrder.paymentMethod}</div>
                <div><strong>Status:</strong> <StatusBadge status={selectedOrder.status}>{selectedOrder.status}</StatusBadge></div>
              </DetailSection>
            </OrderDetails>
          </ModalContent>
        </OrderModal>
      )}
    </OrderContainer>
  );
};

export default OrderManagement;
