import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const products = db.findAll('products');
        return NextResponse.json({ products });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { name, price, description, image, commissionPercent, active } = await request.json();

        if (!name || !price || commissionPercent === undefined) {
            return NextResponse.json(
                { error: 'Name, price, and commission percent are required' },
                { status: 400 }
            );
        }

        const product = db.create('products', {
            name,
            price: parseFloat(price),
            description: description || '',
            image: image || '',
            commissionPercent: parseFloat(commissionPercent),
            active: active !== false,
        });

        return NextResponse.json({ success: true, product });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id, name, price, description, image, commissionPercent, active } = await request.json();

        if (!id) {
            return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
        }

        const updates: any = {};
        if (name) updates.name = name;
        if (price !== undefined) updates.price = parseFloat(price);
        if (description !== undefined) updates.description = description;
        if (image !== undefined) updates.image = image;
        if (commissionPercent !== undefined) updates.commissionPercent = parseFloat(commissionPercent);
        if (active !== undefined) updates.active = active;

        const product = db.update('products', id, updates);

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, product });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
        }

        db.delete('products', id);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
    }
}
