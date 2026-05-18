'use client';

import { useState } from 'react';
import { useAuth } from '@/modules/auth/contexts/AuthContext';
import { AppLayout } from '@/components/AppLayout';
import { CompraItem } from '@/modules/compras/types';
import { HomeAmbiente } from '@/modules/ambientes/types';
import { MASTER_AMBIENTES } from '@/modules/ambientes/types/masterData';
import {
  Wallet,
  Plus,
  ArrowUpRight,
  ShoppingCart,
  Sparkles,
  Settings2,
  Edit2,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import { ItemForm } from '@/modules/compras/ui/ItemForm';
import { AmbienteForm } from '@/modules/ambientes/ui/AmbienteForm';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useRouter } from 'next/navigation';
import { useDashboardData } from '@/modules/dashboard/hooks/useDashboardData';
import { cn } from '@/utils/cn';

export function DashboardView() {
  const { userName } = useAuth();
  const router = useRouter();

  const {
    items,
    homeAmbientes,
    loading,
    homeAmbientesLoading,
    totalInvestido,
    totalOrcado,
    percentualProgresso,
    breakdownCategoria,
    handleSaveItem,
    handleSaveHomeAmbiente,
    handleRemoveFromHome,
  } = useDashboardData();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAmbienteFormOpen, setIsAmbienteFormOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<HomeAmbiente | undefined>();
  const [isManageMode, setIsManageMode] = useState(false);

  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [cardToRemove, setCardToRemove] = useState<string | null>(null);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const onSaveItem = async (
    itemData: Omit<CompraItem, 'id' | 'createdAt' | 'updatedAt'>,
    id?: string,
  ) => {
    await handleSaveItem(itemData, id);
    setIsFormOpen(false);
  };

  const onSaveHomeAmbiente = async (ambienteId: string, ordem: number) => {
    await handleSaveHomeAmbiente(ambienteId, ordem, editingCard?.id);
    setIsAmbienteFormOpen(false);
    setEditingCard(undefined);
  };

  const handleRemoveClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setCardToRemove(id);
    setShowRemoveConfirm(true);
  };

  const confirmRemove = async () => {
    if (!cardToRemove) return;
    await handleRemoveFromHome(cardToRemove);
    setShowRemoveConfirm(false);
    setCardToRemove(null);
  };

  const handleEditCard = (e: React.MouseEvent, card: HomeAmbiente) => {
    e.stopPropagation();
    setEditingCard(card);
    setIsAmbienteFormOpen(true);
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-6 py-10 md:px-12 space-y-12">
        {/* --- HEADER --- */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 animate-pop">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-brand-pink rounded-xl flex items-center justify-center text-brand-pink-dark shadow-sm">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                Apê 2026 Home
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">
              Olá, {userName?.split(' ')[0]}! ✨
            </h1>
            <p className="text-slate-400 font-medium italic">O progresso do nosso novo lar.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsManageMode(!isManageMode)}
              className={cn(
                'w-14 h-14 rounded-2xl flex items-center justify-center transition-all',
                isManageMode
                  ? 'bg-brand-pink text-brand-pink-dark shadow-inner'
                  : 'bg-white text-slate-400 hover:text-slate-600 shadow-sm border border-slate-100',
              )}
              title="Gerenciar Cards"
            >
              <Settings2 className="w-6 h-6" />
            </button>
            <button
              onClick={() => setIsFormOpen(true)}
              className="btn-pop bg-slate-900 text-white shadow-xl shadow-slate-900/10 hover:bg-black md:w-auto px-10"
            >
              <Plus className="w-5 h-5" strokeWidth={3} />
              Novo Item
            </button>
          </div>
        </header>

        {/* --- BENTO GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
          {/* Card Financeiro Principal */}
          <div className="md:col-span-8 card-pop bg-gradient-to-br from-brand-blue-light to-white p-8 md:p-12 relative overflow-hidden flex flex-col justify-between min-h-[340px] animate-pop">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue opacity-20 rounded-full -mr-20 -mt-20 blur-3xl"></div>

            <div className="relative z-10 flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-brand-blue-dark font-black text-[10px] uppercase tracking-widest">
                  Total Investido
                </p>
                <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter">
                  {formatCurrency(totalInvestido)}
                </h2>
              </div>
              <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-sm border border-brand-blue/20">
                <Wallet className="w-8 h-8 text-brand-blue-dark" />
              </div>
            </div>

            <div className="relative z-10 mt-12 space-y-8">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
                    Orçamento Total
                  </p>
                  <p className="text-xl font-bold text-slate-600">{formatCurrency(totalOrcado)}</p>
                </div>
                <div className="text-right">
                  <p className="text-brand-blue-dark font-black text-4xl leading-none">
                    {percentualProgresso}%
                  </p>
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">
                    Concluído
                  </p>
                </div>
              </div>
              <div className="h-4 bg-slate-100 rounded-full overflow-hidden p-1 border border-white">
                <div
                  className="h-full bg-gradient-to-r from-brand-blue to-brand-green rounded-full transition-all duration-1000 ease-out shadow-sm"
                  style={{ width: `${percentualProgresso}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Stats Compacto */}
          <div className="md:col-span-4 card-pop bg-brand-pink-light border-brand-pink/20 p-8 flex flex-col justify-between min-h-[340px] animate-pop [animation-delay:100ms]">
            <div className="flex justify-between items-start">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-brand-pink-dark shadow-sm border border-brand-pink/20">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black text-brand-pink-dark uppercase tracking-widest">
                Checklist
              </span>
            </div>
            <div className="space-y-2">
              <p className="text-7xl font-black text-slate-900 tracking-tighter">
                {items.filter((item) => !item.adquirido).length}
              </p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">
                Pendentes hoje
              </p>
            </div>
            <button
              onClick={() => router.push('/compras')}
              className="w-full h-16 bg-white border border-brand-pink/30 rounded-2xl flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-widest hover:bg-brand-pink hover:text-brand-pink-dark transition-all shadow-sm active:scale-95"
            >
              Ver toda lista
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          {/* Breakdown por Categoria */}
          {items.length > 0 && (
            <div className="md:col-span-12 card-pop p-8 md:p-10 animate-pop [animation-delay:300ms]">
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8">
                Investimento por Categoria
              </h2>
              <div className="space-y-5">
                {breakdownCategoria.map((categoriaMetric) => {
                  const percentual =
                    categoriaMetric.total > 0
                      ? Math.round((categoriaMetric.adquirido / categoriaMetric.total) * 100)
                      : 0;
                  return (
                    <div key={categoriaMetric.key} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-black text-slate-700">
                          {categoriaMetric.label}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-slate-400 font-bold">
                            {formatCurrency(categoriaMetric.adquirido)} /{' '}
                            {formatCurrency(categoriaMetric.total)}
                          </span>
                          <span className="text-xs font-black text-slate-600 w-8 text-right">
                            {percentual}%
                          </span>
                        </div>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all duration-700',
                            categoriaMetric.color,
                          )}
                          style={{ width: `${percentual}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Cards de Ambientes Dinâmicos */}
          {homeAmbientesLoading ? (
            <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6 animate-pop [animation-delay:200ms]">
              {[1, 2, 3].map((skeletonIndex) => (
                <div key={skeletonIndex} className="h-48 bg-slate-100 rounded-[32px] animate-pulse" />
              ))}
            </div>
          ) : (
            <div
              className={cn(
                'md:col-span-12 grid grid-cols-1 gap-6 animate-pop [animation-delay:200ms]',
                homeAmbientes.length === 1 && 'md:grid-cols-1 max-w-2xl mx-auto w-full',
                homeAmbientes.length === 2 && 'md:grid-cols-2 max-w-5xl mx-auto w-full',
                homeAmbientes.length >= 3 && 'md:grid-cols-3',
              )}
            >
              {homeAmbientes.map((homeCard) => {
                const masterAmbiente = MASTER_AMBIENTES.find((m) => m.id === homeCard.ambienteId);
                if (!masterAmbiente) return null;

                const itemsInAmbiente = items.filter((item) => item.ambiente === homeCard.ambienteId);
                const totalItemsCount = itemsInAmbiente.length;
                const completedItemsCount = itemsInAmbiente.filter((item) => item.adquirido).length;
                const percentage =
                  totalItemsCount > 0 ? Math.round((completedItemsCount / totalItemsCount) * 100) : 0;

                return (
                  <div
                    key={homeCard.id}
                    className={cn(
                      'card-pop bg-gradient-to-br p-8 hover:scale-[1.03] cursor-pointer group relative overflow-hidden',
                      masterAmbiente.colors.gradient,
                      masterAmbiente.colors.border,
                    )}
                    onClick={() =>
                      router.push(`/ambientes/${encodeURIComponent(homeCard.ambienteId)}`)
                    }
                  >
                    {isManageMode && (
                      <div className="absolute top-4 right-4 flex gap-2 z-20">
                        <button
                          onClick={(event) => handleEditCard(event, homeCard)}
                          className="w-8 h-8 bg-white/80 backdrop-blur-md rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-900 shadow-sm border border-slate-100"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(event) => handleRemoveClick(event, homeCard.id)}
                          className="w-8 h-8 bg-red-50/80 backdrop-blur-md rounded-lg flex items-center justify-center text-red-500 hover:text-red-600 shadow-sm border border-red-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    <div className="flex justify-between items-center mb-10">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                        <masterAmbiente.icon
                          className={cn('w-5 h-5', masterAmbiente.colors.iconText)}
                        />
                      </div>
                      <h3 className="font-black text-slate-900 uppercase text-[10px] tracking-widest">
                        {masterAmbiente.label}
                      </h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-end justify-between">
                        <p className="text-4xl font-black text-slate-800 tracking-tighter">
                          {percentage}%
                        </p>
                        <div className="flex items-center gap-1.5">
                          {percentage === 100 && totalItemsCount > 0 && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shadow-sm" />
                          )}
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {completedItemsCount}/{totalItemsCount} itens
                          </p>
                        </div>
                      </div>
                      <div className="h-2 bg-white rounded-full overflow-hidden border border-slate-50">
                        <div
                          className="h-full bg-slate-900 rounded-full transition-all duration-700"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Card para Adicionar Novo Ambiente à Home */}
              {isManageMode && homeAmbientes.length < MASTER_AMBIENTES.length && (
                <button
                  onClick={() => {
                    setEditingCard(undefined);
                    setIsAmbienteFormOpen(true);
                  }}
                  className="card-pop bg-slate-50 border-dashed border-slate-200 p-8 flex flex-col items-center justify-center gap-4 group hover:bg-slate-100 transition-all min-h-[220px]"
                >
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-300 group-hover:text-slate-900 transition-all shadow-sm">
                    <Plus className="w-6 h-6" strokeWidth={3} />
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-900 transition-all">
                    Adicionar Card
                  </span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* --- FAB MOBILE --- */}
        <button
          onClick={() => setIsFormOpen(true)}
          className="md:hidden fixed fab-safe-bottom right-8 w-20 h-20 bg-slate-900 text-white rounded-[32px] shadow-2xl flex items-center justify-center active:scale-75 transition-all z-[110] border-4 border-white shadow-slate-900/30"
          aria-label="Adicionar novo item"
        >
          <Plus className="w-10 h-10" strokeWidth={3} />
        </button>

        {isFormOpen && <ItemForm onClose={() => setIsFormOpen(false)} onSave={onSaveItem} />}

        {isAmbienteFormOpen && (
          <AmbienteForm
            onClose={() => {
              setIsAmbienteFormOpen(false);
              setEditingCard(undefined);
            }}
            onSave={onSaveHomeAmbiente}
            existingAmbienteIds={homeAmbientes.map((h) => h.ambienteId)}
            initialData={editingCard}
          />
        )}

        <ConfirmDialog
          isOpen={showRemoveConfirm}
          title="Remover card"
          message="Deseja remover este card da Home? O cômodo continuará existindo na seção de Cômodos."
          confirmLabel="Remover"
          cancelLabel="Cancelar"
          variant="danger"
          onConfirm={confirmRemove}
          onCancel={() => {
            setShowRemoveConfirm(false);
            setCardToRemove(null);
          }}
        />
      </div>
    </AppLayout>
  );
}
