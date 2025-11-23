// Affiliate tracking utilities for customer orders

const AFFILIATE_REF_KEY = 'lodes_affiliate_ref';

/**
 * Store affiliate reference code in sessionStorage
 */
export function storeAffiliateRef(ref: string): void {
    if (typeof window !== 'undefined' && ref) {
        sessionStorage.setItem(AFFILIATE_REF_KEY, ref);
    }
}

/**
 * Get stored affiliate reference code
 */
export function getAffiliateRef(): string | null {
    if (typeof window !== 'undefined') {
        return sessionStorage.getItem(AFFILIATE_REF_KEY);
    }
    return null;
}

/**
 * Clear stored affiliate reference
 */
export function clearAffiliateRef(): void {
    if (typeof window !== 'undefined') {
        sessionStorage.removeItem(AFFILIATE_REF_KEY);
    }
}

/**
 * Extract affiliate ref from URL parameters
 */
export function getRefFromUrl(): string | null {
    if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('ref');
    }
    return null;
}

/**
 * Track affiliate ref from URL and store it
 */
export function trackAffiliateFromUrl(): string | null {
    const ref = getRefFromUrl();
    if (ref) {
        storeAffiliateRef(ref);
        return ref;
    }
    return getAffiliateRef();
}
