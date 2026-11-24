import type { CSSProperties, ReactNode } from 'react';
import type { Metadata } from 'next';
import { Fraunces, IBM_Plex_Mono, IBM_Plex_Sans } from 'next/font/google';
import { AppProviders } from '@/providers/app-providers';
import './globals.css';

const fonteSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-ibm-plex-sans',
  display: 'swap',
});

const fonteDisplay = Fraunces({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-fraunces',
  display: 'swap',
});

const fonteMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-ibm-plex-mono',
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
    '--fonte-sans': 'var(--font-ibm-plex-sans), "Segoe UI", sans-serif',
    '--fonte-display': 'var(--font-fraunces), Georgia, serif',
    '--fonte-mono': 'var(--font-ibm-plex-mono), ui-monospace, monospace',
  } as CSSProperties;

  return (
    <html
      lang="pt-BR"
      className={`${fonteSans.variable} ${fonteDisplay.variable} ${fonteMono.variable}`}
    >
      <body className="min-h-screen font-sans" style={estiloFontes}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
