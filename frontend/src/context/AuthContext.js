'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { getApiErrorMessage, logApiIssue } from '../utils/api';

const AuthContext = createContext();

const AUTH_MAX_AGE = 7 * 24 * 60 * 60;

function setAuthCookies(token, user) {
  if (typeof document === 'undefined') return;
  document.cookie = `bb_token=${encodeURIComponent(token)}; path=/; max-age=${AUTH_MAX_AGE}; SameSite=Lax`;
  document.cookie = `bb_user=${encodeURIComponent(JSON.stringify(user))}; path=/; max-age=${AUTH_MAX_AGE}; SameSite=Lax`;
}

function clearAuthCookies() {
  if (typeof document === 'undefined') return;
  document.cookie = 'bb_token=; path=/; max-age=0; SameSite=Lax';
  document.cookie = 'bb_user=; path=/; max-age=0; SameSite=Lax';
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    // Retrieve credentials from localStorage on startup
    const storedToken = localStorage.getItem('bb_token');
    const storedUser = localStorage.getItem('bb_user');
    if (storedToken && storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setToken(storedToken);
      setUser(parsedUser);
      setAuthCookies(storedToken, parsedUser);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      const { token: receivedToken, user: receivedUser } = res.data;
      
      localStorage.setItem('bb_token', receivedToken);
      localStorage.setItem('bb_user', JSON.stringify(receivedUser));
      setAuthCookies(receivedToken, receivedUser);

      setToken(receivedToken);
      setUser(receivedUser);
      return { success: true, user: receivedUser };
    } catch (error) {
      console.error('Login API error:', error.response?.data || error.message);
      const data = error.response?.data;
      return {
        success: false,
        error: data?.error || 'Unable to connect to server. Please ensure the backend is running.',
        requiresVerification: data?.requiresVerification === true,
        email: data?.email,
      };
    }
  };

  const register = async (name, email, password, phone) => {
    try {
      const res = await axios.post(`${API_URL}/auth/register`, { name, email, password, phone });
      
      // Verification required. Do NOT store token, do NOT store user, do NOT create session.
      return {
        success: true,
        message: res.data.message || 'Verification code has been sent to your email.',
        email: res.data.email || email,
      };
    } catch (error) {
      const data = error.response?.data;
      const serverMessage =
        typeof data === 'object' && data?.error
          ? data.error
          : typeof data === 'string'
            ? data
            : null;

      if (!error.response) {
        console.error('Register API error (network):', error.message);
        return {
          success: false,
          error:
            'Cannot reach the server. Start the backend (npm run dev in the backend folder) and try again.',
        };
      }

      console.error('Register API error:', serverMessage || data || error.message);
      return {
        success: false,
        error: serverMessage || 'Registration failed. Please try again later.',
      };
    }
  };

  const verifyOtp = async (email, otp) => {
    try {
      const res = await axios.post(`${API_URL}/auth/verify-otp`, { email, otp });
      return { success: true, message: res.data.message };
    } catch (error) {
      console.error('Verify OTP API error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error || 'Verification failed. Please try again.'
      };
    }
  };

  const resendOtp = async (email) => {
    try {
      const res = await axios.post(`${API_URL}/auth/resend-otp`, { email });
      return { success: true, message: res.data.message };
    } catch (error) {
      console.error('Resend OTP API error:', error.response?.data || error.message);
      const status = error.response?.status;
      return {
        success: false,
        error:
          error.response?.data?.error ||
          (status === 429 ? 'Too many requests. Please wait before resending.' : 'Resending OTP failed.'),
      };
    }
  };

  const completeGoogleAuth = useCallback((receivedToken, receivedUser) => {
    localStorage.setItem('bb_token', receivedToken);
    localStorage.setItem('bb_user', JSON.stringify(receivedUser));
    setAuthCookies(receivedToken, receivedUser);
    setToken(receivedToken);
    setUser(receivedUser);
  }, []);

  const applyUser = useCallback(
    (nextUser) => {
      if (!nextUser) return;
      localStorage.setItem('bb_user', JSON.stringify(nextUser));
      if (token) setAuthCookies(token, nextUser);
      setUser(nextUser);
    },
    [token]
  );

  const refreshProfile = useCallback(async () => {
    if (!token) return { success: false };
    try {
      const res = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      applyUser(res.data.user);
      return { success: true, user: res.data.user };
    } catch (error) {
      logApiIssue('refresh profile', error);
      return { success: false, error: getApiErrorMessage(error, 'Could not load profile.') };
    }
  }, [API_URL, token, applyUser]);

  const updateProfile = useCallback(
    async ({ name, phone }) => {
      if (!token) return { success: false, error: 'Not signed in.' };
      try {
        const res = await axios.put(
          `${API_URL}/auth/profile`,
          { name, phone },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        applyUser(res.data.user);
        return { success: true, message: res.data.message };
      } catch (error) {
        return {
          success: false,
          error: getApiErrorMessage(error, 'Could not update profile.'),
        };
      }
    },
    [API_URL, token, applyUser]
  );

  const uploadProfileAvatar = useCallback(
    async (file) => {
      if (!token) return { success: false, error: 'Not signed in.' };
      const formData = new FormData();
      formData.append('image', file);
      try {
        const res = await axios.post(`${API_URL}/auth/profile/avatar`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        applyUser(res.data.user);
        return { success: true, message: res.data.message };
      } catch (error) {
        return {
          success: false,
          error: getApiErrorMessage(error, 'Could not upload photo.'),
        };
      }
    },
    [API_URL, token, applyUser]
  );

  const removeProfileAvatar = useCallback(async () => {
    if (!token) return { success: false, error: 'Not signed in.' };
    try {
      const res = await axios.delete(`${API_URL}/auth/profile/avatar`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      applyUser(res.data.user);
      return { success: true, message: res.data.message };
    } catch (error) {
      return {
        success: false,
        error: getApiErrorMessage(error, 'Could not remove photo.'),
      };
    }
  }, [API_URL, token, applyUser]);

  const logout = () => {
    localStorage.removeItem('bb_token');
    localStorage.removeItem('bb_user');
    clearAuthCookies();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        verifyOtp,
        resendOtp,
        completeGoogleAuth,
        refreshProfile,
        updateProfile,
        uploadProfileAvatar,
        removeProfileAvatar,
        applyUser,
        logout,
        API_URL,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
