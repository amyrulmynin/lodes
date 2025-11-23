// Helper function to generate unique affiliate code
export function generateAffiliateCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'LODES-';
    for (let i = 0; i < 5; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// Generate affiliate link
export function generateAffiliateLink(code: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    return `${baseUrl}/?ref=${code}`;
}

// Format currency to RM
export function formatRM(amount: number): string {
    return `RM ${amount.toFixed(2)}`;
}

// Calculate commission
export function calculateCommission(amount: number, percent: number): number {
    return (amount * percent) / 100;
}

// Format date for display
export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-MY', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

// Generate WhatsApp link
export function generateWhatsAppLink(phone: string, message: string): string {
    const cleanPhone = phone.replace(/\D/g, '');
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}

// Format WhatsApp order message
export function formatOrderMessage(order: {
    orderId: string;
    affiliateCode: string;
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    items: Array<{ productName: string; quantity: number; price: number }>;
    total: number;
}): string {
    const itemsList = order.items
        .map((item) => `${item.quantity}x ${item.productName} - ${formatRM(item.price * item.quantity)}`)
        .join('\n');

    return `🍰 *LODES ORDER* 🍰

📋 Order ID: #${order.orderId}
👤 Affiliate: ${order.affiliateCode}

📦 *Customer Details:*
Name: ${order.customerName}
Phone: ${order.customerPhone}
Address: ${order.customerAddress}

🛍️ *Order Items:*
${itemsList}

💰 *Total: ${formatRM(order.total)}*

Please confirm this order. Thank you! 🙏`;
}

// Validate file upload (images only)
export function validateImageFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

    if (!allowedTypes.includes(file.type)) {
        return { valid: false, error: 'Only JPG, PNG, and WebP images are allowed' };
    }

    if (file.size > maxSize) {
        return { valid: false, error: 'File size must be less than 5MB' };
    }

    return { valid: true };
}

// Get status badge class
export function getStatusBadgeClass(status: string): string {
    switch (status.toLowerCase()) {
        case 'paid':
        case 'approved':
        case 'completed':
            return 'badge-success';
        case 'pending':
            return 'badge-warning';
        case 'rejected':
        case 'cancelled':
            return 'badge-error';
        default:
            return 'badge-info';
    }
}
