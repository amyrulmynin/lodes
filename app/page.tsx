'use client';

import { useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { trackAffiliateFromUrl } from '@/lib/tracking';

function LandingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check for affiliate ref
    const ref = searchParams.get('ref');
    if (ref) {
      trackAffiliateFromUrl();
      // If ref is present, redirect to shop
      router.push('/shop');
    }
  }, [searchParams, router]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <div className="glass-card p-xl fade-in" style={{ textAlign: 'center' }}>
          <h1 className="text-4xl font-bold gradient-text mb-md">
            🍰 Lodes Desserts
          </h1>
          <p className="text-lg text-secondary mb-xl">
            Premium Desserts & Affiliate Program
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-lg mt-xl">
            {/* Customer Shop */}
            <Link href="/shop" className="glass-card p-lg" style={{ cursor: 'pointer', textDecoration: 'none', background: 'rgba(255, 255, 255, 0.05)' }}>
              <div>
                <div className="text-2xl mb-sm">🛍️</div>
                <h3 className="font-semibold text-lg mb-sm">Order Desserts</h3>
                <p className="text-sm text-muted">Browse our menu & order now</p>
              </div>
            </Link>

            {/* Admin Login */}
            <Link href="/login" className="glass-card p-lg" style={{ cursor: 'pointer', textDecoration: 'none' }}>
              <div>
                <div className="text-2xl mb-sm">👤</div>
                <h3 className="font-semibold text-lg mb-sm">Admin Login</h3>
                <p className="text-sm text-muted">System administrator</p>
              </div>
            </Link>

            {/* Affiliate Login */}
            <Link href="/affiliate/login" className="glass-card p-lg" style={{ cursor: 'pointer', textDecoration: 'none' }}>
              <div>
                <div className="text-2xl mb-sm">💼</div>
                <h3 className="font-semibold text-lg mb-sm">Affiliate Login</h3>
                <p className="text-sm text-muted">Affiliate partners</p>
              </div>
            </Link>
          </div>

          <div className="mt-xl p-lg" style={{ background: 'rgba(168, 85, 247, 0.1)', borderRadius: 'var(--radius-md)' }}>
            <h4 className="font-semibold mb-sm">✨ Join Our Affiliate Program</h4>
            <ul className="text-sm text-secondary" style={{ listStyle: 'none', padding: 0 }}>
              <li className="mb-sm">✅ Earn commission on every sale</li>
              <li className="mb-sm">✅ Easy withdrawal via bank/e-wallet</li>
              <li className="mb-sm">✅ Track your performance in real-time</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="spinner"></div>}>
      <LandingContent />
    </Suspense>
  );
}
