import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList, useWindowDimensions, Modal, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ArrowRight, ArrowUpDown, ChevronDown, Funnel, List, Calendar, Heart } from 'lucide-react-native';
import { guestWishlistUtils } from '../utils/wishlistUtils';

// Ghagra items copied from CategoryProductsGrid
const defaultItemsGhagra = [
  { id: 11, image: require('../../assets/ghagra1.png'), title: 'Rani Pink Banarasi Silk Saree', price: 'Rs 500', productId: 'ghagra1', brand: 'Traditional', description: 'Beautiful Banarasi Silk Saree' },
  { id: 12, image: require('../../assets/ghagra2.png'), title: 'Sunset Orange Cotton Silk Saree', price: 'Rs 740', productId: 'ghagra2', brand: 'Cotton Collection', description: 'Elegant Cotton Silk Saree' },
  { id: 13, image: require('../../assets/ghagra3.png'), title: 'Rani Pink Banarasi Silk Saree', price: 'Rs 500', badge: 'Hot', badgeColor: '#3CCB8C', productId: 'ghagra3', brand: 'Premium', description: 'Premium Banarasi Silk Saree' },
  { id: 14, image: require('../../assets/ghagra4.png'), title: 'Sunset Orange Cotton Silk Saree', price: 'Rs 740', productId: 'ghagra4', brand: 'Designer', description: 'Designer Cotton Silk Saree' },
];

const Deals = ({ navigate }: { navigate?: (screen: string, params?: any) => void }) => {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
//   const insets = useSafeAreaInsets();
  const padding = 0;
  const columns = 2;
  const gap = 2;
  const cardWidth = Math.floor((width - padding * 2 - gap * (columns - 1)) / columns);

  const [favorites, setFavorites] = useState<Record<number, boolean>>({});

  // Load wishlist on mount
  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    try {
      const wishlist = await guestWishlistUtils.getWishlist();
      const favMap: Record<number, boolean> = {};
      wishlist.items.forEach((item: any) => {
        favMap[item.id] = true;
      });
      setFavorites(favMap);
    } catch (error) {
      console.error('Failed to load wishlist:', error);
    }
  };

  const toggleFavorite = async (item: any) => {
    try {
      const isCurrentlyFavorite = favorites[item.id];
      
      if (isCurrentlyFavorite) {
        // Remove from wishlist
        await guestWishlistUtils.removeItem(String(item.id));
        setFavorites((prev) => ({ ...prev, [item.id]: false }));
      } else {
        // Add to wishlist
        const wishlistItem = {
          id: String(item.id),
          productId: item.productId || String(item.id),
          name: item.title,
          price: parseFloat(item.price.replace(/[^0-9.]/g, '')) || 0,
          image: item.image,
          brand: item.brand || 'Brand',
          description: item.description || item.title,
        };
        await guestWishlistUtils.addItem(wishlistItem);
        setFavorites((prev) => ({ ...prev, [item.id]: true }));
      }

      // Dispatch event to update wishlist page
      if (typeof globalThis !== 'undefined' && (globalThis as any).dispatchEvent) {
        try {
          const CE = (globalThis as any).CustomEvent;
          if (CE) {
            (globalThis as any).dispatchEvent(new CE('wishlistUpdated'));
          } else {
            (globalThis as any).dispatchEvent({ type: 'wishlistUpdated' });
          }
        } catch (e) {}
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  // Dropdown/modal states
  const [sortVisible, setSortVisible] = useState(false);
  const [categoryVisible, setCategoryVisible] = useState(false);
  const [ageVisible, setAgeVisible] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);

  // Selected values
  const [sortSelected, setSortSelected] = useState('Relevance');
  const [categoriesSelected, setCategoriesSelected] = useState<string[]>(['Saree', 'Lehenga Choli']);
  const [agesSelected, setAgesSelected] = useState<string[]>(['0-5 Yrs (Infants & Toddlers)']);

  // Products state (start with Ghagra items)
  const [products, setProducts] = useState(defaultItemsGhagra);


  return (
    <View style={{ flex: 1 }}>
<FlatList
        style={styles.container}
        data={products}
        keyExtractor={(i: any) => String(i.id)}
        numColumns={2}
        columnWrapperStyle={{ marginBottom: 14 }}
        renderItem={({ item, index }: { item: any; index: number }) => (
          <View style={[styles.card, { width: cardWidth, marginRight: index % 2 === 0 ? gap : 0 }]}>
            <View style={styles.imageContainer}>
              <Image source={item.image} style={[styles.image, { height: Math.round(cardWidth * 1.18) }]} />

              {item.badge ? (
                <View style={[styles.badge, { backgroundColor: item.badgeColor || '#FF3F88' }]}>
                  <Text style={styles.badgeText}>{item.badge}</Text>
                </View>
              ) : null}

              <TouchableOpacity style={styles.favBtn} onPress={() => toggleFavorite(item)} accessibilityLabel="Toggle favorite">
                <Heart size={16} color={favorites[item.id] ? '#ef4444' : '#9CA3AF'} fill={favorites[item.id] ? '#ef4444' : 'none'} />
              </TouchableOpacity>
            </View>

            <View style={styles.meta}>
              <Text style={styles.productTitle} numberOfLines={2}>{item.title}</Text>
              <Text style={styles.price}>{item.price}</Text>
            </View>
          </View>
        )}
        contentContainerStyle={{ paddingHorizontal: 0 }}
        ListHeaderComponent={
          <>
            {/* Promo Header */}
            <View style={styles.promoWrap}>
              <View style={styles.promoLeft}>
                <Text style={styles.promoLabel}>SPECIAL OFFER</Text>
                <Text style={styles.promoTitle}>Extra Sale 30% off</Text>
                <Text style={styles.promoSub}>Bucket toy with a contrast colored handle. Perfect for playing on the beach.</Text>

                <View style={styles.timerRow}>
                  <Text style={styles.timer}>00</Text>
                  <Text style={styles.timerSep}>:</Text>
                  <Text style={styles.timer}>00</Text>
                  <Text style={styles.timerSep}>:</Text>
                  <Text style={styles.timer}>00</Text>
                </View>

                <TouchableOpacity style={styles.getBtn} onPress={() => console.log('get offer')}>
                  <View style={styles.getBtnContent}>
                    <Text style={styles.getBtnText}>Get only Rs. 599</Text>
                    <ArrowRight size={16} color="#fff" style={{ marginLeft: 8 }} />
                  </View>
                </TouchableOpacity>
              </View>

              <View style={styles.promoRight}>
                <View style={styles.imageStack}>
                  <Image source={require('../../assets/De-sal2.png')} style={styles.mainImage} />
                  <Image source={require('../../assets/De-sal1.png')} style={styles.smallImage} />
                  <View style={styles.saveBadge}><Text style={styles.saveBadgeText}>Save 30%</Text></View>
                </View>
              </View>
            </View>

            {/* Toolbar */}
            <View style={styles.toolbarRow}>
              <TouchableOpacity 
                style={styles.tool} 
                onPress={() => setSortVisible(true)}
                activeOpacity={0.6}
              > 
                <ArrowUpDown size={16} color="#111827" style={{ marginRight: 6 }} />
                <Text style={styles.toolText}>Sort</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.tool} 
                onPress={() => setCategoryVisible(true)}
                activeOpacity={0.6}
              > 
                <Text style={styles.toolText}>Category</Text>
                <ChevronDown size={14} color="#111827" style={{ marginLeft: 6 }} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.tool} 
                onPress={() => setAgeVisible(true)}
                activeOpacity={0.6}
              > 
                <Text style={styles.toolText}>Age</Text>
                <ChevronDown size={14} color="#111827" style={{ marginLeft: 6 }} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.tool} 
                onPress={() => setFilterVisible(true)}
                activeOpacity={0.6}
              > 
                <Funnel size={14} color="#111827" style={{ marginRight: 6 }} />
                <Text style={styles.toolText}>Filter</Text>
              </TouchableOpacity>
            </View>

            {/* Ghagra Section (copied from CategoryProductsGrid) */}
            <View style={styles.section}>
              <View style={styles.headerRow}>
                <Text style={styles.heading}>Ghagra</Text>
                <TouchableOpacity activeOpacity={0.7} onPress={() => console.log('see more', 'Ghagra')} style={styles.seeMoreBtn}>
                  <Text style={styles.seeMore}>See More</Text>
                  <Text style={styles.seeMoreArrow}>›</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        }
      />

      {/* Sort Bottom Sheet */}
      <Modal visible={sortVisible} transparent animationType="slide" onRequestClose={() => setSortVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setSortVisible(false)} />
        <View style={styles.bottomSheet}>
          <View style={styles.sheetHandle} />
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Sort</Text>
            <TouchableOpacity onPress={() => setSortVisible(false)}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody}>
            {['Relevance', 'New Arrivals', 'Price(High To Low)', 'Price (Low To High)', 'Rating', 'Discount'].map((option) => (
              <TouchableOpacity
                key={option}
                style={styles.optionRow}
                onPress={() => {
                  setSortSelected(option);
                  setSortVisible(false);
                }}
              >
                <View style={[styles.radioOuter, sortSelected === option && styles.radioOuterActive]}>
                  {sortSelected === option && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.optionText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal> 

      {/* Category Bottom Sheet */}
      <Modal visible={categoryVisible} transparent animationType="slide" onRequestClose={() => setCategoryVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setCategoryVisible(false)} />
        <View style={styles.bottomSheet}>
          <View style={styles.sheetHandle} />
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Category</Text>
            <TouchableOpacity onPress={() => setCategoryVisible(false)}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody}>
            {['Saree', 'Lehenga Choli', 'Salwar Kameez', 'Anarkali Suits', 'Kurta & Kurta Sets', 'Indo-Western Ethnic Wear', 'Ethnic Gowns', 'Bridal Ethnic Wear', 'Festive Ethnic Wear', 'Sharara & Gharara Sets', 'Traditional Maharashtrian Wear', 'Handloom Ethnic Wear', 'Ethnic Co-Ord Sets'].map((cat) => (
              <TouchableOpacity
                key={cat}
                style={styles.optionRow}
                onPress={() => {
                  setCategoriesSelected((prev) =>
                    prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
                  );
                }}
              >
                <View style={[styles.checkbox, categoriesSelected.includes(cat) && styles.checkboxActive]}>
                  {categoriesSelected.includes(cat) && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.optionText}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={styles.sheetFooter}>
            <TouchableOpacity style={styles.applyBtn} onPress={() => setCategoryVisible(false)}>
              <Text style={styles.applyBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal> 

      {/* Age Bottom Sheet */}
      <Modal visible={ageVisible} transparent animationType="slide" onRequestClose={() => setAgeVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setAgeVisible(false)} />
        <View style={styles.bottomSheet}>
          <View style={styles.sheetHandle} />
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Age</Text>
            <TouchableOpacity onPress={() => setAgeVisible(false)}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody}>
            {['0-5 Yrs (Infants & Toddlers)', '6-12 Yrs (Kids-Ethnic Wear)', '13-18 Yrs (Teen Collection)', '18-30 Yrs (Young Women)', '46-60yrs (Mature Women)', '60+ Yrs (Senior Women)'].map((age) => (
              <TouchableOpacity
                key={age}
                style={styles.optionRow}
                onPress={() => {
                  setAgesSelected((prev) =>
                    prev.includes(age) ? prev.filter((a) => a !== age) : [...prev, age]
                  );
                }}
              >
                <View style={[styles.checkbox, agesSelected.includes(age) && styles.checkboxActive]}>
                  {agesSelected.includes(age) && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.optionText}>{age}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={styles.sheetFooter}>
            <TouchableOpacity style={styles.applyBtn} onPress={() => setAgeVisible(false)}>
              <Text style={styles.applyBtnText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal> 

      {/* Filter Bottom Sheet */}
      <Modal visible={filterVisible} transparent animationType="slide" onRequestClose={() => setFilterVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setFilterVisible(false)} />
        <View style={styles.bottomSheet}>
          <View style={styles.sheetHandle} />
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filters</Text>
            <TouchableOpacity onPress={() => setFilterVisible(false)}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody}>
            {['Category', 'Age', 'Color', 'Fabric', 'Size', 'Price', 'Rating', 'Occasion', 'Discount'].map((s) => (
              <Text key={s} style={[styles.optionText, { paddingVertical: 10, paddingHorizontal: 0 }]}>{s}</Text>
            ))}
          </ScrollView>
          <View style={styles.sheetFooter}>
            <TouchableOpacity style={styles.applyBtn} onPress={() => setFilterVisible(false)}>
              <Text style={styles.applyBtnText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal> 
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  promoWrap: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 18, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'space-between' },
  promoLeft: { flex: 1, paddingRight: 12 },
  promoLabel: { color: '#E05659', fontSize: 12, fontWeight: '700', marginBottom: 6 },
  promoTitle: { fontSize: 20, fontWeight: '800', marginBottom: 8 },
  promoSub: { color: '#6B7280', fontSize: 12, marginBottom: 10 },
  timerRow: {
  flexDirection: 'row',   // ✅ row hona chahiye
  alignItems: 'center',
  marginBottom: 12,
},
timer: {
  fontWeight: '700',
  fontSize: 16,
  marginHorizontal: 4,
  color: '#000',          // ✅ Text ka color yaha
},
timerSep: {
  fontWeight: '700',
  fontSize: 16,
  color: '#000',
},
  getBtn: { backgroundColor: '#75BD4B', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20, alignSelf: 'flex-start' },
  getBtnText: { color: '#fff', fontWeight: '700' },
  getBtnContent: { flexDirection: 'row', alignItems: 'center' },
  promoRight: { width: 150, alignItems: 'center', justifyContent: 'center' },
  imageStack: { width: 140, height: 140, position: 'relative' },
  mainImage: { width: 90, height: 120, marginTop: -20, marginLeft: -25, borderRadius: 8, resizeMode: 'cover', shadowColor: '#000', shadowOpacity: 0.12, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6, elevation: 3 },
  smallImage: { position: 'absolute', right: -15, bottom: -5, width: 90, height: 120, borderRadius: 8, resizeMode: 'cover', borderWidth: 2, borderColor: '#fff', shadowColor: '#000', shadowOpacity: 0.08, shadowOffset: { width: 0, height: 1 }, shadowRadius: 4, elevation: 2 },
  saveBadge: { position: 'absolute', top: 13, right: 34 , backgroundColor: '#F43F5E', width: 60, height: 60, borderRadius: 32, alignItems: 'center', justifyContent: 'center', elevation: 4 },
  saveBadgeText: { color: '#fff', fontWeight: '700', textAlign: 'center' },

  section: { marginTop: 12, paddingVertical: 1, paddingHorizontal: 0, backgroundColor: '#fff' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 8 },
  heading: { fontSize: 18, fontWeight: '800' },
  seeMoreBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, paddingVertical: 4 },
  seeMoreArrow: { color: '#E05659', fontSize: 22, marginLeft: 6, fontWeight: '500', lineHeight: 18 },
  seeMore: { color: '#E05659', fontSize: 12, fontWeight: '700' },
  card: { backgroundColor: '#fff', borderRadius: 8, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, elevation: 3 },
  imageContainer: { position: 'relative', overflow: 'hidden', backgroundColor: '#f6f6f6' },
  image: { width: '100%', resizeMode: 'cover' },
  badge: {   position: 'absolute',
    width: 60,
    height:31,
    top: -1,
    left: -5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderTopLeftRadius: 15,
    borderBottomRightRadius:20,
    zIndex: 2, },
  badgeText: { color: '#fff', fontWeight: '500', fontSize: 12 },
  favBtn: { position: 'absolute', top: 8, right: 8, width: 34, height: 34, borderRadius: 17, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', elevation: 4 },
  meta: { paddingHorizontal: 10, paddingVertical: 12 },
  productTitle: { fontWeight: '700', fontSize: 13, marginBottom: 6, color: '#111827' },
  price: { color: '#111827', fontWeight: '800' },
  toolbarRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 8, paddingVertical: 10, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#F3F4F6' },
  tool: { paddingHorizontal: 8, paddingVertical: 6, flexDirection: 'row', alignItems: 'center' },
  toolText: { color: '#111827', fontWeight: '600' },
  
  // Modal styles   
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
  bottomSheet: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '80%', width: '100%' },
  sheetHandle: { width: 40, height: 5, backgroundColor: '#E5E7EB', borderRadius: 3, alignSelf: 'center', marginTop: 8, marginBottom: 4 },
  sheetFooter: { paddingHorizontal: 20, paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  modalClose: { fontSize: 24, color: '#6B7280', fontWeight: '400' },
  modalBody: { paddingHorizontal: 20, paddingVertical: 12, maxHeight: 400 },
  optionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  optionText: { fontSize: 14, color: '#374151', marginLeft: 12 },
  radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#D1D5DB', justifyContent: 'center', alignItems: 'center' },
  radioOuterActive: { borderColor: '#E05659' },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#E05659' },
  checkbox: { width: 20, height: 20, borderRadius: 4, borderWidth: 2, borderColor: '#D1D5DB', justifyContent: 'center', alignItems: 'center' },
  checkboxActive: { backgroundColor: '#E05659', borderColor: '#E05659' },
  checkmark: { color: '#fff', fontSize: 14, fontWeight: '700' },
  applyBtn: { backgroundColor: '#75BD4B', paddingVertical: 12, borderRadius: 8, alignItems: 'center', width: '100%' },
  applyBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

export default Deals;
