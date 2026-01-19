import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Platform,
  Text,
} from 'react-native';
import { ArrowLeft, ArrowRight } from 'lucide-react-native';

interface Props {
  images?: any[]; // require()'d images or uri objects
  autoplayInterval?: number;
  autoplay?: boolean;
}

const SaleBannerNative: React.FC<Props> = ({
  images,
  autoplayInterval = 5000,
  autoplay = true,
}) => {
  const defaultImages = [
    require('../../assets/sale-banner1.png'),
    require('../../assets/sale-banner2.png'),
  ];
  const banners = images && images.length ? images : defaultImages;

  const screenWidth = Dimensions.get('window').width;
  const isWide = screenWidth >= 900; // mimic desktop

  const [index, setIndex] = useState(0);
  const scrollRef = useRef<ScrollView | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // autoplay only when explicitly enabled and for non-wide layouts
    if (autoplay && !isWide && banners.length > 1) {
      timerRef.current = setInterval(() => {
        setIndex((prev) => (prev + 1) % banners.length);
      }, autoplayInterval);
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }

    // ensure any running timer is cleared when autoplay is disabled
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isWide, banners.length, autoplayInterval, autoplay]);

  useEffect(() => {
    if (!isWide && scrollRef.current) {
      scrollRef.current.scrollTo({ x: index * screenWidth, animated: true });
    }
  }, [index, isWide, screenWidth]);

  const onMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const newIndex = Math.round(x / screenWidth);
    setIndex(newIndex);
  };

  const next = () => setIndex((prev) => (prev + 1) % banners.length);
  const prev = () => setIndex((prev) => (prev - 1 + banners.length) % banners.length);

  if (isWide) {
    // Side-by-side layout for larger screens
    return (
      <View style={[styles.container, styles.wideContainer]}>
        {banners.map((img, i) => (
          <Image key={i} source={img} style={[styles.wideImage]} resizeMode="cover" />
        ))}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        contentContainerStyle={{}}
      >
        {banners.map((img, i) => (
          <Image
            key={i}
            source={img}
            style={[styles.bannerImage, { width: screenWidth }]}
            resizeMode="cover"
          />
        ))}
      </ScrollView>

      {/* Center overlay with arrows and title (matches design) */}
      <View style={styles.overlay} pointerEvents="box-none">
        <TouchableOpacity
          onPress={prev}
          accessibilityLabel="Previous slide"
          style={styles.overlayArrow}
          activeOpacity={0.85}
        >
          <ArrowLeft size={20} color="#fff" strokeWidth={3} />
        </TouchableOpacity>

        <Text style={styles.overlayTitle}>Categories</Text>

        <TouchableOpacity
          onPress={next}
          accessibilityLabel="Next slide"
          style={styles.overlayArrow}
          activeOpacity={0.85}
        >
          <ArrowRight size={20} color="#fff" strokeWidth={3} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#fff',
    overflow: 'visible',
    paddingBottom: 80,
  },
  wideContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  wideImage: {
    width: 960,
    height: 500,
  },
  bannerImage: {
    height: 300,
  },
  arrow: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -24 }],
    // backgroundColor: 'rgba(255,255,255,0.9)',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 6,
  },
  leftArrow: {
    left: 12,
  },
  rightArrow: {
    right: 12,
  },
  dotsWrap: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  } as any,
  dot: {
    height: 8,
    borderRadius: 8,
  },
  activeDot: {
    width: 36,
    backgroundColor: '#fff',
  },
  inactiveDot: {
    width: 8,
    // backgroundColor: 'rgba(255,255,255,0.6)',
  },
  /* Overlay that sits centered horizontally near the bottom of the banner */
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 15,
    height: 64,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginHorizontal: 0,
    // borderRadius: 12,
    elevation: 8,
  },
  overlayArrow: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#34c759',
    
  },
});

export default SaleBannerNative;
