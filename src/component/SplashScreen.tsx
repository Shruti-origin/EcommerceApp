import React, {useEffect, useRef} from 'react';
import {View, Image, StyleSheet, Animated, StatusBar, Text, TouchableOpacity} from 'react-native';
import { ChevronRight } from 'lucide-react-native';

const SplashScreen = ({ navigate, onFinish = () => {} }: { navigate?: (name: string, params?: any) => void; onFinish?: () => void }) => {
  const opacity = useRef(new Animated.Value(1)).current;

  function hideAndNavigate(route?: string) {
    // navigate first so underlying route is ready, then fade out the splash
    if (route && navigate) navigate(route);

    Animated.timing(opacity, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start(() => onFinish?.());
  }

  return (
    <Animated.View style={[styles.container, { opacity }]}> 
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Decorative leaves in background */}
      <Image source={require('../../assets/bg-home.png')} style={styles.leafTopLeft} />
      <Image source={require('../../assets/bg-home.png')} style={styles.leafBottomRight} />

      <View style={styles.content}>
        <View style={styles.logoCircle}>
          {/* eslint-disable-next-line @typescript-eslint/no-var-requires */}
          <Image source={require('../../assets/logo-img.png')} style={styles.logo} resizeMode="contain" />
        </View>

        <Text style={styles.subtitle}>Beautiful eCommerce for{`\n`} your online store</Text>

        <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.85} onPress={() => hideAndNavigate('SignUp')}>
          <Text style={styles.primaryBtnText}>Let's Get Started</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginRow} onPress={() => hideAndNavigate('SignIn')}>
          <Text style={styles.loginText}>I already have an account</Text>
          <View style={styles.arrowCircle}>
            <ChevronRight color="#fff" size={16} />
          </View>
        </TouchableOpacity>
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
  leafTopLeft: {
    position: 'absolute',
    top: -190,
    left: -180,
    width: 400,
    height: 400,
    opacity: 0.35,
    transform: [{ rotate: '-120deg' }],
  },
  leafBottomRight: {
    position: 'absolute',
    bottom: -120,
    right: -150,
    width: 330,
    height: 330,
    opacity: 0.35,
    transform: [{ rotate: '55deg' }],
  },
  content: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logoCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    marginBottom: 24,
  },
  logo: {
    width: 210,
    height: 210,
    marginTop:12,
  },
  subtitle: {

    textAlign: 'center',
    color: '#000000',
    marginBottom: 20,
    marginTop: -10,
    fontSize: 14,
    lineHeight: 20,
  },
  primaryBtn: {
    backgroundColor: '#E84F30',
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 30,
    minWidth: 260,
    alignItems: 'center',
    marginBottom: 14,
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  loginRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  loginText: {
    color: '#000000',
    marginRight: 10,
  },
  arrowCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#16A34A',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SplashScreen;
