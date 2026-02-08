import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { ArrowUpDown, SlidersHorizontal, ChevronDown, Star, Minus, Plus, ShoppingCart } from 'lucide-react-native';
import { wp, hp, scale } from '../utils/responsive';
import { productService } from '../services/api';
import { guestCartUtils } from '../utils/cartUtils';
import getLocalized from '../utils/localize';

interface Product {
  id: string;
  name: string;
  price: string;
  discountPercentage?: string;
  rating?: string;
  reviews?: number;
  images?: string[];
  description?: string;
  shortDescription?: string;
  brand?: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  variants?: Array<{
    size?: string;
    color?: string;
    stock?: number;
    images?: string[];
    primaryImage?: string;
  }>;
  colorImages?: { [color: string]: { images: string[]; primaryImage?: string } };
  stock?: number;
}

const ProductDetails: React.FC<{ product?: any; navigate?: (screen: string, params?: any) => void; goBack?: () => void }> = ({ product: productProp, navigate, goBack }) => {
  console.log('[ProductDetails] mounted with product:', productProp);
  
  const { t } = useTranslation();
  // State for product data
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [currentColorImages, setCurrentColorImages] = useState<string[]>([]);

  // Fetch product details when component mounts
  useEffect(() => {
    const fetchProduct = async () => {
      const productId = productProp?.id;
      
      if (!productId) {
        setError('Product ID not found');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Fetch product details from API
        const response = await productService.getById(productId);
        const productData = response.data || response;
        console.log('🔍 Product Data:', productData);
        setProduct(productData);
        
        // Set initial size and color if variants exist
        let initialColor = 'black';
        if (productData.variants && productData.variants.length > 0) {
          const firstVariant = productData.variants[0];
          if (firstVariant.size) setSelectedSize(firstVariant.size);
          if (firstVariant.color) {
            initialColor = firstVariant.color;
            setSelectedColor(firstVariant.color);
          }
        }

        // Set initial images based on color
        if (productData.colorImages && productData.colorImages[initialColor]) {
          const colorImgs = productData.colorImages[initialColor].images;
          setCurrentColorImages(colorImgs);
          setSelectedImage(productData.colorImages[initialColor].primaryImage || colorImgs[0]);
        } else if (productData.images && productData.images.length > 0) {
          setCurrentColorImages(productData.images);
          setSelectedImage(productData.images[0]);
        } else if (productData.variants && productData.variants.length > 0) {
          const colorVariants = productData.variants.filter((v: any) => 
            v.color === initialColor && v.images && v.images.length > 0
          );
          
          if (colorVariants.length > 0) {
            const allColorImages: string[] = [];
            colorVariants.forEach((variant: any) => {
              if (variant.images) {
                allColorImages.push(...variant.images);
              }
            });
            const uniqueImages = [...new Set(allColorImages)];
            setCurrentColorImages(uniqueImages);
            const primaryImg = colorVariants.find((v: any) => v.primaryImage)?.primaryImage;
            setSelectedImage(primaryImg || uniqueImages[0]);
          }
        }
        
      } catch (error) {
        console.error('Failed to fetch product:', error);
        
        // Fallback: Use basic product data from props if API fails
        if (productProp) {
          console.log('Using fallback product data from props');
          
          // Handle image - it could be a require object, URI, or URL
          let imageValue = '';
          if (productProp.image) {
            if (typeof productProp.image === 'string') {
              imageValue = productProp.image;
            } else if (productProp.image.uri) {
              imageValue = productProp.image.uri;
            } else if (typeof productProp.image === 'number') {
              // It's a require() reference, store as special marker
              imageValue = '__LOCAL_ASSET__';
            }
          }
          
          const fallbackProduct: Product = {
            id: String(productProp.id),
            name: productProp.title || 'Product',
            price: String(productProp.price || '').replace('Rs ', '').trim(),
            description: productProp.title || 'No description available',
            images: imageValue ? [imageValue] : [],
            rating: '4.5',
            reviews: 0,
            stock: 100,
          };
          setProduct(fallbackProduct);
          
          // Set initial image from props
          if (imageValue) {
            setSelectedImage(imageValue);
            setCurrentColorImages([imageValue]);
          } else if (productProp.image) {
            // Store the raw image object for local assets
            setSelectedImage('__LOCAL_ASSET__');
          }
        } else {
          setError('Failed to load product details');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productProp?.id]);

  // Calculate final price with discount
  const basePrice = product?.price ? Number.parseFloat(product.price) : 0;
  const discountPercent = product?.discountPercentage ? Number.parseFloat(product.discountPercentage) : 0;
  const finalPrice = discountPercent > 0 ? basePrice * (1 - discountPercent / 100) : basePrice;
  const rating = product?.rating ? Number.parseFloat(product.rating) : 4.5;
  const reviews = product?.reviews || 0;

  // Get available sizes from variants
  const getAvailableSizes = (): string[] => {
    if (!product?.variants || product.variants.length === 0) return ['S', 'M', 'L', 'XL', 'XXL'];
    
    const sizes = product.variants
      .map(v => v.size)
      .filter((size): size is string => Boolean(size));
    
    return [...new Set(sizes)];
  };

  // Get available colors from variants
  const getAvailableColors = (): Array<{ id: string; name: string; color: string }> => {
    if (!product?.variants || product.variants.length === 0) {
      return [
        { id: 'black', name: 'black', color: '#000000' },
        { id: 'green', name: 'green', color: '#75bd4b' },
      ];
    }
    
    const colors = product.variants
      .map(v => v.color)
      .filter((color): color is string => Boolean(color));
    
    const uniqueColors = [...new Set(colors)];
    
    return uniqueColors.map(color => ({
      id: color.toLowerCase(),
      name: color,
      color: color.toLowerCase() === 'black' ? '#000000' :
             color.toLowerCase() === 'white' ? '#FFFFFF' :
             color.toLowerCase() === 'red' ? '#FF0000' :
             color.toLowerCase() === 'blue' ? '#0066CC' :
             color.toLowerCase() === 'green' ? '#00AA00' :
             color.toLowerCase() === 'yellow' ? '#FFDD00' :
             color.toLowerCase() === 'pink' ? '#FF69B4' :
             color.toLowerCase() === 'gray' ? '#6B7280' :
             color.toLowerCase() === 'orange' ? '#F97316' :
             '#808080'
    }));
  };

  // Get stock for a specific size and color combination
  const getVariantStock = (size: string, color: string): number => {
    if (!product?.variants || product.variants.length === 0) {
      return product?.stock || 0;
    }
    
    const variant = product.variants.find(v => 
      v.size === size && v.color?.toLowerCase() === color.toLowerCase()
    );
    
    return variant?.stock || 0;
  };

  // Check if a specific size is available for the selected color
  const isSizeAvailable = (size: string): boolean => {
    if (!selectedColor) return true;
    return getVariantStock(size, selectedColor) > 0;
  };

  // Get current variant stock
  const getCurrentVariantStock = (): number => {
    if (!selectedSize || !selectedColor) {
      return product?.stock || 0;
    }
    
    return getVariantStock(selectedSize, selectedColor);
  };

  // Get images for selected color
  const getImagesForColor = (color: string): string[] => {
    if (!product) return [];
    
    // Extract images from variants for the selected color
    if (product.variants && product.variants.length > 0) {
      const colorVariants = product.variants.filter(v => {
        const matchesColor = v.color?.toLowerCase() === color.toLowerCase();
        const hasImages = v.images && v.images.length > 0;
        return matchesColor && hasImages;
      });
      
      if (colorVariants.length > 0) {
        const allImages: string[] = [];
        colorVariants.forEach(variant => {
          if (variant.images) {
            allImages.push(...variant.images);
          }
        });
        const uniqueImages = [...new Set(allImages)];
        return uniqueImages;
      }
    }
    
    // If product has color-specific images object, use those
    if (product.colorImages && product.colorImages[color]) {
      return product.colorImages[color].images;
    }
    
    // If product has general images array, use those as fallback
    if (product.images && product.images.length > 0) {
      return product.images;
    }
    
    return [];
  };

  // Handle color selection and update images
  const handleColorSelection = (colorName: string) => {
    setSelectedColor(colorName);
    const colorImages = getImagesForColor(colorName);
    setCurrentColorImages(colorImages);
    
    // Set primary image for the selected color
    if (colorImages.length > 0) {
      const variantWithPrimary = product?.variants?.find(v => 
        v.color?.toLowerCase() === colorName.toLowerCase() && v.primaryImage
      );
      
      if (variantWithPrimary?.primaryImage) {
        setSelectedImage(variantWithPrimary.primaryImage);
      } else if (product?.colorImages && product.colorImages[colorName]?.primaryImage) {
        setSelectedImage(product.colorImages[colorName].primaryImage!);
      } else {
        setSelectedImage(colorImages[0]);
      }
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    
    const currentStock = getCurrentVariantStock();
    
    // Validate stock availability
    if (currentStock === 0) {
      Alert.alert('Out of Stock', 'This variant is out of stock!');
      return;
    }
    
    // Validate quantity
    if (quantity > currentStock) {
      Alert.alert('Limited Stock', `Only ${currentStock} items available for this variant!`);
      return;
    }
    
    // Create a unique ID for this variant combination
    const variantId = (product.variants && product.variants.length > 0)
      ? `${product.id}-${selectedSize || 'default'}-${selectedColor || 'default'}`.toLowerCase()
      : product.id;
    
    const displayImage = selectedImage || (product.images && product.images.length > 0 ? product.images[0] : '');
    
    const cartItem = {
      id: variantId,
      productId: product.id,
      name: getLocalized(product, 'name') || product.name,
      price: finalPrice,
      quantity: quantity,
      size: selectedSize || 'Free Size',
      color: selectedColor || 'Default',
      image: displayImage,
      brand: product.brand || 'Unknown',
      category: getLocalized(product.category, 'name') || product.category?.name || 'Unknown',
      maxStock: currentStock,
      description: getLocalized(product, 'description') || getLocalized(product, 'shortDescription') || getLocalized(product, 'name') || product.description || product.shortDescription || product.name
    };
    
    try {
      // Get current cart (await the async call)
      const cart = await guestCartUtils.getCart();
      const existingItem = cart.items?.find((item: any) => item.id === variantId);
      
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > currentStock) {
          Alert.alert('Cannot Add More', `Only ${currentStock} available for this variant!`);
          return;
        }
        await guestCartUtils.updateQuantity(variantId, newQuantity);
      } else {
        await guestCartUtils.addItem(cartItem, quantity);
      }
      
      Alert.alert('Success', `Added ${quantity} item(s) to cart successfully!`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', 'Failed to add item to cart. Please try again.');
    }
  };

  const sizes = getAvailableSizes();
  const colors = getAvailableColors();

  const incrementQuantity = () => {
    const currentStock = getCurrentVariantStock();
    setQuantity(prev => Math.min(prev + 1, currentStock));
  };
  
  const decrementQuantity = () => setQuantity(prev => Math.max(1, prev - 1));

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={styles.loadingText}>Loading product...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error or not found state
  if (error || !product) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || 'Product not found.'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Handle image display - check if it's already a full URL or needs backend URL
  const getImageSource = (imgPath: string) => {
    if (!imgPath) return require('../../assets/s-h1.png');
    // If it's a local asset marker, use the original prop image
    if (imgPath === '__LOCAL_ASSET__' && productProp?.image) {
      return productProp.image;
    }
    // If it's already a full URL, use it as is
    if (imgPath.startsWith('http://') || imgPath.startsWith('https://')) {
      return imgPath;
    }
    // If it's a require object (local asset), use it
    if (typeof imgPath === 'object') {
      return imgPath;
    }
    // Otherwise, prepend backend URL
    return `https://backend.originplatforms.co${imgPath}`;
  };

  const displayImage = selectedImage 
    ? getImageSource(selectedImage)
    : (product?.images && product.images.length > 0 
        ? getImageSource(product.images[0])
        : (productProp?.image || require('../../assets/s-h1.png')));

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Filters Row - commented out
        <View style={styles.filtersRow}>
          <TouchableOpacity style={styles.filterBtn}>
            <ArrowUpDown size={14} color="#111827" />
            <Text style={styles.filterText}>Sort</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.filterDropdown}>
            <Text style={styles.filterText}>Category</Text>
            <ChevronDown size={14} color="#111827" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.filterDropdown}>
            <Text style={styles.filterText}>Age</Text>
            <ChevronDown size={14} color="#111827" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.filterBtn}>
            <SlidersHorizontal size={14} color="#111827" />
            <Text style={styles.filterText}>Filter</Text>
          </TouchableOpacity>
        </View>
        */}

        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image
            source={typeof displayImage === 'string' ? { uri: displayImage } : displayImage}
            style={styles.productImage}
            resizeMode="cover"
          />
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          {/* Price and Rating */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>Rs {finalPrice.toFixed(2)}</Text>
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} size={14} fill={star <= Math.round(rating) ? "#FFA500" : "#fff"} color="#FFA500" />
              ))}
              <Text style={styles.reviewCount}>({reviews} reviews)</Text>
            </View>
          </View>

          {/* Product Title */}
          <Text style={styles.productTitle}>
            {getLocalized(product, 'name') || product?.name || 'Product'}
          </Text>

          {/* Size Section */}
          <View style={styles.sizeSection}>
            <Text style={styles.sizeLabel}>Size</Text>
            <TouchableOpacity>
              <Text style={styles.sizeChart}>Size Chart</Text>
            </TouchableOpacity>
          </View>

          {/* Size Buttons */}
          <View style={styles.sizesRow}>
            {sizes.map((size) => {
              const available = isSizeAvailable(size);
              return (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.sizeBtn,
                    selectedSize === size && styles.sizeBtnSelected,
                    !available && styles.sizeBtnDisabled,
                  ]}
                  onPress={() => available && setSelectedSize(size)}
                  disabled={!available}
                >
                  <Text
                    style={[
                      styles.sizeText,
                      selectedSize === size && styles.sizeTextSelected,
                      !available && styles.sizeTextDisabled,
                    ]}
                  >
                    {size}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Color Selection */}
          {colors.length > 0 && (
            <>
              <View style={styles.sizeSection}>
                <Text style={styles.sizeLabel}>Color</Text>
              </View>
              <View style={styles.colorsRow}>
                {colors.map((c) => (
                  <TouchableOpacity
                    key={c.id}
                    style={[
                      styles.colorBtn,
                      selectedColor === c.name && styles.colorBtnSelected,
                    ]}
                    onPress={() => handleColorSelection(c.name)}
                  >
                    <View style={[styles.colorCircle, { backgroundColor: c.color }]} />
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {/* Stock Availability */}
          <View style={styles.stockSection}>
            <Text style={styles.sizeLabel}>Availability</Text>
            {getCurrentVariantStock() > 0 ? (
              <Text style={styles.stockInStock}>
                ✓ In Stock ({getCurrentVariantStock()} available)
              </Text>
            ) : (
              <Text style={styles.stockOutOfStock}>✗ Out of Stock</Text>
            )}
          </View>

          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={styles.descriptionTitle}>Description</Text>
            <Text style={styles.descriptionText}>
              {getLocalized(product, 'description') || getLocalized(product, 'shortDescription') || 'No description available.'}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Bar - Fixed */}
      <View style={styles.bottomBar}>
        <View style={styles.quantityContainer}>
          <TouchableOpacity style={styles.quantityBtn} onPress={decrementQuantity}>
            <Minus size={16} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{quantity}</Text>
          <TouchableOpacity style={styles.quantityBtn} onPress={incrementQuantity}>
            <Plus size={16} color="#111827" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.addToCartBtn, getCurrentVariantStock() === 0 && styles.addToCartBtnDisabled]}
          onPress={handleAddToCart}
          disabled={getCurrentVariantStock() === 0}
        >
          <ShoppingCart size={20} color="#fff" />
          <Text style={styles.addToCartText}>
            {getCurrentVariantStock() === 0 ? 'Out of Stock' : 'Add to Cart'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backBtn: {
    padding: 4,
    marginRight: wp(2),
  },
  filtersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 6,
    marginRight: 8,
    backgroundColor: '#fff',
  },
  filterDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 6,
    marginRight: 8,
    backgroundColor: '#fff',
  },
  filterText: {
    fontSize: 13,
    color: '#111827',
    fontWeight: '500',
    marginLeft: 4,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 0.75,
    backgroundColor: '#FFF5F0',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productInfo: {
    padding: wp(4),
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewCount: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 6,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#111827',
    marginBottom: 20,
    lineHeight: 22,
  },
  sizeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sizeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  sizeChart: {
    fontSize: 13,
    color: '#6B7280',
    textDecorationLine: 'underline',
  },
  sizesRow: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  sizeBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: '#fff',
  },
  sizeBtnSelected: {
    borderColor: '#111827',
    borderWidth: 2,
  },
  sizeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  sizeTextSelected: {
    color: '#111827',
    fontWeight: '700',
  },
  descriptionSection: {
    marginBottom: 80,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 22,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    textAlign: 'center',
  },
  colorsRow: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12,
  },
  colorBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  colorBtnSelected: {
    borderColor: '#FF6B35',
    borderWidth: 3,
  },
  colorCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  sizeBtnDisabled: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  sizeTextDisabled: {
    color: '#D1D5DB',
  },
  stockSection: {
    marginBottom: 24,
  },
  stockInStock: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
    marginTop: 8,
  },
  stockOutOfStock: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '600',
    marginTop: 8,
  },
  addToCartBtnDisabled: {
    backgroundColor: '#9CA3AF',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#fff',
  },
  quantityBtn: {
    padding: 12,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    paddingHorizontal: 16,
  },
  addToCartBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B35',
    paddingVertical: 14,
    borderRadius: 25,
  },
  addToCartText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginLeft: 8,
  },
});

export default ProductDetails;
