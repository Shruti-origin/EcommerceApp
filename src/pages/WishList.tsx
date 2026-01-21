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
} from 'react-native';
import { Heart } from 'lucide-react-native';
import { guestWishlistUtils } from '../utils/wishlistUtils';

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

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={() => navigate?.('ProductDetails', { product: item })}>
      <View style={styles.imageWrap}>
        <Image source={typeof item.image === 'string' ? { uri: item.image } : item.image} style={styles.productImage} />
        <View style={styles.heartWrap}>
          <TouchableOpacity style={styles.heartBadge} onPress={() => handleRemoveItem(item.id)}>
            <Heart color="#EF4444" size={16} fill="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.price}>{item.price}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#EF4444" />
        </View>
      ) : (
        <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        numColumns={NUM_COLUMNS}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={renderItem}
        ListEmptyComponent={() => (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>Your wishlist is empty.</Text>
          </View>
        )}
      />
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
});

export default WishList;
