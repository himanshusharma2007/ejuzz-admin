import api from './api'; // Importing the existing api.js file

const adminService = {
  // Fetch all admins
  getAllAdmins: async () => {
    try {
      const response = await api.get('/admins');
      return response.data;
    } catch (error) {
      console.error('Error fetching admins:', error);
      throw error;
    }
  },

  // Fetch a single admin by ID
  getSingleAdmin: async (adminId) => {
    try {
      const response = await api.get(`/admins/${adminId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching admin with ID ${adminId}:`, error);
      throw error;
    }
  },

  // Create a new admin
  createAdmin: async (adminData) => {
    try {
      const response = await api.post('/admins', adminData);
      return response.data;
    } catch (error) {
      console.error('Error creating admin:', error);
      throw error;
    }
  },

  // Update an existing admin
  updateAdmin: async (adminId, updateData) => {
    try {
      const response = await api.patch(`/admins/${adminId}`, updateData);
      return response.data;
    } catch (error) {
      console.error(`Error updating admin with ID ${adminId}:`, error);
      throw error;
    }
  },

  // Delete an admin
  deleteAdmin: async (adminId) => {
    try {
      const response = await api.delete(`/admins/${adminId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting admin with ID ${adminId}:`, error);
      throw error;
    }
  },

  // Update admin permissions
  updateAdminPermissions: async (adminId, permissionsData) => {
    try {
      const response = await api.patch(`/admins/${adminId}/permissions`, permissionsData);
      return response.data;
    } catch (error) {
      console.error(`Error updating permissions for admin with ID ${adminId}:`, error);
      throw error;
    }
  }
};

export default adminService;