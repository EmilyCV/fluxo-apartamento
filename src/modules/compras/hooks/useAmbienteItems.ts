'use client';

import { useState, useEffect, useMemo } from 'react';
import { comprasService } from '../services/comprasService';
import { CompraItem, Ambiente } from '../types';
import { PRIORIDADE_ORDER } from '../constants';

export type SortOrder = 'recentes' | 'prioridade' | 'alfabetico' | 'preco';

export function useAmbienteItems(ambienteId: Ambiente) {
  const [items, setItems] = useState<CompraItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordenacao, setOrdenacao] = useState<SortOrder>('recentes');
  const [alfabeticoAsc, setAlfabeticoAsc] = useState(true);
  const [precoAsc, setPrecoAsc] = useState(true);

  useEffect(() => {
    const unsubscribe = comprasService.subscribeToItems((itemList) => {
      const filtered = itemList.filter((item) => item.ambiente === ambienteId);
      setItems(filtered);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [ambienteId]);

  const handleSaveItem = async (
    itemData: Omit<CompraItem, 'id' | 'createdAt' | 'updatedAt'>,
    id?: string,
  ) => {
    if (id) await comprasService.updateItem(id, itemData);
    else await comprasService.addItem(itemData);
  };

  const toggleAdquirido = async (id: string, currentStatus: boolean) => {
    await comprasService.toggleAdquirido(id, currentStatus);
  };

  const handleAlfabetico = () => {
    if (ordenacao === 'alfabetico') {
      setAlfabeticoAsc((prevStatus) => !prevStatus);
    } else {
      setOrdenacao('alfabetico');
      setAlfabeticoAsc(true);
    }
  };

  const handlePreco = () => {
    if (ordenacao === 'preco') {
      setPrecoAsc((prevStatus) => !prevStatus);
    } else {
      setOrdenacao('preco');
      setPrecoAsc(true);
    }
  };

  const sortedItems = useMemo(() => {
    const itemsToSort = [...items];

    if (ordenacao === 'alfabetico') {
      return itemsToSort.sort((firstItem, secondItem) =>
        alfabeticoAsc
          ? firstItem.nome.localeCompare(secondItem.nome)
          : secondItem.nome.localeCompare(firstItem.nome),
      );
    }

    if (ordenacao === 'preco') {
      return itemsToSort.sort((firstItem, secondItem) =>
        precoAsc
          ? (firstItem.valorTotalAproximado || 0) - (secondItem.valorTotalAproximado || 0)
          : (secondItem.valorTotalAproximado || 0) - (firstItem.valorTotalAproximado || 0),
      );
    }

    if (ordenacao === 'prioridade') {
      return itemsToSort.sort(
        (firstItem, secondItem) =>
          PRIORIDADE_ORDER.indexOf(firstItem.prioridade) -
          PRIORIDADE_ORDER.indexOf(secondItem.prioridade),
      );
    }

    return itemsToSort; // 'recentes'
  }, [items, ordenacao, alfabeticoAsc, precoAsc]);

  const totalInvestido = items.reduce(
    (total, currentItem) => total + (currentItem.valorTotalAproximado || 0),
    0,
  );
  const totalComprado = items
    .filter((item) => item.adquirido)
    .reduce((total, currentItem) => total + (currentItem.valorTotalAproximado || 0), 0);

  return {
    items: sortedItems,
    loading,
    ordenacao,
    setOrdenacao,
    alfabeticoAsc,
    precoAsc,
    handleSaveItem,
    toggleAdquirido,
    handleAlfabetico,
    handlePreco,
    totalInvestido,
    totalComprado,
  };
}
