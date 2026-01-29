import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChevronLeft, Check, Search } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

type Language = {
  code: string;
  name: string;
  nativeName?: string;
};

export default function Language({ navigate, goBack }: { navigate?: (name: string, params?: any) => void; goBack?: () => void }) {
  const insets = useSafeAreaInsets();
  const { t, i18n } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState<Language>({ code: 'en', name: 'English' });
  const [languages, setLanguages] = useState<Language[]>([]);
  const [filteredLanguages, setFilteredLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  // Fetch languages from API and load saved language
  useEffect(() => {
    fetchLanguages();
    loadSavedLanguage();
  }, []);

  const loadSavedLanguage = async () => {
    try {
      const saved = await AsyncStorage.getItem('selectedLanguage');
      if (saved) {
        setSelectedLanguage(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load saved language:', error);
    }
  };

  const fetchLanguages = async () => {
    setLoading(true);
    try {
      // Using REST Countries API to get all languages
      const response = await fetch('https://restcountries.com/v3.1/all?fields=languages');
      const data = await response.json();
      
      // Extract unique languages
      const languageMap = new Map<string, Language>();
      
      // Add essential languages first to ensure they're included
      const essentialLanguages = [
        { code: 'en', name: 'English', nativeName: 'English' },
        { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
        { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
        { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
        { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
        { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
        { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
        { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
        { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
        { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
      ];
      
      essentialLanguages.forEach(lang => {
        languageMap.set(lang.code, lang);
      });
      
      data.forEach((country: any) => {
        if (country.languages) {
          Object.entries(country.languages).forEach(([code, name]) => {
            if (!languageMap.has(code)) {
              languageMap.set(code, {
                code,
                name: name as string,
                nativeName: name as string,
              });
            }
          });
        }
      });

      const languageList = Array.from(languageMap.values()).sort((a, b) => 
        a.name.localeCompare(b.name)
      );

      setLanguages(languageList);
      setFilteredLanguages(languageList);
    } catch (error) {
      console.error('Failed to fetch languages:', error);
      // Fallback languages if API fails
      const fallbackLanguages: Language[] = [
        { code: 'en', name: 'English', nativeName: 'English' },
        { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
        { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
        { code: 'es', name: 'Spanish', nativeName: 'Español' },
        { code: 'fr', name: 'French', nativeName: 'Français' },
        { code: 'de', name: 'German', nativeName: 'Deutsch' },
        { code: 'zh', name: 'Chinese', nativeName: '中文' },
        { code: 'ja', name: 'Japanese', nativeName: '日本語' },
        { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
        { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
        { code: 'ru', name: 'Russian', nativeName: 'Русский' },
        { code: 'it', name: 'Italian', nativeName: 'Italiano' },
        { code: 'ko', name: 'Korean', nativeName: '한국어' },
        { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
        { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
        { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
        { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
        { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
        { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
        { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
      ].sort((a, b) => a.name.localeCompare(b.name));
      
      setLanguages(fallbackLanguages);
      setFilteredLanguages(fallbackLanguages);
    } finally {
      setLoading(false);
    }
  };

  // Filter languages based on search
  useEffect(() => {
    if (search.trim() === '') {
      setFilteredLanguages(languages);
    } else {
      const filtered = languages.filter(lang =>
        lang.name.toLowerCase().startsWith(search.toLowerCase()) ||
        lang.nativeName?.toLowerCase().startsWith(search.toLowerCase())
      );
      setFilteredLanguages(filtered);
    }
  }, [search, languages]);

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => goBack?.()} style={styles.backBtn} activeOpacity={0.7}>
          <ChevronLeft size={20} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('language.title')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>{t('language.selectLanguage')}</Text>
        <Text style={styles.subtitle}>{t('language.choosePreferred')}</Text>

        {/* Search Box */}
        <View style={styles.searchBox}>
          <Search size={18} color="#9CA3AF" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder={t('language.searchPlaceholder')}
            placeholderTextColor="#9CA3AF"
            style={styles.searchInput}
          />
        </View>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#E26B68" />
            <Text style={styles.loadingText}>{t('language.loadingLanguages')}</Text>
          </View>
        ) : (
          <View style={styles.languagesContainer}>
            {filteredLanguages.map((item) => (
              <TouchableOpacity
                key={item.code}
                style={[
                  styles.languageItem,
                  selectedLanguage.code === item.code && styles.selectedItem,
                ]}
                onPress={() => setSelectedLanguage(item)}
                activeOpacity={0.7}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.languageName}>{item.name}</Text>
                  {item.nativeName && item.nativeName !== item.name && (
                    <Text style={styles.nativeName}>{item.nativeName}</Text>
                  )}
                </View>
                {selectedLanguage.code === item.code && (
                  <View style={styles.checkmark}>
                    <Check size={14} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
            {filteredLanguages.length === 0 && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>{t('language.noLanguagesFound')}</Text>
              </View>
            )}
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveBtn} onPress={async () => {
          try {
            console.log('[Language] Changing to:', selectedLanguage.code, selectedLanguage.name);
            // Change app language
            await i18n.changeLanguage(selectedLanguage.code);
            console.log('[Language] Current i18n language:', i18n.language);
            // Save language to AsyncStorage
            await AsyncStorage.setItem('selectedLanguage', JSON.stringify(selectedLanguage));
            await AsyncStorage.setItem('appLanguage', selectedLanguage.code);
            
            // Force reload by dispatching event
            if (typeof globalThis !== 'undefined' && (globalThis as any).dispatchEvent) {
              try {
                const CE = (globalThis as any).CustomEvent;
                if (CE) {
                  (globalThis as any).dispatchEvent(new CE('languageChanged', { detail: { language: selectedLanguage.code } }));
                }
              } catch (e) {}
            }
            
            Alert.alert(t('common.success'), t('language.languageSaved'));
            
            // Small delay before going back to let the language change propagate
            setTimeout(() => {
              goBack?.();
            }, 300);
          } catch (error) {
            Alert.alert(t('common.error'), t('language.languageError'));
          }
        }} activeOpacity={0.8}>
          <Text style={styles.saveText}>{t('language.saveChanges')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, marginBottom: 8 },
  backBtn: { marginRight: 8, padding: 6 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  content: { paddingHorizontal: 20, paddingTop: 6, paddingBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#6B7280', marginBottom: 16, marginTop: 4 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 15, color: '#111' },
  loadingBox: { flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  loadingText: { marginTop: 12, color: '#6B7280', fontSize: 14 },
  languagesContainer: { marginTop: 8 },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedItem: { backgroundColor: '#FEF2F2', borderColor: '#E26B68' },
  languageName: { fontSize: 16, color: '#111', fontWeight: '500' },
  nativeName: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  checkmark: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E26B68',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: { paddingVertical: 40, alignItems: 'center' },
  emptyText: { color: '#9CA3AF', fontSize: 15 },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 20, alignItems: 'center' },
  saveBtn: { backgroundColor: '#E26B68', paddingVertical: 14, borderRadius: 50, width: '86%', alignItems: 'center' },
  saveText: { color: '#fff', fontWeight: '700' },
});
