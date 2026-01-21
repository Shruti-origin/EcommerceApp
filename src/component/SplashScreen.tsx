import React, {useEffect, useRef} from 'react';
import {View, Image, StyleSheet, Animated, StatusBar} from 'react-native';

const SplashScreen = ({ duration = 2000, onFinish = () => {} }: { duration?: number; onFinish?: () => void }) => {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }).start(() => onFinish());
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onFinish, opacity]);

  return (
    <Animated.View style={[styles.container, { opacity }]}> 
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.logoWrap}>
        {/* eslint-disable-next-line @typescript-eslint/no-var-requires */}
        <Image source={require('../../assets/logo-img.png')} style={styles.logo} resizeMode="contain" />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  logoWrap: {
    width: 180,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
});

export default SplashScreen;
