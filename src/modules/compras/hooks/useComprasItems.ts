'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { comprasService } from '../services/comprasService';
import { CompraItem, Ambiente, Categoria, Prioridade } from '../types';
import { getIsHydrated } from '@/utils/hydration';

export type SortOrder = 'nome-asc' | 'nome-desc' | 'preco-asc' | 'preco-desc' | 'recentes';

const SEARCH_DEBOUNCE_MS = 300;

export function useComprasItems() {
  const [items, setItems] = useState<CompraItem[]>(() => {
    if (typeof window !== 'undefined' && getIsHydrated()) {
      return (comprasService as any).getCachedItems?.() || [];
    }
    return [];
  });
  const [loading, setLoading] = useState(() => {
    if (typeof window !== 'undefined' && getIsHydrated()) {
      return (comprasService as any).getCachedItems?.() === null;
    }
    return true;
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [filtroAmbiente, setFiltroAmbiente] = useState<Ambiente | 'Todos'>('Todos');
  const [filtroCategoria, setFiltroCategoria] = useState<Categoria | 'Todas'>('Todas');
  const [filtroPrioridade, setFiltroPrioridade] = useState<Prioridade | 'Todas'>('Todas');
  const [verComprados, setVerComprados] = useState(true);
  const [ordenacao, setOrdenacao] = useState<SortOrder>('recentes');

  useEffect(() => {
    let didReceiveSync = false;

    const unsubscribe = comprasService.subscribeToItems(
      (itemList) => {
        setItems(itemList);
        setLoading(false);
        didReceiveSync = true;
      },
      (fetchError) => {
        console.error('Erro ao carregar itens de compra:', fetchError);
        setLoading(false);
      },
    );

    if (didReceiveSync) {
      setLoading(false);
    }

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        const matchSearch =
          item.nome.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          item.fabricante?.toLowerCase().includes(debouncedSearch.toLowerCase());
        const matchAmbiente = filtroAmbiente === 'Todos' || item.ambiente === filtroAmbiente;
        const matchCategoria = filtroCategoria === 'Todas' || item.categoria === filtroCategoria;
        const matchPrioridade =
          filtroPrioridade === 'Todas' || item.prioridade === filtroPrioridade;
        const matchStatus = verComprados ? true : !item.adquirido;
        return matchSearch && matchAmbiente && matchCategoria && matchPrioridade && matchStatus;
      })
      .sort((firstItem, secondItem) => {
        if (ordenacao === 'nome-asc') return firstItem.nome.localeCompare(secondItem.nome);
        if (ordenacao === 'nome-desc') return secondItem.nome.localeCompare(firstItem.nome);
        if (ordenacao === 'preco-asc')
          return (firstItem.valorTotalAproximado || 0) - (secondItem.valorTotalAproximado || 0);
        if (ordenacao === 'preco-desc')
          return (secondItem.valorTotalAproximado || 0) - (firstItem.valorTotalAproximado || 0);
        return 0;
      });
  }, [
    items,
    debouncedSearch,
    filtroAmbiente,
    filtroCategoria,
    filtroPrioridade,
    verComprados,
    ordenacao,
  ]);

  const handleSaveItem = async (
    itemData: Omit<CompraItem, 'id' | 'createdAt' | 'updatedAt'>,
    id?: string,
  ) => {
    if (id) await comprasService.updateItem(id, itemData);
    else await comprasService.addItem(itemData);
  };

  const handleQuickAdd = async (
    nome: string,
    ambiente: Ambiente,
    valor: number,
    quantidade: number,
  ) => {
    await comprasService.addItem({
      nome,
      ambiente,
      categoria: '3. Utensílios',
      subCategoria: 'Utensílios gerais',
      prioridade: 'Quando der',
      quantidade: quantidade,
      valorUnitario: valor,
      valorTotalAproximado: quantidade * valor,
      adquirido: false,
    });
  };

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setDebouncedSearch('');
    setFiltroAmbiente('Todos');
    setFiltroCategoria('Todas');
    setFiltroPrioridade('Todas');
    setVerComprados(true);
    setOrdenacao('recentes');
  }, []);

  const hasActiveFilters =
    searchTerm !== '' ||
    filtroAmbiente !== 'Todos' ||
    filtroCategoria !== 'Todas' ||
    filtroPrioridade !== 'Todas' ||
    !verComprados ||
    ordenacao !== 'recentes';

  return {
    items: filteredItems,
    totalItems: items.length,
    loading,
    searchTerm,
    setSearchTerm,
    filtroAmbiente,
    setFiltroAmbiente,
    filtroCategoria,
    setFiltroCategoria,
    filtroPrioridade,
    setFiltroPrioridade,
    verComprados,
    setVerComprados,
    ordenacao,
    setOrdenacao,
    handleSaveItem,
    handleQuickAdd,
    clearFilters,
    hasActiveFilters,
  };
}
