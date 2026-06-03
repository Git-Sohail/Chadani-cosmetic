'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token, API_URL } = useAuth();

  // Load cart items (memoized to avoid warning/re-renders)
  const fetchCart = useCallback(async () => {
    if (token && token !== 'mock-customer-token' && token !== 'mock-admin-token') {
      try {
        const res = await axios.get(`${API_URL}/cart`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCartItems(res.data);
      } catch (error) {
        console.error('Error fetching cart from backend:', error);
      }
    } else {
      // Offline fallback: load from localStorage
      const localCart = localStorage.getItem('bb_cart');
      if (localCart) {
        setCartItems(JSON.parse(localCart));
      }
    }
    setLoading(false);
  }, [token, API_URL]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Sync offline cart to localStorage
  useEffect(() => {
    if (!token || token === 'mock-customer-token' || token === 'mock-admin-token') {
      localStorage.setItem('bb_cart', JSON.stringify(cartItems));
    }
  }, [cartItems, token]);

  const addToCart = async (product, quantity = 1) => {
    if (token && token !== 'mock-customer-token' && token !== 'mock-admin-token') {
      try {
        await axios.post(`${API_URL}/cart`, {
          productId: product.id,
          quantity
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        await fetchCart(); // Refetch
        return { success: true };
      } catch (error) {
        console.error('Error adding to cart on backend:', error);
        return { success: false, error: error.response?.data?.error || 'Failed to add to cart' };
      }
    } else {
      // Local implementation
      setCartItems((prevItems) => {
        const existing = prevItems.find((item) => item.product.id === product.id);
        if (existing) {
          return prevItems.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }
        return [...prevItems, { id: `local-${Date.now()}`, product, quantity }];
      });
      return { success: true };
    }
  };

  const updateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity <= 0) {
      return deleteCartItem(cartItemId);
    }

    if (token && token !== 'mock-customer-token' && token !== 'mock-admin-token') {
      try {
        await axios.put(`${API_URL}/cart/${cartItemId}`, {
          quantity: newQuantity
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        await fetchCart();
        return { success: true };
      } catch (error) {
        console.error('Error updating cart quantity on backend:', error);
        return { success: false, error: error.response?.data?.error || 'Failed to update quantity' };
      }
    } else {
      // Local implementation
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.id === cartItemId ? { ...item, quantity: newQuantity } : item
        )
      );
      return { success: true };
    }
  };

  const deleteCartItem = async (cartItemId) => {
    if (token && token !== 'mock-customer-token' && token !== 'mock-admin-token') {
      try {
        await axios.delete(`${API_URL}/cart/${cartItemId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        await fetchCart();
        return { success: true };
      } catch (error) {
        console.error('Error deleting cart item on backend:', error);
        return { success: false, error: 'Failed to delete cart item' };
      }
    } else {
      // Local implementation
      setCartItems((prevItems) => prevItems.filter((item) => item.id !== cartItemId));
      return { success: true };
    }
  };

  const clearCart = async () => {
    setCartItems([]);
    if (!token || token === 'mock-customer-token' || token === 'mock-admin-token') {
      localStorage.removeItem('bb_cart');
    }
  };

  const cartSubtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const cartTotal = cartSubtotal; // Flat totals (can add shipping or discount logic)

  return (
    <CartContext.Provider value={{
      cartItems,
      loading,
      addToCart,
      updateQuantity,
      deleteCartItem,
      clearCart,
      cartSubtotal,
      cartTotal,
      fetchCart
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
