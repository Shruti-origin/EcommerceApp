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
  StatusBar,
  ScrollView,
} from 'react-native';
import { Truck, Search, Menu, ShoppingBag, Home, List, Gift, Heart as HeartIcon, User, ChevronLeft, Heart, LogOut, Sparkles, TrendingUp } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { guestCartUtils } from '../utils/cartUtils';
import { guestWishlistUtils } from '../utils/wishlistUtils';

const Header = ({ navigate, setActive, goBack, showBackButton = false }) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
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

    // Also check auth when component becomes visible
    const intervalId = setInterval(checkAuth, 3000);

    return () => {
      clearInterval(intervalId);
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

  // Load cart and wishlist counts on mount and set up intervals to check for updates
  useEffect(() => {
    const loadCartCount = async () => {
      const cart = await guestCartUtils.getCart();
      const totalItems = cart.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
      setCartCount(totalItems);
    };

    const loadWishlistCount = async () => {
      try {
        const wl = await guestWishlistUtils.getWishlist();
        const count = Array.isArray(wl.items) ? wl.items.length : 0;
        setWishlistCount(count);
      } catch (e) {
        setWishlistCount(0);
      }
    };

    loadCartCount();
    loadWishlistCount();

    // Check counts every 2 seconds to catch updates
    const interval = setInterval(() => { loadCartCount(); loadWishlistCount(); }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Reduced width and vertical padding so sidebar is smaller and centered
  const sidebarWidth = Math.min(280, Dimensions.get('window').width * 0.75);
  const translateX = useRef(new Animated.Value(-sidebarWidth)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const menuItemsOpacity = useRef(new Animated.Value(0)).current;
  const menuItemsTranslateY = useRef(new Animated.Value(20)).current;

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
      Animated.timing(overlayOpacity, { toValue: 0.6, duration: 300, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      Animated.spring(translateX, { 
        toValue: 0, 
        tension: 65,
        friction: 11,
        useNativeDriver: true 
      }),
    ]).start(() => {
      // Staggered animation for menu items
      Animated.parallel([
        Animated.timing(menuItemsOpacity, {
          toValue: 1,
          duration: 400,
          delay: 100,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.spring(menuItemsTranslateY, {
          toValue: 0,
          tension: 50,
          friction: 8,
          delay: 10,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const closeSidebar = () => {
    Animated.parallel([
      Animated.timing(menuItemsOpacity, { 
        toValue: 0, 
        duration: 150, 
        useNativeDriver: true 
      }),
      Animated.timing(overlayOpacity, { 
        toValue: 0, 
        duration: 250, 
        easing: Easing.in(Easing.ease), 
        useNativeDriver: true 
      }),
      Animated.timing(translateX, { 
        toValue: -sidebarWidth, 
        duration: 280, 
        easing: Easing.in(Easing.ease), 
        useNativeDriver: true 
      }),
    ]).start(() => {
      setOpen(false);
      menuItemsTranslateY.setValue(20);
    });
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
          {wishlistCount > 0 && (
            <View style={styles.wishlistBadge}>
              <Text style={styles.wishlistBadgeText}>{wishlistCount}</Text>
            </View>
          )}
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
        <StatusBar backgroundColor="rgba(0,0,0,0.5)" barStyle="dark-content" />
        <Animated.View style={[styles.sidebarOverlay, { opacity: overlayOpacity }]}>
          <TouchableOpacity style={styles.overlayTouchable} activeOpacity={1} onPress={closeSidebar} />
        </Animated.View>

        <Animated.View style={[styles.sidebar, { width: sidebarWidth, transform: [{ translateX }] }]}>
          <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
            <View style={styles.sidebarHeader}>
              <View style={styles.userInfo}>
                <View style={styles.avatar}>
                  <User size={28} color="#2563EB" strokeWidth={2} />
                </View>
                {/* Unified header: shows user info or a professional fallback */}
                <Text style={styles.userName}>{user ? `${user.firstName} ${user.lastName}` : 'Welcome'}</Text>
                <Text style={styles.userEmail}>{user ? user.email : 'Sign in to access your account'}</Text>
              </View>
            </View>

            <Animated.View 
              style={{
                opacity: menuItemsOpacity,
                transform: [{ translateY: menuItemsTranslateY }]
              }}
            >
              <View style={styles.menuSection}>
                <TouchableOpacity 
                  style={styles.sidebarItem} 
                  onPress={() => { handleSelect('Home'); closeSidebar(); }}
                  activeOpacity={0.7}
                >
                  <View style={styles.iconContainer}>
                    <Home size={20} color="#2563EB" strokeWidth={2} />
                  </View>
                  <Text style={styles.sidebarText}>Home</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.sidebarItem} 
                  onPress={() => { handleSelect('Categories'); closeSidebar(); }}
                  activeOpacity={0.7}
                >
                  <View style={styles.iconContainer}>
                    <List size={20} color="#2563EB" strokeWidth={2} />
                  </View>
                  <Text style={styles.sidebarText}>Categories</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.sidebarItem} 
                  onPress={() => { handleSelect('Deals'); closeSidebar(); }}
                  activeOpacity={0.7}
                >
                  <View style={styles.iconContainer}>
                    <Gift size={20} color="#2563EB" strokeWidth={2} />
                  </View>
                  <Text style={styles.sidebarText}>Deals & Offers</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.sidebarItem} 
                  onPress={() => { handleSelect('NewArrival'); closeSidebar(); }}
                  activeOpacity={0.7}
                >
                  <View style={styles.iconContainer}>
                    <TrendingUp size={20} color="#2563EB" strokeWidth={2} />
                  </View>
                  <Text style={styles.sidebarText}>New Arrivals</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.sidebarItem} 
                  onPress={() => { handleSelect('WishList'); closeSidebar(); }}
                  activeOpacity={0.7}
                >
                  <View style={styles.iconContainer}>
                    <HeartIcon size={20} color="#2563EB" strokeWidth={2} />
                  </View>
                  <Text style={styles.sidebarText}>Wishlist</Text>
                </TouchableOpacity>

                {isAuthenticated && (
                  <TouchableOpacity 
                    style={styles.sidebarItem} 
                    onPress={() => { navigate?.('MyOrders'); closeSidebar(); }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.iconContainer}>
                      <ShoppingBag size={20} color="#2563EB" strokeWidth={2} />
                    </View>
                    <Text style={styles.sidebarText}>My Orders</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.divider} />

              {isAuthenticated ? (
                <TouchableOpacity 
                  style={[styles.sidebarItem, styles.logoutItem]} 
                  onPress={handleLogout}
                  activeOpacity={0.7}
                >
                  <View style={[styles.iconContainer, styles.logoutIconContainer]}>
                    <LogOut size={20} color="#DC2626" strokeWidth={2} />
                  </View>
                  <Text style={[styles.sidebarText, styles.logoutText]}>Logout</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.authButtons}>
                  <TouchableOpacity 
                    style={styles.signInBtn} 
                    onPress={() => { navigate?.('SignIn'); closeSidebar(); }}
                    activeOpacity={0.8}
                  >
                    <User size={18} color="#fff" strokeWidth={2.5} />
                    <Text style={styles.signInText}>Sign In</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.signUpBtn} 
                    onPress={() => { navigate?.('SignUp'); closeSidebar(); }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.signUpText}>Create Account</Text>
                  </TouchableOpacity>
                </View>
              )}
            </Animated.View>
          </ScrollView>
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
    position: 'relative',
  },
  wishlistBadge: {
    position: 'absolute',
    right: 0,
    top: -2,
    backgroundColor: '#EF4444',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wishlistBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
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
    backgroundColor: '#000',
    zIndex: 999,
  },
  sidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    zIndex: 1001,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
    overflow: 'hidden',
  },
  overlayTouchable: {
    flex: 1,
  },
  sidebarHeader: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  menuHeaderContainer: {
    paddingVertical: 4,
  },
  sidebarTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    letterSpacing: -0.5,
  },
  sidebarSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '500',
  },
  userInfo: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#DBEAFE',
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  menuSection: {
    paddingTop: 12,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginHorizontal: 8,
    borderRadius: 10,
    marginBottom: 4,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  sidebarText: {
    flex: 1,
    fontSize: 15,
    color: '#334155',
    fontWeight: '600',
    letterSpacing: 0,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 16,
    marginHorizontal: 20,
  },
  logoutItem: {
    marginTop: 4,
  },
  logoutIconContainer: {
    backgroundColor: '#FEE2E2',
  },
  logoutText: {
    color: '#DC2626',
    fontWeight: '600',
  },
  authButtons: {
    paddingHorizontal: 20,
    gap: 12,
    marginTop: 8,
    paddingBottom: 20,
  },
  signInBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  signInText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  signUpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  signUpText: {
    color: '#475569',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  sidebarLast: {
    marginTop: 8,
  },
});

export default Header;
