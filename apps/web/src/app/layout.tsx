import type { CSSProperties, ReactNode } from 'react';
import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { AppProviders } from '@/providers/app-providers';
import './globals.css';

const fonteSans = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const fonteMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Copix',
    template: '%s · Copix',
  },
  description: 'Conciliação financeira B2B para pagamentos Pix',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const estiloFontes = {
    '--fonte-sans': 'var(--font-inter), "Segoe UI", system-ui, sans-serif',
    '--fonte-mono': 'var(--font-jetbrains), ui-monospace, monospace',
  } as CSSProperties;

  return (
    <html lang="pt-BR" className={`${fonteSans.variable} ${fonteMono.variable}`}>
      <body className="min-h-screen font-sans" style={estiloFontes}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
