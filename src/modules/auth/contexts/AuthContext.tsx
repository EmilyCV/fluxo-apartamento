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
    signInWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [userName, setUserName] = useState('');
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser && currentUser.email) {
                try {
                    const emailStr = currentUser.email.toLowerCase();
                    const userDoc = await getDoc(doc(db, 'allowed_users', emailStr));

                    if (userDoc.exists()) {
                        setUser(currentUser);
                        setUserName(userDoc.data().name || 'Organizador');
                    } else {
                        await signOut(auth);
                        setUser(null);
                        setUserName('');
                    }
                } catch (error) {
                    console.error("Erro ao validar acesso no Firestore:", error);
                    await signOut(auth);
                    setUser(null);
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
        try {
            const result = await signInWithPopup(auth, googleProvider);
            if (!result.user.email) throw new Error('E-mail não encontrado.');

            // Valida no momento do login se o usuário está na coleção
            const emailStr = result.user.email.toLowerCase();
            const userDoc = await getDoc(doc(db, 'allowed_users', emailStr));

            if (!userDoc.exists()) {
                await signOut(auth);
                throw new Error('Acesso negado. E-mail não autorizado para este projeto.');
            }

            router.push('/dashboard');
        } catch (error) {
            console.error('Erro de login:', error);
            throw error;
        }
    };

    const logout = async () => {
        await signOut(auth);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, userName, loading, signInWithGoogle, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);