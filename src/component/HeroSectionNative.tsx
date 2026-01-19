import React from 'react';
import { View, Text, StyleSheet, Dimensions, Platform, ImageBackground, TouchableOpacity } from 'react-native';

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
    height: Platform.select({ ios: 320, android: 320, default: 320 }),
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 0,
    marginBottom: 12,
  },
  background: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inner: {
    width: '100%',
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  arrowButton: {
    position: 'absolute',
    top: '50%',
    marginTop: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  leftArrow: {
    left: 12,
  },
  rightArrow: {
    right: 12,
  },
  arrowText: {
    color: '#fff',
    fontSize: 20,
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
