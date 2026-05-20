import { FirestoreTimestamp } from '@/types';

export type NotaType = 'nota' | 'todo';
export type NotaCor = 'pink' | 'blue' | 'green' | 'yellow' | 'purple' | 'slate';
export type TodoStatus = 'pendente' | 'feito';

export interface TodoItem {
  id: string;
  texto: string;
  status: TodoStatus;
  criadoEm: Date;
}

export interface Nota {
  id: string;
  tipo: NotaType;
  titulo: string;
  conteudo?: string;
  todos?: TodoItem[];
  cor: NotaCor;
  corCustom?: string;        // hex personalizado; substitui `cor` no display
  pinned: boolean;
  linkedAmbiente?: string;
  criadoPor: string;
  criadoPorUid: string;
  criadoEm: FirestoreTimestamp;
  atualizadoEm: FirestoreTimestamp;
  atualizadoPor: string;
}
