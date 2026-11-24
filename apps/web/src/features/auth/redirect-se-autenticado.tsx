'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { temSinalSessao } from '@/lib/api';

export function RedirectSeAutenticado() {
  const router = useRouter();

  useEffect(() => {
    if (temSinalSessao()) {
      router.replace('/dashboard');
    }
  }, [router]);

  return null;
}
