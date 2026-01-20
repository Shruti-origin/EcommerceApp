import AsyncStorage from '@react-native-async-storage/async-storage';

// API configuration and base URL
const API_BASE_URL =  'https://backend.originplatforms.co';
const API_PREFIX = '/api/v1';

// API client for making HTTP requests
class ApiClient {
  baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Generic request method
  async request(endpoint: string, options: RequestInit & { params?: Record<string, unknown> } = {}) {
    const url = `${this.baseURL}${API_PREFIX}${endpoint}`;

    // Don't set Content-Type if body is FormData (React Native/Fetch will set it with boundary)
    const isFormData = options.body instanceof FormData;

    // Normalize headers into a plain object so we can safely mutate and add Authorization
    const extraHeaders: Record<string, string> = {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(typeof options.headers === 'object' && options.headers ? (options.headers as Record<string, string>) : {}),
    };

    const config: RequestInit = {
      ...options,
      headers: extraHeaders,
    };

    // Add auth token if available (check both 'token' and 'authToken')
    const token = (await AsyncStorage.getItem('token')) || (await AsyncStorage.getItem('authToken'));
    if (token) {
      (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
    } else {
      console.warn('No authentication token found in AsyncStorage');
    }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        // Read raw response text so we can log and return useful debug info when JSON parsing fails
        const rawText = await response.text().catch(() => null);
        let errorData: any = {};
        try {
          errorData = rawText ? JSON.parse(rawText) : {};
        } catch (e) {
          errorData = { raw: rawText };
        }

        // Detailed logging for easier debugging
        console.error('API responded with error', {
          url,
          status: response.status,
          statusText: response.statusText,
          errorData,
          method: (config.method as string) || 'GET',
          hasAuthToken: !!((await AsyncStorage.getItem('token')) || (await AsyncStorage.getItem('authToken'))),
        });

        // Handle token expiration (401 Unauthorized)
        if (response.status === 401) {
          console.warn('⚠️ Token expired or invalid, logging out...');

          // Clear auth data
          await AsyncStorage.removeItem('token');
          await AsyncStorage.removeItem('authToken');
          await AsyncStorage.removeItem('user');

          // In React Native, you would navigate to login screen here
          // This could be done using navigation prop or a navigation service
          console.log('User needs to login again');
        }

        // Throw error with helpful message when available
        const message = (errorData && (errorData.message as string)) || (typeof errorData === 'string' ? errorData : (errorData.raw as string)) || `HTTP error! status: ${response.status}`;
        throw new Error(message);
      }

      // If there's no content, return null
      const text = await response.text();
      try {
        return text ? JSON.parse(text) : null;
      } catch (e) {
        // If not JSON, return raw text
        return text;
      }
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // GET request
  async get(endpoint: string, options: RequestInit & { params?: Record<string, unknown> } = {}) {
    // Support calling get(endpoint, { limit: 10 }) OR get(endpoint, { params: { limit: 10 } })
    let params: Record<string, unknown> | undefined;
    let requestOptions: RequestInit = {};

    if ((options as any).params) {
      params = (options as any).params as Record<string, unknown>;
      requestOptions = { ...(options as any) };
      delete (requestOptions as any).params;
    } else {
      // If caller passed an object without RequestInit properties, treat it as params
      const hasRequestProps = 'method' in options || 'headers' in options || 'body' in options || 'signal' in options;
      if (hasRequestProps) {
        requestOptions = options;
      } else {
        params = (options as Record<string, unknown>);
      }
    }

    let url = endpoint;

    if (params && Object.keys(params).length > 0) {
      // Filter out undefined/null/empty-string values
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([_, value]) => value !== undefined && value !== null && value !== '')
      );

      if (Object.keys(cleanParams).length > 0) {
        // Ensure all param values are strings for URLSearchParams
        const stringParams = Object.fromEntries(Object.entries(cleanParams).map(([k, v]) => [k, String(v)]));
        const searchParams = new URLSearchParams(stringParams as Record<string, string>);
        url = `${endpoint}?${searchParams}`;
      }
    }

    return this.request(url, { method: 'GET', ...requestOptions });
  }

  // POST request
  async post(endpoint: string, data: any = {}) {
    // Check if data is FormData - if so, pass it directly without stringifying
    const isFormData = data instanceof FormData;
    return this.request(endpoint, {
      method: 'POST',
      body: isFormData ? data : JSON.stringify(data),
    });
  }

  // PUT request
  async put(endpoint: string, data: any = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // PATCH request
  async patch(endpoint: string, data: any = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete(endpoint: string) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();
export default apiClient;