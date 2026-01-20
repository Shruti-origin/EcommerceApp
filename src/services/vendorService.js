import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from './apiClient';

class VendorService {
  // Register new vendor
  async register(formData) {
    try {
      const token = await AsyncStorage.getItem('token');
      // Use the base URL and prefix from apiClient
      const response = await fetch(`${apiClient.baseURL}/api/v1/vendors/register`, {
        method: 'POST',
        headers: {
          // Don't set Content-Type for FormData - browser will set it with boundary
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: formData // FormData object
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Registration failed with status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Vendor registration error:', error);
      throw error;
    }
  }

  // Login vendor
  async login(credentials) {
    return apiClient.post('/auth/login', credentials);
  }

  // Get vendor dashboard data
  async getDashboard() {
    return apiClient.get('/vendors/dashboard');
  }

  // Get vendor profile
  async getProfile() {
    return apiClient.get('/vendors/profile');
  }

  // Update vendor profile
  async updateProfile(profileData) {
    return apiClient.put('/vendors/profile', profileData);
  }

  // Get vendor products
  async getProducts(params = {}) {
    return apiClient.get('/vendors/products', { params });
  }

  // Get vendor orders
  async getOrders(params = {}) {
    return apiClient.get('/vendors/orders', { params });
  }

  // Upload document
  async uploadDocument(documentData) {
    return apiClient.post('/vendors/documents', documentData);
  }
}

export default new VendorService();