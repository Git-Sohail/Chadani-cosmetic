'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import axios from 'axios';
import { io as socketIO } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { logApiIssue } from '../utils/api';

const ChatContext = createContext();

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

export function ChatProvider({ children }) {
  const { user, token, API_URL } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [widgetOpen, setWidgetOpen] = useState(false);
  const socketRef = useRef(null);
  const activeConvRef = useRef(null); // keep latest value accessible inside socket handlers

  const openChatWidget = useCallback(() => setWidgetOpen(true), []);
  const closeChatWidget = useCallback(() => setWidgetOpen(false), []);
  const toggleChatWidget = useCallback(() => setWidgetOpen((v) => !v), []);
  const isAdmin = user?.role === 'admin';
  const isCustomer = user?.role === 'customer';

  const authHeaders = useCallback(
    () => ({ headers: { Authorization: `Bearer ${token}` } }),
    [token]
  );

  // Keep ref in sync
  useEffect(() => {
    activeConvRef.current = activeConversation;
  }, [activeConversation]);

  // ── Socket lifecycle ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!token || !user) {
      // Disconnect on logout
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setConversations([]);
      setActiveConversation(null);
      setMessages([]);
      setUnreadCount(0);
      return;
    }

    // Connect
    const socket = socketIO(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1500,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      // Join admin room so inbox updates in real-time
      if (isAdmin) socket.emit('join_admin');

      // Rejoin active conversation room if there is one (e.g. after reconnect)
      const conv = activeConvRef.current;
      if (conv?.id) {
        socket.emit('join', { userId: user.id, conversationId: conv.id });
      } else {
        socket.emit('join', { userId: user.id });
      }
    });

    // New message arrives — append if it belongs to the active conversation
    socket.on('new_message', (message) => {
      const conv = activeConvRef.current;
      if (conv?.id === message.conversationId) {
        setMessages((prev) => {
          // Deduplicate by id
          if (prev.some((m) => m.id === message.id)) return prev;
          return [...prev, message];
        });
        // If the message is from the other side, keep unread count at 0
        // (the widget/page is open so user sees it instantly)
      } else {
        // Not in this conversation — bump unread badge
        setUnreadCount((prev) => prev + 1);
      }

      // Update the conversation list so the last message preview refreshes
      if (isAdmin) {
        setConversations((prev) =>
          prev.map((c) =>
            c.id === message.conversationId
              ? { ...c, lastMessage: message, updatedAt: message.createdAt }
              : c
          )
        );
      }
    });

    // Admin inbox: a conversation was updated (new customer message)
    socket.on('conversation_updated', ({ conversationId, lastMessage }) => {
      if (!isAdmin) return;
      setConversations((prev) => {
        const exists = prev.some((c) => c.id === conversationId);
        if (!exists) {
          // New conversation — fetch full list to get customer details
          fetchConversationsRef.current?.();
          return prev;
        }
        // Move updated conversation to top & update last message
        const updated = prev.map((c) =>
          c.id === conversationId
            ? { ...c, lastMessage, updatedAt: lastMessage.createdAt }
            : c
        );
        // Re-sort by updatedAt desc
        return [...updated].sort(
          (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
        );
      });

      // Bump admin unread count if this isn't the active conversation
      if (activeConvRef.current?.id !== conversationId) {
        setUnreadCount((prev) => prev + 1);
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user?.id, isAdmin]);

  // When the active conversation changes, join that socket room
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !activeConversation?.id) return;
    socket.emit('join_conversation', { conversationId: activeConversation.id });
  }, [activeConversation?.id]);

  // ── API helpers ─────────────────────────────────────────────────────────────
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

  // Keep a stable ref so the socket handler can call it without stale closure
  const fetchConversationsRef = useRef(fetchConversations);
  useEffect(() => {
    fetchConversationsRef.current = fetchConversations;
  }, [fetchConversations]);

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

        // Mark as read on server
        await axios.patch(
          `${API_URL}/chat/conversations/${conversationId}/read`,
          null,
          authHeaders()
        );
        // Recalculate unread from fresh list
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

        // Optimistically append sender's own message immediately
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });

        if (isCustomer && res.data.conversationId) {
          setActiveConversation((prev) =>
            prev?.id === res.data.conversationId
              ? prev
              : { ...(prev || {}), id: res.data.conversationId, customerId: user?.id }
          );
        }
        return true;
      } catch (err) {
        logApiIssue('send message', err);
        return false;
      } finally {
        setSending(false);
      }
    },
    [API_URL, token, isAdmin, isCustomer, authHeaders, user?.id]
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

  // Kept for backwards-compat (pages call startPolling/stopPolling) — now no-ops
  const startPolling = useCallback(() => {}, []);
  const stopPolling = useCallback(() => {}, []);

  // Refresh messages manually (fallback / first load)
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

  // Initial unread count fetch for customers
  useEffect(() => {
    if (!token || !user || !isCustomer) return;
    fetchUnreadCount();
  }, [token, user, isCustomer, fetchUnreadCount]);

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
