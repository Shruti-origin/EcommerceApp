import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Heart, ArrowUpDown } from 'lucide-react-native';


interface PrintingProduct {
  id: number;
  image: any;
  title: string;
  price: string;
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

  const [favorites, setFavorites] = useState<Record<number, boolean>>({});
  const toggleFavorite = (id: number) => setFavorites(prev => ({ ...prev, [id]: !prev[id] }));

  const printingProducts: PrintingProduct[] = [
    { id: 1, image: require('../../assets/s-h1.png'), title: 'Zone Sweatshirt', price: '$25.99' },
    { id: 2, image: require('../../assets/s-h2.png'), title: "Zoo Men's t-shirt", price: '$15.99' },
    { id: 3, image: require('../../assets/s-h3.png'), title: 'Toddler T-shirt', price: '$12.99' },
    { id: 4, image: require('../../assets/s-h4.png'), title: 'Fine Jersey Tee', price: '$18.99' },
   
  ];

  const renderItem = ({ item }: { item: PrintingProduct }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={() => { console.log('[OffsetPrinting] card press', item); navigate?.('ProductDetails', { product: item }); }}>
      <View style={styles.imageWrap}>
        <Image source={item.image} style={styles.productImage} />
        <TouchableOpacity style={styles.favBtn} onPress={() => toggleFavorite(item.id)} accessibilityLabel="Toggle favorite">
          <Heart size={16} color={favorites[item.id] ? '#ef4444' : '#111827'} />
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

        <FlatList
          data={printingProducts}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={numColumns}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
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
  },
  row: {
    flex:1,
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  card: {
    flex: 1,
    marginHorizontal: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
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

