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
import { createLogger, generateCorrelationId } from '@/utils/logger';

const logger = createLogger('AmbientesService');

const COLLECTION_NAME = 'home_ambientes';

let cachedHomeAmbientes: HomeAmbiente[] | null = null;

const realHomeAmbientesService = {
  getCachedHomeAmbientes: () => cachedHomeAmbientes,

  subscribeToHomeAmbientes: (
    callback: (items: HomeAmbiente[]) => void,
    onError?: (error: Error) => void,
  ) => {
    const subscriptionId = generateCorrelationId();

    if (cachedHomeAmbientes) {
      logger.debug('Assinar', 'Cache disponível — transmitindo ambientes em cache imediatamente', {
        correlationId: subscriptionId,
        data: { total: cachedHomeAmbientes.length },
      });
      callback(cachedHomeAmbientes);
    } else {
      logger.debug('Assinar', 'Cache indisponível — aguardando snapshot do Firestore', {
        correlationId: subscriptionId,
      });
    }

    const q = query(collection(db, COLLECTION_NAME), orderBy('ordem', 'asc'));
    logger.info('Assinar', 'Abrindo assinatura em tempo real no Firestore', {
      correlationId: subscriptionId,
      data: { colecao: COLLECTION_NAME },
    });

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as HomeAmbiente[];
        cachedHomeAmbientes = items;
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

  addToHome: async (ambienteId: string, ordem: number, correlationId?: string) => {
    const cid = correlationId ?? generateCorrelationId();
    const timer = logger.startTimer(
      'AdicionarNaHome',
      `Adicionando ambiente "${ambienteId}" na posição ${ordem}`,
      cid,
    );
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ambienteId,
        ordem,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      timer.concluido(`Ambiente "${ambienteId}" adicionado à home`, {
        id: docRef.id,
        ambienteId,
        ordem,
      });
      return docRef.id;
    } catch (error) {
      timer.falhou(`Falha ao adicionar ambiente "${ambienteId}" à home`, error);
      throw error;
    }
  },

  updateHomeCard: async (id: string, data: Partial<HomeAmbiente>, correlationId?: string) => {
    const cid = correlationId ?? generateCorrelationId();
    const timer = logger.startTimer('AtualizarCard', `Atualizando card da home "${id}"`, cid);
    try {
      await updateDoc(doc(db, COLLECTION_NAME, id), {
        ...data,
        updatedAt: serverTimestamp(),
      });
      timer.concluido(`Card "${id}" atualizado`, { id, campos: Object.keys(data) });
    } catch (error) {
      timer.falhou(`Falha ao atualizar card "${id}"`, error);
      throw error;
    }
  },

  removeFromHome: async (id: string, correlationId?: string) => {
    const cid = correlationId ?? generateCorrelationId();
    const timer = logger.startTimer('RemoverDaHome', `Removendo card da home "${id}"`, cid);
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
      timer.concluido(`Card "${id}" removido`);
    } catch (error) {
      timer.falhou(`Falha ao remover card "${id}"`, error);
      throw error;
    }
  },

  seedInitialHomeAmbientes: async () => {
    const correlationId = generateCorrelationId();

    if (typeof window !== 'undefined') {
      if (sessionStorage.getItem('home_seeded') === 'true') {
        logger.debug('SemeaduraInicial', 'Ignorando semeadura — já realizada nesta sessão', {
          correlationId,
        });
        return;
      }
    }

    logger.info('SemeaduraInicial', 'Verificando se os ambientes iniciais precisam ser criados', {
      correlationId,
    });

    const q = query(collection(db, COLLECTION_NAME), limit(1));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      const defaults = [
        { ambienteId: '1. Cozinha', ordem: 1 },
        { ambienteId: '2. Sala', ordem: 2 },
        { ambienteId: '4. Banheiro', ordem: 3 },
      ];
      logger.info('SemeaduraInicial', 'Coleção vazia — criando ambientes padrão', {
        correlationId,
        data: { ambientes: defaults.map((d) => d.ambienteId) },
      });

      for (const item of defaults) {
        await addDoc(collection(db, COLLECTION_NAME), {
          ...item,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      logger.info(
        'SemeaduraInicial',
        `Semeadura concluída — ${defaults.length} ambientes criados`,
        { correlationId },
      );
    } else {
      logger.debug('SemeaduraInicial', 'Coleção já possui dados — ignorando semeadura', {
        correlationId,
      });
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
