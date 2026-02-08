import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ChevronLeft } from 'lucide-react-native';
import { wp, hp, scale } from '../utils/responsive';
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
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: wp(4), marginBottom: hp(1) },
  backBtn: { marginRight: wp(2), padding: wp(1.2) },
  headerTitle: { fontSize: scale(16), fontWeight: '400', color: '#111' },
  content: { paddingHorizontal: wp(5), paddingTop: hp(1) },
  logoContainer: { alignItems: 'center', marginBottom: -hp(2.5), marginTop: -hp(2.5) },
  logo: { width: scale(180), height: scale(180) },
  heading: { fontSize: scale(22), fontWeight: '700', color: '#111', marginBottom: hp(2) },
  description: {
    fontSize: scale(15),
    lineHeight: scale(24),
    color: '#000000',
    marginBottom: hp(1.2),
    
    textDecorationColor: '#1E40AF',
  },
  support: {
    fontSize: scale(16),
    fontWeight: '600',
    color: '#111',
    marginTop: hp(2.5),
  },
  
  // Decorative leaves
  leafWrapper1: { position: 'absolute', right: wp(12), top: -hp(5), width: wp(24), height: wp(24), overflow: 'visible' },
  leaf1: { width: wp(60), height: wp(42), opacity: 0.3, transform: [{ rotate: '-30deg' }] },
  
  
});
