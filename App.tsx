/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useState } from 'react';
import { NewAppScreen } from '@react-native/new-app-screen';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import Header from './src/layout/Header';
import BottomNav from './src/layout/BottomNav';
import Categories from './src/pages/Categories';
import ProductDetails from './src/pages/ProductDetails';
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

  // Simple route state for in-app navigation (no external dependency)
  const [route, setRoute] = useState<{ name: string; params?: any }>({ name: 'Home' });
  const navigate = (name: string, params?: any) => {
    console.log('[App] navigate()', name, params);
    setRoute({ name, params });
  };

  return (
    <View style={styles.container}>
      <Header />

      <View style={{ flex: 1 }}>
        {route.name === 'ProductDetails' ? (
          <ProductDetails product={route.params?.product} navigate={navigate} />
        ) : (
          <>
            {active === 'Home' && <Home navigate={navigate} />}
            {active === 'Categories' && <Categories />}
            {active === 'Video' && <View />}
            {active === 'Search' && <View />}
            {active === 'Setting' && <View />}
          </>
        )}
      </View>

      {route.name !== 'ProductDetails' && <BottomNav active={active} onChange={setActive} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
