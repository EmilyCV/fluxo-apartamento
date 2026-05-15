'use client';

import { useEffect } from 'react';
import { useFirebaseAuth } from '@/modules/auth/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export function RootRedirect() {
  const { user, loading } = useFirebaseAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-pink-light">
      <div className="animate-pulse text-brand-pink font-medium text-xl">Carregando...</div>
    </div>
  );
}
