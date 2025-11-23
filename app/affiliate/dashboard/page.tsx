'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AffiliateDashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [affiliate, setAffiliate] = useState<any>(null);
    const [sales, setSales] = useState<any[]>([]);
    const [withdrawals, setWithdrawals] = useState<any[]>([]);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [salesRes, withdrawalsRes] = await Promise.all([
                fetch('/api/affiliate/sales'),
                fetch('/api/affiliate/withdrawals'),
            ]);

            if (!salesRes.ok || !withdrawalsRes.ok) {
                router.push('/affiliate/login');
                return;
            }

            const salesData = await salesRes.json();
            const withdrawalsData = await withdrawalsRes.json();

            setSales(salesData.sales || []);
            setWithdrawals(withdrawalsData.withdrawals || []);

            // Mock affiliate data - in production, would fetch from an API
            setAffiliate({
                name: 'Affiliate User',
                affiliateCode: 'LODES-DEMO',
                affiliateLink: 'https://lodes.com/?ref=LODES-DEMO',
                balance: (salesData.sales || []).filter((s: any) => s.status === 'completed')
                    .reduce((sum: number, s: any) => sum + (s.commission || 0), 0),
                totalEarnings: (salesData.sales || []).reduce((sum: number, s: any) => sum + (s.commission || 0), 0),
                totalSales: (salesData.sales || []).length,
            });
            setLoading(false);
        } catch (error) {
            console.error(error);
            router.push('/affiliate/login');
        }
    };

    const copyLink = () => {
        if (affiliate?.affiliateLink) {
            navigator.clipboard.writeText(affiliate.affiliateLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
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

    const pendingCommission = affiliate?.totalEarnings - affiliate?.balance || 0;

    return (
        <div style={{ minHeight: '100vh', padding: 'var(--spacing-xl)' }}>
            <div className="container">
                <div className="flex justify-between items-center mb-xl">
                    <div>
                        <h1 className="text-3xl font-bold gradient-text">Affiliate Dashboard</h1>
                        <p className="text-secondary">Welcome, {affiliate?.name}!</p>
                    </div>
                    <button onClick={handleLogout} className="btn btn-secondary">
                        Logout
                    </button>
                </div>

                {/* Affiliate Link */}
                <div className="glass-card p-lg mb-xl">
                    <h3 className="font-semibold mb-md">Your Affiliate Link</h3>
                    <div className="flex gap-md">
                        <input
                            type="text"
                            className="input"
                            value={affiliate?.affiliateLink || ''}
                            readOnly
                            style={{ flex: 1 }}
                        />
                        <button onClick={copyLink} className="btn btn-primary">
                            {copied ? '✓ Copied!' : 'Copy Link'}
                        </button>
                    </div>
                    <p className="text-sm text-muted mt-sm">
                        Your Code: <span className="font-bold">{affiliate?.affiliateCode}</span>
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-lg mb-xl">
                    <div className="glass-card p-lg">
                        <div className="text-muted text-sm mb-sm">Available Balance</div>
                        <div className="text-2xl font-bold" style={{ color: 'var(--success)' }}>
                            RM {affiliate?.balance?.toFixed(2) || '0.00'}
                        </div>
                    </div>
                    <div className="glass-card p-lg">
                        <div className="text-muted text-sm mb-sm">Pending Commission</div>
                        <div className="text-2xl font-bold" style={{ color: 'var(--warning)' }}>
                            RM {pendingCommission.toFixed(2)}
                        </div>
                    </div>
                    <div className="glass-card p-lg">
                        <div className="text-muted text-sm mb-sm">Total Earnings</div>
                        <div className="text-2xl font-bold">RM {affiliate?.totalEarnings?.toFixed(2) || '0.00'}</div>
                    </div>
                    <div className="glass-card p-lg">
                        <div className="text-muted text-sm mb-sm">Total Sales</div>
                        <div className="text-2xl font-bold">{affiliate?.totalSales || 0}</div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-3 gap-lg mb-xl">
                    <Link href="/affiliate/order" className="glass-card p-lg" style={{ textDecoration: 'none', cursor: 'pointer' }}>
                        <div className="text-2xl mb-sm">🛒</div>
                        <h3 className="font-semibold mb-sm">Create Order</h3>
                        <p className="text-sm text-muted">Collect customer orders via WhatsApp</p>
                    </Link>
                    <Link href="/affiliate/sales" className="glass-card p-lg" style={{ textDecoration: 'none', cursor: 'pointer' }}>
                        <div className="text-2xl mb-sm">📊</div>
                        <h3 className="font-semibold mb-sm">View Sales</h3>
                        <p className="text-sm text-muted">{sales.length} total sales</p>
                    </Link>
                    <Link href="/affiliate/withdrawals" className="glass-card p-lg" style={{ textDecoration: 'none', cursor: 'pointer' }}>
                        <div className="text-2xl mb-sm">💰</div>
                        <h3 className="font-semibold mb-sm">Withdrawals</h3>
                        <p className="text-sm text-muted">Request payout</p>
                    </Link>
                </div>

                {/* Recent Sales */}
                <div className="glass-card p-lg">
                    <h3 className="font-semibold text-lg mb-md">Recent Sales</h3>
                    {sales.length === 0 ? (
                        <p className="text-muted">No sales yet. Start promoting your affiliate link!</p>
                    ) : (
                        <div style={{ overflow: 'auto' }}>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Order ID</th>
                                        <th>Product</th>
                                        <th>Amount</th>
                                        <th>Commission</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sales.slice(0, 5).map((sale: any) => (
                                        <tr key={sale.id}>
                                            <td>{sale.orderId}</td>
                                            <td>{sale.productName}</td>
                                            <td>RM {sale.amount?.toFixed(2) || '0.00'}</td>
                                            <td>RM {sale.commission?.toFixed(2) || '0.00'} ({sale.commissionPercent}%)</td>
                                            <td>
                                                <span className={`badge ${sale.status === 'completed' ? 'badge-success' : 'badge-warning'}`}>
                                                    {sale.status}
                                                </span>
                                            </td>
                                            <td>{new Date(sale.createdAt).toLocaleDateString('en-MY')}</td>
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
