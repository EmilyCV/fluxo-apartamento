'use client';

import { useState, useEffect, useMemo } from 'react';
import { comprasService } from '../services/comprasService';
import { CompraItem, Ambiente } from '../types';
import { PRIORIDADE_ORDER } from '../constants';
import { getIsHydrated } from '@/utils/hydration';
import { createLogger, generateCorrelationId } from '@/utils/logger';

const logger = createLogger('useAmbienteItems');

export type SortOrder = 'recentes' | 'prioridade' | 'alfabetico' | 'preco';

export function useAmbienteItems(ambienteId: Ambiente) {
  const [items, setItems] = useState<CompraItem[]>(() => {
    if (typeof window !== 'undefined' && getIsHydrated()) {
      const cached = (comprasService as any).getCachedItems?.() || [];
      return cached.filter((item: CompraItem) => item.ambiente === ambienteId);
    }
    return [];
  });
  const [loading, setLoading] = useState(() => {
    if (typeof window !== 'undefined' && getIsHydrated()) {
      return (comprasService as any).getCachedItems?.() === null;
    }
    return true;
  });
  const [ordenacao, setOrdenacao] = useState<SortOrder>('recentes');
  const [alfabeticoAsc, setAlfabeticoAsc] = useState(true);
  const [precoAsc, setPrecoAsc] = useState(true);

  useEffect(() => {
    logger.debug('Assinar', `Assinando itens do ambiente "${ambienteId}"`);
    let didReceiveSync = false;

    const unsubscribe = comprasService.subscribeToItems((itemList) => {
      const filtered = itemList.filter((item) => item.ambiente === ambienteId);
      setItems(filtered);
      setLoading(false);
      if (!didReceiveSync) {
        logger.info('Assinar', `Dados iniciais recebidos para o ambiente "${ambienteId}"`, {
          data: { totalAmbiente: filtered.length, totalGeral: itemList.length },
        });
      }
      didReceiveSync = true;
    });

    if (didReceiveSync) {
      setLoading(false);
    }

    return () => {
      logger.debug('Assinar', `Encerrando assinatura dos itens do ambiente "${ambienteId}"`);
      unsubscribe();
    };
  }, [ambienteId]);

  const handleSaveItem = async (
    itemData: Omit<CompraItem, 'id' | 'createdAt' | 'updatedAt'>,
    id?: string,
    correlationId?: string,
  ) => {
    const cid = correlationId ?? generateCorrelationId();
    if (id) {
      await comprasService.updateItem(id, itemData, cid);
    } else {
      await comprasService.addItem(itemData, cid);
    }
  };

  const toggleAdquirido = async (id: string, currentStatus: boolean) => {
    const correlationId = generateCorrelationId();
    logger.debug('AlternarAdquirido', `Usuário alternou status de adquirido para o item "${id}"`, { correlationId });
    await comprasService.toggleAdquirido(id, currentStatus, correlationId);
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
