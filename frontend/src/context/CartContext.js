'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { getActivePrice, DHARAN_DELIVERY_FEE, calculateOrderTotal } from '../utils/currency';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token, API_URL } = useAuth();
  const syncingRef = useRef(false);

  // Load cart items with safe guest-cart merging
  const fetchCart = useCallback(async () => {
    if (token && token !== 'mock-customer-token' && token !== 'mock-admin-token') {
      const localCartStr = typeof window !== 'undefined' ? localStorage.getItem('bb_cart') : null;
      let localGuestItems = [];
      if (localCartStr) {
        try {
          const parsed = JSON.parse(localCartStr);
          if (Array.isArray(parsed) && parsed.length > 0) {
            localGuestItems = parsed;
          }
        } catch (e) {
          console.error('Failed to parse local guest cart:', e);
        }
      }

      // If guest cart exists, merge with server cart
      if (localGuestItems.length > 0 && !syncingRef.current) {
        syncingRef.current = true;
        try {
          const itemsPayload = localGuestItems
            .map((item) => ({
              productId: item.productId || item.product?.id,
              quantity: item.quantity || 1,
            }))
            .filter((item) => Boolean(item.productId));

          if (itemsPayload.length > 0) {
            const res = await axios.post(
              `${API_URL}/cart/merge`,
              { items: itemsPayload },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            // Only clear local storage after server confirms successful synchronization
            localStorage.removeItem('bb_cart');
            setCartItems(res.data);
            setLoading(false);
            syncingRef.current = false;
            return;
          }
        } catch (mergeError) {
          console.error('Error merging guest cart on backend:', mergeError);
          // Do not delete local cart so guest items are not lost if server fails
        } finally {
          syncingRef.current = false;
        }
      }

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
      if (typeof window !== 'undefined') {
        const localCart = localStorage.getItem('bb_cart');
        if (localCart) {
          try {
            setCartItems(JSON.parse(localCart));
          } catch {
            setCartItems([]);
          }
        }
      }
    }
    setLoading(false);
  }, [token, API_URL]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Sync offline cart to localStorage only for unauthenticated guest sessions
  useEffect(() => {
    if (!token || token === 'mock-customer-token' || token === 'mock-admin-token') {
      if (typeof window !== 'undefined') {
        localStorage.setItem('bb_cart', JSON.stringify(cartItems));
      }
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
    if (typeof window !== 'undefined') {
      localStorage.removeItem('bb_cart');
    }
  };

  const cartSubtotal = cartItems.reduce(
    (acc, item) => acc + (getActivePrice(item.product) * item.quantity),
    0
  );
  const deliveryFee = cartItems.length > 0 ? DHARAN_DELIVERY_FEE : 0;
  const cartTotal = calculateOrderTotal(cartSubtotal);

  return (
    <CartContext.Provider value={{
      cartItems,
      loading,
      addToCart,
      updateQuantity,
      deleteCartItem,
      clearCart,
      cartSubtotal,
      deliveryFee,
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
