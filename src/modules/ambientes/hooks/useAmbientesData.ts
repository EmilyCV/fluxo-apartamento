'use client';

import { useState, useEffect, useMemo } from 'react';
import { comprasService } from '@/modules/compras/services/comprasService';
import { CompraItem } from '@/modules/compras/types';
import { MASTER_AMBIENTES } from '../types/masterData';

export function useAmbientesData() {
  const [items, setItems] = useState<CompraItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = comprasService.subscribeToItems((itemList) => {
      setItems(itemList);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const ambientesStats = useMemo(() => {
    return MASTER_AMBIENTES.map((ambienteInfo) => {
      const itemsInAmbiente = items.filter((item) => item.ambiente === ambienteInfo.id);
      const totalItemsCount = itemsInAmbiente.length;
      const completedItemsCount = itemsInAmbiente.filter((item) => item.adquirido).length;
      const percentage =
        totalItemsCount > 0 ? Math.round((completedItemsCount / totalItemsCount) * 100) : 0;
      const totalValueSum = itemsInAmbiente.reduce(
        (sum, item) => sum + (item.valorTotalAproximado || 0),
        0,
      );

      return {
        ...ambienteInfo,
        totalItems: totalItemsCount,
        completedItems: completedItemsCount,
        percentage,
        totalValue: totalValueSum,
      };
    });
  }, [items]);

  return {
    ambientes: ambientesStats,
    loading,
  };
}
