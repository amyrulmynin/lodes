'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AffiliateOrderPage() {
    const router = useRouter();
    const [products, setProducts] = useState<any[]>([]);
    const [orderItems, setOrderItems] = useState<any[]>([{ productId: '', quantity: 1 }]);
    const [customer, setCustomer] = useState({ name: '', phone: '', address: '' });
    const [loading, setLoading] = useState(false);
    const [whatsappLink, setWhatsappLink] = useState('');

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        const res = await fetch('/api/products');
        if (res.ok) {
            const data = await res.json();
            setProducts(data.products || []);
        }
    };

    const addItem = () => {
        setOrderItems([...orderItems, { productId: '', quantity: 1 }]);
    };

    const removeItem = (index: number) => {
        setOrderItems(orderItems.filter((_, i) => i !== index));
    };

    const updateItem = (index: number, field: string, value: any) => {
        const updated = [...orderItems];
        updated[index] = { ...updated[index], [field]: value };
        setOrderItems(updated);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const items = orderItems.map((item) => {
            const product = products.find((p) => p.id === item.productId);
            return {
                productId: item.productId,
                productName: product?.name || '',
                quantity: parseInt(item.quantity),
                price: product?.price || 0,
                commissionPercent: product?.commissionPercent || 0,
            };
        });

        try {
            const res = await fetch('/api/affiliate/order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerName: customer.name,
                    customerPhone: customer.phone,
                    customerAddress: customer.address,
                    items,
                }),
            });

            const data = await res.json();
            if (res.ok) {
                setWhatsappLink(data.whatsappLink);
            }
            setLoading(false);
        } catch (error) {
            setLoading(false);
        }
    };

    const total = orderItems.reduce((sum, item) => {
        const product = products.find((p) => p.id === item.productId);
        return sum + (product?.price || 0) * parseInt(item.quantity);
    }, 0);

    if (whatsappLink) {
        return (
            <div style={{ minHeight: '100vh', padding: 'var(--spacing-xl)' }}>
                <div className="container" style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <div className="glass-card p-xl text-center">
                        <div className="text-4xl mb-md">✅</div>
                        <h2 className="text-2xl font-bold mb-md">Order Created!</h2>
                        <p className="text-secondary mb-xl">
                            Click the button below to send this order to admin via WhatsApp
                        </p>
                        <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="btn btn-success" style={{ display: 'inline-flex', marginBottom: 'var(--spacing-md)' }}>
                            📱 Send to WhatsApp
                        </a>
                        <br />
                        <Link href="/affiliate/dashboard" className="btn btn-secondary">
                            Back to Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', padding: 'var(--spacing-xl)' }}>
            <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div className="mb-lg">
                    <Link href="/affiliate/dashboard" className="text-secondary" style={{ textDecoration: 'underline' }}>
                        ← Back to Dashboard
                    </Link>
                </div>

                <div className="glass-card p-xl">
                    <h1 className="text-2xl font-bold gradient-text mb-lg">Create Order</h1>

                    <form onSubmit={handleSubmit}>
                        <h3 className="font-semibold mb-md">Customer Details</h3>
                        <div className="grid grid-cols-1 gap-md mb-lg">
                            <div>
                                <label className="text-sm font-medium mb-sm" style={{ display: 'block' }}>Customer Name</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={customer.name}
                                    onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-sm" style={{ display: 'block' }}>Phone Number</label>
                                <input
                                    type="tel"
                                    className="input"
                                    value={customer.phone}
                                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-sm" style={{ display: 'block' }}>Delivery Address</label>
                                <textarea
                                    className="input"
                                    value={customer.address}
                                    onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                                    rows={3}
                                    style={{ resize: 'vertical' }}
                                />
                            </div>
                        </div>

                        <h3 className="font-semibold mb-md">Order Items</h3>
                        {orderItems.map((item, index) => (
                            <div key={index} className="glass-card p-md mb-md" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                                <div className="grid grid-cols-2 gap-md">
                                    <div>
                                        <label className="text-sm font-medium mb-sm" style={{ display: 'block' }}>Product</label>
                                        <select
                                            className="input"
                                            value={item.productId}
                                            onChange={(e) => updateItem(index, 'productId', e.target.value)}
                                            required
                                        >
                                            <option value="">Select product</option>
                                            {products.map((p) => (
                                                <option key={p.id} value={p.id}>
                                                    {p.name} - RM {p.price} ({p.commissionPercent}% commission)
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-sm" style={{ display: 'block' }}>Quantity</label>
                                        <div className="flex gap-sm">
                                            <input
                                                type="number"
                                                className="input"
                                                value={item.quantity}
                                                onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                                                min="1"
                                                required
                                                style={{ flex: 1 }}
                                            />
                                            {orderItems.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem(index)}
                                                    className="btn btn-danger"
                                                >
                                                    ✕
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <button type="button" onClick={addItem} className="btn btn-secondary mb-lg" style={{ width: '100%' }}>
                            + Add Another Item
                        </button>

                        <div className="glass-card p-md mb-lg" style={{ background: 'rgba(168, 85, 247, 0.1)' }}>
                            <div className="flex justify-between">
                                <span className="font-semibold">Total Amount:</span>
                                <span className="text-xl font-bold">RM {total.toFixed(2)}</span>
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
                            {loading ? 'Creating...' : 'Create Order & Send to WhatsApp'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
