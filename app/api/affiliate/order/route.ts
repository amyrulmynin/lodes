import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { calculateCommission, formatOrderMessage, generateWhatsAppLink } from '@/lib/utils';
import { readData } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'affiliate') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { customerName, customerPhone, customerAddress, items } = await request.json();

        if (!customerName || !customerPhone || !items || items.length === 0) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Get affiliate info
        const affiliate = db.findOne('affiliates', user.userId);
        if (!affiliate) {
            return NextResponse.json({ error: 'Affiliate not found' }, { status: 404 });
        }

        // Calculate total and prepare order items
        let total = 0;
        const orderItems = items.map((item: any) => {
            const subtotal = parseFloat(item.price) * parseInt(item.quantity);
            total += subtotal;
            return {
                productId: item.productId,
                productName: item.productName,
                quantity: parseInt(item.quantity),
                price: parseFloat(item.price),
                commissionPercent: parseFloat(item.commissionPercent),
            };
        });

        // Generate order ID
        const orderId = `ORD-${Date.now()}`;

        // Create order (pending confirmation)
        const order = {
            orderId,
            affiliateId: user.userId,
            affiliateCode: affiliate.affiliateCode,
            customerName,
            customerPhone,
            customerAddress: customerAddress || '',
            items: orderItems,
            total,
            status: 'pending',
            createdAt: new Date().toISOString(),
        };

        // Format WhatsApp message
        const message = formatOrderMessage({
            orderId,
            affiliateCode: affiliate.affiliateCode,
            customerName,
            customerPhone,
            customerAddress: customerAddress || '',
            items: orderItems,
            total,
        });

        // Get admin WhatsApp from settings
        const settings = readData('settings');
        const adminWhatsApp = settings.adminWhatsApp || '601234567';

        const whatsappLink = generateWhatsAppLink(adminWhatsApp, message);

        return NextResponse.json({
            success: true,
            order,
            whatsappLink,
            message,
        });
    } catch (error) {
        console.error('Order error:', error);
        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }
}
