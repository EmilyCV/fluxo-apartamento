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
import { Nota, TodoItem, TodoStatus } from '../types';
import { mockNotasService } from './mockNotasService';

const COLLECTION_NAME = 'notas';

const stripUndefined = <T extends object>(obj: T): T =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as T;

let cachedNotas: Nota[] | null = null;

const realNotasService = {
  getCachedNotas: () => cachedNotas,

  subscribeToNotas: (
    callback: (notas: Nota[]) => void,
    onError?: (error: Error) => void,
  ) => {
    if (cachedNotas) {
      callback(cachedNotas);
    }

    const q = query(collection(db, COLLECTION_NAME), orderBy('atualizadoEm', 'desc'));

    return onSnapshot(
      q,
      (snapshot) => {
        const notas = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Nota[];
        cachedNotas = notas;
        callback(notas);
      },
      (error) => {
        console.error('Erro ao assinar notas:', error);
        if (onError) onError(error);
      },
    );
  },

  addNota: async (nota: Omit<Nota, 'id' | 'criadoEm' | 'atualizadoEm'>) => {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), stripUndefined({
        ...nota,
        criadoEm: serverTimestamp(),
        atualizadoEm: serverTimestamp(),
      }));
      return docRef.id;
    } catch (error) {
      console.error('Erro ao adicionar nota:', error);
      throw error;
    }
  },

  updateNota: async (id: string, data: Partial<Nota>) => {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, stripUndefined({
        ...data,
        atualizadoEm: serverTimestamp(),
      }));
    } catch (error) {
      console.error('Erro ao atualizar nota:', error);
      throw error;
    }
  },

  deleteNota: async (id: string) => {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (error) {
      console.error('Erro ao deletar nota:', error);
      throw error;
    }
  },

  togglePin: async (id: string, currentPinned: boolean) => {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        pinned: !currentPinned,
        atualizadoEm: serverTimestamp(),
      });
    } catch (error) {
      console.error('Erro ao alternar pin:', error);
      throw error;
    }
  },

  addTodoItem: async (notaId: string, texto: string) => {
    try {
      const nota = cachedNotas?.find((n) => n.id === notaId);
      const newTodo: TodoItem = {
        id: `todo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        texto,
        status: 'pendente',
        criadoEm: new Date(),
      };
      const todos = [...(nota?.todos || []), newTodo];
      await updateDoc(doc(db, COLLECTION_NAME, notaId), {
        todos,
        atualizadoEm: serverTimestamp(),
      });
    } catch (error) {
      console.error('Erro ao adicionar item de todo:', error);
      throw error;
    }
  },

  toggleTodoItem: async (notaId: string, todoId: string, currentStatus: TodoStatus) => {
    try {
      const nota = cachedNotas?.find((n) => n.id === notaId);
      if (!nota?.todos) return;
      const todos = nota.todos.map((t) =>
        t.id === todoId
          ? { ...t, status: currentStatus === 'pendente' ? ('feito' as TodoStatus) : ('pendente' as TodoStatus) }
          : t,
      );
      await updateDoc(doc(db, COLLECTION_NAME, notaId), {
        todos,
        atualizadoEm: serverTimestamp(),
      });
    } catch (error) {
      console.error('Erro ao alternar item de todo:', error);
      throw error;
    }
  },

  deleteTodoItem: async (notaId: string, todoId: string) => {
    try {
      const nota = cachedNotas?.find((n) => n.id === notaId);
      if (!nota?.todos) return;
      const todos = nota.todos.filter((t) => t.id !== todoId);
      await updateDoc(doc(db, COLLECTION_NAME, notaId), {
        todos,
        atualizadoEm: serverTimestamp(),
      });
    } catch (error) {
      console.error('Erro ao deletar item de todo:', error);
      throw error;
    }
  },
};

export const notasService =
  process.env.NEXT_PUBLIC_USE_MOCKS === 'true' ? mockNotasService : realNotasService;
