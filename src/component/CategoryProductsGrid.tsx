import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  useWindowDimensions,
  TouchableOpacity,
} from 'react-native';

// import images locally so this file owns its visual assets
const w_h1 = require('../../assets/w-h1.png');
const w_h2 = require('../../assets/w-h2.png');
const w_h3 = require('../../assets/w-h3.png');
const w_h4 = require('../../assets/w-h4.png');
const s_h1 = require('../../assets/s-h1.png');
const s_h2 = require('../../assets/s-h2.png');
const s_h3 = require('../../assets/s-h3.png');
const s_h4 = require('../../assets/s-h4.png');

interface ProductItem {
  id: number;
  image: any;
  title: string;
  price: string;
  badge?: string; // e.g. "Hot"
  badgeColor?: string; // optional color for badge
} 

const ProductCard: React.FC<{ item: ProductItem; cardWidth: number }> = ({ item, cardWidth }) => {
  const imageHeight = Math.round(cardWidth * 1.18);

  return (
    <View style={[styles.card, { width: cardWidth }]}>      
      <View style={styles.imageContainer}>
        <Image source={item.image} style={[styles.image, { height: imageHeight }]} />

        {/* Badge (top-left) */}
        {item.badge ? (
          <View style={[styles.badge, { backgroundColor: item.badgeColor || '#FF3F88' }]}>
            <Text style={styles.badgeText}>{item.badge}</Text>
          </View>
        ) : null}

        {/* Heart icon (top-right) */}
        <TouchableOpacity style={styles.heart} activeOpacity={0.75} onPress={() => console.log('fave', item.id)}>
          <Text style={styles.heartText}>♡</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.meta}>
        <Text style={styles.productTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.price}>{item.price}</Text>
      </View>
    </View>
  );
};

const CategoryProductsGrid: React.FC<{ title: string; items: ProductItem[] }> = ({ title, items }) => {
  const { width } = useWindowDimensions();
  const padding = 16;
  const columns = 2;
  const gap = 12;
  const cardWidth = Math.floor((width - padding * 2 - gap * (columns - 1)) / columns);

  return (
    <View style={styles.section}>
      <View style={styles.headerRow}>
        <Text style={styles.heading}>{title}</Text>
        <TouchableOpacity activeOpacity={0.7} onPress={() => console.log('see more', title)} style={styles.seeMoreBtn}>
          <Text style={styles.seeMore}>See More</Text>
          <Text style={styles.seeMoreArrow}>›</Text>
        </TouchableOpacity>
      </View> 

      <FlatList
        data={items}
        keyExtractor={(i) => String(i.id)}
        numColumns={columns}
        columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 14 }}
        renderItem={({ item }) => <ProductCard item={item} cardWidth={cardWidth} />}
        scrollEnabled={false}
        contentContainerStyle={{ paddingHorizontal: padding }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginTop: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  heading: {
    fontSize: 18,
    fontWeight: '800',
  },
  seeMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  seeMoreArrow: {
    color: '#E05659',
    fontSize: 22,
    marginLeft: 6,
    fontWeight: '500',
    lineHeight: 18,
  },
  seeMore: {
    color: '#E05659',
    fontSize: 12,
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    // subtle shadow
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#f6f6f6',
  },
  image: {
    width: '100%',
    resizeMode: 'cover',
  },
  badge: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    zIndex: 2,
  },
  badgeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  heart: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#fff',
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F2F2F2',
  },
  heartText: {
    color: '#FF5A78',
    fontSize: 14,
    fontWeight: '700',
  },
  meta: {
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  productTitle: {
    fontWeight: '700',
    fontSize: 13,
    marginBottom: 6,
    color: '#111827',
  },
  price: {
    color: '#111827',
    fontWeight: '800',
  },
});


// A small wrapper that renders the two example sections using local assets
export const CategorySections: React.FC = () => {
  const defaultItemsSaree: ProductItem[] = [
    { id: 1, image: w_h1, title: 'Rani Pink Banarasi Silk Saree', price: 'Rs 500', badge: 'Hot', badgeColor: '#FF5A8A' },
    { id: 2, image: w_h2, title: 'Sunset Orange Cotton Silk Saree', price: 'Rs 740', badge: 'Hot', badgeColor: '#FFD166' },
    { id: 3, image: w_h3, title: 'Rani Pink Banarasi Silk Saree', price: 'Rs 500' },
    { id: 4, image: w_h4, title: 'Sunset Orange Cotton Silk Saree', price: 'Rs 740' },
  ];

  const defaultItemsGhagra: ProductItem[] = [
    { id: 11, image: s_h1, title: 'Rani Pink Banarasi Silk Saree', price: 'Rs 500' },
    { id: 12, image: s_h2, title: 'Sunset Orange Cotton Silk Saree', price: 'Rs 740' },
    { id: 13, image: s_h3, title: 'Rani Pink Banarasi Silk Saree', price: 'Rs 500', badge: 'Hot', badgeColor: '#3CCB8C' },
    { id: 14, image: s_h4, title: 'Sunset Orange Cotton Silk Saree', price: 'Rs 740' },
  ];

  return (
    <>
      <CategoryProductsGrid title="Saree / Ethnic Dress" items={defaultItemsSaree} />
      <CategoryProductsGrid title="Ghagra" items={defaultItemsGhagra} />
    </>
  );
};

export default CategoryProductsGrid;
