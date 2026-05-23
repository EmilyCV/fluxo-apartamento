import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { createLogger } from '@/utils/logger';

const logger = createLogger('Firebase');

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Evita inicializar o Firebase múltiplas vezes no Next.js
const isNewInstance = !getApps().length;
const app = isNewInstance ? initializeApp(firebaseConfig) : getApp();

if (isNewInstance) {
  logger.info('Inicializar', 'Aplicação Firebase inicializada', {
    data: { projectId: firebaseConfig.projectId },
  });
} else {
  logger.debug('Inicializar', 'Reutilizando instância existente da aplicação Firebase');
}

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Força o usuário a selecionar a conta do Google (útil caso tenham múltiplas contas no celular/PC)
googleProvider.setCustomParameters({ prompt: 'select_account' });
