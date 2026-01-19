import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Truck, Search, Menu, Star, ShoppingBag } from 'lucide-react-native';

const Header = () => {
  return (
    <View style={styles.wrapper}>
      <View style={styles.promo}>
        <Text style={styles.promoText}>Buy 3 Get 25% Off, Shop Now &gt;&gt;</Text>
        <TouchableOpacity style={styles.promoCart} activeOpacity={0.9}>
          <Truck size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchRow}>
        <TouchableOpacity style={styles.menuBtn} activeOpacity={0.7}>
          <Menu size={18} color="#222" />
        </TouchableOpacity>

        <View style={styles.searchBox}>
          <Search size={18} color="#9EA0A4" />
          <TextInput
            style={styles.input}
            placeholder="Search any product.."
            placeholderTextColor="#9EA0A4"
            returnKeyType="search"
          />
        </View>

        <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
          <Star size={18} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.cartBtn} activeOpacity={0.7}>
          <ShoppingBag size={18} color="#222" />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>2</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'ios' ? 46 : 40,
  },
  promo: {
    backgroundColor: '#e56b6f',
    height: 39,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  promoText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    horizontalAlign: 'center',
    verticalAlign:'middle',
    paddingLeft:'50',

  },
  promoCart: {
    backgroundColor: '#3bbf6b',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoCartText: {
    color: '#fff',
    fontSize: 16,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuBtn: {
    padding: 8,
    marginRight: 8,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f4f4f4',
    paddingHorizontal: 10,
    height: 40,
    borderRadius: 8,
  },
  searchIcon: {
    fontSize: 16,
    color: '#9EA0A4',
  },
  input: {
    flex: 1,
    marginLeft: 8,
    padding: 0,
    color: '#222',
  },
  iconBtn: {
    padding: 8,
    marginLeft: 8,
  },
  icon: {
    fontSize: 18,
  },
  cartBtn: {
    padding: 8,
    marginLeft: 6,
  },
  badge: {
    position: 'absolute',
    right: 2,
    top: 2,
    backgroundColor: '#10b981',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
});

export default Header;
