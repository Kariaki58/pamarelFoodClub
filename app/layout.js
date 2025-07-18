import "./globals.css";
import { cn } from '@/lib/utils';
import { Inter } from 'next/font/google';
import ProviderHelper from "./Helper";

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });


export const metadata = {
  title: 'pamarel - Your one-stop shop',
  description: 'pamarel - Your one-stop shop for everything.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body
        className={cn('min-h-screen bg-background font-sans antialiased', inter.variable)}
      >
        <ProviderHelper>
          {children}
        </ProviderHelper>
      </body>
    </html>
  );
}
