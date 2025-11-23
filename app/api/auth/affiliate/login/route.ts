import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPassword, generateToken, setAuthCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        // Find affiliate user
        const affiliates = db.findAll('affiliates');
        const affiliate = affiliates.find((a: any) => a.email === email);

        if (!affiliate) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Verify password
        const isValid = await verifyPassword(password, affiliate.password);
        if (!isValid) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Check if active
        if (!affiliate.active) {
            return NextResponse.json({ error: 'Account is inactive' }, { status: 403 });
        }

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
                role: 'affiliate',
            },
        });
    } catch (error) {
        console.error('Affiliate login error:', error);
        return NextResponse.json({ error: 'Login failed' }, { status: 500 });
    }
}
