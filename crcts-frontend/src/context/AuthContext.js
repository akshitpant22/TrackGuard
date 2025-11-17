import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

// Create Context
const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on app start
  useEffect(() => {
    checkAuth();
  }, []);

const checkAuth = async () => {
  const token = localStorage.getItem('access_token');
  if (token) {
    try {
      const response = await api.get('/me/');
      const userData = response.data;
      
      // ✅ FIX: Save user data to localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Auth check failed:', error);
      logout();
    }
  }
  setLoading(false);
};

// Login function
const login = async (username, password) => {
  try {
    const response = await api.post('/token/', { username, password });
    const { access, refresh } = response.data;
    
    // Save tokens to localStorage
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    
    // Get user info
    const userResponse = await api.get('/me/');
    const userData = userResponse.data;
    
    // ✅ FIX: Save user data to localStorage
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    
    return { success: true, user: userData };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.detail || 'Login failed' 
    };
  }
};

  // Logout function
  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Value that will be available to all components
  const value = {
    user,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};