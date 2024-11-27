// src/services/authService.js
import api from './api';

const authService = {
  // async signup(userData) {
  //   try {
  //     console.log('Signing up user:', userData);
  //     const response = await api.post('/signup', userData);
  //     console.log('Signup successful:', response.data);
  //     return response.data;
  //   } catch (error) {
  //     console.error('Error signing up user:', error);
  //     throw error;
  //   }
  // },

  async login(loginId, password) {
    console.log('loginId & password', loginId,password)
    try {
      console.log('Logging in user:', loginId, password);
      const response = await api.post('/auth/login', {loginId, password});
      console.log('Login successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error logging in user:', error);
      throw error;
    }
  },

  async logout() {
    try {
      console.log('Logging out user');
      const response = await api.get('/logout');
      console.log('Logout successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error logging out user:', error);
      throw error;
    }
  },
  async getAdmin() {
    try {
      console.log('getting admin');
      const response = await api.get('/auth/get-admin');
      console.log('get successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error getting admin:', error);
      throw error;
    }
  },
};

export default authService;