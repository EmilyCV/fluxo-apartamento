'use client';

import React, { useState } from 'react';
import { 
    Ambiente, 
    Categoria, 
    SubCategoria, 
    Prioridade, 
    CompraItem 
} from '../types';
import { 
    X, 
    Save, 
    Calculator, 
    Link as LinkIcon, 
    Trash2, 
    Home, 
    ChefHat, 
    Tv, 
    Sun, 
    Bath, 
    Monitor, 
    Bed, 
    Package,
    Zap,
    Clock,
    PauseCircle,
    FileText,
    CheckCircle2,
    Hammer,
    Smartphone,
    Utensils,
    Shirt,
    AlertCircle,
    ExternalLink
} from 'lucide-react';
import { comprasService } from '../services/comprasService';
import { CustomSelect, SelectOption } from '../../../shared/components/CustomSelect';
import { CurrencyInput } from '../../../shared/components/CurrencyInput';
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog';

interface ItemFormProps {
    onSave: (item: Omit<CompraItem, "id" | "createdAt" | "updatedAt">, id?: string) => Promise<void>;
    onClose: () => void;
    initialData?: CompraItem;
}

const AMBIENTES_OPTIONS: SelectOption[] = [
    { value: "1. Cozinha", label: "Cozinha", icon: <ChefHat className="w-4 h-4" /> },
    { value: "2. Sala", label: "Sala", icon: <Tv className="w-4 h-4" /> },
    { value: "3. Varanda", label: "Varanda", icon: <Sun className="w-4 h-4" /> },
    { value: "4. Banheiro", label: "Banheiro", icon: <Bath className="w-4 h-4" /> },
    { value: "5. Escritório", label: "Escritório", icon: <Monitor className="w-4 h-4" /> },
    { value: "6. Quarto", label: "Quarto", icon: <Bed className="w-4 h-4" /> },
    { value: "7. Gerais", label: "Gerais", icon: <Package className="w-4 h-4" /> },
];

const PRIORIDADES_OPTIONS: SelectOption[] = [
    { value: "Comprar agora", label: "Comprar agora", icon: <Zap className="w-4 h-4 text-amber-500" /> },
    { value: "Quando der", label: "Quando der", icon: <Clock className="w-4 h-4 text-blue-500" /> },
    { value: "Pode esperar", label: "Pode esperar", icon: <PauseCircle className="w-4 h-4 text-slate-400" /> },
    { value: "Aguardando projeto", label: "Aguardando projeto", icon: <FileText className="w-4 h-4 text-purple-500" /> },
    { value: "Adquirido", label: "Adquirido", icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" /> },
];

const CATEGORIAS_OPTIONS: SelectOption[] = [
    { value: "1. Reforma", label: "Reforma", icon: <Hammer className="w-4 h-4" /> },
    { value: "2. Eletros", label: "Eletros", icon: <Smartphone className="w-4 h-4" /> },
    { value: "3. Utensílios", label: "Utensílios", icon: <Utensils className="w-4 h-4" /> },
    { value: "4. Enxoval", label: "Enxoval", icon: <Shirt className="w-4 h-4" /> },
];

const AMBIENTES: Ambiente[] = ["1. Cozinha", "2. Sala", "3. Varanda", "4. Banheiro", "5. Escritório", "6. Quarto", "7. Gerais"];
const CATEGORIAS: Categoria[] = ["1. Reforma", "2. Eletros", "3. Utensílios", "4. Enxoval"];

const SUB_CATEGORIAS: Record<Categoria, SubCategoria[]> = {
    "1. Reforma": ["Móveis planejados", "Móveis convencionais", "Materiais"],
    "2. Eletros": ["Eletrodomésticos", "Eletroportáteis"],
    "3. Utensílios": ["Utensílios cozinha", "Utensílios limpeza", "Utensílios gerais", "Utensílios higiene"],
    "4. Enxoval": ["Casa e banho", "Cama"]
};

const PRIORIDADES: Prioridade[] = ["Comprar agora", "Quando der", "Pode esperar", "Aguardando projeto", "Adquirido"];

export function ItemForm({ onSave, onClose, initialData }: ItemFormProps) {
    const initialPrioridade = initialData?.adquirido ? "Adquirido" : initialData?.prioridade || PRIORIDADES[0];
    const initialAdquirido = initialPrioridade === "Adquirido" || (initialData?.adquirido ?? false);

    const [loading, setLoading] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [formData, setFormData] = useState({
        nome: initialData?.nome || '',
        ambiente: initialData?.ambiente || AMBIENTES[0],
        categoria: initialData?.categoria || CATEGORIAS[0],
        subCategoria: initialData?.subCategoria || SUB_CATEGORIAS[CATEGORIAS[0]][0],
        prioridade: initialPrioridade,
        quantidade: initialData?.quantidade || 1,
        valorUnitario: initialData?.valorUnitario || 0,
        modelo: initialData?.modelo || '',
        fabricante: initialData?.fabricante || '',
        link: initialData?.link || '',
        observacoes: initialData?.observacoes || '',
        adquirido: initialAdquirido
    });

    const valorTotal = formData.quantidade * formData.valorUnitario;

    const subCategoriasOptions: SelectOption[] = SUB_CATEGORIAS[formData.categoria].map(sub => ({
        value: sub,
        label: sub.includes('. ') ? sub.split('. ')[1] : sub,
        icon: CATEGORIAS_OPTIONS.find(c => c.value === formData.categoria)?.icon
    }));

    const handleDelete = async () => {
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        if (!initialData?.id) return;
        setLoading(true);
        try {
            await comprasService.deleteItem(initialData.id);
            setShowDeleteConfirm(false);
            onClose();
        } catch (error) {
            console.error("Erro ao deletar:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSaveError(null);
        try {
            const prioridade = formData.adquirido ? "Adquirido" : formData.prioridade;
            await onSave({
                ...formData,
                prioridade,
                adquirido: prioridade === "Adquirido",
                valorTotalAproximado: valorTotal
            }, initialData?.id);
            onClose();
        } catch (error) {
            console.error("Erro ao salvar:", error);
            setSaveError("Não foi possível salvar. Verifique sua conexão e tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="bg-white w-full max-w-[550px] h-[94dvh] sm:h-auto sm:max-h-[90dvh] rounded-t-[48px] sm:rounded-[40px] overflow-hidden flex flex-col shadow-2xl animate-pop">
                
                {/* Header */}
                <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center sticky top-0 bg-white/80 backdrop-blur-md z-10">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-black text-slate-900 tracking-tighter">
                            {initialData ? 'Editar Item' : 'Novo Item'}
                        </h2>
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Detalhes da Compra</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {initialData && (
                            <button 
                                type="button"
                                onClick={handleDelete}
                                className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-400 hover:text-red-600 transition-all active:scale-90 shadow-sm border border-white"
                                title="Excluir Item"
                                aria-label="Excluir item"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        )}
                        <button 
                            onClick={onClose} 
                            className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all active:scale-90 shadow-sm border border-white"
                            aria-label="Fechar formulário"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-10 py-8 space-y-8 no-scrollbar pb-32 bg-white">
                    
                    <div className="space-y-3">
                        <label htmlFor="item-nome" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">O que vamos comprar?</label>
                        <input 
                            required
                            id="item-nome"
                            type="text"
                            placeholder="Nome do item..."
                            className="w-full h-16 bg-slate-50 border-2 border-transparent focus:border-brand-pink focus:bg-white rounded-[24px] px-6 text-lg font-bold text-slate-900 transition-all outline-none shadow-sm"
                            value={formData.nome}
                            onChange={e => setFormData({...formData, nome: e.target.value})}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <CustomSelect 
                            label="Ambiente"
                            options={AMBIENTES_OPTIONS}
                            value={formData.ambiente}
                            onChange={val => setFormData({...formData, ambiente: val as Ambiente})}
                            searchable
                            color="blue"
                        />
                        <CustomSelect 
                            label="Prioridade"
                            options={PRIORIDADES_OPTIONS}
                            value={formData.prioridade}
                            onChange={val => {
                                const prioridade = val as Prioridade;
                                setFormData({
                                    ...formData,
                                    prioridade,
                                    adquirido: prioridade === "Adquirido"
                                });
                            }}
                            color="pink"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <label htmlFor="item-quantidade" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Quantidade</label>
                            <input 
                                id="item-quantidade"
                                type="number"
                                min="1"
                                className="w-full h-16 bg-slate-50 border-2 border-transparent focus:border-brand-green focus:bg-white rounded-[24px] px-6 text-lg font-bold text-slate-900 outline-none shadow-sm transition-all"
                                value={formData.quantidade}
                                onChange={e => {
                                    const val = Math.max(1, Number(e.target.value));
                                    setFormData({...formData, quantidade: val});
                                }}
                            />
                        </div>
                        <CurrencyInput 
                            label="Preço Unitário"
                            value={formData.valorUnitario}
                            onChange={val => setFormData({...formData, valorUnitario: val})}
                        />
                    </div>

                    {/* Valor Total com Estilo Chá Revelação */}
                    <div className="bg-gradient-to-br from-brand-blue-light to-white p-8 rounded-[32px] border border-brand-blue/20 flex items-center justify-between shadow-premium" role="status" aria-label={`Total estimado: ${formatCurrency(valorTotal)}`}>
                        <div className="flex items-center gap-3 text-brand-blue-dark">
                            <Calculator className="w-6 h-6" aria-hidden="true" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Total Estimado</span>
                        </div>
                        <span className="text-3xl font-black text-slate-900 tracking-tighter">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorTotal)}
                        </span>
                    </div>

                    <div className="space-y-4">
                        <CustomSelect 
                            label="Categoria"
                            options={CATEGORIAS_OPTIONS}
                            value={formData.categoria}
                            onChange={val => {
                                const cat = val as Categoria;
                                setFormData({...formData, categoria: cat, subCategoria: SUB_CATEGORIAS[cat][0]});
                            }}
                            color="slate"
                        />
                        <CustomSelect 
                            label="Estilo / Subcategoria"
                            options={subCategoriasOptions}
                            value={formData.subCategoria}
                            onChange={val => setFormData({...formData, subCategoria: val as SubCategoria})}
                            color="pink"
                            placeholder="Selecione o estilo..."
                        />
                    </div>

                    <div className="space-y-3">
                        {formData.link ? (
                            <a 
                                href={formData.link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-[10px] font-black text-slate-400 hover:text-brand-blue-dark uppercase tracking-widest ml-1 flex items-center gap-2 transition-colors w-fit"
                            >
                                <LinkIcon className="w-4 h-4" aria-hidden="true" /> Link do Produto
                                <ExternalLink className="w-3 h-3" aria-hidden="true" />
                            </a>
                        ) : (
                            <label htmlFor="item-link" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <LinkIcon className="w-4 h-4" aria-hidden="true" /> Link do Produto
                            </label>
                        )}
                        <input 
                            id="item-link"
                            type="url"
                            placeholder="https://..."
                            className="w-full h-16 bg-slate-50 border-2 border-transparent rounded-[24px] px-6 text-sm font-bold text-slate-900 outline-none shadow-sm focus:border-brand-blue focus:bg-white transition-all"
                            value={formData.link}
                            onChange={e => setFormData({...formData, link: e.target.value})}
                        />
                    </div>

                    <div className="space-y-3">
                        <label htmlFor="item-observacoes" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                            Observações <span className="text-[8px] opacity-50 ml-1">(Opcional)</span>
                        </label>
                        <textarea 
                            id="item-observacoes"
                            rows={3}
                            className="w-full bg-slate-50 border-2 border-transparent rounded-[24px] p-6 text-sm font-bold text-slate-900 outline-none shadow-sm focus:border-slate-300 focus:bg-white transition-all resize-none"
                            value={formData.observacoes}
                            onChange={e => setFormData({...formData, observacoes: e.target.value})}
                        />
                    </div>
                </form>

                {/* Footer Actions */}
                <div className="bg-white border-t border-slate-50 sticky bottom-0 z-10 shadow-[0_-20px_40px_rgba(0,0,0,0.02)]">
                    {saveError && (
                        <div className="px-10 pt-6">
                            <div className="bg-red-50 border border-red-100 rounded-2xl px-5 py-3 flex items-center gap-3" role="alert">
                                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                                <p className="text-xs font-bold text-red-600">{saveError}</p>
                            </div>
                        </div>
                    )}
                    
                    <div className="p-10 flex gap-4">
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

                <ConfirmDialog
                    isOpen={showDeleteConfirm}
                    title="Excluir item"
                    message="Esta ação não pode ser desfeita. O item será removido permanentemente."
                    confirmLabel="Excluir"
                    cancelLabel="Cancelar"
                    variant="danger"
                    onConfirm={confirmDelete}
                    onCancel={() => setShowDeleteConfirm(false)}
                />
            </div>
        </div>
    );
}

function formatCurrency(val: number) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
}
