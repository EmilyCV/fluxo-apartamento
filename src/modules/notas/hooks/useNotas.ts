'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { notasService } from '../services/notasService';
import { Nota, NotaType, TodoStatus } from '../types';
import { getIsHydrated } from '@/utils/hydration';
import { createLogger, generateCorrelationId } from '@/utils/logger';

const logger = createLogger('useNotas');

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
      return (
        (notasService as { getCachedNotas?: () => Nota[] | null }).getCachedNotas?.() || []
      );
    }
    return [];
  });

  const [loading, setLoading] = useState(() => {
    if (typeof window !== 'undefined' && getIsHydrated()) {
      return (
        (notasService as { getCachedNotas?: () => Nota[] | null }).getCachedNotas?.() === null
      );
    }
    return true;
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<NotaType | 'Todas'>('Todas');
  // 'Todos' = sem filtro; '' = sem cômodo vinculado (Nenhum); 'id' = cômodo específico
  const [filtroAmbiente, setFiltroAmbiente] = useState<string | 'Todos'>('Todos');

  useEffect(() => {
    logger.debug('Assinar', 'Assinando lista de notas');

    const unsubscribe = notasService.subscribeToNotas(
      (notaList) => {
        setNotas(notaList);
        setLoading(false);
        logger.info('Assinar', 'Dados de notas recebidos', {
          data: { total: notaList.length },
        });
      },
      (error) => {
        logger.error('Assinar', 'Falha ao carregar notas', { error });
        setLoading(false);
      },
    );

    return () => {
      logger.debug('Assinar', 'Encerrando assinatura de notas');
      unsubscribe();
    };
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
    correlationId?: string,
  ) => {
    const cid = correlationId ?? generateCorrelationId();
    if (id) {
      logger.debug('SalvarNota', `Delegando atualização da nota "${id}" ao serviço`, {
        correlationId: cid,
      });
      await notasService.updateNota(id, data, cid);
    } else {
      logger.debug('SalvarNota', `Delegando criação da nota "${data.titulo}" ao serviço`, {
        correlationId: cid,
      });
      await notasService.addNota(data, cid);
    }
  };

  const handleDeleteNota = async (id: string) => {
    const correlationId = generateCorrelationId();
    logger.info('ExcluirNota', `Usuário solicitou exclusão da nota "${id}"`, { correlationId });
    await notasService.deleteNota(id, correlationId);
  };

  const handleTogglePin = async (id: string, pinned: boolean) => {
    const correlationId = generateCorrelationId();
    logger.debug('AlternarPin', `Usuário alternou pin da nota "${id}"`, { correlationId });
    await notasService.togglePin(id, pinned, correlationId);
  };

  const handleToggleTodo = async (notaId: string, todoId: string, status: TodoStatus) => {
    const correlationId = generateCorrelationId();
    await notasService.toggleTodoItem(notaId, todoId, status, correlationId);
  };

  const handleAddTodoItem = async (notaId: string, texto: string) => {
    const correlationId = generateCorrelationId();
    logger.debug('AdicionarTodo', `Usuário adicionando todo à nota "${notaId}"`, { correlationId });
    await notasService.addTodoItem(notaId, texto, correlationId);
  };

  const handleDeleteTodoItem = async (notaId: string, todoId: string) => {
    const correlationId = generateCorrelationId();
    await notasService.deleteTodoItem(notaId, todoId, correlationId);
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
