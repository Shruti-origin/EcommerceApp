import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  useWindowDimensions,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import CategoriesService from '../services/categoriesService';

const SCREEN_WIDTH = Dimensions.get('window').width; // full device width for full-bleed elements

interface Card {
  id: string | number;
  image: any;
  title: string;
  count: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  children?: Category[];
  productCount?: number;
}

// Default category images mapping (same as web version)
const categoryImages: Record<string, any> = {
  'electronics': require('../../assets/categ-girl1.png'),
  'fashion': require('../../assets/categ-girl2.png'),
  'home-garden': require('../../assets/categ-girl3.png'),
  'sports-outdoors': require('../../assets/categ-girl4.png'),
};

const defaultFallback = require('../../assets/categ-girl1.png');

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
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch categories from API (same logic as web version)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const categoryTree = await CategoriesService.getCategoryTree();
        console.log('📊 Categories loaded in ProductGridNative:', categoryTree);
        setCategories(categoryTree);
      } catch (error) {
        console.error('❌ Failed to fetch categories:', error);
        // Use fallback categories
        const fallbackCategories = CategoriesService.getFallbackCategoryTree();
        setCategories(fallbackCategories);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Get category image (React Native version)
  const getCategoryImage = (category: Category): any => {
    console.log(category);
    if (category.image) {
      // If it's a URL, return {uri: ...}
      if (typeof category.image === 'string' && category.image.startsWith('http')) {
        return { uri: category.image };
      }
    }
    // Try mapping by slug
    if (categoryImages[category.slug]) {
      return categoryImages[category.slug];
    }
    return defaultFallback;
  };

  // Get product count (same as web version)
  const getProductCount = (category: Category): number => {
    return category.productCount || (category.children?.length || 0) * 5;
  };

  return (
    <View style={styles.section}>
      <GradientBar />
      <View style={styles.container}>
        <Text style={styles.heading}>Cloth's of Every Style</Text>
        <Text style={styles.subheading}>What's more, we do it right!</Text>

        {loading ? (
          <View style={{ paddingVertical: 48, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#6C87E6" />
          </View>
        ) : (
          <View style={styles.rowContainer}>
            {categories.map((category) => {
              // Force four items per row on most screens and leave small gaps
              const itemWidth = Math.max(64, Math.floor((width - 32) / 4) - 8);
              const avatarSize = Math.max(56, Math.floor(itemWidth * 0.72));
              return (
                <TouchableOpacity 
                  key={category.id} 
                  style={[styles.card, { width: itemWidth, marginHorizontal: 6 }]} 
                  activeOpacity={0.8} 
                  onPress={() => console.log('open category', category.slug)}
                >
                  <Image 
                    source={getCategoryImage(category)} 
                    style={[styles.avatar, { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 }]} 
                  />
                  <Text style={styles.title} numberOfLines={1}>{category.name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

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
