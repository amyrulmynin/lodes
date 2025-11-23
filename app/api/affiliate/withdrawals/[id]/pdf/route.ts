import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { generateWithdrawalPDF } from '@/lib/pdf';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'affiliate') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const withdrawalId = id;
        const withdrawal = db.findOne('withdrawals', withdrawalId);

        if (!withdrawal) {
            return NextResponse.json({ error: 'Withdrawal not found' }, { status: 404 });
        }

        // Ensure affiliate can only access their own withdrawals
        if (withdrawal.affiliateId !== user.userId) {
            return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
        }

        // Get affiliate details
        const affiliate = db.findOne('affiliates', user.userId);
        if (!affiliate) {
            return NextResponse.json({ error: 'Affiliate not found' }, { status: 404 });
        }

        // Prepare data for PDF
        const pdfData = {
            id: withdrawal.id,
            amount: withdrawal.amount,
            status: withdrawal.status,
            createdAt: withdrawal.createdAt,
            paymentDetails: {
                bankName: withdrawal.paymentDetails?.bankName,
                ewalletType: withdrawal.paymentDetails?.ewalletType,
                accountNumber: withdrawal.paymentDetails?.accountNumber || '',
                accountHolder: withdrawal.paymentDetails?.accountHolder || '',
            },
            affiliate: {
                name: affiliate.name,
                email: affiliate.email,
                affiliateCode: affiliate.affiliateCode,
            },
        };

        // Generate PDF
        const doc = generateWithdrawalPDF(pdfData);
        const pdfBuffer = doc.output('arraybuffer');

        // Return PDF as downloadable file
        return new NextResponse(pdfBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="Withdrawal-${withdrawal.id}.pdf"`,
            },
        });
    } catch (error) {
        console.error('PDF generation error:', error);
        return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
    }
}
