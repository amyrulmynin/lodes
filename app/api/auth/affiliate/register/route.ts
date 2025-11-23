import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, generateToken, setAuthCookie } from '@/lib/auth';
import { generateAffiliateCode, generateAffiliateLink } from '@/lib/utils';

export async function POST(request: NextRequest) {
    try {
        const { name, email, password, phone } = await request.json();

        if (!name || !email || !password) {
            return NextResponse.json(
                { error: 'Name, email, and password are required' },
                { status: 400 }
            );
        }

        // Check if email already exists
        const affiliates = db.findAll('affiliates');
        const existingAffiliate = affiliates.find((a: any) => a.email === email);

        if (existingAffiliate) {
            return NextResponse.json(
                { error: 'Email already registered' },
                { status: 400 }
            );
        }

        // Generate unique affiliate code
        let affiliateCode = generateAffiliateCode();
        while (affiliates.some((a: any) => a.affiliateCode === affiliateCode)) {
            affiliateCode = generateAffiliateCode();
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create affiliate
        const newAffiliate = {
            name,
            email,
            password: hashedPassword,
            phone: phone || '',
            affiliateCode,
            affiliateLink: generateAffiliateLink(affiliateCode),
            active: true,
            balance: 0,
            totalEarnings: 0,
            totalSales: 0,
            paymentInfo: {
                bankName: '',
                accountNumber: '',
                accountHolder: '',
                ewalletType: '',
                qrCodePath: '',
            },
        };

        const affiliate = db.create('affiliates', newAffiliate);

        // Generate token
        const token = generateToken({
            userId: affiliate.id,
            email: affiliate.email,
            role: 'affiliate',
        });

        // Set cookie
        await setAuthCookie(token);

        return NextResponse.json({
            success: true,
            user: {
                id: affiliate.id,
                email: affiliate.email,
                name: affiliate.name,
                affiliateCode: affiliate.affiliateCode,
                affiliateLink: affiliate.affiliateLink,
                role: 'affiliate',
            },
        });
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
    }
}
