import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { Heart, ArrowUpDown } from 'lucide-react-native';
import { productService } from '../services/api';
import { guestWishlistUtils } from '../utils/wishlistUtils';


interface PrintingProduct {
  id: string;
  image: any;
  title: string;
  price: string;
  images?: string[];
}

const GradientHeading: React.FC<{children: React.ReactNode}> = ({ children }) => {
  // Use dynamic require so app doesn't crash if packages are not installed;
  // it will gracefully fall back to plain text.
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const MaskedView = require('@react-native-masked-view/masked-view').default;
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const LinearGradient = require('react-native-linear-gradient').default;

    return (
      <MaskedView
        maskElement={
          <Text style={[styles.heading, { backgroundColor: 'transparent' }]}>
            {children}
          </Text>
        }
      >
        <LinearGradient colors={["#E84F30", "#75BD4B"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
          <Text style={[styles.heading, { opacity: 0 }]}>{children}</Text>
        </LinearGradient>
      </MaskedView>
    );
  } catch (e) {
    return <Text style={styles.heading as any}>{children}</Text>;
  }
};

const OffsetPrinting: React.FC<{ navigate?: (screen: string, params?: any) => void }> = ({ navigate }) => {
  const screenWidth = Dimensions.get('window').width;
  const numColumns = screenWidth >= 900 ? 4 : screenWidth >= 600 ? 3 : 2;

  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [printingProducts, setPrintingProducts] = useState<PrintingProduct[]>([]);
  const [loading, setLoading] = useState(true);
  
  const toggleFavorite = (id: string) => setFavorites(prev => ({ ...prev, [id]: !prev[id] }));

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        // First try the featured endpoint
        let products: any[] = [];
        try {
          const featuredRes = await productService.getFeatured(8);
          products = featuredRes.data || featuredRes || [];
          if (!Array.isArray(products) || products.length === 0) {
            throw new Error('No featured products');
          }
          console.log('[OffsetPrinting] fetched featured products');
        } catch (featErr) {
          console.warn('[OffsetPrinting] featured endpoint failed, trying products list', featErr);
          // Fallback: try general products list (public)
          try {
            const allRes = await productService.getProducts({ limit: 8 });
            products = allRes.data || allRes || [];
            console.log('[OffsetPrinting] fetched products from getProducts');
          } catch (allErr) {
            console.warn('[OffsetPrinting] getProducts fallback failed, will use static fallback', allErr);
            products = [];
          }
        }

        // Map API products to component format
        const mappedProducts: PrintingProduct[] = Array.isArray(products)
          ? products.map((p: any) => {
              const productImage = p.images && p.images.length > 0
                ? p.images[0]
                : (p.variants && p.variants.length > 0 && p.variants[0].images && p.variants[0].images.length > 0
                    ? p.variants[0].images[0]
                    : null);

              return {
                id: String(p.id),
                image: productImage
                  ? { uri: `https://backend.originplatforms.co${productImage}` }
                  : require('../../assets/s-h1.png'),
                title: p.name || 'Product',
                price: p.price ? `Rs ${p.price}` : 'Rs 0',
                images: p.images,
              };
            })
          : [];

        if (mappedProducts.length === 0) {
          // final static fallback
          setPrintingProducts([
            { id: '1', image: require('../../assets/s-h1.png'), title: 'Zone Sweatshirt', price: '$25.99' },
            { id: '2', image: require('../../assets/s-h2.png'), title: "Zoo Men's t-shirt", price: '$15.99' },
            { id: '3', image: require('../../assets/s-h3.png'), title: 'Toddler T-shirt', price: '$12.99' },
            { id: '4', image: require('../../assets/s-h4.png'), title: 'Fine Jersey Tee', price: '$18.99' },
          ]);
        } else {
          setPrintingProducts(mappedProducts.slice(0, 8)); // Show first 8 products
        }

      } catch (error) {
        console.error('Failed to fetch products:', error);
        // Fallback to static products if API fails
        setPrintingProducts([
          { id: '1', image: require('../../assets/s-h1.png'), title: 'Zone Sweatshirt', price: '$25.99' },
          { id: '2', image: require('../../assets/s-h2.png'), title: "Zoo Men's t-shirt", price: '$15.99' },
          { id: '3', image: require('../../assets/s-h3.png'), title: 'Toddler T-shirt', price: '$12.99' },
          { id: '4', image: require('../../assets/s-h4.png'), title: 'Fine Jersey Tee', price: '$18.99' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Layout gap and item width (4px gap between columns; leftmost/rightmost touch container edges)
  const GAP = 4; // requested 4px gap between left and right card
  const totalGap = (numColumns - 1) * GAP;
  // Use full screen width for item sizing so leftmost/rightmost touch the screen edges
  const itemWidth = Math.floor((screenWidth - totalGap) / numColumns);

  const renderItem = ({ item }: { item: PrintingProduct }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={() => { console.log('[OffsetPrinting] card press', item); navigate?.('ProductDetails', { product: item }); }}>
      <View style={styles.imageWrap}>
        <Image source={item.image} style={styles.productImage} />
        <TouchableOpacity style={styles.favBtn} onPress={async () => {
          const isInWishlist = await guestWishlistUtils.isInWishlist(item.id);
          if (isInWishlist) {
            await guestWishlistUtils.removeItem(item.id);
            toggleFavorite(item.id);
          } else {
            await guestWishlistUtils.addItem({
              id: item.id,
              title: item.title,
              price: item.price,
              image: item.image,
            });
            toggleFavorite(item.id);
          }
        }} accessibilityLabel="Toggle wishlist">
          <Heart size={16} color={favorites[item.id] ? '#ef4444' : '#111827'} fill={favorites[item.id] ? '#ef4444' : 'none'} />
        </TouchableOpacity>
      </View>

      <View style={styles.cardBodyLeft}>
        <Text style={styles.productTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.price}>{item.price}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.section}>
      <View style={styles.container}>
        <View style={styles.header}>
          <GradientHeading>HIGH-QUALITY OFFSET PRINTING</GradientHeading>
          <View style={styles.headerRow}>
            <Text style={styles.subheading}>All Featured</Text>
            <View style={styles.toolbar}>
              <TouchableOpacity style={styles.toolBtn} onPress={() => console.log('sort')}>
                <View style={styles.toolBtnContent}>
                  <Text style={styles.toolText}>Sort</Text>
                  <View style={styles.sortIcons}>
                    <Heart size={14} color="#483028" />
                  </View>
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.toolBtn} onPress={() => console.log('filter')}>
                <View style={styles.toolBtnContent}>
                  <Text style={styles.toolText}>Filter</Text>
                  <ArrowUpDown size={16} color="#483028" style={{ marginLeft: 8 }} />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {loading ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#E84F30" />
          </View>
        ) : (
          <View style={[styles.listContent, { flexDirection: 'row', flexWrap: 'wrap' }]}>
            {printingProducts.map((item, index) => {
              const col = index % numColumns;
              // leftmost card (col===0) should touch left container edge (no left margin)
              // rightmost card (col===numColumns-1) should touch right container edge (no right margin)
              // middle columns get right margin = GAP to create 4px separation
              const wrapperStyle = {
                width: itemWidth,
                marginBottom: 12,
                marginRight: col === numColumns - 1 ? 0 : GAP,
              };
              return (
                <View key={item.id} style={wrapperStyle}>
                  {renderItem({ item })}
                </View>
              );
            })}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    flex:1,
    backgroundColor: '#fff',
    paddingVertical: 24,
  },
  container: {
    // maxWidth: 1200,
    alignSelf: 'center',
    paddingHorizontal: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 12,
  },
  heading: {
    marginTop: 0,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '600',
    fontStyle: 'normal',
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  subheading: {
    fontFamily: 'Roboto',
    fontWeight: 'bold',
    fontSize: 18,
    lineHeight: 22,
    letterSpacing: 0,
    textAlign: 'left',
    backgroundColor: '#ffffff',
    color: '#483028',
    marginTop: 0,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 8,
  },
  small: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  listContent: {
    paddingVertical: 8,
    // shift inner list outwards so the first and last items touch container edges
    marginHorizontal: -16,
  },
  row: {
    flex:1,
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  card: {
    flex: 1,
    marginHorizontal: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,


    
  },
  imageWrap: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  
  },
  cardBody: {
    padding: 10,
    alignItems: 'center',
  },
  cardBodyLeft: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: 'flex-start',
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 6,
  },
  favBtn: {
    position: 'absolute',
    right: 8,
    top: 8,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  toolBtn: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#fff',
    marginLeft: 8,
  },
  toolBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortIcons: {
    marginLeft: 8,
    justifyContent: 'space-between',
    height: 16,
  },
  toolText: {
    fontWeight: '600',
    color: '#483028',
  },
});

export default OffsetPrinting;

