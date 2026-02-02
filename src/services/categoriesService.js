import apiClient  from './apiClient';
import i18n from '../i18n';

// Categories service for managing category-related API calls
export class CategoriesService {
  
  // Test API connectivity
  static async testConnection() {
    try {
      const response = await apiClient.get('/categories/test');
      console.log('✅ API connection successful:', response);
      return response;
    } catch (error) {
      console.error('❌ API connection failed:', error);
      throw error;
    }
  }
  
  // Get all categories (flat list)
  static async getAllCategories(includeInactive = false) {
    try {
      const lang = i18n?.language;
      const response = await apiClient.get('/categories', { 
        includeInactive: includeInactive.toString(),
        lang: lang
      });
      return response;
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      // Return fallback categories if API fails
      return this.getFallbackCategories();
    }
  }

  // Get category tree structure (hierarchical)
  static async getCategoryTree() {
    try {
      const lang = i18n?.language;
      const response = await apiClient.get('/categories/tree', { lang });
      return response;
    } catch (error) {
      console.error('Failed to fetch category tree:', error);
      // Return fallback category tree if API fails
      return this.getFallbackCategoryTree();
    }
  }

  // Get single category by ID
  static async getCategoryById(id) {
    try {
      const response = await apiClient.get(`/categories/${id}`);
      return response;
    } catch (error) {
      console.error(`Failed to fetch category ${id}:`, error);
      throw error;
    }
  }

  // Create new category (admin only)
  static async createCategory(categoryData) {
    try {
      const response = await apiClient.post('/categories', categoryData);
      return response;
    } catch (error) {
      console.error('Failed to create category:', error);
      throw error;
    }
  }

  // Update category (admin only)
  static async updateCategory(id, categoryData) {
    try {
      const response = await apiClient.put(`/categories/${id}`, categoryData);
      return response;
    } catch (error) {
      console.error(`Failed to update category ${id}:`, error);
      throw error;
    }
  }

  // Delete category (admin only)
  static async deleteCategory(id) {
    try {
      const response = await apiClient.delete(`/categories/${id}`);
      return response;
    } catch (error) {
      console.error(`Failed to delete category ${id}:`, error);
      throw error;
    }
  }

  // Fallback categories when API is not available
  static getFallbackCategories() {
    return [
      {
        id: '1',
        name: 'Electronics',
        slug: 'electronics',
        description: 'Electronic devices and gadgets',
        isActive: true,
        parentId: null
      },
      {
        id: '2',
        name: 'Smartphones',
        slug: 'smartphones',
        description: 'Mobile phones and accessories',
        isActive: true,
        parentId: '1'
      },
      {
        id: '3',
        name: 'Laptops',
        slug: 'laptops',
        description: 'Computers and laptops',
        isActive: true,
        parentId: '1'
      },
      {
        id: '4',
        name: 'Fashion',
        slug: 'fashion',
        description: 'Clothing and accessories',
        isActive: true,
        parentId: null
      },
      {
        id: '5',
        name: 'Men\'s Clothing',
        slug: 'mens-clothing',
        description: 'Clothing for men',
        isActive: true,
        parentId: '4'
      },
      {
        id: '6',
        name: 'Women\'s Clothing',
        slug: 'womens-clothing',
        description: 'Clothing for women',
        isActive: true,
        parentId: '4'
      },
      {
        id: '7',
        name: 'Home & Garden',
        slug: 'home-garden',
        description: 'Home and garden items',
        isActive: true,
        parentId: null
      },
      {
        id: '8',
        name: 'Furniture',
        slug: 'furniture',
        description: 'Home furniture',
        isActive: true,
        parentId: '7'
      },
      {
        id: '9',
        name: 'Kitchen',
        slug: 'kitchen',
        description: 'Kitchen appliances and tools',
        isActive: true,
        parentId: '7'
      }
    ];
  }

  // Fallback category tree structure
  static getFallbackCategoryTree() {
    return [
      {
        id: '1',
        name: 'Electronics',
        slug: 'electronics',
        description: 'Electronic devices and gadgets',
        isActive: true,
        children: [
          {
            id: '2',
            name: 'Smartphones',
            slug: 'smartphones',
            description: 'Mobile phones and accessories',
            isActive: true,
            children: []
          },
          {
            id: '3',
            name: 'Laptops',
            slug: 'laptops',
            description: 'Computers and laptops',
            isActive: true,
            children: []
          }
        ]
      },
      {
        id: '4',
        name: 'Fashion',
        slug: 'fashion',
        description: 'Clothing and accessories',
        isActive: true,
        children: [
          {
            id: '5',
            name: 'Men\'s Clothing',
            slug: 'mens-clothing',
            description: 'Clothing for men',
            isActive: true,
            children: []
          },
          {
            id: '6',
            name: 'Women\'s Clothing',
            slug: 'womens-clothing',
            description: 'Clothing for women',
            isActive: true,
            children: []
          }
        ]
      },
      {
        id: '7',
        name: 'Home & Garden',
        slug: 'home-garden',
        description: 'Home and garden items',
        isActive: true,
        children: [
          {
            id: '8',
            name: 'Furniture',
            slug: 'furniture',
            description: 'Home furniture',
            isActive: true,
            children: []
          },
          {
            id: '9',
            name: 'Kitchen',
            slug: 'kitchen',
            description: 'Kitchen appliances and tools',
            isActive: true,
            children: []
          }
        ]
      }
    ];
  }
}

export default CategoriesService;