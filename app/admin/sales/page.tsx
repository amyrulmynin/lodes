'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminSalesPage() {
    const [sales, setSales] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchSales();
    }, []);

    const fetchSales = async () => {
        try {
            const res = await fetch('/api/admin/sales');
            if (res.ok) {
                const data = await res.json();
                setSales(data.sales || []);
            }
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch sales:', error);
            setLoading(false);
        }
    };

    const filteredSales = filter === 'all'
        ? sales
        : sales.filter(s => s.status === filter);

    const totalRevenue = sales
        .filter(s => s.status === 'completed' || s.status === 'pending')
        .reduce((sum, s) => sum + (s.amount || 0), 0);

    const totalCommission = sales
        .filter(s => s.status === 'completed' || s.status === 'pending')
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
                <div className="flex justify-between items-center mb-xl">
                    <div>
                        <h1 className="text-3xl font-bold gradient-text">Sales Management</h1>
                        <p className="text-secondary">Track all orders and commissions</p>
                    </div>
                    <Link href="/admin/dashboard" className="btn btn-secondary">
                        ← Back to Dashboard
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-lg mb-lg">
                    <div className="glass-card p-lg">
                        <div className="text-muted text-sm mb-sm">Total Orders</div>
                        <div className="text-3xl font-bold">{sales.length}</div>
                    </div>
                    <div className="glass-card p-lg">
                        <div className="text-muted text-sm mb-sm">Total Revenue</div>
                        <div className="text-3xl font-bold" style={{ color: 'var(--success)' }}>
                            RM {totalRevenue.toFixed(2)}
                        </div>
                    </div>
                    <div className="glass-card p-lg">
                        <div className="text-muted text-sm mb-sm">Total Commission</div>
                        <div className="text-3xl font-bold" style={{ color: 'var(--warning)' }}>
                            RM {totalCommission.toFixed(2)}
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
                            All
                        </button>
                        <button
                            onClick={() => setFilter('completed')}
                            className={`btn ${filter === 'completed' ? 'btn-primary' : 'btn-secondary'}`}
                        >
                            Completed
                        </button>
                        <button
                            onClick={() => setFilter('pending')}
                            className={`btn ${filter === 'pending' ? 'btn-primary' : 'btn-secondary'}`}
                        >
                            Pending
                        </button>
                    </div>
                </div>

                {/* Sales Table */}
                <div className="glass-card p-lg">
                    <div className="overflow-x-auto">
                        <table className="table w-full">
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Date</th>
                                    <th>Customer</th>
                                    <th>Product</th>
                                    <th>Amount</th>
                                    <th>Commission</th>
                                    <th>Affiliate</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSales.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="text-center py-lg text-muted">
                                            No sales found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredSales.map((sale) => (
                                        <tr key={sale.id}>
                                            <td className="font-mono text-sm">{sale.orderId}</td>
                                            <td>{new Date(sale.createdAt).toLocaleDateString('en-MY')}</td>
                                            <td>
                                                {sale.customerName}<br />
                                                <span className="text-xs text-muted">{sale.customerPhone}</span>
                                            </td>
                                            <td>
                                                {sale.productName}<br />
                                                <span className="text-xs text-muted">Qty: {sale.quantity}</span>
                                            </td>
                                            <td>RM {sale.amount?.toFixed(2)}</td>
                                            <td>RM {sale.commission?.toFixed(2)}</td>
                                            <td>
                                                {sale.affiliateName ? (
                                                    <>
                                                        {sale.affiliateName}<br />
                                                        <span className="text-xs text-muted">{sale.affiliateCode}</span>
                                                    </>
                                                ) : (
                                                    <span className="text-muted">-</span>
                                                )}
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
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
