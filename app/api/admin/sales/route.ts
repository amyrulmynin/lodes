import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { calculateCommission } from '@/lib/utils';
import { appendSaleToSheet } from '@/lib/googleSheets';

export async function GET() {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const sales = db.findAll('sales');
        return NextResponse.json({ sales });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch sales' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const {
            affiliateId,
            orderId,
            customerName,
            customerPhone,
            customerAddress,
            productId,
            productName,
            quantity,
            price,
            commissionPercent,
            status,
        } = await request.json();

        if (!affiliateId || !productId || !quantity || !price) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const amount = parseFloat(price) * parseInt(quantity);
        const commission = calculateCommission(amount, parseFloat(commissionPercent));

        // Get affiliate info
        const affiliate = db.findOne('affiliates', affiliateId);
        if (!affiliate) {
            return NextResponse.json({ error: 'Affiliate not found' }, { status: 404 });
        }

        const sale = db.create('sales', {
            affiliateId,
            affiliateCode: affiliate.affiliateCode,
            orderId: orderId || `ORD-${Date.now()}`,
            customerName: customerName || '',
            customerPhone: customerPhone || '',
            customerAddress: customerAddress || '',
            productId,
            productName,
            quantity: parseInt(quantity),
            price: parseFloat(price),
            amount,
            commissionPercent: parseFloat(commissionPercent),
            commission,
            status: status || 'pending',
        });

        // Update affiliate stats
        db.update('affiliates', affiliateId, {
            totalSales: (affiliate.totalSales || 0) + 1,
            totalEarnings: (affiliate.totalEarnings || 0) + commission,
            balance: (affiliate.balance || 0) + (status === 'completed' ? commission : 0),
        });

        // Sync to Google Sheets
        await appendSaleToSheet(sale);

        return NextResponse.json({ success: true, sale });
    } catch (error) {
        console.error('Create sale error:', error);
        return NextResponse.json({ error: 'Failed to create sale' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id, status } = await request.json();

        if (!id || !status) {
            return NextResponse.json({ error: 'Sale ID and status are required' }, { status: 400 });
        }

        const sale = db.findOne('sales', id);
        if (!sale) {
            return NextResponse.json({ error: 'Sale not found' }, { status: 404 });
        }

        const updatedSale = db.update('sales', id, { status });

        // If status changed to completed, add commission to affiliate balance
        if (status === 'completed' && sale.status !== 'completed') {
            const affiliate = db.findOne('affiliates', sale.affiliateId);
            if (affiliate) {
                db.update('affiliates', sale.affiliateId, {
                    balance: (affiliate.balance || 0) + sale.commission,
                });
            }
        }

        return NextResponse.json({ success: true, sale: updatedSale });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update sale' }, { status: 500 });
    }
}
