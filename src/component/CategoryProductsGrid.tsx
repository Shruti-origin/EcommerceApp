import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  useWindowDimensions,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Heart } from 'lucide-react-native';
import CategoriesService from '../services/categoriesService';
import ProductsService from '../services/productsService';
import { guestWishlistUtils } from '../utils/wishlistUtils';

// Fallback images for when API doesn't return images
const placeholderImage = require('../../assets/s-h1.png');

interface Product {
  id: string;
  sku?: string;
  name: string;
  description?: string;
  shortDescription?: string;
  brand?: string;
  price: string;
  mrp?: string;
  discountPercentage?: string;
  taxPercentage?: string;
  images?: string[];
  rating?: string;
  reviewCount?: number;
  status?: string;
  tags?: string[];
  category?: {
    id: string;
    name: string;
    slug: string;
    description?: string;
  };
  vendor?: {
    id: string;
    businessName: string;
    status: string;
  };
  inventory?: any[];
  stock?: number;
  variants?: any[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  children?: Category[];
  image?: string;
}

interface ProductItem {
  id: string; // keep as string to preserve backend IDs (UUIDs)
  image: any;
  title: string;
  price: string;
  badge?: string;
  badgeColor?: string;
  raw?: Product; // original API product for navigation/fetching
}



const ProductCard: React.FC<{ item: ProductItem; cardWidth: number; isLeft?: boolean; favorites: Record<string, boolean>; toggleFavorite: (id: number | string) => void; navigate?: (screen: string, params?: any) => void }> = ({ item, cardWidth, isLeft, favorites, toggleFavorite, navigate }) => {
  const imageHeight = Math.round(cardWidth * 1.18);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => navigate?.('ProductDetails', { product: item.raw || item })}
      accessibilityLabel={`Open ${item.title}`}
      style={[styles.card, { width: cardWidth, marginRight: isLeft ? 2 : 0 }]}
    >
      <View style={styles.imageContainer}>
        <Image source={item.image} style={[styles.image, { height: imageHeight }]} />

        {/* Badge (top-left) */}
        {item.badge ? (
          <View style={[styles.badge, { backgroundColor: item.badgeColor || '#FF3F88' }]}>
            <Text style={styles.badgeText}>{item.badge}</Text>
          </View>
        ) : null}

        {/* Favorite button (top-right) */}
        <TouchableOpacity style={styles.favBtn} onPress={async () => {
          const isInWishlist = await guestWishlistUtils.isInWishlist(item.id);
          if (isInWishlist) {
            await guestWishlistUtils.removeItem(item.id);
            toggleFavorite(item.id);
          } else {
            await guestWishlistUtils.addItem({
              id: item.id,
              title: item.title,
              price: item.price,
              image: item.image,
            });
            toggleFavorite(item.id);
          }
        }} accessibilityLabel="Toggle wishlist">
          <Heart size={16} color={favorites[item.id] ? '#ef4444' : '#111827'} fill={favorites[item.id] ? '#ef4444' : 'none'} />
        </TouchableOpacity>
      </View>

      <View style={styles.meta}>
        <Text style={styles.productTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.price}>{item.price}</Text>
      </View>
    </TouchableOpacity>
  );
};

const CategoryProductsGrid: React.FC<{ title?: string; items?: ProductItem[]; categoryId?: string; navigate?: (screen: string, params?: any) => void }> = ({ title, items, categoryId, navigate }) => {
  const { width } = useWindowDimensions();
  const padding = 0;
  const columns = 2;
  const gap = 2;
  const cardWidth = Math.floor((width - padding * 2 - gap * (columns - 1)) / columns);

  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [categoryProducts, setCategoryProducts] = useState<ProductItem[]>([]);
  const [categoryTitle, setCategoryTitle] = useState(title || '');

  // Accept either number or string ids and store keys as strings
  const toggleFavorite = (id: number | string) => {
    const key = String(id);
    setFavorites(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Helper function to get product image with fallback
  const getProductImage = (product: Product): any => {
    // First try main product images
    if (product.images && product.images.length > 0 && product.images[0]) {
      return { uri: product.images[0] };
    }

    // Then try to get image from variants
    if (product.variants && product.variants.length > 0) {
      for (const variant of product.variants) {
        if (variant.images && variant.images.length > 0) {
          return { uri: `https://backend.originplatforms.co${variant.images[0]}` };
        }
      }
    }

    // Finally, use placeholder
    return placeholderImage;
  };

  // Get badge type based on product tags or status
  const getProductBadges = (product: Product) => {
    if (product.tags?.includes('hot') || product.tags?.includes('trending')) {
      return { text: 'Hot', color: '#F74B81' };
    }
    if (product.discountPercentage && parseFloat(product.discountPercentage) > 0) {
      return { text: 'Sale', color: '#2EBB77' };
    }
    if (product.tags?.includes('new')) {
      return { text: 'New', color: '#B479D9' };
    }
    return null;
  };

  // Transform API Product to ProductItem
  const transformProduct = (product: Product): ProductItem => {
    const badge = getProductBadges(product);
    const basePrice = parseFloat(product.price);
    const discountPercent = product.discountPercentage ? parseFloat(product.discountPercentage) : 0;
    const finalPrice = discountPercent > 0 ? basePrice * (1 - discountPercent / 100) : basePrice;

    return {
      id: String(product.id),
      image: getProductImage(product),
      title: product.name,
      price: `Rs ${finalPrice.toFixed(0)}`,
      badge: badge?.text,
      badgeColor: badge?.color,
      raw: product,
    };
  };

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      if (items && items.length > 0) {
        // Use provided items if available
        setCategoryProducts(items);
        return;
      }

      try {
        setLoading(true);

        // Fetch categories and products
        const categoryTree = await CategoriesService.getCategoryTree();
        const productsResponse = await ProductsService.getProductCatalog({ limit: 100 });
        const allProducts: Product[] = productsResponse.data || productsResponse || [];

        if (categoryId) {
          // Try to find category metadata (to show nicer title) but still filter products even if metadata is missing
          const category = categoryTree.find((cat: Category) => cat.id === categoryId);
          if (category) {
            setCategoryTitle(category.name);
          } else {
            // Fallback title
            setCategoryTitle(title || 'Products');
          }

          // Filter products that match the categoryId or fall under its children (if metadata found)
          const categoryProductList = allProducts.filter((product: Product) =>
            product.category?.id === categoryId || (category && category.children?.some((child: Category) => child.id === product.category?.id))
          );

          // Special case: a "featured" category may represent uncategorized or highlighted products
          if (categoryProductList.length === 0 && categoryId === 'featured') {
            // Find products without a known category (uncategorized)
            const knownCategoryIds = new Set<string>(
              categoryTree.flatMap((c: Category) => [c.id, ...(c.children?.map(ch => ch.id) || [])])
            );
            const uncategorized = allProducts.filter((p: Product) => !p.category || !knownCategoryIds.has(p.category.id));
            setCategoryTitle('Featured Products');
            setCategoryProducts(uncategorized.slice(0, 8).map(transformProduct));
          } else {
            setCategoryProducts(categoryProductList.slice(0, 8).map(transformProduct));
          }
        } else {
          // Group products by category
          const grouped: { category: Category; products: Product[] }[] = [];

          for (const category of categoryTree) {
            const categoryProductList = allProducts.filter((product: Product) =>
              product.category?.id === category.id || 
              category.children?.some((child: Category) => child.id === product.category?.id)
            );

            if (categoryProductList.length > 0) {
              grouped.push({
                category,
                products: categoryProductList.slice(0, 8)
              });
            }
          }

          // Use first category with products
          if (grouped.length > 0) {
            setCategoryTitle(grouped[0].category.name);
            setCategoryProducts(grouped[0].products.map(transformProduct));
          }
        }

      } catch (error) {
        console.error('Failed to fetch category products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryProducts();
  }, [categoryId]);

  const displayItems = items || categoryProducts;

  if (loading) {
    return (
      <View style={[styles.section, { justifyContent: 'center', alignItems: 'center', minHeight: 200 }]}>
        <ActivityIndicator size="large" color="#E05659" />
      </View>
    );
  }

  if (displayItems.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <View style={styles.headerRow}>
        <Text style={styles.heading}>{categoryTitle}</Text>
        <TouchableOpacity activeOpacity={0.7} onPress={() => navigate?.('CategoryProducts', { categoryId, title: categoryTitle, items: categoryProducts })} style={styles.seeMoreBtn}>
          <Text style={styles.seeMore}>See More</Text>
          <Text style={styles.seeMoreArrow}>›</Text>
        </TouchableOpacity>
      </View> 

      <View style={{ paddingHorizontal: 0 }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          {displayItems.map((item, index) => (
            <ProductCard key={String(item.id)} item={item} cardWidth={cardWidth} isLeft={index % 2 === 0} favorites={favorites} toggleFavorite={toggleFavorite} navigate={navigate} />
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({

  section: {
    marginTop: 12,
    paddingVertical: 1,
    paddingHorizontal: 0,
    backgroundColor: '#fff',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  heading: {
    fontSize: 18,
    fontWeight: '800',
  },
  seeMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  seeMoreArrow: {
    color: '#E05659',
    fontSize: 22,
    marginLeft: 6,
    fontWeight: '500',
    lineHeight: 18,
  },
  seeMore: {
    color: '#E05659',
    fontSize: 12,
    fontWeight: '700',
  },
  card: {
    
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    // subtle shadow
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 3, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#f6f6f6',
  },
  image: {
    width: '100%',
    resizeMode: 'cover',
    
  },
  badge: {
    position: 'absolute',
    width: 60,
    height:31,
    top: -1,
    left: -5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderTopLeftRadius: 15,
    borderBottomRightRadius:20,
    zIndex: 2,
  },
  badgeText: {
    color: '#fff',
    fontWeight: '400',
    fontSize: 16,
  },
  heart: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#fff',
    width: 38,
    height: 38,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F2F2F2',
  },
  favBtn: {
    position: 'absolute',
    right: 8,
    top: 8,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  heartText: {
    color: '#FF5A78',
    fontSize: 14,
    fontWeight: '700',
  },
  meta: {
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  productTitle: {
    fontWeight: '700',
    fontSize: 13,
    marginBottom: 6,
    color: '#111827',
  },
  price: {
    color: '#111827',
    fontWeight: '800',
  },
});

// A wrapper component that fetches and renders multiple category sections
export const CategorySections: React.FC<{ navigate?: (screen: string, params?: any) => void }> = ({ navigate }) => {
  const [categoryGroups, setCategoryGroups] = useState<{ category: Category; products: Product[] }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllCategories = async () => {
      try {
        setLoading(true);

        // Fetch categories and products
        console.log('📁 Fetching categories...');
        const categoryTree = await CategoriesService.getCategoryTree();
        console.log('📊 Categories loaded:', categoryTree);

        console.log('🛍️ Fetching products...');
        const productsResponse = await ProductsService.getProductCatalog({ limit: 100 });
        const allProducts: Product[] = productsResponse.data || productsResponse || [];
        console.log('📦 Products loaded:', allProducts);

        // Group products by category
        const grouped: { category: Category; products: Product[] }[] = [];

        for (const category of categoryTree) {
          // Get products for this category and its subcategories
          const categoryProductList = allProducts.filter((product: Product) => {
            if (product.category?.id === category.id) return true;
            if (category.children && category.children.length > 0) {
              return category.children.some((child: Category) => child.id === product.category?.id);
            }
            return false;
          });

          if (categoryProductList.length > 0) {
            grouped.push({
              category,
              products: categoryProductList.slice(0, 8)
            });
          }
        }

        // Handle uncategorized products
        const categorizedProductIds = new Set();
        grouped.forEach(group => {
          group.products.forEach(product => {
            categorizedProductIds.add(product.id);
          });
        });

        const uncategorizedProducts = allProducts.filter((product: Product) =>
          !categorizedProductIds.has(product.id)
        );

        if (uncategorizedProducts.length > 0) {
          grouped.unshift({
            category: {
              id: 'featured',
              name: 'Featured Products',
              slug: 'featured-products',
              description: 'Featured products from our collection'
            },
            products: uncategorizedProducts.slice(0, 8)
          });
        }

        console.log('📋 Grouped products by category:', grouped);
        setCategoryGroups(grouped);

      } catch (error) {
        console.error('❌ Failed to fetch categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllCategories();
  }, []);

  if (loading) {
    return (
      <View style={{ paddingVertical: 40, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#E05659" />
        <Text style={{ marginTop: 10, color: '#666' }}>Loading products...</Text>
      </View>
    );
  }

  if (categoryGroups.length === 0) {
    return (
      <View style={{ paddingVertical: 40, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#666' }}>No products available</Text>
      </View>
    );
  }

  return (
    <>
      {categoryGroups.map(({ category }) => (
        <CategoryProductsGrid
          key={category.id}
          categoryId={category.id}
          navigate={navigate}
        />
      ))}
    </>
  );
};

export default CategoryProductsGrid;
