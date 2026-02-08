import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useTranslation } from 'react-i18next';

const Features: React.FC = () => {
  const screenWidth = Dimensions.get('window').width;
  console.log('Features loaded', new Date().toISOString());

  // Decorative assets: use available local images as placeholders
  const deco1 = require('../../assets/bag-blu.png');
  const deco2 = require('../../assets/bag-gr-l.png');
  const deco3 = require('../../assets/bag-gr-r.png');
  const deco4 = require('../../assets/bag-yell-l.png');
  const deco5 = require('../../assets/bag-yell-r.png');
  // 'bag-pur-r.png' was missing — use 'bg-pur-r.png' (available) as a temporary fallback.
  // Replace with the correct asset when you add it to the assets folder.
  const deco6 = require('../../assets/bg-pur-r.png');

  const { t } = useTranslation();

  return (
    <View style={styles.section}>
      {/* Decorative Images (absolute positioned) */}
      <Image source={deco1} style={[styles.deco, styles.decoTopLeft]} resizeMode="contain" />
      <Image source={deco2} style={[styles.deco, styles.decoTopRight]} resizeMode="contain" />
      <Image source={deco3} style={[styles.deco, styles.decoBottomLeft]} resizeMode="contain" />
      <Image source={deco4} style={[styles.deco, styles.decoBottomRight]} resizeMode="contain" />
      <Image source={deco5} style={[styles.deco, styles.decoBottomleftRight]} resizeMode="contain" />
      <Image source={deco6} style={[styles.deco, styles.decoBottommiddleRight]} resizeMode="contain" />

      <View style={styles.content}>
        <Text style={styles.h1}>{t('features.h1')}</Text>
        <Text style={styles.h2}>{t('features.h2')}</Text>
        <Text style={styles.p}>{t('features.p')}</Text>

        <View style={styles.buttonsRow}>
          <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.8}>
            <Text style={styles.primaryText}>{t('features.shopNow')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryBtn} activeOpacity={0.8}>
            <Text style={styles.secondaryText}>{t('features.contactUs')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    backgroundColor: '#EFAAAC',
    paddingVertical: 70,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 40,
  },
  deco: {
    position: 'absolute',
    width: 120,
    height: 120,
    // opacity: 0,
  },
  decoTopLeft: {
    top: 0,
    left: 8,
    // Shift on Y axis using transform so it behaves consistently across platforms
    transform: [{ translateY: -20 }],
  },
  decoTopRight: {
    top: -40,
    right: -7,
  },
  decoBottomLeft: {
    bottom: 80,
    left: -30,
    width: 140,
    height: 140,
  },
  decoBottomRight: {
    bottom: -30,
    right: -15,
    width: 100,
    height: 120,
  },
  decoBottomleftRight: {
    bottom: -35,
    left: -5,
    width: 80,
    height: 120,
  },
  decoBottommiddleRight: {
    bottom: 120,
    right: -1,
    width: 90,
    height: 100,
  },
  content: {
    alignItems: 'center',
    maxWidth: 900,
    alignSelf: 'center',
    paddingHorizontal: 16,
  },
  h1: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  h2: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  p: {
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 18,
    textAlign: 'center',
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    marginRight: 8,
  },
  primaryText: {
    color: '#fff',
    fontWeight: '700',
  },
  secondaryBtn: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  secondaryText: {
    color: '#111827',
    fontWeight: '700',
  },
});

export default Features;
