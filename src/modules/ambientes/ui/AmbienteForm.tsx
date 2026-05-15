'use client';

import React, { useState } from 'react';
import { HomeAmbiente } from '../types';
import { MASTER_AMBIENTES } from '../types/masterData';
import { X, Save, LayoutGrid } from 'lucide-react';

interface AmbienteFormProps {
  onClose: () => void;
  onSave: (ambienteId: string, ordem: number) => Promise<void>;
  existingAmbienteIds: string[];
  initialData?: HomeAmbiente;
}

export function AmbienteForm({
  onClose,
  onSave,
  existingAmbienteIds,
  initialData,
}: AmbienteFormProps) {
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(initialData?.ambienteId || '');
  const [ordem, setOrdem] = useState(initialData?.ordem || existingAmbienteIds.length + 1);

  const availableAmbientes = MASTER_AMBIENTES.filter(
    (amb) => !existingAmbienteIds.includes(amb.id) || amb.id === initialData?.ambienteId,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) return;
    setLoading(true);
    try {
      await onSave(selectedId, ordem);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar ambiente na home:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[210] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-[400px] rounded-[40px] overflow-hidden flex flex-col shadow-2xl animate-pop">
        <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-white/80 backdrop-blur-md">
          <div className="space-y-1">
            <h2 className="text-xl font-black text-slate-900 tracking-tighter">
              {initialData ? 'Editar Card' : 'Adicionar à Home'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
              <LayoutGrid className="w-3 h-3" /> Selecione o Cômodo
            </label>
            <select
              required
              className="w-full h-14 bg-slate-50 border-2 border-transparent focus:border-brand-pink focus:bg-white rounded-2xl px-5 font-bold text-slate-900 transition-all outline-none appearance-none cursor-pointer"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
            >
              <option value="" disabled>
                Escolha um cômodo...
              </option>
              {availableAmbientes.map((amb) => (
                <option key={amb.id} value={amb.id}>
                  {amb.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Ordem de Exibição
            </label>
            <input
              type="number"
              className="w-full h-14 bg-slate-50 border-2 border-transparent rounded-2xl px-5 font-bold text-slate-900 outline-none focus:border-slate-200 transition-all"
              value={ordem}
              onChange={(e) => setOrdem(Number(e.target.value))}
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-14 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 bg-slate-50 hover:bg-slate-100 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !selectedId}
              className="flex-[2] h-14 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] text-white bg-slate-900 hover:bg-black flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-lg shadow-slate-900/10"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Salvar
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
