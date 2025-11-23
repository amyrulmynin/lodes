'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState({
        totalAffiliates: 0,
        totalSales: 0,
        totalRevenue: 0,
        pendingWithdrawals: 0,
    });
    const [products, setProducts] = useState<any[]>([]);
    const [sales, setSales] = useState<any[]>([]);
    const [affiliates, setAffiliates] = useState<any[]>([]);
    const [withdrawals, setWithdrawals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [productsRes, salesRes, affiliatesRes, withdrawalsRes] = await Promise.all([
                fetch('/api/admin/products'),
                fetch('/api/admin/sales'),
                fetch('/api/admin/affiliates'),
                fetch('/api/admin/withdrawals'),
            ]);

            if (!productsRes.ok || !salesRes.ok || !affiliatesRes.ok || !withdrawalsRes.ok) {
                router.push('/login');
                return;
            }

            const productsData = await productsRes.json();
            const salesData = await salesRes.json();
            const affiliatesData = await affiliatesRes.json();
            const withdrawalsData = await withdrawalsRes.json();

            setProducts(productsData.products || []);
            setSales(salesData.sales || []);
            setAffiliates(affiliatesData.affiliates || []);
            setWithdrawals(withdrawalsData.withdrawals || []);

            const totalRevenue = (salesData.sales || []).reduce((sum: number, s: any) => sum + (s.amount || 0), 0);
            const pendingWithdrawals = (withdrawalsData.withdrawals || []).filter((w: any) => w.status === 'pending').length;

            setStats({
                totalAffiliates: (affiliatesData.affiliates || []).length,
                totalSales: (salesData.sales || []).length,
                totalRevenue,
                pendingWithdrawals,
            });
            setLoading(false);
        } catch (error) {
            console.error(error);
            router.push('/login');
        }
    };

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/');
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
                <div className="flex justify-between items-center mb-xl">
                    <div>
                        <h1 className="text-3xl font-bold gradient-text">Admin Dashboard</h1>
                        <p className="text-secondary">Lodes Affiliate System</p>
                    </div>
                    <button onClick={handleLogout} className="btn btn-secondary">
                        Logout
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-4 gap-lg mb-xl">
                    <div className="glass-card p-lg">
                        <div className="text-muted text-sm mb-sm">Total Affiliates</div>
                        <div className="text-3xl font-bold">{stats.totalAffiliates}</div>
                    </div>
                    <div className="glass-card p-lg">
                        <div className="text-muted text-sm mb-sm">Total Sales</div>
                        <div className="text-3xl font-bold">{stats.totalSales}</div>
                    </div>
                    <div className="glass-card p-lg">
                        <div className="text-muted text-sm mb-sm">Total Revenue</div>
                        <div className="text-3xl font-bold">RM {stats.totalRevenue.toFixed(2)}</div>
                    </div>
                    <div className="glass-card p-lg">
                        <div className="text-muted text-sm mb-sm">Pending Withdrawals</div>
                        <div className="text-3xl font-bold">{stats.pendingWithdrawals}</div>
                    </div>
                </div>

                {/* Quick Links */}
                <div className="grid grid-cols-3 gap-lg mb-xl">
                    <Link href="/admin/products" className="glass-card p-lg" style={{ textDecoration: 'none', cursor: 'pointer' }}>
                        <div className="text-2xl mb-sm">🍰</div>
                        <h3 className="font-semibold mb-sm">Manage Products</h3>
                        <p className="text-sm text-muted">{products.length} products</p>
                    </Link>
                    <Link href="/admin/sales" className="glass-card p-lg" style={{ textDecoration: 'none', cursor: 'pointer' }}>
                        <div className="text-2xl mb-sm">📊</div>
                        <h3 className="font-semibold mb-sm">Sales Management</h3>
                        <p className="text-sm text-muted">{sales.length} sales</p>
                    </Link>
                    <Link href="/admin/withdrawals" className="glass-card p-lg" style={{ textDecoration: 'none', cursor: 'pointer' }}>
                        <div className="text-2xl mb-sm">💰</div>
                        <h3 className="font-semibold mb-sm">Withdrawals</h3>
                        <p className="text-sm text-muted">{stats.pendingWithdrawals} pending</p>
                    </Link>
                </div>

                {/* Recent Sales */}
                <div className="glass-card p-lg">
                    <h3 className="font-semibold text-lg mb-md">Recent Sales</h3>
                    <div style={{ overflow: 'auto' }}>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Affiliate</th>
                                    <th>Product</th>
                                    <th>Amount</th>
                                    <th>Commission</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sales.slice(0, 5).map((sale: any) => (
                                    <tr key={sale.id}>
                                        <td>{sale.orderId}</td>
                                        <td>{sale.affiliateCode}</td>
                                        <td>{sale.productName}</td>
                                        <td>RM {sale.amount?.toFixed(2) || '0.00'}</td>
                                        <td>RM {sale.commission?.toFixed(2) || '0.00'} ({sale.commissionPercent}%)</td>
                                        <td>
                                            <span className={`badge ${sale.status === 'completed' ? 'badge-success' : 'badge-warning'}`}>
                                                {sale.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
