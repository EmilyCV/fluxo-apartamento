'use client';

import { cn } from '@/utils/cn';
import { hapticFeedback } from '@/utils/haptics';
import { Minus, Plus } from 'lucide-react';

interface QuantidadeAdquiridaControlProps {
  itemId: string;
  quantidade: number;
  quantidadeAdquirida: number;
  adquirido: boolean;
  onUpdate: (id: string, novaQtd: number, total: number) => void;
}

export function QuantidadeAdquiridaControl({
  itemId,
  quantidade,
  quantidadeAdquirida,
  adquirido,
  onUpdate,
}: QuantidadeAdquiridaControlProps) {
  const qty = quantidadeAdquirida;
  const total = quantidade;
  const isComplete = adquirido || qty >= total;
  const partial = qty > 0 && !isComplete;
  const pct = total > 0 ? (qty / total) * 100 : 0;

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (qty <= 0) return;
    hapticFeedback('light');
    onUpdate(itemId, qty - 1, total);
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isComplete) return;
    hapticFeedback('light');
    onUpdate(itemId, qty + 1, total);
  };

  return (
    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
      <button
        aria-label="Diminuir quantidade adquirida"
        onClick={handleDecrement}
        disabled={qty <= 0}
        className="w-9 h-9 shrink-0 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-400 hover:border-slate-200 hover:text-slate-600 active:scale-90 disabled:text-slate-200 disabled:cursor-not-allowed transition-all"
      >
        <Minus className="w-3.5 h-3.5" strokeWidth={3} />
      </button>

      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300',
            isComplete ? 'bg-brand-green' : partial ? 'bg-amber-400' : 'bg-slate-100',
          )}
          style={{ width: `${pct}%` }}
        />
      </div>

      <span
        className={cn(
          'text-[11px] font-black tabular-nums shrink-0 min-w-[28px] text-center',
          isComplete ? 'text-brand-green-dark' : partial ? 'text-amber-600' : 'text-slate-300',
        )}
      >
        {qty}/{total}
      </span>

      <button
        aria-label="Aumentar quantidade adquirida"
        onClick={handleIncrement}
        disabled={isComplete}
        className={cn(
          'w-9 h-9 shrink-0 rounded-xl shadow-sm flex items-center justify-center active:scale-90 disabled:cursor-not-allowed transition-all',
          isComplete
            ? 'bg-brand-green text-brand-green-dark disabled:opacity-60'
            : partial
              ? 'bg-amber-50 text-amber-600 border border-amber-100 hover:bg-amber-100'
              : 'bg-slate-50 text-slate-400 border border-slate-100 hover:bg-slate-100 hover:text-slate-600',
        )}
      >
        <Plus className="w-3.5 h-3.5" strokeWidth={3} />
      </button>
    </div>
  );
}
