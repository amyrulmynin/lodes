'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { generateWithdrawalPDF, downloadWithdrawalPDF } from '@/lib/pdf';
import { showAlert } from '@/lib/swal';

export default function AffiliateWithdrawalsPage() {
    const router = useRouter();
    const [withdrawals, setWithdrawals] = useState<any[]>([]);
    const [balance, setBalance] = useState(0);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        amount: '',
        bankName: '',
        accountNumber: '',
        accountHolder: '',
        ewalletType: '',
        qrCodePath: '',
    });
    const [uploadedQR, setUploadedQR] = useState('');
    const [loading, setLoading] = useState(false);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);


    useEffect(() => {
        fetchWithdrawals();
    }, []);

    const fetchWithdrawals = async () => {
        const res = await fetch('/api/affiliate/withdrawals');
        if (res.ok) {
            const data = await res.json();
            setWithdrawals(data.withdrawals || []);
            // Mock balance - in production would fetch from affiliate profile
            setBalance(150.50);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const uploadFormData = new FormData();
        uploadFormData.append('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: uploadFormData,
            });

            const data = await res.json();
            if (res.ok) {
                setUploadedQR(data.path);
                setFormData({ ...formData, qrCodePath: data.path });
            }
        } catch (error) {
            await showAlert('Error', 'Upload failed', 'error');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/affiliate/withdrawals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                await showAlert('Success', 'Withdrawal request submitted successfully!', 'success');
                setShowForm(false);
                fetchWithdrawals();
                setFormData({
                    amount: '',
                    bankName: '',
                    accountNumber: '',
                    accountHolder: '',
                    ewalletType: '',
                    qrCodePath: '',
                });
                setUploadedQR('');
            } else {
                const data = await res.json();
                await showAlert('Error', data.error || 'Request failed', 'error');
            }
            setLoading(false);
        } catch (error) {
            await showAlert('Error', 'Network error', 'error');
            setLoading(false);
        }
    };

    const handleDownloadPDF = async (withdrawalId: string) => {
        setDownloadingId(withdrawalId);
        try {
            const res = await fetch(`/api/affiliate/withdrawals/${withdrawalId}/pdf`);
            if (!res.ok) {
                await showAlert('Error', 'Failed to generate PDF', 'error');
                return;
            }

            // Create blob from response
            const blob = await res.blob();

            // Download the file
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `withdrawal-${withdrawalId}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

        } catch (error) {
            console.error('Download error:', error);
            await showAlert('Error', 'Failed to download PDF', 'error');
        } finally {
            setDownloadingId(null);
        }
    };

    return (
        <div style={{ minHeight: '100vh', padding: 'var(--spacing-xl)' }}>
            <div className="container" style={{ maxWidth: '900px', margin: '0 auto' }}>
                <div className="mb-lg">
                    <Link href="/affiliate/dashboard" className="text-secondary" style={{ textDecoration: 'underline' }}>
                        ← Back to Dashboard
                    </Link>
                </div>

                <h1 className="text-3xl font-bold gradient-text mb-lg">Withdrawals</h1>

                {/* Balance Card */}
                <div className="glass-card p-lg mb-lg">
                    <div className="flex justify-between items-center">
                        <div>
                            <div className="text-muted text-sm mb-sm">Available Balance</div>
                            <div className="text-3xl font-bold" style={{ color: 'var(--success)' }}>
                                RM {balance.toFixed(2)}
                            </div>
                        </div>
                        <button
                            onClick={() => setShowForm(!showForm)}
                            className="btn btn-primary"
                        >
                            {showForm ? 'Cancel' : 'Request Withdrawal'}
                        </button>
                    </div>
                </div>

                {/* Withdrawal Form */}
                {showForm && (
                    <div className="glass-card p-lg mb-lg">
                        <h3 className="font-semibold text-lg mb-md">New Withdrawal Request</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 gap-md">
                                <div>
                                    <label className="text-sm font-medium mb-sm" style={{ display: 'block' }}>
                                        Amount (RM) - Minimum RM 50
                                    </label>
                                    <input
                                        type="number"
                                        className="input"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        min="50"
                                        max={balance}
                                        step="0.01"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-sm" style={{ display: 'block' }}>
                                        Payment Method
                                    </label>
                                    <div className="grid grid-cols-2 gap-md">
                                        <div>
                                            <input
                                                type="text"
                                                className="input"
                                                placeholder="Bank Name / E-wallet Type"
                                                value={formData.bankName || formData.ewalletType}
                                                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <input
                                                type="text"
                                                className="input"
                                                placeholder="Account Number"
                                                value={formData.accountNumber}
                                                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-sm" style={{ display: 'block' }}>
                                        Account Holder Name
                                    </label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={formData.accountHolder}
                                        onChange={(e) => setFormData({ ...formData, accountHolder: e.target.value })}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-sm" style={{ display: 'block' }}>
                                        Upload QR Code (Bank / E-wallet)
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                        style={{ marginBottom: 'var(--spacing-sm)' }}
                                    />
                                    {uploadedQR && (
                                        <div style={{ marginTop: 'var(--spacing-sm)' }}>
                                            <img src={uploadedQR} alt="QR Code" style={{ maxWidth: '200px', borderRadius: 'var(--radius-md)' }} />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading}
                                style={{ width: '100%', marginTop: 'var(--spacing-md)' }}
                            >
                                {loading ? 'Submitting...' : 'Submit Request'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Withdrawal History */}
                <div className="glass-card p-lg">
                    <h3 className="font-semibold text-lg mb-md">Withdrawal History</h3>
                    {withdrawals.length === 0 ? (
                        <p className="text-muted">No withdrawal requests yet.</p>
                    ) : (
                        <div style={{ overflow: 'auto' }}>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Amount</th>
                                        <th>Payment Details</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {withdrawals.map((w: any) => (
                                        <tr key={w.id}>
                                            <td>{new Date(w.createdAt).toLocaleDateString('en-MY')}</td>
                                            <td>RM {w.amount?.toFixed(2) || '0.00'}</td>
                                            <td>
                                                {w.paymentDetails?.bankName || w.paymentDetails?.ewalletType}<br />
                                                <span className="text-muted text-sm">{w.paymentDetails?.accountNumber}</span>
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
                                                <button
                                                    onClick={() => handleDownloadPDF(w.id)}
                                                    className="btn btn-secondary"
                                                    style={{ padding: 'var(--spacing-xs) var(--spacing-sm)', fontSize: '0.875rem' }}
                                                >
                                                    📄 Download PDF
                                                </button>
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
