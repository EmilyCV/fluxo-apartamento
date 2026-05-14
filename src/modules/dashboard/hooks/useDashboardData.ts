'use client';

import { useState, useEffect, useMemo } from 'react';
import { comprasService } from '@/modules/compras/services/comprasService';
import { homeAmbientesService } from '@/modules/ambientes/services/ambientesService';
import { CompraItem, Categoria } from '@/modules/compras/types';
import { HomeAmbiente } from '@/modules/ambientes/types';

const CATEGORIA_METRICS = [
  { label: 'Reforma', key: '1. Reforma' as Categoria, color: 'bg-purple-400' },
  { label: 'Eletros', key: '2. Eletros' as Categoria, color: 'bg-blue-400' },
  { label: 'Utensílios', key: '3. Utensílios' as Categoria, color: 'bg-green-400' },
  { label: 'Enxoval', key: '4. Enxoval' as Categoria, color: 'bg-pink-400' },
];

export function useDashboardData() {
  const [items, setItems] = useState<CompraItem[]>([]);
  const [homeAmbientes, setHomeAmbientes] = useState<HomeAmbiente[]>([]);
  const [loading, setLoading] = useState(true);
  const [homeAmbientesLoading, setHomeAmbientesLoading] = useState(true);

  useEffect(() => {
    const initializeHome = async () => {
      try {
        await homeAmbientesService.seedInitialHomeAmbientes();
      } catch (error) {
        console.error('Erro ao inicializar ambientes:', error);
      }
    };

    initializeHome();

    const unsubscribeItems = comprasService.subscribeToItems((itemList) => {
      setItems(itemList);
      setLoading(false);
    });

    const unsubscribeHomeAmbientes = homeAmbientesService.subscribeToHomeAmbientes((homeList) => {
      setHomeAmbientes(homeList);
      setHomeAmbientesLoading(false);
    });

    return () => {
      unsubscribeItems();
      unsubscribeHomeAmbientes();
    };
  }, []);

  const totalInvestido = useMemo(
    () =>
      items
        .filter((item) => item.adquirido)
        .reduce((total, currentItem) => total + (currentItem.valorTotalAproximado || 0), 0),
    [items],
  );

  const totalOrcado = useMemo(
    () => items.reduce((total, currentItem) => total + (currentItem.valorTotalAproximado || 0), 0),
    [items],
  );

  const percentualProgresso =
    totalOrcado > 0 ? Math.round((totalInvestido / totalOrcado) * 100) : 0;

  const breakdownCategoria = useMemo(
    () =>
      CATEGORIA_METRICS.map((categoriaInfo) => ({
        ...categoriaInfo,
        total: items
          .filter((item) => item.categoria === categoriaInfo.key)
          .reduce((total, item) => total + (item.valorTotalAproximado || 0), 0),
        adquirido: items
          .filter((item) => item.categoria === categoriaInfo.key && item.adquirido)
          .reduce((total, item) => total + (item.valorTotalAproximado || 0), 0),
      })),
    [items],
  );

  const handleSaveItem = async (
    itemData: Omit<CompraItem, 'id' | 'createdAt' | 'updatedAt'>,
    id?: string,
  ) => {
    if (id) await comprasService.updateItem(id, itemData);
    else await comprasService.addItem(itemData);
  };

  const handleSaveHomeAmbiente = async (
    ambienteId: string,
    ordem: number,
    editingCardId?: string,
  ) => {
    if (editingCardId) {
      await homeAmbientesService.updateHomeCard(editingCardId, { ambienteId, ordem });
    } else {
      await homeAmbientesService.addToHome(ambienteId, ordem);
    }
  };

  const handleRemoveFromHome = async (id: string) => {
    await homeAmbientesService.removeFromHome(id);
  };

  return {
    items,
    homeAmbientes,
    loading: loading || homeAmbientesLoading,
    totalInvestido,
    totalOrcado,
    percentualProgresso,
    breakdownCategoria,
    handleSaveItem,
    handleSaveHomeAmbiente,
    handleRemoveFromHome,
  };
}
