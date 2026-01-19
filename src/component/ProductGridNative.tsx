import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Dimensions,
  useWindowDimensions,
  TouchableOpacity,
} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width; // full device width for full-bleed elements

interface Card {
  id: number;
  image: any;
  title: string;
  count: number;
}

const cards: Card[] = [
  { id: 1, image: require('../../assets/categ-girl1.png'), title: 'Saree', count: 15 },
  { id: 2, image: require('../../assets/categ-girl2.png'), title: 'Ghagra', count: 8 },
  { id: 3, image: require('../../assets/categ-girl3.png'), title: 'Festival', count: 18 },
  { id: 4, image: require('../../assets/categ-girl4.png'), title: 'Kurati', count: 9 },
];

const GradientBar: React.FC = () => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const LinearGradient = require('react-native-linear-gradient').default;

    return (
      <LinearGradient
        colors={["#EAC645", "#F2A173", "#97DEC0", "#6C87E6", "#CE4EEE", "#EF5B2C"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradientBar}
      />
    );
  } catch (e) {
    return <View style={[styles.gradientBar, { backgroundColor: '#EAC645' }]} />;
  }
};

const ProductGridNative: React.FC = () => {
  const { width } = useWindowDimensions();
  const numColumns = getNumColumns(width || Dimensions.get('window').width);

  const renderItem = ({ item }: { item: Card }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={() => console.log('open', item.title)}>
      <Image source={item.image} style={styles.avatar} />
      <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.section}>
        <GradientBar />
      <View style={styles.container}>
        <Text style={styles.heading}>Cloth's of Every Style</Text>
        <Text style={styles.subheading}>What's more, we do it right!</Text>

        {/* Render categories in a single responsive row so all items are visible */}
        <View style={styles.rowContainer}>
          {cards.map((item) => {
            // Force four items per row on most screens and leave small gaps
            const itemWidth = Math.max(64, Math.floor((width - 32) / 4) - 8);
            const avatarSize = Math.max(56, Math.floor(itemWidth * 0.72));
            return (
              <TouchableOpacity key={item.id} style={[styles.card, { width: itemWidth, marginHorizontal: 6 }]} activeOpacity={0.8} onPress={() => console.log('open', item.title)}>
                <Image source={item.image} style={[styles.avatar, { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 }]} />
                <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.barWrap}>
          <GradientBar />
        </View>
      </View>
    </View>
  );
};

function getNumColumns(width: number) {
  if (width >= 1200) return 5;
  if (width >= 900) return 5;
  if (width >= 700) return 4;
  if (width >= 500) return 3;
  return 2;
}

const styles = StyleSheet.create({
  section: {
    marginTop: 1,
    paddingVertical: 24,
    backgroundColor: '#fff',
  },
  container: {
    maxWidth: 1200,
    alignSelf: 'center',
    paddingHorizontal: 16,
    width: '100%',
  },
  heading: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 3,
    marginTop: 10,
  },
  subheading: {
    textAlign: 'center',
    color: '#6b7280',
    marginBottom: 16,
  },
  horizontalList: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  card: {
    alignItems: 'center',
    marginHorizontal: 6,
    marginBottom: 12,
  },
  avatar: {
    // base style; actual size is set inline for responsive items
    resizeMode: 'cover',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  count: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  barWrap: {
    marginTop: 20,
    alignItems: 'center',
  },
  gradientBar: {
    width: SCREEN_WIDTH,
    height: 2,
    borderRadius: 8,
  },
});

export default ProductGridNative;
