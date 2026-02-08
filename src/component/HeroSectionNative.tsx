import React from 'react';
import { View, Text, StyleSheet, Dimensions, Platform, ImageBackground, TouchableOpacity } from 'react-native';
import { wp, hp, scale } from '../utils/responsive';

const HeroSection: React.FC<{ imageResizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center' }> = ({ imageResizeMode = 'center' }) => {
  const screenWidth = Dimensions.get('window').width;
  const slides = [
    require('../../assets/h-bg1.png'),
    require('../../assets/bg-h2.png'),
    require('../../assets/bg-h3.png'),
  ].filter(Boolean); // ensure only valid images are used

  const [currentSlide, setCurrentSlide] = React.useState(0);

  React.useEffect(() => {
    const id = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  const handlePrev = () => setCurrentSlide(prev => (prev === 0 ? slides.length - 1 : prev - 1));
  const handleNext = () => setCurrentSlide(prev => (prev === slides.length - 1 ? 0 : prev + 1));

  return (
    <View style={styles.container}>
      <ImageBackground
        source={slides[currentSlide]}
        style={[styles.background, { width: screenWidth }]}
        resizeMode={imageResizeMode}
        imageStyle={{ resizeMode: imageResizeMode }}
      >
        <View style={styles.inner}>
          {/* Content overlay can go here if needed */}
        </View>

        <TouchableOpacity style={[styles.arrowButton, styles.leftArrow]} onPress={handlePrev} activeOpacity={0.8}>
          <Text style={styles.arrowText}>{'<'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.arrowButton, styles.rightArrow]} onPress={handleNext} activeOpacity={0.8}>
          <Text style={styles.arrowText}>{'>'}</Text>
        </TouchableOpacity>

        {/* <View style={styles.indicatorContainer}>
          {slides.map((_, i) => (
            <View key={i} style={[styles.indicator, currentSlide === i && styles.activeIndicator]} />
          ))}
        </View> */}
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: Platform.select({ ios: hp(40), android: hp(40), default: hp(40) }),
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 0,
    marginBottom: hp(1.5),
  },
  background: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inner: {
    width: '100%',
    paddingHorizontal: wp(4),
    alignItems: 'center',
  },
  title: {
    fontSize: scale(28),
    fontWeight: '700',
    color: '#111827',
    marginBottom: hp(1),
    textAlign: 'center',
  },
  subtitle: {
    fontSize: scale(16),
    color: '#6b7280',
    textAlign: 'center',
  },
  arrowButton: {
    position: 'absolute',
    top: '50%',
    marginTop: -wp(6),
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  leftArrow: {
    left: wp(3),
  },
  rightArrow: {
    right: wp(3),
  },
  arrowText: {
    color: '#fff',
    fontSize: scale(20),
    fontWeight: '700',
  },
  indicatorContainer: {
    position: 'absolute',
    bottom: 12,
    flexDirection: 'row',
    alignSelf: 'center',
    zIndex: 5,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.6)',
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: '#fff',
    width: 20,
    height: 8,
    borderRadius: 4,
  },
});

export default HeroSection;
