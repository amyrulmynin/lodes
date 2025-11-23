import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'affiliate') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const withdrawals = db.findWhere('withdrawals', (w: any) => w.affiliateId === user.userId);
        return NextResponse.json({ withdrawals });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch withdrawals' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'affiliate') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { amount, bankName, accountNumber, accountHolder, ewalletType, qrCodePath } = await request.json();

        if (!amount || amount <= 0) {
            return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
        }

        // Get affiliate
        const affiliate = db.findOne('affiliates', user.userId);
        if (!affiliate) {
            return NextResponse.json({ error: 'Affiliate not found' }, { status: 404 });
        }

        // Check minimum withdrawal
        const settings = db.findAll('settings');
        const minWithdrawal = settings?.minWithdrawal || 50;

        if (parseFloat(amount) < minWithdrawal) {
            return NextResponse.json(
                { error: `Minimum withdrawal is RM ${minWithdrawal}` },
                { status: 400 }
            );
        }

        // Check balance
        if (affiliate.balance < parseFloat(amount)) {
            return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
        }

        // Create withdrawal
        const withdrawal = db.create('withdrawals', {
            affiliateId: user.userId,
            affiliateName: affiliate.name,
            affiliateEmail: affiliate.email,
            amount: parseFloat(amount),
            paymentDetails: {
                bankName: bankName || '',
                accountNumber: accountNumber || '',
                accountHolder: accountHolder || '',
                ewalletType: ewalletType || '',
            },
            qrCodePath: qrCodePath || '',
            status: 'pending',
        });

        // Deduct from balance
        db.update('affiliates', user.userId, {
            balance: affiliate.balance - parseFloat(amount),
        });

        return NextResponse.json({ success: true, withdrawal });
    } catch (error) {
        console.error('Withdrawal error:', error);
        return NextResponse.json({ error: 'Failed to create withdrawal' }, { status: 500 });
    }
}
