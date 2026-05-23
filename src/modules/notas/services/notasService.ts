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
import { createLogger, generateCorrelationId } from '@/utils/logger';

const logger = createLogger('NotasService');

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
    const subscriptionId = generateCorrelationId();

    if (cachedNotas) {
      logger.debug('Assinar', 'Cache disponível — transmitindo notas em cache imediatamente', {
        correlationId: subscriptionId,
        data: { total: cachedNotas.length },
      });
      callback(cachedNotas);
    } else {
      logger.debug('Assinar', 'Cache indisponível — aguardando snapshot do Firestore', {
        correlationId: subscriptionId,
      });
    }

    const q = query(collection(db, COLLECTION_NAME), orderBy('atualizadoEm', 'desc'));
    logger.info('Assinar', 'Abrindo assinatura em tempo real no Firestore', {
      correlationId: subscriptionId,
      data: { colecao: COLLECTION_NAME },
    });

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const notas = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Nota[];
        cachedNotas = notas;
        logger.debug('Assinar', 'Snapshot recebido — cache atualizado', {
          correlationId: subscriptionId,
          data: { total: notas.length, doCache: snapshot.metadata.fromCache },
        });
        callback(notas);
      },
      (error) => {
        logger.error('Assinar', 'Erro na assinatura do Firestore', {
          correlationId: subscriptionId,
          error,
        });
        if (onError) onError(error);
      },
    );

    return () => {
      logger.debug('Assinar', 'Encerrando assinatura do Firestore', {
        correlationId: subscriptionId,
      });
      unsubscribe();
    };
  },

  addNota: async (nota: Omit<Nota, 'id' | 'criadoEm' | 'atualizadoEm'>, correlationId?: string) => {
    const cid = correlationId ?? generateCorrelationId();
    const timer = logger.startTimer('AdicionarNota', `Criando nota "${nota.titulo}"`, cid);
    try {
      logger.debug('AdicionarNota', 'Payload preparado', {
        correlationId: cid,
        data: { tipo: nota.tipo, cor: nota.cor, pinned: nota.pinned, criadoPorUid: nota.criadoPorUid },
      });
      const docRef = await addDoc(
        collection(db, COLLECTION_NAME),
        stripUndefined({
          ...nota,
          criadoEm: serverTimestamp(),
          atualizadoEm: serverTimestamp(),
        }),
      );
      timer.concluido(`Nota criada com id "${docRef.id}"`, { id: docRef.id, titulo: nota.titulo });
      return docRef.id;
    } catch (error) {
      timer.falhou(`Falha ao criar nota "${nota.titulo}"`, error);
      throw error;
    }
  },

  updateNota: async (id: string, data: Partial<Nota>, correlationId?: string) => {
    const cid = correlationId ?? generateCorrelationId();
    const timer = logger.startTimer('AtualizarNota', `Atualizando nota "${id}"`, cid);
    try {
      logger.debug('AtualizarNota', 'Enviando payload de atualização', {
        correlationId: cid,
        data: { id, campos: Object.keys(data).filter((k) => k !== 'id') },
      });
      await updateDoc(
        doc(db, COLLECTION_NAME, id),
        stripUndefined({ ...data, atualizadoEm: serverTimestamp() }),
      );
      timer.concluido(`Nota "${id}" atualizada com sucesso`);
    } catch (error) {
      timer.falhou(`Falha ao atualizar nota "${id}"`, error);
      throw error;
    }
  },

  deleteNota: async (id: string, correlationId?: string) => {
    const cid = correlationId ?? generateCorrelationId();
    const timer = logger.startTimer('ExcluirNota', `Excluindo nota "${id}"`, cid);
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
      timer.concluido(`Nota "${id}" excluída permanentemente`);
    } catch (error) {
      timer.falhou(`Falha ao excluir nota "${id}"`, error);
      throw error;
    }
  },

  togglePin: async (id: string, currentPinned: boolean, correlationId?: string) => {
    const cid = correlationId ?? generateCorrelationId();
    const nextPinned = !currentPinned;
    const timer = logger.startTimer(
      'AlternarPin',
      `Alternando pin da nota "${id}" → ${nextPinned}`,
      cid,
    );
    try {
      await updateDoc(doc(db, COLLECTION_NAME, id), {
        pinned: nextPinned,
        atualizadoEm: serverTimestamp(),
      });
      timer.concluido('Pin atualizado', { id, pinned: nextPinned });
    } catch (error) {
      timer.falhou(`Falha ao alternar pin da nota "${id}"`, error);
      throw error;
    }
  },

  addTodoItem: async (notaId: string, texto: string, correlationId?: string) => {
    const cid = correlationId ?? generateCorrelationId();
    logger.info('AdicionarTodo', `Adicionando todo à nota "${notaId}"`, { correlationId: cid });
    try {
      const nota = cachedNotas?.find((n) => n.id === notaId);
      const newTodo: TodoItem = {
        id: `todo-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        texto,
        status: 'pendente',
        criadoEm: new Date(),
      };
      const todos = [...(nota?.todos || []), newTodo];
      await updateDoc(doc(db, COLLECTION_NAME, notaId), {
        todos,
        atualizadoEm: serverTimestamp(),
      });
      logger.info('AdicionarTodo', 'Todo adicionado com sucesso', {
        correlationId: cid,
        data: { notaId, todoId: newTodo.id, totalTodos: todos.length },
      });
    } catch (error) {
      logger.error('AdicionarTodo', `Falha ao adicionar todo à nota "${notaId}"`, {
        correlationId: cid,
        error,
      });
      throw error;
    }
  },

  toggleTodoItem: async (
    notaId: string,
    todoId: string,
    currentStatus: TodoStatus,
    correlationId?: string,
  ) => {
    const cid = correlationId ?? generateCorrelationId();
    const nextStatus: TodoStatus = currentStatus === 'pendente' ? 'feito' : 'pendente';
    logger.debug('AlternarTodo', `Alternando todo "${todoId}" → ${nextStatus}`, {
      correlationId: cid,
      data: { notaId, todoId },
    });
    try {
      const nota = cachedNotas?.find((n) => n.id === notaId);
      if (!nota?.todos) {
        logger.warn('AlternarTodo', 'Nota não encontrada em cache — ignorando alternância', {
          correlationId: cid,
          data: { notaId, todoId },
        });
        return;
      }
      const todos = nota.todos.map((t) =>
        t.id === todoId ? { ...t, status: nextStatus } : t,
      );
      await updateDoc(doc(db, COLLECTION_NAME, notaId), {
        todos,
        atualizadoEm: serverTimestamp(),
      });
      logger.debug('AlternarTodo', 'Status do todo atualizado', {
        correlationId: cid,
        data: { notaId, todoId, status: nextStatus },
      });
    } catch (error) {
      logger.error('AlternarTodo', `Falha ao alternar todo "${todoId}"`, {
        correlationId: cid,
        error,
      });
      throw error;
    }
  },

  deleteTodoItem: async (notaId: string, todoId: string, correlationId?: string) => {
    const cid = correlationId ?? generateCorrelationId();
    logger.info('ExcluirTodo', `Removendo todo "${todoId}" da nota "${notaId}"`, {
      correlationId: cid,
    });
    try {
      const nota = cachedNotas?.find((n) => n.id === notaId);
      if (!nota?.todos) {
        logger.warn('ExcluirTodo', 'Nota não encontrada em cache — ignorando exclusão', {
          correlationId: cid,
          data: { notaId, todoId },
        });
        return;
      }
      const todos = nota.todos.filter((t) => t.id !== todoId);
      await updateDoc(doc(db, COLLECTION_NAME, notaId), {
        todos,
        atualizadoEm: serverTimestamp(),
      });
      logger.info('ExcluirTodo', 'Todo removido com sucesso', {
        correlationId: cid,
        data: { notaId, todoId, todosRestantes: todos.length },
      });
    } catch (error) {
      logger.error('ExcluirTodo', `Falha ao excluir todo "${todoId}"`, {
        correlationId: cid,
        error,
      });
      throw error;
    }
  },
};

export const notasService =
  process.env.NEXT_PUBLIC_USE_MOCKS === 'true' ? mockNotasService : realNotasService;
