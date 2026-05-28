'use client';

import { useState, useEffect, useMemo } from 'react';
import { comprasService } from '@/modules/compras/services/comprasService';
import { homeAmbientesService } from '@/modules/ambientes/services/ambientesService';
import { notasService } from '@/modules/notas/services/notasService';
import { CompraItem, Categoria } from '@/modules/compras/types';
import { HomeAmbiente } from '@/modules/ambientes/types';
import { Nota } from '@/modules/notas/types';
import { getIsHydrated } from '@/utils/hydration';

const CATEGORIA_METRICS = [
  { label: 'Reforma', key: '1. Reforma' as Categoria, color: 'bg-purple-400' },
  { label: 'Eletros', key: '2. Eletros' as Categoria, color: 'bg-blue-400' },
  { label: 'Utensílios', key: '3. Utensílios' as Categoria, color: 'bg-green-400' },
  { label: 'Enxoval', key: '4. Enxoval' as Categoria, color: 'bg-pink-400' },
];

export function useDashboardData() {
  const [items, setItems] = useState<CompraItem[]>(() => {
    if (typeof window !== 'undefined' && getIsHydrated()) {
      return (comprasService as any).getCachedItems?.() || [];
    }
    return [];
  });
  const [homeAmbientes, setHomeAmbientes] = useState<HomeAmbiente[]>(() => {
    if (typeof window !== 'undefined' && getIsHydrated()) {
      return (homeAmbientesService as any).getCachedHomeAmbientes?.() || [];
    }
    return [];
  });
  const [loading, setLoading] = useState(() => {
    if (typeof window !== 'undefined' && getIsHydrated()) {
      return (comprasService as any).getCachedItems?.() === null;
    }
    return true;
  });
  const [homeAmbientesLoading, setHomeAmbientesLoading] = useState(() => {
    if (typeof window !== 'undefined' && getIsHydrated()) {
      return (homeAmbientesService as any).getCachedHomeAmbientes?.() === null;
    }
    return true;
  });
  const [notasRecentes, setNotasRecentes] = useState<Nota[]>(() => {
    if (typeof window !== 'undefined' && getIsHydrated()) {
      const cached = (notasService as any).getCachedNotas?.() as Nota[] | null;
      return cached ? cached.slice(0, 3) : [];
    }
    return [];
  });
  const [notasLoading, setNotasLoading] = useState(() => {
    if (typeof window !== 'undefined' && getIsHydrated()) {
      return (notasService as any).getCachedNotas?.() === null;
    }
    return true;
  });

  useEffect(() => {
    const initializeHome = async () => {
      try {
        await homeAmbientesService.seedInitialHomeAmbientes();
      } catch (error) {
        console.error('Erro ao inicializar ambientes:', error);
      }
    };

    initializeHome();

    let itemsSync = false;
    let homeSync = false;

    const unsubscribeItems = comprasService.subscribeToItems((itemList) => {
      setItems(itemList);
      setLoading(false);
      itemsSync = true;
    });

    const unsubscribeHomeAmbientes = homeAmbientesService.subscribeToHomeAmbientes((homeList) => {
      setHomeAmbientes(homeList);
      setHomeAmbientesLoading(false);
      homeSync = true;
    });

    const unsubscribeNotas = notasService.subscribeToNotas((notaList) => {
      const sorted = [...notaList].sort((a, b) => {
        const toMs = (ts: unknown): number => {
          if (!ts) return 0;
          if (ts instanceof Date) return ts.getTime();
          if (typeof ts === 'string') return new Date(ts).getTime();
          if (typeof ts === 'object' && ts !== null && 'seconds' in ts)
            return (ts as { seconds: number }).seconds * 1000;
          return 0;
        };
        return toMs(b.atualizadoEm) - toMs(a.atualizadoEm);
      });
      setNotasRecentes(sorted.slice(0, 3));
      setNotasLoading(false);
    });

    if (itemsSync) setLoading(false);
    if (homeSync) setHomeAmbientesLoading(false);

    return () => {
      unsubscribeItems();
      unsubscribeHomeAmbientes();
      unsubscribeNotas();
    };
  }, []);

  const totalInvestido = useMemo(
    () =>
      items.reduce((total, item) => {
        const qtdAdquirida = item.quantidadeAdquirida ?? (item.adquirido ? item.quantidade : 0);
        const proporcao = item.quantidade > 0 ? qtdAdquirida / item.quantidade : 0;
        return total + (item.valorTotalAproximado || 0) * proporcao;
      }, 0),
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
          .filter((item) => item.categoria === categoriaInfo.key)
          .reduce((total, item) => {
            const qtdAdquirida = item.quantidadeAdquirida ?? (item.adquirido ? item.quantidade : 0);
            const proporcao = item.quantidade > 0 ? qtdAdquirida / item.quantidade : 0;
            return total + (item.valorTotalAproximado || 0) * proporcao;
          }, 0),
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
    loading,
    homeAmbientesLoading,
    notasRecentes,
    notasLoading,
    totalInvestido,
    totalOrcado,
    percentualProgresso,
    breakdownCategoria,
    handleSaveItem,
    handleSaveHomeAmbiente,
    handleRemoveFromHome,
  };
}
