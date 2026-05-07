'use client';

import React, { useState, useEffect } from 'react';
import { 
    Ambiente, 
    Categoria, 
    SubCategoria, 
    Prioridade, 
    CompraItem 
} from '../types';
import { X, Save, Calculator, Link as LinkIcon, Info } from 'lucide-react';

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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="bg-white w-full max-w-[500px] h-[92vh] sm:h-auto sm:max-h-[90vh] rounded-t-[40px] sm:rounded-[40px] overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom-full duration-300">
                
                {/* Header do Modal */}
                <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                    <h2 className="text-2xl font-bold text-slate-800">
                        {initialData ? 'Editar Item' : 'Novo Item'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X className="w-8 h-8 text-slate-400" />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-8 py-6 space-y-6 pb-24">
                    
                    {/* Nome do Item */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-500 ml-1">O QUE VAMOS COMPRAR?</label>
                        <input 
                            required
                            type="text"
                            placeholder="Ex: Airfryer, Sofá, Torneira..."
                            className="w-full h-[60px] bg-slate-50 border-2 border-transparent focus:border-brand-pink focus:bg-white rounded-2xl px-6 text-lg font-medium transition-all outline-none"
                            value={formData.nome}
                            onChange={e => setFormData({...formData, nome: e.target.value})}
                        />
                    </div>

                    {/* Ambiente e Prioridade (Grid) */}
                    <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-500 ml-1">AMBIENTE</label>
                            <select 
                                className="w-full h-[60px] bg-slate-50 border-2 border-transparent focus:border-brand-blue rounded-2xl px-6 text-lg font-medium outline-none appearance-none"
                                value={formData.ambiente}
                                onChange={e => setFormData({...formData, ambiente: e.target.value as Ambiente})}
                            >
                                {AMBIENTES.map(a => <option key={a} value={a}>{a}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Preços (Grid) */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-500 ml-1">QTD</label>
                            <input 
                                type="number"
                                className="w-full h-[60px] bg-slate-50 border-2 border-transparent focus:border-brand-green rounded-2xl px-6 text-lg font-medium outline-none"
                                value={formData.quantidade}
                                onChange={e => setFormData({...formData, quantidade: Number(e.target.value)})}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-500 ml-1">VALOR UNIT. (R$)</label>
                            <input 
                                type="number"
                                step="0.01"
                                className="w-full h-[60px] bg-slate-50 border-2 border-transparent focus:border-brand-green rounded-2xl px-6 text-lg font-medium outline-none"
                                value={formData.valorUnitario}
                                onChange={e => setFormData({...formData, valorUnitario: Number(e.target.value)})}
                            />
                        </div>
                    </div>

                    {/* Valor Total Estimado */}
                    <div className="bg-brand-green-light/50 p-4 rounded-2xl border border-brand-green/20 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-green-700">
                            <Calculator className="w-5 h-5" />
                            <span className="text-sm font-bold">TOTAL ESTIMADO</span>
                        </div>
                        <span className="text-xl font-black text-slate-800">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorTotal)}
                        </span>
                    </div>

                    {/* Categoria e Subcategoria */}
                    <div className="space-y-4 pt-2">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-500 ml-1">CATEGORIA</label>
                            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                                {CATEGORIAS.map(cat => (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => setFormData({...formData, categoria: cat, subCategoria: SUB_CATEGORIAS[cat][0]})}
                                        className={`shrink-0 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                                            formData.categoria === cat 
                                            ? 'bg-slate-900 text-white' 
                                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                        }`}
                                    >
                                        {cat.split('. ')[1]}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-500 ml-1">SUB-CATEGORIA</label>
                            <select 
                                className="w-full h-[60px] bg-slate-50 border-2 border-transparent focus:border-brand-pink rounded-2xl px-6 text-lg font-medium outline-none appearance-none"
                                value={formData.subCategoria}
                                onChange={e => setFormData({...formData, subCategoria: e.target.value as SubCategoria})}
                            >
                                {SUB_CATEGORIAS[formData.categoria].map(sub => <option key={sub} value={sub}>{sub}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Prioridade */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-500 ml-1">PRIORIDADE</label>
                        <div className="grid grid-cols-2 gap-2">
                            {PRIORIDADES.map(prio => (
                                <button
                                    key={prio}
                                    type="button"
                                    onClick={() => setFormData({...formData, prioridade: prio})}
                                    className={`h-[50px] rounded-xl text-xs font-black uppercase tracking-wider border-2 transition-all ${
                                        formData.prioridade === prio 
                                        ? 'border-slate-900 bg-slate-900 text-white' 
                                        : 'border-slate-100 bg-white text-slate-400'
                                    }`}
                                >
                                    {prio}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Detalhes Extra (Modelo/Fabricante) */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-500 ml-1">MODELO</label>
                            <input 
                                type="text"
                                className="w-full h-[60px] bg-slate-50 border-2 border-transparent focus:border-brand-blue rounded-2xl px-6 text-lg outline-none"
                                value={formData.modelo}
                                onChange={e => setFormData({...formData, modelo: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-500 ml-1">MARCA</label>
                            <input 
                                type="text"
                                className="w-full h-[60px] bg-slate-50 border-2 border-transparent focus:border-brand-blue rounded-2xl px-6 text-lg outline-none"
                                value={formData.fabricante}
                                onChange={e => setFormData({...formData, fabricante: e.target.value})}
                            />
                        </div>
                    </div>

                    {/* Link de Compra */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-500 ml-1 flex items-center gap-2">
                            <LinkIcon className="w-4 h-4" /> LINK DO PRODUTO
                        </label>
                        <input 
                            type="url"
                            placeholder="https://..."
                            className="w-full h-[60px] bg-slate-50 border-2 border-transparent rounded-2xl px-6 text-lg outline-none"
                            value={formData.link}
                            onChange={e => setFormData({...formData, link: e.target.value})}
                        />
                    </div>

                    {/* Observações */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-500 ml-1 flex items-center gap-2">
                            <Info className="w-4 h-4" /> OBSERVAÇÕES
                        </label>
                        <textarea 
                            rows={3}
                            className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-6 text-lg outline-none resize-none"
                            value={formData.observacoes}
                            onChange={e => setFormData({...formData, observacoes: e.target.value})}
                        />
                    </div>
                </form>

                {/* Footer Buttons */}
                <div className="p-8 bg-white border-t border-slate-100 flex gap-4 sticky bottom-0">
                    <button 
                        type="button"
                        onClick={onClose}
                        className="flex-1 h-[65px] rounded-2xl font-bold text-slate-500 bg-slate-100 active:scale-95 transition-all"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleSubmit}
                        disabled={loading || !formData.nome}
                        className="flex-[2] h-[65px] rounded-2xl font-bold text-white bg-slate-900 flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50"
                    >
                        {loading ? (
                            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Save className="w-6 h-6" />
                                Salvar Item
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
