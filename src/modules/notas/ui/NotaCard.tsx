'use client';

import React from 'react';
import { Pin } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { Nota, TodoStatus } from '../types';
import { NOTAS_CORES } from '../constants';
import { MASTER_AMBIENTES } from '@/modules/ambientes/types/masterData';
import { FirestoreTimestamp } from '@/types';

interface NotaCardProps {
  nota: Nota;
  onEdit: (nota: Nota) => void;
  onTogglePin: (id: string, pinned: boolean) => void;
  onToggleTodo: (notaId: string, todoId: string, status: TodoStatus) => void;
}

const hexToRgba = (hex: string, alpha: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

const toDate = (ts: FirestoreTimestamp | undefined): Date | null => {
  if (!ts) return null;
  if (ts instanceof Date) return ts;
  if (typeof ts === 'string') return new Date(ts);
  if (typeof ts === 'object' && ts !== null && 'seconds' in ts)
    return new Date((ts as { seconds: number }).seconds * 1000);
  return null;
};

const formatDate = (ts: FirestoreTimestamp | undefined): string => {
  const date = toDate(ts);
  if (!date) return '';
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
};

const MAX_VISIBLE_TODOS = 4;

export function NotaCard({ nota, onEdit, onTogglePin, onToggleTodo }: NotaCardProps) {
  const cores = NOTAS_CORES[nota.cor];

  const totalTodos = nota.todos?.length || 0;
  const doneTodos = nota.todos?.filter((t) => t.status === 'feito').length || 0;

  const linkedAmbiente = nota.linkedAmbiente
    ? MASTER_AMBIENTES.find((a) => a.id === nota.linkedAmbiente)
    : null;

  const cardClassName = cn(
    'group relative rounded-[32px] border p-5 cursor-pointer transition-all duration-300 flex flex-col gap-3',
    'hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-200/50',
    'active:scale-[0.98]',
    'h-72',
    !nota.corCustom && cn(cores.bg, cores.border),
  );
  const cardStyle: React.CSSProperties = nota.corCustom
    ? {
        backgroundColor: hexToRgba(nota.corCustom, 0.12),
        borderColor: hexToRgba(nota.corCustom, 0.45),
      }
    : {};

  const dotStyle: React.CSSProperties = nota.corCustom ? { backgroundColor: nota.corCustom } : {};
  const dotClass = nota.corCustom ? '' : cores.dot;

  const countStyle: React.CSSProperties = nota.corCustom ? { color: nota.corCustom } : {};
  const countClass = nota.corCustom ? 'font-black' : cn('font-black', cores.text);

  return (
    <div
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onEdit(nota)}
      onClick={() => onEdit(nota)}
      className={cardClassName}
      style={cardStyle}
    >
      {/* Topo: título + contagem + pin */}
      <div className="flex items-start justify-between gap-2 shrink-0">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <div className={cn('w-2 h-2 rounded-full shrink-0 mt-1.5', dotClass)} style={dotStyle} />
          <h3 className="text-base font-black text-slate-900 tracking-tight leading-snug line-clamp-2 flex-1">
            {nota.titulo}
          </h3>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {totalTodos > 0 && (
            <span
              className={cn('text-[10px] opacity-70', countClass)}
              style={countStyle}
            >
              {doneTodos}/{totalTodos}
            </span>
          )}

          <motion.button
            whileTap={{ rotate: 15 }}
            type="button"
            aria-label={nota.pinned ? 'Desafixar nota' : 'Fixar nota'}
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              onTogglePin(nota.id, nota.pinned);
            }}
            className={cn(
              'w-7 h-7 rounded-xl flex items-center justify-center transition-all',
              nota.pinned
                ? 'text-slate-700 bg-black/10'
                : 'text-slate-300 hover:text-slate-500 hover:bg-black/5',
            )}
          >
            <Pin
              className={cn('w-3 h-3', nota.pinned && 'fill-current')}
              aria-hidden="true"
            />
          </motion.button>
        </div>
      </div>

      {/* Conteúdo — preenche o espaço disponível */}
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col gap-2">
        {nota.conteudo && (
          <p className="text-sm text-slate-500 font-medium line-clamp-3 leading-relaxed shrink-0">
            {nota.conteudo}
          </p>
        )}

        {nota.todos && nota.todos.length > 0 && (
          <div role="list" className="space-y-1.5 overflow-hidden">
            {nota.todos.slice(0, MAX_VISIBLE_TODOS).map((todo) => (
              <div key={todo.id} role="listitem" className="flex items-center gap-2.5">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={todo.status === 'feito'}
                  aria-label={todo.status === 'feito' ? 'Marcar como pendente' : 'Marcar como feito'}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleTodo(nota.id, todo.id, todo.status);
                  }}
                  className={cn(
                    'w-4 h-4 rounded-[5px] border-2 flex items-center justify-center shrink-0 transition-all active:scale-90',
                    todo.status === 'feito'
                      ? 'bg-slate-900 border-slate-900'
                      : 'border-slate-300 bg-white hover:border-slate-500',
                  )}
                >
                  {todo.status === 'feito' && (
                    <svg className="w-2 h-2 text-white" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
                <span
                  className={cn(
                    'text-xs font-bold flex-1 leading-tight truncate',
                    todo.status === 'feito' ? 'line-through text-slate-300' : 'text-slate-600',
                  )}
                >
                  {todo.texto}
                </span>
              </div>
            ))}
            {nota.todos.length > MAX_VISIBLE_TODOS && (
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-6">
                +{nota.todos.length - MAX_VISIBLE_TODOS} mais...
              </p>
            )}
          </div>
        )}
      </div>

      {/* Rodapé */}
      <div className="shrink-0 pt-3 border-t border-black/5 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {linkedAmbiente && (
            <span className="flex items-center gap-1.5 bg-black/5 rounded-xl px-2.5 py-1">
              <linkedAmbiente.icon className="w-3 h-3 text-slate-500" aria-hidden="true" />
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-wide">
                {linkedAmbiente.label}
              </span>
            </span>
          )}
          <span className="text-[9px] font-bold text-slate-400">
            Por {nota.criadoPor.split(' ')[0]}
          </span>
        </div>
        <span className="text-[9px] font-bold text-slate-400">{formatDate(nota.atualizadoEm)}</span>
      </div>
    </div>
  );
}
