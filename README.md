# Lodes Affiliate - Dessert Affiliate Program

Sistem affiliate untuk produk dessert premium dengan komisen fleksibel, pengurusan WhatsApp, dan integrasi Google Sheets.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Create .env.local file
cp .env.example .env.local  # Or create manually

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📋 Default Login Credentials

**Admin:**
- Email: `admin@lodes.com`
- Password: `admin123`

**Affiliate:**
- Register new account at `/affiliate/login`

## 🎯 Features

### Admin Features
- ✅ Product management (add/edit/delete products)
- ✅ Set custom commission percentage per product
- ✅ Sales tracking and management
- ✅ Affiliate management
- ✅ Withdrawal approval system
- ✅ Google Sheets integration

### Affiliate Features
- ✅ Unique affiliate link and code
- ✅ WhatsApp order collection
- ✅ Real-time sales dashboard
- ✅ Commission tracking (RM currency)
- ✅ Withdrawal requests with QR upload
- ✅ Payment details management

## 💰 Commission System

- Flexible commission rates per product (set by admin)
- Example: Chocolate Cake - 10%, Tiramisu - 12%
- Automatic calculation and tracking
- Minimum withdrawal: RM 50

## 📱 WhatsApp Integration

Orders are collected via WhatsApp:
1. Affiliate fills order form
2. System generates WhatsApp message with order details
3. One-click send to admin's WhatsApp
4. Admin confirms and creates sale in system

## 📊 Google Sheets (Optional)

To enable Google Sheets sync:
1. Create Google Cloud project
2. Enable Google Sheets API
3. Create service account and download credentials
4. Add to `.env.local`:
   ```
   GOOGLE_SHEET_ID=your_sheet_id
   GOOGLE_CREDENTIALS={"type":"service_account",...}
   ```

## 🛠️ Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Custom CSS (Glassmorphism design)
- File-based JSON database
- JWT authentication
- Google Sheets API
- WhatsApp Business API

## 📁 Project Structure

```
app/
  ├── admin/          # Admin pages
  ├── affiliate/      # Affiliate pages
  ├── api/           # API routes
  └── login/         # Auth pages
lib/
  ├── db.ts          # Database utilities
  ├── auth.ts        # Authentication
  ├── googleSheets.ts # Sheets integration
  └── utils.ts       # Helper functions
```

## 🔐 Environment Variables

```env
JWT_SECRET=your-secret-key
NEXT_PUBLIC_BASE_URL=http://localhost:3000
GOOGLE_SHEET_ID=optional
GOOGLE_CREDENTIALS=optional
ADMIN_WHATSAPP=60123456789
```

## 🎨 Design System

- Dark theme with purple/pink gradient accents
- Glassmorphism effects
- Responsive layout
- Custom CSS utilities

## 📝 License

Private project for Lodes Desserts
