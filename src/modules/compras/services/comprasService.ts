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
import { createLogger, generateCorrelationId } from '@/utils/logger';

const logger = createLogger('ComprasService');

const COLLECTION_NAME = 'compras';

const stripUndefined = <T extends object>(obj: T): Partial<T> =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as Partial<T>;

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

let cachedItems: CompraItem[] | null = null;

const realComprasService = {
  getCachedItems: () => cachedItems,

  subscribeToItems: (
    callback: (items: CompraItem[]) => void,
    onError?: (error: Error) => void,
  ) => {
    const subscriptionId = generateCorrelationId();

    if (cachedItems) {
      logger.debug('Assinar', 'Cache disponível — transmitindo itens em cache imediatamente', {
        correlationId: subscriptionId,
        data: { total: cachedItems.length },
      });
      callback(cachedItems);
    } else {
      logger.debug('Assinar', 'Cache indisponível — aguardando snapshot do Firestore', {
        correlationId: subscriptionId,
      });
    }

    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    logger.info('Assinar', 'Abrindo assinatura em tempo real no Firestore', {
      correlationId: subscriptionId,
      data: { colecao: COLLECTION_NAME },
    });

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as CompraItem[];
        cachedItems = items;
        logger.debug('Assinar', 'Snapshot recebido — cache atualizado', {
          correlationId: subscriptionId,
          data: { total: items.length, doCache: snapshot.metadata.fromCache },
        });
        callback(items);
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

  addItem: async (
    item: Omit<CompraItem, 'id' | 'createdAt' | 'updatedAt'>,
    correlationId?: string,
  ) => {
    const cid = correlationId ?? generateCorrelationId();
    const timer = logger.startTimer(
      'AdicionarItem',
      `Enviando novo item "${item.nome}" para o Firestore`,
      cid,
    );
    try {
      const payload = {
        ...stripUndefined(normalizeAcquisitionState(item)),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      logger.debug('AdicionarItem', 'Payload preparado', {
        correlationId: cid,
        data: {
          nome: item.nome,
          ambiente: item.ambiente,
          categoria: item.categoria,
          prioridade: item.prioridade,
          quantidade: item.quantidade,
        },
      });
      const docRef = await addDoc(collection(db, COLLECTION_NAME), payload);
      timer.concluido(`Item criado com id "${docRef.id}"`, { id: docRef.id, nome: item.nome });
      return docRef.id;
    } catch (error) {
      timer.falhou(`Falha ao criar item "${item.nome}"`, error);
      throw error;
    }
  },

  toggleAdquirido: async (id: string, currentStatus: boolean, correlationId?: string) => {
    const cid = correlationId ?? generateCorrelationId();
    const nextStatus = !currentStatus;
    const timer = logger.startTimer(
      'AlternarAdquirido',
      `Alternando status de adquirido para o item "${id}" → ${nextStatus}`,
      cid,
    );
    try {
      await updateDoc(doc(db, COLLECTION_NAME, id), {
        adquirido: nextStatus,
        prioridade: getToggledPrioridade(nextStatus),
        updatedAt: serverTimestamp(),
      });
      timer.concluido('Status de adquirido atualizado', { id, adquirido: nextStatus });
    } catch (error) {
      timer.falhou(`Falha ao alternar status de adquirido para o item "${id}"`, error);
      throw error;
    }
  },

  updateItem: async (id: string, data: Partial<CompraItem>, correlationId?: string) => {
    const cid = correlationId ?? generateCorrelationId();
    const timer = logger.startTimer('AtualizarItem', `Atualizando item "${id}"`, cid);
    try {
      logger.debug('AtualizarItem', 'Enviando payload de atualização para o Firestore', {
        correlationId: cid,
        data: {
          id,
          campos: Object.keys(data).filter((k) => k !== 'id'),
        },
      });
      await updateDoc(doc(db, COLLECTION_NAME, id), {
        ...stripUndefined(normalizeAcquisitionState(data)),
        updatedAt: serverTimestamp(),
      });
      timer.concluido(`Item "${id}" atualizado com sucesso`);
    } catch (error) {
      timer.falhou(`Falha ao atualizar item "${id}"`, error);
      throw error;
    }
  },

  deleteItem: async (id: string, correlationId?: string) => {
    const cid = correlationId ?? generateCorrelationId();
    const timer = logger.startTimer('ExcluirItem', `Excluindo item "${id}" do Firestore`, cid);
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
      timer.concluido(`Item "${id}" excluído permanentemente`);
    } catch (error) {
      timer.falhou(`Falha ao excluir item "${id}"`, error);
      throw error;
    }
  },
};

export const comprasService =
  process.env.NEXT_PUBLIC_USE_MOCKS === 'true' ? mockComprasService : realComprasService;
