import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ChevronLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AboutUs({ navigate, goBack }: { navigate?: (name: string, params?: any) => void; goBack?: () => void }) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => goBack?.()} style={styles.backBtn} activeOpacity={0.7}>
          <ChevronLeft size={20} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('aboutUs.title')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../assets/logo-img.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Heading */}
        <Text style={styles.heading}>{t('aboutUs.heading')}</Text>

        {/* Description */}
        <Text style={styles.description}>
          {t('aboutUs.description1')}
        </Text>

        <Text style={styles.description}>
          {t('aboutUs.description2')}
        </Text>

        <Text style={styles.description}>
          {t('aboutUs.description3')}
        </Text>

        {/* Support Email */}
        <Text style={styles.support}>{t('aboutUs.support')}</Text>

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Decorative leaves */}
      <View style={styles.leafWrapper1} pointerEvents="none">
        <Image source={require('../../assets/bg-home.png')} style={styles.leaf1} />
      </View>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, marginBottom: 16 },
  backBtn: { marginRight: 8, padding: 6 },
  headerTitle: { fontSize: 16, fontWeight: '400', color: '#111' },
  content: { paddingHorizontal: 24, paddingTop: 10 },
  logoContainer: { alignItems: 'center', marginBottom: -20, marginTop: -20 },
  logo: { width: 200, height: 200 },
  heading: { fontSize: 22, fontWeight: '700', color: '#111', marginBottom: 16 },
  description: {
    fontSize: 15,
    lineHeight: 24,
    color: '#000000',
    marginBottom: 12,
    
    textDecorationColor: '#1E40AF',
  },
  support: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    marginTop: 24,
  },
  
  // Decorative leaves
  leafWrapper1: { position: 'absolute', right: 60, top: -40, width: 100, height: 100, overflow: 'visible' },
  leaf1: { width: 300, height: 210, opacity: 0.3, transform: [{ rotate: '-30deg' }] },
  
  
});
