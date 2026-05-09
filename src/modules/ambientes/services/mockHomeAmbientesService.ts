import { HomeAmbiente } from "../types";

const STORAGE_KEY = "mock_home_ambientes";

const getStoredCards = (): HomeAmbiente[] => {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
        const defaults: HomeAmbiente[] = [
            { id: "mock-1", ambienteId: "1. Cozinha", ordem: 1, createdAt: new Date().toISOString() },
            { id: "mock-2", ambienteId: "2. Sala", ordem: 2, createdAt: new Date().toISOString() },
            { id: "mock-3", ambienteId: "4. Banheiro", ordem: 3, createdAt: new Date().toISOString() },
        ];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
        return defaults;
    }
    return JSON.parse(stored);
};

const saveCards = (cards: HomeAmbiente[]) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
};

export const mockHomeAmbientesService = {
    subscribeToHomeAmbientes: (callback: (items: HomeAmbiente[]) => void) => {
        callback(getStoredCards());
        
        const handleStorageChange = () => {
            callback(getStoredCards());
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    },

    addToHome: async (ambienteId: string, ordem: number) => {
        const cards = getStoredCards();
        const newCard: HomeAmbiente = {
            id: `mock-card-${Date.now()}`,
            ambienteId,
            ordem,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        const updatedCards = [...cards, newCard].sort((a, b) => a.ordem - b.ordem);
        saveCards(updatedCards);
        window.dispatchEvent(new Event('storage'));
        return newCard.id;
    },

    updateHomeCard: async (id: string, data: Partial<HomeAmbiente>) => {
        const cards = getStoredCards();
        const updatedCards = cards.map(card => 
            card.id === id 
                ? { ...card, ...data, updatedAt: new Date().toISOString() } 
                : card
        ).sort((a, b) => a.ordem - b.ordem);
        saveCards(updatedCards);
        window.dispatchEvent(new Event('storage'));
    },

    removeFromHome: async (id: string) => {
        const cards = getStoredCards();
        const updatedCards = cards.filter(card => card.id !== id);
        saveCards(updatedCards);
        window.dispatchEvent(new Event('storage'));
    },

    seedInitialHomeAmbientes: async () => {
        getStoredCards(); // O getter já faz o seed se estiver vazio
    }
};
