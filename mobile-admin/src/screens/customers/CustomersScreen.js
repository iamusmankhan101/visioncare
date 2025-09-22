import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

// Services
import customerService from '../../services/customerService';

const CustomersScreen = ({ navigation }) => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  // Filter options
  const filterOptions = [
    { key: 'all', label: 'All Customers', icon: 'people-outline' },
    { key: 'active', label: 'Active Customers', icon: 'checkmark-circle-outline' },
    { key: 'vip', label: 'VIP Customers', icon: 'star-outline' },
    { key: 'recent', label: 'Recent Orders', icon: 'time-outline' },
  ];

  const sortOptions = [
    { key: 'recent', label: 'Most Recent' },
    { key: 'name', label: 'Name A-Z' },
    { key: 'orders', label: 'Most Orders' },
    { key: 'value', label: 'Highest Value' },
  ];

  // Load customers
  const loadCustomers = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      const data = await customerService.getCustomers();
      setCustomers(data);
      setFilteredCustomers(data);
    } catch (error) {
      console.error('Error loading customers:', error);
      Alert.alert('Error', 'Failed to load customers');
    } finally {
      if (showLoader) setLoading(false);
      setRefreshing(false);
    }
  };

  // Filter and search customers
  const filterCustomers = useCallback(() => {
    let filtered = [...customers];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(customer =>
        customer.name?.toLowerCase().includes(query) ||
        customer.email?.toLowerCase().includes(query) ||
        customer.phone?.includes(query)
      );
    }

    // Apply category filter
    switch (selectedFilter) {
      case 'active':
        filtered = filtered.filter(customer => customer.status === 'active');
        break;
      case 'vip':
        filtered = filtered.filter(customer => customer.isVip || customer.totalOrders >= 5);
        break;
      case 'recent':
        filtered = filtered.filter(customer => {
          const lastOrderDate = new Date(customer.lastOrderDate);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return lastOrderDate >= thirtyDaysAgo;
        });
        break;
    }

    // Apply sorting
    switch (sortBy) {
      case 'name':
        filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'orders':
        filtered.sort((a, b) => (b.totalOrders || 0) - (a.totalOrders || 0));
        break;
      case 'value':
        filtered.sort((a, b) => (b.totalSpent || 0) - (a.totalSpent || 0));
        break;
      case 'recent':
      default:
        filtered.sort((a, b) => new Date(b.lastOrderDate || 0) - new Date(a.lastOrderDate || 0));
        break;
    }

    setFilteredCustomers(filtered);
  }, [customers, searchQuery, selectedFilter, sortBy]);

  // Effects
  useEffect(() => {
    filterCustomers();
  }, [filterCustomers]);

  useFocusEffect(
    useCallback(() => {
      loadCustomers();
    }, [])
  );

  // Refresh handler
  const onRefresh = () => {
    setRefreshing(true);
    loadCustomers(false);
  };

  // Navigate to customer detail
  const navigateToCustomer = (customer) => {
    navigation.navigate('CustomerDetail', { customerId: customer.id, customer });
  };

  // Get customer status color
  const getStatusColor = (customer) => {
    if (customer.isVip) return '#f59e0b';
    if (customer.status === 'active') return '#10b981';
    return '#6b7280';
  };

  // Render customer item
  const renderCustomerItem = ({ item: customer }) => (
    <TouchableOpacity
      style={styles.customerCard}
      onPress={() => navigateToCustomer(customer)}
      activeOpacity={0.7}
    >
      <View style={styles.customerHeader}>
        <View style={styles.customerInfo}>
          <View style={styles.customerNameRow}>
            <Text style={styles.customerName} numberOfLines={1}>
              {customer.name || 'Unknown Customer'}
            </Text>
            {customer.isVip && (
              <View style={styles.vipBadge}>
                <Ionicons name="star" size={12} color="#f59e0b" />
                <Text style={styles.vipText}>VIP</Text>
              </View>
            )}
          </View>
          <Text style={styles.customerEmail} numberOfLines={1}>
            {customer.email || 'No email'}
          </Text>
          {customer.phone && (
            <Text style={styles.customerPhone} numberOfLines={1}>
              {customer.phone}
            </Text>
          )}
        </View>
        <View style={styles.customerStats}>
          <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(customer) }]} />
        </View>
      </View>

      <View style={styles.customerFooter}>
        <View style={styles.statItem}>
          <Ionicons name="receipt-outline" size={16} color="#6b7280" />
          <Text style={styles.statText}>
            {customer.totalOrders || 0} orders
          </Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="cash-outline" size={16} color="#6b7280" />
          <Text style={styles.statText}>
            ${(customer.totalSpent || 0).toFixed(2)}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="time-outline" size={16} color="#6b7280" />
          <Text style={styles.statText}>
            {customer.lastOrderDate ? 
              new Date(customer.lastOrderDate).toLocaleDateString() : 
              'No orders'
            }
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Render filter modal
  const renderFilterModal = () => (
    <Modal
      visible={filterModalVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setFilterModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filter & Sort</Text>
            <TouchableOpacity
              onPress={() => setFilterModalVisible(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.sectionTitle}>Filter by Category</Text>
            {filterOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.filterOption,
                  selectedFilter === option.key && styles.filterOptionSelected
                ]}
                onPress={() => setSelectedFilter(option.key)}
              >
                <Ionicons
                  name={option.icon}
                  size={20}
                  color={selectedFilter === option.key ? '#667eea' : '#6b7280'}
                />
                <Text
                  style={[
                    styles.filterOptionText,
                    selectedFilter === option.key && styles.filterOptionTextSelected
                  ]}
                >
                  {option.label}
                </Text>
                {selectedFilter === option.key && (
                  <Ionicons name="checkmark" size={20} color="#667eea" />
                )}
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.sectionTitle}>Sort by</Text>
            {sortOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.filterOption,
                  sortBy === option.key && styles.filterOptionSelected
                ]}
                onPress={() => setSortBy(option.key)}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    sortBy === option.key && styles.filterOptionTextSelected
                  ]}
                >
                  {option.label}
                </Text>
                {sortBy === option.key && (
                  <Ionicons name="checkmark" size={20} color="#667eea" />
                )}
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.applyButton}
            onPress={() => setFilterModalVisible(false)}
          >
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading customers...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Customers</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setFilterModalVisible(true)}
          >
            <Ionicons name="filter-outline" size={24} color="#667eea" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#6b7280" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search customers..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9ca3af"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchQuery('')}
            style={styles.clearButton}
          >
            <Ionicons name="close-circle" size={20} color="#6b7280" />
          </TouchableOpacity>
        )}
      </View>

      {/* Stats Summary */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{customers.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {customers.filter(c => c.status === 'active').length}
          </Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {customers.filter(c => c.isVip).length}
          </Text>
          <Text style={styles.statLabel}>VIP</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{filteredCustomers.length}</Text>
          <Text style={styles.statLabel}>Filtered</Text>
        </View>
      </View>

      {/* Customer List */}
      <FlatList
        data={filteredCustomers}
        renderItem={renderCustomerItem}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#667eea']}
            tintColor="#667eea"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyTitle}>No customers found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? 'Try adjusting your search' : 'Customers will appear here'}
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Filter Modal */}
      {renderFilterModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: '#1f2937',
  },
  clearButton: {
    padding: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    marginHorizontal: 4,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  customerCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  customerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  customerInfo: {
    flex: 1,
  },
  customerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  vipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  vipText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#f59e0b',
    marginLeft: 2,
  },
  customerEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  customerPhone: {
    fontSize: 14,
    color: '#6b7280',
  },
  customerStats: {
    alignItems: 'flex-end',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  customerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  closeButton: {
    padding: 4,
  },
  filterSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  filterOptionSelected: {
    backgroundColor: '#f0f4ff',
  },
  filterOptionText: {
    flex: 1,
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 12,
  },
  filterOptionTextSelected: {
    color: '#667eea',
    fontWeight: '500',
  },
  applyButton: {
    backgroundColor: '#667eea',
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CustomersScreen;
