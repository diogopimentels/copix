import type { CSSProperties, ReactNode } from 'react';
import type { Metadata } from 'next';
import { IBM_Plex_Mono, IBM_Plex_Sans } from 'next/font/google';
import { AppProviders } from '@/providers/app-providers';
import './globals.css';

const fonteSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-plex-sans',
  display: 'swap',
});

const fonteMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-plex-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Copix',
    template: '%s · Copix',
  },
  description: 'Conciliação financeira para pagamentos Pix',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const estiloFontes = {
    '--fonte-sans': 'var(--font-plex-sans), "Segoe UI", system-ui, sans-serif',
    '--fonte-mono': 'var(--font-plex-mono), ui-monospace, monospace',
  } as CSSProperties;

  return (
    <html lang="pt-BR" className={`${fonteSans.variable} ${fonteMono.variable}`}>
      <body className="min-h-screen font-sans" style={estiloFontes}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
