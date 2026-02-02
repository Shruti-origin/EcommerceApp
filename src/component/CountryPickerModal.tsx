import React, { useState, useEffect } from 'react';
import { Modal, View, Text, Pressable, TextInput, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, Search } from 'lucide-react-native';

type Country = {
  id: string;
  name: string;
  code: string;
  flag?: string;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelect: (country: Country) => void;
  selectedCountry?: string;
  countries?: Country[];
  loading?: boolean;
  error?: string;
};

export default function CountryPickerModal({ 
  visible, 
  onClose, 
  onSelect, 
  selectedCountry, 
  countries: propCountries = [], 
  loading: propLoading = false, 
  error: propError = '' 
}: Props): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [countries, setCountries] = useState<Country[]>([]);
  const [filteredCountries, setFilteredCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(false);

  // Use passed countries or fetch from API as fallback
  useEffect(() => {
    if (propCountries && propCountries.length > 0) {
      console.log('Using countries from props:', propCountries.length);
      setCountries(propCountries);
      // Ensure full list is visible immediately when modal opens
      setFilteredCountries(propCountries);
      setLoading(propLoading);
      // Clear previous search so the full list shows when opened
      if (visible) setSearch('');
    } else if (visible && countries.length === 0) {
      console.log('Fetching countries from REST Countries API as fallback');
      fetchCountries();
    }
  }, [propCountries, propLoading, visible]);

  const fetchCountries = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,flag');
      const data = await response.json();
      
      const countryList: Country[] = data
        .map((c: any) => ({
          id: c.cca2,
          name: c.name.common,
          code: c.cca2,
          flag: c.flag || '🏳️',
        }))
        .sort((a: Country, b: Country) => a.name.localeCompare(b.name));
      
      setCountries(countryList);
      setFilteredCountries(countryList);
    } catch (error) {
      console.error('Failed to fetch countries:', error);
      // Fallback to a basic list
      const fallback: Country[] = [
        { id: 'IN', name: 'India', code: 'IN', flag: '🇮🇳' },
        { id: 'US', name: 'United States', code: 'US', flag: '🇺🇸' },
        { id: 'GB', name: 'United Kingdom', code: 'GB', flag: '🇬🇧' },
        { id: 'CA', name: 'Canada', code: 'CA', flag: '🇨🇦' },
        { id: 'AU', name: 'Australia', code: 'AU', flag: '🇦🇺' },
        { id: 'DE', name: 'Germany', code: 'DE', flag: '🇩🇪' },
        { id: 'FR', name: 'France', code: 'FR', flag: '🇫🇷' },
        { id: 'JP', name: 'Japan', code: 'JP', flag: '🇯🇵' },
        { id: 'CN', name: 'China', code: 'CN', flag: '🇨🇳' },
        { id: 'BR', name: 'Brazil', code: 'BR', flag: '🇧🇷' },
      ].sort((a, b) => a.name.localeCompare(b.name));
      setCountries(fallback);
      setFilteredCountries(fallback);
    } finally {
      setLoading(false);
    }
  };

  // Filter countries based on search
  useEffect(() => {
    if (search.trim() === '') {
      setFilteredCountries(countries);
    } else {
      const filtered = countries.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.code.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredCountries(filtered);
    }
  }, [search, countries]);

  // When the modal becomes visible, reset search and ensure the list shows everything
  useEffect(() => {
    if (visible) {
      setSearch('');
      setFilteredCountries(countries);
    }
  }, [visible, countries]);

  const handleSelect = (country: Country) => {
    onSelect(country);
    setSearch('');
    onClose();
  };

  const handleClose = () => {
    setSearch('');
    onClose();
  };

  // Debug logging
  console.log('🔥 CountryPickerModal render - visible:', visible, 'countries:', countries.length, 'filteredCountries:', filteredCountries.length);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.overlayPressable} onPress={handleClose} />
        <View style={[styles.sheet, { paddingBottom: insets.bottom || 20 }]}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>Select Country</Text>
              {countries.length > 0 && (
                <Text style={styles.countText}>Showing {filteredCountries.length} of {countries.length} countries</Text>
              )}
            </View>
            <Pressable onPress={handleClose} style={styles.closeBtn}>
              <X size={20} color="#6B7280" />
            </Pressable>
          </View>

          <View style={styles.searchBox}>
            <Search size={18} color="#9CA3AF" />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search country..."
              placeholderTextColor="#9CA3AF"
              style={styles.searchInput}
              autoFocus={visible}
            />
          </View>

          {loading || propLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#E26B68" />
              <Text style={styles.loadingText}>Loading countries...</Text>
            </View>
          ) : propError ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Error: {propError}</Text>
              <TouchableOpacity 
                style={styles.retryBtn} 
                onPress={() => {
                  if (propCountries.length === 0) {
                    fetchCountries();
                  }
                }}
              >
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : filteredCountries.length === 0 && countries.length > 0 ? (
            // Edge case: countries exist but filtered list is empty (probably due to a stray search input)
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No countries match your search.</Text>
              <TouchableOpacity
                style={[styles.retryBtn, { marginTop: 12 }]}
                onPress={() => {
                  setSearch('');
                  setFilteredCountries(countries);
                }}
              >
                <Text style={styles.retryText}>Show all countries ({countries.length})</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={filteredCountries}
              keyExtractor={item => item.id || item.code}
              style={styles.list}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={true}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.countryItem,
                    selectedCountry === item.name && styles.selectedItem,
                  ]}
                  onPress={() => handleSelect(item)}
                  activeOpacity={0.7}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.countryName}>{item.name}</Text>
                  </View>
                  {selectedCountry === item.name && (
                    <View style={styles.checkmark}>
                      <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No countries found</Text>
                </View>
              }
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  overlayPressable: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: '85%', paddingTop: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 12 },
  title: { fontSize: 18, fontWeight: '700', color: '#111' },
  closeBtn: { padding: 6 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: '#111',
  },
  list: { maxHeight: '65%' },
  listContent: { paddingHorizontal: 20, paddingBottom: 12 },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },

  countryName: { fontSize: 16, color: '#111', marginBottom: 2 },

  countText: { color: '#6B7280', fontSize: 12, marginTop: 4 },
  separator: { height: 1, backgroundColor: '#F3F4F6', marginLeft: 16 },
  selectedItem: {
    backgroundColor: '#FEF2F2',
    borderLeftWidth: 4,
    borderLeftColor: '#E26B68',
    paddingVertical: 12,
  },
  checkmark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E26B68',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  loadingText: { marginTop: 12, color: '#6B7280', fontSize: 14 },
  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60, paddingHorizontal: 20 },
  errorText: { color: '#EF4444', fontSize: 14, textAlign: 'center', marginBottom: 16 },
  retryBtn: { backgroundColor: '#E26B68', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  retryText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  emptyContainer: { paddingVertical: 40, alignItems: 'center' },
  emptyText: { color: '#9CA3AF', fontSize: 15 },
});
