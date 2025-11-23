import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
    try {
        const {
            productId,
            quantity,
            customerName,
            customerPhone,
            customerAddress,
            affiliateCode
        } = await request.json();

        // Validation
        if (!productId || !quantity || !customerName || !customerPhone || !customerAddress) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Get product
        const product = db.findOne('products', productId);
        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        // Calculate totals
        const amount = product.price * parseInt(quantity);
        let commission = 0;
        let affiliateId = null;
        let affiliateName = null;

        // Handle Affiliate Logic
        if (affiliateCode) {
            const affiliates = db.findAll('affiliates');
            const affiliate = affiliates.find((a: any) => a.affiliateCode === affiliateCode);

            if (affiliate && affiliate.active) {
                affiliateId = affiliate.id;
                affiliateName = affiliate.name;

                // Calculate commission
                // Use product specific commission or default 10%
                const commissionPercent = product.commissionPercent || 10;
                commission = (amount * commissionPercent) / 100;

                // Update affiliate stats (optional: could be done only on completion)
                // For now, we'll just link the sale. Balance update usually happens on 'completion'.
            }
        }

        // Create Order/Sale Record
        const orderId = `ORD-${Date.now()}`;
        const sale = {
            id: uuidv4(),
            orderId,
            productId,
            productName: product.name,
            customerName,
            customerPhone,
            customerAddress,
            quantity: parseInt(quantity),
            amount,
            commission,
            commissionPercent: product.commissionPercent || 10,
            status: 'pending', // Pending admin approval/payment
            affiliateId,       // Linked affiliate (if any)
            affiliateCode,
            affiliateName,
            orderSource: 'customer_web', // Mark as web order
            createdAt: new Date().toISOString(),
        };

        // Save to sales collection
        db.create('sales', sale);

        return NextResponse.json({
            success: true,
            orderId,
            message: 'Order placed successfully'
        });

    } catch (error) {
        console.error('Public order error:', error);
        return NextResponse.json({ error: 'Failed to process order' }, { status: 500 });
    }
}
