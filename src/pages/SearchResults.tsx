import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, SafeAreaView, StatusBar, TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ChevronLeft } from 'lucide-react-native';
import { productService } from '../services/api';

const placeholder = require('../../assets/s-h1.png');

const SearchResults = ({ query, navigate, goBack }: { query?: string; navigate?: (s: string, p?: any) => void; goBack?: () => void }) => {
  const { t } = useTranslation();
  const [q, setQ] = useState<string>(query || '');
  const [loading, setLoading] = useState<boolean>(false);
  const [products, setProducts] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setQ(query || '');
  }, [query]);

  useEffect(() => {
    const fetch = async () => {
      if (!q) return setProducts([]);
      try {
        setLoading(true);
        setError(null);
        const res = await productService.search(q, { limit: 50 });
        const data = res.data || res || [];
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Search failed', err);
        setError(t('search.error'));
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [q]);

  const onSubmit = () => {
    // triggers new search
    setQ(q.trim());
  };

  const renderItem = ({ item }: { item: any }) => {
    const img = (item.images && item.images.length > 0) ? { uri: `https://backend.originplatforms.co${item.images[0]}` } : placeholder;
    return (
      <TouchableOpacity style={styles.row} activeOpacity={0.8} onPress={() => navigate?.('ProductDetails', { product: item })}>
        <Image source={img} style={styles.thumb} />
        <View style={{ flex: 1 }}>
          <Text style={styles.title} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.price}>{item.price ? `Rs ${item.price}` : 'Rs 0'}</Text>
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
        <TextInput
          value={q}
          onChangeText={setQ}
          onSubmitEditing={onSubmit}
          placeholder={t('search.placeholder')}
          style={styles.searchInput}
          returnKeyType="search"
        />
      </View>

      <View style={styles.container}>
        {loading ? (
          <View style={styles.loading}><ActivityIndicator size="large" color="#E84F30" /></View>
        ) : error ? (
          <View style={styles.center}><Text>{error}</Text></View>
        ) : products.length === 0 ? (
          <View style={styles.center}><Text>{t('search.noResults')} "{q}"</Text></View>
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
  searchInput: { flex: 1, height: 40, backgroundColor: '#F4F4F4', borderRadius: 8, paddingHorizontal: 12 },
  container: { flex: 1 },
  loading: { padding: 40, alignItems: 'center' },
  center: { padding: 40, alignItems: 'center' },
  row: { flexDirection: 'row', gap: 12, marginBottom: 12, backgroundColor: '#fff', padding: 8, borderRadius: 8, alignItems: 'center' },
  thumb: { width: 84, height: 84, borderRadius: 8, backgroundColor: '#eee', marginRight: 8 },
  title: { fontWeight: '700', marginBottom: 6 },
  price: { color: '#111827', fontWeight: '700' },
});

export default SearchResults;
