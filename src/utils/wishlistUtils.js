/**
 * Guest Wishlist Utilities
 * Manages wishlist items in AsyncStorage for guest users
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const WISHLIST_KEY = '@guest_wishlist';

export const guestWishlistUtils = {
  /**
   * Get the current wishlist
   */
  getWishlist: async () => {
    try {
      const data = await AsyncStorage.getItem(WISHLIST_KEY);
      if (!data) {
        return { items: [] };
      }
      return JSON.parse(data);
    } catch (error) {
      console.error('Error getting wishlist:', error);
      return { items: [] };
    }
  },

  /**
   * Add item to wishlist
   */
  addItem: async (product) => {
    try {
      const wishlist = await guestWishlistUtils.getWishlist();
      
      // Check if item already exists
      const existingIndex = wishlist.items.findIndex(item => item.id === product.id);
      
      if (existingIndex === -1) {
        // Add new item
        wishlist.items.push({
          id: product.id,
          title: product.title || product.name,
          price: product.price,
          image: product.image,
          addedAt: new Date().toISOString(),
        });
        
        await AsyncStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
        return { success: true, message: 'Added to wishlist' };
      }
      
      return { success: false, message: 'Already in wishlist' };
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      return { success: false, message: 'Failed to add to wishlist' };
    }
  },

  /**
   * Remove item from wishlist
   */
  removeItem: async (productId) => {
    try {
      const wishlist = await guestWishlistUtils.getWishlist();
      wishlist.items = wishlist.items.filter(item => item.id !== productId);
      await AsyncStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
      return { success: true };
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      return { success: false };
    }
  },

  /**
   * Check if item is in wishlist
   */
  isInWishlist: async (productId) => {
    try {
      const wishlist = await guestWishlistUtils.getWishlist();
      return wishlist.items.some(item => item.id === productId);
    } catch (error) {
      console.error('Error checking wishlist:', error);
      return false;
    }
  },

  /**
   * Clear entire wishlist
   */
  clearWishlist: async () => {
    try {
      await AsyncStorage.removeItem(WISHLIST_KEY);
      return { success: true };
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      return { success: false };
    }
  },

  /**
   * Get wishlist count
   */
  getCount: async () => {
    try {
      const wishlist = await guestWishlistUtils.getWishlist();
      return wishlist.items.length;
    } catch (error) {
      console.error('Error getting wishlist count:', error);
      return 0;
    }
  },
};

export default guestWishlistUtils;
