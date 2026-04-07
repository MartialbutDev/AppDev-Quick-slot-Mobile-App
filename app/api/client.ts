// app/api/client.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

// Django Backend URL
const API_BASE_URL = __DEV__ 
  ? 'http://192.168.1.62:8000/api'
  : 'https://your-production-url.com/api';

export const apiClient = { 
  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    console.log('🌐 Making API request to:', url);
    console.log('📦 Request method:', options.method);
    
    // Get auth token from storage
    let token: string | null = null;
    try {
      token = await AsyncStorage.getItem('authToken');
    } catch (error) {
      console.log('❌ Error getting auth token:', error);
    }
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };

    const config: RequestInit = {
      method: options.method || 'GET',
      headers,
      ...options,
    };

    if (options.body) {
      config.body = options.body;
    }

    try {
      console.log('📡 Sending request...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      const response = await fetch(url, {
        ...config,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      const responseText = await response.text();
      console.log('📊 Response status:', response.status);
      
      if (response.status === 401) {
        console.log('🔐 Token expired');
        await AsyncStorage.multiRemove(['authToken', 'currentUser']);
        throw new Error('Session expired. Please login again.');
      }
      
      if (!response.ok) {
        let errorMessage = `Server error: ${response.status}`;
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorData.message || responseText;
        } catch {
          errorMessage = responseText || `Server error: ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      let data;
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch (error) {
        console.error('❌ JSON parsing error:', error);
        throw new Error('Invalid server response');
      }
      
      console.log('✅ Request successful');
      return data;
    } catch (error: any) {
      console.error('❌ API Request failed:', error.message);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout. Please try again.');
      }
      
      if (error.message.includes('Network request failed')) {
        throw new Error('Cannot connect to server. Please check your internet connection.');
      }
      
      throw error;
    }
  },

  // ============ AUTH METHODS ============
  
  async signup(userData: {
    fullName: string;
    studentId: string;
    email: string;
    password: string;
  }) {
    console.log('🚀 Starting signup for:', userData.email);
    try {
      const requestBody = {
        username: userData.email.split('@')[0],
        email: userData.email,
        password: userData.password,
        first_name: userData.fullName.split(' ')[0],
        last_name: userData.fullName.split(' ').slice(1).join(' '),
        student_id: userData.studentId,
        user_type: 'student'
      };
      
      const response = await this.request('/auth/register/', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });
      
      const authToken = response.access || response.token;
      
      if (authToken && response.user) {
        const transformedUser = {
          id: response.user.id,
          fullName: `${response.user.first_name} ${response.user.last_name}`.trim(),
          studentId: response.user.student_id,
          email: response.user.email,
          phone: response.user.phone || '',
          userType: response.user.user_type,
          status: response.user.status,
          token: authToken
        };
        
        await AsyncStorage.setItem('currentUser', JSON.stringify(transformedUser));
        await AsyncStorage.setItem('authToken', authToken);
        console.log('✅ Signup successful');
      }
      
      return response;
    } catch (error: any) {
      console.error('❌ Signup failed:', error);
      throw error;
    }
  },

  async login(credentials: { username: string; password: string }) {
    console.log('🔐 Login attempt for:', credentials.username);
    try {
      let requestBody;
      const input = credentials.username.trim();
      
      // Check if input is an email
      if (input.includes('@')) {
        requestBody = { email: input, password: credentials.password };
        console.log('📦 Using email login');
      } 
      // Check if input is a student ID (numeric)
      else if (/^\d+$/.test(input)) {
        requestBody = { username: input, password: credentials.password };
        console.log('📦 Using student ID login');
      } 
      // Otherwise treat as username
      else {
        requestBody = { username: input, password: credentials.password };
        console.log('📦 Using username login');
      }
      
      console.log('📦 Sending login request...');
      
      const response = await this.request('/auth/login/', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });
      
      const authToken = response.access || response.token;
      
      if (authToken && response.user) {
        const transformedUser = {
          id: response.user.id,
          fullName: `${response.user.first_name} ${response.user.last_name}`.trim(),
          studentId: response.user.student_id,
          email: response.user.email,
          phone: response.user.phone || '',
          userType: response.user.user_type,
          status: response.user.status,
          token: authToken
        };
        
        await AsyncStorage.setItem('currentUser', JSON.stringify(transformedUser));
        await AsyncStorage.setItem('authToken', authToken);
        console.log('✅ Login successful for:', transformedUser.fullName);
        
        return { user: transformedUser, token: authToken };
      } else {
        throw new Error('Invalid server response');
      }
    } catch (error: any) {
      console.error('❌ Login failed:', error.message);
      
      if (error.message.includes('Invalid') || error.message.includes('credentials')) {
        throw new Error('Invalid email/student ID or password. Please try again.');
      }
      if (error.message.includes('not activated')) {
        throw new Error('Your account is pending approval. Please wait for admin approval.');
      }
      
      throw error;
    }
  },

  // ============ USER PROFILE METHODS ============

  async getUserProfile() {
    return this.request('/users/me/');
  },

  async updateUserProfile(profileData: any) {
    const updateData: any = {};
    if (profileData.fullName) {
      const nameParts = profileData.fullName.split(' ');
      updateData.first_name = nameParts[0];
      updateData.last_name = nameParts.slice(1).join(' ');
    }
    if (profileData.studentId) updateData.student_id = profileData.studentId;
    if (profileData.email) updateData.email = profileData.email;
    if (profileData.phone) updateData.phone = profileData.phone;
    
    return this.request('/users/me/', {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
  },

  async changePassword(passwordData: any) {
    return this.request('/user/change-password/', {
      method: 'PUT',
      body: JSON.stringify({
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword
      }),
    });
  },

  // ============ ADDRESS METHODS ============

  async getUserAddress() {
    return this.request('/user/address');
  },

  async updateUserAddress(addressData: any) {
    return this.request('/user/address', {
      method: 'PUT',
      body: JSON.stringify(addressData),
    });
  },

  // ============ FAVORITES ============

  async getFavorites() {
    try {
      const response = await this.request('/favorites/');
      const favorites = response.results || response;
      return {
        favorites: favorites.map((fav: any) => ({
          id: fav.id,
          productId: fav.gadget,
          productName: fav.gadget_details?.name || '',
          addedAt: fav.added_at
        })),
        total: favorites.length,
      };
    } catch (error) {
      return { favorites: [], total: 0 };
    }
  },

  async addToFavorites(favoriteData: any) {
    return this.request('/favorites/', {
      method: 'POST',
      body: JSON.stringify({ gadget: parseInt(favoriteData.productId) }),
    });
  },

  async removeFromFavorites(productId: string) {
    return this.request(`/favorites/remove/${productId}/`, {
      method: 'DELETE',
    });
  },

  async checkFavorite(productId: string) {
    try {
      const favorites = await this.getFavorites();
      const isFavorite = favorites.favorites.some((fav: any) => fav.productId === productId);
      return { isFavorite, productId };
    } catch (error) {
      return { isFavorite: false, productId };
    }
  },

  // ============ RENTALS / ORDERS ============

  async getMyOrders() {
    try {
      const response = await this.request('/rentals/my-rentals/');
      const orders = response.results || response;
      return {
        orders: orders.map((order: any) => ({
          id: order.id,
          orderNumber: `QS${order.id}`,
          items: [{
            id: order.gadget,
            name: order.gadget_name,
            quantity: 1,
            totalPrice: order.total_amount,
          }],
          totalAmount: order.total_amount,
          status: order.status,
          createdAt: order.created_at
        })),
        total: orders.length,
      };
    } catch (error) {
      return { orders: [], total: 0 };
    }
  },

  async getOrderHistory() {
    try {
      const response = await this.request('/rentals/history/');
      const orders = response.results || response;
      return {
        orders: orders.map((order: any) => ({
          id: order.id,
          orderNumber: `QS${order.id}`,
          items: [{
            id: order.gadget,
            name: order.gadget_name,
            quantity: 1,
            totalPrice: order.total_amount,
          }],
          totalAmount: order.total_amount,
          status: order.status,
          createdAt: order.created_at
        })),
        total: orders.length,
      };
    } catch (error) {
      return { orders: [], total: 0 };
    }
  },

  async createOrder(orderData: any) {
    const rentalData = {
      gadget: parseInt(orderData.items[0].id),
      rent_date: new Date().toISOString().split('T')[0],
      expected_return: new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0],
      total_amount: orderData.totalAmount,
      payment_method: orderData.paymentMethod,
      contact_info: orderData.contactInfo,
      special_instructions: orderData.specialInstructions || ''
    };
    
    return this.request('/rentals/create/', {
      method: 'POST',
      body: JSON.stringify(rentalData),
    });
  },

  async getOrderById(orderId: number) {
    return this.request(`/orders/${orderId}`);
  },

  async updateOrderStatus(orderId: number, status: string) {
    return this.request(`/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  // ============ GADGETS ============

  async getGadgets() {
    const response = await this.request('/gadgets/');
    return response.results || response;
  },

  async getGadgetById(id: number) {
    return this.request(`/gadgets/${id}/`);
  },

  async getCategories() {
    const response = await this.request('/categories/');
    return response.results || response;
  },

  // ============ HELPER METHODS ============

  async checkAuth(): Promise<{ isAuthenticated: boolean; user: any | null }> {
    try {
      const [token, user] = await Promise.all([
        AsyncStorage.getItem('authToken'),
        AsyncStorage.getItem('currentUser'),
      ]);
      
      if (!token || !user) {
        return { isAuthenticated: false, user: null };
      }
      
      return { 
        isAuthenticated: true, 
        user: JSON.parse(user) 
      };
    } catch (error) {
      return { isAuthenticated: false, user: null };
    }
  },

  async logout(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(['currentUser', 'authToken', 'rememberedCredentials']);
      console.log('✅ User logged out');
    } catch (error) {
      console.error('❌ Logout failed:', error);
    }
  },

  async checkServerHealth(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const data = await response.json();
      return data.message === 'QuickSlot API is running!';
    } catch (error) {
      console.error('❌ Server health check failed:', error);
      return false;
    }
  },

  async debugServerStatus() {
    try {
      const health = await this.checkServerHealth();
      console.log('🏥 Server health:', health ? '✅ Healthy' : '❌ Unhealthy');
      
      const response = await fetch(`${API_BASE_URL}/health`);
      const data = await response.json();
      console.log('📡 Server response:', data);
      
      return { healthy: health, response: data };
    } catch (error: any) {
      console.error('❌ Debug failed:', error);
      return { healthy: false, error: error.message };
    }
  },
};

// Utility function to handle API errors in components
export const handleApiError = (error: any, customMessage?: string): string => {
  console.error('API Error:', error);
  
  if (error.message.includes('Network request failed')) {
    return customMessage || 'Cannot connect to server. Please check your internet connection.';
  }
  
  if (error.message.includes('Session expired')) {
    return 'Your session has expired. Please login again.';
  }
  
  if (error.message.includes('401')) {
    return 'Authentication failed. Please login again.';
  }
  
  if (error.message.includes('404')) {
    return customMessage || 'Requested resource was not found.';
  }
  
  if (error.message.includes('500')) {
    return 'Server error. Please try again later.';
  }
  
  return customMessage || error.message || 'An unexpected error occurred.';
};

// Utility to format API errors for display
export const formatErrorMessage = (error: any): { title: string; message: string } => {
  const message = error.message || 'An unknown error occurred';
  
  if (message.includes('Network')) {
    return {
      title: 'Connection Error',
      message: 'Please check your internet connection and try again.'
    };
  }
  
  if (message.includes('Session expired') || message.includes('401')) {
    return {
      title: 'Session Expired',
      message: 'Your session has expired. Please login again.'
    };
  }
  
  if (message.includes('already exists')) {
    return {
      title: 'Account Exists',
      message: 'An account with this email or student ID already exists.'
    };
  }
  
  if (message.includes('Invalid credentials')) {
    return {
      title: 'Login Failed',
      message: 'Invalid email/student ID or password. Please try again.'
    };
  }
  
  return {
    title: 'Error',
    message: message
  };
};