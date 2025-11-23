import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const withdrawals = db.findAll('withdrawals');
        return NextResponse.json({ withdrawals });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch withdrawals' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id, status, note } = await request.json();

        if (!id || !status) {
            return NextResponse.json(
                { error: 'Withdrawal ID and status are required' },
                { status: 400 }
            );
        }

        const withdrawal = db.findOne('withdrawals', id);
        if (!withdrawal) {
            return NextResponse.json({ error: 'Withdrawal not found' }, { status: 404 });
        }

        const updates: any = { status };
        if (note) updates.adminNote = note;
        if (status === 'paid' || status === 'approved') {
            updates.processedAt = new Date().toISOString();
        }

        const updatedWithdrawal = db.update('withdrawals', id, updates);

        // If rejected, refund balance to affiliate
        if (status === 'rejected' && withdrawal.status !== 'rejected') {
            const affiliate = db.findOne('affiliates', withdrawal.affiliateId);
            if (affiliate) {
                db.update('affiliates', withdrawal.affiliateId, {
                    balance: (affiliate.balance || 0) + withdrawal.amount,
                });
            }
        }

        return NextResponse.json({ success: true, withdrawal: updatedWithdrawal });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update withdrawal' }, { status: 500 });
    }
}
