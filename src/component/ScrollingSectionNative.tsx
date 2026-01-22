import React, { useRef, useEffect, useState } from 'react';
import { View, Animated, StyleSheet, Image, TouchableWithoutFeedback, useWindowDimensions, Platform } from 'react-native';

// Replace these requires with your real brand images in /assets
const BRAND_IMAGES = [
  require('../../assets/scrolling-img-1.png'),
  require('../../assets/scrolling-img-2.png'),
  require('../../assets/scrolling-img-3.png'),
  require('../../assets/scrolling-img-4.png'),
  require('../../assets/scrolling-img-5.png'),
];

const SPEED_PX_PER_SEC = 80; // adjust scroll speed

const ScrollingSectionNative: React.FC = () => {
  const { width: windowWidth } = useWindowDimensions();
  const scrollAnim = useRef(new Animated.Value(0)).current;
  const [singleWidth, setSingleWidth] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const innerRef = useRef<View | null>(null);

  // Duplicate items so we can seamlessly loop
  const items = [...BRAND_IMAGES, ...BRAND_IMAGES];

  // Responsive: determine how many cards should be visible at once (matches CSS breakpoints)
  const cardsPerView = windowWidth >= 1024 ? 5 : windowWidth >= 768 ? 4 : windowWidth >= 640 ? 3 : 2;
  // Subtract spacing (16px total per card as marginHorizontal 8 each side) and compute card width
  const cardWidth = Math.max(120, Math.floor((windowWidth - (cardsPerView + 1) * 16) / cardsPerView));
  const cardHeight = windowWidth >= 1024 ? 160 : windowWidth >= 768 ? 136 : windowWidth >= 640 ? 120 : 96;

  useEffect(() => {
    if (!singleWidth) return;

    // Log for debugging
    console.log('[ScrollingSectionNative] singleWidth:', singleWidth, 'windowWidth:', windowWidth, 'items:', items.length, 'cardsPerView:', cardsPerView, 'cardWidth:', cardWidth);
    let rafId: number | null = null;
    const perf = (globalThis as any).performance;
    const hasPerf = perf && typeof perf.now === 'function';
    let last = hasPerf ? perf.now() : Date.now();
    let x = 0; // current translateX value

    const step = (time?: number) => {
      const now = (typeof time === 'number' && time > 0) ? time : (hasPerf ? perf.now() : Date.now());
      const dt = now - last;
      last = now;

      if (!isPaused) {
        x -= (SPEED_PX_PER_SEC * dt) / 1000;
        // Wrap without visual jump
        if (singleWidth > 0 && Math.abs(x) >= singleWidth) {
          x += singleWidth;
        }
        // Directly set Animated.Value for smooth rendering
        scrollAnim.setValue(x);
      }

      rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [singleWidth, isPaused, scrollAnim, windowWidth]);

  // Pause on interaction
  const onPressIn = () => setIsPaused(true);
  const onPressOut = () => setIsPaused(false);

  // When layout happens compute width of single set of images
  const onInnerLayout = (e: any) => {
    const total = e.nativeEvent.layout.width || 0;
    // singleWidth = half of duplicated inner content
    setSingleWidth(Math.floor(total / 2));
  };

  // Hide animation on reduce-motion preferences could be added per platform if desired

  return (
    <View style={styles.section}>
      <View style={styles.innerWrap}>
        <TouchableWithoutFeedback onPressIn={onPressIn} onPressOut={onPressOut}>
          <Animated.View
            onLayout={onInnerLayout}
            ref={innerRef}
            style={[styles.track, { transform: [{ translateX: scrollAnim }] }]}
          >
            {items.map((src, i) => (
              <View key={i} style={[styles.brandCard, { width: cardWidth, height: cardHeight }]}>
                <Image source={src} style={[styles.brandImage, { height: cardHeight - 20 }]} resizeMode="contain" />
              </View>
            ))}
          </Animated.View>
        </TouchableWithoutFeedback>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    backgroundColor: '#e85b5b',
    paddingVertical: 12,
  },
  innerWrap: {
    overflow: 'hidden',
  },
  track: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandCard: {
    backgroundColor: '#fff',
    marginHorizontal: 8,
    padding: 10,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  brandImage: {
    width: '100%',
    // height controlled dynamically so we keep aspect and spacing
  },
});

export default ScrollingSectionNative;
