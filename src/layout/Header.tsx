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
import { useTranslation } from 'react-i18next';
import { Truck, Search, Menu, ShoppingBag, Home, List, Gift, Heart as HeartIcon, User, ChevronLeft, Heart, LogOut, Sparkles, TrendingUp } from 'lucide-react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { guestCartUtils } from '../utils/cartUtils';
import { guestWishlistUtils } from '../utils/wishlistUtils';

type HeaderProps = {
  navigate?: (name: string, params?: any) => void;
  setActive?: (name: string | import('./BottomNav').TabKey) => void;
  goBack?: () => void;
  showBackButton?: boolean;
};

type UserType = { firstName?: string; lastName?: string; email?: string } | null;

// Android-responsive: detect small Android screens (<360dp)
const { width: screenWidth } = Dimensions.get('window');
const isSmallAndroid = Platform.OS === 'android' && screenWidth < 360;

const Header: React.FC<HeaderProps> = ({ navigate, setActive, goBack, showBackButton = false }) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserType>(null);

  // Promo marquee animation
  const promoTranslate = useRef(new Animated.Value(0)).current;
  const [singleWidth, setSingleWidth] = useState(0);
  const [promoContainerWidth, setPromoContainerWidth] = useState(0);
  const promoItems = [
    { text: 'Buy 3 Get 25% Off, Shop Now >>', bg: '#e05559', textColor: '#fff' },
    { text: 'FREE shipping on £39.00+ | Free Returns', bg: '#75bd4b', textColor: '#fff', icon: <Truck size={isSmallAndroid ? 14 : 18} color="#fff" /> },
    { text: 'Cosy Chick Deals, 60-30% Off, Shop Here >>', bg: '#DDD1A8', textColor: '#000' },
  ];

  useEffect(() => {
    let anim: Animated.CompositeAnimation | null = null;
    // Start seamless loop once we know the single sequence width
    if (singleWidth && promoContainerWidth) {
      promoTranslate.setValue(0);
      const distance = singleWidth;
      const duration = Math.max(8000, Math.round((distance / screenWidth) * 3500));

      anim = Animated.loop(
        Animated.timing(promoTranslate, {
          toValue: -distance,
          duration,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      anim.start();
    }
    return () => { if (anim) anim?.stop(); };
  }, [singleWidth, promoContainerWidth, promoTranslate]);

  useEffect(() => {
    checkAuth();

    const handleAuthChange = () => {
      checkAuth();
    };

    if (typeof globalThis !== 'undefined' && (globalThis as any).addEventListener) {
      try { (globalThis as any).addEventListener('loginSuccess', handleAuthChange); } catch (e) {}
      try { (globalThis as any).addEventListener('logoutSuccess', handleAuthChange); } catch (e) {}
    }

    const intervalId = setInterval(checkAuth, 3000);

    return () => {
      clearInterval(intervalId);
      if (typeof globalThis !== 'undefined' && (globalThis as any).removeEventListener) {
        try { (globalThis as any).removeEventListener('loginSuccess', handleAuthChange); } catch (e) {}
        try { (globalThis as any).removeEventListener('logoutSuccess', handleAuthChange); } catch (e) {}
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
              if (typeof globalThis !== 'undefined' && (globalThis as any).dispatchEvent) {
                try {
                  const CE = (globalThis as any).CustomEvent;
                  if (CE) {
                    (globalThis as any).dispatchEvent(new CE('logoutSuccess'));
                  } else {
                    (globalThis as any).dispatchEvent({ type: 'logoutSuccess' });
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

  useEffect(() => {
    const loadCartCount = async () => {
      const cart = await guestCartUtils.getCart();
      const totalItems = cart.items.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
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

    const interval = setInterval(() => { loadCartCount(); loadWishlistCount(); }, 2000);

    return () => clearInterval(interval);
  }, []);

  const sidebarWidth = Math.min(280, Dimensions.get('window').width * 0.75);
  const translateX = useRef(new Animated.Value(-sidebarWidth)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const menuItemsOpacity = useRef(new Animated.Value(0)).current;
  const menuItemsTranslateY = useRef(new Animated.Value(20)).current;

  const handleSearch = () => {
    const q = String(searchQuery || '').trim();
    if (!q) return;
    if (open) closeSidebar();
    if (navigate) navigate('Search', { query: q });
  };

  const openSidebar = () => {
    setOpen(true);
    Animated.parallel([
      Animated.timing(overlayOpacity, { toValue: 0.6, duration: 300, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      Animated.spring(translateX, { toValue: 0, tension: 65, friction: 11, useNativeDriver: true }),
    ]).start(() => {
      Animated.parallel([
        Animated.timing(menuItemsOpacity, { toValue: 1, duration: 400, delay: 100, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.spring(menuItemsTranslateY, { toValue: 0, tension: 50, friction: 8, delay: 10, useNativeDriver: true }),
      ]).start();
    });
  };

  const closeSidebar = () => {
    Animated.parallel([
      Animated.timing(menuItemsOpacity, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(overlayOpacity, { toValue: 0, duration: 250, easing: Easing.in(Easing.ease), useNativeDriver: true }),
      Animated.timing(translateX, { toValue: -sidebarWidth, duration: 280, easing: Easing.in(Easing.ease), useNativeDriver: true }),
    ]).start(() => {
      setOpen(false);
      menuItemsTranslateY.setValue(20);
    });
  };

  const handleSelect = (key: string) => {
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
        if (navigate) navigate('Deals');
        break;
      case 'WishList':
        if (navigate) navigate('WishList');
        break;
      case 'Profile':
        if (setActive) setActive('Setting');
        break;
      default:
        break;
    }
  };

  return (
    <SafeAreaView style={styles.wrapper} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.promo} onLayout={(e) => setPromoContainerWidth(e.nativeEvent.layout.width)}>
          {/* Hidden single sequence used to measure exact width (no padding/margins) */}
        <View style={{ position: 'absolute', left: 0, top: 0, opacity: 0 }} onLayout={(e) => setSingleWidth(e.nativeEvent.layout.width)}>
          <View style={styles.promoTrack}>
            {promoItems.map((item, idx) => (
              <View key={`m-${idx}`} style={[styles.promoItem, { backgroundColor: item.bg }]}>
                {item.icon ? <View style={styles.promoItemIcon}>{item.icon}</View> : null}
                <Text style={[styles.promoItemText, item.textColor ? { color: item.textColor } : null]}>{item.text}</Text>
              </View>
            ))}
          </View>
        </View>

        <Animated.View style={[styles.promoTrack, { transform: [{ translateX: promoTranslate }] }]}>
          {promoItems.concat(promoItems).map((item, idx) => (
            <View key={idx} style={[styles.promoItem, { backgroundColor: item.bg }]}>
              {item.icon ? <View style={styles.promoItemIcon}>{item.icon}</View> : null}
              <Text style={[styles.promoItemText, item.textColor ? { color: item.textColor } : null]}>{item.text}</Text>
            </View>
          ))}
        </Animated.View>

        {/* <TouchableOpacity style={styles.promoCart} activeOpacity={0.9} accessibilityLabel="Promo action">
          <Truck size={isSmallAndroid ? 14 : 18} color="#fff" />
        </TouchableOpacity> */}
      </View>

      <View style={styles.searchRow}>
        {showBackButton ? (
          <TouchableOpacity style={styles.menuBtn} activeOpacity={0.7} onPress={() => goBack?.()}>
            <ChevronLeft size={isSmallAndroid ? 18 : 20} color="#111" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.menuBtn} activeOpacity={0.7} onPress={() => (open ? closeSidebar() : openSidebar())}>
            <Menu size={isSmallAndroid ? 16 : 18} color="#0b0c09e0" />
          </TouchableOpacity>
        )}

        <View style={styles.searchBox}>
          <TouchableOpacity onPress={handleSearch} style={{ padding: 4 }}>
            <Search size={isSmallAndroid ? 16 : 18} color="#9EA0A4" />
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
          <HeartIcon size={isSmallAndroid ? 18 : 22} color="#666" />
          {wishlistCount > 0 && (
            <View style={styles.wishlistBadge}>
              <Text style={styles.wishlistBadgeText}>{wishlistCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.cartBtn} activeOpacity={0.7} accessibilityLabel="Open cart" onPress={() => { if (open) closeSidebar(); navigate?.('Cart'); }}>
          <ShoppingBag size={isSmallAndroid ? 18 : 22} color="#222" />
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
                  <User size={isSmallAndroid ? 22 : 28} color="#2563EB" strokeWidth={2} />
                </View>
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
                    <Home size={isSmallAndroid ? 18 : 20} color="#2563EB" strokeWidth={2} />
                  </View>
                  <Text style={styles.sidebarText}>Home</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.sidebarItem} 
                  onPress={() => { handleSelect('Categories'); closeSidebar(); }}
                  activeOpacity={0.7}
                >
                  <View style={styles.iconContainer}>
                    <List size={isSmallAndroid ? 18 : 20} color="#2563EB" strokeWidth={2} />
                  </View>
                  <Text style={styles.sidebarText}>Categories</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.sidebarItem} 
                  onPress={() => { handleSelect('Deals'); closeSidebar(); }}
                  activeOpacity={0.7}
                >
                  <View style={styles.iconContainer}>
                    <Gift size={isSmallAndroid ? 18 : 20} color="#2563EB" strokeWidth={2} />
                  </View>
                  <Text style={styles.sidebarText}>Deals & Offers</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.sidebarItem} 
                  onPress={() => { handleSelect('NewArrival'); closeSidebar(); }}
                  activeOpacity={0.7}
                >
                  <View style={styles.iconContainer}>
                    <TrendingUp size={isSmallAndroid ? 18 : 20} color="#2563EB" strokeWidth={2} />
                  </View>
                  <Text style={styles.sidebarText}>New Arrivals</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.sidebarItem} 
                  onPress={() => { handleSelect('WishList'); closeSidebar(); }}
                  activeOpacity={0.7}
                >
                  <View style={styles.iconContainer}>
                    <HeartIcon size={isSmallAndroid ? 18 : 20} color="#2563EB" strokeWidth={2} />
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
                      <ShoppingBag size={isSmallAndroid ? 18 : 20} color="#2563EB" strokeWidth={2} />
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
                    <LogOut size={isSmallAndroid ? 18 : 20} color="#DC2626" strokeWidth={2} />
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
                    <User size={isSmallAndroid ? 16 : 18} color="#fff" strokeWidth={2.5} />
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#fff',
    marginTop:2,
  },
  promo: {
    // backgroundColor: '#e56b6f',
    height: isSmallAndroid ? 32 : 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: isSmallAndroid ? 8 : 12,
    overflow: 'hidden',
  },
  promoTrack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  promoItem: {
    width: 330,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 0,
    marginRight: 0,
  },
  promoItemIcon: {
    marginRight: isSmallAndroid ? 6 : 8,
  },
  promoItemText: {
    fontWeight: '600',
    fontSize: isSmallAndroid ? 12 : 14,
  },
  promoText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: isSmallAndroid ? 12 : 14,
    paddingLeft: isSmallAndroid ? 32 : 48,
  },
  promoCart: {
    position: 'absolute',
    right: isSmallAndroid ? 8 : 12,
    zIndex: 2,
    backgroundColor: '#3bbf6b',
    paddingVertical: isSmallAndroid ? 4 : 6,
    paddingHorizontal: isSmallAndroid ? 6 : 8,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoCartText: {
    color: '#fff',
    fontSize: 14,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: isSmallAndroid ? 8 : 12,
    paddingVertical: isSmallAndroid ? 6 : 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuBtn: {
    padding: isSmallAndroid ? 4 : 6,
    marginRight: isSmallAndroid ? 4 : 8,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f4f4f4',
    paddingHorizontal: isSmallAndroid ? 8 : 12,
    height: isSmallAndroid ? 36 : 40,
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
    fontSize: isSmallAndroid ? 13 : 14,
  },
  iconBtn: {
    padding: isSmallAndroid ? 6 : 8,
    marginLeft: isSmallAndroid ? 4 : 8,
    position: 'relative',
  },
  wishlistBadge: {
    position: 'absolute',
    right: 0,
    top: -2,
    backgroundColor: '#EF4444',
    width: isSmallAndroid ? 16 : 18,
    height: isSmallAndroid ? 16 : 18,
    borderRadius: isSmallAndroid ? 8 : 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wishlistBadgeText: {
    color: '#fff',
    fontSize: isSmallAndroid ? 9 : 11,
    fontWeight: '700',
  },
  icon: {
    fontSize: isSmallAndroid ? 16 : 18,
  },
  cartBtn: {
    padding: isSmallAndroid ? 4 : 6,
    marginLeft: isSmallAndroid ? 4 : 6,
  },
  badge: {
    position: 'absolute',
    right: 0,
    top: -2,
    backgroundColor: '#10b981',
    width: isSmallAndroid ? 16 : 18,
    height: isSmallAndroid ? 16 : 18,
    borderRadius: isSmallAndroid ? 8 : 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: isSmallAndroid ? 9 : 11,
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
    paddingTop: Platform.OS === 'ios' ? 48 : (isSmallAndroid ? 36 : 40),
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
    paddingHorizontal: isSmallAndroid ? 16 : 20,
    paddingVertical: isSmallAndroid ? 12 : 16,
    marginBottom: isSmallAndroid ? 4 : 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  menuHeaderContainer: {
    paddingVertical: 3,
  },
  sidebarTitle: {
    fontSize: isSmallAndroid ? 20 : 24,
    fontWeight: '700',
    color: '#1E293B',
    letterSpacing: -0.5,
  },
  sidebarSubtitle: {
    fontSize: isSmallAndroid ? 11 : 13,
    color: '#64748B',
    marginTop: 3,
    fontWeight: '500',
  },
  userInfo: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  avatar: {
    width: isSmallAndroid ? 56 : 72,
    height: isSmallAndroid ? 56 : 72,
    borderRadius: isSmallAndroid ? 28 : 36,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: isSmallAndroid ? 8 : 10,
    borderWidth: 2,
    borderColor: '#DBEAFE',
  },
  userName: {
    fontSize: isSmallAndroid ? 15 : 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 3,
  },
  userEmail: {
    fontSize: isSmallAndroid ? 11 : 13,
    color: '#64748B',
    fontWeight: '500',
  },
  menuSection: {
    paddingTop: isSmallAndroid ? 8 : 10,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: isSmallAndroid ? 8 : 11,
    paddingHorizontal: isSmallAndroid ? 12 : 16,
    marginHorizontal: isSmallAndroid ? 6 : 8,
    borderRadius: 10,
    marginBottom: isSmallAndroid ? 3 : 4,
  },
  iconContainer: {
    width: isSmallAndroid ? 32 : 40,
    height: isSmallAndroid ? 32 : 40,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: isSmallAndroid ? 8 : 12,
  },
  sidebarText: {
    flex: 1,
    fontSize: isSmallAndroid ? 13 : 15,
    color: '#334155',
    fontWeight: '600',
    letterSpacing: 0,
    ...(isSmallAndroid && { display: 'none' }), // Hide labels on small Android only
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
    paddingVertical: isSmallAndroid ? 12 : 14,
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
    fontSize: isSmallAndroid ? 13 : 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  signUpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: isSmallAndroid ? 12 : 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  signUpText: {
    color: '#475569',
    fontSize: isSmallAndroid ? 13 : 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  sidebarLast: {
    marginTop: 8,
  },
});

export default Header;
