import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { SupabaseProvider } from '@/context/SupabaseProvider';
import Navigation from '@/components/Navigation';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Fixture Quoting System',
  description: 'AI-powered fixture quoting for CNC workholding',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white`}>
        <SupabaseProvider>
          <Navigation />
          <main>
            {children}
          </main>
        </SupabaseProvider>
      </body>
    </html>
  );
}