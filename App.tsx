/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useState, useRef, useEffect } from 'react';
import { NewAppScreen } from '@react-native/new-app-screen';
import { StatusBar, StyleSheet, useColorScheme, View, BackHandler, Platform, ToastAndroid } from 'react-native';
import Header from './src/layout/Header';
import WishList from './src/pages/WishList';
import BottomNav from './src/layout/BottomNav';
import Categories from './src/pages/Categories';
import ProductDetails from './src/pages/ProductDetails';
import Deals from './src/pages/Deals';
import SearchResults from './src/pages/SearchResults';
import Cart from './src/pages/Cart';
import SignInNative from './src/pages/SignInNative';
import SignUpNative from './src/pages/SignUpNative';
import PaymentMethodNative from './src/pages/PaymentMethodNative';
import MyOrders from './src/pages/MyOrders';
import SplashScreen from './src/component/SplashScreen';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import Home from './src/pages/Home';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const safeAreaInsets = useSafeAreaInsets();
  const [active, setActive] = useState('Home');
  const [showSplash, setShowSplash] = useState(true);

  // navigation history to support back traversal
  const [history, setHistory] = useState<Array<{ name: string; params?: any }>>([]);
  const [route, setRoute] = useState<{ name: string; params?: any }>({ name: 'Home' });
  const backPressRef = useRef<number | null>(null);

  // navigate pushes current route into history (if different) and navigates
  const navigate = (name: string, params?: any) => {
    console.log('[App] navigate()', name, params);
    setHistory(prev => {
      const curr = route;
      if (curr && curr.name !== name) return [...prev, curr];
      return prev;
    });
    setRoute({ name, params });
  };

  // set active tab and reset history when user switches tabs
  const handleSetActive = (name: string) => {
    setActive(name);
    setHistory([]);
    setRoute({ name });
  };

  // goBack utility used by back button and header back chevron
  const goBack = () => {
    if (history.length > 0) {
      const last = history[history.length - 1];
      setHistory(prev => prev.slice(0, prev.length - 1));
      setRoute(last);
      if (['Home', 'Categories', 'Video', 'Search', 'Setting'].includes(last.name)) {
        setActive(last.name);
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

  const isBackButtonPage = route.name === 'ProductDetails' || route.name === 'WishList' || route.name === 'Search' || route.name === 'Cart' || route.name === 'PaymentMethod' || route.name === 'MyOrders';

  return (
    <View style={styles.container}>
      <Header 
        navigate={navigate} 
        setActive={handleSetActive} 
        goBack={goBack} 
        showBackButton={isBackButtonPage}
      />

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
        ) : route.name === 'SignIn' ? (
          <SignInNative navigate={navigate} goBack={goBack} />
        ) : route.name === 'SignUp' ? (
          <SignUpNative navigate={navigate} goBack={goBack} />
        ) : route.name === 'PaymentMethod' ? (
          <PaymentMethodNative navigate={navigate} goBack={goBack} />
        ) : route.name === 'MyOrders' ? (
          <MyOrders navigate={navigate} goBack={goBack} />
        ) : (
          <>
            {active === 'Home' && <Home navigate={navigate} />}
            {active === 'Categories' && <Categories navigate={navigate} />}
            {/* {active === 'Deals' && <Deals navigate={navigate} />} */}
            {active === 'Video' && <View />}
            {active === 'Search' && <View />}
            {active === 'Setting' && <View />}
          </>
        )}
      </View>

      {route.name !== 'ProductDetails' && <BottomNav active={active} onChange={handleSetActive} />}

      {/* Splash overlay - shows on app open and hides after duration */}
      {showSplash && (
        <SplashScreen duration={2000} onFinish={() => setShowSplash(false)} />
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
