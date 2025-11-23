"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { showAlert, showConfirm } from '@/lib/swal';

export default function AdminProductsPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        description: '',
        commissionPercent: '10',
        active: true,
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/admin/products');
            if (res.ok) {
                const data = await res.json();
                setProducts(data.products || []);
            }
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch products:', error);
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const url = '/api/admin/products';
            const method = editingProduct ? 'PUT' : 'POST';
            const body = editingProduct
                ? { ...formData, id: editingProduct.id }
                : formData;

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (res.ok) {
                await showAlert('Success', editingProduct ? 'Product updated successfully!' : 'Product created successfully!', 'success');
                setShowForm(false);
                setEditingProduct(null);
                setFormData({
                    name: '',
                    price: '',
                    description: '',
                    commissionPercent: '10',
                    active: true,
                });
                fetchProducts();
            } else {
                const data = await res.json();
                await showAlert('Error', data.error || 'Operation failed', 'error');
            }
        } catch (error) {
            await showAlert('Error', 'Network error', 'error');
        }
    };

    const handleEdit = (product: any) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            price: product.price.toString(),
            description: product.description,
            commissionPercent: product.commissionPercent.toString(),
            active: product.active,
        });
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        const confirmed = await showConfirm('Delete Product', 'Are you sure you want to delete this product? This action cannot be undone.', 'Delete');
        if (!confirmed) return;

        try {
            const res = await fetch(`/api/admin/products?id=${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                await showAlert('Deleted', 'Product has been deleted.', 'success');
                fetchProducts();
            } else {
                await showAlert('Error', 'Failed to delete product', 'error');
            }
        } catch (error) {
            await showAlert('Error', 'Network error', 'error');
        }
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
                        <h1 className="text-3xl font-bold gradient-text">Product Management</h1>
                        <p className="text-secondary">Manage your product catalog</p>
                    </div>
                    <div className="flex gap-md">
                        <Link href="/admin/dashboard" className="btn btn-secondary">
                            ← Back to Dashboard
                        </Link>
                        <button
                            onClick={() => {
                                setEditingProduct(null);
                                setFormData({
                                    name: '',
                                    price: '',
                                    description: '',
                                    commissionPercent: '10',
                                    active: true,
                                });
                                setShowForm(!showForm);
                            }}
                            className="btn btn-primary"
                        >
                            {showForm ? 'Cancel' : '+ Add Product'}
                        </button>
                    </div>
                </div>

                {/* Product Form */}
                {showForm && (
                    <div className="glass-card p-lg mb-lg fade-in">
                        <h3 className="font-semibold text-lg mb-md">
                            {editingProduct ? 'Edit Product' : 'New Product'}
                        </h3>
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-2 gap-md">
                                <div>
                                    <label className="block text-sm font-medium mb-sm">Product Name</label>
                                    <input
                                        type="text"
                                        className="input w-full"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-sm">Price (RM)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="input w-full"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium mb-sm">Description</label>
                                    <textarea
                                        className="input w-full"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={3}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-sm">Commission (%)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        className="input w-full"
                                        value={formData.commissionPercent}
                                        onChange={(e) => setFormData({ ...formData, commissionPercent: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="flex items-center">
                                    <label className="flex items-center gap-sm cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.active}
                                            onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                                            className="w-5 h-5"
                                        />
                                        <span>Active Product</span>
                                    </label>
                                </div>
                            </div>
                            <div className="mt-md flex justify-end gap-md">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="btn btn-secondary"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingProduct ? 'Update Product' : 'Create Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Products Table */}
                <div className="glass-card p-lg">
                    <div className="overflow-x-auto">
                        <table className="table w-full">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Price</th>
                                    <th>Commission</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="text-center py-lg text-muted">
                                            No products found. Create one to get started!
                                        </td>
                                    </tr>
                                ) : (
                                    products.map((product) => (
                                        <tr key={product.id}>
                                            <td className="font-medium">{product.name}</td>
                                            <td>RM {product.price.toFixed(2)}</td>
                                            <td>{product.commissionPercent}%</td>
                                            <td>
                                                <span className={`badge ${product.active ? 'badge-success' : 'badge-error'}`}>
                                                    {product.active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="flex gap-sm">
                                                    <button
                                                        onClick={() => handleEdit(product)}
                                                        className="btn btn-secondary text-sm py-xs px-sm"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(product.id)}
                                                        className="btn btn-secondary text-sm py-xs px-sm text-red-400 hover:text-red-300"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
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
