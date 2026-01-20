export function initializeCart(): void;

export const guestCartUtils: {
  getCart: () => { items: any[]; total: number; itemCount: number };
  clearCart: () => void;
  updateQuantity: (productId: any, quantity: number) => void;
  removeItem: (productId: any) => void;
  syncWithUserAccount?: (token: string) => Promise<{ syncedItems: number }>;
  [k: string]: any;
};

export const cartStateUtils: {
  getItemCount: () => number;
  getTotal: () => number;
  isInCart: (productId: any) => boolean;
  getItemQuantity: (productId: any) => number;
};

const _default: {
  initializeCart: typeof initializeCart;
  guestCartUtils: typeof guestCartUtils;
  cartStateUtils: typeof cartStateUtils;
};
export default _default;

