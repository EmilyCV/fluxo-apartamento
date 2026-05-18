'use client';

import { useState } from 'react';
import { Plus, Send } from 'lucide-react';
import { Ambiente } from '../types';
import { CurrencyInput } from '@/components/CurrencyInput';

const AMBIENTES_RAPIDOS: { label: string; value: Ambiente }[] = [
  { label: 'Cozinha', value: '1. Cozinha' },
  { label: 'Sala', value: '2. Sala' },
  { label: 'Quarto', value: '6. Quarto' },
  { label: 'Gerais', value: '7. Gerais' },
];

interface QuickAddProps {
  onAdd: (nome: string, ambiente: Ambiente, valor: number, quantidade: number) => Promise<void>;
}

export function QuickAdd({ onAdd }: QuickAddProps) {
  const [itemName, setItemName] = useState('');
  const [selectedAmbiente, setSelectedAmbiente] = useState<Ambiente>('7. Gerais');
  const [unitPrice, setUnitPrice] = useState(0);
  const [itemQuantity, setItemQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [success, setSuccess] = useState(false);

  const totalPrice = unitPrice * itemQuantity;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!itemName.trim()) return;
    setLoading(true);
    try {
      await onAdd(itemName.trim(), selectedAmbiente, unitPrice, itemQuantity);
      setItemName('');
      setUnitPrice(0);
      setItemQuantity(1);
      setIsExpanded(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 1500);
    } catch {
      // Silencia — o form completo tem tratamento de erro adequado
    } finally {
      setLoading(false);
    }
  };

  const formatCurrencyValue = (amount: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);

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
            value={itemName}
            onChange={(event) => setItemName(event.target.value)}
            onFocus={() => setIsExpanded(true)}
          />

          {itemQuantity > 1 && unitPrice > 0 && (
            <span className="text-xs font-black text-slate-400 animate-fade-in shrink-0">
              = {formatCurrencyValue(totalPrice)}
            </span>
          )}

          {itemName.trim() && (
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
          <div className="px-4 pb-4 space-y-4 border-t border-slate-50 pt-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0">
                Cômodo:
              </span>
              <div className="flex gap-2 flex-wrap">
                {AMBIENTES_RAPIDOS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSelectedAmbiente(option.value)}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                      selectedAmbiente === option.value
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 items-end">
              <div className="w-24 space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Qtd.
                </label>
                <input
                  type="number"
                  min="1"
                  className="w-full h-10 bg-slate-50 rounded-xl px-3 font-bold text-sm text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-slate-100 transition-all shadow-sm"
                  value={itemQuantity}
                  onChange={(event) => setItemQuantity(Math.max(1, Number(event.target.value)))}
                />
              </div>
              <CurrencyInput
                label="Valor unitário"
                value={unitPrice}
                onChange={setUnitPrice}
                className="flex-1 space-y-2"
                inputClassName="h-10 text-sm rounded-xl px-4"
              />
            </div>
          </div>
        )}
      </form>

      {success && (
        <p className="px-4 pb-4 text-xs font-bold text-brand-green-dark bg-brand-green-light animate-fade-in">
          Item adicionado com sucesso.
        </p>
      )}
    </div>
  );
}
