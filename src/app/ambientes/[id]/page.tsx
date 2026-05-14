'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppLayout } from '@/shared/components/AppLayout';
import { comprasService } from '@/modules/compras/services/comprasService';
import { CompraItem, Ambiente } from '@/modules/compras/types';
import { ItemForm } from '@/modules/compras/components/ItemForm';
import { 
    ChevronLeft, 
    CheckCircle2, 
    Plus,
    LayoutGrid,
    Sparkles,
    ShoppingCart,
    SortAsc,
    Clock,
    Zap,
    ArrowUpNarrowWide
} from 'lucide-react';
import { hapticFeedback } from '@/shared/utils/haptics';
import { cn } from '@/shared/utils/cn';

type SortOrder = 'recentes' | 'prioridade' | 'alfabetico' | 'preco';

export default function AmbienteDetailPage() {
    const params = useParams();
    const router = useRouter();
    const ambienteRaw = decodeURIComponent(params.id as string) as Ambiente;
    
    const [items, setItems] = useState<CompraItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState<CompraItem | undefined>(undefined);
    
    const [ordenacao, setOrdenacao] = useState<SortOrder>('recentes');
    const [alfabeticoAsc, setAlfabeticoAsc] = useState(true);
    const [precoAsc, setPrecoAsc] = useState(true);

    useEffect(() => {
        const unsubscribe = comprasService.subscribeToItems((data) => {
            const filtered = data.filter(item => item.ambiente === ambienteRaw);
            setItems(filtered);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [ambienteRaw]);

    const formatCurrency = (val: number) => 
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    const handleSaveItem = async (data: Omit<CompraItem, "id" | "createdAt" | "updatedAt">, id?: string) => {
        if (id) await comprasService.updateItem(id, data);
        else await comprasService.addItem(data);
        setIsFormOpen(false);
        setItemToEdit(undefined);
    };

    const handleAlfabetico = () => {
        if (ordenacao === 'alfabetico') {
            setAlfabeticoAsc(prev => !prev);
        } else {
            setOrdenacao('alfabetico');
            setAlfabeticoAsc(true);
        }
    };

    const handlePreco = () => {
        if (ordenacao === 'preco') {
            setPrecoAsc(prev => !prev);
        } else {
            setOrdenacao('preco');
            setPrecoAsc(true);
        }
    };

    const sortedItems = useMemo(() => {
        const list = [...items];
        
        if (ordenacao === 'alfabetico') {
            return list.sort((a, b) => 
                alfabeticoAsc 
                    ? a.nome.localeCompare(b.nome)
                    : b.nome.localeCompare(a.nome)
            );
        }

        if (ordenacao === 'preco') {
            return list.sort((a, b) => 
                precoAsc
                    ? (a.valorTotalAproximado || 0) - (b.valorTotalAproximado || 0)
                    : (b.valorTotalAproximado || 0) - (a.valorTotalAproximado || 0)
            );
        }
        
        if (ordenacao === 'prioridade') {
            const order = ['Comprar agora', 'Quando der', 'Pode esperar', 'Aguardando projeto', 'Adquirido'];
            return list.sort((a, b) => order.indexOf(a.prioridade) - order.indexOf(b.prioridade));
        }

        return list; // 'recentes'
    }, [items, ordenacao, alfabeticoAsc, precoAsc]);

    return (
        <AppLayout>
            <div className="max-w-6xl mx-auto px-6 py-10 md:px-12 space-y-12">
                
                <header className="space-y-8 animate-pop">
                    <button 
                        onClick={() => router.push('/ambientes')}
                        className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all shadow-sm border border-slate-100 active:scale-90"
                        aria-label="Voltar para ambientes"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-brand-pink rounded-full animate-pulse shadow-[0_0_8px_rgba(251,207,232,0.8)]"></div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Ambiente</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter italic">
                                {ambienteRaw.split('. ')[1]}
                            </h1>
                        </div>
                        
                        <div className="card-pop bg-gradient-to-br from-slate-900 to-slate-800 p-8 flex gap-12 relative overflow-hidden border-none text-white shadow-2xl">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-pink opacity-10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                            <div className="relative z-10">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Total</p>
                                <p className="text-2xl font-black tracking-tight">{formatCurrency(items.reduce((acc, curr) => acc + (curr.valorTotalAproximado || 0), 0))}</p>
                            </div>
                            <div className="relative z-10">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Comprado</p>
                                <p className="text-2xl font-black tracking-tight text-brand-green">{formatCurrency(items.filter(i => i.adquirido).reduce((acc, curr) => acc + (curr.valorTotalAproximado || 0), 0))}</p>
                            </div>
                        </div>
                    </div>

                    {items.length > 1 && (
                        <div className="flex bg-slate-100 p-1 rounded-2xl w-fit shadow-sm border border-slate-200/50" role="group" aria-label="Ordenação de itens">
                            <button
                                onClick={() => setOrdenacao('recentes')}
                                className={cn(
                                    "flex items-center gap-2 h-10 px-4 rounded-[14px] text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                                    ordenacao === 'recentes' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                                )}
                            >
                                <Clock className="w-3.5 h-3.5" />
                                <span className={cn("hidden sm:inline", ordenacao === 'recentes' ? "inline" : "hidden")}>Recentes</span>
                            </button>

                            <button
                                onClick={() => setOrdenacao('prioridade')}
                                className={cn(
                                    "flex items-center gap-2 h-10 px-4 rounded-[14px] text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                                    ordenacao === 'prioridade' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                                )}
                            >
                                <Zap className="w-3.5 h-3.5" />
                                <span className={cn("hidden sm:inline", ordenacao === 'prioridade' ? "inline" : "hidden")}>Prioridade</span>
                            </button>

                            <button
                                onClick={handleAlfabetico}
                                className={cn(
                                    "flex items-center gap-2 h-10 px-4 rounded-[14px] text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                                    ordenacao === 'alfabetico' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                                )}
                                title={alfabeticoAsc ? 'Ordenar Z-A' : 'Ordenar A-Z'}
                            >
                                <SortAsc className={cn(
                                    "w-3.5 h-3.5 transition-transform duration-300",
                                    ordenacao === 'alfabetico' && !alfabeticoAsc && "rotate-180"
                                )} />
                                <span className={cn("hidden sm:inline", ordenacao === 'alfabetico' ? "inline" : "hidden")}>A-Z</span>
                            </button>

                            <button
                                onClick={handlePreco}
                                className={cn(
                                    "flex items-center gap-2 h-10 px-4 rounded-[14px] text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                                    ordenacao === 'preco' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                                )}
                                title={precoAsc ? 'Preço decrescente' : 'Preço crescente'}
                            >
                                <ArrowUpNarrowWide className={cn(
                                    "w-3.5 h-3.5 transition-transform duration-300",
                                    ordenacao === 'preco' && !precoAsc && "rotate-180"
                                )} />
                                <span className={cn("hidden sm:inline", ordenacao === 'preco' ? "inline" : "hidden")}>Preço</span>
                            </button>
                        </div>
                    )}
                </header>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {[1, 2, 3, 4].map(i => <div key={i} className="h-48 bg-white rounded-[40px] animate-pulse" />)}
                    </div>
                ) : items.length === 0 ? (
                    <div className="text-center py-32 bg-white rounded-[48px] border-2 border-dashed border-slate-100 flex flex-col items-center animate-pop shadow-sm">
                        <div className="w-24 h-24 bg-brand-blue-light rounded-[32px] flex items-center justify-center mb-6 shadow-sm border border-brand-blue/20">
                            <LayoutGrid className="w-10 h-10 text-brand-blue-dark" aria-hidden="true" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-2">Ambiente vazio</h2>
                        <p className="text-slate-400 font-medium mb-8 italic">Você ainda não adicionou nenhum item para este cômodo.</p>
                        <button 
                            onClick={() => setIsFormOpen(true)}
                            className="btn-pop bg-slate-900 text-white shadow-xl shadow-slate-900/10 hover:scale-105 active:scale-95 px-12"
                            aria-label="Adicionar primeiro item"
                        >
                            <Plus className="w-5 h-5" strokeWidth={3} /> Adicionar Item
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pb-32">
                        {sortedItems.map((item, i) => (
                            <div 
                                key={item.id}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => e.key === 'Enter' && (setItemToEdit(item), setIsFormOpen(true))}
                                onClick={() => { setItemToEdit(item); setIsFormOpen(true); }}
                                className={cn(
                                    "card-pop group flex flex-col p-10 gap-10 cursor-pointer relative overflow-hidden animate-pop border-slate-100/60",
                                    item.adquirido ? 'bg-slate-50/50 opacity-60 grayscale-[0.5]' : 'bg-white'
                                )}
                                style={{ animationDelay: `${i * 50}ms` }}
                            >
                                {item.adquirido && (
                                    <div className="absolute top-0 right-0 bg-brand-green text-brand-green-dark px-6 py-2.5 rounded-bl-[24px] text-[10px] font-black uppercase tracking-widest shadow-sm z-10">
                                        Adquirido
                                    </div>
                                )}
                                
                                <div className="space-y-8 flex-1 min-w-0">
                                    <div className="flex items-start justify-between">
                                        <div className="flex flex-wrap gap-2">
                                            <span className="text-[10px] font-black uppercase bg-brand-blue-light text-brand-blue-dark px-4 py-1.5 rounded-xl tracking-tighter border border-brand-blue/10">
                                                {item.prioridade}
                                            </span>
                                            <span className="text-[10px] font-black uppercase bg-slate-50 text-slate-400 px-4 py-1.5 rounded-xl tracking-tighter border border-slate-100">
                                                {item.subCategoria.split('. ')[1] || item.subCategoria}
                                            </span>
                                        </div>
                                        {!item.adquirido && <ShoppingCart className="w-5 h-5 text-slate-100 group-hover:text-brand-pink-dark transition-colors" aria-hidden="true" />}
                                    </div>

                                    <div className="space-y-2">
                                        <h3 className={`text-3xl font-black leading-[1.15] tracking-tight group-hover:text-brand-pink-dark transition-colors break-words ${
                                            item.adquirido ? 'text-slate-300 line-through' : 'text-slate-900'
                                        }`}>
                                            {item.nome}
                                        </h3>
                                        {item.fabricante && (
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">{item.fabricante}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-10 border-t border-slate-50/80 mt-auto">
                                    <div className="flex flex-col gap-1.5">
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Investimento</p>
                                        <p className={`text-3xl font-black tracking-tighter ${item.adquirido ? 'text-slate-300' : 'text-slate-900'}`}>
                                            {formatCurrency(item.valorTotalAproximado)}
                                        </p>
                                    </div>
                                    <button 
                                        aria-label={item.adquirido ? 'Marcar como pendente' : 'Marcar como adquirido'}
                                        aria-pressed={item.adquirido}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            hapticFeedback('success');
                                            comprasService.toggleAdquirido(item.id, item.adquirido);
                                        }}
                                        className={cn(
                                            "w-16 h-16 rounded-[24px] flex items-center justify-center transition-all shadow-sm active:scale-90",
                                            item.adquirido 
                                            ? 'bg-brand-green text-white shadow-brand-green/20' 
                                            : 'bg-slate-50 text-slate-200 hover:bg-brand-green-light hover:text-brand-green-dark hover:scale-110'
                                        )}
                                    >
                                        <CheckCircle2 className={cn("w-8 h-8", item.adquirido ? 'stroke-[3px]' : 'stroke-[2px]')} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <button 
                    onClick={() => { setItemToEdit(undefined); setIsFormOpen(true); }}
                    className="md:hidden fixed fab-safe-bottom right-8 w-20 h-20 bg-slate-900 text-white rounded-[32px] shadow-2xl flex items-center justify-center active:scale-75 transition-all z-[110] border-4 border-white shadow-slate-900/30"
                    aria-label="Adicionar novo item"
                >
                    <Plus className="w-10 h-10" strokeWidth={3} />
                </button>

                {isFormOpen && (
                    <ItemForm 
                        initialData={itemToEdit}
                        onClose={() => { setIsFormOpen(false); setItemToEdit(undefined); }}
                        onSave={handleSaveItem}
                    />
                )}
            </div>
        </AppLayout>
    );
}
