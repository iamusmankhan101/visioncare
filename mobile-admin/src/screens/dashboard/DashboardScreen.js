import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// Services
import { supabase, subscribeToTable, unsubscribeFromTable } from '../../config/supabase';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

const DashboardScreen = () => {
  const navigation = useNavigation();
  const { userProfile } = useAuth();
  
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    todayOrders: 0,
    totalRevenue: 0,
    todayRevenue: 0,
    lowStockProducts: 0,
    totalCustomers: 0,
    newCustomers: 0,
  });
  
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Real-time subscriptions
  const [orderSubscription, setOrderSubscription] = useState(null);
  const [productSubscription, setProductSubscription] = useState(null);

  useEffect(() => {
    loadDashboardData();
    setupRealtimeSubscriptions();

    return () => {
      // Cleanup subscriptions
      if (orderSubscription) unsubscribeFromTable(orderSubscription);
      if (productSubscription) unsubscribeFromTable(productSubscription);
    };
  }, []);

  const setupRealtimeSubscriptions = () => {
    // Subscribe to order changes
    const orderSub = subscribeToTable('orders', (payload) => {
      console.log('Order change:', payload);
      loadOrderStats();
      loadRecentOrders();
    });
    setOrderSubscription(orderSub);

    // Subscribe to product changes
    const productSub = subscribeToTable('products', (payload) => {
      console.log('Product change:', payload);
      loadProductStats();
    });
    setProductSubscription(productSub);
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadOrderStats(),
        loadRecentOrders(),
        loadProductStats(),
        loadCustomerStats(),
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const loadOrderStats = async () => {
    try {
      // Get total orders
      const { count: totalOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });

      // Get pending orders
      const { count: pendingOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Get today's orders
      const today = new Date().toISOString().split('T')[0];
      const { data: todayOrdersData, count: todayOrders } = await supabase
        .from('orders')
        .select('total_amount', { count: 'exact' })
        .gte('created_at', `${today}T00:00:00`)
        .lt('created_at', `${today}T23:59:59`);

      // Calculate today's revenue
      const todayRevenue = todayOrdersData?.reduce((sum, order) => 
        sum + parseFloat(order.total_amount || 0), 0) || 0;

      // Get total revenue
      const { data: revenueData } = await supabase
        .from('orders')
        .select('total_amount')
        .neq('status', 'cancelled');

      const totalRevenue = revenueData?.reduce((sum, order) => 
        sum + parseFloat(order.total_amount || 0), 0) || 0;

      setStats(prev => ({
        ...prev,
        totalOrders: totalOrders || 0,
        pendingOrders: pendingOrders || 0,
        todayOrders: todayOrders || 0,
        todayRevenue,
        totalRevenue,
      }));
    } catch (error) {
      console.error('Error loading order stats:', error);
    }
  };

  const loadRecentOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          status,
          total_amount,
          created_at,
          customers (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentOrders(data || []);
    } catch (error) {
      console.error('Error loading recent orders:', error);
    }
  };

  const loadProductStats = async () => {
    try {
      // Get low stock products
      const { data: lowStockData, count: lowStockCount } = await supabase
        .from('products')
        .select('id, name, stock_quantity, low_stock_threshold', { count: 'exact' })
        .lt('stock_quantity', 'low_stock_threshold')
        .eq('is_active', true)
        .limit(5);

      setLowStockProducts(lowStockData || []);
      setStats(prev => ({
        ...prev,
        lowStockProducts: lowStockCount || 0,
      }));
    } catch (error) {
      console.error('Error loading product stats:', error);
    }
  };

  const loadCustomerStats = async () => {
    try {
      // Get total customers
      const { count: totalCustomers } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true });

      // Get new customers (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { count: newCustomers } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString());

      setStats(prev => ({
        ...prev,
        totalCustomers: totalCustomers || 0,
        newCustomers: newCustomers || 0,
      }));
    } catch (error) {
      console.error('Error loading customer stats:', error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  }, []);

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

  const StatCard = ({ title, value, icon, color, trend, onPress }) => (
    <TouchableOpacity style={styles.statCard} onPress={onPress}>
      <LinearGradient
        colors={[color, `${color}dd`]}
        style={styles.statGradient}
      >
        <View style={styles.statContent}>
          <View style={styles.statHeader}>
            <Ionicons name={icon} size={24} color="white" />
            {trend && (
              <View style={styles.trendContainer}>
                <Ionicons 
                  name={trend > 0 ? 'trending-up' : 'trending-down'} 
                  size={16} 
                  color="white" 
                />
                <Text style={styles.trendText}>{Math.abs(trend)}%</Text>
              </View>
            )}
          </View>
          <Text style={styles.statValue}>{value}</Text>
          <Text style={styles.statTitle}>{title}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const OrderItem = ({ order }) => (
    <TouchableOpacity
      style={styles.orderItem}
      onPress={() => navigation.navigate('OrderDetail', { orderId: order.id })}
    >
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
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
          <Text style={styles.statusText}>{order.status}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {userProfile?.full_name || 'Admin'}</Text>
          <Text style={styles.subtitle}>Here's your business overview</Text>
        </View>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <Ionicons name="person-circle-outline" size={32} color="#667eea" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Orders"
            value={stats.totalOrders}
            icon="receipt-outline"
            color="#667eea"
            trend={12}
            onPress={() => navigation.navigate('Orders')}
          />
          <StatCard
            title="Pending Orders"
            value={stats.pendingOrders}
            icon="time-outline"
            color="#f59e0b"
            onPress={() => navigation.navigate('Orders', { filter: 'pending' })}
          />
          <StatCard
            title="Today's Orders"
            value={stats.todayOrders}
            icon="today-outline"
            color="#10b981"
            trend={8}
          />
          <StatCard
            title="Total Revenue"
            value={formatCurrency(stats.totalRevenue)}
            icon="trending-up-outline"
            color="#8b5cf6"
            trend={15}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Orders')}
            >
              <Ionicons name="receipt" size={24} color="#667eea" />
              <Text style={styles.actionText}>View Orders</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Products')}
            >
              <Ionicons name="cube" size={24} color="#10b981" />
              <Text style={styles.actionText}>Manage Products</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Customers')}
            >
              <Ionicons name="people" size={24} color="#f59e0b" />
              <Text style={styles.actionText}>View Customers</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Notifications')}
            >
              <Ionicons name="notifications" size={24} color="#ef4444" />
              <Text style={styles.actionText}>Notifications</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Orders */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Orders</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Orders')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.card}>
            {recentOrders.length > 0 ? (
              recentOrders.map((order, index) => (
                <OrderItem key={order.id} order={order} />
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="receipt-outline" size={48} color="#cbd5e1" />
                <Text style={styles.emptyText}>No recent orders</Text>
              </View>
            )}
          </View>
        </View>

        {/* Low Stock Alert */}
        {lowStockProducts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Low Stock Alert</Text>
            <View style={[styles.card, styles.alertCard]}>
              <View style={styles.alertHeader}>
                <Ionicons name="warning" size={20} color="#f59e0b" />
                <Text style={styles.alertTitle}>
                  {stats.lowStockProducts} products running low
                </Text>
              </View>
              {lowStockProducts.map((product, index) => (
                <View key={product.id} style={styles.lowStockItem}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.stockLevel}>
                    {product.stock_quantity} left
                  </Text>
                </View>
              ))}
              <TouchableOpacity
                style={styles.alertAction}
                onPress={() => navigation.navigate('Products', { filter: 'lowStock' })}
              >
                <Text style={styles.alertActionText}>Manage Inventory</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
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
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  profileButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    width: (width - 60) / 2,
    marginBottom: 16,
  },
  statGradient: {
    borderRadius: 16,
    padding: 20,
  },
  statContent: {
    alignItems: 'flex-start',
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  viewAllText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '500',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: (width - 60) / 2,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
    marginTop: 8,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  customerName: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  orderDate: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  orderRight: {
    alignItems: 'flex-end',
  },
  orderAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#059669',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 14,
    marginTop: 8,
  },
  alertCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400e',
    marginLeft: 8,
  },
  lowStockItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  productName: {
    fontSize: 14,
    color: '#1e293b',
    flex: 1,
  },
  stockLevel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f59e0b',
  },
  alertAction: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  alertActionText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default DashboardScreen;
