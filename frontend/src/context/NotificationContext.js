'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { logApiIssue } from '../utils/api';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const { user, token, API_URL } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!token || user?.role === 'admin') return;
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [listRes, countRes] = await Promise.all([
        axios.get(`${API_URL}/notifications`, { headers }),
        axios.get(`${API_URL}/notifications/unread-count`, { headers }),
      ]);
      setNotifications(listRes.data);
      setUnreadCount(countRes.data.count);
    } catch (err) {
      logApiIssue('notifications', err);
    } finally {
      setLoading(false);
    }
  }, [API_URL, token, user?.role]);

  useEffect(() => {
    if (!token || user?.role === 'admin') {
      setNotifications([]);
      setUnreadCount(0);
      return undefined;
    }

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [token, user?.role, fetchNotifications]);

  const markAsRead = async (id) => {
    if (!token) return;
    try {
      await axios.patch(`${API_URL}/notifications/${id}/read`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      logApiIssue('mark notification read', err);
    }
  };

  const markAllAsRead = async () => {
    if (!token) return;
    try {
      await axios.patch(`${API_URL}/notifications/read-all`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      logApiIssue('mark all notifications read', err);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
