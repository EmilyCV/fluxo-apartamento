'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, googleProvider } from '@/shared/lib/firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

interface AuthContextType {
    user: User | null;
    userName: string;
    loading: boolean;
    error: string | null;
    signInWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
    clearError: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [userName, setUserName] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const clearError = () => setError(null);

    useEffect(() => {
        // Se estiver usando mocks, define um usuário fake e não escuta o Firebase Auth
        if (process.env.NEXT_PUBLIC_USE_MOCKS === 'true') {
            const mockUser = {
                uid: 'mock-user-id',
                email: 'convidado@exemplo.com',
                displayName: 'Usuário Convidado',
                photoURL: null,
            } as User;
            setUser(mockUser);
            setUserName('Usuário Convidado');
            setLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setLoading(true);
            if (currentUser && currentUser.email) {
                try {
                    const emailStr = currentUser.email.toLowerCase();
                    const userDoc = await getDoc(doc(db, 'allowed_users', emailStr));

                    if (userDoc.exists()) {
                        setUser(currentUser);
                        setUserName(userDoc.data().name || currentUser.displayName || 'Usuária');
                    } else {
                        await signOut(auth);
                        setUser(null);
                        setError('Acesso negado. E-mail não autorizado para este projeto.');
                    }
                } catch (err) {
                    console.error("Erro ao validar acesso:", err);
                    await signOut(auth);
                    setUser(null);
                    setError('Erro ao validar permissões de acesso.');
                }
            } else {
                setUser(null);
                setUserName('');
            }
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const signInWithGoogle = async () => {
        if (process.env.NEXT_PUBLIC_USE_MOCKS === 'true') {
            const mockUser = {
                uid: 'mock-user-id',
                email: 'convidado@exemplo.com',
                displayName: 'Usuário Convidado',
                photoURL: null,
            } as User;
            setUser(mockUser);
            setUserName('Usuário Convidado');
            router.push('/dashboard');
            return;
        }
        try {
            setError(null);
            const result = await signInWithPopup(auth, googleProvider);
            const email = result.user.email?.toLowerCase();

            if (!email) {
                await signOut(auth);
                throw new Error('E-mail não fornecido pelo Google.');
            }

            const userDoc = await getDoc(doc(db, 'allowed_users', email));

            if (!userDoc.exists()) {
                await signOut(auth);
                setError('Acesso negado. E-mail não autorizado para este projeto.');
                return;
            }

            router.push('/dashboard');
        } catch (err: any) {
            console.error('Erro de login:', err);
            if (err.code !== 'auth/popup-closed-by-user') {
                setError(err.message || 'Falha na autenticação.');
            }
        }
    };

    const logout = async () => {
        if (process.env.NEXT_PUBLIC_USE_MOCKS === 'true') {
            setUser(null);
            setUserName('');
            router.push('/login');
            return;
        }
        await signOut(auth);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, userName, loading, error, signInWithGoogle, logout, clearError }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);