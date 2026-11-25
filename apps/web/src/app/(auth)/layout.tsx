import type { ReactNode } from 'react';
import { MarcaCopix } from '@/components/shared/marca-copix';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex justify-center px-5 pt-10 sm:pt-14">
        <MarcaCopix tamanho="md" />
      </header>
      <main className="flex flex-1 justify-center px-5 py-10 sm:py-14">
        <div className="w-full max-w-[380px]">{children}</div>
      </main>
    </div>
  );
}
