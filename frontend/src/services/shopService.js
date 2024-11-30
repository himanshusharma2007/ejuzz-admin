import api from './api';

const shopService = {
  // Get all shops
  getAllShops: async () => {
    try {
      const response = await api.get('/shops');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get shop by ID
  getShopById: async (shopId) => {
    try {
      const response = await api.get(`/shops/${shopId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get shop performance
  getShopPerformance: async (shopId) => {
    try {
      const response = await api.get(`/shops/${shopId}/performance`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default shopService; 