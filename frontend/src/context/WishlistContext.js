'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token, API_URL } = useAuth();

  const fetchWishlist = useCallback(async () => {
    if (token && token !== 'mock-customer-token' && token !== 'mock-admin-token') {
      try {
        const res = await axios.get(`${API_URL}/wishlist`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setWishlistItems(res.data);
      } catch (error) {
        console.error('Error fetching wishlist from backend:', error);
      }
    } else {
      const localWishlist = localStorage.getItem('bb_wishlist');
      if (localWishlist) {
        setWishlistItems(JSON.parse(localWishlist));
      }
    }
    setLoading(false);
  }, [token, API_URL]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  useEffect(() => {
    if (!token || token === 'mock-customer-token' || token === 'mock-admin-token') {
      localStorage.setItem('bb_wishlist', JSON.stringify(wishlistItems));
    }
  }, [wishlistItems, token]);

  const addToWishlist = async (product) => {
    if (token && token !== 'mock-customer-token' && token !== 'mock-admin-token') {
      try {
        await axios.post(`${API_URL}/wishlist`, { productId: product.id }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        await fetchWishlist();
        return { success: true };
      } catch (error) {
        console.error('Error adding to wishlist on backend:', error);
        return { success: false };
      }
    } else {
      setWishlistItems((prev) => {
        const exists = prev.find((item) => item.product.id === product.id);
        if (exists) return prev;
        return [...prev, { id: `local-wl-${Date.now()}`, product }];
      });
      return { success: true };
    }
  };

  const removeFromWishlist = async (productId) => {
    if (token && token !== 'mock-customer-token' && token !== 'mock-admin-token') {
      try {
        await axios.delete(`${API_URL}/wishlist/${productId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        await fetchWishlist();
        return { success: true };
      } catch (error) {
        console.error('Error removing from wishlist on backend:', error);
        return { success: false };
      }
    } else {
      setWishlistItems((prev) => prev.filter((item) => item.product.id !== productId));
      return { success: true };
    }
  };

  const isWishlisted = (productId) => {
    return wishlistItems.some((item) => item.product.id === productId);
  };

  return (
    <WishlistContext.Provider value={{
      wishlistItems,
      loading,
      addToWishlist,
      removeFromWishlist,
      isWishlisted,
      fetchWishlist
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}
