import type { Metadata, Viewport } from 'next';
import { Hanken_Grotesk } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

const hanken = Hanken_Grotesk({
  subsets: ['latin'],
  variable: '--font-hanken',
  display: 'swap',
});

export const metadata: Metadata = {
  title: { default: 'GUGU Seller', template: '%s | GUGU Seller' },
  description: 'Run your GUGU store: products, orders and store profile.',
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
  applicationName: 'GUGU Seller',
};

export const viewport: Viewport = {
  themeColor: '#06475C',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GH" className={hanken.variable}>
      <body className="min-h-dvh font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
