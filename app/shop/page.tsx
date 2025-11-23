'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { trackAffiliateFromUrl, getAffiliateRef } from '@/lib/tracking';

export default function ShopPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [affiliateCode, setAffiliateCode] = useState<string | null>(null);

    useEffect(() => {
        // Track affiliate ref from URL
        const ref = trackAffiliateFromUrl();
        setAffiliateCode(ref);

        // Fetch products
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/products');
            if (res.ok) {
                const data = await res.json();
                setProducts(data.products || []);
            }
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', padding: 'var(--spacing-xl)' }}>
            <div className="container">
                {/* Header */}
                <div className="text-center mb-xl">
                    <h1 className="text-4xl font-bold gradient-text mb-md">Lodes Desserts</h1>
                    <p className="text-lg text-secondary">Premium Desserts Delivered to Your Door</p>
                    {affiliateCode && (
                        <div className="mt-md">
                            <span className="badge badge-info">
                                Referred by: {affiliateCode}
                            </span>
                        </div>
                    )}
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-3 gap-lg mb-xl">
                    {products.map((product) => (
                        <div key={product.id} className="glass-card p-lg">
                            {/* Product Image */}
                            <div
                                style={{
                                    width: '100%',
                                    height: '200px',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    borderRadius: 'var(--radius-md)',
                                    marginBottom: 'var(--spacing-md)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '4rem'
                                }}
                            >
                                🍰
                            </div>

                            {/* Product Info */}
                            <h3 className="font-bold text-xl mb-sm">{product.name}</h3>
                            <p className="text-sm text-muted mb-md">{product.description}</p>

                            {/* Price & Commission */}
                            <div className="mb-md">
                                <div className="text-2xl font-bold mb-xs" style={{ color: 'var(--primary)' }}>
                                    RM {product.price.toFixed(2)}
                                </div>
                                <div className="text-xs" style={{ color: 'var(--success)' }}>
                                    {affiliateCode && `Your referrer earns ${product.commissionPercent}% commission`}
                                </div>
                            </div>

                            {/* Order Button */}
                            <Link
                                href={`/shop/order?product=${product.id}`}
                                className="btn btn-primary"
                                style={{ width: '100%', textDecoration: 'none', display: 'block', textAlign: 'center' }}
                            >
                                Order Now
                            </Link>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {products.length === 0 && (
                    <div className="text-center text-muted py-xl">
                        <div className="text-4xl mb-md">🍰</div>
                        <p>No products available at the moment</p>
                    </div>
                )}

                {/* Footer Info */}
                <div className="glass-card p-lg text-center">
                    <h3 className="font-semibold mb-md">Want to become an affiliate?</h3>
                    <p className="text-muted mb-md">
                        Earn commission by sharing our delicious desserts with your friends and family!
                    </p>
                    <Link href="/affiliate/login" className="btn btn-secondary">
                        Join Affiliate Program
                    </Link>
                </div>
            </div>
        </div>
    );
}
