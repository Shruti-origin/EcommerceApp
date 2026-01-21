import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  Modal,
  FlatList,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { orderService } from '../services/api';

interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  finalAmount: number;
  taxAmount: number;
  discountAmount: number;
  items?: any[];
  shippingAddress?: any;
}

const MyOrders = ({ navigate, goBack }: { navigate?: (name: string, params?: any) => void; goBack?: () => void }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    checkAuthAndLoadOrders();
  }, []);

  const checkAuthAndLoadOrders = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userStr = await AsyncStorage.getItem('user');
      
      if (token && userStr) {
        const userData = JSON.parse(userStr);
        setIsAuthenticated(true);
        setUser(userData);
        await loadOrders(userData);
      } else {
        setIsAuthenticated(false);
        setUser(null);
        setOrders([]);
      }
    } catch (error) {
      console.error('Failed to check auth:', error);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async (userData: any) => {
    try {
      setLoading(true);
      
      const response = await orderService.getAll();
      const ordersData = response.data || response;
      // Filter orders for current user
      const userOrders = ordersData.filter((order: any) => order.customerId === userData?.id);
      setOrders(userOrders);
    } catch (error) {
      console.error('Failed to load orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: { bg: string; text: string } } = {
      pending: { bg: '#FEF3C7', text: '#92400E' },
      confirmed: { bg: '#DBEAFE', text: '#1E40AF' },
      processing: { bg: '#E0E7FF', text: '#3730A3' },
      shipped: { bg: '#E9D5FF', text: '#6B21A8' },
      delivered: { bg: '#D1FAE5', text: '#065F46' },
      cancelled: { bg: '#FEE2E2', text: '#991B1B' },
      returned: { bg: '#FFEDD5', text: '#9A3412' },
    };
    return colors[status] || { bg: '#F3F4F6', text: '#1F2937' };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'confirmed': return '✅';
      case 'processing': return '📦';
      case 'shipped': return '🚚';
      case 'delivered': return '✨';
      case 'cancelled': return '❌';
      case 'returned': return '↩️';
      default: return '📋';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      </SafeAreaView>
    );
  }

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>🔒</Text>
            <Text style={styles.emptyTitle}>Sign in to view orders</Text>
            <Text style={styles.emptySubtitle}>Please sign in to access your order history</Text>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => navigate?.('SignIn')}>
              <Text style={styles.primaryBtnText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (orders.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>My Orders</Text>
            <Text style={styles.headerSubtitle}>Track and manage your orders</Text>
          </View>
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyTitle}>No orders yet</Text>
            <Text style={styles.emptySubtitle}>Start shopping to see your orders here</Text>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => navigate?.('Categories')}>
              <Text style={styles.primaryBtnText}>Start Shopping</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const renderOrderItem = ({ item: order }: { item: Order }) => {
    const statusColors = getStatusColor(order.status);
    
    return (
      <View style={styles.orderCard}>
        {/* Order Header */}
        <View style={styles.orderHeader}>
          <View style={styles.orderHeaderLeft}>
            <View style={styles.orderTitleRow}>
              <Text style={styles.orderNumber}>Order #{order.orderNumber}</Text>
              <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
                <Text style={[styles.statusText, { color: statusColors.text }]}>
                  {getStatusIcon(order.status)} {order.status.toUpperCase()}
                </Text>
              </View>
            </View>
            <Text style={styles.orderDate}>
              Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>
          <View style={styles.orderHeaderRight}>
            <Text style={styles.orderTotalLabel}>Total Amount</Text>
            <Text style={styles.totalAmount}>₹{Number(order.totalAmount || 0).toFixed(2)}</Text>
          </View>
        </View>

        {/* Order Items Summary */}
        {order.items && order.items.length > 0 && (
          <View style={styles.itemsSummary}>
            <Text style={styles.itemsCount}>
              {order.items.length} item{order.items.length > 1 ? 's' : ''}
            </Text>
          </View>
        )}

        {/* Order Details */}
        <View style={styles.orderDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment Status</Text>
            <Text style={[
              styles.detailValue,
              { color: order.paymentStatus === 'paid' ? '#059669' : '#D97706' }
            ]}>
              {order.paymentStatus.toUpperCase()}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Subtotal</Text>
            <Text style={styles.detailValue}>₹{Number(order.totalAmount || 0).toFixed(2)}</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.orderActions}>
          <TouchableOpacity 
            style={styles.viewDetailsBtn} 
            onPress={() => setSelectedOrder(order)}
          >
            <Text style={styles.viewDetailsBtnText}>View Details</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.trackBtn}
            onPress={() => navigate?.('TrackOrder', { orderId: order.orderNumber })}
          >
            <Text style={styles.trackBtnText}>Track Order</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
        <Text style={styles.headerSubtitle}>Track and manage your orders</Text>
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrderItem}
        contentContainerStyle={styles.listContent}
      />

      {/* Order Details Modal */}
      <Modal
        visible={!!selectedOrder}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedOrder(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Order Details</Text>
                <TouchableOpacity onPress={() => setSelectedOrder(null)}>
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </View>

              {selectedOrder && (
                <View style={styles.modalBody}>
                  {/* Order Info */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Order Information</Text>
                    <View style={styles.infoCard}>
                      <Text style={styles.infoText}>
                        <Text style={styles.infoLabel}>Order Number: </Text>
                        {selectedOrder.orderNumber}
                      </Text>
                      <Text style={styles.infoText}>
                        <Text style={styles.infoLabel}>Date: </Text>
                        {new Date(selectedOrder.createdAt).toLocaleString()}
                      </Text>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Status: </Text>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedOrder.status).bg }]}>
                          <Text style={[styles.statusText, { color: getStatusColor(selectedOrder.status).text }]}>
                            {selectedOrder.status.toUpperCase()}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.infoText}>
                        <Text style={styles.infoLabel}>Payment: </Text>
                        {selectedOrder.paymentStatus.toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  {/* Shipping Address */}
                  {selectedOrder.shippingAddress && (
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>Shipping Address</Text>
                      <View style={styles.infoCard}>
                        <Text style={styles.addressName}>
                          {selectedOrder.shippingAddress.firstName} {selectedOrder.shippingAddress.lastName}
                        </Text>
                        <Text style={styles.addressText}>{selectedOrder.shippingAddress.addressLine1}</Text>
                        {selectedOrder.shippingAddress.addressLine2 && (
                          <Text style={styles.addressText}>{selectedOrder.shippingAddress.addressLine2}</Text>
                        )}
                        <Text style={styles.addressText}>
                          {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.pincode}
                        </Text>
                        <Text style={styles.addressText}>{selectedOrder.shippingAddress.country}</Text>
                        <Text style={styles.addressText}>Phone: {selectedOrder.shippingAddress.phone}</Text>
                        <Text style={styles.addressText}>Email: {selectedOrder.shippingAddress.email}</Text>
                      </View>
                    </View>
                  )}

                  {/* Price Breakdown */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Price Details</Text>
                    <View style={styles.infoCard}>
                      <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>Subtotal</Text>
                        <Text style={styles.priceValue}>₹{Number(selectedOrder.totalAmount || 0).toFixed(2)}</Text>
                      </View>
                      <View style={[styles.priceRow, styles.totalRow]}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalValue}>₹{Number(selectedOrder.totalAmount || 0).toFixed(2)}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              )}

              <TouchableOpacity 
                style={styles.modalCloseBtn} 
                onPress={() => setSelectedOrder(null)}
              >
                <Text style={styles.modalCloseBtnText}>Close</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  listContent: {
    padding: 16,
  },
  emptyCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 48,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
    textAlign: 'center',
  },
  primaryBtn: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 12,
  },
  orderHeaderLeft: {
    flex: 1,
  },
  orderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
    gap: 8,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  orderDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  orderHeaderRight: {
    alignItems: 'flex-end',
  },
  orderTotalLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  itemsSummary: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
    marginBottom: 12,
  },
  itemsCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  orderDetails: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
    marginBottom: 16,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  orderActions: {
    flexDirection: 'row',
    gap: 12,
  },
  viewDetailsBtn: {
    flex: 1,
    backgroundColor: '#3B82F6',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewDetailsBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  trackBtn: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  trackBtnText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '100%',
    maxHeight: '90%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  modalClose: {
    fontSize: 24,
    color: '#9CA3AF',
  },
  modalBody: {
    gap: 20,
  },
  section: {
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  infoCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 16,
    gap: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 20,
  },
  infoLabel: {
    fontWeight: '600',
    color: '#111827',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addressName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 20,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  priceLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  priceValue: {
    fontSize: 13,
    color: '#111827',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  totalValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  modalCloseBtn: {
    backgroundColor: '#E5E7EB',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  modalCloseBtnText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MyOrders;
