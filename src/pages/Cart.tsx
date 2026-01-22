import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { Plus, Minus, Trash, ShoppingBag, ArrowRight } from 'lucide-react-native';
import { guestCartUtils } from '../utils/cartUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CartItem {
  id: string;
  productId?: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  brand?: string;
  description?: string;
  size?: string;
  color?: string;
}

interface Cart {
  items: CartItem[];
  total: number;
  itemCount: number;
}

const Cart = ({ navigate, goBack }: { navigate?: (name: string, params?: any) => void; goBack?: () => void }) => {
  const [cart, setCart] = useState<Cart>({ items: [], total: 0, itemCount: 0 });
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const loadCart = async () => {
    setLoading(true);
    try {
      const c = await guestCartUtils.getCart();
      console.log('[Cart] loaded cart:', c);

      // Normalize cart shape to prevent render errors
      const normalized = {
        items: Array.isArray(c?.items) ? c.items : [],
        total: typeof c?.total === 'number' ? c.total : Number(c?.total) || 0,
        itemCount: typeof c?.itemCount === 'number' ? c.itemCount : (Array.isArray(c?.items) ? c.items.length : 0),
      };

      setCart(normalized);
      
      // Check authentication
      const token = await AsyncStorage.getItem('token');
      setIsAuthenticated(!!token);
    } catch (e) {
      console.error('Failed to load cart', e);
      // Fall back to empty cart to avoid crashes
      setCart({ items: [], total: 0, itemCount: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();

    // Listen for cart updates (custom event)
    const handleCartUpdate = (event: any) => {
      if (event?.detail) {
        setCart(event.detail);
      } else {
        loadCart();
      }
    };

    // For React Native, we can use globalThis if custom events are dispatched
    if (typeof globalThis !== 'undefined' && (globalThis as any).addEventListener) {
      (globalThis as any).addEventListener('cartUpdated', handleCartUpdate);
    }

    return () => {
      if (typeof globalThis !== 'undefined' && (globalThis as any).removeEventListener) {
        (globalThis as any).removeEventListener('cartUpdated', handleCartUpdate);
      }
    };
  }, []);

  const updateQuantity = async (id: string, quantity: number) => {
    try {
      if (quantity < 1) return;
      await guestCartUtils.updateQuantity(id, quantity);
      await loadCart();
    } catch (e) {
      console.error('Failed to update quantity', e);
      Alert.alert('Error', 'Could not update quantity');
    }
  };

  const removeItem = async (id: string) => {
    try {
      await guestCartUtils.removeItem(id);
      await loadCart();
    } catch (e) {
      console.error('Failed to remove item', e);
      Alert.alert('Error', 'Could not remove item');
    }
  };

  const clearCart = async () => {
    Alert.alert(
      'Clear Cart',
      'Are you sure you want to remove all items from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await guestCartUtils.clearCart();
              await loadCart();
            } catch (e) {
              console.error('Failed to clear cart', e);
            }
          },
        },
      ]
    );
  };

  const proceedToCheckout = async () => {
    if (!isAuthenticated) {
      // Store the intended destination and redirect to signin
      await AsyncStorage.setItem('redirectAfterLogin', 'PaymentMethod');
      Alert.alert('Sign In Required', 'Please sign in to proceed to checkout', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: () => navigate?.('SignIn') },
      ]);
      return;
    }
    // Navigate to payment method page
    navigate?.('PaymentMethod');
  };

  const resolveImageSource = (img: any) => {
    // Fallback local asset
    const fallback = require('../../assets/s-h1.png');
    if (!img) return fallback;
    // If it's a numeric require() return directly
    if (typeof img === 'number') return img;
    // If it's an object with uri already, use it
    if (typeof img === 'object' && img.uri) return img;
    // If it's a string, check if it's full url or relative path
    if (typeof img === 'string') {
      const s = img.trim();
      if (s.startsWith('http://') || s.startsWith('https://')) return { uri: s };
      if (s.startsWith('/')) return { uri: `https://backend.originplatforms.co${s}` };
      // otherwise assume it's a uri already
      return { uri: s };
    }
    return fallback;
  };

  const renderItem = ({ item }: { item: CartItem }) => (
    <View style={styles.card}>
      <Image source={resolveImageSource(item.image)} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{item.name}</Text>
        {item.brand && <Text style={styles.brand}>{item.brand}</Text>}
        {item.description && (
          <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
        )}
        {(item.size || item.color) && (
          <View style={styles.variantRow}>
            {item.size && <Text style={styles.variantText}>Size: {item.size}</Text>}
            {item.color && <Text style={styles.variantText}>Color: {item.color}</Text>}
          </View>
        )}
        <View style={styles.priceRow}>
          <Text style={styles.unitPrice}>₹{Number(item.price).toFixed(2)} each</Text>
          <Text style={styles.totalPrice}>₹{(Number(item.price) * item.quantity).toFixed(2)}</Text>
        </View>
        <View style={styles.controls}>
          <View style={styles.qtyRow}>
            <Text style={styles.qtyLabel}>Qty: </Text>
            <TouchableOpacity 
              onPress={() => updateQuantity(item.id, item.quantity - 1)} 
              style={[styles.qtyBtn, item.quantity <= 1 && styles.qtyBtnDisabled]}
              disabled={item.quantity <= 1}
            >
              <Minus size={16} color={item.quantity <= 1 ? '#9CA3AF' : '#111'} />
            </TouchableOpacity>
            <Text style={styles.qtyText}>{item.quantity}</Text>
            <TouchableOpacity onPress={() => updateQuantity(item.id, item.quantity + 1)} style={styles.qtyBtn}>
              <Plus size={16} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => removeItem(item.id)} style={styles.removeBtn}>
            <Trash size={14} color="#EF4444" />
            <Text style={styles.removeText}>Remove</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      </View>
    );
  }

  if (cart.items.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <ShoppingBag size={96} color="#9CA3AF" strokeWidth={1.5} />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>
            Looks like you haven't added any items to your cart yet.
          </Text>
          <TouchableOpacity style={styles.shopBtn} onPress={() => navigate?.('Categories')}>
            <Text style={styles.shopBtnText}>Continue Shopping</Text>
            <ArrowRight size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Shopping Cart</Text>
        <View style={styles.headerRight}>
          <Text style={styles.itemCount}>
            {cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'}
          </Text>
          <TouchableOpacity onPress={clearCart}>
            <Text style={styles.clearBtn}>Clear All</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.contentWrapper}>
          {/* Cart Items */}
          <View style={styles.itemsSection}>
            <FlatList
              data={cart.items}
              keyExtractor={(i) => String(i.id)}
              renderItem={renderItem}
              // Allow FlatList to scroll independently
              scrollEnabled={true}
              contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16 }}
              ListEmptyComponent={() => (
                <View style={{ padding: 24 }}>
                  <Text style={{ textAlign: 'center', color: '#6B7280' }}>No items in cart</Text>
                </View>
              )}
            />
          </View>

          {/* Order Summary */}
          <View style={styles.summarySection}>
            <Text style={styles.summaryTitle}>Order Summary</Text>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>₹{cart.total.toFixed(2)}</Text>
            </View>
            
            <View style={[styles.summaryRow, styles.borderTop]}>
              <Text style={styles.summaryLabel}>Shipping</Text>
              <Text style={styles.summaryValue}>Free</Text>
            </View>
            
            <View style={[styles.summaryRow, styles.borderTop]}>
              <Text style={styles.summaryLabelBold}>Order Total</Text>
              <Text style={styles.summaryValueBold}>₹{cart.total.toFixed(2)}</Text>
            </View>

            <TouchableOpacity style={styles.checkoutBtn} onPress={proceedToCheckout}>
              <Text style={styles.checkoutText}>Proceed to Checkout</Text>
              <ArrowRight size={20} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.continueBtn} onPress={() => navigate?.('Categories')}>
              <Text style={styles.continueText}>Continue Shopping</Text>
            </TouchableOpacity>

            <Text style={styles.shippingNotice}>Free shipping on orders over ₹500</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  // Empty State
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  emptyTitle: { fontSize: 24, fontWeight: '700', color: '#111827', marginTop: 24, marginBottom: 12 },
  emptySubtitle: { fontSize: 16, color: '#6B7280', textAlign: 'center', marginBottom: 32, lineHeight: 24 },
  shopBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#3B82F6', 
    paddingHorizontal: 24, 
    paddingVertical: 12, 
    borderRadius: 8,
    gap: 8
  },
  shopBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  
  // Header
  header: { 
    backgroundColor: '#fff',
    paddingHorizontal: 16, 
    paddingVertical: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  itemCount: { fontSize: 14, color: '#6B7280' },
  clearBtn: { fontSize: 14, fontWeight: '600', color: '#EF4444' },
  
  // Content
  contentWrapper: { flex: 1 },
  itemsSection: { flex: 1 },
  
  // Cart Item Card
  card: { 
    flexDirection: 'row', 
    backgroundColor: '#fff', 
    marginBottom: 12, 
    borderRadius: 8, 
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  image: { width: 96, height: 140, resizeMode: 'cover', backgroundColor: '#F3F4F6' },
  info: { flex: 1, padding: 12 },
  title: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 4 },
  brand: { fontSize: 12, color: '#6B7280', marginBottom: 4 },
  description: { fontSize: 12, color: '#6B7280', marginBottom: 8, lineHeight: 16 },
  variantRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  variantText: { fontSize: 12, color: '#374151' },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  unitPrice: { fontSize: 12, color: '#6B7280' },
  totalPrice: { fontSize: 16, fontWeight: '700', color: '#111827' },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  qtyRow: { flexDirection: 'row', alignItems: 'center' },
  qtyLabel: { fontSize: 14, color: '#6B7280', marginRight: 8 },
  qtyBtn: { padding: 8, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 6, backgroundColor: '#fff' },
  qtyBtnDisabled: { opacity: 0.5 },
  qtyText: { width: 40, textAlign: 'center', fontWeight: '700', fontSize: 14 },
  removeBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  removeText: { fontSize: 14, fontWeight: '600', color: '#EF4444' },
  
  // Order Summary
  summarySection: { 
    backgroundColor: '#F9FAFB', 
    borderRadius: 8, 
    padding: 16, 
    margin: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  summaryTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12 },
  borderTop: { borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  summaryLabel: { fontSize: 14, color: '#6B7280' },
  summaryValue: { fontSize: 14, fontWeight: '600', color: '#111827' },
  summaryLabelBold: { fontSize: 16, fontWeight: '700', color: '#111827' },
  summaryValueBold: { fontSize: 16, fontWeight: '700', color: '#111827' },
  
  checkoutBtn: { 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6', 
    paddingVertical: 14, 
    borderRadius: 8,
    marginTop: 16,
    gap: 8
  },
  checkoutText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  
  continueBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB'
  },
  continueText: { color: '#374151', fontSize: 16, fontWeight: '600' },
  
  shippingNotice: { 
    fontSize: 12, 
    color: '#6B7280', 
    textAlign: 'center', 
    marginTop: 16 
  },
});

export default Cart;
