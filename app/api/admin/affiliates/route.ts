import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const affiliates = db.findAll('affiliates');

        // Get sales stats for each affiliate
        const sales = db.findAll('sales');
        const affiliatesWithStats = affiliates.map((affiliate: any) => {
            const affiliateSales = sales.filter((s: any) => s.affiliateId === affiliate.id);
            return {
                ...affiliate,
                password: undefined, // Don't send password
                salesCount: affiliateSales.length,
                pendingSales: affiliateSales.filter((s: any) => s.status === 'pending').length,
            };
        });

        return NextResponse.json({ affiliates: affiliatesWithStats });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch affiliates' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id, active } = await request.json();

        if (!id) {
            return NextResponse.json({ error: 'Affiliate ID is required' }, { status: 400 });
        }

        const affiliate = db.update('affiliates', id, { active });

        if (!affiliate) {
            return NextResponse.json({ error: 'Affiliate not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, affiliate });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update affiliate' }, { status: 500 });
    }
}
