import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Alert,
  Modal,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

// Services
import { supabase, subscribeToTable, unsubscribeFromTable } from '../../config/supabase';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

const OrdersScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { hasPermission } = useAuth();
  
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState(route.params?.filter || 'all');
  const [showFilters, setShowFilters] = useState(false);
  const [orderSubscription, setOrderSubscription] = useState(null);

  const filters = [
    { id: 'all', label: 'All Orders', icon: 'receipt-outline' },
    { id: 'pending', label: 'Pending', icon: 'time-outline' },
    { id: 'processing', label: 'Processing', icon: 'refresh-outline' },
    { id: 'shipped', label: 'Shipped', icon: 'car-outline' },
    { id: 'delivered', label: 'Delivered', icon: 'checkmark-circle-outline' },
    { id: 'cancelled', label: 'Cancelled', icon: 'close-circle-outline' },
  ];

  useEffect(() => {
    loadOrders();
    setupRealtimeSubscription();

    return () => {
      if (orderSubscription) unsubscribeFromTable(orderSubscription);
    };
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchQuery, activeFilter]);

  const setupRealtimeSubscription = () => {
    const subscription = subscribeToTable('orders', (payload) => {
      console.log('Order change:', payload);
      loadOrders();
    });
    setOrderSubscription(subscription);
  };

  const loadOrders = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          status,
          total_amount,
          created_at,
          updated_at,
          customers (
            id,
            full_name,
            email,
            phone
          ),
          order_items (
            id,
            quantity,
            product_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setOrders(data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
      Alert.alert('Error', 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    // Apply status filter
    if (activeFilter !== 'all') {
      filtered = filtered.filter(order => order.status === activeFilter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order => 
        order.order_number.toLowerCase().includes(query) ||
        order.customers?.full_name?.toLowerCase().includes(query) ||
        order.customers?.email?.toLowerCase().includes(query)
      );
    }

    setFilteredOrders(filtered);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  }, []);

  const updateOrderStatus = async (orderId, newStatus) => {
    if (!hasPermission('edit_orders')) {
      Alert.alert('Permission Denied', 'You do not have permission to update orders');
      return;
    }

    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString(),
          ...(newStatus === 'shipped' && { shipped_at: new Date().toISOString() }),
          ...(newStatus === 'delivered' && { delivered_at: new Date().toISOString() })
        })
        .eq('id', orderId);

      if (error) throw error;

      // Update local state
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus, updated_at: new Date().toISOString() }
          : order
      ));

      Alert.alert('Success', 'Order status updated successfully');
    } catch (error) {
      console.error('Error updating order status:', error);
      Alert.alert('Error', 'Failed to update order status');
    }
  };

  const showStatusUpdateOptions = (order) => {
    const statusOptions = [
      { label: 'Pending', value: 'pending', icon: 'time' },
      { label: 'Processing', value: 'processing', icon: 'refresh' },
      { label: 'Shipped', value: 'shipped', icon: 'car' },
      { label: 'Delivered', value: 'delivered', icon: 'checkmark-circle' },
      { label: 'Cancelled', value: 'cancelled', icon: 'close-circle' },
    ];

    const options = statusOptions
      .filter(option => option.value !== order.status)
      .map(option => ({
        text: option.label,
        onPress: () => updateOrderStatus(order.id, option.value),
      }));

    options.push({ text: 'Cancel', style: 'cancel' });

    Alert.alert('Update Order Status', `Order #${order.order_number}`, options);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      processing: '#3b82f6',
      shipped: '#10b981',
      delivered: '#059669',
      cancelled: '#ef4444',
    };
    return colors[status] || '#6b7280';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: 'time',
      processing: 'refresh',
      shipped: 'car',
      delivered: 'checkmark-circle',
      cancelled: 'close-circle',
    };
    return icons[status] || 'help-circle';
  };

  const renderOrderItem = ({ item: order }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => navigation.navigate('OrderDetail', { orderId: order.id })}
    >
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderNumber}>#{order.order_number}</Text>
          <Text style={styles.customerName}>
            {order.customers?.full_name || 'Unknown Customer'}
          </Text>
          <Text style={styles.orderDate}>{formatDate(order.created_at)}</Text>
        </View>
        <View style={styles.orderRight}>
          <Text style={styles.orderAmount}>
            {formatCurrency(order.total_amount)}
          </Text>
          <TouchableOpacity
            style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}
            onPress={() => showStatusUpdateOptions(order)}
          >
            <Ionicons 
              name={getStatusIcon(order.status)} 
              size={12} 
              color="white" 
              style={styles.statusIcon}
            />
            <Text style={styles.statusText}>{order.status}</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.orderFooter}>
        <View style={styles.itemsInfo}>
          <Ionicons name="cube-outline" size={14} color="#64748b" />
          <Text style={styles.itemsCount}>
            {order.order_items?.length || 0} items
          </Text>
        </View>
        <View style={styles.orderActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('OrderDetail', { orderId: order.id })}
          >
            <Ionicons name="eye-outline" size={16} color="#667eea" />
          </TouchableOpacity>
          {hasPermission('edit_orders') && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => showStatusUpdateOptions(order)}
            >
              <Ionicons name="create-outline" size={16} color="#10b981" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="receipt-outline" size={64} color="#cbd5e1" />
      <Text style={styles.emptyTitle}>No orders found</Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery ? 'Try adjusting your search' : 'Orders will appear here when customers place them'}
      </Text>
    </View>
  );

  const FilterModal = () => (
    <Modal
      visible={showFilters}
      transparent
      animationType="slide"
      onRequestClose={() => setShowFilters(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.filterModal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filter Orders</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Ionicons name="close" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.filterOptions}>
            {filters.map(filter => (
              <TouchableOpacity
                key={filter.id}
                style={[
                  styles.filterOption,
                  activeFilter === filter.id && styles.filterOptionActive
                ]}
                onPress={() => {
                  setActiveFilter(filter.id);
                  setShowFilters(false);
                }}
              >
                <Ionicons 
                  name={filter.icon} 
                  size={20} 
                  color={activeFilter === filter.id ? '#667eea' : '#64748b'} 
                />
                <Text style={[
                  styles.filterOptionText,
                  activeFilter === filter.id && styles.filterOptionTextActive
                ]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Orders</Text>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Ionicons name="filter" size={20} color="#667eea" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#94a3b8" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search orders..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#94a3b8"
        />
        {searchQuery ? (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setSearchQuery('')}
          >
            <Ionicons name="close-circle" size={20} color="#94a3b8" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Filter Chips */}
      <View style={styles.filterChips}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filters}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                activeFilter === item.id && styles.filterChipActive
              ]}
              onPress={() => setActiveFilter(item.id)}
            >
              <Ionicons 
                name={item.icon} 
                size={16} 
                color={activeFilter === item.id ? 'white' : '#64748b'} 
              />
              <Text style={[
                styles.filterChipText,
                activeFilter === item.id && styles.filterChipTextActive
              ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Orders List */}
      <FlatList
        data={filteredOrders}
        keyExtractor={item => item.id}
        renderItem={renderOrderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={!loading ? renderEmptyState : null}
        showsVerticalScrollIndicator={false}
      />

      <FilterModal />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  filterButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: '#1e293b',
  },
  clearButton: {
    padding: 4,
  },
  filterChips: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: 'white',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filterChipActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  filterChipText: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 6,
  },
  filterChipTextActive: {
    color: 'white',
  },
  listContainer: {
    padding: 20,
    paddingTop: 10,
  },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  customerName: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 2,
  },
  orderDate: {
    fontSize: 12,
    color: '#94a3b8',
  },
  orderRight: {
    alignItems: 'flex-end',
  },
  orderAmount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#059669',
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusIcon: {
    marginRight: 4,
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  itemsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemsCount: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 6,
  },
  orderActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  filterModal: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  filterOptions: {
    padding: 20,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  filterOptionActive: {
    backgroundColor: '#f0f9ff',
  },
  filterOptionText: {
    fontSize: 16,
    color: '#64748b',
    marginLeft: 12,
  },
  filterOptionTextActive: {
    color: '#667eea',
    fontWeight: '500',
  },
});

export default OrdersScreen;
