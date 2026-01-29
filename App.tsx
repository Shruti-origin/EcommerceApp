/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useState, useRef, useEffect } from 'react';
import { NewAppScreen } from '@react-native/new-app-screen';
import './src/i18n';
import { useTranslation } from 'react-i18next';
import { StatusBar, StyleSheet, useColorScheme, View, BackHandler, Platform, ToastAndroid, ScrollView, Text, TouchableOpacity, Alert } from 'react-native';
import Header from './src/layout/Header';
import WishList from './src/pages/WishList';
import BottomNav from './src/layout/BottomNav.tsx';
import type { TabKey } from './src/layout/BottomNav.tsx';
import Categories from './src/pages/Categories';
import ProductDetails from './src/pages/ProductDetails';
import Deals from './src/pages/Deals';
import SearchResults from './src/pages/SearchResults';
import Cart from './src/pages/Cart';
import SignInNative from './src/pages/SignInNative';
import SignUpNative from './src/pages/SignUpNative';
import ForgetPassword from './src/pages/ForgetPassword';
import { PaymentMethodCard } from './src/component';
import PaymentMethod from './src/component/PaymentMethod';
import MyOrders from './src/pages/MyOrders';
import CategoryProducts from './src/pages/CategoryProducts';
import SplashScreen from './src/component/SplashScreen';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import Home from './src/pages/Home';
import HelloScreen from './src/pages/HelloScreen';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { ChevronLeft } from 'lucide-react-native';
import ProfileNative from './src/pages/ProfileNative';
import Account from './src/pages/Account';
import ProfileSettings from './src/component/ProfileSettings';
import ShippingAddress from './src/component/ShippingAddress';
import Language from './src/component/Language';
import AboutUs from './src/component/AboutUs';
import VendorShopSectionNative from './src/component/VendorShopSectionNative';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

function AppContent() {
  const safeAreaInsets = useSafeAreaInsets();
  const { i18n } = useTranslation();
  const { isAuthenticated, isLoading } = useAuth();
  const [active, setActive] = useState<TabKey>('Home');
  const [showSplash, setShowSplash] = useState(true);
  const [languageLoaded, setLanguageLoaded] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language); // Track language changes

  // navigation history to support back traversal
  const [history, setHistory] = useState<Array<{ name: string; params?: any }>>([]);
  const [route, setRoute] = useState<{ name: string; params?: any }>({ name: 'Home' });
  const backPressRef = useRef<number | null>(null);

  // Load saved language on app start
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
        const savedLang = await AsyncStorage.getItem('appLanguage');
        if (savedLang && savedLang !== i18n.language) {
          await i18n.changeLanguage(savedLang);
          setCurrentLanguage(savedLang);
        }
      } catch (error) {
        console.error('Failed to load language:', error);
      } finally {
        setLanguageLoaded(true);
      }
    };
    loadLanguage();

    // Listen for language change events
    const handleLanguageChange = (event: any) => {
      const newLang = event?.detail?.language || i18n.language;
      console.log('[App] Language changed to:', newLang);
      setCurrentLanguage(newLang);
    };

    if (typeof globalThis !== 'undefined' && (globalThis as any).addEventListener) {
      try {
        (globalThis as any).addEventListener('languageChanged', handleLanguageChange);
      } catch (e) {}
    }

    return () => {
      if (typeof globalThis !== 'undefined' && (globalThis as any).removeEventListener) {
        try {
          (globalThis as any).removeEventListener('languageChanged', handleLanguageChange);
        } catch (e) {}
      }
    };
  }, []);

  // navigate pushes current route into history (if different) and navigates
  const navigate = (name: string, params?: any) => {
    console.log('[App] navigate()', name, params);
    // Prevent navigating to auth/onboarding pages when already signed in
    if (isAuthenticated && (name === 'SignIn' || name === 'SignUp' || name === 'Hello')) {
      console.log('[App] blocked navigation to', name, 'because user is authenticated');
      setActive('Home');
      setRoute({ name: 'Home' });
      return;
    }

    setHistory(prev => {
      const curr = route;
      if (curr && curr.name !== name) return [...prev, curr];
      return prev;
    });
    setRoute({ name, params });
  };

  // If auth state changes while on an auth-only page, redirect to Home
  useEffect(() => {
    if (isAuthenticated && ['SignIn', 'SignUp', 'Hello'].includes(route.name)) {
      setActive('Home');
      setRoute({ name: 'Home' });
    }
  }, [isAuthenticated, route.name]);

  // set active tab and reset history when user switches tabs
  const handleSetActive = (name: string | TabKey) => {
    console.log('[App] handleSetActive', name);
    setActive(name as TabKey);
    setHistory([]);
    setRoute({ name });
  }; 

  // goBack utility used by back button and header back chevron
  const goBack = () => {
    if (history.length > 0) {
      const last = history[history.length - 1];
      setHistory(prev => prev.slice(0, prev.length - 1));
      setRoute(last);
      if (['Home', 'Categories', 'Video', 'Search', 'Setting', 'Profile', 'Account'].includes(last.name)) {
        setActive(last.name as TabKey);
      }
      return;
    }

    if (route.name !== 'Home') {
      setRoute({ name: 'Home' });
      setActive('Home');
      setHistory([]);
      return;
    }

    // Double-back to exit on Home
    const now = Date.now();
    if (backPressRef.current && now - backPressRef.current < 2000) {
      BackHandler.exitApp();
      return;
    }
    backPressRef.current = now;
    if (Platform.OS === 'android') {
      ToastAndroid.show('Press back again to exit', ToastAndroid.SHORT);
    }
  };

  // Handle Android hardware back button
  useEffect(() => {
    const onBackPress = () => {
      // reuse goBack behavior and indicate handled by returning true
      goBack();
      return true;
    };

    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [history, route]);

  const isBackButtonPage = route.name === 'ProductDetails' || route.name === 'WishList' || route.name === 'Search' || route.name === 'Cart' || route.name === 'PaymentMethod' || route.name === 'MyOrders' || route.name === 'CategoryProducts' || route.name === 'ShippingAddress' || route.name === 'Language' || route.name === 'About';
  // Hide header on Account and also on SignUp/SignIn pages where a full-screen onboarding is desired
  const hideHeader = route.name === 'Account' || active === 'Account' || route.name === 'ShippingAddress' || route.name === 'Language' || route.name === 'About' || route.name === 'SignUp' || route.name === 'SignIn' || route.name === 'ForgetPassword' || route.name === 'Hello';

  return (
    <View style={styles.container}>
      {!hideHeader && (
        <Header 
          navigate={navigate} 
          setActive={handleSetActive} 
          goBack={goBack} 
          showBackButton={isBackButtonPage}
        />
      )}

      <View style={{ flex: 1 }}>
        {route.name === 'ProductDetails' ? (
          <ProductDetails product={route.params?.product} navigate={navigate} goBack={goBack} />
        ) : route.name === 'Search' ? (
          <SearchResults query={route.params?.query} navigate={navigate} goBack={goBack} />
        ) : route.name === 'Deals' ? (
          <Deals navigate={navigate} />
        ) : route.name === 'WishList' ? (
          <WishList navigate={navigate} goBack={goBack} />
        ) : route.name === 'Cart' ? (
          <Cart navigate={navigate} goBack={goBack} />
        ) : route.name === 'CategoryProducts' ? (
          <CategoryProducts categoryId={route.params?.categoryId} title={route.params?.title} items={route.params?.items} navigate={navigate} goBack={goBack} />
        ) : route.name === 'Hello' ? (
          <HelloScreen navigate={navigate} />
        ) : route.name === 'SignIn' ? (
          <SignInNative navigate={navigate} goBack={goBack} />
        ) : route.name === 'SignUp' ? (
          <SignUpNative navigate={navigate} goBack={goBack} />
        ) : route.name === 'ForgetPassword' ? (
          <ForgetPassword navigate={navigate} goBack={goBack} />
        ) : route.name === 'PaymentMethod' ? (
          <PaymentMethod navigate={navigate} goBack={goBack} />
        ) : route.name === 'MyOrders' ? (
          <MyOrders navigate={navigate} goBack={goBack} />
        ) : route.name === 'Account' ? (
          <Account navigate={navigate} goBack={goBack} />
        ) : route.name === 'Profile' ? (
          <ProfileSettings navigate={navigate} goBack={goBack} />
        ) : route.name === 'ShippingAddress' ? (
          <ShippingAddress navigate={navigate} goBack={goBack} />
        ) : route.name === 'Language' ? (
          <Language navigate={navigate} goBack={goBack} />
        ) : route.name === 'About' ? (
          <AboutUs navigate={navigate} goBack={goBack} />
        ) : route.name === 'VendorShop' ? (
          <VendorShopSectionNative vendorId={route.params?.vendorId} vendorName={route.params?.vendorName} navigate={navigate} goBack={goBack} />
        ) : route.name === 'VendorProducts' ? (
          <VendorShopSectionNative vendorId={route.params?.vendorId} vendorName={route.params?.vendorName} navigate={navigate} goBack={goBack} />
        ) : (
          <>
            {active === 'Home' && <Home navigate={navigate} />}
            {active === 'Categories' && <Categories navigate={navigate} />}
            {/* {active === 'Deals' && <Deals navigate={navigate} />} */}
            {active === 'Video' && <View />}
            {active === 'Search' && <View />}
            {active === 'Setting' && <View />}
            {active === 'Account' && <Account navigate={navigate} goBack={goBack} />}
            {active === 'Profile' && <ProfileNative navigate={navigate} goBack={goBack} />}
          </>
        )} 
      </View>

      {route.name !== 'ProductDetails' && route.name !== 'SignUp' && route.name !== 'SignIn' && route.name !== 'ForgetPassword' && route.name !== 'Hello' && <BottomNav active={active} onChange={handleSetActive} />}

      {/* Splash overlay - shows on app open and hides after duration; hide if user already signed-in */}
      {showSplash && !isAuthenticated && (
        <SplashScreen navigate={navigate} onFinish={() => setShowSplash(false)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
