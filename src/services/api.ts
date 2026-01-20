import apiClient from './apiClient';

// Auth Service
export const authService = {
  login: async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', { email, password });
    return response;
  },
  adminLogin: async (email: string, password: string) => {
    const response = await apiClient.post('/auth/admin/login', { email, password });
    return response;
  },
  vendorLogin: async (email: string, password: string) => {
    const response = await apiClient.post('/auth/vendor/login', { email, password });
    return response;
  },
  register: async (userData: any) => {
    const response = await apiClient.post('/auth/register', userData);
    return response;
  },
  refreshToken: async () => {
    const response = await apiClient.post('/auth/refresh');
    return response;
  },
  logout: async () => {
    const response = await apiClient.post('/auth/logout');
    return response;
  },
};

// User Service
export const userService = {
  getProfile: async () => {
    const response = await apiClient.get('/users/profile');
    return response;
  },
  updateProfile: async (data: any) => {
    const response = await apiClient.put('/users/profile', data);
    return response;
  },
  getUsers: async (params?: any) => {
    const response = await apiClient.get('/users', { params });
    return response;
  },
  deleteUser: async (id: number) => {
    const response = await apiClient.delete(`/users/${id}`);
    return response;
  },
};

// Address Service
export const addressService = {
  getAddresses: async () => {
    const response = await apiClient.get('/addresses');
    return response;
  },
  getDefaultAddress: async () => {
    const response = await apiClient.get('/addresses/default');
    return response;
  },
  createAddress: async (addressData: any) => {
    const response = await apiClient.post('/addresses', addressData);
    return response;
  },
  updateAddress: async (id: string, addressData: any) => {
    const response = await apiClient.put(`/addresses/${id}`, addressData);
    return response;
  },
  deleteAddress: async (id: string) => {
    const response = await apiClient.delete(`/addresses/${id}`);
    return response;
  },
  setDefaultAddress: async (id: string) => {
    const response = await apiClient.put(`/addresses/${id}/default`);
    return response;
  },
};

// Category Service
export const categoryService = {
  getAll: async () => {
    const response = await apiClient.get('/categories');
    return response;
  },
  getCategories: async () => {
    const response = await apiClient.get('/categories');
    return response;
  },
  getTree: async () => {
    const response = await apiClient.get('/categories/tree');
    return response;
  },
  getCategoryTree: async () => {
    const response = await apiClient.get('/categories/tree');
    return response;
  },
  getById: async (id: string) => {
    const response = await apiClient.get(`/categories/${id}`);
    return response;
  },
  getCategory: async (id: string) => {
    const response = await apiClient.get(`/categories/${id}`);
    return response;
  },
  create: async (data: any) => {
    const response = await apiClient.post('/categories', data);
    return response;
  },
  createCategory: async (data: any) => {
    const response = await apiClient.post('/categories', data);
    return response;
  },
  update: async (id: string, data: any) => {
    const response = await apiClient.put(`/categories/${id}`, data);
    return response;
  },
  updateCategory: async (id: string, data: any) => {
    const response = await apiClient.put(`/categories/${id}`, data);
    return response;
  },
  delete: async (id: string) => {
    const response = await apiClient.delete(`/categories/${id}`);
    return response;
  },
  deleteCategory: async (id: string) => {
    const response = await apiClient.delete(`/categories/${id}`);
    return response;
  },
  getVariantConfig: async (categoryId: string) => {
    const response = await apiClient.get(`/categories/${categoryId}/variant-config`);
    return response;
  },
  updateVariantConfig: async (categoryId: string, config: {
    requiresSize?: boolean;
    requiresColor?: boolean;
    defaultSizes?: string[];
    defaultColors?: string[];
  }) => {
    const response = await apiClient.put(`/categories/${categoryId}/variant-config`, config);
    return response;
  },
};

// Product Service
export const productService = {
  getAll: async (params?: any) => {
    const response = await apiClient.get('/products', { params });
    return response;
  },
  getProducts: async (params?: any) => {
    const response = await apiClient.get('/products', { params });
    return response.data || response;
  },
  getPendingProducts: async () => {
    const response = await apiClient.get('/products/pending');
    return response.data || response;
  },
  getById: async (id: number | string) => {
    const response = await apiClient.get(`/products/${id}`);
    return response;
  },
  getProduct: async (id: number | string) => {
    const response = await apiClient.get(`/products/${id}`);
    return response;
  },
  getByCategory: async (categoryId: string, params?: any) => {
    const response = await apiClient.get(`/products/category/${categoryId}`, { params });
    return response;
  },
  search: async (query: string, params?: any) => {
    const response = await apiClient.get(`/products/search?q=${query}`, { params });
    return response;
  },
  getFeatured: async (limit?: number) => {
    const response = await apiClient.get(`/products/featured`, { params: { limit } });
    return response;
  },
  getFiltered: async (filters: any) => {
    const response = await apiClient.get('/products/filter', { params: filters });
    return response;
  },
  getVendorProducts: async (params?: any) => {
    const response = await apiClient.get('/products/vendor', { params });
    return response.data || response;
  },
  create: async (data: any) => {
    const response = await apiClient.post('/products', data);
    return response;
  },
  createProduct: async (data: any) => {
    const response = await apiClient.post('/products', data);
    return response;
  },
  update: async (id: number | string, data: any) => {
    const response = await apiClient.put(`/products/${id}`, data);
    return response;
  },
  updateProduct: async (id: number | string, data: any) => {
    const response = await apiClient.put(`/products/${id}`, data);
    return response;
  },
  delete: async (id: number | string) => {
    const response = await apiClient.delete(`/products/${id}`);
    return response;
  },
  deleteProduct: async (id: number | string) => {
    const response = await apiClient.delete(`/products/${id}`);
    return response;
  },
  approve: async (id: number | string) => {
    const response = await apiClient.patch(`/products/${id}/approve`);
    return response;
  },
  approveProduct: async (id: number | string) => {
    const response = await apiClient.patch(`/products/${id}/approve`);
    return response;
  },
  reject: async (id: number | string, reason?: string) => {
    const response = await apiClient.patch(`/products/${id}/reject`, { reason });
    return response;
  },
  rejectProduct: async (id: number | string, reason?: string) => {
    const response = await apiClient.patch(`/products/${id}/reject`, { reason });
    return response;
  },
  uploadImages: async (files: File[]) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });
    // Don't set Content-Type header - let the browser set it automatically with boundary
    const response = await apiClient.post('/products/upload-images', formData);
    return response;
  },
};

// Vendor Service
export const vendorService = {
  register: async (formData: FormData) => {
    const response = await fetch('https://backend.originplatforms.co/api/v1/vendors/register', {
      method: 'POST',
      body: formData, // Don't set Content-Type header for FormData
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  },
  uploadDocument: async (file: File, documentType: string) => {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('type', documentType);
    const response = await apiClient.post('/vendors/upload-document', formData);
    return response;
  },
  getAll: async (params?: any) => {
    const response = await apiClient.get('/vendors', { params });
    return response;
  },
  getVendors: async (params?: any) => {
    const response = await apiClient.get('/vendors');
    return response.data || response;
  },
  getById: async (id: string) => {
    const response = await apiClient.get(`/vendors/${id}`);
    return response;
  },
  getVendor: async (id: string) => {
    const response = await apiClient.get(`/vendors/${id}`);
    return response;
  },
  create: async (data: any) => {
    const response = await apiClient.post('/vendors', data);
    return response;
  },
  createVendor: async (data: any) => {
    const response = await apiClient.post('/vendors', data);
    return response;
  },
  update: async (id: string, data: any) => {
    const response = await apiClient.put(`/vendors/${id}`, data);
    return response;
  },
  updateVendor: async (id: string, data: any) => {
    const response = await apiClient.put(`/vendors/${id}`, data);
    return response;
  },
  delete: async (id: string) => {
    const response = await apiClient.delete(`/vendors/${id}`);
    return response;
  },
  deleteVendor: async (id: string) => {
    const response = await apiClient.delete(`/vendors/${id}`);
    return response;
  },
  approve: async (id: string) => {
    const response = await apiClient.patch(`/vendors/${id}/approve`);
    return response;
  },
  approveVendor: async (id: string) => {
    const response = await apiClient.patch(`/vendors/${id}/approve`);
    return response;
  },
  suspend: async (id: string, reason?: string) => {
    const response = await apiClient.patch(`/vendors/${id}/suspend`, { reason });
    return response;
  },
  suspendVendor: async (id: string, reason?: string) => {
    const response = await apiClient.patch(`/vendors/${id}/suspend`, { reason });
    return response;
  },
};

// Order Service
export const orderService = {
  getAll: async (params?: any) => {
    const response = await apiClient.get('/orders', { params });
    return response;
  },
  getOrders: async (params?: any) => {
    const response = await apiClient.get('/orders', { params });
    return response.data || response;
  },
  getById: async (id: number | string) => {
    const response = await apiClient.get(`/orders/${id}`);
    return response;
  },
  getOrder: async (id: number | string) => {
    const response = await apiClient.get(`/orders/${id}`);
    return response;
  },
  create: async (data: any) => {
    const response = await apiClient.post('/orders', data);
    return response;
  },
  createOrder: async (data: any) => {
    const response = await apiClient.post('/orders', data);
    return response;
  },
  update: async (id: number | string, data: any) => {
    const response = await apiClient.put(`/orders/${id}`, data);
    return response;
  },
  updateOrder: async (id: number | string, data: any) => {
    const response = await apiClient.put(`/orders/${id}`, data);
    return response;
  },
  updateStatus: async (id: number | string, status: string) => {
    const response = await apiClient.patch(`/orders/${id}/status`, { status });
    return response;
  },
  updateOrderStatus: async (id: number | string, status: string, vendorId?: string) => {
    const response = await apiClient.post(`/orders/${id}/status`, { status, vendorId });
    return response;
  },
  cancel: async (id: number | string, reason: string) => {
    const response = await apiClient.patch(`/orders/${id}/cancel`, { reason });
    return response;
  },
  getVendorOrders: async (vendorId: string) => {
    const response = await apiClient.get(`/orders/vendor/${vendorId}`);
    return response;
  },
  getCustomerOrders: async (params?: any) => {
    const response = await apiClient.get('/orders/customer', { params });
    return response;
  },
  getRecentOrders: async (limit = 10) => {
    const response = await apiClient.get('/orders/recent', { params: { limit } });
    return response;
  },
};

// Return Service
export const returnService = {
  getAll: async (params?: any) => {
    const response = await apiClient.get('/returns', { params });
    return response;
  },
  getReturns: async (params?: any) => {
    const response = await apiClient.get('/returns', { params });
    return response.data || response;
  },
  getById: async (id: string) => {
    const response = await apiClient.get(`/returns/${id}`);
    return response;
  },
  getReturn: async (id: string) => {
    const response = await apiClient.get(`/returns/${id}`);
    return response;
  },
  create: async (data: any) => {
    const response = await apiClient.post('/returns', data);
    return response;
  },
  createReturn: async (data: any) => {
    const response = await apiClient.post('/returns', data);
    return response;
  },
  update: async (id: string, data: any) => {
    const response = await apiClient.put(`/returns/${id}`, data);
    return response;
  },
  updateReturn: async (id: string, data: any) => {
    const response = await apiClient.put(`/returns/${id}`, data);
    return response;
  },
  updateStatus: async (id: string, status: string) => {
    const response = await apiClient.patch(`/returns/${id}/status`, { status });
    return response;
  },
  updateReturnStatus: async (id: string, status: string) => {
    const response = await apiClient.patch(`/returns/${id}/status`, { status });
    return response;
  },
  approve: async (id: string) => {
    const response = await apiClient.patch(`/returns/${id}/approve`);
    return response;
  },
  approveReturn: async (id: string) => {
    const response = await apiClient.patch(`/returns/${id}/approve`);
    return response;
  },
  reject: async (id: string, reason: string) => {
    const response = await apiClient.patch(`/returns/${id}/reject`, { reason });
    return response;
  },
  rejectReturn: async (id: string, reason: string) => {
    const response = await apiClient.patch(`/returns/${id}/reject`, { reason });
    return response;
  },
  getVendorReturns: async (params?: any) => {
    const response = await apiClient.get('/returns/vendor', { params });
    return response;
  },
  getCustomerReturns: async (params?: any) => {
    const response = await apiClient.get('/returns/customer', { params });
    return response;
  },
};

// Dashboard/Stats Service
export const dashboardService = {
  getStats: async () => {
    const response = await apiClient.get('/dashboard/stats');
    return response;
  },
  getAdminStats: async () => {
    const response = await apiClient.get('/dashboard/admin');
    return response;
  },
  getVendorStats: async () => {
    const response = await apiClient.get('/dashboard/vendor');
    return response;
  },
  getDeliveryStats: async () => {
    const response = await apiClient.get('/dashboard/delivery');
    return response;
  },
  getCustomerStats: async () => {
    const response = await apiClient.get('/dashboard/customer');
    return response;
  },
  getSalesData: async (filters?: any) => {
    const response = await apiClient.get('/dashboard/sales-data', { params: filters });
    return response;
  },
  getCategoryData: async (filters?: any) => {
    const response = await apiClient.get('/dashboard/category-data', { params: filters });
    return response;
  },
  getVendorPerformance: async (filters?: any) => {
    const response = await apiClient.get('/dashboard/vendor-performance', { params: filters });
    return response;
  },
  getReports: async (filters?: any) => {
    const response = await apiClient.get('/dashboard/reports', { params: filters });
    return response;
  },
  getRecentOrders: async (limit = 10) => {
    const response = await apiClient.get('/dashboard/recent-orders', { params: { limit } });
    return response;
  },
};

// Cart Service
export const cartService = {
  getCart: async () => {
    const response = await apiClient.get('/cart');
    return response;
  },
  addToCart: async (productId: number | string, quantity: number = 1) => {
    const response = await apiClient.post('/cart/add', { productId, quantity });
    return response;
  },
  updateCartItem: async (itemId: number | string, quantity: number) => {
    const response = await apiClient.patch(`/cart/item/${itemId}`, { quantity });
    return response;
  },
  removeFromCart: async (itemId: number | string) => {
    const response = await apiClient.delete(`/cart/item/${itemId}`);
    return response;
  },
  clearCart: async () => {
    const response = await apiClient.delete('/cart/clear');
    return response;
  },
};

// Wishlist Service
export const wishlistService = {
  getWishlist: async () => {
    const response = await apiClient.get('/wishlist');
    return response;
  },
  addToWishlist: async (productId: number | string) => {
    const response = await apiClient.post('/wishlist/add', { productId });
    return response;
  },
  removeFromWishlist: async (productId: number | string) => {
    const response = await apiClient.delete(`/wishlist/item/${productId}`);
    return response;
  },
};

// Payment Service
export const paymentService = {
  createPayment: async (data: any) => {
    const response = await apiClient.post('/payments/create', data);
    return response;
  },
  verifyPayment: async (paymentId: string, data: any) => {
    const response = await apiClient.post(`/payments/${paymentId}/verify`, data);
    return response;
  },
  getPaymentMethods: async () => {
    const response = await apiClient.get('/payments/methods');
    return response;
  },
};

// Notification Service
export const notificationService = {
  getNotifications: async (params?: any) => {
    const response = await apiClient.get('/notifications', { params });
    return response;
  },
  markAsRead: async (notificationId: string) => {
    const response = await apiClient.patch(`/notifications/${notificationId}/read`);
    return response;
  },
  markAllAsRead: async () => {
    const response = await apiClient.patch('/notifications/read-all');
    return response;
  },
  deleteNotification: async (notificationId: string) => {
    const response = await apiClient.delete(`/notifications/${notificationId}`);
    return response;
  },
};

// Inventory Service
export const inventoryService = {
  getInventory: async (params?: any) => {
    const response = await apiClient.get('/inventory', { params });
    return response;
  },
  updateStock: async (productId: number | string, stock: number) => {
    const response = await apiClient.patch(`/inventory/product/${productId}/stock`, { stock });
    return response;
  },
  getLowStockProducts: async (threshold = 10) => {
    const response = await apiClient.get('/inventory/low-stock', { params: { threshold } });
    return response;
  },
};

export default {
  authService,
  userService,
  addressService,
  categoryService,
  productService,
  vendorService,
  orderService,
  returnService,
  dashboardService,
  cartService,
  wishlistService,
  paymentService,
  notificationService,
  inventoryService,
};
