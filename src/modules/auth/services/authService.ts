import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '@/services/firebase';
import { createLogger, generateCorrelationId } from '@/utils/logger';

const logger = createLogger('AuthService');

export const AuthService = {
  signInWithGoogle: async (correlationId?: string) => {
    const cid = correlationId ?? generateCorrelationId();
    const timer = logger.startTimer('LoginComGoogle', 'Abrindo popup de login com Google', cid);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      timer.concluido('Popup de login com Google concluído', { uid: result.user.uid });
      return result;
    } catch (error) {
      timer.falhou('Falha no popup de login com Google', error);
      throw error;
    }
  },

  logout: async (correlationId?: string) => {
    const cid = correlationId ?? generateCorrelationId();
    logger.info('Logout', 'Iniciando logout do usuário', { correlationId: cid });
    try {
      await signOut(auth);
      logger.info('Logout', 'Sessão do usuário encerrada com sucesso', { correlationId: cid });
    } catch (error) {
      logger.error('Logout', 'Falha ao encerrar sessão', { correlationId: cid, error });
      throw error;
    }
  },

  subscribeToAuthState: (callback: (user: User | null) => void) => {
    logger.debug('EstadoAuth', 'Assinando mudanças de estado de autenticação no Firebase');
    return onAuthStateChanged(auth, callback);
  },

  checkUserPermission: async (email: string, correlationId?: string) => {
    const cid = correlationId ?? generateCorrelationId();
    // Registar apenas o domínio — nunca o endereço completo
    const dominioEmail = email.split('@')[1] ?? 'desconhecido';
    logger.info('VerificarPermissao', `Verificando lista de permissões para domínio @${dominioEmail}`, {
      correlationId: cid,
    });
    try {
      const userDoc = await getDoc(doc(db, 'allowed_users', email.toLowerCase()));
      const isAllowed = userDoc.exists();
      logger.info(
        'VerificarPermissao',
        `Verificação concluída: ${isAllowed ? 'PERMITIDO' : 'NEGADO'}`,
        { correlationId: cid },
      );
      return { isAllowed, data: userDoc.data() };
    } catch (error) {
      logger.error('VerificarPermissao', 'Falha ao consultar coleção allowed_users', {
        correlationId: cid,
        error,
      });
      throw error;
    }
  },
};
