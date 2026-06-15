'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { notasService } from '../services/notasService';
import { Nota, NotaType, TodoStatus } from '../types';
import { getIsHydrated } from '@/utils/hydration';

const SEARCH_DEBOUNCE_MS = 300;

const toMs = (ts: unknown): number => {
  if (!ts) return 0;
  if (ts instanceof Date) return ts.getTime();
  if (typeof ts === 'string') return new Date(ts).getTime();
  if (typeof ts === 'object' && ts !== null && 'seconds' in ts)
    return (ts as { seconds: number }).seconds * 1000;
  return 0;
};

export function useNotas() {
  const [notas, setNotas] = useState<Nota[]>(() => {
    if (typeof window !== 'undefined' && getIsHydrated()) {
      return (notasService as { getCachedNotas?: () => Nota[] | null }).getCachedNotas?.() || [];
    }
    return [];
  });

  const [loading, setLoading] = useState(() => {
    if (typeof window !== 'undefined' && getIsHydrated()) {
      return (notasService as { getCachedNotas?: () => Nota[] | null }).getCachedNotas?.() === null;
    }
    return true;
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<NotaType | 'Todas'>('Todas');
  // 'Todos' = sem filtro; '' = sem cômodo vinculado (Nenhum); 'id' = cômodo específico
  const [filtroAmbiente, setFiltroAmbiente] = useState<string | 'Todos'>('Todos');

  useEffect(() => {
    const unsubscribe = notasService.subscribeToNotas(
      (notaList) => {
        setNotas(notaList);
        setLoading(false);
      },
      (error) => {
        console.error('Erro ao carregar notas:', error);
        setLoading(false);
      },
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filteredNotas = useMemo(() => {
    const filtered = notas.filter((nota) => {
      const search = debouncedSearch.toLowerCase();
      const matchSearch =
        !search ||
        nota.titulo.toLowerCase().includes(search) ||
        (nota.conteudo?.toLowerCase().includes(search) ?? false);
      const matchTipo = filtroTipo === 'Todas' || nota.tipo === filtroTipo;
      // '' = mostrar notas sem cômodo vinculado
      const matchAmbiente =
        filtroAmbiente === 'Todos'
          ? true
          : filtroAmbiente === ''
            ? !nota.linkedAmbiente
            : nota.linkedAmbiente === filtroAmbiente;
      return matchSearch && matchTipo && matchAmbiente;
    });

    return filtered.sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return toMs(b.atualizadoEm) - toMs(a.atualizadoEm);
    });
  }, [notas, debouncedSearch, filtroTipo, filtroAmbiente]);

  const hasActiveFilters =
    searchTerm !== '' || filtroTipo !== 'Todas' || filtroAmbiente !== 'Todos';

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setDebouncedSearch('');
    setFiltroTipo('Todas');
    setFiltroAmbiente('Todos');
  }, []);

  const handleSaveNota = async (
    data: Omit<Nota, 'id' | 'criadoEm' | 'atualizadoEm'>,
    id?: string,
  ) => {
    if (id) {
      await notasService.updateNota(id, data);
    } else {
      await notasService.addNota(data);
    }
  };

  const handleDeleteNota = async (id: string) => {
    await notasService.deleteNota(id);
  };

  const handleTogglePin = async (id: string, pinned: boolean) => {
    await notasService.togglePin(id, pinned);
  };

  const handleToggleTodo = async (notaId: string, todoId: string, status: TodoStatus) => {
    await notasService.toggleTodoItem(notaId, todoId, status);
  };

  const handleAddTodoItem = async (notaId: string, texto: string) => {
    await notasService.addTodoItem(notaId, texto);
  };

  const handleDeleteTodoItem = async (notaId: string, todoId: string) => {
    await notasService.deleteTodoItem(notaId, todoId);
  };

  return {
    notas: filteredNotas,
    loading,
    searchTerm,
    setSearchTerm,
    filtroTipo,
    setFiltroTipo,
    filtroAmbiente,
    setFiltroAmbiente,
    hasActiveFilters,
    clearFilters,
    handleSaveNota,
    handleDeleteNota,
    handleTogglePin,
    handleToggleTodo,
    handleAddTodoItem,
    handleDeleteTodoItem,
  };
}
