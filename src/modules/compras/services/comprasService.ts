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
} from 'firebase/firestore';
import { db } from '@/services/firebase';
import { CompraItem } from '../types';
import { mockComprasService } from './mockComprasService';

const COLLECTION_NAME = 'compras';

const normalizeAcquisitionState = <T extends Partial<CompraItem>>(data: T): T => {
  const normalized = { ...data };

  if (normalized.prioridade === 'Adquirido' || normalized.adquirido === true) {
    normalized.prioridade = 'Adquirido';
    normalized.adquirido = true;
  }

  return normalized;
};

const getToggledPrioridade = (adquirido: boolean): CompraItem['prioridade'] =>
  adquirido ? 'Adquirido' : 'Quando der';

const realComprasService = {
  /**
   * Escuta em tempo real a lista de compras
   */
  subscribeToItems: (callback: (items: CompraItem[]) => void, onError?: (error: Error) => void) => {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));

    return onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as CompraItem[];
        callback(items);
      },
      (error) => {
        console.error('Erro ao assinar itens:', error);
        if (onError) onError(error);
      },
    );
  },

  /**
   * Adiciona um novo item
   */
  addItem: async (item: Omit<CompraItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...normalizeAcquisitionState(item),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      throw error;
    }
  },

  /**
   * Atualiza o status de adquirido (toggle)
   */
  toggleAdquirido: async (id: string, currentStatus: boolean) => {
    try {
      const nextStatus = !currentStatus;
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        adquirido: nextStatus,
        prioridade: getToggledPrioridade(nextStatus),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      throw error;
    }
  },

  /**
   * Atualiza um item completo
   */
  updateItem: async (id: string, data: Partial<CompraItem>) => {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        ...normalizeAcquisitionState(data),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Erro ao atualizar item:', error);
      throw error;
    }
  },

  /**
   * Remove um item
   */
  deleteItem: async (id: string) => {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (error) {
      console.error('Erro ao deletar item:', error);
      throw error;
    }
  },
};

// Se a variável de ambiente estiver ativa, usa o mock, senão usa o real
export const comprasService =
  process.env.NEXT_PUBLIC_USE_MOCKS === 'true' ? mockComprasService : realComprasService;
