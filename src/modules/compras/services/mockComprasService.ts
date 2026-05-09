import { CompraItem } from "../types";
import { generateMockItems } from "./mockData";

const STORAGE_KEY = "mock_compras_items";

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
        const items = getStoredItems();
        callback(items);
        
        // No mock, não temos um listener real de banco, 
        // mas as funções de mutação abaixo vão disparar eventos se necessário 
        // ou o usuário pode simplesmente recarregar.
        // Para uma melhor experiência, poderíamos usar um EventEmitter.
        
        const handleStorageChange = () => {
            callback(getStoredItems());
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
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
        
        // Dispara evento local para atualizar a UI na mesma aba
        window.dispatchEvent(new Event('storage'));
        
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
        window.dispatchEvent(new Event('storage'));
    },

    updateItem: async (id: string, data: Partial<CompraItem>) => {
        const items = getStoredItems();
        const updatedItems = items.map(item => 
            item.id === id 
                ? { ...item, ...data, updatedAt: new Date().toISOString() } 
                : item
        );
        saveItems(updatedItems);
        window.dispatchEvent(new Event('storage'));
    },

    deleteItem: async (id: string) => {
        const items = getStoredItems();
        const updatedItems = items.filter(item => item.id !== id);
        saveItems(updatedItems);
        window.dispatchEvent(new Event('storage'));
    }
};
