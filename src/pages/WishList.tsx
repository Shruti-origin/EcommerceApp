import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  ScrollView,
  Pressable,
} from 'react-native';
import { Heart } from 'lucide-react-native';
import { guestWishlistUtils } from '../utils/wishlistUtils';
import { guestCartUtils } from '../utils/cartUtils';

const { width } = Dimensions.get('window');

const products = [
  { id: '1', title: 'Rani Pink Banarasi Silk Saree', price: 500, image: require('../../assets/w-h1.png') },
  { id: '2', title: 'Sunset Orange Cotton Silk Saree', price: 740, image: require('../../assets/w-h2.png') },
  { id: '3', title: 'Rani Pink Banarasi Silk Saree', price: 500, image: require('../../assets/w-h3.png') },
  { id: '4', title: 'Sunset Orange Cotton Silk Saree', price: 740, image: require('../../assets/w-h4.png') },
];

const CARD_MARGIN = 8;
const NUM_COLUMNS = 2;
const CARD_WIDTH = Math.floor((width - (CARD_MARGIN * (NUM_COLUMNS + 1))) / NUM_COLUMNS);

const WishList = ({ navigate, goBack }: { navigate?: (name: string, params?: any) => void; goBack?: () => void }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    try {
      setLoading(true);
      const wishlist = await guestWishlistUtils.getWishlist();
      setItems(wishlist.items || []);
    } catch (error) {
      console.error('Failed to load wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (id: string) => {
    await guestWishlistUtils.removeItem(id);
    await loadWishlist();
  };

  const handleAddToCart = async (product: any) => {
    try {
      // Add to guest cart (default quantity 1)
      await guestCartUtils.addItem(product, 1);

      // Keep the item in the wishlist (do not remove)
      // Provide a confirmation and allow user to view cart
      Alert.alert('Added to cart', 'Product has been added to your cart.', [
        { text: 'Continue', style: 'cancel' },
        { text: 'View cart', onPress: () => navigate?.('Cart') }
      ]);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      Alert.alert('Error', 'Could not add item to cart');
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.cardAlt}>
      <Pressable style={styles.imageContainer} onPress={() => navigate?.('ProductDetails', { product: item })}>
        <Image source={typeof item.image === 'string' ? { uri: item.image } : item.image} style={styles.productImageAlt} />
        <View style={styles.priceBadge}>
          <Text style={styles.priceBadgeText}>₹{item.price}</Text>
        </View>
        <TouchableOpacity style={styles.heartBadgeAlt} onPress={() => handleRemoveItem(item.id)}>
          <Heart color="#EF4444" size={18} fill="#EF4444" />
        </TouchableOpacity>
      </Pressable>

      <View style={styles.cardBodyAlt}>
        <Text style={styles.titleAlt} numberOfLines={2}>{item.title}</Text>
        <View style={styles.rowBetween}>
          <Text style={styles.priceAlt}>₹{item.price}</Text>
          <TouchableOpacity style={styles.viewBtn} onPress={() => navigate?.('ProductDetails', { product: item })}>
            <Text style={styles.viewBtnText}>View</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.addToCartBtnAlt} activeOpacity={0.9} onPress={() => handleAddToCart(item)}>
          <Text style={styles.addToCartTextAlt}>Add to cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#EF4444" />
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <View style={styles.fancyHeader}>
            <Text style={styles.fancyTitle}>Saved for later</Text>
            <Text style={styles.fancySubtitle}>Hand-picked items you love</Text>
          </View>

          <FlatList
            data={items}
            keyExtractor={(i) => i.id}
            numColumns={1}
            contentContainerStyle={styles.listAlt}
            showsVerticalScrollIndicator={false}
            renderItem={renderItem}
            ListEmptyComponent={() => (
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyText}>Your wishlist is empty.</Text>
              </View>
            )}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#10B981',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  list: {
    padding: CARD_MARGIN,
  },
  listAlt: { paddingVertical: 12, paddingHorizontal: 12 },
  fancyHeader: { paddingHorizontal: 12, paddingTop: 18, paddingBottom: 8, backgroundColor: '#fff' },
  fancyTitle: { fontSize: 20, fontWeight: '800', color: '#111827' },
  fancySubtitle: { fontSize: 12, color: '#6B7280', marginTop: 4, marginBottom: 10 },


  /* Alt card */
  cardAlt: { backgroundColor: '#fff', marginBottom: 12, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#F1F5F9', flexDirection: 'row' },
  imageContainer: { width: 140, height: 140, backgroundColor: '#F3F4F6', position: 'relative' },
  productImageAlt: { width: '100%', height: '100%', resizeMode: 'cover' },
  priceBadge: { position: 'absolute', top: 10, left: 10, backgroundColor: '#111827', paddingHorizontal: 8, paddingVertical: 6, borderRadius: 8 },
  priceBadgeText: { color: '#fff', fontWeight: '700' },
  heartBadgeAlt: { position: 'absolute', top: 10, right: 10, backgroundColor: '#fff', width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 1 }, shadowRadius: 6, elevation: 4 },
  cardBodyAlt: { flex: 1, padding: 12, justifyContent: 'center' },
  titleAlt: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 6 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  priceAlt: { fontSize: 16, fontWeight: '700', color: '#111827' },
  viewBtn: { backgroundColor: '#F1F5F9', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  viewBtnText: { color: '#475569', fontWeight: '700' },
  addToCartBtnAlt: { marginTop: 10, backgroundColor: '#e0555a', paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  addToCartTextAlt: { color: '#fff', fontWeight: '800' },
  card: {
    width: CARD_WIDTH,
    marginLeft: CARD_MARGIN,
    marginBottom: CARD_MARGIN * 2,
    backgroundColor: '#fff',
    borderRadius: 6,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
  },
  imageWrap: {
    height: CARD_WIDTH,
    backgroundColor: '#f3f4f6',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heartWrap: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  heartBadge: {
    backgroundColor: '#fff',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 4,
  },
  cardBody: {
    padding: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
  },
  emptyWrap: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    color: '#6b7280',
  },
  addToCartBtn: {
    marginTop: 8,
    backgroundColor: '#e0555a',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  addToCartText: {
    color: '#fff',
    fontWeight: '700'
  }
});

export default WishList;
