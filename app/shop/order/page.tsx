'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getAffiliateRef } from '@/lib/tracking';
import { showAlert } from '@/lib/swal';

function OrderForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const productIdParam = searchParams.get('product');

    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [affiliateCode, setAffiliateCode] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        productId: productIdParam || '',
        quantity: 1,
        customerName: '',
        customerPhone: '',
        customerAddress: '',
    });

    useEffect(() => {
        // Get affiliate ref
        const ref = getAffiliateRef();
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

                // If product param exists but not in formData (initial load), set it
                if (productIdParam && !formData.productId) {
                    setFormData(prev => ({ ...prev, productId: productIdParam }));
                } else if (!productIdParam && data.products.length > 0) {
                    // Default to first product if none selected
                    setFormData(prev => ({ ...prev, productId: data.products[0].id }));
                }
            }
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const selectedProduct = products.find(p => p.id === formData.productId);
    const total = selectedProduct ? selectedProduct.price * formData.quantity : 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const res = await fetch('/api/public/order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    affiliateCode, // Send tracked affiliate code
                }),
            });

            const data = await res.json();

            if (res.ok) {
                await showAlert('Success', 'Order placed successfully! We will contact you shortly.', 'success');
                router.push('/shop');
            } else {
                await showAlert('Error', data.error || 'Failed to place order', 'error');
            }
        } catch (error) {
            await showAlert('Error', 'Network error. Please try again.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className="spinner"></div>;
    }

    return (
        <div className="glass-card p-lg max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-lg gradient-text">Place Your Order</h2>

            {affiliateCode && (
                <div className="mb-md p-sm bg-white/10 rounded-md text-sm">
                    Referred by: <span className="font-bold">{affiliateCode}</span>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                {/* Product Selection */}
                <div className="mb-md">
                    <label className="block text-sm font-medium mb-sm">Select Product</label>
                    <select
                        className="input w-full"
                        value={formData.productId}
                        onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                        required
                    >
                        <option value="" disabled>Choose a dessert...</option>
                        {products.map(p => (
                            <option key={p.id} value={p.id}>
                                {p.name} - RM {p.price.toFixed(2)}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Quantity */}
                <div className="mb-md">
                    <label className="block text-sm font-medium mb-sm">Quantity</label>
                    <input
                        type="number"
                        min="1"
                        className="input w-full"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                        required
                    />
                </div>

                {/* Customer Details */}
                <div className="mb-md">
                    <label className="block text-sm font-medium mb-sm">Your Name</label>
                    <input
                        type="text"
                        className="input w-full"
                        value={formData.customerName}
                        onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                        required
                        placeholder="John Doe"
                    />
                </div>

                <div className="mb-md">
                    <label className="block text-sm font-medium mb-sm">Phone Number</label>
                    <input
                        type="tel"
                        className="input w-full"
                        value={formData.customerPhone}
                        onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                        required
                        placeholder="0123456789"
                    />
                </div>

                <div className="mb-lg">
                    <label className="block text-sm font-medium mb-sm">Delivery Address</label>
                    <textarea
                        className="input w-full h-24"
                        value={formData.customerAddress}
                        onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
                        required
                        placeholder="Full address for delivery..."
                    />
                </div>

                {/* Total & Submit */}
                <div className="border-t border-white/10 pt-md mt-md">
                    <div className="flex justify-between items-center mb-lg">
                        <span className="text-lg font-semibold">Total Amount:</span>
                        <span className="text-2xl font-bold text-primary">
                            RM {total.toFixed(2)}
                        </span>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting || !formData.productId}
                        className="btn btn-primary w-full py-md text-lg"
                    >
                        {submitting ? 'Processing...' : 'Confirm Order'}
                    </button>

                    <div className="text-center mt-md">
                        <Link href="/shop" className="text-sm text-muted hover:text-white">
                            Cancel and return to shop
                        </Link>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default function OrderPage() {
    return (
        <div style={{ minHeight: '100vh', padding: 'var(--spacing-xl)' }}>
            <div className="container">
                <Suspense fallback={<div className="spinner"></div>}>
                    <OrderForm />
                </Suspense>
            </div>
        </div>
    );
}
