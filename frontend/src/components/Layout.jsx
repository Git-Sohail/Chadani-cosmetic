'use client';

/** @deprecated Use CustomerLayout via app/(customer)/layout.js — kept for legacy imports */
import CustomerLayout from './CustomerLayout';

export default function Layout({ children }) {
  return <CustomerLayout>{children}</CustomerLayout>;
}
