import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Typography } from '@mui/material';
import authService from '../services/authService.js';

const LoginPage = () => {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await authService.login(loginId, password);
      navigate('/');
    } catch (error) {
      console.error('Login failed:', error);
      // Display error message to the user
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor="white"
      color="white"
    >
      <Box
        p={4}
        borderRadius={4}
        boxShadow={3}
        bgcolor="white"
        color="text.primary"
        width="100%"
        maxWidth={400}
      >
        <Typography variant="h4" align="center" gutterBottom>
          Admin Login
        </Typography>
        <TextField
          label="Login ID"
          variant="outlined"
          value={loginId}
          onChange={(e) => setLoginId(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Password"
          type="password"
          variant="outlined"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          margin="normal"
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleLogin}
          fullWidth
          sx={{ mt: 2 }}
        >
          Login
        </Button>
      </Box>
    </Box>
  );
};

export default LoginPage;