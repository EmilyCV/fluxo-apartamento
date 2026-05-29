'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { AuthService } from '../services/authService';

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

const MOCK_USER: User = {
  uid: 'mock-user-id',
  email: 'convidado@exemplo.com',
  displayName: 'Usuário Convidado',
  photoURL: null,
} as User;

export function FirebaseAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const clearError = () => setError(null);

  useEffect(() => {
    // Suporte para Mocks no Desenvolvimento Local
    if (process.env.NEXT_PUBLIC_USE_MOCKS === 'true') {
      setUser(MOCK_USER);
      setUserName('Usuário Convidado');
      setLoading(false);
      return;
    }

    const unsubscribe = AuthService.subscribeToAuthState(async (currentUser) => {
      setLoading(true);
      try {
        if (currentUser?.email) {
          const { isAllowed, data } = await AuthService.checkUserPermission(currentUser.email);

          if (isAllowed) {
            setUser(currentUser);
            setUserName(data?.name || currentUser.displayName || 'Usuária');
          } else {
            // Se o e-mail não estiver na whitelist, desloga automaticamente
            await AuthService.logout();
            setUser(null);
            setError('Acesso negado. E-mail não autorizado para este projeto.');
          }
        } else {
          setUser(null);
          setUserName('');
        }
      } catch (err) {
        console.error('Erro ao validar sessão do usuário:', err);
        setError('Ocorreu um erro ao validar sua sessão.');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    if (process.env.NEXT_PUBLIC_USE_MOCKS === 'true') {
      setUser(MOCK_USER);
      setUserName('Usuário Convidado');
      router.push('/dashboard');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const authResult = await AuthService.signInWithGoogle();
      const userEmail = authResult.user.email;

      if (!userEmail) {
        await AuthService.logout();
        throw new Error('E-mail não fornecido pelo Google.');
      }

      const { isAllowed } = await AuthService.checkUserPermission(userEmail);

      if (!isAllowed) {
        await AuthService.logout();
        setError('Acesso negado. E-mail não autorizado para este projeto.');
        return;
      }

      router.push('/dashboard');
    } catch (err: unknown) {
      console.error('Erro durante o login com Google:', err);
      const authError = err as { code?: string; message?: string };

      if (authError.code !== 'auth/popup-closed-by-user') {
        setError(authError.message || 'Falha na autenticação com Google.');
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (process.env.NEXT_PUBLIC_USE_MOCKS !== 'true') {
        await AuthService.logout();
      }
      setUser(null);
      setUserName('');
      router.push('/login');
    } catch (err) {
      console.error('Erro ao encerrar sessão:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userName,
        loading,
        error,
        signInWithGoogle,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useFirebaseAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useFirebaseAuth deve ser usado dentro de um FirebaseAuthProvider');
  }
  return context;
};

// Alias para compatibilidade se necessário
export const useAuth = useFirebaseAuth;
