'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import { CompraItem, Ambiente } from '@/modules/compras/types';
import { ItemForm } from '@/modules/compras/ui/ItemForm';
import { useAmbienteItems } from '@/modules/compras/hooks/useAmbienteItems';
import {
  ChevronLeft,
  CheckCircle2,
  Plus,
  LayoutGrid,
  ShoppingCart,
  Clock,
  Zap,
  ArrowUpNarrowWide,
  StickyNote,
  ArrowUpRight,
  ChevronRight,
} from 'lucide-react';
import { hapticFeedback } from '@/utils/haptics';
import { cn } from '@/utils/cn';
import { comprasService } from '@/modules/compras/services/comprasService';
import { notasService } from '@/modules/notas/services/notasService';
import { Nota } from '@/modules/notas/types';
import { NOTAS_CORES } from '@/modules/notas/constants';
import { motion, AnimatePresence } from 'framer-motion';

interface AmbienteDetailViewProps {
  ambienteId: Ambiente;
}

export function AmbienteDetailView({ ambienteId }: AmbienteDetailViewProps) {
  const router = useRouter();

  const {
    items,
    loading,
    ordenacao,
    setOrdenacao,
    alfabeticoAsc,
    precoAsc,
    handleSaveItem,
    handleAlfabetico,
    handlePreco,
    totalInvestido,
    totalComprado,
  } = useAmbienteItems(ambienteId);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<CompraItem | undefined>(undefined);
  const [notasDoAmbiente, setNotasDoAmbiente] = useState<Nota[]>([]);

  const [itensPorPagina, setItensPorPagina] = useState<10 | 20 | 30 | 40 | null>(10);
  const [paginaAtual, setPaginaAtual] = useState(1);

  useEffect(() => { setPaginaAtual(1); }, [ordenacao, itensPorPagina]);

  const totalPaginas = itensPorPagina ? Math.ceil(items.length / itensPorPagina) : 1;
  const paginatedItems = useMemo(
    () => itensPorPagina ? items.slice((paginaAtual - 1) * itensPorPagina, paginaAtual * itensPorPagina) : items,
    [items, itensPorPagina, paginaAtual],
  );

  useEffect(() => {
    const unsubscribe = notasService.subscribeToNotas((notaList) => {
      setNotasDoAmbiente(notaList.filter((n) => n.linkedAmbiente === ambienteId).slice(0, 3));
    });
    return () => unsubscribe();
  }, [ambienteId]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);

  const onSave = async (
    itemData: Omit<CompraItem, 'id' | 'createdAt' | 'updatedAt'>,
    id?: string,
  ) => {
    await handleSaveItem(itemData, id);
    setIsFormOpen(false);
    setItemToEdit(undefined);
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-6 py-10 md:px-12 space-y-12">
        <header className="space-y-6 sm:space-y-8 animate-pop">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/ambientes')}
              className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all shadow-sm border border-slate-100 active:scale-90"
              aria-label="Voltar para ambientes"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={() => {
                setItemToEdit(undefined);
                setIsFormOpen(true);
              }}
              className="btn-pop bg-slate-900 text-white shadow-xl shadow-slate-900/10 hover:bg-black px-6 h-12 hidden md:flex"
            >
              <Plus className="w-4 h-4" strokeWidth={3} />
              Adicionar Item
            </button>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-brand-pink rounded-full animate-pulse shadow-[0_0_8px_rgba(251,207,232,0.8)]"></div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                  Ambiente
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tighter italic">
                {ambienteId.split('. ')[1]}
              </h1>
            </div>

            <div className="card-pop bg-gradient-to-br from-slate-900 to-slate-800 p-5 sm:p-8 flex flex-wrap gap-x-6 gap-y-4 sm:gap-x-12 relative overflow-hidden border-none text-white shadow-2xl shrink-0">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-pink opacity-10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
              <div className="relative z-10 shrink-0">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 sm:mb-2">
                  Total
                </p>
                <p className="text-xl sm:text-2xl font-black tracking-tight whitespace-nowrap">
                  {formatCurrency(totalInvestido)}
                </p>
              </div>
              <div className="relative z-10 shrink-0">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 sm:mb-2">
                  Comprado
                </p>
                <p className="text-xl sm:text-2xl font-black tracking-tight text-brand-green whitespace-nowrap">
                  {formatCurrency(totalComprado)}
                </p>
              </div>
            </div>
          </div>

          {items.length > 0 && (
            <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0 pb-1 no-scrollbar">
            <div className="flex items-center gap-3 w-fit">
              <div
                className="flex bg-slate-100 p-1 rounded-2xl shadow-sm border border-slate-200/50"
                role="group"
                aria-label="Ordenação de itens"
              >
                <button
                  onClick={() => setOrdenacao('recentes')}
                  className={cn(
                    'flex items-center gap-2 h-10 px-4 rounded-[14px] text-[10px] font-black uppercase tracking-widest transition-all duration-300',
                    ordenacao === 'recentes'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-400 hover:text-slate-600',
                  )}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span
                    className={cn('hidden sm:inline', ordenacao === 'recentes' ? 'inline' : 'hidden')}
                  >
                    Recentes
                  </span>
                </button>

                <button
                  onClick={() => setOrdenacao('prioridade')}
                  className={cn(
                    'flex items-center gap-2 h-10 px-4 rounded-[14px] text-[10px] font-black uppercase tracking-widest transition-all duration-300',
                    ordenacao === 'prioridade'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-400 hover:text-slate-600',
                  )}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span
                    className={cn(
                      'hidden sm:inline',
                      ordenacao === 'prioridade' ? 'inline' : 'hidden',
                    )}
                  >
                    Prioridade
                  </span>
                </button>

                <button
                  onClick={handleAlfabetico}
                  className={cn(
                    'flex items-center gap-2 h-10 px-4 rounded-[14px] text-[10px] font-black uppercase tracking-widest transition-all duration-300',
                    ordenacao === 'alfabetico'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-400 hover:text-slate-600',
                  )}
                  title={alfabeticoAsc ? 'Ordenar Z-A' : 'Ordenar A-Z'}
                >
                  <ArrowUpNarrowWide
                    className={cn(
                      'w-3.5 h-3.5 transition-transform duration-300',
                      ordenacao === 'alfabetico' && !alfabeticoAsc && 'rotate-180',
                    )}
                  />
                  <span
                    className={cn(
                      'hidden sm:inline',
                      ordenacao === 'alfabetico' ? 'inline' : 'hidden',
                    )}
                  >
                    A-Z
                  </span>
                </button>

                <button
                  onClick={handlePreco}
                  className={cn(
                    'flex items-center gap-2 h-10 px-4 rounded-[14px] text-[10px] font-black uppercase tracking-widest transition-all duration-300',
                    ordenacao === 'preco'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-400 hover:text-slate-600',
                  )}
                  title={precoAsc ? 'Preço decrescente' : 'Preço crescente'}
                >
                  <ArrowUpNarrowWide
                    className={cn(
                      'w-3.5 h-3.5 transition-transform duration-300',
                      ordenacao === 'preco' && !precoAsc && 'rotate-180',
                    )}
                  />
                  <span
                    className={cn('hidden sm:inline', ordenacao === 'preco' ? 'inline' : 'hidden')}
                  >
                    Preço
                  </span>
                </button>
              </div>

              {/* Seletor de itens por página */}
              <div
                className="flex bg-slate-100 p-1 rounded-2xl shadow-sm border border-slate-200/50"
                role="group"
                aria-label="Itens por página"
              >
                {([10, 20, 30, 40, null] as const).map((qtd) => (
                  <button
                    key={qtd ?? 'tudo'}
                    onClick={() => setItensPorPagina(qtd)}
                    className={cn(
                      'h-10 px-3 rounded-[14px] text-[10px] font-black uppercase tracking-widest transition-all duration-300',
                      itensPorPagina === qtd
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-400 hover:text-slate-600',
                    )}
                  >
                    {qtd ?? 'Tudo'}
                  </button>
                ))}
              </div>
            </div>
            </div>
          )}
        </header>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-48 bg-white rounded-[40px] animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 sm:py-32 bg-white rounded-[48px] border-2 border-dashed border-slate-100 flex flex-col items-center animate-pop shadow-sm">
            <div className="w-24 h-24 bg-brand-blue-light rounded-[32px] flex items-center justify-center mb-6 shadow-sm border border-brand-blue/20">
              <LayoutGrid className="w-10 h-10 text-brand-blue-dark" aria-hidden="true" />
            </div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-2">
              Ambiente vazio
            </h2>
            <p className="text-slate-400 font-medium mb-5 sm:mb-8 italic">
              Você ainda não adicionou nenhum item para este cômodo.
            </p>
            <button
              onClick={() => {
                setItemToEdit(undefined);
                setIsFormOpen(true);
              }}
              className="btn-pop bg-slate-900 text-white shadow-xl shadow-slate-900/10 hover:scale-105 active:scale-95 touch-manipulation px-12"
              aria-label="Adicionar primeiro item"
            >
              <Plus className="w-5 h-5" strokeWidth={3} /> Adicionar Item
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pb-nav-safe md:pb-12">
            {paginatedItems.map((item, index) => (
              <div
                key={item.id}
                role="button"
                tabIndex={0}
                onKeyDown={(event) =>
                  event.key === 'Enter' && (setItemToEdit(item), setIsFormOpen(true))
                }
                onClick={() => {
                  setItemToEdit(item);
                  setIsFormOpen(true);
                }}
                className={cn(
                  'card-pop group flex flex-col p-5 sm:p-10 gap-4 sm:gap-10 cursor-pointer relative overflow-hidden animate-pop border-slate-100/60 active:scale-[0.98] transition-transform',
                  item.adquirido ? 'bg-slate-50/50 opacity-60 grayscale-[0.5]' : 'bg-white',
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {item.adquirido && (
                  <div className="absolute top-0 right-0 bg-brand-green text-brand-green-dark px-6 py-2.5 rounded-bl-[24px] text-[10px] font-black uppercase tracking-widest shadow-sm z-10">
                    Adquirido
                  </div>
                )}

                <div className="space-y-8 flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex flex-wrap gap-2">
                      <span className="text-[10px] font-black uppercase bg-brand-blue-light text-brand-blue-dark px-4 py-1.5 rounded-xl tracking-tighter border border-brand-blue/10">
                        {item.prioridade}
                      </span>
                      <span className="text-[10px] font-black uppercase bg-slate-50 text-slate-400 px-4 py-1.5 rounded-xl tracking-tighter border border-slate-100">
                        {item.subCategoria.split('. ')[1] || item.subCategoria}
                      </span>
                    </div>
                    {!item.adquirido && (
                      <ShoppingCart
                        className="w-5 h-5 text-slate-100 group-hover:text-brand-pink-dark transition-colors"
                        aria-hidden="true"
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <h3
                      className={cn(
                        'text-xl sm:text-3xl font-black leading-[1.15] tracking-tight group-hover:text-brand-pink-dark transition-colors break-words',
                        item.adquirido ? 'text-slate-300 line-through' : 'text-slate-900',
                      )}
                    >
                      {item.nome}
                    </h3>
                    {item.fabricante && (
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">
                        {item.fabricante}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 sm:pt-10 border-t border-slate-50/80 mt-auto">
                  <div className="flex flex-col gap-1.5">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
                      Investimento
                    </p>
                    <p
                      className={cn(
                        'text-2xl sm:text-3xl font-black tracking-tighter tabular-nums truncate',
                        item.adquirido ? 'text-slate-300' : 'text-slate-900',
                      )}
                    >
                      {formatCurrency(item.valorTotalAproximado)}
                    </p>
                  </div>
                  <button
                    aria-label={item.adquirido ? 'Marcar como pendente' : 'Marcar como adquirido'}
                    aria-pressed={item.adquirido}
                    onClick={(e) => {
                      e.stopPropagation();
                      hapticFeedback('success');
                      comprasService.toggleAdquirido(item.id, item.adquirido);
                    }}
                    className={cn(
                      'w-12 h-12 sm:w-16 sm:h-16 rounded-[24px] flex items-center justify-center transition-all shadow-sm active:scale-90',
                      item.adquirido
                        ? 'bg-brand-green text-white shadow-brand-green/20'
                        : 'bg-slate-50 text-slate-200 hover:bg-brand-green-light hover:text-brand-green-dark hover:scale-110',
                    )}
                  >
                    <CheckCircle2
                      className={cn('w-8 h-8', item.adquirido ? 'stroke-[3px]' : 'stroke-[2px]')}
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Paginação */}
        {totalPaginas > 1 && (
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setPaginaAtual((p) => Math.max(1, p - 1))}
              disabled={paginaAtual === 1}
              aria-label="Página anterior"
              className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:border-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm active:scale-90"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5">
              {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((pagina) => (
                <button
                  key={pagina}
                  onClick={() => setPaginaAtual(pagina)}
                  aria-label={`Página ${pagina}`}
                  aria-current={pagina === paginaAtual ? 'page' : undefined}
                  className={cn(
                    'w-9 h-9 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all',
                    pagina === paginaAtual
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-white border border-slate-100 text-slate-400 hover:text-slate-900 hover:border-slate-300 shadow-sm',
                  )}
                >
                  {pagina}
                </button>
              ))}
            </div>

            <button
              onClick={() => setPaginaAtual((p) => Math.min(totalPaginas, p + 1))}
              disabled={paginaAtual === totalPaginas}
              aria-label="Próxima página"
              className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:border-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm active:scale-90"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Seção de Notas do Cômodo */}
        {notasDoAmbiente.length > 0 && (
          <div className="space-y-6 animate-pop">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <StickyNote className="w-4 h-4 text-slate-400" aria-hidden="true" />
                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                  Notas deste Cômodo
                </h2>
              </div>
              <button
                onClick={() =>
                  router.push(`/notas?ambiente=${encodeURIComponent(ambienteId)}`)
                }
                className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors"
                aria-label="Ver todas as notas deste cômodo"
              >
                Ver todas
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {notasDoAmbiente.map((nota) => {
                const cores = NOTAS_CORES[nota.cor];
                const doneTodos = nota.todos?.filter((t) => t.status === 'feito').length || 0;
                const totalTodos = nota.todos?.length || 0;
                return (
                  <div
                    key={nota.id}
                    onClick={() => router.push(`/notas?notaId=${nota.id}`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && router.push(`/notas?notaId=${nota.id}`)}
                    className={cn(
                      'rounded-[28px] border p-5 cursor-pointer transition-all',
                      'hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98]',
                      cores.bg,
                      cores.border,
                    )}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className={cn('w-2 h-2 rounded-full', cores.dot)} />
                      <span className={cn('text-[9px] font-black uppercase tracking-wide', cores.text)}>
                        {nota.tipo === 'todo' ? 'To-do' : 'Nota'}
                      </span>
                    </div>
                    <p className="text-sm font-black text-slate-800 leading-tight mb-2">
                      {nota.titulo}
                    </p>
                    {nota.tipo === 'nota' && nota.conteudo && (
                      <p className="text-xs text-slate-400 font-medium line-clamp-2">
                        {nota.conteudo}
                      </p>
                    )}
                    {nota.tipo === 'todo' && totalTodos > 0 && (
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                        {doneTodos}/{totalTodos} feitos
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <AnimatePresence>
          {!isFormOpen && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                setItemToEdit(undefined);
                setIsFormOpen(true);
              }}
              className="md:hidden fixed fab-safe-bottom right-6 w-16 h-16 bg-slate-900 text-white rounded-2xl shadow-2xl flex items-center justify-center z-[110] border-2 border-white/10 shadow-slate-900/30"
              aria-label="Adicionar novo item"
            >
              <Plus className="w-8 h-8" strokeWidth={3} />
            </motion.button>
          )}
        </AnimatePresence>

        {isFormOpen && (
          <ItemForm
            initialData={itemToEdit}
            defaultAmbiente={ambienteId}
            onClose={() => {
              setIsFormOpen(false);
              setItemToEdit(undefined);
            }}
            onSave={onSave}
          />
        )}
      </div>
    </AppLayout>
  );
}
