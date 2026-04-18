import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'Dirham Exchange Manager',
  description: 'Mfumo wa kisasa wa kubadilishana fedha AED na TZS',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sw">
      <body suppressHydrationWarning>
        {children}
        <Toaster position="top-right" toastOptions={{
          duration: 4000,
          style: { borderRadius: '14px', fontFamily: 'Inter', fontSize: '14px', padding: '12px 16px' },
          success: { style: { background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' } },
          error: { style: { background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' } },
        }} />
      </body>
    </html>
  );
}