import { FirestoreTimestamp } from '@/types';

export type Ambiente =
  | '1. Cozinha'
  | '2. Sala'
  | '3. Varanda'
  | '4. Banheiro'
  | '5. Escritório'
  | '6. Quarto'
  | '7. Gerais';

export type Categoria = '1. Reforma' | '2. Eletros' | '3. Utensílios' | '4. Enxoval';

export type SubCategoria =
  // Reforma
  | 'Móveis planejados'
  | 'Móveis convencionais'
  | 'Materiais'
  // Eletros
  | 'Eletrodomésticos'
  | 'Eletroportáteis'
  // Utensílios
  | 'Utensílios cozinha'
  | 'Utensílios limpeza'
  | 'Utensílios gerais'
  | 'Utensílios higiene'
  // Enxoval
  | 'Casa e banho'
  | 'Cama';

export type Prioridade =
  | 'Comprar agora'
  | 'Quando der'
  | 'Pode esperar'
  | 'Aguardando projeto'
  | 'Adquirido';

export interface CompraItem {
  id: string;
  ambiente: Ambiente;
  nome: string;
  modelo?: string;
  fabricante?: string;
  quantidade: number;
  valorUnitario: number;
  valorTotalAproximado: number;
  categoria: Categoria;
  subCategoria: SubCategoria;
  adquirido: boolean;
  prioridade: Prioridade;
  link?: string;
  observacoes?: string;
  createdAt?: FirestoreTimestamp; // Timestamp do Firestore
  updatedAt?: FirestoreTimestamp;
}
