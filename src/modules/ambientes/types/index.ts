import { FirestoreTimestamp } from '@/types';

export interface HomeAmbiente {
  id: string; // ID do documento no Firestore
  ambienteId: string; // Referência ao ID no MASTER_AMBIENTES (ex: "1. Cozinha")
  ordem: number;
  createdAt?: FirestoreTimestamp;
  updatedAt?: FirestoreTimestamp;
}
