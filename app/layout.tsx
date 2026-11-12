// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { baseMetadata } from '@/lib/seo';
import { ThemeProvider } from '@/components/theme-provider';
import { GlobalLayout } from '@/components/global-layout';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = baseMetadata();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <GlobalLayout>
            {children}
          </GlobalLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}