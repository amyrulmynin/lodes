'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AffiliatesManagement() {
    const router = useRouter();
    const [affiliates, setAffiliates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchAffiliates();
    }, []);

    const fetchAffiliates = async () => {
        try {
            const res = await fetch('/api/admin/affiliates');
            if (!res.ok) {
                router.push('/login');
                return;
            }
            const data = await res.json();
            setAffiliates(data.affiliates || []);
            setLoading(false);
        } catch (error) {
            console.error(error);
            router.push('/login');
        }
    };

    const filteredAffiliates = filter === 'all'
        ? affiliates
        : affiliates.filter(a => a.status === filter);

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
                        <h1 className="text-3xl font-bold gradient-text">Affiliate Management</h1>
                        <p className="text-secondary">Manage all registered affiliates</p>
                    </div>
                    <Link href="/admin/dashboard" className="btn btn-secondary">
                        ← Back to Dashboard
                    </Link>
                </div>

                {/* Filter */}
                <div className="glass-card p-md mb-lg">
                    <div className="flex gap-md">
                        <button
                            onClick={() => setFilter('all')}
                            className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                        >
                            All ({affiliates.length})
                        </button>
                        <button
                            onClick={() => setFilter('active')}
                            className={`btn ${filter === 'active' ? 'btn-primary' : 'btn-secondary'}`}
                        >
                            Active ({affiliates.filter(a => a.status === 'active').length})
                        </button>
                        <button
                            onClick={() => setFilter('inactive')}
                            className={`btn ${filter === 'inactive' ? 'btn-primary' : 'btn-secondary'}`}
                        >
                            Inactive ({affiliates.filter(a => a.status === 'inactive').length})
                        </button>
                    </div>
                </div>

                {/* Affiliates Table */}
                <div className="glass-card p-lg">
                    <h2 className="font-semibold text-xl mb-md">Registered Affiliates</h2>

                    {filteredAffiliates.length === 0 ? (
                        <div className="text-center text-muted py-xl">
                            <div className="text-4xl mb-md">👥</div>
                            <p>No affiliates found</p>
                        </div>
                    ) : (
                        <div style={{ overflow: 'auto' }}>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Affiliate Code</th>
                                        <th>Total Sales</th>
                                        <th>Total Commission</th>
                                        <th>Balance</th>
                                        <th>Joined</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredAffiliates.map((affiliate: any) => (
                                        <tr key={affiliate.id}>
                                            <td>{affiliate.name}</td>
                                            <td>{affiliate.email}</td>
                                            <td>
                                                <span className="badge badge-info">
                                                    {affiliate.affiliateCode}
                                                </span>
                                            </td>
                                            <td>{affiliate.totalSales || 0}</td>
                                            <td>RM {(affiliate.totalCommission || 0).toFixed(2)}</td>
                                            <td>RM {(affiliate.balance || 0).toFixed(2)}</td>
                                            <td>{new Date(affiliate.createdAt).toLocaleDateString()}</td>
                                            <td>
                                                <span className={`badge ${affiliate.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                                                    {affiliate.status || 'active'}
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
