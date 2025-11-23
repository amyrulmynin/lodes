'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AffiliateLoginPage() {
    const router = useRouter();
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const endpoint = isLogin ? '/api/auth/affiliate/login' : '/api/auth/affiliate/register';
        const body = isLogin
            ? { email: formData.email, password: formData.password }
            : formData;

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Operation failed');
                setLoading(false);
                return;
            }

            router.push('/affiliate/dashboard');
        } catch (err) {
            setError('Network error');
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div className="glass-card p-xl fade-in" style={{ width: '100%', maxWidth: '440px' }}>
                <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>
                    <h1 className="text-3xl font-bold gradient-text mb-sm">
                        {isLogin ? 'Affiliate Login' : 'Daftar Affiliate'}
                    </h1>
                    <p className="text-secondary">Lodes Affiliate Program</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                    {!isLogin && (
                        <div>
                            <label className="text-sm font-medium mb-sm" style={{ display: 'block' }}>
                                Nama Penuh
                            </label>
                            <input
                                type="text"
                                className="input"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Ahmad bin Abdullah"
                                required
                            />
                        </div>
                    )}

                    <div>
                        <label className="text-sm font-medium mb-sm" style={{ display: 'block' }}>
                            Email
                        </label>
                        <input
                            type="email"
                            className="input"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="email@example.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium mb-sm" style={{ display: 'block' }}>
                            Password
                        </label>
                        <input
                            type="password"
                            className="input"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {!isLogin && (
                        <div>
                            <label className="text-sm font-medium mb-sm" style={{ display: 'block' }}>
                                No. Telefon (Optional)
                            </label>
                            <input
                                type="tel"
                                className="input"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="0123456789"
                            />
                        </div>
                    )}

                    {error && (
                        <div className="badge-error" style={{ padding: 'var(--spacing-sm)' }}>
                            {error}
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
                        {loading ? 'Loading...' : isLogin ? 'Login' : 'Daftar Sekarang'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: 'var(--spacing-lg)' }}>
                    <button
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setError('');
                        }}
                        className="text-sm"
                        style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                        {isLogin ? 'Belum ada akaun? Daftar di sini' : 'Sudah ada akaun? Login di sini'}
                    </button>
                </div>

                <div style={{ textAlign: 'center', marginTop: 'var(--spacing-md)' }}>
                    <Link href="/" className="text-sm text-secondary" style={{ textDecoration: 'underline' }}>
                        ← Kembali ke homepage
                    </Link>
                </div>
            </div>
        </div>
    );
}
