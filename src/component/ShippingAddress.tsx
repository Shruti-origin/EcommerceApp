import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ChevronLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import apiClient from '../services/apiClient';
import { addressService, userService } from '../services/api';

// Google Places API Key - Replace with your actual key from Google Cloud Console
const GOOGLE_PLACES_API_KEY = 'YOUR_GOOGLE_API_KEY_HERE'; // TODO: Replace with your key

export default function ShippingAddress({ navigate, goBack }: { navigate?: (name: string, params?: any) => void; goBack?: () => void }) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  
  // ========== Form Fields ==========
  const [address, setAddress] = useState('');
  const [address2, setAddress2] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState(t('shipping.chooseCountry'));
  
  // ========== NEW: PIN Code & Location Fields ==========
  const [pinCode, setPinCode] = useState(''); // 6-digit PIN code
  const [city, setCity] = useState(''); // Auto-filled from PIN (postal city)
  const [state, setState] = useState(''); // Auto-filled from PIN
  const [district, setDistrict] = useState(''); // Auto-filled from PIN (district)
  const [landmark, setLandmark] = useState(''); // User-selected or typed landmark
  const [showAddress2Dropdown, setShowAddress2Dropdown] = useState(false);
  
  // ========== Nearby Places from Google API ==========
  const [nearbyPlaces, setNearbyPlaces] = useState<Array<{ place_id: string; name: string; vicinity: string }>>([]);
  const [showLandmarkDropdown, setShowLandmarkDropdown] = useState(false);
  
  const [addressId, setAddressId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  
  // ========== Loading & Error States ==========
  const [loadingPinLookup, setLoadingPinLookup] = useState(false);
  const [pinError, setPinError] = useState('');
  
  // ========== Country Picker States ==========
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
            
            console.log('REST Countries loaded:', countryList, 'items');
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

  // Load default address (if any) from backend and pre-fill the form
  useEffect(() => {
    const loadDefault = async () => {
      try {
        const response = await addressService.getDefaultAddress();
        const data = response?.data || response;
        if (data) {
          setAddressId(data.id || data._id || (data._id && data._id.toString()) || null);
          setAddress(data.addressLine1 || data.address1 || data.address || '');
          setAddress2(data.addressLine2 || data.address2 || data.address_2 || '');
          setCity(data.city || '');
          setState(data.state || '');
          setCountry(data.country || '');
          setPinCode(data.pincode || data.postcode || data.zip || '');
          setPhone(data.phone || '');
          setLandmark(data.landmark || '');
          setFirstName(data.firstName || data.first_name || (data.fullName && data.fullName.split(' ')[0]) || '');
          setLastName(data.lastName || data.last_name || (data.fullName && data.fullName.split(' ').slice(1).join(' ')) || '');
        }
      } catch (e) {
        console.log('No default address loaded', e);
      }
    };
    loadDefault();
  }, []);

  // Try to load user profile to prefill first/last name if available
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const resp = await userService.getProfile();
        const profile = resp?.data || resp;
        if (profile) {
          setFirstName(profile.firstName || profile.first_name || (profile.name && profile.name.split(' ')[0]) || '');
          setLastName(profile.lastName || profile.last_name || (profile.name && profile.name.split(' ').slice(1).join(' ')) || '');
        }
      } catch (err) {
        console.log('Could not load user profile', err);
      }
    };
    loadProfile();
  }, []);

  const handleCountrySelect = (selectedCountry: any) => {
    setCountry(selectedCountry.name);
    setCountryPickerVisible(false);
  };  

  // ========== STEP 1: Handle PIN Code Input (Only 6 Digits) ==========
  const handlePinCodeChange = (value: string) => {
    // Remove any non-digit characters and limit to 6 digits
    const cleanedValue = value.replace(/\D/g, '').slice(0, 6);
    setPinCode(cleanedValue);
    
    // Clear previous error when user starts typing
    if (pinError) setPinError('');
    
    // If user has entered exactly 6 digits, trigger PIN lookup
    if (cleanedValue.length === 6) {
      lookupPinCode(cleanedValue);
    } else {
      // Clear auto-filled fields if PIN is incomplete
      setCity('');
      setState('');
      setDistrict('');
      setNearbyPlaces([]);
      setShowLandmarkDropdown(false);
    }
  };

  // ========== STEP 2: Fetch City & State from India Post API ==========
  const lookupPinCode = async (pin: string) => {
    setLoadingPinLookup(true);
    setPinError('');
    setNearbyPlaces([]);
    setShowLandmarkDropdown(false);
    
    try {
      console.log(`🔍 Looking up PIN: ${pin}`);
      
      // Call India Post API (Free, No API Key Required)
      const response = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      const data = await response.json();
      
      console.log('📦 India Post API Response:', data);
      
      // Check if API returned valid data
      if (data && Array.isArray(data) && data[0]?.Status === 'Success') {
        const postOffice = data[0].PostOffice[0]; // Get first post office data
        
        // Extract city, district, and state
        const fetchedCity = postOffice?.Name || postOffice?.Division || '';
        const fetchedDistrict = postOffice?.District || '';
        const fetchedState = postOffice?.State || '';
        
        console.log(`✅ Found: City=${fetchedCity}, District=${fetchedDistrict}, State=${fetchedState}`);
        
        // Auto-fill the fields
        setCity(fetchedCity);
        setDistrict(fetchedDistrict);
        setState(fetchedState);
        setCountry('India'); // Auto-fill country as India
        // Auto-fill Address Line 2 with postal city if user hasn't entered it
        if (!address2) setAddress2(fetchedCity);
        
        // STEP 3: Convert PIN to Latitude & Longitude
        await geocodePinCode(pin, fetchedCity, fetchedState);
        
      } else {
        // PIN not found or invalid
        setPinError('Invalid PIN code or no data found');
        console.warn('❌ PIN lookup failed:', data[0]?.Message || 'Unknown error');
      }
      
    } catch (error) {
      console.error('❌ Network error during PIN lookup:', error);
      setPinError('Network error. Please check your connection.');
    } finally {
      setLoadingPinLookup(false);
    }
  };

  // ========== STEP 3 & 4: Convert PIN/City to Latitude & Longitude ==========
  const geocodePinCode = async (pin: string, cityName: string, stateName: string) => {
    try {
      console.log(`🌍 Geocoding: ${cityName}, ${stateName}, India`);
      
      // Use OpenStreetMap Nominatim API (Free, No API Key Required)
      // Note: For production, use a proper geocoding service or add rate limiting
      const query = encodeURIComponent(`${pin} ${cityName} ${stateName} India`);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`,
        {
          headers: {
            'User-Agent': 'EcommerceApp/1.0' // Required by Nominatim
          }
        }
      );
      
      const data = await response.json();
      console.log('🗺️ Geocoding Response:', data);
      
      if (data && data.length > 0) {
        const location = data[0];
        const latitude = parseFloat(location.lat);
        const longitude = parseFloat(location.lon);
        
        console.log(`📍 Coordinates: ${latitude}, ${longitude}`);
        
        // STEP 5: Fetch nearby places using Google Places API
        await fetchNearbyPlaces(latitude, longitude);
      } else {
        console.warn('⚠️ Could not geocode the location');
        setPinError('Location found, but coordinates unavailable');
      }
      
    } catch (error) {
      console.error('❌ Geocoding error:', error);
      // Don't show error to user - city/state are already filled
    }
  };

  // ========== STEP 5 & 6: Fetch Nearby Places from Google Places API ==========
  const fetchNearbyPlaces = async (lat: number, lng: number) => {
    // Check if API key is configured
    if (!GOOGLE_PLACES_API_KEY || GOOGLE_PLACES_API_KEY === 'YOUR_GOOGLE_API_KEY_HERE') {
      console.warn('⚠️ Google Places API key not configured');
      // Nearby places not available without an API key — log only
      console.warn('Nearby places unavailable (API key missing)');
      return;
    }
    
    try {
      console.log(`🏥 Fetching nearby places for: ${lat}, ${lng}`);
      
      // Search for common landmark types within 2km radius
      const radius = 2000; // 2 kilometers
      const types = 'hospital|school|shopping_mall|hindu_temple|bus_station|train_station|atm|bank';
      
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${types}&key=${GOOGLE_PLACES_API_KEY}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      console.log('🏢 Google Places Response:', data);
      
      if (data.status === 'OK' && data.results && data.results.length > 0) {
        // Extract place name and vicinity (address)
        const places = data.results.slice(0, 10).map((place: any) => ({
          place_id: place.place_id,
          name: place.name,
          vicinity: place.vicinity || '',
        }));
        
        console.log(`✅ Found ${places.length} nearby places`);
        setNearbyPlaces(places);
        setShowLandmarkDropdown(true);
        
      } else {
        console.warn('⚠️ No nearby places found');
        // Log only - do not surface as pinError UI message
        console.warn('No nearby landmarks found');
      }
      
    } catch (error) {
      console.error('❌ Error fetching nearby places:', error);
      // Log only - do not surface as pinError UI message
      console.error('Could not fetch nearby places', error);
    }
  };

  // ========== STEP 7: Handle Landmark Selection from Dropdown ==========
  const selectLandmark = (placeName: string) => {
    console.log(`📍 Selected landmark: ${placeName}`);
    setLandmark(placeName);
    setShowLandmarkDropdown(false); // Hide dropdown after selection
  };
  const handleSave = async () => {
    // Basic validation
    if (!firstName.trim()) { Alert.alert('Validation', 'First name is required'); return; }
    if (!lastName.trim()) { Alert.alert('Validation', 'Last name is required'); return; }
    if (!address.trim()) { Alert.alert('Validation', 'Address Line 1 is required'); return; }
    if (!city.trim()) { Alert.alert('Validation', 'City is required'); return; }
    if (!state.trim()) { Alert.alert('Validation', 'State is required'); return; }
    if (!pinCode.trim()) { Alert.alert('Validation', 'Pincode is required'); return; }
    const digits = phone.replace(/\D/g, '');
    if (!digits || digits.length < 10) { Alert.alert('Validation', 'Please enter a valid phone number'); return; }

    const payload: any = {
      firstName: firstName,
      lastName: lastName,
      addressLine1: address,
      addressLine2: address2,
      city,
      state,
      country,
      pincode: pinCode,
      phone,
      landmark,
    };

    console.log('📤 Saving address payload:', payload);

    try {
      setSaving(true);
      let resp: any = null;
      if (addressId) {
        resp = await addressService.updateAddress(addressId, payload);
      } else {
        resp = await addressService.createAddress(payload);
        const id = resp?.data?.id || resp?.id || resp?._id;
        if (id) setAddressId(id);
      }

      console.log('📤 Save response:', resp);

      // After save, try to re-fetch authoritative address from backend.
      // If backend doesn't return a default immediately, fall back to the save response so UI shows the saved values.
      try {
        const refreshResp = await addressService.getDefaultAddress();
        const fresh = refreshResp?.data || refreshResp;
        if (fresh) {
          setAddressId(fresh.id || fresh._id || (fresh._id && fresh._id.toString()) || addressId);
          setFirstName(fresh.firstName || fresh.first_name || firstName);
          setLastName(fresh.lastName || fresh.last_name || lastName);
          setAddress(fresh.addressLine1 || fresh.address1 || fresh.address || address);
          setAddress2(fresh.addressLine2 || fresh.address2 || address2);
          setCity(fresh.city || city);
          setState(fresh.state || state);
          setCountry(fresh.country || country);
          setPinCode(fresh.pincode || fresh.postcode || fresh.zip || pinCode);
          setPhone(fresh.phone || phone);
          setLandmark(fresh.landmark || landmark);
          console.log('✅ Refreshed address from backend', fresh);
        } else {
          // No default returned — use the save response to update UI so user sees what they just saved
          const src = resp?.data || resp;
          if (src) {
            console.warn('⚠️ getDefaultAddress returned empty, updating UI from save response');
            setAddressId(src.id || src._id || (src._id && src._id.toString()) || addressId);
            setFirstName(src.firstName || src.first_name || firstName);
            setLastName(src.lastName || src.last_name || lastName);
            setAddress(src.addressLine1 || src.address1 || src.address || address);
            setAddress2(src.addressLine2 || src.address2 || address2);
            setCity(src.city || city);
            setState(src.state || state);
            setCountry(src.country || country);
            setPinCode(src.pincode || src.postcode || src.zip || pinCode);
            setPhone(src.phone || phone);
            setLandmark(src.landmark || landmark);
            console.log('✅ Updated UI from save response', src);
          }
        }
      } catch (refreshErr) {
        console.warn('Could not refresh default address after save', refreshErr);
        // Fallback to the save response
        const src = resp?.data || resp;
        if (src) {
          console.warn('⚠️ Using save response to update UI after refresh error');
          setAddressId(src.id || src._id || (src._id && src._id.toString()) || addressId);
          setFirstName(src.firstName || src.first_name || firstName);
          setLastName(src.lastName || src.last_name || lastName);
          setAddress(src.addressLine1 || src.address1 || src.address || address);
          setAddress2(src.addressLine2 || src.address2 || address2);
          setCity(src.city || city);
          setState(src.state || state);
          setCountry(src.country || country);
          setPinCode(src.pincode || src.postcode || src.zip || pinCode);
          setPhone(src.phone || phone);
          setLandmark(src.landmark || landmark);
        }
      }

      Alert.alert('Success', 'Address saved and refreshed');
      // Keep the user on the form so they can see the authoritative DB values
    } catch (err: any) {
      console.error('Failed to save address', err);
      const message = err?.message || String(err) || 'Failed to save address. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setSaving(false);
    }
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

        {(address || address2 || city || state || pinCode || phone) && (
          <View style={styles.previewCard}>
            <Text style={styles.previewTitle}>Saved Address</Text>
            <Text style={styles.previewText}>{firstName} {lastName}</Text>
            <Text style={styles.previewText}>
              {address}{address2 ? ', ' + address2 : ''}
            </Text>
            <Text style={styles.previewText}>
              {city}{state ? ', ' + state : ''} {pinCode}
            </Text>
            <Text style={styles.previewText}>
              {country} • {phone}
            </Text>
          </View>
        )}
        {/* First & Last Name */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>First Name</Text>
          <TextInput
            value={firstName}
            onChangeText={setFirstName}
            placeholder="First name"
            placeholderTextColor="#9CA3AF"
            style={styles.input}
          />
        </View>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Last Name</Text>
          <TextInput
            value={lastName}
            onChangeText={setLastName}
            placeholder="Last name"
            placeholderTextColor="#9CA3AF"
            style={styles.input}
          />
        </View>

        {/* Address Line 1 */}
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

        {/* Address Line 2 (editable, auto-filled from PIN or selection) */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Address Line 2</Text>
          <TextInput
            value={address2}
            onChangeText={(v) => { setAddress2(v); setShowAddress2Dropdown(false); }}
            placeholder="Apt, area or city"
            placeholderTextColor="#E26B68"
            style={styles.input}
            onFocus={() => { if (nearbyPlaces.length > 0) setShowAddress2Dropdown(true); }}
          />

          {showAddress2Dropdown && nearbyPlaces.length > 0 && (
            <View style={styles.dropdown}>
              <Text style={styles.dropdownTitle}>📍 Nearby Places</Text>
              <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                {nearbyPlaces.map((place) => (
                  <TouchableOpacity
                    key={place.place_id}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setAddress2(place.name);
                      setLandmark(place.name);
                      setShowAddress2Dropdown(false);
                    }}
                  >
                    <Text style={styles.dropdownItemName}>{place.name}</Text>
                    {place.vicinity && (
                      <Text style={styles.dropdownItemAddress}>{place.vicinity}</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity style={styles.dropdownClose} onPress={() => setShowAddress2Dropdown(false)}>
                <Text style={styles.dropdownCloseText}>Close</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* City (editable) - prefer showing district when available */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>City</Text>
          <TextInput
            value={district || city}
            onChangeText={(v) => { setCity(v); /* keep district cleared when user edits city */ setDistrict(''); }}
            placeholder="Enter district or city"
            placeholderTextColor="#9CA3AF"
            style={styles.input}
          />
        </View>

        {/* State (editable) */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>State</Text>
          <TextInput
            value={state}
            onChangeText={setState}
            placeholder="Enter state"
            placeholderTextColor="#9CA3AF"
            style={styles.input}
          />
        </View>

        {/* Country (editable) */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>{t('shipping.country')}</Text>
          <TextInput
            value={country}
            onChangeText={setCountry}
            placeholder={t('shipping.chooseCountry')}
            placeholderTextColor="#9CA3AF"
            style={styles.input}
          />
        </View>

        {/* Pincode (PIN Code) */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Pincode (India) *</Text>
          <TextInput
            value={pinCode}
            onChangeText={handlePinCodeChange}
            placeholder="Enter 6-digit pincode"
            placeholderTextColor="#E26B68"
            style={styles.input}
            keyboardType="numeric"
            maxLength={6}
          />
          {loadingPinLookup && (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color="#E26B68" />
              <Text style={styles.loadingText}>Looking up PIN code...</Text>
            </View>
          )}
          {pinError && <Text style={styles.errorText}>{pinError}</Text>}
        </View>

        {/* ========== Landmark Input with Nearby Places Dropdown ========== */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Landmark (Optional)</Text>
          <TextInput
            value={landmark}
            onChangeText={setLandmark}
            placeholder="Select or type a landmark"
            placeholderTextColor="#E26B68"
            style={styles.input}
            onFocus={() => nearbyPlaces.length > 0 && setShowLandmarkDropdown(true)}
          />
          
          {/* Nearby Places Dropdown */}
          {showLandmarkDropdown && nearbyPlaces.length > 0 && (
            <View style={styles.dropdown}>
              <Text style={styles.dropdownTitle}>📍 Nearby Places</Text>
              <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                {nearbyPlaces.map((place) => (
                  <TouchableOpacity
                    key={place.place_id}
                    style={styles.dropdownItem}
                    onPress={() => selectLandmark(place.name)}
                  >
                    <Text style={styles.dropdownItemName}>{place.name}</Text>
                    {place.vicinity && (
                      <Text style={styles.dropdownItemAddress}>{place.vicinity}</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity
                style={styles.dropdownClose}
                onPress={() => setShowLandmarkDropdown(false)}
              >
                <Text style={styles.dropdownCloseText}>Close</Text>
              </TouchableOpacity>
            </View>
          )}
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

      <View style={styles.footer}>
        <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.7 }]} onPress={handleSave} activeOpacity={0.8} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Save Changes</Text>}
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
    backgroundColor: '#E26B68', 
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E26B68 '
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
  readOnlyInput: {
    backgroundColor: '#F3F4F6',
    color: '#6B7280',
    borderColor: '#E5E7EB',
  },
  previewCard: {
    backgroundColor: '#FEF3F2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  previewTitle: { fontSize: 14, fontWeight: '700', color: '#111', marginBottom: 6 },
  previewText: { fontSize: 14, color: '#6B7280' },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  loadingText: {
    marginLeft: 8,
    color: '#6B7280',
    fontSize: 14,
  },
  dropdown: {
    marginTop: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    maxHeight: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dropdownTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dropdownItemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111',
    marginBottom: 4,
  },
  dropdownItemAddress: {
    fontSize: 13,
    color: '#6B7280',
  },
  dropdownClose: {
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  dropdownCloseText: {
    color: '#E26B68',
    fontWeight: '600',
  },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 20, alignItems: 'center' },
  saveBtn: { backgroundColor: '#E26B68', paddingVertical: 14, borderRadius: 50, width: '86%', alignItems: 'center' },
  saveText: { color: '#fff', fontWeight: '700' },
});
