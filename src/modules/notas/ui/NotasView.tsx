'use client';

import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import { useFirebaseAuth } from '@/modules/auth/contexts/AuthContext';
import { Nota, NotaType } from '@/modules/notas/types';
import { MASTER_AMBIENTES } from '@/modules/ambientes/types/masterData';
import { NotaCard } from './NotaCard';
import { NotaForm } from './NotaForm';
import { useNotas } from '../hooks/useNotas';
import {
  Search,
  Plus,
  StickyNote,
  FilterX,
  ChevronDown,
  CheckCircle2,
  RotateCcw,
  Tag,
  Home as HomeIcon,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';
import { getIsHydrated, setIsHydrated } from '@/utils/hydration';

// ---------- FilterDropdown (padrão ComprasView) ----------

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
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  const updateCoords = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const PANEL_WIDTH = 256;
      const PANEL_HEIGHT = 288;
      const MARGIN = 16;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let leftPosition = rect.left;
      if (leftPosition + PANEL_WIDTH > viewportWidth - MARGIN) {
        leftPosition = rect.right - PANEL_WIDTH;
      }
      if (leftPosition < MARGIN) leftPosition = MARGIN;

      let topPosition = rect.bottom + window.scrollY;
      if (rect.bottom + PANEL_HEIGHT + 16 > viewportHeight - MARGIN) {
        topPosition = rect.top + window.scrollY - PANEL_HEIGHT - 16;
      }

      setCoords({ top: topPosition, left: leftPosition });
    }
  }, []);

  useLayoutEffect(() => {
    if (isOpen) {
      updateCoords();
      window.addEventListener('scroll', updateCoords);
      window.addEventListener('resize', updateCoords);
      if (window.innerWidth < 768) document.body.style.overflow = 'hidden';
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
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!containerRef.current?.contains(target) && !panelRef.current?.contains(target)) {
        onToggle(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onToggle]);

  const isSelected = value !== placeholder;
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
            className={cn('w-3.5 h-3.5 shrink-0', isSelected && !isOpen ? 'text-white' : 'text-slate-400')}
            aria-hidden="true"
          />
          <span className="truncate">{displayValue}</span>
        </div>
        <ChevronDown
          className={cn(
            'w-3.5 h-3.5 shrink-0 transition-transform duration-500',
            isOpen && 'rotate-180',
            isSelected && !isOpen ? 'text-white' : 'text-slate-300',
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
              top: coords.top - window.scrollY + 8,
              left: coords.left,
              width: '256px',
              zIndex: 9999,
            }}
            className="bg-white border border-slate-100 rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden p-[1px] animate-fade-in-up"
            role="listbox"
          >
            <div className="relative">
              <div
                className="max-h-72 overflow-y-auto thin-scrollbar thin-scrollbar-rounded pt-4 px-3 pb-3"
              >
                <button
                  role="option"
                  aria-selected={!isSelected}
                  onClick={() => { onChange(placeholder); onToggle(null); }}
                  className={cn(
                    'w-full flex items-center justify-between px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all mb-1',
                    !isSelected
                      ? 'bg-slate-900 text-white shadow-lg'
                      : 'text-slate-600 hover:bg-slate-50 hover:pl-5',
                  )}
                >
                  <span className="truncate pr-4">Ver Todas</span>
                  {!isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                </button>
                <div className="h-px bg-slate-100 my-2 mx-2" />
                {options.map((opt) => {
                  const optLabel =
                    typeof opt === 'string'
                      ? opt.split('. ').pop() || opt
                      : (opt as FilterOption<T>).label;
                  const optValue = typeof opt === 'string' ? opt : (opt as FilterOption<T>).value;
                  const active = value === optValue;
                  return (
                    <button
                      key={optValue}
                      role="option"
                      aria-selected={active}
                      onClick={() => { onChange(optValue); onToggle(null); }}
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
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

const FilterDropdown = React.memo(FilterDropdownInner) as typeof FilterDropdownInner;

// ---------- Variantes de animação ----------

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
  },
};

// ---------- Opções de filtro ----------

const TIPO_OPTIONS: FilterOption<NotaType | 'Todas'>[] = [
  { value: 'nota', label: 'Notas' },
  { value: 'todo', label: 'To-dos' },
];

// "Nenhum" = notas sem cômodo vinculado; '' é o valor sentinela
const AMBIENTE_OPTIONS: FilterOption<string | 'Todos'>[] = [
  { value: '', label: 'Nenhum' },
  ...MASTER_AMBIENTES.map((a) => ({ value: a.id, label: a.label })),
];

// ---------- NotasView ----------

export function NotasView() {
  const { user, userName } = useFirebaseAuth();
  const searchParams = useSearchParams();

  const {
    notas,
    loading,
    searchTerm,
    setSearchTerm,
    filtroTipo,
    setFiltroTipo,
    filtroAmbiente,
    setFiltroAmbiente,
    hasActiveFilters,
    clearFilters,
    handleSaveNota,
    handleTogglePin,
    handleToggleTodo,
  } = useNotas();

  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [notaToEdit, setNotaToEdit] = useState<Nota | undefined>(undefined);
  const [isMounted, setIsMounted] = useState(getIsHydrated());
  const handledNotaIdRef = useRef<string | null>(null);

  // Inicializa filtros via URL params
  useEffect(() => {
    const tipo = searchParams.get('tipo');
    const ambiente = searchParams.get('ambiente');
    if (tipo === 'todo') setFiltroTipo('todo');
    else if (tipo === 'nota') setFiltroTipo('nota');
    if (ambiente) setFiltroAmbiente(decodeURIComponent(ambiente));
  }, [searchParams, setFiltroTipo, setFiltroAmbiente]);

  // Abre nota específica via ?notaId=
  const notaIdParam = searchParams.get('notaId');
  useEffect(() => {
    if (!notaIdParam || loading || handledNotaIdRef.current === notaIdParam) return;
    const nota = notas.find((n) => n.id === notaIdParam);
    if (nota) {
      handledNotaIdRef.current = notaIdParam;
      setNotaToEdit(nota);
      setIsFormOpen(true);
    }
  }, [notaIdParam, notas, loading]);

  useEffect(() => {
    setIsMounted(true);
    setIsHydrated();
  }, []);

  const handleToggleFilter = useCallback((label: string | null) => {
    setActiveFilter(label);
  }, []);

  const onSave = async (data: Omit<Nota, 'id' | 'criadoEm' | 'atualizadoEm'>, id?: string) => {
    await handleSaveNota(data, id);
    setIsFormOpen(false);
    setNotaToEdit(undefined);
  };

  const isActuallyLoading = !isMounted || loading;

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-6 py-10 md:px-12 space-y-12">
        {/* Header */}
        <header className="space-y-6 sm:space-y-10 animate-pop relative z-[60]">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 bg-brand-pink rounded-xl flex items-center justify-center text-brand-pink-dark shadow-sm">
                  <StickyNote className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                  Apê 2026
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">
                Notas
              </h1>
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">
                Ideias, lembretes e listas do apê
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
                  aria-label="Procurar notas"
                  placeholder="Buscar notas..."
                  className="w-full h-12 sm:h-16 bg-white border border-slate-100 rounded-[28px] pl-14 sm:pl-16 pr-6 outline-none focus:border-slate-300 focus:shadow-2xl focus:shadow-slate-200/50 transition-all text-sm font-bold shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button
                onClick={() => {
                  setNotaToEdit(undefined);
                  setIsFormOpen(true);
                }}
                className="hidden md:flex btn-pop bg-slate-900 text-white shadow-xl shadow-slate-900/10 hover:bg-black px-8 h-16 shrink-0"
                aria-label="Nova nota"
              >
                <Plus className="w-5 h-5" strokeWidth={3} />
                Nova Nota
              </button>
            </div>
          </div>

          {/* Filtros */}
          <div className="space-y-4 relative z-50">
            <div className="flex items-center gap-2 text-slate-400">
              <FilterX className="w-4 h-4" aria-hidden="true" />
              <span className="text-[9px] font-black uppercase tracking-[0.3em]">Filtros</span>
            </div>

            <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0 py-6 -my-6 no-scrollbar">
              <div className="flex items-center gap-3 w-max">
                <FilterDropdown<string | 'Todos'>
                  label="Cômodo"
                  placeholder="Todos"
                  value={filtroAmbiente}
                  options={AMBIENTE_OPTIONS}
                  icon={HomeIcon}
                  isOpen={activeFilter === 'Cômodo'}
                  onToggle={handleToggleFilter}
                  onChange={setFiltroAmbiente}
                  minWidth="140px"
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
        </header>

        {/* Conteúdo */}
        {isActuallyLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 bg-slate-100 rounded-[32px] animate-pulse" />
            ))}
          </div>
        ) : notas.length === 0 ? (
          <div className="text-center py-20 sm:py-40 bg-white rounded-[48px] border border-slate-100 flex flex-col items-center animate-pop shadow-sm">
            <div className="w-20 h-20 bg-brand-pink-light rounded-full flex items-center justify-center mb-6 border border-brand-pink/20">
              <StickyNote className="w-8 h-8 text-brand-pink-dark" aria-hidden="true" />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2">
              {hasActiveFilters ? 'Nenhum resultado' : 'Nenhuma nota ainda'}
            </h3>
            <p className="text-slate-400 font-bold uppercase text-[9px] tracking-[0.3em] mb-8">
              {hasActiveFilters
                ? 'Tente ajustar os filtros'
                : 'Crie sua primeira nota ou to-do list'}
            </p>
            {hasActiveFilters ? (
              <button
                onClick={clearFilters}
                className="flex items-center gap-3 px-8 h-14 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all active:scale-95"
                aria-label="Limpar filtros"
              >
                <RotateCcw className="w-4 h-4" />
                Limpar Filtros
              </button>
            ) : (
              <button
                onClick={() => { setNotaToEdit(undefined); setIsFormOpen(true); }}
                className="flex items-center gap-3 px-8 h-14 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all active:scale-95"
                aria-label="Criar primeira nota"
              >
                <Plus className="w-5 h-5" strokeWidth={3} />
                Nova Nota
              </button>
            )}
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-nav-safe md:pb-12"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {notas.map((nota) => (
              <motion.div key={nota.id} variants={itemVariants}>
                {nota.pinned && (
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5 px-1">
                    <span>📌</span> Fixada
                  </p>
                )}
                <NotaCard
                  nota={nota}
                  onEdit={(n) => {
                    setNotaToEdit(n);
                    setIsFormOpen(true);
                  }}
                  onTogglePin={handleTogglePin}
                  onToggleTodo={handleToggleTodo}
                />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* FAB mobile */}
        <AnimatePresence>
          {!isFormOpen && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                setNotaToEdit(undefined);
                setIsFormOpen(true);
              }}
              className="md:hidden fixed fab-safe-bottom right-6 w-16 h-16 bg-slate-900 text-white rounded-2xl shadow-2xl flex items-center justify-center z-[110] border-2 border-white/10 shadow-slate-900/30"
              aria-label="Nova nota"
            >
              <Plus className="w-8 h-8" strokeWidth={3} />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Form — tela cheia com animação */}
        <AnimatePresence>
          {isFormOpen && (
            <NotaForm
              initialData={notaToEdit}
              userName={userName}
              userUid={user?.uid || 'unknown'}
              onClose={() => {
                setIsFormOpen(false);
                setNotaToEdit(undefined);
              }}
              onSave={onSave}
            />
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}
