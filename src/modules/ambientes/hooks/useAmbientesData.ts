'use client';

import { useState, useEffect, useMemo } from 'react';
import { comprasService } from '@/modules/compras/services/comprasService';
import { CompraItem } from '@/modules/compras/types';
import { MASTER_AMBIENTES } from '../types/masterData';
import { getIsHydrated } from '@/utils/hydration';

export type AmbientesSortOrder = 'original' | 'alfabetico' | 'progresso';

export function useAmbientesData() {
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
  const [ordenacao, setOrdenacao] = useState<AmbientesSortOrder>('original');
  const [alfabeticoAsc, setAlfabeticoAsc] = useState(true);

  useEffect(() => {
    let didReceiveSync = false;

    const unsubscribe = comprasService.subscribeToItems(
      (itemList) => {
        setItems(itemList);
        setLoading(false);
        didReceiveSync = true;
      },
      (error) => {
        console.error('Erro ao carregar itens para estatísticas de ambientes:', error);
        setLoading(false);
      },
    );

    if (didReceiveSync) {
      setLoading(false);
    }

    return () => unsubscribe();
  }, []);

  const ambientesStats = useMemo(() => {
    return MASTER_AMBIENTES.map((ambienteInfo) => {
      const itemsInAmbiente = items.filter((item) => item.ambiente === ambienteInfo.id);
      const totalItemsCount = itemsInAmbiente.length;
      const completedItemsCount = itemsInAmbiente.filter((item) => item.adquirido).length;
      const percentage = totalItemsCount > 0 ? Math.round((completedItemsCount / totalItemsCount) * 100) : 0;
      const totalValueSum = itemsInAmbiente.reduce((sum, item) => sum + (item.valorTotalAproximado || 0), 0);

      return {
        ...ambienteInfo,
        totalItems: totalItemsCount,
        completedItems: completedItemsCount,
        percentage,
        totalValue: totalValueSum,
      };
    });
  }, [items]);

  const handleAlfabeticoClick = () => {
    if (ordenacao === 'alfabetico') {
      setAlfabeticoAsc((prev) => !prev);
    } else {
      setOrdenacao('alfabetico');
      setAlfabeticoAsc(true);
    }
  };

  const sortedAndFilteredAmbientes = useMemo(() => {
    let result = ambientesStats.filter((ambiente) =>
      ambiente.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (ordenacao === 'alfabetico') {
      result.sort((a, b) =>
        alfabeticoAsc
          ? a.label.localeCompare(b.label)
          : b.label.localeCompare(a.label)
      );
    } else if (ordenacao === 'progresso') {
      result.sort((a, b) => b.percentage - a.percentage);
    }

    return result;
  }, [ambientesStats, searchTerm, ordenacao, alfabeticoAsc]);

  return {
    ambientes: sortedAndFilteredAmbientes,
    loading,
    searchTerm,
    setSearchTerm,
    ordenacao,
    setOrdenacao,
    alfabeticoAsc,
    handleAlfabeticoClick,
  };
}
