'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AffiliateSalesPage() {
    const router = useRouter();
    const [sales, setSales] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchSales();
    }, []);

    const fetchSales = async () => {
        try {
            const res = await fetch('/api/affiliate/sales');
            if (!res.ok) {
                router.push('/affiliate/login');
                return;
            }
            const data = await res.json();
            setSales(data.sales || []);
            setLoading(false);
        } catch (error) {
            console.error(error);
            router.push('/affiliate/login');
        }
    };

    const filteredSales = filter === 'all'
        ? sales
        : sales.filter(s => s.status === filter);

    const totalCommission = sales.reduce((sum, s) => sum + (s.commission || 0), 0);
    const completedCommission = sales
        .filter(s => s.status === 'completed')
        .reduce((sum, s) => sum + (s.commission || 0), 0);

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
                <div className="mb-lg">
                    <Link href="/affiliate/dashboard" className="text-secondary" style={{ textDecoration: 'underline' }}>
                        ← Back to Dashboard
                    </Link>
                </div>

                <h1 className="text-3xl font-bold gradient-text mb-lg">Sales History</h1>

                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-lg mb-lg">
                    <div className="glass-card p-lg">
                        <div className="text-muted text-sm mb-sm">Total Sales</div>
                        <div className="text-3xl font-bold">{sales.length}</div>
                    </div>
                    <div className="glass-card p-lg">
                        <div className="text-muted text-sm mb-sm">Total Commission</div>
                        <div className="text-3xl font-bold" style={{ color: 'var(--primary)' }}>
                            RM {totalCommission.toFixed(2)}
                        </div>
                    </div>
                    <div className="glass-card p-lg">
                        <div className="text-muted text-sm mb-sm">Completed Commission</div>
                        <div className="text-3xl font-bold" style={{ color: 'var(--success)' }}>
                            RM {completedCommission.toFixed(2)}
                        </div>
                    </div>
                </div>

                {/* Filter */}
                <div className="glass-card p-md mb-lg">
                    <div className="flex gap-md">
                        <button
                            onClick={() => setFilter('all')}
                            className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                        >
                            All ({sales.length})
                        </button>
                        <button
                            onClick={() => setFilter('completed')}
                            className={`btn ${filter === 'completed' ? 'btn-primary' : 'btn-secondary'}`}
                        >
                            Completed ({sales.filter(s => s.status === 'completed').length})
                        </button>
                        <button
                            onClick={() => setFilter('pending')}
                            className={`btn ${filter === 'pending' ? 'btn-primary' : 'btn-secondary'}`}
                        >
                            Pending ({sales.filter(s => s.status === 'pending').length})
                        </button>
                    </div>
                </div>

                {/* Sales Table */}
                <div className="glass-card p-lg">
                    <h2 className="font-semibold text-xl mb-md">Your Sales</h2>

                    {filteredSales.length === 0 ? (
                        <div className="text-center text-muted py-xl">
                            <div className="text-4xl mb-md">📊</div>
                            <p>No sales found</p>
                            <Link href="/affiliate/order" className="btn btn-primary" style={{ marginTop: 'var(--spacing-md)' }}>
                                Create Your First Order
                            </Link>
                        </div>
                    ) : (
                        <div style={{ overflow: 'auto' }}>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Order ID</th>
                                        <th>Date</th>
                                        <th>Product</th>
                                        <th>Customer</th>
                                        <th>Amount</th>
                                        <th>Commission</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredSales.map((sale: any) => (
                                        <tr key={sale.id}>
                                            <td>
                                                <span className="font-mono text-sm">{sale.orderId}</span>
                                            </td>
                                            <td>{new Date(sale.createdAt).toLocaleDateString('en-MY', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}</td>
                                            <td>{sale.productName}</td>
                                            <td>
                                                {sale.customerName}<br />
                                                <span className="text-muted text-sm">{sale.customerPhone}</span>
                                            </td>
                                            <td>RM {sale.amount?.toFixed(2) || '0.00'}</td>
                                            <td>
                                                <span style={{ color: 'var(--success)' }}>
                                                    RM {sale.commission?.toFixed(2) || '0.00'}
                                                </span>
                                                <br />
                                                <span className="text-muted text-sm">({sale.commissionPercent}%)</span>
                                            </td>
                                            <td>
                                                <span className={`badge ${sale.status === 'completed' ? 'badge-success' :
                                                        sale.status === 'pending' ? 'badge-warning' :
                                                            'badge-error'
                                                    }`}>
                                                    {sale.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
