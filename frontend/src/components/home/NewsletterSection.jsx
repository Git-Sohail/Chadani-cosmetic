'use client';

import React, { useState } from 'react';
import Button from '../Button';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-brand-bg">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-brand-surface border border-brand-border p-8 sm:p-12 lg:p-14">
          <span className="text-[11px] font-medium uppercase tracking-[0.25em] text-brand-accent block mb-2">
            The Journal & Releases
          </span>

          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-brand-dark font-normal tracking-tight mb-3">
            Join the Chadani Circle
          </h2>

          <p className="text-sm text-brand-muted max-w-md mx-auto leading-relaxed font-normal mb-8">
            Receive updates on seasonal arrivals, curated skincare advice, and restocks directly in your inbox.
          </p>

          {subscribed ? (
            <div className="p-4 bg-brand-bg border border-brand-border text-xs tracking-wide text-brand-dark font-medium">
              Thank you for subscribing to our updates.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="flex-1 px-4 py-3 bg-brand-bg border border-brand-border rounded text-xs text-brand-text placeholder:text-brand-muted/60 focus:outline-none focus:border-brand-accent"
              />
              <Button
                type="submit"
                variant="primary"
                size="md"
                className="px-6 py-3 text-xs tracking-[0.16em] uppercase shrink-0"
              >
                Subscribe
              </Button>
            </form>
          )}

          <p className="text-[11px] text-brand-muted/70 mt-4">
            We value your privacy. Unsubscribe at any time.
          </p>
        </div>
      </div>
    </section>
  );
}
