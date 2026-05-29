import { HomeAmbiente } from '../types';

const STORAGE_KEY = 'mock_home_ambientes';

// Adicione no topo do arquivo (fora do objeto service)
type Listener = (items: HomeAmbiente[]) => void;
const listeners = new Set<Listener>();

const notify = () => {
  const cards = getStoredCards();
  listeners.forEach((cb) => cb(cards));
};

const getStoredCards = (): HomeAmbiente[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    const defaults: HomeAmbiente[] = [
      { id: 'mock-1', ambienteId: '1. Cozinha', ordem: 1, createdAt: new Date() },
      { id: 'mock-2', ambienteId: '2. Sala', ordem: 2, createdAt: new Date() },
      { id: 'mock-3', ambienteId: '4. Banheiro', ordem: 3, createdAt: new Date() },
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
    return defaults;
  }
  return JSON.parse(stored);
};

const saveCards = (cards: HomeAmbiente[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
};

export const mockHomeAmbientesService = {
  getCachedHomeAmbientes: () => {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  },

  subscribeToHomeAmbientes: (callback: (items: HomeAmbiente[]) => void) => {
    callback(getStoredCards());
    listeners.add(callback);
    return () => listeners.delete(callback);
  },

  addToHome: async (ambienteId: string, ordem: number) => {
    const cards = getStoredCards();
    const newCard: HomeAmbiente = {
      id: `mock-card-${Date.now()}`,
      ambienteId,
      ordem,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const updatedCards = [...cards, newCard].sort((a, b) => a.ordem - b.ordem);
    saveCards(updatedCards);
    notify();
    return newCard.id;
  },

  updateHomeCard: async (id: string, data: Partial<HomeAmbiente>) => {
    const cards = getStoredCards();
    const updatedCards = cards
      .map((card) => (card.id === id ? { ...card, ...data, updatedAt: new Date() } : card))
      .sort((a, b) => a.ordem - b.ordem);
    saveCards(updatedCards);
    notify();
  },

  removeFromHome: async (id: string) => {
    const cards = getStoredCards();
    const updatedCards = cards.filter((card) => card.id !== id);
    saveCards(updatedCards);
    notify();
  },

  seedInitialHomeAmbientes: async () => {
    getStoredCards(); // O getter já faz o seed se estiver vazio
  },
};
