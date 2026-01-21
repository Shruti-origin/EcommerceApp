import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ImageBackground,
} from 'react-native';

interface TestimonialItem {
  id: number;
  name: string;
  role: string;
  image: any;
  comment: string;
}

const TestimonialNative: React.FC = () => {
  const screenWidth = Dimensions.get('window').width;
  const isLargeScreen = screenWidth >= 1024;
  const isMediumScreen = screenWidth >= 768;
  
  const CARD_WIDTH = isLargeScreen ? 400 : isMediumScreen ? 360 : 320;
  const GAP = 32;
  const TOTAL_WIDTH = CARD_WIDTH + GAP;

  const testimonials: TestimonialItem[] = [
    {
      id: 1,
      name: 'Priya Sharma',
      role: 'Director',
      image: require('../../assets/w-h1.png'),
      comment:
        'Great quality products – Flags, programs for exceptional capacities, birthday, and occasion welcome are largely still mainstream on paper.',
    },
    {
      id: 2,
      name: 'Cristian L.',
      role: 'Manager',
      image: require('../../assets/w-h2.png'),
      comment:
        'Best services ever – Flags, programs for exceptional capacities, birthday, and are largely still mainstream on paper occasion welcome.',
    },
    {
      id: 3,
      name: 'Leonel R.',
      role: 'Designer',
      image: require('../../assets/w-h3.png'),
      comment:
        'Top notch support – Flags, programs for birthday, and occasion welcome are largely still mainstream on paper exceptional capacities.',
    },
  ];

  const scrollRef = useRef<ScrollView>(null);
  const [index, setIndex] = useState<number>(0);

  const scrollLeft = () => {
    const nextIndex = Math.max(0, index - 1);
    setIndex(nextIndex);
    scrollRef.current?.scrollTo({ x: nextIndex * TOTAL_WIDTH, animated: true });
  };

  const scrollRight = () => {
    const nextIndex = Math.min(testimonials.length - 1, index + 1);
    setIndex(nextIndex);
    scrollRef.current?.scrollTo({ x: nextIndex * TOTAL_WIDTH, animated: true });
  };

  const onMomentumScrollEnd = (
    e: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    const x = e.nativeEvent.contentOffset.x;
    const newIndex = Math.round(x / TOTAL_WIDTH);
    setIndex(newIndex);
  };

  return (
    <ImageBackground
      source={require('../../assets/test-bg.png')}
      style={[styles.section, { width: '100%' }]}
      resizeMode="cover"
      imageStyle={{ resizeMode: 'cover', opacity: 1 }}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>What People Are Saying</Text>
        <Text style={styles.subtitle}>
          We provide support for more than 15K+ Businesses.
        </Text>
      </View>

      {/* Carousel Wrapper */}
      <View style={styles.carouselWrap}>
        {/* Left Arrow - Mobile only */}
        {!isLargeScreen && (
          <TouchableOpacity style={styles.arrowLeft} onPress={scrollLeft}>
            <Text style={styles.arrowText}>‹</Text>
          </TouchableOpacity>
        )}

        {/* Right Arrow - Mobile only */}
        {!isLargeScreen && (
          <TouchableOpacity style={styles.arrowRight} onPress={scrollRight}>
            <Text style={styles.arrowText}>›</Text>
          </TouchableOpacity>
        )}

        {/* Cards */}
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={TOTAL_WIDTH}
          decelerationRate="fast"
          onMomentumScrollEnd={onMomentumScrollEnd}
          contentContainerStyle={{
            paddingHorizontal: 28,
          }}
        >
          {testimonials.map((item) => (
            <View
              key={item.id}
              style={[styles.card, { width: CARD_WIDTH, marginRight: GAP }]}
            >
              {/* Avatar and Name */}
              <View style={styles.avatarRow}>
                <View style={styles.avatarWrap}>
                  <Image source={item.image} style={styles.avatar} />
                </View>
                <View style={styles.nameBlock}>
                  <Text style={styles.name}>
                    {item.name}{' '}
                    <Text style={styles.roleInline}>{item.role}</Text>
                  </Text>
                </View>
              </View>

              {/* Comment */}
              <Text style={styles.comment}>"{item.comment}"</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Dots Indicator - Desktop only */}
      {isLargeScreen && (
        <View style={styles.dots}>
          <View style={[styles.dot, styles.activeDot]} />
          <View style={styles.dot} />
        </View>
      )}
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  section: {
    marginTop: -60,
    // ensure the background has space to render
    minHeight: 420,
    paddingVertical: 80,
    // backgroundColor: '#FFF5F5',
    overflow: 'hidden',
  },
  header: {
    alignItems: 'center',
    marginBottom: 56,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  subtitle: {
    color: '#6B7280',
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
  },
  carouselWrap: {
    position: 'relative',
    maxWidth: 1152,
    alignSelf: 'center',
    width: '100%',
  },
  arrowLeft: {
    position: 'absolute',
    left: 8,
    top: '50%',
    zIndex: 20,
    backgroundColor: '#fff',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    transform: [{ translateY: -18 }],
  },
  arrowRight: {
    position: 'absolute',
    right: 8,
    top: '50%',
    zIndex: 20,
    backgroundColor: '#fff',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    transform: [{ translateY: -18 }],
  },
  arrowText: {
    color: '#111827',
    fontWeight: '400',
    fontSize: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    marginTop: 20,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -40,
    marginBottom: 16,
  },
  avatarWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    marginRight: 16,
    borderWidth: 4,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  nameBlock: {
    flex: 1,
  },
  name: {
    fontWeight: '600',
    fontSize: 16,
    color: '#111827',
  },
  roleInline: {
    color: '#9CA3AF',
    fontWeight: '400',
    fontSize: 14,
  },
  comment: {
    color: '#4B5563',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 16,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 40,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
  },
  activeDot: {
    backgroundColor: '#111827',
  },
});

export default TestimonialNative;
