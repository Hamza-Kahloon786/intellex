import axios from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    if (config.data) {
      console.log('📤 Request Data:', config.data);
    }
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    console.log('📥 Response Data:', response.data);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
);

// Generate unique user ID for session management
const generateUserId = () => {
  const stored = localStorage.getItem('nozama_user_id');
  if (stored) return stored;
  
  const newId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  localStorage.setItem('nozama_user_id', newId);
  return newId;
};

// Chat API Functions
export const chatAPI = {
  // Send chat message
  sendMessage: async (message, context = {}) => {
    try {
      const userId = generateUserId();
      
      const response = await api.post('/api/chat', {
        message: message.trim(),
        user_id: userId,
        context
      });
      
      return {
        response: response.data.response,
        intent: response.data.intent,
        suggestions: response.data.suggestions || [],
        requires_input: response.data.requires_input || false,
        flow_active: response.data.flow_active || false,
        user_id: response.data.user_id,
        timestamp: response.data.timestamp
      };
    } catch (error) {
      console.error('Send message error:', error);
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Health check
  healthCheck: async () => {
    try {
      const response = await api.get('/api/health');
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Submit contact form
  submitContact: async (contactData) => {
    try {
      const response = await api.post('/api/contact', {
        name: contactData.name?.trim(),
        email: contactData.email?.trim(),
        message: contactData.message?.trim()
      });
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Reset session (for testing)
  resetSession: async () => {
    try {
      const userId = localStorage.getItem('nozama_user_id');
      const response = await api.post('/api/reset-session', {
        user_id: userId
      });
      
      // Clear local storage
      localStorage.removeItem('nozama_user_id');
      
      return response.data;
    } catch (error) {
      console.error('Reset session error:', error);
      throw new Error(apiUtils.formatError(error));
    }
  }
};

// Utility functions
export const apiUtils = {
  // Check if backend is available
  isBackendAvailable: async () => {
    try {
      await chatAPI.healthCheck();
      return true;
    } catch (error) {
      console.error('Backend availability check failed:', error);
      return false;
    }
  },

  // Format error message for UI
  formatError: (error) => {
    // Network errors
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      return "Unable to connect to the server. Please check if the backend is running on http://localhost:5000";
    }
    
    // Timeout errors
    if (error.code === 'ECONNABORTED') {
      return "Request timed out. Please try again.";
    }
    
    // Rate limiting
    if (error.response?.status === 429) {
      return "Too many requests. Please wait a moment and try again.";
    }
    
    // Server errors
    if (error.response?.status >= 500) {
      return "Server error. Please try again or contact support at support@nozama.ai";
    }
    
    // Client errors
    if (error.response?.status >= 400) {
      return error.response?.data?.error || "Invalid request. Please check your input.";
    }
    
    // Generic error
    return error.message || "Something went wrong. Please try again.";
  },

  // Retry function with exponential backoff
  retry: async (fn, retries = 3, delay = 1000) => {
    try {
      return await fn();
    } catch (error) {
      if (retries === 0) {
        console.error('All retry attempts failed');
        throw error;
      }
      
      console.log(`Retrying in ${delay}ms... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      return apiUtils.retry(fn, retries - 1, delay * 2);
    }
  },

  // Test connection with detailed info
  testConnection: async () => {
    try {
      const startTime = Date.now();
      const health = await chatAPI.healthCheck();
      const endTime = Date.now();
      
      return {
        success: true,
        responseTime: endTime - startTime,
        data: health
      };
    } catch (error) {
      return {
        success: false,
        error: apiUtils.formatError(error),
        suggestion: 'Make sure your Flask backend is running on http://localhost:5000'
      };
    }
  }
};

export default api;