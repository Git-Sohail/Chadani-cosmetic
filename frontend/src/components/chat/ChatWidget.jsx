'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  MessageCircle,
  X,
  Send,
  Loader2,
  ArrowLeft,
  Paperclip,
  Film,
  Image as ImageIcon,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import ChatMessageMedia from './ChatMessageMedia';

function formatTime(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatBytes(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
    uploadMedia,
    markActiveRead,
    activeConversation,
    widgetOpen,
    toggleChatWidget,
    closeChatWidget,
  } = useChat();

  const [draft, setDraft] = useState('');
  const [selectedMedia, setSelectedMedia] = useState(null); // { file, previewUrl, mediaType, name, size }
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

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

  // Clean up object URLs on unmount or file removal
  useEffect(() => {
    return () => {
      if (selectedMedia?.previewUrl) {
        URL.revokeObjectURL(selectedMedia.previewUrl);
      }
    };
  }, [selectedMedia]);

  if (!user || user.role !== 'customer') return null;
  if (!user || user.role !== 'customer') {
    if (!widgetOpen) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/40 backdrop-blur-xs">
        <div className="bg-brand-surface border border-brand-border p-6 max-w-sm w-full shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-brand-accent/10 flex items-center justify-center text-brand-accent">
                <MessageCircle className="w-4 h-4" />
              </div>
              <span className="font-serif text-base text-brand-dark font-medium">Chadani Support</span>
            </div>
            <button
              onClick={closeChatWidget}
              className="text-brand-muted hover:text-brand-dark transition-colors p-1"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-brand-muted leading-relaxed">
            {user?.role === 'admin'
              ? 'You are signed in as an administrator. Manage all customer chats directly in the Admin Messages center.'
              : 'Sign in to your Chadani account to start a live consultation with our team in Dharan, track orders, or ask product questions.'}
          </p>

          <div className="flex flex-col gap-2 pt-1">
            {user?.role === 'admin' ? (
              <a
                href="/admin/messages"
                onClick={closeChatWidget}
                className="w-full text-center py-2.5 px-4 bg-brand-dark text-brand-surface text-xs font-medium uppercase tracking-[0.14em] hover:bg-brand-accent transition-colors"
              >
                Open Admin Messages
              </a>
            ) : (
              <>
                <a
                  href="/login?redirect=/"
                  onClick={closeChatWidget}
                  className="w-full text-center py-2.5 px-4 bg-brand-dark text-brand-surface text-xs font-medium uppercase tracking-[0.14em] hover:bg-brand-accent transition-colors"
                >
                  Sign In to Chat
                </a>
                <a
                  href="/register"
                  onClick={closeChatWidget}
                  className="w-full text-center py-2.5 px-4 border border-brand-border text-brand-dark text-xs font-medium uppercase tracking-[0.14em] hover:bg-brand-bg transition-colors"
                >
                  Create an Account
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  const handleFileSelect = (e) => {
    setUploadError('');
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      setUploadError('Please select a valid image (JPG, PNG, WebP) or video (MP4, WebM).');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (isImage && file.size > 5 * 1024 * 1024) {
      setUploadError('Image size exceeds the 5 MB limit.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (isVideo && file.size > 20 * 1024 * 1024) {
      setUploadError('Video size exceeds the 20 MB limit.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (selectedMedia?.previewUrl) {
      URL.revokeObjectURL(selectedMedia.previewUrl);
    }

    const previewUrl = URL.createObjectURL(file);
    setSelectedMedia({
      file,
      previewUrl,
      mediaType: isVideo ? 'video' : 'image',
      name: file.name,
      size: file.size,
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeSelectedMedia = () => {
    if (selectedMedia?.previewUrl) {
      URL.revokeObjectURL(selectedMedia.previewUrl);
    }
    setSelectedMedia(null);
    setUploadError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const text = draft.trim();
    if ((!text && !selectedMedia) || sending || uploadingMedia) return;

    setUploadError('');
    let uploaded = null;

    if (selectedMedia) {
      setUploadingMedia(true);
      try {
        uploaded = await uploadMedia(selectedMedia.file);
        if (!uploaded?.url) {
          throw new Error('Upload failed');
        }
      } catch (err) {
        setUploadingMedia(false);
        setUploadError(
          err.response?.data?.error ||
            'Failed to upload attachment. Please check file and try again.'
        );
        return;
      }
      setUploadingMedia(false);
    }

    const ok = await sendMessage(text, activeConversation?.id, uploaded);
    if (ok) {
      setDraft('');
      removeSelectedMedia();
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    } else if (uploaded) {
      setUploadError('Could not send message. Please retry.');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  const isSendingOrUploading = sending || uploadingMedia;

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
                    Send us a message or attach photos of products, receipts, or delivery questions.
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
                      className={`max-w-[85%] px-3.5 py-2 text-xs leading-relaxed break-words ${
                        isCustomerMessage
                          ? 'bg-brand-dark text-brand-surface rounded-tl-sm rounded-tr-sm rounded-bl-sm'
                          : 'bg-brand-surface border border-brand-border text-brand-dark rounded-tr-sm rounded-br-sm rounded-bl-sm shadow-2xs'
                      }`}
                    >
                      {msg.mediaUrl ? (
                        <ChatMessageMedia
                          mediaUrl={msg.mediaUrl}
                          mediaType={msg.mediaType}
                          mediaName={msg.mediaName}
                          caption={msg.body}
                          isCustomerMessage={isCustomerMessage}
                        />
                      ) : (
                        <p className="whitespace-pre-wrap">{msg.body}</p>
                      )}
                    </div>
                    <span className="text-[9px] font-mono mt-0.5 px-1 text-brand-muted">
                      {formatTime(msg.createdAt)}
                    </span>
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>

          {/* Attachment Preview Card */}
          {selectedMedia && (
            <div className="px-3 pt-2 pb-1 bg-brand-surface border-t border-brand-border/60">
              <div className="flex items-center justify-between p-2 bg-brand-bg rounded border border-brand-border text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  {selectedMedia.mediaType === 'image' ? (
                    <div className="relative w-10 h-10 rounded overflow-hidden border border-brand-border shrink-0 bg-brand-surface">
                      <img
                        src={selectedMedia.previewUrl}
                        alt="Selected attachment"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded border border-brand-border bg-brand-surface flex items-center justify-center shrink-0">
                      <Film className="w-5 h-5 text-brand-accent" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium text-brand-dark truncate max-w-[160px] sm:max-w-[200px]">
                      {selectedMedia.name}
                    </p>
                    <p className="text-[9px] text-brand-muted font-mono">
                      {formatBytes(selectedMedia.size)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {uploadingMedia ? (
                    <span className="text-[10px] text-brand-accent font-medium flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Uploading…
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={removeSelectedMedia}
                      className="p-1 text-brand-muted hover:text-red-700 cursor-pointer"
                      aria-label="Remove attachment"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Upload Error Banner */}
          {uploadError && (
            <div className="px-3 py-1.5 bg-red-50 border-t border-red-200 text-red-700 text-[11px] flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span className="flex-1 truncate">{uploadError}</span>
              <button
                type="button"
                onClick={() => setUploadError('')}
                className="p-0.5 hover:text-red-900 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Composer Input Area */}
          <form
            onSubmit={handleSend}
            className="p-3 bg-brand-surface border-t border-brand-border flex items-center gap-2 shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
          >
            {/* Native file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
              className="hidden"
              onChange={handleFileSelect}
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSendingOrUploading}
              className="p-2 text-brand-muted hover:text-brand-dark transition-colors cursor-pointer shrink-0 disabled:opacity-40"
              aria-label="Attach photo or video"
              title="Attach photo or video"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            <input
              ref={inputRef}
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                selectedMedia ? 'Add a caption (optional)…' : 'Type your message…'
              }
              maxLength={2000}
              disabled={isSendingOrUploading}
              className="flex-1 px-3.5 py-2 text-xs bg-brand-bg/60 border border-brand-border text-brand-dark placeholder:text-brand-muted/60 focus:outline-none focus:border-brand-accent transition-colors"
            />

            <button
              type="submit"
              disabled={(!draft.trim() && !selectedMedia) || isSendingOrUploading}
              className="p-2.5 bg-brand-dark text-brand-surface hover:bg-brand-accent disabled:opacity-40 transition-colors cursor-pointer shrink-0"
              aria-label="Send message"
              title="Send message"
            >
              {isSendingOrUploading ? (
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
