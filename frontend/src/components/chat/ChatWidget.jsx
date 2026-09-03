'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MessageCircle, X, Send, Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';

function formatTime(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function ChatWidget() {
  const { user } = useAuth();
  const {
    messages,
    unreadCount,
    loading,
    sending,
    isCustomer,
    fetchMyConversation,
    sendMessage,
    markActiveRead,
    activeConversation,
    widgetOpen,
    toggleChatWidget,
    closeChatWidget,
  } = useChat();

  const [draft, setDraft] = useState('');
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Load conversation history when widget opens; socket handles new messages
  useEffect(() => {
    if (!widgetOpen || !isCustomer || !user) return;
    fetchMyConversation();
    markActiveRead();
  }, [widgetOpen, isCustomer, user, fetchMyConversation, markActiveRead]);

  // Smooth scroll to bottom on message change or widget open
  useEffect(() => {
    if (widgetOpen) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, widgetOpen]);

  // Focus input when opened on desktop
  useEffect(() => {
    if (widgetOpen && window.innerWidth >= 640) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [widgetOpen]);

  if (!user || user.role !== 'customer') return null;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!draft.trim() || sending) return;
    const text = draft.trim();
    setDraft('');
    const ok = await sendMessage(text, activeConversation?.id);
    if (!ok) {
      setDraft(text);
    } else {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  return (
    <>
      {/* Refined Single Floating Launcher Button (when closed) */}
      {!widgetOpen && (
        <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-[90]">
          <button
            type="button"
            onClick={toggleChatWidget}
            className="relative w-12 h-12 sm:w-13 sm:h-13 bg-brand-dark text-brand-surface border border-brand-border/60 shadow-lg flex items-center justify-center hover:bg-brand-accent transition-all cursor-pointer group"
            aria-label="Open support chat"
            title="Open support chat"
          >
            <MessageCircle className="w-5 h-5 text-brand-surface transition-transform group-hover:scale-105" />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-brand-accent text-brand-surface text-[10px] font-mono font-bold flex items-center justify-center border border-brand-surface">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Support Chat Messenger Modal / Floating Window */}
      {widgetOpen && (
        <div
          role="dialog"
          aria-label="Customer support chat"
          className="fixed inset-0 z-[150] w-full h-[100dvh] bg-brand-bg flex flex-col sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[380px] sm:h-[540px] sm:border sm:border-brand-border sm:shadow-2xl sm:bg-brand-surface overflow-hidden animate-fadeIn"
        >
          {/* Header */}
          <div className="px-4 py-3.5 sm:px-5 sm:py-3 bg-brand-surface border-b border-brand-border flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <button
                type="button"
                onClick={closeChatWidget}
                className="sm:hidden p-1.5 -ml-1 text-brand-muted hover:text-brand-dark cursor-pointer"
                aria-label="Back to store"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="w-8 h-8 rounded-full border border-brand-border bg-brand-bg flex items-center justify-center shrink-0">
                <MessageCircle className="w-4 h-4 text-brand-accent" />
              </div>
              <div className="min-w-0">
                <h2 className="font-serif text-sm font-medium text-brand-dark leading-tight truncate">
                  Chadani Support
                </h2>
                <p className="text-[10px] uppercase tracking-wider text-brand-muted">
                  Customer assistance
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={closeChatWidget}
              className="p-1.5 text-brand-muted hover:text-brand-dark transition-colors cursor-pointer"
              aria-label="Close support chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-3 bg-brand-bg/40">
            {loading && messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-16 text-brand-muted gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-brand-accent" />
                <span className="text-[10px] uppercase tracking-widest font-mono">
                  Loading conversation...
                </span>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12 px-4 space-y-3">
                <div className="w-12 h-12 rounded-full border border-brand-border bg-brand-surface flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-brand-accent" />
                </div>
                <div className="space-y-1 max-w-xs">
                  <p className="font-serif text-base text-brand-dark">How can we help?</p>
                  <p className="text-xs text-brand-muted leading-relaxed">
                    Send us a message and our Dharan boutique team will assist you with products, orders, or delivery.
                  </p>
                </div>
              </div>
            ) : (
              messages.map((msg, index) => {
                const isCustomerMessage = msg.senderRole === 'customer';
                const prevMsg = messages[index - 1];
                const isSequence = prevMsg && prevMsg.senderRole === msg.senderRole;

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      isCustomerMessage ? 'items-end' : 'items-start'
                    } ${isSequence ? 'mt-1' : 'mt-2.5'}`}
                  >
                    <div
                      className={`max-w-[80%] px-3.5 py-2 text-xs leading-relaxed break-words ${
                        isCustomerMessage
                          ? 'bg-brand-dark text-brand-surface rounded-tl-sm rounded-tr-sm rounded-bl-sm'
                          : 'bg-brand-surface border border-brand-border text-brand-dark rounded-tr-sm rounded-br-sm rounded-bl-sm shadow-2xs'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.body}</p>
                    </div>
                    <span
                      className={`text-[9px] font-mono mt-0.5 px-1 ${
                        isCustomerMessage ? 'text-brand-muted' : 'text-brand-muted'
                      }`}
                    >
                      {formatTime(msg.createdAt)}
                    </span>
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>

          {/* Composer Input Area */}
          <form
            onSubmit={handleSend}
            className="p-3 bg-brand-surface border-t border-brand-border flex items-center gap-2 shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
          >
            <input
              ref={inputRef}
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message…"
              maxLength={2000}
              disabled={sending}
              className="flex-1 px-3.5 py-2 text-xs bg-brand-bg/60 border border-brand-border text-brand-dark placeholder:text-brand-muted/60 focus:outline-none focus:border-brand-accent transition-colors"
            />
            <button
              type="submit"
              disabled={!draft.trim() || sending}
              className="p-2.5 bg-brand-dark text-brand-surface hover:bg-brand-accent disabled:opacity-40 transition-colors cursor-pointer shrink-0"
              aria-label="Send message"
              title="Send message"
            >
              {sending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
