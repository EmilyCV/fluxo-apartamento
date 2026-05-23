'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { AuthService } from '../services/authService';
import { createLogger, generateCorrelationId, setSessionId, resetSessionId } from '@/utils/logger';

const logger = createLogger('AuthContext');

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
    if (process.env.NEXT_PUBLIC_USE_MOCKS === 'true') {
      logger.info('Inicializar', 'Modo mock ativo — usando usuário convidado, ignorando Firebase');
      setUser(MOCK_USER);
      setUserName('Usuário Convidado');
      setLoading(false);
      return;
    }

    logger.debug('Inicializar', 'Assinando estado de autenticação no Firebase');

    const unsubscribe = AuthService.subscribeToAuthState(async (currentUser) => {
      const correlationId = generateCorrelationId();
      setLoading(true);

      if (currentUser?.email) {
        logger.info('MudancaEstadoAuth', 'Estado de autenticação recebido — validando acesso do usuário', {
          correlationId,
          data: { uid: currentUser.uid },
        });

        try {
          const { isAllowed, data } = await AuthService.checkUserPermission(
            currentUser.email,
            correlationId,
          );

          if (isAllowed) {
            setUser(currentUser);
            setUserName(data?.name || currentUser.displayName || 'Usuária');
            logger.info('MudancaEstadoAuth', 'Sessão do usuário estabelecida', {
              correlationId,
              data: { uid: currentUser.uid, nome: data?.name || currentUser.displayName },
            });
          } else {
            logger.warn(
              'MudancaEstadoAuth',
              'Acesso negado — e-mail não está na lista de permissões, encerrando sessão',
              { correlationId, data: { uid: currentUser.uid } },
            );
            await AuthService.logout(correlationId);
            setUser(null);
            setError('Acesso negado. E-mail não autorizado para este projeto.');
          }
        } catch (err) {
          logger.error('MudancaEstadoAuth', 'Falha ao validar sessão do usuário', {
            correlationId,
            error: err,
          });
          setError('Ocorreu um erro ao validar sua sessão.');
        }
      } else {
        logger.debug('MudancaEstadoAuth', 'Sem usuário autenticado — limpando sessão', {
          correlationId,
        });
        setUser(null);
        setUserName('');
      }

      setLoading(false);
    });

    return () => {
      logger.debug('Inicializar', 'Encerrando assinatura do estado de autenticação no Firebase');
      unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    if (process.env.NEXT_PUBLIC_USE_MOCKS === 'true') {
      setUser(MOCK_USER);
      setUserName('Usuário Convidado');
      router.push('/dashboard');
      return;
    }

    const correlationId = generateCorrelationId();
    logger.info('Login', 'Usuário iniciou login com Google', { correlationId });

    setLoading(true);
    setError(null);

    try {
      const authResult = await AuthService.signInWithGoogle(correlationId);
      const userEmail = authResult.user.email;

      if (!userEmail) {
        logger.warn('Login', 'Login com Google retornou usuário sem e-mail — cancelando', {
          correlationId,
        });
        await AuthService.logout(correlationId);
        throw new Error('E-mail não fornecido pelo Google.');
      }

      const { isAllowed } = await AuthService.checkUserPermission(userEmail, correlationId);

      if (!isAllowed) {
        logger.warn('Login', 'Login rejeitado — e-mail não está na lista de permissões', {
          correlationId,
          data: { uid: authResult.user.uid },
        });
        await AuthService.logout(correlationId);
        setError('Acesso negado. E-mail não autorizado para este projeto.');
        return;
      }

      // Inicia uma nova sessão autenticada — todos os logs subsequentes
      // partilharão este sessionId até ao próximo login ou logout.
      const novoSessionId = generateCorrelationId();
      setSessionId(novoSessionId);

      logger.info('Login', 'Login realizado com sucesso — redirecionando para o dashboard', {
        correlationId,
        data: { uid: authResult.user.uid },
      });
      router.push('/dashboard');
    } catch (err: unknown) {
      const authError = err as { code?: string; message?: string };
      if (authError.code === 'auth/popup-closed-by-user') {
        logger.debug('Login', 'Login cancelado — usuário fechou o popup', { correlationId });
      } else {
        logger.error('Login', 'Falha no login com Google', { correlationId, error: err });
        setError(authError.message || 'Falha na autenticação com Google.');
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    const correlationId = generateCorrelationId();
    logger.info('Logout', 'Usuário iniciou logout', { correlationId });
    try {
      if (process.env.NEXT_PUBLIC_USE_MOCKS !== 'true') {
        await AuthService.logout(correlationId);
      }
      setUser(null);
      setUserName('');

      // Gera nova sessão anónima para que logs pós-logout não se misturem
      // com os da sessão autenticada anterior.
      resetSessionId();

      logger.info('Logout', 'Sessão encerrada — redirecionando para o login', { correlationId });
      router.push('/login');
    } catch (err) {
      logger.error('Logout', 'Falha ao completar fluxo de logout', { correlationId, error: err });
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
