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
import { useTranslation } from 'react-i18next';

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

  const CARD_WIDTH = 180; // large card to match design
  const GAP = 12;
  const ITEM_TOTAL = CARD_WIDTH + GAP;
  const scrollDistance = ITEM_TOTAL; // scroll 1 card at a time
  const CONTAINER_WIDTH = CARD_WIDTH * 2 + GAP;
  const MAX_SCROLL = Math.max(0, products.length * ITEM_TOTAL - CONTAINER_WIDTH);
  const { t } = useTranslation();

  const scrollBy = (distance: number) => {
    if (!scrollRef.current) return;
    // Compute aligned position so we always land on item boundaries (prevents leftover padding)
    const nextX = scrollX + distance;
    let alignedX = Math.max(0, Math.round(nextX / ITEM_TOTAL) * ITEM_TOTAL);
    alignedX = Math.min(alignedX, MAX_SCROLL);
    scrollRef.current.scrollTo({ x: alignedX, animated: true });
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
        <Text style={styles.title}>{t('home.bestSelling')}</Text>

        <View style={styles.sliderWrapper}>
          <TouchableOpacity
            onPress={() => scrollBy(-scrollDistance)}
            style={[styles.arrowButton, styles.leftArrow]}
            accessibilityLabel="Scroll left"
          >
            <Text style={styles.arrowText}>{'<'}</Text>
          </TouchableOpacity>

          <View style={[styles.cardContainer, { width: CONTAINER_WIDTH }]}> 
            <ScrollView
              horizontal
              ref={scrollRef}
              onScroll={onScroll}
              scrollEventThrottle={16}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={[styles.scrollContent, { paddingRight: 16 }]}
              snapToInterval={ITEM_TOTAL} // snap by single item to keep alignment
              decelerationRate="fast"
              snapToAlignment="start"
            >
            {products.map((item, index) => (
              <TouchableOpacity
              key={index}
              style={[styles.card, { width: CARD_WIDTH, marginRight: GAP }]}
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
                  <View style={styles.vendorRow}>
                    <Text style={styles.vendor}>{item.vendor}</Text>
                    <View style={styles.starsRow}>
                      {Array.from({length: 5}).map((_, i) => (
                        <Text key={i} style={styles.star}>★</Text>
                      ))}
                    </View>
                  </View>

                  <Text style={styles.titleCard}>{item.title}</Text>

                  <View style={styles.cardFooter}>
                    <Text style={styles.price}>
                      <Text style={styles.currency}>Rs</Text>
                      <Text style={styles.amount}> {item.price}</Text>
                    </Text>
                    <View style={styles.plusBtn}>
                      <Text style={styles.plusText}>+</Text>
                    </View>
                  </View>
                </View>
            </TouchableOpacity>
            ))}
          </ScrollView>
          </View>
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
            <Text style={styles.viewAllText}>{t('home.viewAll')}</Text>
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
  cardContainer: {
    width: 340, // fallback width; actual width is set inline via CONTAINER_WIDTH
    alignSelf: 'center',
    overflow: 'visible',

  },
  scrollContent: {
    paddingVertical: 8,
    paddingLeft: 4, // reduced left padding
    paddingRight: 8,
    alignItems: 'center',
  },
  card: {
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
    height: 150,
    backgroundColor: '#efaaac',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: 220,
    resizeMode: 'cover',
    transform: [{ translateY: 30   }],
  },
  cardBody: {
    padding: 8,
    paddingBottom: 8,
    position: 'relative',
  },
  vendorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  vendor: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  titleCard: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
    color: '#0B2540',
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    color: '#F6B76F',
    marginLeft: 2,
    fontSize: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 8,
  },
  price: {
    marginRight: 12,
    marginTop:-5,
    color: '#0B2540',
  },
  currency: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  amount: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000000',
  },
  plusBtn: {
    position: 'absolute',
    right: 12,
    bottom: -10,
    width: 30,
    height: 30,
    top: -15,
    borderRadius: 22,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 4,
  },
  plusText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 20,
  },
  arrowButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 6,
    position: 'absolute',
    zIndex: 5,
  },
  leftArrow: {
    left: -24,
    top: '50%',
    transform: [{ translateY: -24 }],
  },
  rightArrow: {
    right: -24,
    top: '50%',
    transform: [{ translateY: -24 }],
  },
  
  arrowText: {
    fontSize: 20,
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
    top: -40,
    right: -120,
    width: 240,
    height: 200,
  },
  bgBottomLeft: {
    bottom: -80,
    left: -110,
    width: 260,
    height: 260,
    transform: [{ rotate: '-10deg' }],
  },
});

export default BestSelling;
