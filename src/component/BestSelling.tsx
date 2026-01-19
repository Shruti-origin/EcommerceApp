import React, {useRef, useState} from 'react';
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
} from 'react-native';

interface Product {
  vendor: string;
  title: string;
  price: number;
  image: any; // require(...) or uri
}

const BestSelling: React.FC<{ navigate?: (screen: string, params?: any) => void }> = ({ navigate }) => {
  const screenWidth = Dimensions.get('window').width;
  const scrollRef = useRef<ScrollView | null>(null);
  const [scrollX, setScrollX] = useState(0);

  const products: Product[] = [
    {
      vendor: 'By Rock',
      title: 'Saree',
      price: 300,
      image: require('../../assets/w-h1.png'),
    },
    {
      vendor: 'By Rock',
      title: 'Saree',
      price: 250,
      image: require('../../assets/w-h2.png'),
    },
    {
      vendor: 'By Rock',
      title: 'Saree',
      price: 350,
      image: require('../../assets/w-h3.png'),
    },
    {
      vendor: 'Girl Category',
      title: 'Festive Wear',
      price: 500,
      image: require('../../assets/w-h4.png'),
    },
  ];

  const cardWidth = 220; // matches web maxWidth
  const gap = 16;
  const scrollDistance = Math.round((screenWidth ?? 300) * 0.8);

  const scrollBy = (distance: number) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({x: scrollX + distance, animated: true});
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setScrollX(e.nativeEvent.contentOffset.x);
  };

  return (
    <View style={styles.section}>
      {/* Decorative background images (optional) */}
      <View pointerEvents="none" style={[styles.bgImage, styles.bgTopRight]}>
        <Image
          source={require('../../assets/bg-home.png')}
          style={{ width: '100%', height: '100%' }}
          resizeMode="contain"
        />
      </View>

      <View pointerEvents="none" style={[styles.bgImage, styles.bgBottomLeft]}>
        <Image
          source={require('../../assets/bg-home.png')}
          style={{ width: '100%', height: '100%', transform: [{ scaleX: -1 }] }}
          resizeMode="contain"
        />
      </View>

      <View style={styles.inner}>
        <Text style={styles.title}>Best Selling Product</Text>

        <View style={styles.sliderWrapper}>
          <TouchableOpacity
            onPress={() => scrollBy(-scrollDistance)}
            style={[styles.arrowButton, styles.leftArrow]}
            accessibilityLabel="Scroll left"
          >
            <Text style={styles.arrowText}>{'<'}</Text>
          </TouchableOpacity>

          <ScrollView
            horizontal
            ref={scrollRef}
            onScroll={onScroll}
            scrollEventThrottle={16}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {products.map((item, index) => (
              <TouchableOpacity
              key={index}
              style={[styles.card, {marginRight: gap}]}
              activeOpacity={0.9}
              onPress={() => {
                console.log('[BestSelling] card press', item);
                navigate?.('ProductDetails', { product: item });
              }}
            >
                <View style={styles.imageWrap}>
                  <Image source={item.image} style={styles.productImage} />
                </View>

                <View style={styles.cardBody}>
                  <Text style={styles.vendor}>{item.vendor}</Text>
                  <Text style={styles.titleCard}>{item.title}</Text>

                  <View style={styles.starsRow}>
                    {Array.from({length: 5}).map((_, i) => (
                      <Text key={i} style={styles.star}>★</Text>
                    ))}
                  </View>

                  <View style={styles.cardFooter}>
                    <Text style={styles.price}>Rs {item.price}</Text>
                    <View style={styles.plusBtn}>
                      <Text style={styles.plusText}>+</Text>
                    </View>
                  </View>
                </View>
            </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity
            onPress={() => scrollBy(scrollDistance)}
            style={[styles.arrowButton, styles.rightArrow]}
            accessibilityLabel="Scroll right"
          >
            <Text style={styles.arrowText}>{'>'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.viewAllWrap}>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View All →</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    backgroundColor: '#E84F300A',
    paddingVertical: 24,
    position: 'relative',
    overflow: 'hidden',
    marginTop: 12,
  },
  inner: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 16,
    zIndex: 2,
  },
  title: {
    textAlign: 'center',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 16,
  },
  sliderWrapper: {
    position: 'relative',
    alignItems: 'center',
  },
  scrollContent: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  card: {
    width: 170,
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  imageWrap: {
    height: 120,
    backgroundColor: '#efaaac',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: 200, // double container height so we can shift it up to show the top half
    resizeMode: 'cover',
    transform: [{ translateY: 40 }],
  },
  cardBody: {
    padding: 10,
  },
  vendor: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  titleCard: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  starsRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  star: {
    color: '#F6B76F',
    marginRight: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontWeight: '700',
    fontSize: 14,
  },
  plusBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  arrowButton: {
    width: 28,
    height: 28,
    borderRadius: 15,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 3,
    position: 'absolute',
    zIndex: 3,
  },
  leftArrow: {
    left: 8,
    top: '50%',
    transform: [{ translateY: -14 }],
  },
  rightArrow: {
    right: 8,
    top: '50%',
    transform: [{ translateY: -14 }],
  },
  
  arrowText: {
    fontSize: 16,
    fontWeight: '700',
  },
  viewAllWrap: {
    marginTop: 16,
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  bgImage: {
    position: 'absolute',
    opacity: 0.5,
    zIndex: 0,
  },
  bgTopRight: {
    top: 0,
    right: -40,
    width: 220,
    height: 180,
  },
  bgBottomLeft: {
    bottom: -20,
    left: -80,
    width: 260,
    height: 260,
  },
});

export default BestSelling;
