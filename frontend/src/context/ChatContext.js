'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { logApiIssue } from '../utils/api';

const ChatContext = createContext();

export function ChatProvider({ children }) {
  const { user, token, API_URL } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [widgetOpen, setWidgetOpen] = useState(false);
  const pollRef = useRef(null);

  const openChatWidget = useCallback(() => setWidgetOpen(true), []);
  const closeChatWidget = useCallback(() => setWidgetOpen(false), []);
  const toggleChatWidget = useCallback(() => setWidgetOpen((v) => !v), []);
  const isAdmin = user?.role === 'admin';
  const isCustomer = user?.role === 'customer';

  const authHeaders = useCallback(
    () => ({ headers: { Authorization: `Bearer ${token}` } }),
    [token]
  );

  const fetchUnreadCount = useCallback(async () => {
    if (!token || !user) return;
    try {
      const res = await axios.get(`${API_URL}/chat/unread-count`, authHeaders());
      setUnreadCount(res.data.count ?? 0);
    } catch (err) {
      logApiIssue('chat unread', err);
    }
  }, [API_URL, token, user, authHeaders]);

  const fetchMyConversation = useCallback(async () => {
    if (!token || !isCustomer) return null;
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/chat/me`, authHeaders());
      const conv = res.data.conversation;
      if (conv) {
        setActiveConversation(conv);
        setMessages(res.data.messages || []);
        setUnreadCount(res.data.unreadCount ?? 0);
      } else {
        setActiveConversation(null);
        setMessages([]);
      }
      return res.data;
    } catch (err) {
      logApiIssue('chat me', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [API_URL, token, isCustomer, authHeaders]);

  const fetchConversations = useCallback(async () => {
    if (!token || !isAdmin) return;
    try {
      const res = await axios.get(`${API_URL}/chat/conversations`, authHeaders());
      setConversations(res.data.conversations || []);
      setUnreadCount(res.data.totalUnread ?? 0);
    } catch (err) {
      logApiIssue('chat conversations', err);
    }
  }, [API_URL, token, isAdmin, authHeaders]);

  const openConversation = useCallback(
    async (conversationId) => {
      if (!token || !conversationId) return;
      setLoading(true);
      try {
        const res = await axios.get(
          `${API_URL}/chat/conversations/${conversationId}`,
          authHeaders()
        );
        setActiveConversation(res.data.conversation);
        setMessages(res.data.messages || []);
        setUnreadCount((prev) => Math.max(0, prev - (res.data.unreadCount || 0)));
        await axios.patch(
          `${API_URL}/chat/conversations/${conversationId}/read`,
          null,
          authHeaders()
        );
        if (isAdmin) await fetchConversations();
        else setUnreadCount(0);
      } catch (err) {
        logApiIssue('open conversation', err);
      } finally {
        setLoading(false);
      }
    },
    [API_URL, token, authHeaders, isAdmin, fetchConversations]
  );

  const refreshActiveMessages = useCallback(async () => {
    if (!token) return;
    if (isCustomer) {
      const res = await axios.get(`${API_URL}/chat/me`, authHeaders());
      if (res.data.conversation) {
        setActiveConversation(res.data.conversation);
        setMessages(res.data.messages || []);
        setUnreadCount(res.data.unreadCount ?? 0);
      }
      return;
    }
    if (activeConversation?.id) {
      const res = await axios.get(
        `${API_URL}/chat/conversations/${activeConversation.id}`,
        authHeaders()
      );
      setMessages(res.data.messages || []);
      setUnreadCount(res.data.unreadCount ?? 0);
    }
  }, [API_URL, token, isCustomer, activeConversation?.id, authHeaders]);

  const sendMessage = useCallback(
    async (body, conversationId) => {
      if (!token || !body?.trim()) return false;
      setSending(true);
      try {
        const url = isAdmin
          ? `${API_URL}/chat/conversations/${conversationId}/messages`
          : `${API_URL}/chat/messages`;
        const res = await axios.post(url, { body: body.trim() }, authHeaders());
        const newMsg = res.data.message;
        setMessages((prev) => [...prev, newMsg]);
        if (isCustomer && res.data.conversationId) {
          setActiveConversation((prev) =>
            prev?.id === res.data.conversationId
              ? prev
              : { ...(prev || {}), id: res.data.conversationId, customerId: user?.id }
          );
        }
        if (isAdmin) await fetchConversations();
        return true;
      } catch (err) {
        logApiIssue('send message', err);
        return false;
      } finally {
        setSending(false);
      }
    },
    [
      API_URL,
      token,
      isAdmin,
      isCustomer,
      activeConversation,
      authHeaders,
      fetchConversations,
      user?.id,
    ]
  );

  const markActiveRead = useCallback(async () => {
    const id = activeConversation?.id;
    if (!token || !id) return;
    try {
      await axios.patch(`${API_URL}/chat/conversations/${id}/read`, null, authHeaders());
      setUnreadCount(0);
      if (isAdmin) await fetchConversations();
    } catch (err) {
      logApiIssue('chat mark read', err);
    }
  }, [API_URL, token, activeConversation?.id, authHeaders, isAdmin, fetchConversations]);

  useEffect(() => {
    if (!token || !user) {
      setConversations([]);
      setActiveConversation(null);
      setMessages([]);
      setUnreadCount(0);
      return undefined;
    }

    if (isCustomer) {
      fetchUnreadCount();
    }

    const interval = setInterval(() => {
      if (isCustomer) fetchUnreadCount();
    }, 60000);

    return () => clearInterval(interval);
  }, [token, user, isAdmin, isCustomer, fetchConversations, fetchUnreadCount]);

  const startPolling = useCallback(
    (ms = 4000) => {
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = setInterval(() => {
        refreshActiveMessages();
        if (isAdmin) fetchUnreadCount();
        else fetchUnreadCount();
      }, ms);
    },
    [refreshActiveMessages, fetchUnreadCount, isAdmin]
  );

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  useEffect(() => () => stopPolling(), [stopPolling]);

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeConversation,
        messages,
        unreadCount,
        loading,
        sending,
        isAdmin,
        isCustomer,
        fetchMyConversation,
        fetchConversations,
        openConversation,
        sendMessage,
        markActiveRead,
        refreshActiveMessages,
        fetchUnreadCount,
        startPolling,
        stopPolling,
        setActiveConversation,
        widgetOpen,
        openChatWidget,
        closeChatWidget,
        toggleChatWidget,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  return useContext(ChatContext);
}
