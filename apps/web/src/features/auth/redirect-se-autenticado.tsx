'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { lerToken } from '@/lib/api';

export function RedirectSeAutenticado() {
  const router = useRouter();

  useEffect(() => {
    if (lerToken()) {
      router.replace('/dashboard');
    }
  }, [router]);

  return null;
}
