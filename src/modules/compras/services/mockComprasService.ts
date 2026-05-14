import { CompraItem } from "../types";
import { generateMockItems } from "./mockData";

const STORAGE_KEY = "mock_compras_items";

// Adicione no topo do arquivo (fora do objeto service)
type Listener = (items: CompraItem[]) => void;
const listeners = new Set<Listener>();

const notify = () => {
    const items = getStoredItems();
    listeners.forEach((cb) => cb(items));
};

// Inicializa o localStorage se estiver vazio
const getStoredItems = (): CompraItem[] => {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    let items: CompraItem[] = [];
    if (!stored) {
        items = generateMockItems(30);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } else {
        items = JSON.parse(stored);
    }
    // Ordena por data de criação desc (mais recentes primeiro)
    return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

const saveItems = (items: CompraItem[]) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

export const mockComprasService = {
    subscribeToItems: (callback: (items: CompraItem[]) => void) => {
        // Simula o onSnapshot do Firebase
        callback(getStoredItems());  // entrega dados imediatamente
        listeners.add(callback);     // registra para updates futuros
        return () => listeners.delete(callback);  // unsubscribe
    },

    addItem: async (item: Omit<CompraItem, "id" | "createdAt" | "updatedAt">) => {
        const items = getStoredItems();
        const newItem: CompraItem = {
            ...item,
            id: `mock-${Date.now()}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        const updatedItems = [newItem, ...items];
        saveItems(updatedItems);
        
        notify();
        
        return newItem.id;
    },

    toggleAdquirido: async (id: string, currentStatus: boolean) => {
        const items = getStoredItems();
        const updatedItems = items.map(item => 
            item.id === id 
                ? { ...item, adquirido: !currentStatus, updatedAt: new Date().toISOString() } 
                : item
        );
        saveItems(updatedItems);
        notify();
    },

    updateItem: async (id: string, data: Partial<CompraItem>) => {
        const items = getStoredItems();
        const updatedItems = items.map(item => 
            item.id === id 
                ? { ...item, ...data, updatedAt: new Date().toISOString() } 
                : item
        );
        saveItems(updatedItems);
        notify();
    },

    deleteItem: async (id: string) => {
        const items = getStoredItems();
        const updatedItems = items.filter(item => item.id !== id);
        saveItems(updatedItems);
        notify();
    }
};
