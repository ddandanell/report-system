import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Private Tutoring Bali — Session Tracker',
  description: 'Internal session reporting system for PTB tutors',
  appleWebApp: { capable: true, title: 'PTB Tracker' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="overscroll-none">
      <body className="overscroll-none">{children}</body>
    </html>
  );
}
