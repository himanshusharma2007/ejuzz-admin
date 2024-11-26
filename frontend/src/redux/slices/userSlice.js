import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import authService from '../../services/authService';

const initialState = {
  name: '',
  email: '',
  isAuthenticated: false,
};

export const fetchUser = createAsyncThunk('user/fetchUser', async (_, { rejectWithValue }) => {
  try {
    const userData = await authService.getAdmin();
    return userData;
  } catch (error) {
    return rejectWithValue(error.response.data);
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
    },
    clearUser: (state) => {
      state.name = '';
      state.email = '';
      state.isAuthenticated = false;
    },
  },
});

// Export actions
export const { setUser, clearUser } = userSlice.actions;

// Export selectors
export const selectUser = (state) => state.user;
export const selectIsAuthenticated = (state) => state.user.isAuthenticated;

// Export reducer
export default userSlice.reducer;
