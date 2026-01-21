import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
  Easing,
  Dimensions,
  Modal,
  Alert,
} from 'react-native';
import { Truck, Search, Menu,  ShoppingBag, Home, List, Gift, Heart as HeartIcon, User, ChevronLeft, Heart, LogOut } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { guestCartUtils } from '../utils/cartUtils';

const Header = ({ navigate, setActive, goBack, showBackButton = false }) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // Check authentication status
  useEffect(() => {
    checkAuth();
    
    // Listen for login/logout events
    const handleAuthChange = () => {
      checkAuth();
    };

    if (typeof globalThis !== 'undefined' && globalThis.addEventListener) {
      globalThis.addEventListener('loginSuccess', handleAuthChange);
      globalThis.addEventListener('logoutSuccess', handleAuthChange);
    }

    return () => {
      if (typeof globalThis !== 'undefined' && globalThis.removeEventListener) {
        globalThis.removeEventListener('loginSuccess', handleAuthChange);
        globalThis.removeEventListener('logoutSuccess', handleAuthChange);
      }
    };
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userStr = await AsyncStorage.getItem('user');
      
      if (token && userStr) {
        const userData = JSON.parse(userStr);
        setIsAuthenticated(true);
        setUser(userData);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to check auth:', error);
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('token');
              await AsyncStorage.removeItem('authToken');
              await AsyncStorage.removeItem('user');
              
              setIsAuthenticated(false);
              setUser(null);
              closeSidebar();

              // Dispatch logout event
              if (typeof globalThis !== 'undefined' && globalThis.dispatchEvent) {
                try {
                  const CE = globalThis.CustomEvent;
                  if (CE) {
                    globalThis.dispatchEvent(new CE('logoutSuccess'));
                  } else {
                    globalThis.dispatchEvent({ type: 'logoutSuccess' });
                  }
                } catch (e) {}
              }

              Alert.alert('Success', 'Logged out successfully');
              if (navigate) navigate('Home');
            } catch (error) {
              console.error('Logout failed:', error);
              Alert.alert('Error', 'Failed to logout');
            }
          }
        }
      ]
    );
  };

  // Load cart count on mount and set up interval to check for updates
  useEffect(() => {
    const loadCartCount = async () => {
      const cart = await guestCartUtils.getCart();
      const totalItems = cart.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
      setCartCount(totalItems);
    };

    loadCartCount();

    // Check cart count every 2 seconds to catch updates
    const interval = setInterval(loadCartCount, 2000);

    return () => clearInterval(interval);
  }, []);

  // Reduced width and vertical padding so sidebar is smaller and centered
  const sidebarWidth = Math.min(260, Dimensions.get('window').width * 0.7);
  const translateX = useRef(new Animated.Value(-sidebarWidth)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  const handleSearch = () => {
    const q = String(searchQuery || '').trim();
    if (!q) return;
    // close sidebar if open
    if (open) closeSidebar();
    if (navigate) navigate('Search', { query: q });
    // keep the query in input so user can edit on results page
  };

  const openSidebar = () => {
    setOpen(true);
    Animated.parallel([
      // animate to dark overlay (nearly-opaque) so content beneath is hidden but not white
      Animated.timing(overlayOpacity, { toValue: 0.8, duration: 220, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(translateX, { toValue: 0, duration: 240, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();
  };

  const closeSidebar = () => {
    Animated.parallel([
      Animated.timing(overlayOpacity, { toValue: 0, duration: 200, easing: Easing.in(Easing.quad), useNativeDriver: true }),
      Animated.timing(translateX, { toValue: -sidebarWidth, duration: 220, easing: Easing.in(Easing.quad), useNativeDriver: true }),
    ]).start(() => setOpen(false));
  };

  const handleSelect = (key) => {
    setOpen(false);
    switch (key) {
      case 'Home':
        if (setActive) setActive('Home');
        if (navigate) navigate('Home');
        break;
      case 'Categories':
        if (setActive) setActive('Categories');
        if (navigate) navigate('Categories');
        break;
      case 'Deals':
        if (navigate) navigate('Deals');
        break;
      case 'NewArrival':
        // Map New Arrival to Deals screen for now
        if (navigate) navigate('Deals');
        break;
      case 'WishList':
        if (navigate) navigate('WishList');
        break;
      case 'Profile':
        // Map Profile to Setting tab
        if (setActive) setActive('Setting');
        break;
      default:
        break;
    }
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.promo}>
        <Text style={styles.promoText}>Buy 3 Get 25% Off, Shop Now &gt;&gt;</Text>
        <TouchableOpacity style={styles.promoCart} activeOpacity={0.9}>
          <Truck size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchRow}>
        {showBackButton ? (
          <TouchableOpacity style={styles.menuBtn} activeOpacity={0.7} onPress={() => goBack?.()}>
            <ChevronLeft size={20} color="#111" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.menuBtn} activeOpacity={0.7} onPress={() => (open ? closeSidebar() : openSidebar())}>
            <Menu size={18} color="#0b0c09e0" />
          </TouchableOpacity>
        )}

        <View style={styles.searchBox}>
          <TouchableOpacity onPress={handleSearch} style={{ padding: 4 }}>
            <Search size={18} color="#9EA0A4" />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Search any product.."
            placeholderTextColor="#9EA0A4"
            returnKeyType="search"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
        </View>

        <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7} accessibilityLabel="Open wishlist" onPress={() => { if (open) closeSidebar(); navigate?.('WishList'); }}>
          <HeartIcon size={18} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.cartBtn} activeOpacity={0.7} accessibilityLabel="Open cart" onPress={() => { if (open) closeSidebar(); navigate?.('Cart'); }}>
          <ShoppingBag size={18} color="#222" />
          {cartCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <Modal visible={open} transparent animationType="none" onRequestClose={closeSidebar}>
        <Animated.View style={[styles.sidebarOverlay, { opacity: overlayOpacity }]}>
          <TouchableOpacity style={styles.overlayTouchable} activeOpacity={1} onPress={closeSidebar} />
        </Animated.View>

        <Animated.View style={[styles.sidebar, { width: sidebarWidth, transform: [{ translateX }] }]}>
          <View style={styles.sidebarHeader}>
            {isAuthenticated && user ? (
              <View style={styles.userInfo}>
                <View style={styles.avatar}>
                  <User size={24} color="#3B82F6" />
                </View>
                <Text style={styles.userName}>{user.firstName} {user.lastName}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
              </View>
            ) : (
              <Text style={styles.sidebarTitle}>Menu</Text>
            )}
          </View>

          <TouchableOpacity style={styles.sidebarItem} onPress={() => { handleSelect('Home'); closeSidebar(); }}>
            <Home size={18} color="#111" />
            <Text style={styles.sidebarText}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.sidebarItem} onPress={() => { handleSelect('Categories'); closeSidebar(); }}>
            <List size={18} color="#111" />
            <Text style={styles.sidebarText}>Categories</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.sidebarItem} onPress={() => { handleSelect('Deals'); closeSidebar(); }}>
            <Gift size={18} color="#111" />
            <Text style={styles.sidebarText}>Deals</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.sidebarItem} onPress={() => { handleSelect('NewArrival'); closeSidebar(); }}>
            <Gift size={18} color="#111" />
            <Text style={styles.sidebarText}>New Arrival</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.sidebarItem} onPress={() => { handleSelect('WishList'); closeSidebar(); }}>
            <HeartIcon size={18} color="#111" />
            <Text style={styles.sidebarText}>WishList</Text>
          </TouchableOpacity>

          {isAuthenticated && (
            <TouchableOpacity style={styles.sidebarItem} onPress={() => { navigate?.('MyOrders'); closeSidebar(); }}>
              <ShoppingBag size={18} color="#111" />
              <Text style={styles.sidebarText}>My Orders</Text>
            </TouchableOpacity>
          )}

          {isAuthenticated ? (
            <TouchableOpacity style={[styles.sidebarItem, styles.logoutItem]} onPress={handleLogout}>
              <LogOut size={18} color="#EF4444" />
              <Text style={[styles.sidebarText, styles.logoutText]}>Logout</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity style={[styles.sidebarItem, styles.sidebarLast]} onPress={() => { navigate?.('SignIn'); closeSidebar(); }}>
                <User size={18} color="#3B82F6" />
                <Text style={[styles.sidebarText, { color: '#3B82F6', fontWeight: '600' }]}>Sign In</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.sidebarItem} onPress={() => { navigate?.('SignUp'); closeSidebar(); }}>
                <User size={18} color="#10B981" />
                <Text style={[styles.sidebarText, { color: '#10B981', fontWeight: '600' }]}>Sign Up</Text>
              </TouchableOpacity>
            </>
          )}
        </Animated.View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'ios' ? 46 : 40,
  },
  promo: {
    backgroundColor: '#e56b6f',
    height: 39,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  promoText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    horizontalAlign: 'center',
    verticalAlign:'middle',
    paddingLeft:'50',

  },
  promoCart: {
    backgroundColor: '#3bbf6b',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoCartText: {
    color: '#fff',
    fontSize: 16,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuBtn: {
    padding: 8,
    marginRight: 8,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f4f4f4',
    paddingHorizontal: 10,
    height: 40,
    borderRadius: 8,
  },
  searchIcon: {
    fontSize: 16,
    color: '#9EA0A4',
  },
  input: {
    flex: 1,
    marginLeft: 8,
    padding: 0,
    color: '#222',
  },
  iconBtn: {
    padding: 8,
    marginLeft: 8,
  },
  icon: {
    fontSize: 18,
  },
  cartBtn: {
    padding: 8,
    marginLeft: 6,
  },
  badge: {
    position: 'absolute',
    right: 2,
    top: 2,
    backgroundColor: '#10b981',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },

  /* Sidebar overlay and panel */
  sidebarOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000', // dark overlay (not white)
    zIndex: 999,
  },
  sidebar: {
    position: 'absolute',
    left: 0,
    // reduce height by adding vertical inset so sidebar doesn't fill full screen
    top: 40,
    bottom: 40,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'ios' ? 20 : 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    overflow: 'hidden',
    zIndex: 1001,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 12,
  },
  overlayTouchable: {
    flex: 1,
  },
  sidebarHeader: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    marginBottom: 6,
  },
  sidebarTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  userInfo: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 12,
    color: '#6B7280',
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
  },
  sidebarText: {
    marginLeft: 12,
    fontSize: 15,
    color: '#111827',
  },
  sidebarLast: {
    marginTop: 8,
  },
  logoutItem: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  logoutText: {
    color: '#EF4444',
    fontWeight: '600',
  },
});

export default Header;
