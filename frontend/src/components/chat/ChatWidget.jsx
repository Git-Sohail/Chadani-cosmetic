'use client';

import React, { useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
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

  const [draft, setDraft] = React.useState('');
  const bottomRef = useRef(null);

  // Load conversation history when widget opens; socket handles new messages
  useEffect(() => {
    if (!widgetOpen || !isCustomer || !user) return;
    fetchMyConversation();
    markActiveRead();
  }, [widgetOpen, isCustomer, user, fetchMyConversation, markActiveRead]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, widgetOpen]);

  if (!user || user.role !== 'customer') return null;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!draft.trim() || sending) return;
    const text = draft;
    setDraft('');
    const ok = await sendMessage(text, activeConversation?.id);
    if (!ok) setDraft(text);
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-[100] flex items-center gap-2">
        {!widgetOpen && (
          <span className="hidden sm:inline-flex px-3 py-1.5 rounded-full bg-white border border-pink-100 text-[10px] font-black uppercase tracking-wider text-rose-900 shadow-md pointer-events-none">
            Support Chat
          </span>
        )}
        <button
          type="button"
          onClick={toggleChatWidget}
          className="relative w-14 h-14 rounded-full bg-rose-900 text-white shadow-xl shadow-rose-900/30 flex items-center justify-center hover:bg-rose-950 transition-all hover:scale-105 ring-4 ring-rose-900/10"
          aria-label={widgetOpen ? 'Close support chat' : 'Open support chat'}
        >
          {widgetOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
          {!widgetOpen && unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-amber-400 text-rose-950 text-[10px] font-black flex items-center justify-center border-2 border-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>

      {widgetOpen && (
        <div
          className="fixed bottom-24 right-6 z-[100] w-[min(100vw-2rem,380px)] h-[min(70vh,520px)] bg-white rounded-3xl border border-pink-100 shadow-2xl shadow-rose-900/20 flex flex-col overflow-hidden"
          role="dialog"
          aria-label="Support chat"
        >
          <div className="px-5 py-4 bg-rose-900 text-white flex items-center justify-between shrink-0">
            <div>
              <p className="text-sm font-black">Support Chat</p>
              <p className="text-[10px] text-rose-100/80 font-semibold">Type below and press Send</p>
            </div>
            <button
              type="button"
              onClick={closeChatWidget}
              className="p-1.5 rounded-lg hover:bg-white/10"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 bg-pink-50/30 custom-scrollbar">
            {loading && messages.length === 0 ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-rose-700" />
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-10 px-4">
                <MessageCircle className="w-10 h-10 text-rose-300 mx-auto mb-3" />
                <p className="text-sm font-bold text-rose-950/70">Hi {user.name?.split(' ')[0]}!</p>
                <p className="text-xs text-rose-900/50 mt-2">
                  Ask about orders, products, or delivery. Our team will reply here.
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const mine = msg.senderRole === 'customer';
                return (
                  <div
                    key={msg.id}
                    className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
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

          <form onSubmit={handleSend} className="p-3 border-t border-pink-100 bg-white flex gap-2 shrink-0">
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Type your message..."
              maxLength={2000}
              autoFocus
              className="flex-1 px-4 py-2.5 rounded-xl border border-pink-100 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200"
            />
            <button
              type="submit"
              disabled={!draft.trim() || sending}
              className="p-2.5 rounded-xl bg-rose-900 text-white disabled:opacity-40 hover:bg-rose-950 transition-colors"
              aria-label="Send message"
            >
              {sending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
