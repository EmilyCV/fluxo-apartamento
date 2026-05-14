import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '@/services/firebase';

export const AuthService = {
  /**
   * Realiza login com o provedor Google
   */
  signInWithGoogle: async () => {
    return await signInWithPopup(auth, googleProvider);
  },

  /**
   * Encerra a sessão atual
   */
  logout: async () => {
    await signOut(auth);
  },

  /**
   * Observa mudanças no estado de autenticação
   */
  subscribeToAuthState: (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
  },

  /**
   * Verifica se o e-mail do usuário está na whitelist de usuários permitidos
   */
  checkUserPermission: async (email: string) => {
    const userDoc = await getDoc(doc(db, 'allowed_users', email.toLowerCase()));
    return {
      isAllowed: userDoc.exists(),
      data: userDoc.data(),
    };
  },
};
