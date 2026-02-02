import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  Image,
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
} from 'react-native';
import { productService } from '../services/api';
import { guestCartUtils } from '../utils/cartUtils';
import getLocalized from '../utils/localize';

interface Product {
  id: string;
  name: string;
  description?: string;
  brand?: string;
  price: string;
  discountPercentage?: string;
  images?: string[];
  rating?: string;
  status?: string;
  category?: {
    id: string;
    name: string;
  };
  vendor?: {
    id: string;
    businessName?: string;
  };
  stock?: number;
  variants?: Array<{
    size?: string;
    color?: string;
    stock?: number;
    images?: string[];
  }>;
}

interface Props {
  vendorId?: string | null;
  navigate?: (screen: string, params?: any) => void;
  goBack?: () => void;
  vendorName?: string;
}

const MIN = 10;
const MAX = 10000;

export default function VendorProductsFilterNative({ vendorId, navigate, goBack, vendorName }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [query, setQuery] = useState<string>('');
  const [sort, setSort] = useState<'newest' | 'low' | 'high' | 'rating'>('newest');
  const [minVal, setMinVal] = useState<number>(MIN);
  const [maxVal, setMaxVal] = useState<number>(MAX);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'double' | 'single'>('double');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [notification, setNotification] = useState<{ show: boolean; message: string }>({ show: false, message: '' });

  useEffect(() => {
    let mounted = true;
    const fetchVendorProducts = async () => {
      if (!vendorId) return;
      setLoading(true);
      try {
        const resp: any = await productService.getVendorProducts({ vendorId, status: 'ACTIVE' });
        const data = Array.isArray(resp) ? resp : resp?.data || resp;
        if (mounted) setProducts(data || []);
      } catch (err) {
        console.error('Failed to fetch vendor products:', err);
        if (mounted) setProducts([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchVendorProducts();
    return () => { mounted = false; };
  }, [vendorId]);

  const uniqueBrands = useMemo(() => {
    return [...new Set(products.map(p => p.brand).filter((x): x is string => !!x))];
  }, [products]);

  const uniqueCategories = useMemo(() => {
    return [...new Set(products.map(p => getLocalized(p.category, 'name') || p.category?.name).filter((x): x is string => !!x))];
  }, [products]);

  const formatPrice = (price: string) => {
    const num = parseFloat(price || '0');
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(num);
  };

  const getTotalStock = (product: Product) => {
    if (product.variants && product.variants.length > 0) {
      return product.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
    }
    return product.stock || 0;
  };

  const toggleBrand = (brand: string) => setSelectedBrands(prev => prev.includes(brand) ? prev.filter(x => x !== brand) : [...prev, brand]);
  const toggleCategory = (cat: string) => setSelectedCategories(prev => prev.includes(cat) ? prev.filter(x => x !== cat) : [...prev, cat]);

  const filteredProducts = useMemo(() => {
    return products
      .filter(p => {
        const localizedName = (getLocalized(p, 'name') || p.name || '').toLowerCase();
        const matchesQuery = localizedName.includes(query.toLowerCase());
        const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(p.brand || '');
        const localizedCat = getLocalized(p.category, 'name') || p.category?.name || '';
        const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(localizedCat);
        const price = parseFloat(p.price || '0');
        const matchesPrice = price >= minVal && price <= maxVal;
        return matchesQuery && matchesBrand && matchesCategory && matchesPrice;
      })
      .sort((a, b) => {
        switch (sort) {
          case 'low': return parseFloat(a.price) - parseFloat(b.price);
          case 'high': return parseFloat(b.price) - parseFloat(a.price);
          case 'rating': return parseFloat(b.rating || '0') - parseFloat(a.rating || '0');
          case 'newest':
          default:
            return 0;
        }
      });
  }, [products, query, selectedBrands, selectedCategories, minVal, maxVal, sort]);

  const getFirstAvailableImage = (product: Product) => {
    if (product.images && product.images.length > 0) return ensureFullUrl(product.images[0]);
    if (product.variants && product.variants.length > 0) {
      for (const v of product.variants) {
        if (v.images && v.images.length > 0) return ensureFullUrl(v.images[0]);
      }
    }
    return undefined;
  };

  const ensureFullUrl = (img?: string) => {
    if (!img) return undefined;
    return img.startsWith('http') ? img : `https://backend.originplatforms.co${img.startsWith('/') ? '' : '/'}${img}`;
  };

  const addToCart = async (product: Product) => {
    // If product has variants, navigate to details
    if (product.variants && product.variants.length > 0) {
      navigate?.('ProductDetails', { product });
      return;
    }

    const totalStock = getTotalStock(product);
    if (totalStock === 0) {
      setNotification({ show: true, message: 'Out of stock' });
      setTimeout(() => setNotification({ show: false, message: '' }), 3000);
      return;
    }

    const basePrice = parseFloat(product.price || '0');
    const discountPercent = product.discountPercentage ? parseFloat(product.discountPercentage) : 0;
    const finalPrice = discountPercent > 0 ? basePrice * (1 - discountPercent / 100) : basePrice;

    try {
      await guestCartUtils.addItem({
        id: product.id,
        name: getLocalized(product, 'name') || product.name,
        price: finalPrice,
        image: getFirstAvailableImage(product) || 'https://backend.originplatforms.co/images/placeholder-products.png',
        brand: product.brand || 'Unknown',
        description: getLocalized(product, 'description') || product.description || product.name,
        size: 'Free Size',
        color: 'Default',
        quantity: 1,
        maxStock: totalStock,
      });

      setNotification({ show: true, message: 'Added to cart' });
      setTimeout(() => setNotification({ show: false, message: '' }), 3000);
    } catch (e) {
      console.error('Failed to add to cart', e);
      Alert.alert('Error', 'Failed to add to cart');
    }
  };

  const numColumns = viewMode === 'double' ? 2 : 1;
  const cardWidth = Math.round((Dimensions.get('window').width - 32 - (numColumns - 1) * 12) / numColumns);

  const renderProductCard = ({ item }: { item: Product }) => {
    const basePrice = parseFloat(item.price || '0');
    const discountPercent = item.discountPercentage ? parseFloat(item.discountPercentage) : 0;
    const finalPrice = discountPercent > 0 ? basePrice * (1 - discountPercent / 100) : basePrice;
    const totalStock = getTotalStock(item);

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => navigate?.('ProductDetails', { product: item })}
        style={[styles.card, { width: cardWidth }]}
      >
        <View style={styles.imageWrap}>
          <Image
            source={{ uri: getFirstAvailableImage(item) || 'https://backend.originplatforms.co/images/placeholder-products.png' }}
            style={styles.cardImage}
            resizeMode="cover"
          />
          {discountPercent > 0 && (
            <View style={styles.discountBadge}><Text style={styles.discountText}>{Math.round(discountPercent)}% OFF</Text></View>
          )}
          {totalStock === 0 ? (
            <View style={styles.stockBadge}><Text style={styles.stockText}>OUT OF STOCK</Text></View>
          ) : totalStock <= 5 ? (
            <View style={[styles.stockBadge, { backgroundColor: '#EA580C' }]}><Text style={styles.stockText}>ONLY {totalStock} LEFT</Text></View>
          ) : null}
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.cardTitle} numberOfLines={2}>{getLocalized(item, 'name') || item.name}</Text>
          <Text style={styles.cardBrand}>{item.brand || 'No Brand'}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatPrice(finalPrice.toString())}</Text>
            {discountPercent > 0 && <Text style={styles.strike}>{formatPrice(item.price)}</Text>}
          </View>

          {totalStock > 0 && (
            <TouchableOpacity style={styles.addBtn} onPress={() => addToCart(item)}>
              <Text style={styles.addBtnText}>Add to Cart</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => goBack?.()} style={styles.backBtn}><Text style={styles.backBtnText}>Back</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>{vendorName || 'Vendor'}</Text>
      </View>

      <View style={styles.controls}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search products..."
          style={styles.searchInput}
        />

        <View style={styles.controlsRow}>
          <TouchableOpacity style={styles.controlBtn} onPress={() => setIsFilterOpen(true)}>
            <Text style={styles.controlText}>Filters</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlBtn} onPress={() => setSort(prev => prev === 'newest' ? 'low' : prev === 'low' ? 'high' : prev === 'high' ? 'rating' : 'newest')}>
            <Text style={styles.controlText}>Sort</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlBtn} onPress={() => setViewMode(prev => prev === 'double' ? 'single' : 'double')}>
            <Text style={styles.controlText}>{viewMode === 'double' ? 'Grid' : 'List'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="small" color="#10B981" /><Text style={{ marginTop: 8 }}>Loading products...</Text></View>
      ) : filteredProducts.length === 0 ? (
        <View style={styles.center}><Text style={styles.emptyText}>No products available from this vendor.</Text></View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(p) => String(p.id)}
          renderItem={renderProductCard}
          contentContainerStyle={{ padding: 12 }}
          numColumns={numColumns}
          columnWrapperStyle={numColumns > 1 ? { justifyContent: 'space-between' } : undefined}
        />
      )}

      {/* Filter Modal */}
      <Modal visible={isFilterOpen} animationType="slide" onRequestClose={() => setIsFilterOpen(false)}>
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
          <View style={styles.filterHeader}>
            <TouchableOpacity onPress={() => setIsFilterOpen(false)}><Text style={styles.backBtnText}>Close</Text></TouchableOpacity>
            <Text style={styles.headerTitle}>Filters</Text>
            <TouchableOpacity onPress={() => {
              setSelectedBrands([]); setSelectedCategories([]); setMinVal(MIN); setMaxVal(MAX); setQuery('');
            }}><Text style={{ color: '#ef4444' }}>Reset</Text></TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ padding: 16 }}>
            <Text style={styles.filterTitle}>Brands</Text>
            <View style={styles.filterList}>
              {uniqueBrands.map(b => (
                <TouchableOpacity key={b} style={[styles.filterItem, selectedBrands.includes(b) ? styles.filterItemActive : undefined]} onPress={() => toggleBrand(b)}>
                  <Text style={[styles.filterText, selectedBrands.includes(b) ? { color: '#fff' } : undefined]}>{b}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.filterTitle}>Categories</Text>
            <View style={styles.filterList}>
              {uniqueCategories.map(c => (
                <TouchableOpacity key={c} style={[styles.filterItem, selectedCategories.includes(c) ? styles.filterItemActive : undefined]} onPress={() => toggleCategory(c)}>
                  <Text style={[styles.filterText, selectedCategories.includes(c) ? { color: '#fff' } : undefined]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.filterTitle, { marginTop: 12 }]}>Price Range</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
              <TextInput keyboardType="number-pad" value={String(minVal)} onChangeText={t => setMinVal(Number(t) || MIN)} style={[styles.rangeInput]} />
              <TextInput keyboardType="number-pad" value={String(maxVal)} onChangeText={t => setMaxVal(Number(t) || MAX)} style={[styles.rangeInput]} />
            </View>

            <TouchableOpacity style={[styles.applyBtn, { marginTop: 20 }]} onPress={() => setIsFilterOpen(false)}>
              <Text style={styles.applyBtnText}>Apply</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Notification */}
      {notification.show && (
        <View style={styles.snack}><Text style={{ color: '#fff' }}>{notification.message}</Text></View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#fff' },
  backBtn: { paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#10B981', borderRadius: 8 },
  backBtnText: { color: '#fff', fontWeight: '700' },
  headerTitle: { fontSize: 18, fontWeight: '700', marginLeft: 12 },
  controls: { padding: 12, backgroundColor: '#fff' },
  searchInput: { backgroundColor: '#F3F4F6', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginBottom: 10 },
  controlsRow: { flexDirection: 'row', gap: 8 },
  controlBtn: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginRight: 8 },
  controlText: { color: '#111' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  emptyText: { color: '#6B7280' },
  card: { backgroundColor: '#fff', borderRadius: 8, overflow: 'hidden', marginBottom: 12 },
  imageWrap: { position: 'relative', height: 140, backgroundColor: '#f3f3f3' },
  cardImage: { width: '100%', height: '100%' },
  discountBadge: { position: 'absolute', left: 8, top: 8, backgroundColor: '#DC2626', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  discountText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  stockBadge: { position: 'absolute', right: 8, top: 8, backgroundColor: '#111827', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  stockText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  cardBody: { padding: 12 },
  cardTitle: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  cardBrand: { fontSize: 12, color: '#6B7280', marginBottom: 8 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  price: { fontWeight: '700', fontSize: 14 },
  strike: { textDecorationLine: 'line-through', color: '#6B7280' },
  addBtn: { backgroundColor: '#10B981', paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  addBtnText: { color: '#fff', fontWeight: '700' },
  filterHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  filterTitle: { fontWeight: '700', marginBottom: 8 },
  filterList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filterItem: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB', marginRight: 8, marginBottom: 8 },
  filterItemActive: { backgroundColor: '#111827', borderColor: '#111827' },
  filterText: { color: '#111' },
  rangeInput: { flex: 1, backgroundColor: '#F3F4F6', padding: 10, borderRadius: 8 },
  applyBtn: { backgroundColor: '#10B981', padding: 12, borderRadius: 8, alignItems: 'center' },
  applyBtnText: { color: '#fff', fontWeight: '700' },
  snack: { position: 'absolute', left: 12, right: 12, bottom: 24, backgroundColor: '#111', padding: 12, borderRadius: 8, alignItems: 'center' }
});
