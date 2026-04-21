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
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

// Services
import { supabase, subscribeToTable, unsubscribeFromTable } from '../../config/supabase';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');
const cardWidth = (width - 60) / 2;

const ProductsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { hasPermission } = useAuth();
  
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState(route.params?.filter || 'all');
  const [productSubscription, setProductSubscription] = useState(null);

  const filters = [
    { id: 'all', label: 'All Products', icon: 'cube-outline' },
    { id: 'lowStock', label: 'Low Stock', icon: 'warning-outline' },
    { id: 'outOfStock', label: 'Out of Stock', icon: 'close-circle-outline' },
    { id: 'active', label: 'Active', icon: 'checkmark-circle-outline' },
    { id: 'inactive', label: 'Inactive', icon: 'pause-circle-outline' },
  ];

  useEffect(() => {
    loadProducts();
    setupRealtimeSubscription();

    return () => {
      if (productSubscription) unsubscribeFromTable(productSubscription);
    };
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchQuery, activeFilter]);

  const setupRealtimeSubscription = () => {
    const subscription = subscribeToTable('products', (payload) => {
      console.log('Product change:', payload);
      loadProducts();
    });
    setProductSubscription(subscription);
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
      Alert.alert('Error', 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    // Apply filter
    switch (activeFilter) {
      case 'lowStock':
        filtered = filtered.filter(product => 
          product.stock_quantity <= product.low_stock_threshold && product.stock_quantity > 0
        );
        break;
      case 'outOfStock':
        filtered = filtered.filter(product => product.stock_quantity === 0);
        break;
      case 'active':
        filtered = filtered.filter(product => product.is_active);
        break;
      case 'inactive':
        filtered = filtered.filter(product => !product.is_active);
        break;
      default:
        // 'all' - no additional filtering
        break;
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(query) ||
        product.sku?.toLowerCase().includes(query) ||
        product.category?.toLowerCase().includes(query) ||
        product.brand?.toLowerCase().includes(query)
      );
    }

    setFilteredProducts(filtered);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  }, []);

  const updateProductStatus = async (productId, isActive) => {
    if (!hasPermission('edit_products')) {
      Alert.alert('Permission Denied', 'You do not have permission to update products');
      return;
    }

    try {
      const { error } = await supabase
        .from('products')
        .update({ 
          is_active: isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId);

      if (error) throw error;

      // Update local state
      setProducts(prev => prev.map(product => 
        product.id === productId 
          ? { ...product, is_active: isActive, updated_at: new Date().toISOString() }
          : product
      ));

      Alert.alert('Success', `Product ${isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Error updating product status:', error);
      Alert.alert('Error', 'Failed to update product status');
    }
  };

  const showProductOptions = (product) => {
    const options = [];

    options.push({
      text: 'View Details',
      onPress: () => navigation.navigate('ProductDetail', { productId: product.id }),
    });

    if (hasPermission('edit_products')) {
      options.push({
        text: product.is_active ? 'Deactivate' : 'Activate',
        onPress: () => updateProductStatus(product.id, !product.is_active),
      });
    }

    options.push({ text: 'Cancel', style: 'cancel' });

    Alert.alert(product.name, 'Choose an action', options);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStockStatus = (product) => {
    if (product.stock_quantity === 0) {
      return { label: 'Out of Stock', color: '#ef4444' };
    } else if (product.stock_quantity <= product.low_stock_threshold) {
      return { label: 'Low Stock', color: '#f59e0b' };
    } else {
      return { label: 'In Stock', color: '#10b981' };
    }
  };

  const renderProductItem = ({ item: product }) => {
    const stockStatus = getStockStatus(product);
    const imageUri = product.images && product.images.length > 0 ? product.images[0] : null;

    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => navigation.navigate('ProductDetail', { productId: product.id })}
        onLongPress={() => showProductOptions(product)}
      >
        <View style={styles.productImageContainer}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.productImage} />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons name="image-outline" size={32} color="#cbd5e1" />
            </View>
          )}
          
          {!product.is_active && (
            <View style={styles.inactiveOverlay}>
              <Text style={styles.inactiveText}>Inactive</Text>
            </View>
          )}
          
          <View style={[styles.stockBadge, { backgroundColor: stockStatus.color }]}>
            <Text style={styles.stockText}>{product.stock_quantity}</Text>
          </View>
        </View>

        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {product.name}
          </Text>
          
          <Text style={styles.productBrand} numberOfLines={1}>
            {product.brand || 'No Brand'}
          </Text>
          
          <Text style={styles.productSku} numberOfLines={1}>
            SKU: {product.sku || 'N/A'}
          </Text>
          
          <View style={styles.productFooter}>
            <Text style={styles.productPrice}>
              {formatCurrency(product.price)}
            </Text>
            
            <View style={[styles.statusDot, { backgroundColor: stockStatus.color }]} />
          </View>
        </View>

        <TouchableOpacity
          style={styles.moreButton}
          onPress={() => showProductOptions(product)}
        >
          <Ionicons name="ellipsis-vertical" size={16} color="#64748b" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="cube-outline" size={64} color="#cbd5e1" />
      <Text style={styles.emptyTitle}>No products found</Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery ? 'Try adjusting your search' : 'Products will appear here when added'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Products</Text>
        {hasPermission('edit_products') && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('ProductDetail', { isNew: true })}
          >
            <Ionicons name="add" size={20} color="white" />
          </TouchableOpacity>
        )}
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#94a3b8" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
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

      {/* Products Grid */}
      <FlatList
        data={filteredProducts}
        keyExtractor={item => item.id}
        renderItem={renderProductItem}
        numColumns={2}
        columnWrapperStyle={styles.row}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={!loading ? renderEmptyState : null}
        showsVerticalScrollIndicator={false}
      />
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
  addButton: {
    backgroundColor: '#667eea',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
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
  row: {
    justifyContent: 'space-between',
  },
  productCard: {
    width: cardWidth,
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  productImageContainer: {
    position: 'relative',
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inactiveOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inactiveText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  stockBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 24,
    alignItems: 'center',
  },
  stockText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
    lineHeight: 18,
  },
  productBrand: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 2,
  },
  productSku: {
    fontSize: 10,
    color: '#94a3b8',
    marginBottom: 8,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  moreButton: {
    position: 'absolute',
    top: 8,
    left: 8,
    padding: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
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
});

export default ProductsScreen;
