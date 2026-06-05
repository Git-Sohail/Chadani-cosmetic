'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CheckCircle2, X, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext(null);

const ICONS = {
  success: <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />,
  error: <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />,
  info: <Info className="w-4 h-4 text-rose-600 shrink-0" />,
};

const STYLES = {
  success: 'bg-emerald-50 border-emerald-100 text-emerald-800',
  error: 'bg-red-50 border-red-100 text-red-700',
  info: 'bg-white border-pink-100 text-rose-950',
};

function ToastItem({ toast, onDismiss }) {
  useEffect(() => {
    const t = setTimeout(() => onDismiss(toast.id), toast.duration ?? 3500);
    return () => clearTimeout(t);
  }, [toast.id, toast.duration, onDismiss]);

  return (
    <div className={`flex items-start gap-3 px-4 py-3 rounded-2xl border shadow-lg text-sm font-semibold animate-fadeIn ${STYLES[toast.type ?? 'info']}`}>
      {ICONS[toast.type ?? 'info']}
      <span className="flex-1 leading-snug">{toast.message}</span>
      <button type="button" onClick={() => onDismiss(toast.id)} className="opacity-50 hover:opacity-100 transition-opacity ml-1">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message, type = 'info', duration = 3500) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev.slice(-4), { id, message, type, duration }]);
  }, []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[300] w-full max-w-sm px-4 space-y-2 pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onDismiss={dismiss} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
