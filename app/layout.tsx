import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { DynamicContextProvider } from '@/components/providers/DynamicProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Syuzhet - Predictions Investment Platform',
  description: 'Rewrite the script, predict the ending. Be the next Michael Saylor of the Predictions Markets.',
  icons: {
    icon: [
      { url: '/syuzhet.png', sizes: 'any' },
      { url: '/syuzhet.png', type: 'image/png' },
    ],
    apple: '/syuzhet.png',
    shortcut: '/syuzhet.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <DynamicContextProvider>
          {children}
        </DynamicContextProvider>
      </body>
    </html>
  );
}

