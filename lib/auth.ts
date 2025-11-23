import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'lodes-affiliate-secret-key-change-in-production';
const TOKEN_EXPIRY = '7d';

export interface TokenPayload {
    userId: string;
    email: string;
    role: 'admin' | 'affiliate';
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
}

// Verify password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
}

// Generate JWT token
export function generateToken(payload: TokenPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

// Verify JWT token
export function verifyToken(token: string): TokenPayload | null {
    try {
        return jwt.verify(token, JWT_SECRET) as TokenPayload;
    } catch (error) {
        return null;
    }
}

// Set auth cookie
export async function setAuthCookie(token: string) {
    const cookieStore = await cookies();
    cookieStore.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
    });
}

// Get auth cookie
export async function getAuthCookie(): Promise<string | undefined> {
    const cookieStore = await cookies();
    return cookieStore.get('auth-token')?.value;
}

// Remove auth cookie
export async function removeAuthCookie() {
    const cookieStore = await cookies();
    cookieStore.delete('auth-token');
}

// Get current user from token
export async function getCurrentUser(): Promise<TokenPayload | null> {
    const token = await getAuthCookie();
    if (!token) return null;
    return verifyToken(token);
}

// Verify admin access
export async function verifyAdmin(): Promise<boolean> {
    const user = await getCurrentUser();
    return user?.role === 'admin';
}

// Verify affiliate access
export async function verifyAffiliate(): Promise<boolean> {
    const user = await getCurrentUser();
    return user?.role === 'affiliate';
}
