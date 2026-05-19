import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('vibe_user');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        // Set default axios header
        axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
        axios.defaults.timeout = 15000;
      }
    } catch (error) {
      console.error('Failed to restore auth state:', error);
      localStorage.removeItem('vibe_user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await axios.post('/api/auth/login', { email, password });
      console.log('Login Success! Token:', data.token?.substring(0, 10) + '...');
      setUser(data);
      localStorage.setItem('vibe_user', JSON.stringify(data));
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      axios.defaults.timeout = 15000;
      return { success: true, user: data };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const { data } = await axios.post('/api/auth/register', userData);
      setUser(data);
      localStorage.setItem('vibe_user', JSON.stringify(data));
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const googleLogin = async (tokenId) => {
    try {
      const { data } = await axios.post('/api/auth/google', { tokenId });
      setUser(data);
      localStorage.setItem('vibe_user', JSON.stringify(data));
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      return { success: true, user: data };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Google Login failed' 
      };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('vibe_user');
    delete axios.defaults.headers.common['Authorization'];
    window.location.href = '/login'; // Hard redirect to clear all states
  };

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          console.warn('Session expired or unauthorized! Logging out...');
          logout();
        }
        return Promise.reject(error);
      }
    );
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  const forgotPassword = async (email) => {
    try {
      await axios.post('/api/auth/forgotpassword', { email });
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to send OTP' 
      };
    }
  };

  const resetPassword = async (email, otp, newPassword) => {
    try {
      await axios.post('/api/auth/resetpassword', { email, otp, newPassword });
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to reset password' 
      };
    }
  };

  const updateProfile = async (userData) => {
    try {
      const { data } = await axios.put('/api/auth/profile', userData);
      setUser(data);
      localStorage.setItem('vibe_user', JSON.stringify(data));
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Update failed' 
      };
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      register, 
      googleLogin,
      logout, 
      forgotPassword, 
      resetPassword,
      updateProfile
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
