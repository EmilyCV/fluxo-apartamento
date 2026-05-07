'use client';

import React, { useState } from 'react';
import { 
    Ambiente, 
    Categoria, 
    SubCategoria, 
    Prioridade, 
    CompraItem 
} from '../types';
import { X, Save, Calculator, Link as LinkIcon } from 'lucide-react';

interface ItemFormProps {
    onSave: (item: Omit<CompraItem, "id" | "createdAt" | "updatedAt">, id?: string) => Promise<void>;
    onClose: () => void;
    initialData?: CompraItem;
}

const AMBIENTES: Ambiente[] = ["1. Cozinha", "2. Sala", "3. Varanda", "4. Banheiro", "5. Escritório", "6. Quarto", "7. Gerais"];
const CATEGORIAS: Categoria[] = ["1. Reforma", "2. Eletros", "3. Utensílios", "4. Enxoval"];

const SUB_CATEGORIAS: Record<Categoria, SubCategoria[]> = {
    "1. Reforma": ["1.1 Móveis planejados", "1.2 Móveis convencionais", "1.3 Materiais"],
    "2. Eletros": ["2.1 Eletrodomésticos", "2.2 Eletroportáteis"],
    "3. Utensílios": ["3.1 Utensílios cozinha", "3.2 Utensílios limpeza", "3.3 Utensílios gerais", "3.4 Utensílios higiene"],
    "4. Enxoval": ["4.1 Casa e banho", "4.2 Cama"]
};

const PRIORIDADES: Prioridade[] = ["Comprar agora", "Quando der", "Pode esperar", "Aguardando projeto", "Adquirido"];

export function ItemForm({ onSave, onClose, initialData }: ItemFormProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nome: initialData?.nome || '',
        ambiente: initialData?.ambiente || AMBIENTES[0],
        categoria: initialData?.categoria || CATEGORIAS[0],
        subCategoria: initialData?.subCategoria || SUB_CATEGORIAS[CATEGORIAS[0]][0],
        prioridade: initialData?.prioridade || PRIORIDADES[0],
        quantidade: initialData?.quantidade || 1,
        valorUnitario: initialData?.valorUnitario || 0,
        modelo: initialData?.modelo || '',
        fabricante: initialData?.fabricante || '',
        link: initialData?.link || '',
        observacoes: initialData?.observacoes || '',
        adquirido: initialData?.adquirido || false
    });

    const valorTotal = formData.quantidade * formData.valorUnitario;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSave({
                ...formData,
                valorTotalAproximado: valorTotal
            }, initialData?.id);
            onClose();
        } catch (error) {
            console.error("Erro ao salvar:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="bg-white w-full max-w-[550px] h-[94vh] sm:h-auto sm:max-h-[90vh] rounded-t-[48px] sm:rounded-[40px] overflow-hidden flex flex-col shadow-2xl animate-pop">
                
                {/* Header */}
                <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center sticky top-0 bg-white/80 backdrop-blur-md z-10">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-black text-slate-900 tracking-tighter">
                            {initialData ? 'Editar Item' : 'Novo Item'}
                        </h2>
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Detalhes da Compra</p>
                    </div>
                    <button onClick={onClose} className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all active:scale-90 shadow-sm border border-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-10 py-8 space-y-8 no-scrollbar pb-32 bg-white">
                    
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">O que vamos comprar?</label>
                        <input 
                            required
                            type="text"
                            placeholder="Nome do item..."
                            className="w-full h-16 bg-slate-50 border-2 border-transparent focus:border-brand-pink focus:bg-white rounded-[24px] px-6 text-lg font-bold text-slate-900 transition-all outline-none shadow-sm"
                            value={formData.nome}
                            onChange={e => setFormData({...formData, nome: e.target.value})}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ambiente</label>
                            <div className="relative">
                                <select 
                                    className="w-full h-16 bg-slate-50 border-2 border-transparent focus:border-brand-blue focus:bg-white rounded-[24px] px-6 text-sm font-bold text-slate-900 outline-none appearance-none shadow-sm"
                                    value={formData.ambiente}
                                    onChange={e => setFormData({...formData, ambiente: e.target.value as Ambiente})}
                                >
                                    {AMBIENTES.map(a => <option key={a} value={a}>{a.split('. ')[1]}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Prioridade</label>
                            <select 
                                className="w-full h-16 bg-slate-50 border-2 border-transparent focus:border-brand-pink focus:bg-white rounded-[24px] px-6 text-sm font-bold text-slate-900 outline-none appearance-none shadow-sm"
                                value={formData.prioridade}
                                onChange={e => setFormData({...formData, prioridade: e.target.value as Prioridade})}
                            >
                                {PRIORIDADES.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Quantidade</label>
                            <input 
                                type="number"
                                className="w-full h-16 bg-slate-50 border-2 border-transparent focus:border-brand-green focus:bg-white rounded-[24px] px-6 text-lg font-bold text-slate-900 outline-none shadow-sm"
                                value={formData.quantidade}
                                onChange={e => setFormData({...formData, quantidade: Number(e.target.value)})}
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Preço Unitário</label>
                            <input 
                                type="number"
                                step="0.01"
                                className="w-full h-16 bg-slate-50 border-2 border-transparent focus:border-brand-green focus:bg-white rounded-[24px] px-6 text-lg font-bold text-slate-900 outline-none shadow-sm"
                                value={formData.valorUnitario}
                                onChange={e => setFormData({...formData, valorUnitario: Number(e.target.value)})}
                            />
                        </div>
                    </div>

                    {/* Valor Total com Estilo Chá Revelação */}
                    <div className="bg-gradient-to-br from-brand-blue-light to-white p-8 rounded-[32px] border border-brand-blue/20 flex items-center justify-between shadow-premium">
                        <div className="flex items-center gap-3 text-brand-blue-dark">
                            <Calculator className="w-6 h-6" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Total Estimado</span>
                        </div>
                        <span className="text-3xl font-black text-slate-900 tracking-tighter">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorTotal)}
                        </span>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Categoria e Estilo</label>
                        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                            {CATEGORIAS.map(cat => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => setFormData({...formData, categoria: cat, subCategoria: SUB_CATEGORIAS[cat][0]})}
                                    className={`shrink-0 h-12 px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
                                        formData.categoria === cat 
                                        ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/10' 
                                        : 'bg-white text-slate-400 border border-slate-100 hover:bg-slate-50'
                                    }`}
                                >
                                    {cat.split('. ')[1]}
                                </button>
                            ))}
                        </div>
                        <select 
                            className="w-full h-16 bg-slate-50 border-2 border-transparent focus:border-brand-pink focus:bg-white rounded-[24px] px-6 text-sm font-bold text-slate-900 outline-none appearance-none shadow-sm"
                            value={formData.subCategoria}
                            onChange={e => setFormData({...formData, subCategoria: e.target.value as SubCategoria})}
                        >
                            {SUB_CATEGORIAS[formData.categoria].map(sub => <option key={sub} value={sub}>{sub}</option>)}
                        </select>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                            <LinkIcon className="w-4 h-4" /> Link do Produto
                        </label>
                        <input 
                            type="url"
                            placeholder="https://..."
                            className="w-full h-16 bg-slate-50 border-2 border-transparent rounded-[24px] px-6 text-sm font-bold text-slate-900 outline-none shadow-sm"
                            value={formData.link}
                            onChange={e => setFormData({...formData, link: e.target.value})}
                        />
                    </div>
                </form>

                {/* Footer Actions */}
                <div className="p-10 bg-white border-t border-slate-50 flex gap-4 sticky bottom-0 z-10 shadow-[0_-20px_40px_rgba(0,0,0,0.02)]">
                    <button 
                        type="button"
                        onClick={onClose}
                        className="flex-1 h-16 rounded-[24px] font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all shadow-sm border border-white"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleSubmit}
                        disabled={loading || !formData.nome}
                        className="flex-[2] h-16 rounded-[24px] font-black text-[10px] uppercase tracking-[0.2em] text-white bg-slate-900 hover:bg-black flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50 shadow-xl shadow-slate-900/10"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                Salvar Item
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
