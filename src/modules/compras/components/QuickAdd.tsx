'use client';

import { useState } from 'react';
import { Plus, Send } from 'lucide-react';
import { Ambiente } from '../types';

const AMBIENTES_RAPIDOS: { label: string; value: Ambiente }[] = [
  { label: 'Cozinha', value: '1. Cozinha' },
  { label: 'Sala', value: '2. Sala' },
  { label: 'Quarto', value: '6. Quarto' },
  { label: 'Gerais', value: '7. Gerais' },
];

interface QuickAddProps {
  onAdd: (nome: string, ambiente: Ambiente) => Promise<void>;
}

export function QuickAdd({ onAdd }: QuickAddProps) {
  const [nome, setNome] = useState('');
  const [ambiente, setAmbiente] = useState<Ambiente>('7. Gerais');
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;
    setLoading(true);
    try {
      await onAdd(nome.trim(), ambiente);
      setNome('');
      setIsExpanded(false);
    } catch {
      // Silencia — o form completo tem tratamento de erro adequado
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[28px] border border-slate-100 shadow-sm overflow-hidden transition-all">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center gap-3 p-4">
          <div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0">
            <Plus className="w-5 h-5 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Adicionar item rapidamente..."
            className="flex-1 bg-transparent outline-none text-sm font-bold text-slate-900 placeholder:text-slate-300"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            onFocus={() => setIsExpanded(true)}
          />
          {nome.trim() && (
            <button
              type="submit"
              disabled={loading}
              className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white shrink-0 active:scale-90 transition-all"
              aria-label="Adicionar item"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        {isExpanded && (
          <div className="px-4 pb-4 flex items-center gap-2 border-t border-slate-50 pt-3">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0">Cômodo:</span>
            <div className="flex gap-2 flex-wrap">
              {AMBIENTES_RAPIDOS.map((amb) => (
                <button
                  key={amb.value}
                  type="button"
                  onClick={() => setAmbiente(amb.value)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                    ambiente === amb.value
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {amb.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
