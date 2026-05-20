import { Nota, TodoItem, TodoStatus } from '../types';

const STORAGE_KEY = 'mock_notas';

const toTimestamp = (ts: unknown): number => {
  if (!ts) return 0;
  if (ts instanceof Date) return ts.getTime();
  if (typeof ts === 'string') return new Date(ts).getTime();
  if (typeof ts === 'object' && ts !== null && 'seconds' in ts)
    return (ts as { seconds: number }).seconds * 1000;
  return 0;
};

type Listener = (notas: Nota[]) => void;
const listeners = new Set<Listener>();

const SEED_NOTAS: Nota[] = [
  {
    id: 'mock-nota-1',
    tipo: 'nota',
    titulo: 'Referências de decoração',
    conteudo:
      'Inspirações para o apê: estilo escandinavo com toques brasileiros. Paleta neutra com acentos de verde e madeira natural. Refs: Pinterest "apê minimalista" e Tok&Stok coleção 2026.',
    cor: 'pink',
    pinned: true,
    criadoPor: 'Usuário Convidado',
    criadoPorUid: 'mock-user-id',
    atualizadoPor: 'Usuário Convidado',
    criadoEm: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    atualizadoEm: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'mock-nota-2',
    tipo: 'todo',
    titulo: 'Checklist da mudança',
    todos: [
      {
        id: 'todo-seed-1',
        texto: 'Contratar empresa de mudança',
        status: 'feito',
        criadoEm: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'todo-seed-2',
        texto: 'Embalar louças com cuidado',
        status: 'pendente',
        criadoEm: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'todo-seed-3',
        texto: 'Fotografar itens eletrônicos antes de empacotar',
        status: 'pendente',
        criadoEm: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
    ],
    cor: 'green',
    pinned: false,
    criadoPor: 'Usuário Convidado',
    criadoPorUid: 'mock-user-id',
    atualizadoPor: 'Usuário Convidado',
    criadoEm: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    atualizadoEm: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'mock-nota-3',
    tipo: 'nota',
    titulo: 'Medidas do apartamento',
    conteudo:
      'Sala: 4,2m × 5,8m\nCozinha: 2,8m × 3,5m\nQuarto: 3,2m × 4,0m\nBanheiro: 2,0m × 2,5m\nVaranda: 1,5m × 3,0m',
    cor: 'blue',
    pinned: false,
    linkedAmbiente: '1. Cozinha',
    criadoPor: 'Usuário Convidado',
    criadoPorUid: 'mock-user-id',
    atualizadoPor: 'Usuário Convidado',
    criadoEm: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    atualizadoEm: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
];

const getStoredNotas = (): Nota[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_NOTAS));
    return SEED_NOTAS;
  }
  const notas: Nota[] = JSON.parse(stored);
  return notas.sort((a, b) => toTimestamp(b.atualizadoEm) - toTimestamp(a.atualizadoEm));
};

const saveNotas = (notas: Nota[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notas));
};

const notify = () => {
  const notas = getStoredNotas();
  listeners.forEach((cb) => cb(notas));
};

export const mockNotasService = {
  getCachedNotas: (): Nota[] | null => {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as Nota[]) : null;
  },

  subscribeToNotas: (callback: (notas: Nota[]) => void) => {
    callback(getStoredNotas());
    listeners.add(callback);
    return () => listeners.delete(callback);
  },

  addNota: async (nota: Omit<Nota, 'id' | 'criadoEm' | 'atualizadoEm'>) => {
    const notas = getStoredNotas();
    const newNota: Nota = {
      ...nota,
      id: `mock-nota-${Date.now()}`,
      criadoEm: new Date(),
      atualizadoEm: new Date(),
    };
    saveNotas([newNota, ...notas]);
    notify();
    return newNota.id;
  },

  updateNota: async (id: string, data: Partial<Nota>) => {
    const notas = getStoredNotas();
    const updated = notas.map((n) =>
      n.id === id ? { ...n, ...data, atualizadoEm: new Date() } : n,
    );
    saveNotas(updated);
    notify();
  },

  deleteNota: async (id: string) => {
    const notas = getStoredNotas();
    saveNotas(notas.filter((n) => n.id !== id));
    notify();
  },

  togglePin: async (id: string, currentPinned: boolean) => {
    const notas = getStoredNotas();
    const updated = notas.map((n) =>
      n.id === id ? { ...n, pinned: !currentPinned, atualizadoEm: new Date() } : n,
    );
    saveNotas(updated);
    notify();
  },

  addTodoItem: async (notaId: string, texto: string) => {
    const notas = getStoredNotas();
    const newTodo: TodoItem = {
      id: `todo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      texto,
      status: 'pendente',
      criadoEm: new Date(),
    };
    const updated = notas.map((n) =>
      n.id === notaId
        ? { ...n, todos: [...(n.todos || []), newTodo], atualizadoEm: new Date() }
        : n,
    );
    saveNotas(updated);
    notify();
  },

  toggleTodoItem: async (notaId: string, todoId: string, currentStatus: TodoStatus) => {
    const notas = getStoredNotas();
    const updated = notas.map((n) =>
      n.id === notaId
        ? {
            ...n,
            todos: (n.todos || []).map((t) =>
              t.id === todoId
                ? {
                    ...t,
                    status: currentStatus === 'pendente' ? ('feito' as TodoStatus) : ('pendente' as TodoStatus),
                  }
                : t,
            ),
            atualizadoEm: new Date(),
          }
        : n,
    );
    saveNotas(updated);
    notify();
  },

  deleteTodoItem: async (notaId: string, todoId: string) => {
    const notas = getStoredNotas();
    const updated = notas.map((n) =>
      n.id === notaId
        ? {
            ...n,
            todos: (n.todos || []).filter((t) => t.id !== todoId),
            atualizadoEm: new Date(),
          }
        : n,
    );
    saveNotas(updated);
    notify();
  },
};
