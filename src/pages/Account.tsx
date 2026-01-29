import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChevronRight, ChevronLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import DeleteAccounting from '../component/DeleteAccounting';

// NOTE: Put the leaf image at `assets/leaves.png` in the project root (same level as `assets/`).
// The component references it via require('../../assets/leaves.png').

type RowProps = { label: string; rightText?: string; onPress?: () => void };
const Row: React.FC<RowProps> = ({ label, rightText, onPress }) => (
  <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
    <Text style={styles.rowLabel}>{label}</Text>
    <View style={styles.rowRight}>
      {rightText ? <Text style={styles.rightText}>{rightText}</Text> : null}
      <ChevronRight size={18} color="#9CA3AF" />
    </View>
  </TouchableOpacity>
);

export default function Account({ navigate, goBack }: { navigate?: (name: string, params?: any) => void; goBack?: () => void }) {
  const insets = useSafeAreaInsets();
  const { t, i18n } = useTranslation();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    loadLanguage();
    
    // Listen for language change events
    const handleLanguageChange = () => {
      loadLanguage();
      setRefresh(prev => prev + 1); // Force re-render
    };

    if (typeof globalThis !== 'undefined' && (globalThis as any).addEventListener) {
      try {
        (globalThis as any).addEventListener('languageChanged', handleLanguageChange);
      } catch (e) {}
    }

    return () => {
      if (typeof globalThis !== 'undefined' && (globalThis as any).removeEventListener) {
        try {
          (globalThis as any).removeEventListener('languageChanged', handleLanguageChange);
        } catch (e) {}
      }
    };
  }, []);

  const loadLanguage = async () => {
    try {
      const saved = await AsyncStorage.getItem('selectedLanguage');
      if (saved) {
        const lang = JSON.parse(saved);
        setSelectedLanguage(lang.name);
      }
    } catch (error) {
      console.error('Failed to load language:', error);
    }
  };

  // Reload language when screen becomes visible again
  useEffect(() => {
    const interval = setInterval(loadLanguage, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={[styles.containerOuter, { paddingTop: insets.top + 12 }]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => goBack?.()} activeOpacity={0.7}>
            <ChevronLeft size={20} color="#111" />
          </TouchableOpacity>
          <Text style={styles.title}>{t('account.title')}</Text>
        </View>

      <Text style={styles.sectionTitle}>{t('account.personal')}</Text>
      <View style={styles.card}>
        <Row label={t('account.profile')} onPress={() => navigate?.('Profile')} />
        <TouchableOpacity style={styles.divider} onPress={() => navigate?.('Profile')} activeOpacity={0.7} />
        <Row label={t('account.shippingAddress')} onPress={() => navigate?.('ShippingAddress')} />
        <View style={styles.divider} />
        <Row label={t('account.paymentMethods')} onPress={() => navigate?.('PaymentMethod')} />
        <View style={styles.divider} />
        <Row label={t('account.termsAndConditions')} onPress={() => navigate?.('Terms')} />
      </View>

      <Text style={styles.sectionTitle}>{t('account.accountSection')}</Text>
      <View style={styles.card}>
        <Row label={t('account.language')} rightText={selectedLanguage} onPress={() => navigate?.('Language')} />
        <View style={styles.divider} />
        <Row label={t('account.aboutTulsiBaug')} onPress={() => navigate?.('About')} />
      </View>

      <TouchableOpacity style={styles.deleteBtn} activeOpacity={0.7} onPress={() => setDeleteModalVisible(true)}>
        <Text style={styles.deleteText}>{t('account.deleteAccount')}</Text>
      </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.brand}>{t('account.brand')}</Text>
          <Text style={styles.version}>{t('account.version')}</Text>
        </View>

        {/* Decorative space so content doesn't overlap absolute image */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom-right leaves image (clipped by wrapper to hide overflow) */}
      <View style={styles.leafWrapper} pointerEvents="none">
        {/* Local decorative background image */}
        <Image source={require('../../assets/bg-home.png')} style={styles.leaf} />
      </View>

      <DeleteAccounting
        visible={deleteModalVisible}
        onCancel={() => setDeleteModalVisible(false)}
        onDelete={() => {
          setDeleteModalVisible(false);
          Alert.alert('Account Deleted', 'Your account has been deleted successfully.');
          // Add actual delete API call here
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' ,paddingTop:-10 },
  content: { paddingHorizontal: 20, paddingTop: 1, paddingBottom: 24 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  backBtn: { marginRight: 8, padding: 6 },
  title: { fontSize: 18, color: '#111', marginBottom: 8 },
  sectionTitle: { color: '#483028', fontWeight: '700', fontSize: 16, marginTop: 16, marginBottom: 8 },
  card: { backgroundColor: '#fff', borderRadius: 4, overflow: 'hidden' },

  /* wrapper to allow absolute positioned leaf image while hiding overflow */
  containerOuter: { flex: 1, backgroundColor: '#fff', overflow: 'hidden' },
  scroll: { flex: 1 },
  leafWrapper: { position: 'absolute', right: 0, bottom: -40, width: 220, height: 220, overflow: 'visible' },
  leaf: { position: 'absolute', width: 240, height: 220, right: -80, bottom: -50, resizeMode: 'cover', transform: [{ rotate: '50deg' }, { scale: 1.4 }] },
  row: { paddingVertical: 16, paddingHorizontal: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowLabel: { fontSize: 15, color: '#111' },
  rowRight: { flexDirection: 'row', alignItems: 'center' },
  rightText: { color: '#6b7280', marginRight: 8 },
  divider: { height: 1, backgroundColor: '#F3F4F6' },
  deleteBtn: { marginTop: 18, alignSelf: 'flex-start' },
  deleteText: { color: '#F87171' },
  footer: { marginTop: 26 },
  brand: { fontSize: 18, fontWeight: '700', color: '#483028' },
  version: { color: '#9CA3AF', marginTop: 6 },
});
