import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, SafeAreaView, StatusBar } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ChevronLeft } from 'lucide-react-native';
import ProductsService from '../services/productsService';

const placeholder = require('../../assets/s-h1.png');

const CategoryProducts = ({ categoryId, title, navigate, goBack, items }: { categoryId?: string; title?: string; navigate?: (s: string, p?: any) => void; goBack?: () => void; items?: any[] }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState<boolean>(false);
  const [products, setProducts] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        setError(null);

        // If caller passed items (from CategoryProductsGrid), use them directly to avoid refetch
        if (Array.isArray(items) && items.length > 0) {
          setProducts(items);
          setLoading(false);
          return;
        }

        // Otherwise fetch from API
        const res = await ProductsService.getProductsByCategory(categoryId, { limit: 100 });
        const data = res.data || res || [];
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Category products failed', err);
        setError(t('categories.loading'));
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [categoryId, items]);

  const renderItem = ({ item }: { item: any }) => {
    // Support both API product shape and ProductItem shape passed from grid
    const img = (item.images && item.images.length > 0)
      ? { uri: `https://backend.originplatforms.co${item.images[0]}` }
      : (item.image && (typeof item.image === 'number' ? item.image : (item.image.uri ? item.image : (typeof item.image === 'string' ? { uri: item.image } : null)))) || placeholder;

    const titleText = item.name || item.title || item.productName || 'Product';
    const priceText = (item.price && (typeof item.price === 'string' ? item.price : `Rs ${item.price}`)) || 'Rs 0';

    return (
      <TouchableOpacity style={styles.row} activeOpacity={0.8} onPress={() => navigate?.('ProductDetails', { product: item.raw || item })}>
        <Image source={img} style={styles.thumb} />
        <View style={{ flex: 1 }}>
          <Text style={styles.title} numberOfLines={2}>{titleText}</Text>
          <Text style={styles.price}>{priceText}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => goBack ? goBack() : navigate?.('Home')} style={styles.backBtn}>
          <ChevronLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title || t('categories.products')}</Text>
      </View>

      <View style={styles.container}>
        {loading ? (
          <View style={styles.loading}><ActivityIndicator size="large" color="#E84F30" /></View>
        ) : error ? (
          <View style={styles.center}><Text>{error}</Text></View>
        ) : products.length === 0 ? (
          <View style={styles.center}><Text>{t('categories.noProducts')}</Text></View>
        ) : (
          <FlatList
            data={products}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderItem}
            contentContainerStyle={{ padding: 12 }}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  backBtn: { padding: 4, marginRight: 8 },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  container: { flex: 1 },
  loading: { padding: 40, alignItems: 'center' },
  center: { padding: 40, alignItems: 'center' },
  row: { flexDirection: 'row', gap: 12, marginBottom: 12, backgroundColor: '#fff', padding: 8, borderRadius: 8, alignItems: 'center' },
  thumb: { width: 84, height: 84, borderRadius: 8, backgroundColor: '#eee', marginRight: 8 },
  title: { fontWeight: '700', marginBottom: 6 },
  price: { color: '#111827', fontWeight: '700' },
});

export default CategoryProducts;