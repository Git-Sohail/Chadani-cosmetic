'use client';

import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] Uncaught error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center bg-pink-50/10">
          <div className="bg-white border border-pink-100 rounded-[2.5rem] p-12 shadow-sm max-w-md w-full space-y-6">
            <span className="text-5xl">🥀</span>
            <h1 className="text-2xl font-serif font-black text-rose-950">Something went wrong</h1>
            <p className="text-sm text-rose-900/60 font-medium leading-relaxed">
              An unexpected error occurred. Please refresh the page or go back to the homepage.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 rounded-2xl bg-rose-900 text-white text-xs font-black uppercase tracking-wider hover:bg-rose-950 transition-colors"
              >
                Refresh Page
              </button>
              <a
                href="/"
                className="px-6 py-3 rounded-2xl border border-pink-100 text-rose-900 text-xs font-black uppercase tracking-wider hover:bg-pink-50 transition-colors"
              >
                Go Home
              </a>
            </div>
            {process.env.NODE_ENV !== 'production' && this.state.error && (
              <details className="text-left mt-4">
                <summary className="text-xs text-rose-900/40 cursor-pointer font-semibold">Error details (dev only)</summary>
                <pre className="text-[10px] text-red-600 mt-2 overflow-auto bg-red-50 p-3 rounded-xl">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
