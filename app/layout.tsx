import './globals.css';

export const metadata = {
  title: 'Lodes Affiliate - Dessert Affiliate Program',
  description: 'Earn commissions selling premium desserts with Lodes',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
