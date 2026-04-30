'use client';

import { useEffect } from 'react';
import { useAuth } from '@/modules/auth/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function HomePage() {
    const { user, loading } = useAuth();
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
            <div className="animate-pulse text-brand-pink font-medium text-xl">
                Carregando...
            </div>
        </div>
    );
}