'use client';

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  ArrowLeft,
  Trash2,
  Save,
  Plus,
  Pin,
  Home as HomeIcon,
  ChevronDown,
  CheckCircle2,
  X,
  AlertCircle,
  ArrowDownAZ,
  ArrowUpZA,
  Palette,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';
import { Nota, NotaType, NotaCor, TodoItem } from '../types';
import { NOTAS_CORES, NOTAS_CORES_OPTIONS } from '../constants';
import { MASTER_AMBIENTES } from '@/modules/ambientes/types/masterData';
import { notasService } from '../services/notasService';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { FirestoreTimestamp } from '@/types';

interface NotaFormProps {
  onSave: (data: Omit<Nota, 'id' | 'criadoEm' | 'atualizadoEm'>, id?: string) => Promise<void>;
  onClose: () => void;
  initialData?: Nota;
  userName: string;
  userUid: string;
}

const SWATCH_BG: Record<NotaCor, string> = {
  pink: 'bg-brand-pink',
  blue: 'bg-brand-blue',
  green: 'bg-brand-green',
  yellow: 'bg-yellow-200',
  purple: 'bg-purple-200',
  slate: 'bg-slate-300',
};

const hexToRgba = (hex: string, alpha: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

const formatTimestamp = (ts: FirestoreTimestamp | undefined): string => {
  if (!ts) return '';
  let date: Date;
  if (ts instanceof Date) date = ts;
  else if (typeof ts === 'string') date = new Date(ts);
  else if (typeof ts === 'object' && ts !== null && 'seconds' in ts)
    date = new Date((ts as { seconds: number }).seconds * 1000);
  else return '';
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
};

export function NotaForm({ onSave, onClose, initialData, userName, userUid }: NotaFormProps) {
  const [loading, setLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAmbientePicker, setShowAmbientePicker] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);

  const [titulo, setTitulo] = useState(initialData?.titulo || '');
  const [conteudo, setConteudo] = useState(initialData?.conteudo || '');
  const [cor, setCor] = useState<NotaCor>(initialData?.cor || 'pink');
  const [corCustom, setCorCustom] = useState(initialData?.corCustom || '');
  const [pinned, setPinned] = useState(initialData?.pinned || false);
  const [linkedAmbiente, setLinkedAmbiente] = useState(initialData?.linkedAmbiente || '');
  const [localTodos, setLocalTodos] = useState<TodoItem[]>(initialData?.todos || []);
  const [newTodoText, setNewTodoText] = useState('');
  const [textSort, setTextSort] = useState<'default' | 'asc' | 'desc'>('default');
  const [statusSort, setStatusSort] = useState<'default' | 'done-last' | 'done-first'>('default');
  const [canScrollTodos, setCanScrollTodos] = useState(false);

  const titleRef = useRef<HTMLTextAreaElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const newTodoInputRef = useRef<HTMLInputElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);
  const todosListRef = useRef<HTMLDivElement>(null);

  const checkTodosScroll = useCallback(() => {
    if (todosListRef.current) {
      const el = todosListRef.current;
      setCanScrollTodos(el.scrollHeight > el.clientHeight + 4);
    }
  }, []);

  useEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [titulo]);

  const displayTodos = useMemo(() => {
    let result = [...localTodos];
    if (textSort !== 'default') {
      result.sort((a, b) =>
        textSort === 'asc'
          ? a.texto.localeCompare(b.texto, 'pt-BR')
          : b.texto.localeCompare(a.texto, 'pt-BR'),
      );
    }
    if (statusSort !== 'default') {
      result.sort((a, b) => {
        const aIsDone = a.status === 'feito';
        const bIsDone = b.status === 'feito';
        if (aIsDone === bIsDone) return 0;
        return statusSort === 'done-first' ? (aIsDone ? -1 : 1) : (aIsDone ? 1 : -1);
      });
    }
    return result;
  }, [localTodos, textSort, statusSort]);

  useEffect(() => {
    const raf = requestAnimationFrame(checkTodosScroll);
    return () => cancelAnimationFrame(raf);
  }, [displayTodos, checkTodosScroll]);

  const handleAddTodo = () => {
    const text = newTodoText.trim();
    if (!text) return;
    setLocalTodos((prev) => [
      ...prev,
      {
        id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        texto: text,
        status: 'pendente',
        criadoEm: new Date(),
      },
    ]);
    setNewTodoText('');
    newTodoInputRef.current?.focus();
  };

  const handleToggleTodo = (id: string) =>
    setLocalTodos((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: t.status === 'pendente' ? 'feito' : 'pendente' } : t,
      ),
    );

  const handleDeleteTodo = (id: string) =>
    setLocalTodos((prev) => prev.filter((t) => t.id !== id));

  const hasChanges = useCallback(() => {
    if (!initialData) {
      return titulo.trim() !== '' || conteudo.trim() !== '' || localTodos.length > 0;
    }
    return (
      titulo !== initialData.titulo ||
      conteudo !== (initialData.conteudo || '') ||
      cor !== initialData.cor ||
      corCustom !== (initialData.corCustom || '') ||
      pinned !== initialData.pinned ||
      linkedAmbiente !== (initialData.linkedAmbiente || '') ||
      JSON.stringify(localTodos) !== JSON.stringify(initialData.todos || [])
    );
  }, [titulo, conteudo, cor, corCustom, pinned, linkedAmbiente, localTodos, initialData]);

  const handleClose = () => {
    if (hasChanges()) {
      setShowUnsavedDialog(true);
    } else {
      onClose();
    }
  };

  const handleSave = async () => {
    if (!titulo.trim()) return;
    setLoading(true);
    setSaveError(null);
    try {
      const hasTodos = localTodos.length > 0;
      const tipo: NotaType = hasTodos ? 'todo' : 'nota';
      await onSave(
        {
          titulo: titulo.trim(),
          tipo,
          conteudo: conteudo || undefined,
          todos: hasTodos ? localTodos : undefined,
          cor,
          corCustom: corCustom || undefined,
          pinned,
          linkedAmbiente: linkedAmbiente || undefined,
          criadoPor: initialData?.criadoPor || userName,
          criadoPorUid: initialData?.criadoPorUid || userUid,
          atualizadoPor: userName,
        },
        initialData?.id,
      );
    } catch (error) {
      console.error('Erro ao salvar nota:', error);
      setSaveError('Não foi possível salvar. Tente novamente.');
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!initialData?.id) return;
    setLoading(true);
    try {
      await notasService.deleteNota(initialData.id);
      setShowDeleteConfirm(false);
      onClose();
    } catch {
      setLoading(false);
    }
  };

  const linkedAmbienteData = linkedAmbiente
    ? MASTER_AMBIENTES.find((a) => a.id === linkedAmbiente)
    : null;

  const accentColor = corCustom || null;
  const accentBg = accentColor ? hexToRgba(accentColor, 1) : NOTAS_CORES[cor].dot;

  const doneTodos = localTodos.filter((t) => t.status === 'feito').length;

  return (
    <>
      {/* Backdrop desktop */}
      <div
        className="hidden md:block fixed inset-0 bg-black/30 z-[199]"
        onClick={handleClose}
        aria-hidden="true"
      />

      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 32, stiffness: 280, mass: 0.9 }}
        className="fixed inset-0 md:inset-auto md:top-[5vh] md:left-1/2 md:-translate-x-1/2 md:w-[640px] md:h-[90vh] md:rounded-[32px] md:shadow-2xl z-[200] bg-white flex flex-col overflow-hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        {/* Barra de cor */}
        <div
          className={cn('h-3 w-full flex-shrink-0 transition-colors duration-300', !accentColor && NOTAS_CORES[cor].dot)}
          style={accentColor ? { backgroundColor: accentBg } : {}}
        />

        {/* Top bar */}
        <div
          className={cn(
            'flex items-center justify-between px-4 py-3 flex-shrink-0 transition-colors duration-300',
            !accentColor && NOTAS_CORES[cor].bg,
          )}
          style={accentColor ? { backgroundColor: hexToRgba(accentColor, 0.08) } : {}}
        >
          <button
            onClick={handleClose}
            aria-label="Voltar"
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all active:scale-90"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-1">
            {initialData?.atualizadoEm && (
              <span className="text-[10px] font-bold text-slate-300 mr-2">
                {formatTimestamp(initialData.atualizadoEm)}
              </span>
            )}
            <button
              onClick={() => setPinned((p) => !p)}
              aria-label={pinned ? 'Desafixar' : 'Fixar'}
              aria-pressed={pinned}
              className={cn(
                'w-10 h-10 rounded-2xl flex items-center justify-center transition-all active:scale-90',
                pinned ? 'text-slate-700 bg-slate-100' : 'text-slate-300 hover:text-slate-600 hover:bg-slate-50',
              )}
            >
              <Pin className={cn('w-4 h-4', pinned && 'fill-current')} />
            </button>
            {initialData && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                aria-label="Excluir nota"
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all active:scale-90"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Área de conteúdo — split independente quando há todos */}
        <div className="flex-1 overflow-hidden min-h-0">
          <div className="flex flex-col h-full px-5 pt-1 pb-3">

            {/* Título */}
            <textarea
              ref={titleRef}
              rows={1}
              placeholder="Título..."
              aria-label="Título da nota"
              className="w-full text-[1.75rem] font-black text-slate-900 tracking-tight outline-none bg-transparent resize-none border-none leading-tight placeholder-slate-200 overflow-hidden mb-3 shrink-0"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  contentRef.current?.focus();
                }
              }}
            />

            {/* Container split */}
            <div className="flex-1 min-h-0 flex flex-col">

              {/* Painel de texto — scroll independente */}
              <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
                <textarea
                  ref={contentRef}
                  placeholder="Comece a escrever..."
                  aria-label="Conteúdo da nota"
                  className="w-full min-h-full outline-none resize-none bg-transparent text-base text-slate-600 leading-relaxed placeholder-slate-200"
                  value={conteudo}
                  onChange={(e) => setConteudo(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Tab') {
                      e.preventDefault();
                      newTodoInputRef.current?.focus();
                    }
                  }}
                />
              </div>

              {/* Painel de checklist */}
              <div
                className={cn(
                  'border-t border-slate-100 flex flex-col',
                  localTodos.length > 0
                    ? 'flex-1 min-h-0 pt-3'
                    : 'shrink-0 pt-4 mt-4',
                )}
              >
                {/* Cabeçalho (sempre visível) */}
                <div className="flex items-center justify-between mb-2 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Checklist
                    </span>
                    {localTodos.length > 0 && (
                      <span className="text-[10px] font-black text-slate-300">
                        {doneTodos}/{localTodos.length}
                      </span>
                    )}
                  </div>

                  {localTodos.length > 1 && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          setTextSort((s) => (s === 'default' ? 'asc' : s === 'asc' ? 'desc' : 'default'))
                        }
                        aria-label="Ordenar por texto"
                        className={cn(
                          'flex items-center gap-1 h-7 px-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all',
                          textSort !== 'default'
                            ? 'bg-slate-900 text-white'
                            : 'text-slate-300 hover:text-slate-600 hover:bg-slate-50',
                        )}
                      >
                        {textSort === 'desc' ? (
                          <ArrowUpZA className="w-3 h-3" aria-hidden="true" />
                        ) : (
                          <ArrowDownAZ className="w-3 h-3" aria-hidden="true" />
                        )}
                        {textSort === 'desc' ? 'Z-A' : 'A-Z'}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setStatusSort((s) =>
                            s === 'default' ? 'done-last' : s === 'done-last' ? 'done-first' : 'default',
                          )
                        }
                        aria-label="Ordenar por status"
                        className={cn(
                          'flex items-center gap-1 h-7 px-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all',
                          statusSort !== 'default'
                            ? 'bg-slate-900 text-white'
                            : 'text-slate-300 hover:text-slate-600 hover:bg-slate-50',
                        )}
                      >
                        <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                        {statusSort === 'default' ? 'Status' : statusSort === 'done-last' ? '✓ Último' : '✓ 1°'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Itens — scroll independente com indicador de fade */}
                <div className={cn('relative', localTodos.length > 0 ? 'flex-1 min-h-0' : '')}>
                  <div
                    ref={todosListRef}
                    onScroll={checkTodosScroll}
                    role="list"
                    className={cn(
                      'space-y-0.5',
                      localTodos.length > 0 ? 'h-full overflow-y-auto no-scrollbar' : '',
                    )}
                  >
                  <AnimatePresence mode="popLayout">
                    {displayTodos.map((todo) => (
                      <motion.div
                        key={todo.id}
                        role="listitem"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.15 }}
                        className="flex items-center gap-3 group py-1.5"
                      >
                        <button
                          type="button"
                          role="checkbox"
                          aria-checked={todo.status === 'feito'}
                          aria-label={todo.status === 'feito' ? 'Marcar como pendente' : 'Marcar como feito'}
                          onClick={() => handleToggleTodo(todo.id)}
                          className={cn(
                            'w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all active:scale-90',
                            todo.status === 'feito'
                              ? 'bg-slate-900 border-slate-900'
                              : 'border-slate-200 hover:border-slate-400',
                          )}
                        >
                          {todo.status === 'feito' && (
                            <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </button>
                        <span
                          className={cn(
                            'flex-1 text-sm leading-tight',
                            todo.status === 'feito' ? 'line-through text-slate-300' : 'text-slate-700',
                          )}
                        >
                          {todo.texto}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteTodo(todo.id)}
                          aria-label={`Remover "${todo.texto}"`}
                          className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 w-6 h-6 rounded-lg text-slate-300 hover:text-red-400 transition-all flex items-center justify-center"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  </div>
                  {canScrollTodos && localTodos.length > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none flex items-end justify-center pb-1">
                      <ChevronDown className="w-3.5 h-3.5 text-slate-300" aria-hidden="true" />
                    </div>
                  )}
                </div>

                {/* Linha de adição (sempre visível) */}
                <div className="flex items-center gap-3 py-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={handleAddTodo}
                    aria-label="Adicionar item"
                    className="w-5 h-5 rounded-md border-2 border-dashed border-slate-200 flex items-center justify-center shrink-0 hover:border-slate-400 transition-colors active:scale-90"
                  >
                    <Plus className="w-2.5 h-2.5 text-slate-300" aria-hidden="true" />
                  </button>
                  <input
                    ref={newTodoInputRef}
                    type="text"
                    placeholder="Adicionar item..."
                    aria-label="Novo item do checklist"
                    className="flex-1 text-sm text-slate-500 outline-none bg-transparent placeholder-slate-200"
                    value={newTodoText}
                    onChange={(e) => setNewTodoText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') { e.preventDefault(); handleAddTodo(); }
                    }}
                  />
                  {newTodoText.trim() && (
                    <button
                      type="button"
                      onClick={handleAddTodo}
                      aria-label="Adicionar"
                      className="text-[9px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors px-2"
                    >
                      add
                    </button>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Picker de cômodo */}
        <AnimatePresence>
          {showAmbientePicker && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-10"
                onClick={() => setShowAmbientePicker(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.15 }}
                className="absolute bottom-[72px] left-4 right-4 bg-white rounded-[28px] shadow-[0_-8px_40px_rgba(0,0,0,0.12)] border border-slate-100 z-20 overflow-hidden"
              >
                <div className="p-2 space-y-0.5 max-h-60 overflow-y-auto no-scrollbar">
                  <button
                    onClick={() => { setLinkedAmbiente(''); setShowAmbientePicker(false); }}
                    className={cn('w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all', !linkedAmbiente ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50')}
                  >
                    Nenhum
                    {!linkedAmbiente && <CheckCircle2 className="w-4 h-4 ml-auto text-white" aria-hidden="true" />}
                  </button>
                  {MASTER_AMBIENTES.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => { setLinkedAmbiente(a.id); setShowAmbientePicker(false); }}
                      className={cn('w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all', linkedAmbiente === a.id ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50')}
                    >
                      <a.icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                      {a.label}
                      {linkedAmbiente === a.id && <CheckCircle2 className="w-4 h-4 ml-auto text-white" aria-hidden="true" />}
                    </button>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Toolbar */}
        <div className="flex-shrink-0 border-t border-slate-100 px-4 pt-2 pb-3 flex flex-col gap-3 md:flex-row md:items-center md:gap-3 md:py-3">
          {/* Swatches de cor */}
          <div className="flex items-center gap-1.5">
            {NOTAS_CORES_OPTIONS.map(({ value, label }) => {
              const isActive = !corCustom && cor === value;
              return (
                <button
                  key={value}
                  type="button"
                  aria-label={`Cor ${label}`}
                  aria-pressed={isActive}
                  onClick={() => { setCor(value); setCorCustom(''); }}
                  className={cn(
                    'w-6 h-6 rounded-full transition-all active:scale-90 shrink-0',
                    SWATCH_BG[value],
                    isActive
                      ? 'ring-2 ring-offset-1 ring-slate-900 scale-110'
                      : 'opacity-60 hover:opacity-100 hover:scale-110',
                  )}
                  title={label}
                />
              );
            })}

            {/* Cor personalizada — o arco-íris fica sempre visível */}
            <label
              className="relative cursor-pointer shrink-0"
              title="Cor personalizada"
              aria-label="Escolher cor personalizada"
            >
              <input
                ref={colorInputRef}
                type="color"
                className="sr-only"
                value={corCustom || '#fbcfe8'}
                onChange={(e) => setCorCustom(e.target.value)}
              />
              <div
                className={cn(
                  'w-6 h-6 rounded-full transition-all hover:scale-110 active:scale-90 flex items-center justify-center overflow-hidden',
                  corCustom ? 'ring-2 ring-offset-1 ring-slate-900 scale-110' : '',
                )}
                style={{
                  background:
                    'conic-gradient(from 0deg, #f87171, #fb923c, #facc15, #4ade80, #60a5fa, #c084fc, #f87171)',
                }}
              >
                <Palette className="w-3 h-3 text-white/80" aria-hidden="true" />
              </div>
            </label>
          </div>

          {/* Cômodo + Salvar */}
          <div className="flex items-center justify-end gap-2 md:ml-auto">
            <button
              type="button"
              onClick={() => setShowAmbientePicker((s) => !s)}
              aria-label="Vincular a cômodo"
              aria-expanded={showAmbientePicker}
              className={cn(
                'flex items-center gap-1.5 h-8 px-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0',
                linkedAmbienteData
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-400 hover:bg-slate-200',
              )}
            >
              {linkedAmbienteData ? (
                <>
                  <linkedAmbienteData.icon className="w-3 h-3" aria-hidden="true" />
                  <span>{linkedAmbienteData.label}</span>
                </>
              ) : (
                <>
                  <HomeIcon className="w-3 h-3" aria-hidden="true" />
                  <span>Cômodo</span>
                </>
              )}
              <ChevronDown
                className={cn('w-3 h-3 transition-transform', showAmbientePicker && 'rotate-180')}
                aria-hidden="true"
              />
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={loading || !titulo.trim()}
              aria-label="Salvar nota"
              className="flex items-center gap-1.5 h-8 px-4 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest disabled:opacity-40 transition-all active:scale-95 shrink-0"
            >
              {loading ? (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" aria-hidden="true" />
                  Salvar
                </>
              )}
            </button>
          </div>
        </div>

        {/* Erro */}
        <AnimatePresence>
          {saveError && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="absolute bottom-20 left-4 right-4 bg-red-50 border border-red-100 rounded-2xl px-4 py-3 flex items-center gap-3 z-30"
              role="alert"
            >
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" aria-hidden="true" />
              <p className="text-xs font-bold text-red-600 flex-1">{saveError}</p>
              <button
                onClick={() => setSaveError(null)}
                aria-label="Fechar"
                className="text-red-400 hover:text-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dialog de alterações não salvas */}
        <AnimatePresence>
          {showUnsavedDialog && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center p-4"
              onClick={() => setShowUnsavedDialog(false)}
            >
              <motion.div
                initial={{ y: 16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 16, opacity: 0 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
                className="bg-white rounded-[28px] p-6 w-full max-w-sm shadow-2xl"
              >
                <h3 className="text-lg font-black text-slate-900 tracking-tight mb-1">
                  Alterações não salvas
                </h3>
                <p className="text-sm text-slate-400 font-medium mb-6">
                  Deseja salvar antes de sair?
                </p>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => { setShowUnsavedDialog(false); handleSave(); }}
                    disabled={!titulo.trim()}
                    className="w-full h-12 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-40 active:scale-95 transition-transform"
                  >
                    <Save className="w-3.5 h-3.5" aria-hidden="true" />
                    Salvar
                  </button>
                  <button
                    onClick={() => { setShowUnsavedDialog(false); onClose(); }}
                    className="w-full h-12 rounded-2xl bg-red-50 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-colors active:scale-95"
                  >
                    Descartar
                  </button>
                  <button
                    onClick={() => setShowUnsavedDialog(false)}
                    className="w-full h-12 rounded-2xl text-slate-400 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-colors active:scale-95"
                  >
                    Cancelar
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <ConfirmDialog
          isOpen={showDeleteConfirm}
          title="Excluir nota"
          message="Esta ação não pode ser desfeita."
          confirmLabel="Excluir"
          cancelLabel="Cancelar"
          variant="danger"
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      </motion.div>
    </>
  );
}
