import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../services/authService.js";

const LoginPage = () => {
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    console.log("handle login called")
    e.preventDefault(); // Prevent default form submission
    try {
      // Clear any previous errors
      setError(null);

      // Call login service with loginId and password
      await authService.login(loginId, password);
      
      // Navigate to dashboard on successful login
      navigate("/");
    } catch (error) {
      console.error("Login failed:", error);
      
      // Set error message to display to the user
      setError(
        error.response?.data?.message || 
        "Login failed. Please check your credentials."
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-400 to-blue-500">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8">
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800 dark:text-white">
          Admin Login
        </h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin}>
          <div className="mb-6">
            <label
              className="block text-gray-700 dark:text-gray-200 text-sm font-semibold mb-2"
              htmlFor="loginId"
            >
              Login ID
            </label>
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 dark:text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
              id="loginId"
              placeholder="Enter your Login ID"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              required
            />
          </div>
          
          <div className="mb-6">
            <label
              className="block text-gray-700 dark:text-gray-200 text-sm font-semibold mb-2"
              htmlFor="password"
            >
              Password
            </label>
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 dark:text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="mb-6">
            <button
              type="submit"
              className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition duration-300"
            >
              Login
            </button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <Link
              to="/forgot-password"
              className="text-blue-500 hover:underline"
            >
              Forgot Password
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;