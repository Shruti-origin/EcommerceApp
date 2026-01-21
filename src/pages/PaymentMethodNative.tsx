import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
  Alert,
  Image
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { guestCartUtils } from '../utils/cartUtils';
import { userService, orderService, addressService } from '../services/api';

interface FormData {
  firstName: string;
  lastName: string;
  companyName: string;
  address: string;
  country: string;
  region: string;
  city: string;
  zipCode: string;
  email: string;
  phoneNumber: string;
}

interface CartItem {
  id: string;
  productId?: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  brand: string;
  description: string;
  size?: string;
  color?: string;
}

interface Cart {
  items: CartItem[];
  total: number;
  itemCount: number;
}

const PaymentMethodNative = ({ navigate, goBack }: { navigate?: (name: string, params?: any) => void; goBack?: () => void }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [cart, setCart] = useState<Cart>({ items: [], total: 0, itemCount: 0 });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    companyName: '',
    address: '',
    country: 'India',
    region: '',
    city: '',
    zipCode: '',
    email: '',
    phoneNumber: '',
  });

  const [selectedPayment, setSelectedPayment] = useState<string>('cod');

  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem('token');
      const userStr = await AsyncStorage.getItem('user');
      if (token && userStr) {
        try {
          const userData = JSON.parse(userStr);
          setIsAuthenticated(true);
          setUser(userData);
        } catch (e) {
          setIsAuthenticated(false);
          setUser(null);
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
      await loadData();
    })();
  }, []);

  const loadData = async () => {
    try {
      const currentCart = await guestCartUtils.getCart();
      setCart(currentCart);

      if (isAuthenticated && user) {
        try {
          const profile = await userService.getProfile();
          const userData = profile.data || profile;
          
          setFormData(prev => ({
            ...prev,
            firstName: userData.firstName || user.firstName || '',
            lastName: userData.lastName || user.lastName || '',
            email: userData.email || user.email || '',
            phoneNumber: userData.phoneNumber || (user as any).phoneNumber || (user as any).phone || '',
          }));

          await loadAddresses();
        } catch (error) {
          console.error('Failed to load user profile:', error);
          setFormData(prev => ({
            ...prev,
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
          }));
        }
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAddresses = async () => {
    try {
      const response = await addressService.getAddresses();
      const addressList = response.data || response;
      setAddresses(addressList);
      
      const defaultAddress = addressList.find((addr: any) => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
        populateFormFromAddress(defaultAddress);
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
    }
  };

  const populateFormFromAddress = (address: any) => {
    setFormData(prev => ({
      ...prev,
      firstName: address.firstName,
      lastName: address.lastName,
      address: address.addressLine1,
      city: address.city,
      region: address.state,
      zipCode: address.pincode,
      country: address.country,
      phoneNumber: address.phone,
    }));
  };

  const handleSubmit = async () => {
    if (cart.items.length === 0) {
      Alert.alert('Cart Empty', 'Your cart is empty. Please add items to your cart before proceeding.');
      return;
    }

    if (!formData.firstName || !formData.lastName || !formData.address || !formData.city || !formData.phoneNumber) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    try {
      setSubmitting(true);

      if (isAuthenticated && !selectedAddressId) {
        try {
          const addressData = {
            type: 'other' as const,
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phoneNumber,
            addressLine1: formData.address,
            city: formData.city,
            state: formData.region,
            pincode: formData.zipCode,
            country: formData.country,
            isDefault: addresses.length === 0,
          };
          
          await addressService.createAddress(addressData);
          await loadAddresses();
        } catch (error) {
          console.error('Failed to save address:', error);
        }
      }

      const orderData = {
        customerId: user?.id || null,
        items: cart.items.map(item => ({
          productId: item.productId || item.id,
          quantity: item.quantity,
          price: item.price,
          name: item.name,
          brand: item.brand,
          image: item.image,
          size: item.size,
          color: item.color
        })),
        shippingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          companyName: formData.companyName,
          address: formData.address,
          country: formData.country,
          region: formData.region,
          city: formData.city,
          zipCode: formData.zipCode,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
        },
        paymentMethod: selectedPayment,
        totalAmount: cart.total,
        itemCount: cart.itemCount,
        notes: '',
      };

      const response = await orderService.create(orderData);
      console.log('✅ Order created successfully:', response);

      await guestCartUtils.clearCart();

      Alert.alert('Success', 'Order placed successfully!', [
        { text: 'OK', onPress: () => navigate?.('MyOrders') }
      ]);
      
    } catch (error: any) {
      console.error('❌ Failed to place order:', error);
      Alert.alert('Error', error?.message || 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const calculateSummary = () => {
    const subtotal = cart.total || 0;
    const shipping = 0;
    const discount = subtotal > 1000 ? 100 : 0;
    const total = subtotal - discount + shipping;
    return { subtotal, shipping, discount, total };
  };

  const orderSummary = calculateSummary();

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Delivery Info Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Delivering to {formData.firstName || 'Customer'} {formData.lastName}
          </Text>
          <Text style={styles.cardSubtitle}>
            {formData.address || 'Please fill in your delivery address below'}
          </Text>
        </View>

        {/* Form Section */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Delivery Details</Text>

          {!isAuthenticated && (
            <View style={styles.warningBox}>
              <Text style={styles.warningText}>Please sign in to see your saved addresses</Text>
            </View>
          )}

          <View style={styles.inputRow}>
            <View style={styles.inputHalf}>
              <Text style={styles.label}>First Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.firstName}
                onChangeText={(value) => setFormData(prev => ({ ...prev, firstName: value }))}
                placeholder="First name"
              />
            </View>
            <View style={styles.inputHalf}>
              <Text style={styles.label}>Last Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.lastName}
                onChangeText={(value) => setFormData(prev => ({ ...prev, lastName: value }))}
                placeholder="Last name"
              />
            </View>
          </View>

          <View style={styles.inputFull}>
            <Text style={styles.label}>Company Name (Optional)</Text>
            <TextInput
              style={styles.input}
              value={formData.companyName}
              onChangeText={(value) => setFormData(prev => ({ ...prev, companyName: value }))}
              placeholder="Company name"
            />
          </View>

          <View style={styles.inputFull}>
            <Text style={styles.label}>Address *</Text>
            <TextInput
              style={styles.input}
              value={formData.address}
              onChangeText={(value) => setFormData(prev => ({ ...prev, address: value }))}
              placeholder="Street address"
            />
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputHalf}>
              <Text style={styles.label}>City *</Text>
              <TextInput
                style={styles.input}
                value={formData.city}
                onChangeText={(value) => setFormData(prev => ({ ...prev, city: value }))}
                placeholder="City"
              />
            </View>
            <View style={styles.inputHalf}>
              <Text style={styles.label}>State</Text>
              <TextInput
                style={styles.input}
                value={formData.region}
                onChangeText={(value) => setFormData(prev => ({ ...prev, region: value }))}
                placeholder="State"
              />
            </View>
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputHalf}>
              <Text style={styles.label}>Zip Code</Text>
              <TextInput
                style={styles.input}
                value={formData.zipCode}
                onChangeText={(value) => setFormData(prev => ({ ...prev, zipCode: value }))}
                placeholder="Zip code"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.inputHalf}>
              <Text style={styles.label}>Country</Text>
              <TextInput
                style={styles.input}
                value={formData.country}
                onChangeText={(value) => setFormData(prev => ({ ...prev, country: value }))}
                placeholder="Country"
              />
            </View>
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputHalf}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(value) => setFormData(prev => ({ ...prev, email: value }))}
                placeholder="Email"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            <View style={styles.inputHalf}>
              <Text style={styles.label}>Phone Number *</Text>
              <TextInput
                style={styles.input}
                value={formData.phoneNumber}
                onChangeText={(value) => setFormData(prev => ({ ...prev, phoneNumber: value }))}
                placeholder="Phone number"
                keyboardType="phone-pad"
              />
            </View>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          
          <TouchableOpacity 
            style={[styles.paymentOption, selectedPayment === 'cod' && styles.paymentOptionSelected]}
            onPress={() => setSelectedPayment('cod')}
          >
            <View style={styles.radioOuter}>
              {selectedPayment === 'cod' && <View style={styles.radioInner} />}
            </View>
            <Text style={styles.paymentText}>Cash on Delivery (COD)</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.paymentOption, selectedPayment === 'card' && styles.paymentOptionSelected]}
            onPress={() => setSelectedPayment('card')}
          >
            <View style={styles.radioOuter}>
              {selectedPayment === 'card' && <View style={styles.radioInner} />}
            </View>
            <Text style={styles.paymentText}>Credit/Debit Card</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.paymentOption, selectedPayment === 'upi' && styles.paymentOptionSelected]}
            onPress={() => setSelectedPayment('upi')}
          >
            <View style={styles.radioOuter}>
              {selectedPayment === 'upi' && <View style={styles.radioInner} />}
            </View>
            <Text style={styles.paymentText}>UPI Payment</Text>
          </TouchableOpacity>
        </View>

        {/* Order Summary */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          
          {cart.items.map((item) => (
            <View key={item.id} style={styles.cartItem}>
              <Image 
                source={{ uri: `https://backend.originplatforms.co${item.image}` }} 
                style={styles.cartImage} 
              />
              <View style={styles.cartInfo}>
                <Text style={styles.cartName} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.cartBrand}>{item.brand}</Text>
                <Text style={styles.cartPrice}>{item.quantity} x ₹{item.price.toFixed(2)}</Text>
              </View>
            </View>
          ))}

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal ({cart.itemCount} items)</Text>
            <Text style={styles.summaryValue}>₹{orderSummary.subtotal.toFixed(2)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping</Text>
            <Text style={[styles.summaryValue, { color: '#059669' }]}>Free</Text>
          </View>

          {orderSummary.discount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Discount</Text>
              <Text style={[styles.summaryValue, { color: '#059669' }]}>-₹{orderSummary.discount.toFixed(2)}</Text>
            </View>
          )}

          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₹{orderSummary.total.toFixed(2)}</Text>
          </View>

          <TouchableOpacity 
            style={[styles.submitBtn, submitting && styles.submitBtnDisabled]} 
            onPress={handleSubmit}
            disabled={submitting || cart.items.length === 0}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitBtnText}>Place Order - ₹{orderSummary.total.toFixed(2)}</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.shippingNotice}>Free shipping on orders over ₹500</Text>
        </View>
      </ScrollView>
    </View>
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
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  scrollContent: {
    padding: 16,
  },
  card: {
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
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  warningBox: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  warningText: {
    fontSize: 13,
    color: '#991B1B',
    fontWeight: '600',
  },
  inputFull: {
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  inputHalf: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#111827',
    backgroundColor: '#fff',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    marginBottom: 12,
  },
  paymentOptionSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#3B82F6',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3B82F6',
  },
  paymentText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  cartItem: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  cartImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  cartInfo: {
    flex: 1,
    marginLeft: 12,
  },
  cartName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  cartBrand: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  cartPrice: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '600',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginTop: 8,
    paddingTop: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  submitBtn: {
    backgroundColor: '#E0555A',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  submitBtnDisabled: {
    backgroundColor: '#9CA3AF',
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  shippingNotice: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 12,
  },
});

export default PaymentMethodNative;
