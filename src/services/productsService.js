import apiClient  from './apiClient';

// Products service for managing product-related API calls
export class ProductsService {
  
  // Get all active products for public catalog
  static async getProductCatalog(params = {}) {
    try {
      const response = await apiClient.get('/products/catalog', params);
      return response;
    } catch (error) {
      console.error('Failed to fetch product catalog:', error);
      return { data: [], total: 0 };
    }
  }

  // Get products by category
  static async getProductsByCategory(categoryId, params = {}) {
    try {
      const response = await apiClient.get('/products/catalog', {
        ...params,
        categoryId
      });
      return response;
    } catch (error) {
      console.error(`Failed to fetch products for category ${categoryId}:`, error);
      return { data: [], total: 0 };
    }
  }

  // Get single product by ID
  static async getProductById(id) {
    try {
      const response = await apiClient.get(`/products/${id}`);
      return response;
    } catch (error) {
      console.error(`Failed to fetch product ${id}:`, error);
      throw error;
    }
  }

  // Search products
  static async searchProducts(query, params = {}) {
    try {
      const response = await apiClient.get('/products/catalog', {
        ...params,
        search: query
      });
      return response;
    } catch (error) {
      console.error('Failed to search products:', error);
      return { data: [], total: 0 };
    }
  }

  // Get featured products
  static async getFeaturedProducts(limit = 10) {
    try {
      const response = await apiClient.get('/products/catalog', {
        featured: true,
        limit
      });
      return response;
    } catch (error) {
      console.error('Failed to fetch featured products:', error);
      return { data: [], total: 0 };
    }
  }

  // Get products with filters
  static async getFilteredProducts(filters = {}) {
    try {
      const response = await apiClient.get('/products/catalog', filters);
      return response;
    } catch (error) {
      console.error('Failed to fetch filtered products:', error);
      return { data: [], total: 0 };
    }
  }
}

export default ProductsService;