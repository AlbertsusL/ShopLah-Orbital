export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

// Stripe configuration
export const STRIPE_PUBLISHABLE_KEY = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;

export const API_ENDPOINTS = {
  // Products
  PRODUCTS: `${API_BASE_URL}/api/products`,
  PRODUCT_BY_ID: (id) => `${API_BASE_URL}/api/products/${id}`,
  PRODUCTS_BY_USER: (userId) => `${API_BASE_URL}/api/products/user/${userId}`,
  PRODUCT_MODIFY: (id) => `${API_BASE_URL}/api/products/modify/${id}`,
  PRODUCT_DELETE: (id) => `${API_BASE_URL}/api/products/delete/${id}`,
  PRODUCT_DASHBOARD: (userId) => `${API_BASE_URL}/api/products/dashboard/${userId}`,
  PRODUCT_ORDER: (userId) => `${API_BASE_URL}/api/products/order/${userId}`,
  
  // Orders
  ORDERS: `${API_BASE_URL}/api/orders`,
  ORDERS_BY_BUYER: (email) => `${API_BASE_URL}/api/orders/buyer/${email}`,
  ORDERS_BY_SELLER: (sellerId) => `${API_BASE_URL}/api/orders/seller/${sellerId}`,
  ORDER_BY_ID: (id) => `${API_BASE_URL}/api/orders/${id}`,
  ORDER_STATUS_UPDATE: (id) => `${API_BASE_URL}/api/orders/${id}/status`,
  
  // Payment
  PAYMENT_INTENT: `${API_BASE_URL}/api/orders/create-payment-intent`,
  
  // Reviews
  REVIEWS: `${API_BASE_URL}/api/orders/reviews`,
  REVIEWS_BY_PRODUCT: (productId) => `${API_BASE_URL}/api/orders/reviews/product/${productId}`,
  
  // Upload
  UPLOAD: `${API_BASE_URL}/api/upload`,
  
  // Health
  HEALTH: `${API_BASE_URL}/api/health`
};

// Helper function for API calls
export const apiCall = async (endpoint, options = {}) => {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  };

  const response = await fetch(endpoint, {
    ...defaultOptions,
    ...options
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};