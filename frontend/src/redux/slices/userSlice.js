import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import authService from '../../services/authService';

const initialState = {
  name: '',
  email: '',
  isAuthenticated: false,
  userData: null, // Add this to store the full user data
  status: 'idle', // Add status for async operation
  error: null // Add error handling
};

export const fetchUser = createAsyncThunk('user/fetchUser', async (_, { rejectWithValue }) => {
  try {
    console.log('Fetching user data...');
    const userData = await authService.getAdmin();
    console.log('User data fetched successfully:', userData);
    return userData;
  } catch (error) {
    console.error('Error fetching user data:', error.response?.data || error.message);
    return rejectWithValue(error.response?.data || error.message);
  }
});

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      const { name, email } = action.payload;
      state.name = name;
      state.email = email;
      state.isAuthenticated = true;
      console.log('User set successfully:', action.payload);
    },
    clearUser: (state) => {
      state.name = '';
      state.email = '';
      state.isAuthenticated = false;
      state.userData = null;
      console.log('User cleared successfully.');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.status = 'loading';
        console.log('Fetching user data... Status: loading');
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Store the full user data
        state.userData = action.payload;
        // Also update the basic user info
        state.name = action.payload.name;
        state.email = action.payload.email;
        state.isAuthenticated = true;
        console.log('User data set successfully in state:', state.userData);
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        console.error('Error setting user data in state:', action.payload);
      });
  }
});

// Export actions and selectors remain the same
export const { setUser, clearUser } = userSlice.actions;
export const selectUser = (state) => state.user;
export const selectIsAuthenticated = (state) => state.user.isAuthenticated;
export const selectUserData = (state) => state.user.userData.admin; // New selector for full user data

export default userSlice.reducer;
