import { google } from 'googleapis';

const SHEET_ID = process.env.GOOGLE_SHEET_ID || '';
const CREDENTIALS = process.env.GOOGLE_CREDENTIALS || '';

let sheetsClient: any = null;

// Initialize Google Sheets client
function getGoogleSheetsClient() {
    if (sheetsClient) return sheetsClient;

    try {
        if (!CREDENTIALS) {
            console.warn('Google Sheets credentials not configured');
            return null;
        }

        const credentials = JSON.parse(CREDENTIALS);
        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        sheetsClient = google.sheets({ version: 'v4', auth });
        return sheetsClient;
    } catch (error) {
        console.error('Error initializing Google Sheets:', error);
        return null;
    }
}

// Append sale to Google Sheets
export async function appendSaleToSheet(sale: any) {
    try {
        const sheets = getGoogleSheetsClient();
        if (!sheets || !SHEET_ID) return false;

        const values = [[
            new Date(sale.createdAt).toLocaleString('en-MY', { timeZone: 'Asia/Kuala_Lumpur' }),
            sale.orderId || sale.id,
            sale.affiliateCode || '',
            sale.customerName || '',
            sale.productName || '',
            `RM ${sale.amount.toFixed(2)}`,
            `${sale.commissionPercent}%`,
            `RM ${sale.commission.toFixed(2)}`,
            sale.status || 'pending',
        ]];

        await sheets.spreadsheets.values.append({
            spreadsheetId: SHEET_ID,
            range: 'Sales!A:I',
            valueInputOption: 'RAW',
            requestBody: { values },
        });

        return true;
    } catch (error) {
        console.error('Error appending to Google Sheets:', error);
        return false;
    }
}

// Update sale status in Google Sheets
export async function updateSaleInSheet(saleId: string, status: string) {
    try {
        const sheets = getGoogleSheetsClient();
        if (!sheets || !SHEET_ID) return false;

        // Find row with matching sale ID
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SHEET_ID,
            range: 'Sales!A:I',
        });

        const rows = response.data.values || [];
        const rowIndex = rows.findIndex((row: any) => row[1] === saleId);

        if (rowIndex === -1) return false;

        // Update status column (column I = index 8)
        await sheets.spreadsheets.values.update({
            spreadsheetId: SHEET_ID,
            range: `Sales!I${rowIndex + 1}`,
            valueInputOption: 'RAW',
            requestBody: {
                values: [[status]],
            },
        });

        return true;
    } catch (error) {
        console.error('Error updating Google Sheets:', error);
        return false;
    }
}

// Initialize sheet with headers
export async function initializeSheet() {
    try {
        const sheets = getGoogleSheetsClient();
        if (!sheets || !SHEET_ID) return false;

        const headers = [[
            'Date',
            'Order ID',
            'Affiliate Code',
            'Customer Name',
            'Product',
            'Amount (RM)',
            'Commission %',
            'Commission (RM)',
            'Status',
        ]];

        await sheets.spreadsheets.values.update({
            spreadsheetId: SHEET_ID,
            range: 'Sales!A1:I1',
            valueInputOption: 'RAW',
            requestBody: { values: headers },
        });

        return true;
    } catch (error) {
        console.error('Error initializing sheet:', error);
        return false;
    }
}
