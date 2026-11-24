import type { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen bg-background">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_top,hsl(168_40%_90%),transparent_70%)]"
        aria-hidden
      />
      <div className="relative mx-auto flex min-h-screen w-full max-w-md items-center px-4 py-10">
        {children}
      </div>
    </div>
  );
}
