import api from './api'; // Import the configured API instance

const merchantService = {
  // Fetch all merchants
  getAllMerchants: async () => {
    try {
      const response = await api.get('/merchants');
      return response.data;
    } catch (error) {
      console.error('Error fetching merchants:', error);
      throw error;
    }
  },

  // Fetch pending merchant verifications
  getPendingVerifications: async () => {
    try {
      const response = await api.get('/merchants/pending-verification');
      return response.data;
    } catch (error) {
      console.error('Error fetching pending verifications:', error);
      throw error;
    }
  },

  // Get specific merchant details by ID
  getMerchantDetails: async (merchantId) => {
    try {
      const response = await api.get(`/merchants/${merchantId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching merchant details for ID ${merchantId}:`, error);
      throw error;
    }
  },

  // Handle merchant verification
  verifyMerchant: async (merchantId, verificationData) => {
    try {
      const response = await api.patch(`/merchants/${merchantId}/verify`, verificationData);
      return response.data;
    } catch (error) {
      console.error(`Error verifying merchant ${merchantId}:`, error);
      throw error;
    }
  },

  // Update merchant status
  updateMerchantStatus: async (merchantId, statusData) => {
    try {
      const response = await api.patch(`/merchants/${merchantId}/status`, statusData);
      return response.data;
    } catch (error) {
      console.error(`Error updating merchant ${merchantId} status:`, error);
      throw error;
    }
  }
};

export default merchantService;