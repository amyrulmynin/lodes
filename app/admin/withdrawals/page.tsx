"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { showAlert, showConfirm } from '@/lib/swal';

export default function AdminWithdrawalsPage() {
    const [withdrawals, setWithdrawals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending');
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        fetchWithdrawals();
    }, []);

    const fetchWithdrawals = async () => {
        try {
            const res = await fetch('/api/admin/withdrawals');
            if (res.ok) {
                const data = await res.json();
                setWithdrawals(data.withdrawals || []);
            }
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch withdrawals:', error);
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id: string, status: 'paid' | 'rejected') => {
        const confirmed = await showConfirm('Update Status', `Are you sure you want to mark this withdrawal as ${status}?`, 'Confirm');
        if (!confirmed) return;

        setProcessingId(id);
        try {
            const res = await fetch('/api/admin/withdrawals', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status }),
            });

            if (res.ok) {
                await showAlert('Success', `Withdrawal marked as ${status}`, 'success');
                fetchWithdrawals();
            } else {
                const data = await res.json();
                await showAlert('Error', data.error || 'Operation failed', 'error');
            }
        } catch (error) {
            await showAlert('Error', 'Network error', 'error');
        } finally {
            setProcessingId(null);
        }
    };

    const filteredWithdrawals = filter === 'all'
        ? withdrawals
        : withdrawals.filter(w => w.status === filter);

    const pendingCount = withdrawals.filter(w => w.status === 'pending').length;
    const totalPaid = withdrawals
        .filter(w => w.status === 'paid')
        .reduce((sum, w) => sum + (w.amount || 0), 0);

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
                        <h1 className="text-3xl font-bold gradient-text">Withdrawal Requests</h1>
                        <p className="text-secondary">Manage affiliate payouts</p>
                    </div>
                    <Link href="/admin/dashboard" className="btn btn-secondary">
                        ← Back to Dashboard
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-lg mb-lg">
                    <div className="glass-card p-lg">
                        <div className="text-muted text-sm mb-sm">Pending Requests</div>
                        <div className="text-3xl font-bold" style={{ color: 'var(--warning)' }}>
                            {pendingCount}
                        </div>
                    </div>
                    <div className="glass-card p-lg">
                        <div className="text-muted text-sm mb-sm">Total Paid</div>
                        <div className="text-3xl font-bold" style={{ color: 'var(--success)' }}>
                            RM {totalPaid.toFixed(2)}
                        </div>
                    </div>
                    <div className="glass-card p-lg">
                        <div className="text-muted text-sm mb-sm">Total Requests</div>
                        <div className="text-3xl font-bold">{withdrawals.length}</div>
                    </div>
                </div>

                {/* Filter */}
                <div className="glass-card p-md mb-lg">
                    <div className="flex gap-md">
                        <button
                            onClick={() => setFilter('pending')}
                            className={`btn ${filter === 'pending' ? 'btn-primary' : 'btn-secondary'}`}
                        >
                            Pending
                        </button>
                        <button
                            onClick={() => setFilter('paid')}
                            className={`btn ${filter === 'paid' ? 'btn-primary' : 'btn-secondary'}`}
                        >
                            Paid
                        </button>
                        <button
                            onClick={() => setFilter('rejected')}
                            className={`btn ${filter === 'rejected' ? 'btn-primary' : 'btn-secondary'}`}
                        >
                            Rejected
                        </button>
                        <button
                            onClick={() => setFilter('all')}
                            className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                        >
                            All
                        </button>
                    </div>
                </div>

                {/* Withdrawals Table */}
                <div className="glass-card p-lg">
                    <div className="overflow-x-auto">
                        <table className="table w-full">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Affiliate</th>
                                    <th>Amount</th>
                                    <th>Payment Details</th>
                                    <th>QR Code</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredWithdrawals.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-lg text-muted">
                                            No withdrawals found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredWithdrawals.map((w) => (
                                        <tr key={w.id}>
                                            <td>{new Date(w.createdAt).toLocaleDateString('en-MY')}</td>
                                            <td>
                                                {w.affiliateName}<br />
                                                <span className="text-xs text-muted">{w.affiliateEmail}</span>
                                            </td>
                                            <td className="font-bold">RM {w.amount?.toFixed(2)}</td>
                                            <td>
                                                <div className="text-sm">
                                                    <span className="font-semibold">{w.paymentDetails?.bankName || w.paymentDetails?.ewalletType}</span><br />
                                                    {w.paymentDetails?.accountNumber}<br />
                                                    {w.paymentDetails?.accountHolder}
                                                </div>
                                            </td>
                                            <td>
                                                {w.qrCodePath ? (
                                                    <a href={w.qrCodePath} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">
                                                        View QR
                                                    </a>
                                                ) : (
                                                    <span className="text-muted text-sm">-</span>
                                                )}
                                            </td>
                                            <td>
                                                <span className={`badge ${w.status === 'paid' ? 'badge-success' :
                                                    w.status === 'rejected' ? 'badge-error' :
                                                        'badge-warning'
                                                    }`}>
                                                    {w.status}
                                                </span>
                                            </td>
                                            <td>
                                                {w.status === 'pending' && (
                                                    <div className="flex gap-sm">
                                                        <button
                                                            onClick={() => handleUpdateStatus(w.id, 'paid')}
                                                            disabled={processingId === w.id}
                                                            className="btn btn-primary text-sm py-xs px-sm bg-green-600 hover:bg-green-700"
                                                            style={{ backgroundColor: 'var(--success)' }}
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleUpdateStatus(w.id, 'rejected')}
                                                            disabled={processingId === w.id}
                                                            className="btn btn-secondary text-sm py-xs px-sm text-red-400 hover:text-red-300"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                )}
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
