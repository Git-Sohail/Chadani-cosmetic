'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import axios from 'axios';
import { io as socketIO } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { logApiIssue } from '../utils/api';

const ChatContext = createContext();

function getSocketUrl(apiUrl) {
  if (process.env.NEXT_PUBLIC_SOCKET_URL) {
    return process.env.NEXT_PUBLIC_SOCKET_URL;
  }
  if (apiUrl && typeof apiUrl === 'string') {
    return apiUrl.replace(/\/api\/?$/, '');
  }
  if (typeof window !== 'undefined' && window.location.origin) {
    return window.location.origin;
  }
  return 'http://localhost:5000';
}

export function ChatProvider({ children }) {
  const { user, token, API_URL } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [widgetOpen, setWidgetOpen] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const socketRef = useRef(null);
  const [socketInstance, setSocketInstance] = useState(null);
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

  // Stable ref accessible inside socket event handlers
  const fetchConversationsRef = useRef(fetchConversations);
  useEffect(() => {
    fetchConversationsRef.current = fetchConversations;
  }, [fetchConversations]);

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
        setSocketInstance(null);
        setSocketConnected(false);
      }
      setConversations([]);
      setActiveConversation(null);
      setMessages([]);
      setUnreadCount(0);
      return;
    }

    const targetSocketUrl = getSocketUrl(API_URL);

    // Connect
    const socket = socketIO(targetSocketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 20,
      reconnectionDelay: 1500,
      timeout: 10000,
    });
    socketRef.current = socket;
    setSocketInstance(socket);

    socket.on('connect', () => {
      setSocketConnected(true);

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

    socket.on('disconnect', () => {
      setSocketConnected(false);
    });

    socket.on('connect_error', (err) => {
      setSocketConnected(false);
      console.warn('[socket] Connection fallback active:', err?.message || err);
    });

    // New message arrives — append if it belongs to the active conversation
    socket.on('new_message', (message) => {
      const conv = activeConvRef.current;
      const belongsToActive =
        conv?.id === message.conversationId ||
        (isCustomer && (!conv?.id || conv?.id === message.conversationId));

      if (belongsToActive) {
        if (!conv?.id && message.conversationId) {
          setActiveConversation({ id: message.conversationId, customerId: user.id });
        }
        setMessages((prev) => {
          // Deduplicate by id
          if (prev.some((m) => m.id === message.id)) return prev;
          return [...prev, message];
        });
        // If message is from customer in admin active chat, mark read
        if (isAdmin && activeConvRef.current?.id === message.conversationId) {
          axios
            .patch(`${API_URL}/chat/conversations/${message.conversationId}/read`, null, {
              headers: { Authorization: `Bearer ${token}` },
            })
            .catch(() => {});
        }
      } else {
        // Not currently in this conversation — bump unread badge
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
      setSocketInstance(null);
      setSocketConnected(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user?.id, isAdmin, API_URL]);

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

  const uploadMedia = useCallback(
    async (file) => {
      if (!token || !file) return null;
      const formData = new FormData();
      formData.append('file', file);
      const res = await axios.post(`${API_URL}/chat/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      return res.data; // { url, mediaType, mediaName, mediaSize }
    },
    [API_URL, token]
  );

  const sendMessage = useCallback(
    async (body, conversationId, media = null) => {
      const text = typeof body === 'string' ? body.trim() : '';
      if (!token || (!text && !media?.url)) return false;
      setSending(true);
      try {
        const url = isAdmin
          ? `${API_URL}/chat/conversations/${conversationId}/messages`
          : `${API_URL}/chat/messages`;

        const payload = {
          body: text,
          mediaUrl: media?.url || null,
          mediaType: media?.mediaType || null,
          mediaName: media?.mediaName || null,
          mediaSize: media?.mediaSize || null,
        };

        const res = await axios.post(url, payload, authHeaders());
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

  // Fallback polling: polls every 4s when the customer has chat widget open or admin has active conversation, ensuring messages always arrive even if socket drops
  useEffect(() => {
    if (!token || !user) return;
    let timer = null;

    const poll = async () => {
      if (isCustomer && widgetOpen) {
        try {
          const res = await axios.get(`${API_URL}/chat/me`, authHeaders());
          if (res.data?.conversation) {
            setActiveConversation((prev) => prev || res.data.conversation);
            setMessages((prev) => {
              const incoming = res.data.messages || [];
              if (incoming.length !== prev.length || incoming[incoming.length - 1]?.id !== prev[prev.length - 1]?.id) {
                return incoming;
              }
              return prev;
            });
            setUnreadCount(res.data.unreadCount ?? 0);
          }
        } catch {
          // ignore background poll errors
        }
      } else if (isAdmin && activeConversation?.id) {
        try {
          const res = await axios.get(`${API_URL}/chat/conversations/${activeConversation.id}`, authHeaders());
          if (res.data?.messages) {
            setMessages((prev) => {
              const incoming = res.data.messages || [];
              if (incoming.length !== prev.length || incoming[incoming.length - 1]?.id !== prev[prev.length - 1]?.id) {
                return incoming;
              }
              return prev;
            });
          }
        } catch {
          // ignore background poll errors
        }
      }
    };

    // Run polling timer when widget/conversation is open
    if ((isCustomer && widgetOpen) || (isAdmin && activeConversation?.id)) {
      timer = setInterval(poll, 4000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [token, user, isCustomer, isAdmin, widgetOpen, activeConversation?.id, API_URL, authHeaders]);

  // Kept for backwards-compat (pages call startPolling/stopPolling)
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
    const activeId = activeConversation?.id;
    if (activeId) {
      const res = await axios.get(
        `${API_URL}/chat/conversations/${activeId}`,
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
        uploadMedia,
        markActiveRead,
        refreshActiveMessages,
        fetchUnreadCount,
        startPolling,
        stopPolling,
        setActiveConversation,
        socket: socketInstance,
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
