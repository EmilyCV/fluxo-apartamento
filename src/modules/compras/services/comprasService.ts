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
    Timestamp
} from "firebase/firestore";
import { db } from "@/shared/lib/firebase";
import { CompraItem } from "../types";

const COLLECTION_NAME = "compras";

export const comprasService = {
    /**
     * Escuta em tempo real a lista de compras
     */
    subscribeToItems: (callback: (items: CompraItem[]) => void, onError?: (error: any) => void) => {
        const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
        
        return onSnapshot(q, 
            (snapshot) => {
                const items = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as CompraItem[];
                callback(items);
            },
            (error) => {
                console.error("Erro ao assinar itens:", error);
                if (onError) onError(error);
            }
        );
    },

    /**
     * Adiciona um novo item
     */
    addItem: async (item: Omit<CompraItem, "id" | "createdAt" | "updatedAt">) => {
        try {
            const docRef = await addDoc(collection(db, COLLECTION_NAME), {
                ...item,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            return docRef.id;
        } catch (error) {
            console.error("Erro ao adicionar item:", error);
            throw error;
        }
    },

    /**
     * Atualiza o status de adquirido (toggle)
     */
    toggleAdquirido: async (id: string, currentStatus: boolean) => {
        try {
            const docRef = doc(db, COLLECTION_NAME, id);
            await updateDoc(docRef, {
                adquirido: !currentStatus,
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            console.error("Erro ao atualizar status:", error);
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
                ...data,
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            console.error("Erro ao atualizar item:", error);
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
            console.error("Erro ao deletar item:", error);
            throw error;
        }
    }
};
