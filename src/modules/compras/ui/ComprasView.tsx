'use client';

import React, { useEffect, useState, useRef, useCallback, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { AppLayout } from '@/components/AppLayout';
import { CompraItem, Ambiente, Categoria, Prioridade } from '@/modules/compras/types';
import { ItemForm } from '@/modules/compras/ui/ItemForm';
import { QuickAdd } from '@/modules/compras/ui/QuickAdd';
import { useComprasItems, SortOrder } from '@/modules/compras/hooks/useComprasItems';
import {
  Search,
  CheckCircle2,
  FilterX,
  Plus,
  ShoppingCart,
  ChevronDown,
  Home as HomeIcon,
  Tags,
  AlertCircle,
  RotateCcw,
  ArrowUpDown,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { hapticFeedback } from '@/utils/haptics';
import { comprasService } from '@/modules/compras/services/comprasService';
import { motion, AnimatePresence } from 'framer-motion';
import { getIsHydrated, setIsHydrated } from '@/utils/hydration';

const AMBIENTES: Ambiente[] = [
  '1. Cozinha',
  '2. Sala',
  '3. Varanda',
  '4. Banheiro',
  '5. Escritório',
  '6. Quarto',
  '7. Gerais',
];
const CATEGORIAS: Categoria[] = ['1. Reforma', '2. Eletros', '3. Utensílios', '4. Enxoval'];
const PRIORIDADES: Prioridade[] = [
  'Comprar agora',
  'Quando der',
  'Pode esperar',
  'Aguardando projeto',
  'Adquirido',
];

interface FilterOption<T> {
  label: string;
  value: T;
}

interface FilterDropdownProps<T> {
  label: string;
  value: T;
  options: FilterOption<T>[] | T[];
  icon: React.ElementType;
  isOpen: boolean;
  onToggle: (label: string | null) => void;
  onChange: (value: T) => void;
  placeholder: T;
  minWidth?: string;
}

function FilterDropdownInner<T extends string>({
  label,
  value,
  options,
  icon: Icon,
  isOpen,
  onToggle,
  onChange,
  placeholder,
  minWidth,
}: FilterDropdownProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

  const updateCoords = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const PANEL_WIDTH = 256;
      const PANEL_HEIGHT = 288; // max-h-72 approximates to 288px
      const MARGIN = 16;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Horizontal Clamping
      let leftPosition = rect.left;
      if (leftPosition + PANEL_WIDTH > viewportWidth - MARGIN) {
        leftPosition = rect.right - PANEL_WIDTH;
      }
      if (leftPosition < MARGIN) {
        leftPosition = MARGIN;
      }

      // Vertical Positioning
      let topPosition = rect.bottom + window.scrollY;
      if (rect.bottom + PANEL_HEIGHT > viewportHeight - MARGIN) {
        topPosition = rect.top + window.scrollY - PANEL_HEIGHT - 8; // 8px gap above
      }

      setCoords({
        top: topPosition,
        left: leftPosition,
        width: rect.width,
      });
    }
  }, []);

  useLayoutEffect(() => {
    if (isOpen) {
      updateCoords();
      window.addEventListener('scroll', updateCoords);
      window.addEventListener('resize', updateCoords);

      // Bloqueia scroll no mobile
      if (window.innerWidth < 768) {
        document.body.style.overflow = 'hidden';
      }
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      window.removeEventListener('scroll', updateCoords);
      window.removeEventListener('resize', updateCoords);
      document.body.style.overflow = '';
    };
  }, [isOpen, updateCoords]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isInsideContainer = containerRef.current?.contains(target);
      const isInsidePanel = panelRef.current?.contains(target);

      if (!isInsideContainer && !isInsidePanel) {
        onToggle(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onToggle]);

  const isOptionSelected = (opt: T | FilterOption<T>) => {
    if (typeof opt === 'string') return value === opt;
    return value === opt.value;
  };

  const isSelected =
    value !== placeholder && value !== 'Todos' && value !== 'Todas' && value !== 'recentes';

  let displayValue = label;
  if (isSelected) {
    const selectedOpt =
      Array.isArray(options) && typeof options[0] !== 'string'
        ? (options as FilterOption<T>[]).find((o) => o.value === value)
        : null;

    displayValue = selectedOpt ? selectedOpt.label : value.split('. ').pop() || value;
  }

  return (
    <div className="relative shrink-0" ref={containerRef} style={{ minWidth }}>
      <button
        onClick={() => onToggle(isOpen ? null : label)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={cn(
          'flex items-center justify-between gap-2.5 h-12 px-5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 shadow-sm border w-full',
          isOpen
            ? 'border-slate-900 bg-white text-slate-900 shadow-xl -translate-y-0.5'
            : isSelected
              ? 'border-slate-900 bg-slate-900 text-white'
              : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200',
        )}
      >
        <div className="flex items-center gap-2.5 truncate">
          <Icon
            className={cn('w-3.5 h-3.5 shrink-0', isSelected ? 'text-white' : 'text-slate-400')}
            aria-hidden="true"
          />
          <span className="truncate">{displayValue}</span>
        </div>
        <ChevronDown
          className={cn(
            'w-3.5 h-3.5 shrink-0 transition-transform duration-500',
            isOpen && 'rotate-180',
            isSelected ? 'text-white' : 'text-slate-300',
          )}
          aria-hidden="true"
        />
      </button>

      {isOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={panelRef}
            style={{
              position: 'fixed',
              top: coords.top - window.scrollY,
              left: coords.left,
              width: '256px',
              zIndex: 9999,
            }}
            className="bg-white border border-slate-100 rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] p-2 animate-fade-in-up"
            role="listbox"
          >
            <div className="max-h-72 overflow-y-auto no-scrollbar py-1">
              {placeholder !== 'recentes' && (
                <>
                  <button
                    role="option"
                    aria-selected={!isSelected}
                    onClick={() => {
                      onChange(placeholder);
                      onToggle(null);
                    }}
                    className={cn(
                      'w-full flex items-center justify-between px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all mb-1',
                      !isSelected ? 'bg-slate-50 text-slate-900' : 'text-slate-500 hover:bg-slate-50',
                    )}
                  >
                    <span>Ver Todos</span>
                    {!isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-slate-900" />}
                  </button>
                  <div className="h-px bg-slate-100 my-2 mx-2" />
                </>
              )}
              {options.map((opt) => {
                const optLabel =
                  typeof opt === 'string'
                    ? opt.split('. ').pop() || opt
                    : (opt as FilterOption<T>).label;
                const optValue = typeof opt === 'string' ? opt : (opt as FilterOption<T>).value;
                const active = isOptionSelected(opt);

                return (
                  <button
                    key={optValue}
                    role="option"
                    aria-selected={active}
                    onClick={() => {
                      onChange(optValue);
                      onToggle(null);
                    }}
                    className={cn(
                      'w-full flex items-center justify-between px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all mb-0.5',
                      active
                        ? 'bg-slate-900 text-white shadow-lg'
                        : 'text-slate-600 hover:bg-slate-50 hover:pl-5',
                    )}
                  >
                    <span className="truncate pr-4">{optLabel}</span>
                    {active && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                  </button>
                );
              })}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

const FilterDropdown = React.memo(FilterDropdownInner) as typeof FilterDropdownInner;

export function ComprasView() {
  const {
    items,
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
  } = useComprasItems();

  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [itemToEdit, setItemToEdit] = useState<CompraItem | undefined>(undefined);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(getIsHydrated());

  useEffect(() => {
    setIsMounted(true);
    setIsHydrated();
  }, []);

  const onSave = async (data: Omit<CompraItem, 'id' | 'createdAt' | 'updatedAt'>, id?: string) => {
    await handleSaveItem(data, id);
    setIsFormOpen(false);
    setItemToEdit(undefined);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const handleToggleFilter = useCallback((label: string | null) => {
    setActiveFilter(label);
  }, []);

  const handleOrdenacao = useCallback(
    (value: SortOrder) => {
      setOrdenacao(value);
    },
    [setOrdenacao],
  );

  const handleFiltroAmbiente = useCallback(
    (value: Ambiente | 'Todos') => {
      setFiltroAmbiente(value);
    },
    [setFiltroAmbiente],
  );

  const handleFiltroCategoria = useCallback(
    (value: Categoria | 'Todas') => {
      setFiltroCategoria(value);
    },
    [setFiltroCategoria],
  );

  const handleFiltroPrioridade = useCallback(
    (value: Prioridade | 'Todas') => {
      setFiltroPrioridade(value);
    },
    [setFiltroPrioridade],
  );

  const SORT_OPTIONS: FilterOption<SortOrder>[] = [
    { label: 'Mais Recentes', value: 'recentes' },
    { label: 'A-Z', value: 'nome-asc' },
    { label: 'Z-A', value: 'nome-desc' },
    { label: 'Menor Preço', value: 'preco-asc' },
    { label: 'Maior Preço', value: 'preco-desc' },
  ];

  const showQuickAdd = isMounted && !loading;
  const isActuallyLoading = !isMounted || loading;

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-6 py-10 md:px-12 space-y-12">
        <header className="space-y-6 sm:space-y-12 animate-pop relative z-[60]">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">
                Lista de Compras
              </h1>
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">
                Gestão inteligente do nosso lar
              </p>
            </div>

            <div className="flex items-center gap-3 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-96 group">
                <Search
                  className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-200 group-focus-within:text-slate-400 transition-colors"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  aria-label="Procurar itens"
                  placeholder="O que você está procurando?"
                  className="w-full h-12 sm:h-16 bg-white border border-slate-100 rounded-[28px] pl-14 sm:pl-16 pr-6 outline-none focus:border-slate-300 focus:shadow-2xl focus:shadow-slate-200/50 transition-all text-sm font-bold shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button
                onClick={() => {
                  setItemToEdit(undefined);
                  setIsFormOpen(true);
                }}
                className="hidden md:flex btn-pop bg-slate-900 text-white shadow-xl shadow-slate-900/10 hover:bg-black px-8 h-16 shrink-0"
                aria-label="Adicionar novo item"
              >
                <Plus className="w-5 h-5" strokeWidth={3} />
                Novo
              </button>
            </div>
          </div>

          {showQuickAdd && (
            <div className="animate-pop [animation-delay:100ms]">
              <QuickAdd onAdd={handleQuickAdd} />
            </div>
          )}

          <div className="space-y-6 relative z-50">
            <div className="flex items-center gap-2 text-slate-400">
              <FilterX className="w-4 h-4" aria-hidden="true" />
              <span className="text-[9px] font-black uppercase tracking-[0.3em]">
                Filtros & Organização
              </span>
            </div>

            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div
                className="flex bg-slate-100 p-1 rounded-2xl w-fit shrink-0"
                role="group"
                aria-label="Visualização de itens"
              >
                <button
                  onClick={() => setVerComprados(true)}
                  aria-pressed={verComprados}
                  className={cn(
                    'h-10 px-6 rounded-[14px] text-[10px] font-black uppercase tracking-widest transition-all',
                    verComprados
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-400 hover:text-slate-500',
                  )}
                >
                  Tudo
                </button>
                <button
                  onClick={() => setVerComprados(false)}
                  aria-pressed={!verComprados}
                  className={cn(
                    'h-10 px-6 rounded-[14px] text-[10px] font-black uppercase tracking-widest transition-all',
                    !verComprados
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-400 hover:text-slate-500',
                  )}
                >
                  Pendentes
                </button>
              </div>

              <div className="h-6 w-px bg-slate-200 hidden md:block mx-2 shrink-0"></div>

              <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0 pb-2 no-scrollbar">
              <div className="flex items-center gap-3 w-max">
                <FilterDropdown<SortOrder>
                  label="Ordenar"
                  placeholder="recentes"
                  value={ordenacao}
                  options={SORT_OPTIONS}
                  icon={ArrowUpDown}
                  isOpen={activeFilter === 'Ordenar'}
                  onToggle={handleToggleFilter}
                  onChange={handleOrdenacao}
                  minWidth="165px"
                />

                <FilterDropdown<Ambiente | 'Todos'>
                  label="Cômodo"
                  placeholder="Todos"
                  value={filtroAmbiente}
                  options={AMBIENTES}
                  icon={HomeIcon}
                  isOpen={activeFilter === 'Cômodo'}
                  onToggle={handleToggleFilter}
                  onChange={handleFiltroAmbiente}
                  minWidth="140px"
                />
                <FilterDropdown<Categoria | 'Todas'>
                  label="Categoria"
                  placeholder="Todas"
                  value={filtroCategoria}
                  options={CATEGORIAS}
                  icon={Tags}
                  isOpen={activeFilter === 'Categoria'}
                  onToggle={handleToggleFilter}
                  onChange={handleFiltroCategoria}
                  minWidth="140px"
                />
                <FilterDropdown<Prioridade | 'Todas'>
                  label="Prioridade"
                  placeholder="Todas"
                  value={filtroPrioridade}
                  options={PRIORIDADES}
                  icon={AlertCircle}
                  isOpen={activeFilter === 'Prioridade'}
                  onToggle={handleToggleFilter}
                  onChange={handleFiltroPrioridade}
                  minWidth="160px"
                />

                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 h-12 px-5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all shrink-0 group animate-slide-in touch-manipulation"
                    aria-label="Limpar todos os filtros"
                  >
                    <RotateCcw className="w-3.5 h-3.5 group-hover:rotate-[-45deg] transition-transform" />
                    <span>Resetar</span>
                  </button>
                )}
              </div>
              </div>
            </div>
          </div>
        </header>

        {isActuallyLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-10">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-48 sm:h-72 bg-slate-100 rounded-[40px] animate-pulse border border-slate-50"
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 sm:py-40 bg-white rounded-[48px] border border-slate-100 flex flex-col items-center animate-pop shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <FilterX className="w-8 h-8 text-slate-200" aria-hidden="true" />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2">Nenhum resultado</h3>
            <p className="text-slate-400 font-bold uppercase text-[9px] tracking-[0.3em] mb-5 sm:mb-8">
              Tente ajustar seus filtros para encontrar o que procura
            </p>
            <button
              onClick={clearFilters}
              className="flex items-center gap-3 px-8 h-14 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all active:scale-95 touch-manipulation"
              aria-label="Limpar filtros"
            >
              <RotateCcw className="w-4 h-4" />
              Limpar Filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-10 pb-nav-safe md:pb-12">
            {items.map((item) => (
              <div
                key={item.id}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && (setItemToEdit(item), setIsFormOpen(true))}
                onClick={() => {
                  setItemToEdit(item);
                  setIsFormOpen(true);
                }}
                className={cn(
                  'card-pop group flex flex-col p-5 sm:p-10 gap-4 sm:gap-10 cursor-pointer relative overflow-hidden animate-pop border-slate-100/60 active:scale-[0.98] transition-transform',
                  item.adquirido ? 'bg-slate-50/50 opacity-60 grayscale-[0.5]' : 'bg-white',
                )}
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
                        {item.ambiente.split('. ')[1]}
                      </span>
                      <span className="text-[10px] font-black uppercase bg-slate-50 text-slate-400 px-4 py-1.5 rounded-xl tracking-tighter border border-slate-100">
                        {item.prioridade}
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
