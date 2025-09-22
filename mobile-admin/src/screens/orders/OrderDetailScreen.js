import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

// Services
import { supabase } from '../../config/supabase';
import { useAuth } from '../../context/AuthContext';

const OrderDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { orderId } = route.params;
  const { hasPermission } = useAuth();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrderDetails();
  }, [orderId]);

  const loadOrderDetails = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          customers (
            id,
            full_name,
            email,
            phone,
            address
          ),
          order_items (
            id,
            product_name,
            product_sku,
            quantity,
            unit_price,
            total_price,
            product_options
          ),
          profiles!orders_assigned_to_fkey (
            full_name
          )
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;
      setOrder(data);
    } catch (error) {
      console.error('Error loading order details:', error);
      Alert.alert('Error', 'Failed to load order details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (newStatus) => {
    if (!hasPermission('edit_orders')) {
      Alert.alert('Permission Denied', 'You do not have permission to update orders');
      return;
    }

    try {
      const updates = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      };

      if (newStatus === 'shipped') {
        updates.shipped_at = new Date().toISOString();
      } else if (newStatus === 'delivered') {
        updates.delivered_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', orderId);

      if (error) throw error;

      setOrder(prev => ({ ...prev, ...updates }));
      Alert.alert('Success', 'Order status updated successfully');
    } catch (error) {
      console.error('Error updating order status:', error);
      Alert.alert('Error', 'Failed to update order status');
    }
  };

  const showStatusUpdateOptions = () => {
    const statusOptions = [
      { label: 'Mark as Processing', value: 'processing', icon: 'refresh' },
      { label: 'Mark as Shipped', value: 'shipped', icon: 'car' },
      { label: 'Mark as Delivered', value: 'delivered', icon: 'checkmark-circle' },
      { label: 'Cancel Order', value: 'cancelled', icon: 'close-circle' },
    ];

    const options = statusOptions
      .filter(option => option.value !== order.status)
      .map(option => ({
        text: option.label,
        onPress: () => updateOrderStatus(option.value),
      }));

    options.push({ text: 'Cancel', style: 'cancel' });

    Alert.alert('Update Order Status', `Order #${order.order_number}`, options);
  };

  const handleCallCustomer = () => {
    if (order.customers?.phone) {
      Linking.openURL(`tel:${order.customers.phone}`);
    } else {
      Alert.alert('No Phone Number', 'Customer phone number not available');
    }
  };

  const handleEmailCustomer = () => {
    if (order.customers?.email) {
      Linking.openURL(`mailto:${order.customers.email}?subject=Order #${order.order_number}`);
    } else {
      Alert.alert('No Email', 'Customer email not available');
    }
  };

  const handleShareOrder = async () => {
    try {
      const orderSummary = `Order #${order.order_number}\nCustomer: ${order.customers?.full_name}\nTotal: ${formatCurrency(order.total_amount)}\nStatus: ${order.status}`;
      
      await Share.share({
        message: orderSummary,
        title: `Order #${order.order_number}`,
      });
    } catch (error) {
      console.error('Error sharing order:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
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

  if (loading || !order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading order details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.title}>Order Details</Text>
        <TouchableOpacity
          style={styles.shareButton}
          onPress={handleShareOrder}
        >
          <Ionicons name="share-outline" size={24} color="#667eea" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Order Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View>
              <Text style={styles.orderNumber}>#{order.order_number}</Text>
              <Text style={styles.orderDate}>
                Placed on {formatDate(order.created_at)}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
              <Ionicons 
                name={getStatusIcon(order.status)} 
                size={16} 
                color="white" 
                style={styles.statusIcon}
              />
              <Text style={styles.statusText}>{order.status}</Text>
            </View>
          </View>
          
          {hasPermission('edit_orders') && (
            <TouchableOpacity
              style={styles.updateStatusButton}
              onPress={showStatusUpdateOptions}
            >
              <Ionicons name="create-outline" size={16} color="#667eea" />
              <Text style={styles.updateStatusText}>Update Status</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Customer Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Information</Text>
          <View style={styles.card}>
            <View style={styles.customerInfo}>
              <View style={styles.customerAvatar}>
                <Text style={styles.avatarText}>
                  {order.customers?.full_name?.charAt(0) || 'C'}
                </Text>
              </View>
              <View style={styles.customerDetails}>
                <Text style={styles.customerName}>
                  {order.customers?.full_name || 'Unknown Customer'}
                </Text>
                <Text style={styles.customerEmail}>
                  {order.customers?.email || 'No email'}
                </Text>
                <Text style={styles.customerPhone}>
                  {order.customers?.phone || 'No phone'}
                </Text>
              </View>
            </View>
            
            <View style={styles.customerActions}>
              {order.customers?.phone && (
                <TouchableOpacity
                  style={styles.customerAction}
                  onPress={handleCallCustomer}
                >
                  <Ionicons name="call" size={20} color="#10b981" />
                </TouchableOpacity>
              )}
              {order.customers?.email && (
                <TouchableOpacity
                  style={styles.customerAction}
                  onPress={handleEmailCustomer}
                >
                  <Ionicons name="mail" size={20} color="#3b82f6" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Items</Text>
          <View style={styles.card}>
            {order.order_items?.map((item, index) => (
              <View key={item.id} style={styles.orderItem}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.product_name}</Text>
                  {item.product_sku && (
                    <Text style={styles.itemSku}>SKU: {item.product_sku}</Text>
                  )}
                  {item.product_options && (
                    <Text style={styles.itemOptions}>
                      {JSON.stringify(item.product_options)}
                    </Text>
                  )}
                  <Text style={styles.itemPrice}>
                    {formatCurrency(item.unit_price)} × {item.quantity}
                  </Text>
                </View>
                <Text style={styles.itemTotal}>
                  {formatCurrency(item.total_price)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.card}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(order.subtotal)}
              </Text>
            </View>
            
            {order.tax_amount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tax</Text>
                <Text style={styles.summaryValue}>
                  {formatCurrency(order.tax_amount)}
                </Text>
              </View>
            )}
            
            {order.shipping_amount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Shipping</Text>
                <Text style={styles.summaryValue}>
                  {formatCurrency(order.shipping_amount)}
                </Text>
              </View>
            )}
            
            {order.discount_amount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Discount</Text>
                <Text style={[styles.summaryValue, { color: '#ef4444' }]}>
                  -{formatCurrency(order.discount_amount)}
                </Text>
              </View>
            )}
            
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(order.total_amount)}
              </Text>
            </View>
          </View>
        </View>

        {/* Addresses */}
        {(order.shipping_address || order.billing_address) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Addresses</Text>
            <View style={styles.card}>
              {order.shipping_address && (
                <View style={styles.addressSection}>
                  <Text style={styles.addressTitle}>Shipping Address</Text>
                  <Text style={styles.addressText}>
                    {typeof order.shipping_address === 'string' 
                      ? order.shipping_address 
                      : JSON.stringify(order.shipping_address, null, 2)}
                  </Text>
                </View>
              )}
              
              {order.billing_address && (
                <View style={styles.addressSection}>
                  <Text style={styles.addressTitle}>Billing Address</Text>
                  <Text style={styles.addressText}>
                    {typeof order.billing_address === 'string' 
                      ? order.billing_address 
                      : JSON.stringify(order.billing_address, null, 2)}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Order Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Timeline</Text>
          <View style={styles.card}>
            <View style={styles.timelineItem}>
              <View style={styles.timelineDot} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Order Placed</Text>
                <Text style={styles.timelineDate}>
                  {formatDate(order.created_at)}
                </Text>
              </View>
            </View>
            
            {order.shipped_at && (
              <View style={styles.timelineItem}>
                <View style={styles.timelineDot} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>Order Shipped</Text>
                  <Text style={styles.timelineDate}>
                    {formatDate(order.shipped_at)}
                  </Text>
                </View>
              </View>
            )}
            
            {order.delivered_at && (
              <View style={styles.timelineItem}>
                <View style={styles.timelineDot} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>Order Delivered</Text>
                  <Text style={styles.timelineDate}>
                    {formatDate(order.delivered_at)}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  shareButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statusCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  orderNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    color: '#64748b',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusIcon: {
    marginRight: 6,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  updateStatusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  updateStatusText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
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
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  customerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  customerDetails: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  customerEmail: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 2,
  },
  customerPhone: {
    fontSize: 14,
    color: '#64748b',
  },
  customerActions: {
    flexDirection: 'row',
  },
  customerAction: {
    padding: 12,
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  itemInfo: {
    flex: 1,
    marginRight: 16,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 4,
  },
  itemSku: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 2,
  },
  itemOptions: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: '#64748b',
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#059669',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    marginTop: 8,
    paddingTop: 16,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#059669',
  },
  addressSection: {
    marginBottom: 16,
  },
  addressTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  addressText: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#667eea',
    marginRight: 16,
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 2,
  },
  timelineDate: {
    fontSize: 12,
    color: '#64748b',
  },
});

export default OrderDetailScreen;
