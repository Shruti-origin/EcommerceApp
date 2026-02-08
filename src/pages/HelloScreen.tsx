import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { wp, hp, scale } from '../utils/responsive';

const slides = [
  {
    title: 'Hello',
    description: "Discover the charm of Pune's iconic Tulsi Baug, now just a click away.",
    image: require('../../assets/hello1.png'),
  },
  {
    title: 'Are',
    description: 'Authentic products from trusted local vendors, all in one place.',
    image: require('../../assets/hello2.png'),
  },
  {
    title: 'You',
    description: 'Shop effortlessly for ethnic wear, gifts, and daily essentials anytime.',
    image: require('../../assets/hello3.png'),
  },
  {
    title: 'Ready',
    description: 'Experience Tulsi Baug shopping online — easy, reliable, and hassle-free.',
    image: require('../../assets/hello4.png'),
  },
];

const { width } = Dimensions.get('window');

export default function HelloScreen({ navigate }: { navigate?: (name: string, params?: any) => void }) {
  const [index, setIndex] = useState(0);
  const lastIndex = slides.length - 1;

  function handleSkip() {
    if (index < lastIndex) setIndex(i => i + 1);
    else navigate?.('Home');
  }

  function handlePrev() {
    if (index > 0) setIndex(i => i - 1);
  }

  function onPressCard() {
    if (index < lastIndex) setIndex(i => i + 1);
    else navigate?.('Home');
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Decorative leaves */}
      <Image source={require('../../assets/bg-home.png')} style={styles.leafTopLeft} />
      <Image source={require('../../assets/bg-home.png')} style={styles.leafBottomRight} />

      {/* Top-right skip */}
      <View style={styles.topBar} pointerEvents="box-none">
        <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
          <Text style={styles.skipText}>Skips</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.center}>
        <TouchableOpacity activeOpacity={0.9} onPress={onPressCard} style={styles.cardContainer}>
          <Image source={slides[index].image} style={styles.image} resizeMode="cover" />

          <View style={styles.cardFooter}>
            <Text style={styles.cardTitle}>{slides[index].title}</Text>
            <Text style={styles.cardDesc}>{slides[index].description}</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.dotsRow}>
          {slides.map((_, i) => (
            <View key={i} style={[styles.dot, i === index ? styles.dotActive : null]} />
          ))}
        </View>
      </View>

    
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  topBar: { position: 'absolute', top: 16, right: 16, zIndex: 10 },
  skipBtn: { padding: 8 },
  skipText: { color: '#111827' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: hp(2) },
  cardContainer: {
    width: Math.min(360, Math.round(wp(100) - wp(10))),
    borderRadius: scale(22),
    backgroundColor: '#fff',
    overflow: 'hidden',
    elevation: 14,
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    marginBottom: hp(1),
  },
  image: { width: '100%', height: hp(45), borderTopLeftRadius: scale(22), borderTopRightRadius: scale(22) },
  cardFooter: { padding: wp(5), borderBottomLeftRadius: scale(22), borderBottomRightRadius: scale(22), backgroundColor: '#fff' },
  cardTitle: { fontSize: scale(22), fontWeight: '800', marginBottom: hp(0.8), textAlign: 'center' },
  cardDesc: { color: '#6B7280', textAlign: 'center', fontSize: scale(13), lineHeight: scale(18) },
  dotsRow: { flexDirection: 'row', marginTop: 20, alignItems: 'center' },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#F6C8C8', marginHorizontal: 8, opacity: 0.95 },
  dotActive: { backgroundColor: '#E84F30', opacity: 1, transform: [{ scale: 1.15 }] },
  leafTopLeft: { position: 'absolute', top: -30, left: -20, width: 160, height: 160, opacity: 0.35, transform: [{ rotate: '-20deg' }] },
  leafBottomRight: { position: 'absolute', bottom: -30, right: -20, width: 180, height: 180, opacity: 0.35, transform: [{ rotate: '20deg' }] },
});
