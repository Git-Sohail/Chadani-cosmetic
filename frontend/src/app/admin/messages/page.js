'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  Loader2,
  Paperclip,
  Film,
  X,
  AlertCircle,
} from 'lucide-react';
import { useChat } from '../../../context/ChatContext';
import Avatar from '../../../components/Avatar';
import ChatMessageMedia from '../../../components/chat/ChatMessageMedia';

function formatTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function formatBytes(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
    uploadMedia,
  } = useChat();

  const [draft, setDraft] = useState('');
  const [selectedMedia, setSelectedMedia] = useState(null); // { file, previewUrl, mediaType, name, size }
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);

  // Load inbox on mount — socket keeps it updated after that
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Clean up object URLs
  useEffect(() => {
    return () => {
      if (selectedMedia?.previewUrl) {
        URL.revokeObjectURL(selectedMedia.previewUrl);
      }
    };
  }, [selectedMedia]);

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
    if ((!text && !selectedMedia) || !activeConversation?.id || sending || uploadingMedia) return;

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

    const ok = await sendMessage(text, activeConversation.id, uploaded);
    if (ok) {
      setDraft('');
      removeSelectedMedia();
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    } else if (uploaded) {
      setUploadError('Could not send message. Please retry.');
    }
  };

  const isSendingOrUploading = sending || uploadingMedia;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl text-brand-dark flex items-center gap-3">
            <MessageSquare className="w-6 h-6 sm:w-7 sm:h-7 text-brand-accent" />
            <span>Support Inbox</span>
          </h1>
          <p className="text-xs text-brand-muted mt-1">
            Customer inquiries, product questions & media attachments
            {unreadCount > 0 && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 bg-brand-dark text-brand-surface text-[10px] font-mono">
                {unreadCount} unread
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-14rem)] min-h-[500px]">
        {/* Inbox List */}
        <div className="lg:col-span-4 bg-brand-surface border border-brand-border overflow-hidden flex flex-col shadow-xs">
          <div className="px-5 py-3.5 border-b border-brand-border text-xs uppercase tracking-wider font-medium text-brand-muted">
            Conversations
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {conversations.length === 0 ? (
              <p className="p-8 text-center text-xs text-brand-muted leading-relaxed">
                No customer conversations yet. Incoming messages will appear here in real time.
              </p>
            ) : (
              conversations.map((conv) => {
                const active = activeConversation?.id === conv.id;
                return (
                  <button
                    key={conv.id}
                    type="button"
                    onClick={() => openConversation(conv.id)}
                    className={`w-full text-left px-4 py-3.5 border-b border-brand-border/60 transition-colors cursor-pointer ${
                      active ? 'bg-brand-bg' : 'hover:bg-brand-bg/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar
                        src={conv.customer?.profileImage}
                        name={conv.customer?.name}
                        size="md"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-serif text-sm text-brand-dark truncate">
                            {conv.customer?.name || 'Customer'}
                          </span>
                          {conv.unreadCount > 0 && (
                            <span className="shrink-0 w-4 h-4 rounded-full bg-brand-accent text-brand-surface text-[9px] font-mono font-bold flex items-center justify-center">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-brand-muted truncate font-mono">
                          {conv.customer?.email}
                        </p>
                        {conv.lastMessage && (
                          <p className="text-xs text-brand-dark/70 mt-1 truncate">
                            {conv.lastMessage.mediaUrl
                              ? `[${conv.lastMessage.mediaType === 'video' ? 'Video' : 'Photo'}] ${conv.lastMessage.body || ''}`
                              : conv.lastMessage.body}
                          </p>
                        )}
                        <p className="text-[9px] text-brand-muted font-mono mt-1">
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

        {/* Active Conversation Chat Window */}
        <div className="lg:col-span-8 bg-brand-surface border border-brand-border overflow-hidden flex flex-col shadow-xs">
          {!activeConversation ? (
            <div className="flex-1 flex items-center justify-center p-12 text-center">
              <div>
                <MessageSquare className="w-10 h-10 text-brand-muted/40 mx-auto mb-3" />
                <p className="font-serif text-base text-brand-dark">Select a conversation</p>
                <p className="text-xs text-brand-muted mt-1">
                  Choose a customer from the inbox list to reply and share product advice.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="px-5 py-3.5 border-b border-brand-border flex items-center gap-3 bg-brand-surface shrink-0">
                <Avatar
                  src={activeConversation.customer?.profileImage}
                  name={activeConversation.customer?.name}
                  size="md"
                />
                <div className="min-w-0">
                  <p className="font-serif text-sm text-brand-dark truncate">
                    {activeConversation.customer?.name}
                  </p>
                  <p className="text-[11px] text-brand-muted font-mono truncate">
                    {activeConversation.customer?.email}
                  </p>
                </div>
              </div>

              {/* Message History */}
              <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-brand-bg/40 custom-scrollbar">
                {loading && messages.length === 0 ? (
                  <div className="flex justify-center py-16">
                    <Loader2 className="w-6 h-6 animate-spin text-brand-accent" />
                  </div>
                ) : (
                  messages.map((msg) => {
                    const mine = msg.senderRole === 'admin';
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${mine ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[80%] px-3.5 py-2 text-xs leading-relaxed break-words ${
                            mine
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
                              isCustomerMessage={!mine}
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

              {/* Media Preview Card */}
              {selectedMedia && (
                <div className="px-4 py-2 bg-brand-surface border-t border-brand-border/60">
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
                        <p className="text-[11px] font-medium text-brand-dark truncate max-w-[240px]">
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
                <div className="px-4 py-1.5 bg-red-50 border-t border-red-200 text-red-700 text-[11px] flex items-center gap-2">
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

              {/* Composer */}
              <form
                onSubmit={handleSend}
                className="p-3.5 border-t border-brand-border flex items-center gap-2 bg-brand-surface"
              >
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
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={
                    selectedMedia ? 'Reply with caption (optional)…' : 'Reply to customer…'
                  }
                  maxLength={2000}
                  disabled={isSendingOrUploading}
                  className="flex-1 px-3.5 py-2 text-xs bg-brand-bg/60 border border-brand-border text-brand-dark placeholder:text-brand-muted/60 focus:outline-none focus:border-brand-accent transition-colors"
                />

                <button
                  type="submit"
                  disabled={(!draft.trim() && !selectedMedia) || isSendingOrUploading}
                  className="px-4 py-2 bg-brand-dark text-brand-surface text-xs font-medium uppercase tracking-wider flex items-center gap-1.5 hover:bg-brand-accent disabled:opacity-40 transition-colors cursor-pointer shrink-0 min-h-[36px]"
                >
                  {isSendingOrUploading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>Send</span>
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
