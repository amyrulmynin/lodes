import jsPDF from 'jspdf';

interface WithdrawalData {
    id: string;
    amount: number;
    status: string;
    createdAt: string;
    paymentDetails: {
        bankName?: string;
        ewalletType?: string;
        accountNumber: string;
        accountHolder: string;
    };
    affiliate: {
        name: string;
        email: string;
        affiliateCode: string;
    };
}

export function generateWithdrawalPDF(withdrawal: WithdrawalData): jsPDF {
    const doc = new jsPDF();

    // Colors
    const primaryColor = '#a855f7'; // Purple
    const secondaryColor = '#ec4899'; // Pink
    const textDark = '#1f2937';
    const textMuted = '#6b7280';

    // Header with gradient effect
    doc.setFillColor(168, 85, 247); // Purple
    doc.rect(0, 0, 210, 40, 'F');

    // Company name
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('LODES AFFILIATE', 105, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Withdrawal Receipt', 105, 30, { align: 'center' });

    // Reset text color
    doc.setTextColor(textDark);

    // Withdrawal ID and Date
    doc.setFontSize(10);
    doc.setTextColor(textMuted);
    doc.text('Receipt ID:', 20, 55);
    doc.setTextColor(textDark);
    doc.setFont('helvetica', 'bold');
    doc.text(withdrawal.id, 50, 55);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(textMuted);
    doc.text('Date:', 20, 62);
    doc.setTextColor(textDark);
    doc.text(new Date(withdrawal.createdAt).toLocaleString('en-MY', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }), 50, 62);

    // Status badge
    doc.setFontSize(10);
    doc.setTextColor(textMuted);
    doc.text('Status:', 20, 69);

    // Status color
    let statusColor = [251, 191, 36]; // Warning yellow
    if (withdrawal.status === 'paid') {
        statusColor = [34, 197, 94]; // Success green
    } else if (withdrawal.status === 'rejected') {
        statusColor = [239, 68, 68]; // Error red
    }

    doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
    doc.roundedRect(48, 65, 30, 6, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text(withdrawal.status.toUpperCase(), 63, 69, { align: 'center' });

    // Divider
    doc.setDrawColor(229, 231, 235);
    doc.line(20, 78, 190, 78);

    // Amount Section
    doc.setFillColor(249, 250, 251);
    doc.roundedRect(20, 85, 170, 25, 3, 3, 'F');

    doc.setTextColor(textMuted);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text('Withdrawal Amount', 105, 94, { align: 'center' });

    doc.setTextColor(168, 85, 247); // Purple
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text(`RM ${withdrawal.amount.toFixed(2)}`, 105, 105, { align: 'center' });

    // Affiliate Information
    doc.setTextColor(textDark);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Affiliate Information', 20, 125);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(textMuted);

    const affiliateInfo = [
        { label: 'Name:', value: withdrawal.affiliate.name },
        { label: 'Email:', value: withdrawal.affiliate.email },
        { label: 'Affiliate Code:', value: withdrawal.affiliate.affiliateCode },
    ];

    let yPos = 135;
    affiliateInfo.forEach((info) => {
        doc.setTextColor(textMuted);
        doc.text(info.label, 25, yPos);
        doc.setTextColor(textDark);
        doc.text(info.value, 70, yPos);
        yPos += 7;
    });

    // Payment Details
    doc.setTextColor(textDark);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Payment Details', 20, 165);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    const paymentMethod = withdrawal.paymentDetails.bankName || withdrawal.paymentDetails.ewalletType || 'N/A';
    const paymentInfo = [
        { label: 'Payment Method:', value: paymentMethod },
        { label: 'Account Number:', value: withdrawal.paymentDetails.accountNumber },
        { label: 'Account Holder:', value: withdrawal.paymentDetails.accountHolder },
    ];

    yPos = 175;
    paymentInfo.forEach((info) => {
        doc.setTextColor(textMuted);
        doc.text(info.label, 25, yPos);
        doc.setTextColor(textDark);
        doc.text(info.value, 70, yPos);
        yPos += 7;
    });

    // Footer
    doc.setDrawColor(229, 231, 235);
    doc.line(20, 250, 190, 250);

    doc.setTextColor(textMuted);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text('This is a computer-generated receipt. No signature required.', 105, 260, { align: 'center' });
    doc.text('Lodes Desserts - Premium Affiliate Program', 105, 267, { align: 'center' });
    doc.text(`Generated on ${new Date().toLocaleString('en-MY')}`, 105, 274, { align: 'center' });

    return doc;
}

export function downloadWithdrawalPDF(withdrawal: WithdrawalData) {
    const doc = generateWithdrawalPDF(withdrawal);
    const filename = `Withdrawal-${withdrawal.id}-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
}
