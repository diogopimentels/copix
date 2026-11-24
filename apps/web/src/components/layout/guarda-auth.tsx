'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { usePerfil } from '@/hooks/use-auth';
import { lerToken, limparToken } from '@/lib/api';

type Props = {
  children: ReactNode;
};

export function GuardaAuth({ children }: Props) {
  const router = useRouter();
  const { isLoading, isError, isSuccess } = usePerfil();

  useEffect(() => {
    if (!lerToken()) {
      router.replace('/login');
    }
  }, [router]);

  useEffect(() => {
    if (isError) {
      limparToken();
      router.replace('/login');
    }
  }, [isError, router]);

  if (!lerToken() || isLoading || (!isSuccess && !isError)) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="grid w-full max-w-md gap-3">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  return children;
}
