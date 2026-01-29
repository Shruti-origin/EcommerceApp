import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CountryPickerModal from './CountryPickerModal';
import apiClient from '../services/apiClient';

export default function ShippingAddress({ navigate, goBack }: { navigate?: (name: string, params?: any) => void; goBack?: () => void }) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [address, setAddress] = useState('');
  const [town, setTown] = useState('');
  const [postcode, setPostcode] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState(t('shipping.chooseCountry'));
  const [countryPickerVisible, setCountryPickerVisible] = useState(false);
  const [countries, setCountries] = useState<Array<{id: string; name: string; code: string}>>([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [countryError, setCountryError] = useState('');

  // Fetch countries from API
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoadingCountries(true);
        setCountryError('');
        
        console.log('Fetching countries from API...');
        
        // Try your backend API first
        try {
          const response = await apiClient.get('/countries');
          console.log('Countries API response:', response);
          
          const countriesData = response.data || response.countries || response;
          
          if (Array.isArray(countriesData)) {
            const formattedCountries = countriesData.map((country: any) => ({
              id: country.id || country._id || country.code,
              name: country.name || country.country_name || country.title,
              code: country.code || country.country_code || country.iso_code || country.id
            }));
            
            console.log('Formatted countries:', formattedCountries.length, 'items');
            setCountries(formattedCountries);
            return; // Success, exit early
          }
        } catch (apiError: any) {
          console.log('Backend API failed, trying fallback...', apiError.message);
        }
        
        // Fallback to REST Countries API if backend fails
        try {
          console.log('Trying REST Countries API...');
          const response = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,flag');
          const data = await response.json();
          
          if (Array.isArray(data)) {
            const countryList = data
              .map((c: any) => ({
                id: c.cca2,
                name: c.name.common,
                code: c.cca2,
              }))
              .sort((a: any, b: any) => a.name.localeCompare(b.name));
            
            console.log('REST Countries loaded:', countryList.length, 'items');
            setCountries(countryList);
            return;
          }
        } catch (restError: any) {
          console.log('REST Countries API also failed:', restError.message);
        }
        
        // Last resort: hardcoded countries
        const fallbackCountries = [
          { id: 'IN', name: 'India', code: 'IN' },
          { id: 'US', name: 'United States', code: 'US' },
          { id: 'UK', name: 'United Kingdom', code: 'UK' },
          { id: 'CA', name: 'Canada', code: 'CA' },
          { id: 'AU', name: 'Australia', code: 'AU' },
          { id: 'DE', name: 'Germany', code: 'DE' },
          { id: 'FR', name: 'France', code: 'FR' },
          { id: 'JP', name: 'Japan', code: 'JP' },
          { id: 'CN', name: 'China', code: 'CN' },
          { id: 'BR', name: 'Brazil', code: 'BR' },
          { id: 'IT', name: 'Italy', code: 'IT' },
          { id: 'ES', name: 'Spain', code: 'ES' },
          { id: 'RU', name: 'Russia', code: 'RU' },
          { id: 'KR', name: 'South Korea', code: 'KR' },
          { id: 'SG', name: 'Singapore', code: 'SG' }
        ];
        
        console.log('Using hardcoded fallback countries');
        setCountries(fallbackCountries);
        
      } catch (error: any) {
        console.error('All country fetch methods failed:', error);
        setCountryError('Unable to load countries');
        
        // Still provide basic countries for functionality
        const basicCountries = [
          { id: 'IN', name: 'India', code: 'IN' },
          { id: 'US', name: 'United States', code: 'US' },
          { id: 'UK', name: 'United Kingdom', code: 'UK' }
        ];
        setCountries(basicCountries);
      } finally {
        setLoadingCountries(false);
      }
    };

    fetchCountries();
  }, []);

  const handleCountrySelect = (selectedCountry: any) => {
    setCountry(selectedCountry.name);
    setCountryPickerVisible(false);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => goBack?.()} style={styles.backBtn} activeOpacity={0.7}>
          <ChevronLeft size={20} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('shipping.title')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>{t('shipping.settings')}</Text>
        <Text style={styles.subtitle}>{t('shipping.shippingAddress')}</Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>{t('shipping.country')}</Text>
          <TouchableOpacity 
            style={styles.countryRow} 
            activeOpacity={0.7} 
            onPress={() => {
              console.log('🔥 Country picker button clicked!');
              console.log('🔥 loadingCountries:', loadingCountries);
              console.log('🔥 countries length:', countries.length);
              if (!loadingCountries) {
                console.log('🔥 Opening country picker modal...');
                setCountryPickerVisible(true);
              }
            }}
            disabled={loadingCountries}
          >
            <View style={styles.countryContent}>
              {loadingCountries ? (
                <>
                  <ActivityIndicator size="small" color="#E26B68" style={{ marginRight: 8 }} />
                  <Text style={styles.countryText}>Loading countries...</Text>
                </>
              ) : (
                <Text style={[styles.countryText, 
                  country === t('shipping.chooseCountry') && styles.placeholderText
                ]}>
                  {country}
                </Text>
              )}
              {countryError && (
                <Text style={styles.errorText}>({countryError})</Text>
              )}
            </View>
            <View style={[styles.arrowCircle, loadingCountries && styles.arrowDisabled]}>
              <ChevronRight size={16} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>{t('shipping.address')}</Text>
          <TextInput
            value={address}
            onChangeText={setAddress}
            placeholder={t('shipping.required')}
            placeholderTextColor="#E26B68"
            style={styles.input}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>{t('shipping.townCity')}</Text>
          <TextInput
            value={town}
            onChangeText={setTown}
            placeholder={t('shipping.required')}
            placeholderTextColor="#E26B68"
            style={styles.input}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>{t('shipping.postcode')}</Text>
          <TextInput
            value={postcode}
            onChangeText={setPostcode}
            placeholder={t('shipping.required')}
            placeholderTextColor="#E26B68"
            style={styles.input}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>{t('shipping.phoneNumber')}</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder={t('shipping.required')}
            placeholderTextColor="#E26B68"
            style={styles.input}
            keyboardType="phone-pad"
          />
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      <CountryPickerModal
        visible={countryPickerVisible}
        onClose={() => setCountryPickerVisible(false)}
        onSelect={handleCountrySelect}
        selectedCountry={country !== t('shipping.chooseCountry') ? country : undefined}
        countries={countries}
        loading={loadingCountries}
        error={countryError}
      />

      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveBtn} onPress={() => goBack?.()} activeOpacity={0.8}>
          <Text style={styles.saveText}>Save Changes</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' , marginTop:15 },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 8 },
  backBtn: { padding: 6, marginRight: 8 },
  headerTitle: { fontSize: 16, color: '#111', fontWeight: '400',marginLeft:-10 },
  content: { paddingHorizontal: 33, paddingTop: 10, paddingBottom: 24 },
  sectionTitle: { fontSize: 17, fontWeight: '700', marginBottom: 4 },
  subtitle: { fontSize: 14, fontWeight: '700', marginBottom: 16, marginTop: 8 },
  fieldGroup: { marginBottom: 16 },
  label: { fontSize: 14, color: '#111', marginBottom: 8, fontWeight: '500' },
  countryRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingVertical: 12, 
    paddingHorizontal: 16, 
    backgroundColor: '#F9FAFB', 
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6'
  },
  countryContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center'
  },
  countryText: { fontSize: 16, color: '#111' },
  placeholderText: { color: '#9CA3AF' },
  errorText: { fontSize: 12, color: '#EF4444', marginLeft: 8 },
  arrowCircle: { 
    width: 28, 
    height: 28, 
    borderRadius: 14, 
    backgroundColor: '#E26B68', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  arrowDisabled: {
    backgroundColor: '#D1D5DB'
  },
  input: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#E26B68',
    borderWidth: 1,
    borderColor: '#FEE2E2'
  },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 20, alignItems: 'center' },
  saveBtn: { backgroundColor: '#E26B68', paddingVertical: 14, borderRadius: 50, width: '86%', alignItems: 'center' },
  saveText: { color: '#fff', fontWeight: '700' },
});
