import AsyncStorage from '@react-native-async-storage/async-storage';

// Cart utilities for managing guest and user cart functionality

const GUEST_CART_KEY = 'guestCart';
const USER_TOKEN_KEY = 'userToken';

// Initialize cart system
export const initializeCart = async () => {
  console.log('🛒 Initializing cart system...');
  
  // Check if user is logged in
  const token = await AsyncStorage.getItem(USER_TOKEN_KEY);
  
  if (token) {
    // User is logged in, load user cart
    await loadUserCart(token);
  } else {
    // User is guest, ensure guest cart exists
    await ensureGuestCart();
  }
};

// Ensure guest cart exists in AsyncStorage
const ensureGuestCart = async () => {
  let guestCart = await AsyncStorage.getItem(GUEST_CART_KEY);
  if (!guestCart) {
    const emptyCart = {
      items: [],
      total: 0,
      itemCount: 0,
      lastUpdated: new Date().toISOString()
    };
    await AsyncStorage.setItem(GUEST_CART_KEY, JSON.stringify(emptyCart));
    console.log('📝 Created new guest cart');
  }
};

// Load user cart from server
const loadUserCart = async (token) => {
  try {
    console.log('📥 Loading user cart from server...');
    // This would typically make an API call to fetch user's cart
    // For now, we'll just ensure a cart exists
    await ensureGuestCart();
  } catch (error) {
    console.error('❌ Failed to load user cart:', error);
    // Fallback to guest cart
    await ensureGuestCart();
  }
};

// Guest cart utilities
export const guestCartUtils = {
  // Get current guest cart
  getCart: async () => {
    const cart = await AsyncStorage.getItem(GUEST_CART_KEY);
    return cart ? JSON.parse(cart) : {
      items: [],
      total: 0,
      itemCount: 0,
      lastUpdated: new Date().toISOString()
    };
  },

  // Add item to guest cart
  addItem: async (product, quantity = 1) => {
    const cart = await guestCartUtils.getCart();
    const existingItemIndex = cart.items.findIndex(item => item.id === product.id);

    if (existingItemIndex > -1) {
      // Update existing item quantity
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      cart.items.push({
        ...product,
        quantity,
        addedAt: new Date().toISOString()
      });
    }

    // Recalculate totals
    cart.itemCount = cart.items.reduce((total, item) => total + item.quantity, 0);
    cart.total = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    cart.lastUpdated = new Date().toISOString();

    await AsyncStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
    
    console.log('➕ Added item to cart:', product.name, 'Quantity:', quantity);
    return cart;
  },

  // Remove item from guest cart
  removeItem: async (productId) => {
    const cart = await guestCartUtils.getCart();
    cart.items = cart.items.filter(item => item.id !== productId);

    // Recalculate totals
    cart.itemCount = cart.items.reduce((total, item) => total + item.quantity, 0);
    cart.total = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    cart.lastUpdated = new Date().toISOString();

    await AsyncStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
    
    console.log('🗑️ Removed item from cart:', productId);
    return cart;
  },

  // Update item quantity
  updateQuantity: async (productId, quantity) => {
    if (quantity <= 0) {
      return await guestCartUtils.removeItem(productId);
    }

    const cart = await guestCartUtils.getCart();
    const itemIndex = cart.items.findIndex(item => item.id === productId);

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity = quantity;

      // Recalculate totals
      cart.itemCount = cart.items.reduce((total, item) => total + item.quantity, 0);
      cart.total = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
      cart.lastUpdated = new Date().toISOString();

      await AsyncStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
      
      console.log('📝 Updated item quantity:', productId, 'New quantity:', quantity);
    }

    return cart;
  },

  // Clear guest cart
  clearCart: async () => {
    const emptyCart = {
      items: [],
      total: 0,
      itemCount: 0,
      lastUpdated: new Date().toISOString()
    };
    await AsyncStorage.setItem(GUEST_CART_KEY, JSON.stringify(emptyCart));
    
    console.log('🧹 Cleared guest cart');
    return emptyCart;
  },

  // Sync guest cart with user account after login
  syncWithUserAccount: async (token) => {
    return new Promise(async (resolve, reject) => {
      try {
        const guestCart = await guestCartUtils.getCart();
        console.log('🔄 Starting cart sync...', { 
          guestItems: guestCart.items.length,
          token: !!token 
        });

        if (guestCart.items.length === 0) {
          console.log('ℹ️ No guest cart items to sync');
          resolve({ syncedItems: 0, message: 'No items to sync' });
          return;
        }

        // Simulate API call delay
        setTimeout(async () => {
          try {
            // Here you would typically make an API call to:
            // 1. Fetch user's existing cart from server
            // 2. Merge guest cart items with user cart
            // 3. Save merged cart to server
            // 4. Update AsyncStorage

            // For now, we'll simulate a successful sync
            await AsyncStorage.setItem(USER_TOKEN_KEY, token);
            
            const syncedItems = guestCart.items.length;
            console.log(`✅ Cart sync completed: ${syncedItems} items synced`);

            resolve({ 
              syncedItems, 
              message: `Successfully synced ${syncedItems} items`,
              cart: guestCart
            });
          } catch (syncError) {
            console.error('❌ Error during cart sync:', syncError);
            reject(syncError);
          }
        }, 1000); // Simulate network delay

      } catch (error) {
        console.error('❌ Cart sync failed:', error);
        reject(error);
      }
    });
  }
};

// Export cart state management utilities
export const cartStateUtils = {
  // Get cart item count for display
  getItemCount: async () => {
    const cart = await guestCartUtils.getCart();
    return cart.itemCount;
  },

  // Get cart total for display
  getTotal: async () => {
    const cart = await guestCartUtils.getCart();
    return cart.total;
  },

  // Check if item is in cart
  isInCart: async (productId) => {
    const cart = await guestCartUtils.getCart();
    return cart.items.some(item => item.id === productId);
  },

  // Get item quantity in cart
  getItemQuantity: async (productId) => {
    const cart = await guestCartUtils.getCart();
    const item = cart.items.find(item => item.id === productId);
    return item ? item.quantity : 0;
  }
};

export default {
  initializeCart,
  guestCartUtils,
  cartStateUtils
};