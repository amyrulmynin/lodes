import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'affiliate') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const sales = db.findWhere('sales', (s: any) => s.affiliateId === user.userId);
        return NextResponse.json({ sales });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch sales' }, { status: 500 });
    }
}
