import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  onSnapshot,
  orderBy,
  serverTimestamp,
  getDocs,
  limit,
} from 'firebase/firestore';
import { db } from '@/services/firebase';
import { HomeAmbiente } from '../types';
import { mockHomeAmbientesService } from './mockHomeAmbientesService';

const COLLECTION_NAME = 'home_ambientes';

let cachedHomeAmbientes: HomeAmbiente[] | null = null;

const realHomeAmbientesService = {
  /**
   * Verifica se há cache em memória
   */
  getCachedHomeAmbientes: () => cachedHomeAmbientes,

  /**
   * Escuta em tempo real quais cômodos estão na Home
   */
  subscribeToHomeAmbientes: (
    callback: (items: HomeAmbiente[]) => void,
    onError?: (error: Error) => void,
  ) => {
    // Se já temos cache, entrega imediatamente de forma síncrona
    if (cachedHomeAmbientes) {
      callback(cachedHomeAmbientes);
    }

    const q = query(collection(db, COLLECTION_NAME), orderBy('ordem', 'asc'));

    return onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as HomeAmbiente[];
        cachedHomeAmbientes = items; // Atualiza o cache
        callback(items);
      },
      (error) => {
        console.error('Erro ao assinar home_ambientes:', error);
        if (onError) onError(error);
      },
    );
  },

  /**
   * Adiciona um cômodo à Home
   */
  addToHome: async (ambienteId: string, ordem: number) => {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ambienteId,
        ordem,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Erro ao adicionar à home:', error);
      throw error;
    }
  },

  /**
   * Atualiza a ordem ou o cômodo selecionado
   */
  updateHomeCard: async (id: string, data: Partial<HomeAmbiente>) => {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Erro ao atualizar card da home:', error);
      throw error;
    }
  },

  /**
   * Remove um cômodo da Home
   */
  removeFromHome: async (id: string) => {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (error) {
      console.error('Erro ao remover da home:', error);
      throw error;
    }
  },

  /**
   * Inicializa com os cômodos padrão: Cozinha, Sala, Banheiro
   */
  seedInitialHomeAmbientes: async () => {
    // Não repete o seed na mesma sessão
    if (typeof window !== 'undefined') {
      if (sessionStorage.getItem('home_seeded') === 'true') return;
    }

    // Usa limit(1) em vez de getDocs completo — muito mais barato
    const q = query(collection(db, COLLECTION_NAME), limit(1));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      const defaults = [
        { ambienteId: '1. Cozinha', ordem: 1 },
        { ambienteId: '2. Sala', ordem: 2 },
        { ambienteId: '4. Banheiro', ordem: 3 },
      ];

      for (const item of defaults) {
        await addDoc(collection(db, COLLECTION_NAME), {
          ...item,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    }

    if (typeof window !== 'undefined') {
      sessionStorage.setItem('home_seeded', 'true');
    }
  },
};

export const homeAmbientesService =
  process.env.NEXT_PUBLIC_USE_MOCKS === 'true'
    ? mockHomeAmbientesService
    : realHomeAmbientesService;
