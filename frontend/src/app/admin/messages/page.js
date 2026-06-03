'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Loader2, User } from 'lucide-react';
import { useChat } from '../../../context/ChatContext';

function formatTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function AdminMessagesPage() {
  const {
    conversations,
    activeConversation,
    messages,
    loading,
    sending,
    unreadCount,
    fetchConversations,
    openConversation,
    sendMessage,
    startPolling,
    stopPolling,
  } = useChat();

  const [draft, setDraft] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (!activeConversation?.id) return undefined;
    startPolling(4000);
    return () => stopPolling();
  }, [activeConversation?.id, startPolling, stopPolling]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!draft.trim() || !activeConversation?.id || sending) return;
    const text = draft;
    setDraft('');
    const ok = await sendMessage(text, activeConversation.id);
    if (!ok) setDraft(text);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-black text-rose-950 flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-rose-800" />
            Messages
          </h1>
          <p className="text-sm text-rose-900/50 font-semibold mt-1">
            Customer support conversations
            {unreadCount > 0 && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full bg-rose-900 text-white text-[10px] font-black">
                {unreadCount} unread
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-14rem)] min-h-[480px]">
        <div className="lg:col-span-4 bg-white border border-pink-100 rounded-3xl overflow-hidden flex flex-col shadow-sm">
          <div className="px-5 py-4 border-b border-pink-50 font-black text-xs uppercase tracking-widest text-rose-900/50">
            Inbox
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {conversations.length === 0 ? (
              <p className="p-8 text-center text-sm text-rose-900/40 font-semibold">
                No conversations yet. Customers can message you from the store chat widget.
              </p>
            ) : (
              conversations.map((conv) => {
                const active = activeConversation?.id === conv.id;
                return (
                  <button
                    key={conv.id}
                    type="button"
                    onClick={() => openConversation(conv.id)}
                    className={`w-full text-left px-5 py-4 border-b border-pink-50/80 transition-colors ${
                      active ? 'bg-rose-50' : 'hover:bg-pink-50/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-rose-900 text-white flex items-center justify-center font-bold text-sm shrink-0">
                        {conv.customer?.name?.charAt(0) || <User className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-sm text-rose-950 truncate">
                            {conv.customer?.name}
                          </span>
                          {conv.unreadCount > 0 && (
                            <span className="shrink-0 w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center justify-center">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-rose-900/40 truncate">{conv.customer?.email}</p>
                        {conv.lastMessage && (
                          <p className="text-xs text-rose-900/60 mt-1 truncate">
                            {conv.lastMessage.body}
                          </p>
                        )}
                        <p className="text-[9px] text-rose-900/30 mt-1 font-semibold">
                          {formatTime(conv.updatedAt)}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="lg:col-span-8 bg-white border border-pink-100 rounded-3xl overflow-hidden flex flex-col shadow-sm">
          {!activeConversation ? (
            <div className="flex-1 flex items-center justify-center p-12 text-center">
              <div>
                <MessageSquare className="w-12 h-12 text-rose-200 mx-auto mb-4" />
                <p className="font-bold text-rose-950/60">Select a conversation</p>
                <p className="text-sm text-rose-900/40 mt-2">Choose a customer from the inbox to reply.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="px-6 py-4 border-b border-pink-50 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-900 text-white flex items-center justify-center font-bold">
                  {activeConversation.customer?.name?.charAt(0)}
                </div>
                <div>
                  <p className="font-black text-rose-950">{activeConversation.customer?.name}</p>
                  <p className="text-xs text-rose-900/50">{activeConversation.customer?.email}</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-pink-50/20 custom-scrollbar">
                {loading && messages.length === 0 ? (
                  <div className="flex justify-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin text-rose-700" />
                  </div>
                ) : (
                  messages.map((msg) => {
                    const mine = msg.senderRole === 'admin';
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                            mine
                              ? 'bg-rose-900 text-white rounded-br-md'
                              : 'bg-white border border-pink-100 text-rose-950 rounded-bl-md'
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">{msg.body}</p>
                          <p
                            className={`text-[9px] mt-1 font-semibold ${
                              mine ? 'text-rose-200' : 'text-rose-900/40'
                            }`}
                          >
                            {formatTime(msg.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={bottomRef} />
              </div>

              <form
                onSubmit={handleSend}
                className="p-4 border-t border-pink-100 flex gap-3 bg-white"
              >
                <input
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Reply to customer..."
                  maxLength={2000}
                  className="flex-1 px-4 py-3 rounded-2xl border border-pink-100 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200"
                />
                <button
                  type="submit"
                  disabled={!draft.trim() || sending}
                  className="px-5 py-3 rounded-2xl bg-rose-900 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 disabled:opacity-40 hover:bg-rose-950"
                >
                  {sending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Send
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
