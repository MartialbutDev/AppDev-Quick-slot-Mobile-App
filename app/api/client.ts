// app/api/client.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

// FIXED: No extra colon in the URL
const API_BASE_URL = __DEV__
  ? "http://192.168.1.171:5000/api" // ✅ Correct format
  : "https://your-production-url.com/api";

export const apiClient = {
  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    console.log("🌐 Making API request to:", url);
    console.log("📦 Request method:", options.method);
    console.log("📦 Request body:", options.body ? "Has body" : "No body");

    // Get auth token from storage
    let token: string | null = null;
    try {
      token = await AsyncStorage.getItem("authToken");
    } catch (error) {
      console.log("❌ Error getting auth token:", error);
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    const config: RequestInit = {
      headers,
      ...options,
    };

    try {
      console.log("📡 Sending request with config:", {
        url,
        method: config.method,
        hasToken: !!token,
        endpoint,
      });

      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Get raw response text first
      const responseText = await response.text();
      console.log(
        "📄 Raw server response:",
        responseText.substring(0, 200) + "...",
      );
      console.log("📊 Response status:", response.status);

      // Handle 401 Unauthorized (token expired or invalid)
      if (response.status === 401) {
        console.log("🔐 Token expired or invalid");

        // Clear invalid token
        try {
          await AsyncStorage.multiRemove(["authToken", "currentUser"]);
        } catch (error) {
          console.log("Error clearing auth data:", error);
        }

        throw new Error("Session expired. Please login again.");
      }

      // Handle 403 Forbidden
      if (response.status === 403) {
        throw new Error(
          "Access denied. You do not have permission to access this resource.",
        );
      }

      // Handle 404 Not Found
      if (response.status === 404) {
        console.log("⚠️ Resource not found at:", endpoint);
        // Return empty data for some endpoints instead of throwing
        if (endpoint.includes("/favorites") || endpoint.includes("/orders")) {
          console.log("ℹ️ Returning empty array for:", endpoint);
          return { data: [], total: 0 };
        }
        throw new Error(`Resource not found: ${endpoint}`);
      }

      // Handle 500 Internal Server Error
      if (response.status >= 500) {
        throw new Error("Server error. Please try again later.");
      }

      if (!response.ok) {
        // Try to parse error message from response
        let errorMessage = `Server error: ${response.status}`;
        try {
          if (responseText) {
            const errorData = JSON.parse(responseText);
            errorMessage = errorData.error || errorData.message || responseText;
          }
        } catch {
          errorMessage = responseText || `Server error: ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      // Parse successful response
      let data;
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch (error) {
        console.error("❌ JSON parsing error:", error);
        throw new Error("Invalid server response");
      }

      console.log("✅ Parsed response data for:", endpoint);
      return data;
    } catch (error: any) {
      console.error("❌ API Request failed:", {
        endpoint,
        error: error.message,
        url,
      });

      // Handle specific network errors
      if (error.name === "AbortError" || error.message.includes("timeout")) {
        throw new Error("Request timeout. Please try again.");
      }

      if (
        error.message.includes("Network request failed") ||
        error.message.includes("fetch failed") ||
        error.message.includes("network")
      ) {
        throw new Error(
          "Cannot connect to server. Please check your internet connection.",
        );
      }

      // Handle JSON parsing errors
      if (
        error.message.includes("JSON") ||
        error.message.includes("Unexpected token")
      ) {
        throw new Error("Server returned invalid response. Please try again.");
      }

      // Re-throw the error
      throw error;
    }
  },

  // Auth methods
  async signup(userData: {
    fullName: string;
    studentId: string;
    email: string;
    password: string;
  }) {
    console.log("🚀 Starting signup process for:", userData.email);
    try {
      const response = await this.request("/auth/signup", {
        method: "POST",
        body: JSON.stringify(userData),
      });

      // Auto-login after successful signup
      if (response.token && response.user) {
        await AsyncStorage.setItem(
          "currentUser",
          JSON.stringify(response.user),
        );
        await AsyncStorage.setItem("authToken", response.token);
        console.log(
          "✅ Signup successful, user auto-logged in:",
          response.user.fullName,
        );
      }

      return response;
    } catch (error: any) {
      console.error("❌ Signup failed:", error);

      // Provide user-friendly error messages
      if (error.message.includes("already exists")) {
        throw new Error(
          "An account with this email or student ID already exists.",
        );
      }
      if (
        error.message.includes("password") ||
        error.message.includes("6 characters")
      ) {
        throw new Error("Password must be at least 6 characters long.");
      }
      if (error.message.includes("email") || error.message.includes("valid")) {
        throw new Error("Please enter a valid email address.");
      }

      throw error;
    }
  },

  async login(credentials: { username: string; password: string }) {
    console.log("🔐 Starting login for:", credentials.username);
    try {
      const response = await this.request("/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      });

      if (response.token && response.user) {
        await AsyncStorage.setItem(
          "currentUser",
          JSON.stringify(response.user),
        );
        await AsyncStorage.setItem("authToken", response.token);
        console.log("✅ Login successful for:", response.user.fullName);
      }

      return response;
    } catch (error: any) {
      console.error("❌ Login failed:", error);

      // Provide user-friendly error messages
      if (
        error.message.includes("Invalid") ||
        error.message.includes("credentials")
      ) {
        throw new Error(
          "Invalid email/student ID or password. Please try again.",
        );
      }
      if (error.message.includes("User not found")) {
        throw new Error("No account found with this email/student ID.");
      }

      throw error;
    }
  },

  // User Profile Methods
  async getUserProfile() {
    return this.request("/user/profile");
  },

  async updateUserProfile(profileData: {
    fullName?: string;
    studentId?: string;
    email?: string;
    phone?: string;
  }) {
    return this.request("/user/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
  },

  async changePassword(passwordData: {
    currentPassword: string;
    newPassword: string;
  }) {
    return this.request("/user/change-password", {
      method: "PUT",
      body: JSON.stringify(passwordData),
    });
  },

  // Address Methods
  async getUserAddress() {
    return this.request("/user/address");
  },

  async updateUserAddress(addressData: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  }) {
    return this.request("/user/address", {
      method: "PUT",
      body: JSON.stringify(addressData),
    });
  },

  // Favorites Methods
  async getFavorites() {
    try {
      const response = await this.request("/user/favorites");
      return {
        favorites: response.favorites || [],
        total: response.total || 0,
      };
    } catch (error: any) {
      console.log("⚠️ Favorites fetch failed:", error.message);
      return { favorites: [], total: 0 };
    }
  },

  async addToFavorites(favoriteData: {
    productId: string;
    productName: string;
    productPrice?: string;
    productImage?: string;
    productDescription?: string;
    category?: string;
  }) {
    return this.request("/user/favorites", {
      method: "POST",
      body: JSON.stringify(favoriteData),
    });
  },

  async removeFromFavorites(productId: string) {
    return this.request(`/user/favorites/${productId}`, {
      method: "DELETE",
    });
  },

  async checkFavorite(productId: string) {
    try {
      const response = await this.request(`/user/favorites/check/${productId}`);
      return response;
    } catch (error) {
      // If check fails, assume not favorite
      return { isFavorite: false, productId };
    }
  },

  // Order Methods
  async getMyOrders() {
    try {
      const response = await this.request("/orders/my-orders");
      return {
        orders: response.orders || [],
        total: response.total || 0,
      };
    } catch (error) {
      console.log("⚠️ Get orders failed:", error);
      return { orders: [], total: 0 };
    }
  },

  async getOrderHistory() {
    try {
      const response = await this.request("/orders/history");
      return {
        orders: response.orders || [],
        total: response.total || 0,
      };
    } catch (error) {
      console.log("⚠️ Get order history failed:", error);
      return { orders: [], total: 0 };
    }
  },

  async createOrder(orderData: {
    items: any[];
    totalAmount: number;
    paymentMethod: string;
    contactInfo: any;
    specialInstructions?: string;
  }) {
    return this.request("/orders", {
      method: "POST",
      body: JSON.stringify(orderData),
    });
  },

  async getOrderById(orderId: number) {
    return this.request(`/orders/${orderId}`);
  },

  async updateOrderStatus(orderId: number, status: string) {
    return this.request(`/orders/${orderId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  },

  // Helper method to check authentication status
  async checkAuth(): Promise<{ isAuthenticated: boolean; user: any | null }> {
    try {
      const [token, user] = await Promise.all([
        AsyncStorage.getItem("authToken"),
        AsyncStorage.getItem("currentUser"),
      ]);

      if (!token || !user) {
        return { isAuthenticated: false, user: null };
      }

      // TODO: You could validate the token with the backend here
      // const response = await this.request('/auth/validate', { method: 'GET' });

      return {
        isAuthenticated: true,
        user: JSON.parse(user),
      };
    } catch (error) {
      console.error("❌ Auth check failed:", error);
      return { isAuthenticated: false, user: null };
    }
  },

  // Helper method to logout
  async logout(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        "currentUser",
        "authToken",
        "rememberedCredentials",
      ]);
      console.log("✅ User logged out successfully");
    } catch (error) {
      console.error("❌ Logout failed:", error);
      // Still clear local storage even if backend call fails
      await AsyncStorage.multiRemove([
        "currentUser",
        "authToken",
        "rememberedCredentials",
      ]);
    }
  },

  // Health check method
  async checkServerHealth(): Promise<boolean> {
    try {
      // Use AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${API_BASE_URL}/health`, {
        method: "GET",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await response.json();
      return data.message === "QuickSlot API is running!";
    } catch (error) {
      console.error("❌ Server health check failed:", error);
      return false;
    }
  },

  // Debug method to see server status
  async debugServerStatus() {
    try {
      const health = await this.checkServerHealth();
      console.log("🏥 Server health:", health ? "✅ Healthy" : "❌ Unhealthy");

      // Test a simple endpoint
      const response = await fetch(`${API_BASE_URL}/health`);
      const data = await response.json();
      console.log("📡 Server response:", data);

      return { healthy: health, response: data };
    } catch (error: any) {
      console.error("❌ Debug failed:", error);
      return { healthy: false, error: error.message };
    }
  },
};

// Utility function to handle API errors in components
export const handleApiError = (error: any, customMessage?: string): string => {
  console.error("API Error:", error);

  if (error.message.includes("Network request failed")) {
    return (
      customMessage ||
      "Cannot connect to server. Please check your internet connection."
    );
  }

  if (error.message.includes("Session expired")) {
    return "Your session has expired. Please login again.";
  }

  if (error.message.includes("401")) {
    return "Authentication failed. Please login again.";
  }

  if (error.message.includes("404")) {
    return customMessage || "Requested resource was not found.";
  }

  if (error.message.includes("500")) {
    return "Server error. Please try again later.";
  }

  return customMessage || error.message || "An unexpected error occurred.";
};

// Utility to format API errors for display
export const formatErrorMessage = (
  error: any,
): { title: string; message: string } => {
  const message = error.message || "An unknown error occurred";

  if (message.includes("Network")) {
    return {
      title: "Connection Error",
      message: "Please check your internet connection and try again.",
    };
  }

  if (message.includes("Session expired") || message.includes("401")) {
    return {
      title: "Session Expired",
      message: "Your session has expired. Please login again.",
    };
  }

  if (message.includes("already exists")) {
    return {
      title: "Account Exists",
      message: "An account with this email or student ID already exists.",
    };
  }

  if (message.includes("Invalid credentials")) {
    return {
      title: "Login Failed",
      message: "Invalid email/student ID or password. Please try again.",
    };
  }

  return {
    title: "Error",
    message: message,
  };
};
