import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  TextInput,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

// Services
import { supabase } from '../../config/supabase';
import { useAuth } from '../../context/AuthContext';

const ProductDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { productId, isNew } = route.params;
  const { hasPermission } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(isNew);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    cost: '',
    sku: '',
    barcode: '',
    category: '',
    brand: '',
    stock_quantity: '',
    low_stock_threshold: '10',
    is_active: true,
  });

  useEffect(() => {
    if (!isNew && productId) {
      loadProductDetails();
    }
  }, [productId, isNew]);

  const loadProductDetails = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (error) throw error;
      
      setProduct(data);
      setFormData({
        name: data.name || '',
        description: data.description || '',
        price: data.price?.toString() || '',
        cost: data.cost?.toString() || '',
        sku: data.sku || '',
        barcode: data.barcode || '',
        category: data.category || '',
        brand: data.brand || '',
        stock_quantity: data.stock_quantity?.toString() || '',
        low_stock_threshold: data.low_stock_threshold?.toString() || '10',
        is_active: data.is_active ?? true,
      });
    } catch (error) {
      console.error('Error loading product details:', error);
      Alert.alert('Error', 'Failed to load product details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price) || 0,
        cost: parseFloat(formData.cost) || 0,
        sku: formData.sku.trim() || null,
        barcode: formData.barcode.trim() || null,
        category: formData.category.trim() || null,
        brand: formData.brand.trim() || null,
        stock_quantity: parseInt(formData.stock_quantity) || 0,
        low_stock_threshold: parseInt(formData.low_stock_threshold) || 10,
        is_active: formData.is_active,
        updated_at: new Date().toISOString(),
      };

      if (isNew) {
        const { data, error } = await supabase
          .from('products')
          .insert([productData])
          .select()
          .single();

        if (error) throw error;
        
        setProduct(data);
        Alert.alert('Success', 'Product created successfully');
        navigation.setParams({ productId: data.id, isNew: false });
      } else {
        const { data, error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', productId)
          .select()
          .single();

        if (error) throw error;
        
        setProduct(data);
        Alert.alert('Success', 'Product updated successfully');
      }
      
      setEditing(false);
    } catch (error) {
      console.error('Error saving product:', error);
      Alert.alert('Error', 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Validation Error', 'Product name is required');
      return false;
    }
    
    if (!formData.price || parseFloat(formData.price) < 0) {
      Alert.alert('Validation Error', 'Valid price is required');
      return false;
    }
    
    return true;
  };

  const handleDelete = () => {
    if (!hasPermission('delete_products')) {
      Alert.alert('Permission Denied', 'You do not have permission to delete products');
      return;
    }

    Alert.alert(
      'Delete Product',
      'Are you sure you want to delete this product? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: confirmDelete,
        },
      ]
    );
  };

  const confirmDelete = async () => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
      
      Alert.alert('Success', 'Product deleted successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Error deleting product:', error);
      Alert.alert('Error', 'Failed to delete product');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStockStatus = () => {
    if (!product) return null;
    
    if (product.stock_quantity === 0) {
      return { label: 'Out of Stock', color: '#ef4444' };
    } else if (product.stock_quantity <= product.low_stock_threshold) {
      return { label: 'Low Stock', color: '#f59e0b' };
    } else {
      return { label: 'In Stock', color: '#10b981' };
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading product details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const stockStatus = getStockStatus();

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
        
        <Text style={styles.title}>
          {isNew ? 'New Product' : 'Product Details'}
        </Text>
        
        <View style={styles.headerActions}>
          {!isNew && hasPermission('edit_products') && !editing && (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setEditing(true)}
            >
              <Ionicons name="create-outline" size={20} color="#667eea" />
            </TouchableOpacity>
          )}
          
          {editing && (
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              disabled={saving}
            >
              <Ionicons name="checkmark" size={20} color="white" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        <View style={styles.imageSection}>
          <View style={styles.imageContainer}>
            {product?.images && product.images.length > 0 ? (
              <Image source={{ uri: product.images[0] }} style={styles.productImage} />
            ) : (
              <View style={styles.placeholderImage}>
                <Ionicons name="image-outline" size={48} color="#cbd5e1" />
                <Text style={styles.placeholderText}>No Image</Text>
              </View>
            )}
          </View>
          
          {editing && (
            <TouchableOpacity style={styles.changeImageButton}>
              <Ionicons name="camera-outline" size={20} color="#667eea" />
              <Text style={styles.changeImageText}>Change Image</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          <View style={styles.card}>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Product Name *</Text>
              {editing ? (
                <TextInput
                  style={styles.textInput}
                  value={formData.name}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                  placeholder="Enter product name"
                />
              ) : (
                <Text style={styles.fieldValue}>{product?.name || 'N/A'}</Text>
              )}
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Description</Text>
              {editing ? (
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={formData.description}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                  placeholder="Enter product description"
                  multiline
                  numberOfLines={3}
                />
              ) : (
                <Text style={styles.fieldValue}>{product?.description || 'No description'}</Text>
              )}
            </View>

            <View style={styles.fieldRow}>
              <View style={styles.fieldHalf}>
                <Text style={styles.fieldLabel}>Category</Text>
                {editing ? (
                  <TextInput
                    style={styles.textInput}
                    value={formData.category}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, category: text }))}
                    placeholder="Category"
                  />
                ) : (
                  <Text style={styles.fieldValue}>{product?.category || 'N/A'}</Text>
                )}
              </View>

              <View style={styles.fieldHalf}>
                <Text style={styles.fieldLabel}>Brand</Text>
                {editing ? (
                  <TextInput
                    style={styles.textInput}
                    value={formData.brand}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, brand: text }))}
                    placeholder="Brand"
                  />
                ) : (
                  <Text style={styles.fieldValue}>{product?.brand || 'N/A'}</Text>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Pricing */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pricing</Text>
          <View style={styles.card}>
            <View style={styles.fieldRow}>
              <View style={styles.fieldHalf}>
                <Text style={styles.fieldLabel}>Price *</Text>
                {editing ? (
                  <TextInput
                    style={styles.textInput}
                    value={formData.price}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, price: text }))}
                    placeholder="0.00"
                    keyboardType="decimal-pad"
                  />
                ) : (
                  <Text style={styles.fieldValue}>
                    {product?.price ? formatCurrency(product.price) : 'N/A'}
                  </Text>
                )}
              </View>

              <View style={styles.fieldHalf}>
                <Text style={styles.fieldLabel}>Cost</Text>
                {editing ? (
                  <TextInput
                    style={styles.textInput}
                    value={formData.cost}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, cost: text }))}
                    placeholder="0.00"
                    keyboardType="decimal-pad"
                  />
                ) : (
                  <Text style={styles.fieldValue}>
                    {product?.cost ? formatCurrency(product.cost) : 'N/A'}
                  </Text>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Inventory */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Inventory</Text>
          <View style={styles.card}>
            <View style={styles.fieldRow}>
              <View style={styles.fieldHalf}>
                <Text style={styles.fieldLabel}>Stock Quantity</Text>
                {editing ? (
                  <TextInput
                    style={styles.textInput}
                    value={formData.stock_quantity}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, stock_quantity: text }))}
                    placeholder="0"
                    keyboardType="number-pad"
                  />
                ) : (
                  <View style={styles.stockInfo}>
                    <Text style={styles.fieldValue}>{product?.stock_quantity || 0}</Text>
                    {stockStatus && (
                      <View style={[styles.stockBadge, { backgroundColor: stockStatus.color }]}>
                        <Text style={styles.stockBadgeText}>{stockStatus.label}</Text>
                      </View>
                    )}
                  </View>
                )}
              </View>

              <View style={styles.fieldHalf}>
                <Text style={styles.fieldLabel}>Low Stock Alert</Text>
                {editing ? (
                  <TextInput
                    style={styles.textInput}
                    value={formData.low_stock_threshold}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, low_stock_threshold: text }))}
                    placeholder="10"
                    keyboardType="number-pad"
                  />
                ) : (
                  <Text style={styles.fieldValue}>{product?.low_stock_threshold || 10}</Text>
                )}
              </View>
            </View>

            <View style={styles.fieldRow}>
              <View style={styles.fieldHalf}>
                <Text style={styles.fieldLabel}>SKU</Text>
                {editing ? (
                  <TextInput
                    style={styles.textInput}
                    value={formData.sku}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, sku: text }))}
                    placeholder="Product SKU"
                  />
                ) : (
                  <Text style={styles.fieldValue}>{product?.sku || 'N/A'}</Text>
                )}
              </View>

              <View style={styles.fieldHalf}>
                <Text style={styles.fieldLabel}>Barcode</Text>
                {editing ? (
                  <TextInput
                    style={styles.textInput}
                    value={formData.barcode}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, barcode: text }))}
                    placeholder="Barcode"
                  />
                ) : (
                  <Text style={styles.fieldValue}>{product?.barcode || 'N/A'}</Text>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status</Text>
          <View style={styles.card}>
            <View style={styles.switchField}>
              <View>
                <Text style={styles.fieldLabel}>Active Product</Text>
                <Text style={styles.fieldDescription}>
                  Active products are visible to customers
                </Text>
              </View>
              <Switch
                value={editing ? formData.is_active : product?.is_active}
                onValueChange={(value) => {
                  if (editing) {
                    setFormData(prev => ({ ...prev, is_active: value }));
                  }
                }}
                disabled={!editing}
                trackColor={{ false: '#f1f5f9', true: '#667eea' }}
                thumbColor={editing ? (formData.is_active ? '#667eea' : '#f4f3f4') : '#f4f3f4'}
              />
            </View>
          </View>
        </View>

        {/* Delete Button */}
        {!isNew && hasPermission('delete_products') && editing && (
          <View style={styles.section}>
            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
              <Ionicons name="trash-outline" size={20} color="#ef4444" />
              <Text style={styles.deleteButtonText}>Delete Product</Text>
            </TouchableOpacity>
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
    flex: 1,
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    padding: 4,
  },
  saveButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  imageSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  imageContainer: {
    width: 200,
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  placeholderText: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 8,
  },
  changeImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'white',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  changeImageText: {
    color: '#667eea',
    fontSize: 14,
    marginLeft: 6,
  },
  section: {
    marginBottom: 24,
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
  field: {
    marginBottom: 16,
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  fieldHalf: {
    flex: 0.48,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  fieldValue: {
    fontSize: 16,
    color: '#1e293b',
  },
  fieldDescription: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#1e293b',
    backgroundColor: 'white',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  stockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  stockBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  switchField: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  deleteButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
});

export default ProductDetailScreen;
