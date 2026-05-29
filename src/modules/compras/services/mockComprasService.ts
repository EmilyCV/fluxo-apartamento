import { CompraItem } from '../types';
import { FirestoreTimestamp } from '@/types';
import { generateMockItems } from './mockData';

const STORAGE_KEY = 'mock_compras_items';

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

// Helper robusto para converter FirestoreTimestamp | string | Date para número
const toTimestamp = (ts: FirestoreTimestamp | undefined): number => {
  if (!ts) return 0;
  if (ts instanceof Date) return ts.getTime();
  if (typeof ts === 'string') return new Date(ts).getTime();
  if (typeof ts === 'object' && 'seconds' in ts) return ts.seconds * 1000;
  return 0;
};

// Adicione no topo do arquivo (fora do objeto service)
type Listener = (items: CompraItem[]) => void;
const listeners = new Set<Listener>();

const notify = () => {
  const items = getStoredItems();
  listeners.forEach((cb) => cb(items));
};

// Inicializa o localStorage se estiver vazio
const getStoredItems = (): CompraItem[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  let items: CompraItem[] = [];
  if (!stored) {
    items = generateMockItems(30);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } else {
    items = JSON.parse(stored);
  }
  // Ordena por data de criação desc (mais recentes primeiro)
  return items.sort((a, b) => toTimestamp(b.createdAt) - toTimestamp(a.createdAt));
};

const saveItems = (items: CompraItem[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

export const mockComprasService = {
  getCachedItems: () => {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  },

  subscribeToItems: (callback: (items: CompraItem[]) => void) => {
    // Simula o onSnapshot do Firebase
    callback(getStoredItems()); // entrega dados imediatamente
    listeners.add(callback); // registra para updates futuros
    return () => listeners.delete(callback); // unsubscribe
  },

  addItem: async (item: Omit<CompraItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const items = getStoredItems();
    const newItem: CompraItem = {
      ...normalizeAcquisitionState(item),
      id: `mock-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const updatedItems = [newItem, ...items];
    saveItems(updatedItems);

    notify();

    return newItem.id;
  },

  toggleAdquirido: async (id: string, currentStatus: boolean, quantidade?: number) => {
    const items = getStoredItems();
    const nextStatus = !currentStatus;
    const updatedItems = items.map((item) =>
      item.id === id
        ? {
            ...item,
            adquirido: nextStatus,
            quantidadeAdquirida: nextStatus ? (quantidade ?? 1) : 0,
            prioridade: getToggledPrioridade(nextStatus),
            updatedAt: new Date(),
          }
        : item,
    );
    saveItems(updatedItems);
    notify();
  },

  updateQuantidadeAdquirida: async (
    id: string,
    quantidadeAdquirida: number,
    quantidadeTotal: number,
  ) => {
    const items = getStoredItems();
    const adquirido = quantidadeAdquirida >= quantidadeTotal;
    const updatedItems = items.map((item) =>
      item.id === id
        ? {
            ...item,
            quantidadeAdquirida,
            adquirido,
            prioridade: adquirido
              ? 'Adquirido'
              : item.prioridade === 'Adquirido'
                ? 'Quando der'
                : (item.prioridade as CompraItem['prioridade']),
            updatedAt: new Date(),
          }
        : item,
    );
    saveItems(updatedItems);
    notify();
  },

  updateItem: async (id: string, data: Partial<CompraItem>) => {
    const items = getStoredItems();
    const updatedItems = items.map((item) =>
      item.id === id
        ? { ...item, ...normalizeAcquisitionState(data), updatedAt: new Date() }
        : item,
    );
    saveItems(updatedItems);
    notify();
  },

  deleteItem: async (id: string) => {
    const items = getStoredItems();
    const updatedItems = items.filter((item) => item.id !== id);
    saveItems(updatedItems);
    notify();
  },
};
