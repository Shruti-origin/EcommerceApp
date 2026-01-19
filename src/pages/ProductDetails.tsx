import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { ChevronLeft, Search, Bell, ShoppingCart, ArrowUpDown, SlidersHorizontal, ChevronDown, Star, Minus, Plus } from 'lucide-react-native';

const ProductDetails: React.FC<{ product?: any; navigate?: (screen: string, params?: any) => void }> = ({ product, navigate }) => {
  console.log('[ProductDetails] mounted with product:', product);
  const [selectedSize, setSelectedSize] = useState<string>(product?.size || '');
  const [quantity, setQuantity] = useState<number>(1);

  const sizes = ['S', 'M', 'L', 'XL', 'XXL'];

  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => setQuantity(prev => Math.max(1, prev - 1));

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigate?.('Home')}>
            <ChevronLeft size={24} color="#111827" />
          </TouchableOpacity>

          {/* <View style={styles.searchBar}>
            <Search size={18} color="#9CA3AF" />
            <TextInput
              style={styles.searchInput}
              placeholder="Ghagra"
              placeholderTextColor="#9CA3AF"
            />
          </View> */}
{/* 
          <TouchableOpacity style={styles.iconBtn}>
            <Bell size={22} color="#111827" />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>2</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconBtn}>
            <ShoppingCart size={22} color="#111827" />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>0</Text>
            </View>
          </TouchableOpacity> */}
        </View>

        {/* Filters Row */}
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

        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image
            source={product?.image || require('../../assets/s-h1.png')}
            style={styles.productImage}
            resizeMode="cover"
          />
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          {/* Price and Rating */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>{product?.price ? `Rs ${product.price}` : 'Rs 500'}</Text>
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} size={14} fill="#FFA500" color="#FFA500" />
              ))}
              <Text style={styles.reviewCount}>({product?.reviews ?? 357} reviews)</Text>
            </View>
          </View>

          {/* Product Title */}
          <Text style={styles.productTitle}>
            {product?.title || 'Totally Feel Good Oversized Crew Sweatshirt'}
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
            {sizes.map((size) => (
              <TouchableOpacity
                key={size}
                style={[
                  styles.sizeBtn,
                  selectedSize === size && styles.sizeBtnSelected,
                ]}
                onPress={() => setSelectedSize(size)}
              >
                <Text
                  style={[
                    styles.sizeText,
                    selectedSize === size && styles.sizeTextSelected,
                  ]}
                >
                  {size}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={styles.descriptionTitle}>Description</Text>
            <Text style={styles.descriptionText}>
              Wrap yourself in warmth with our dreamy light pink oversized crew
              days ahead. This ultra-comfortable gem offers a loose fit that
              embraces you in softness. Picture yourself snuggled up, pairing
              it with leggings and your favorite kicks, creating a snug, off-duty
              look that exudes charm and comfort. Dive into ultimate style and
              comfort with this irresistibly soft, light pink cocoon of
              coziness.
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

        <TouchableOpacity style={styles.addToCartBtn}>
          <ShoppingCart size={20} color="#fff" />
          <Text style={styles.addToCartText}>Add to Cart</Text>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backBtn: {
    padding: 4,
    marginRight: 8,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#111827',
  },
  iconBtn: {
    padding: 4,
    marginLeft: 8,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
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
    padding: 16,
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
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
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
    borderRadius: 8,
  },
  addToCartText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginLeft: 8,
  },
});

export default ProductDetails;
