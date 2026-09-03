'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

function OrdersRedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const orderId = searchParams.get('orderId');
    if (orderId) {
      router.replace(`/account/orders?orderId=${encodeURIComponent(orderId)}`);
    } else {
      router.replace('/account/orders');
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-2 text-brand-muted">
      <Loader2 className="w-8 h-8 animate-spin text-brand-accent" />
      <span className="text-xs font-mono uppercase tracking-widest">Redirecting to orders...</span>
    </div>
  );
}

export default function OrdersRedirectPage() {
  return (
    <Suspense fallback={null}>
      <OrdersRedirectContent />
    </Suspense>
  );
}
