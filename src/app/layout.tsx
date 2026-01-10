import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'חנות הסלולר שלי',
  description: 'חנות מקוונת למכירת סמארטפונים ומכשירים סלולריים',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <body>{children}</body>
    </html>
  );
}