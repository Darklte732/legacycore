import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Legacy Core',
  description: 'Legacy Core Insurance Platform',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
        <style dangerouslySetInnerHTML={{ __html: `
          /* Critical CSS for status badges */
          .status-green {
            display: inline-block;
            background-color: rgb(240 253 244);
            color: rgb(22 163 74);
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 500;
            padding: 0.25rem 0.5rem;
          }
          .status-yellow {
            display: inline-block;
            background-color: rgb(254 252 232);
            color: rgb(202 138 4);
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 500;
            padding: 0.25rem 0.5rem;
          }
          .status-blue {
            display: inline-block;
            background-color: rgb(239 246 255);
            color: rgb(37 99 235);
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 500;
            padding: 0.25rem 0.5rem;
          }
        ` }}/>
      </head>
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
