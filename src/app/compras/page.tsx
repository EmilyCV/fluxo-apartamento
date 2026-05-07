'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/modules/auth/contexts/AuthContext';
import { AppLayout } from '@/shared/components/AppLayout';
import { comprasService } from '@/modules/compras/services/comprasService';
import { CompraItem, Ambiente, Categoria } from '@/modules/compras/types';
import { ItemForm } from '@/modules/compras/components/ItemForm';
import { 
    Search, 
    CheckCircle2, 
    FilterX,
    Plus,
    ShoppingCart
} from 'lucide-react';

const AMBIENTES: Ambiente[] = ["1. Cozinha", "2. Sala", "3. Varanda", "4. Banheiro", "5. Escritório", "6. Quarto", "7. Gerais"];
const CATEGORIAS: Categoria[] = ["1. Reforma", "2. Eletros", "3. Utensílios", "4. Enxoval"];

export default function ComprasPage() {
    const [items, setItems] = useState<CompraItem[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [search, setSearch] = useState('');
    const [filtroAmbiente, setFiltroAmbiente] = useState<Ambiente | 'Todos'>('Todos');
    const [filtroCategoria, setFiltroCategoria] = useState<Categoria | 'Todas'>('Todas');
    const [verComprados, setVerComprados] = useState(true);

    const [itemToEdit, setItemToEdit] = useState<CompraItem | undefined>(undefined);
    const [isFormOpen, setIsFormOpen] = useState(false);

    useEffect(() => {
        const unsubscribe = comprasService.subscribeToItems(
            (data) => {
                setItems(data);
                setLoading(false);
            },
            (error) => {
                setLoading(false);
            }
        );
        return () => unsubscribe();
    }, []);

    const filteredItems = items.filter(item => {
        const matchSearch = item.nome.toLowerCase().includes(search.toLowerCase()) || 
                            item.fabricante?.toLowerCase().includes(search.toLowerCase());
        const matchAmbiente = filtroAmbiente === 'Todos' || item.ambiente === filtroAmbiente;
        const matchCategoria = filtroCategoria === 'Todas' || item.categoria === filtroCategoria;
        const matchStatus = verComprados ? true : !item.adquirido;
        return matchSearch && matchAmbiente && matchCategoria && matchStatus;
    });

    const handleSaveItem = async (data: Omit<CompraItem, "id" | "createdAt" | "updatedAt">, id?: string) => {
        if (id) await comprasService.updateItem(id, data);
        else await comprasService.addItem(data);
        setIsFormOpen(false);
        setItemToEdit(undefined);
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    return (
        <AppLayout>
            <div className="max-w-6xl mx-auto px-6 py-10 md:px-12 space-y-12">
                <header className="mb-12 space-y-8 animate-pop">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-2">
                            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Lista de Compras</h1>
                            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">Todos os itens planejados</p>
                        </div>
                        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                            <div className="relative w-full md:w-80">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                <input 
                                    type="text"
                                    placeholder="Pesquisar..."
                                    className="w-full h-14 bg-white border border-slate-100 rounded-[24px] pl-12 pr-4 outline-none focus:border-slate-900 transition-all text-sm font-bold shadow-sm"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                            </div>
                            {items.length > 0 && (
                                <button 
                                    onClick={() => { setItemToEdit(undefined); setIsFormOpen(true); }}
                                    className="hidden md:flex btn-pop bg-slate-900 text-white shadow-xl shadow-slate-900/10 hover:bg-black px-10 h-14"
                                >
                                    <Plus className="w-5 h-5" strokeWidth={3} />
                                    Novo Item
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                        <button 
                            onClick={() => setVerComprados(!verComprados)}
                            className={`shrink-0 h-11 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                verComprados ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/10' : 'bg-white text-slate-400 border border-slate-100'
                            }`}
                        >
                            {verComprados ? 'Ver Tudo' : 'Pendentes'}
                        </button>
                        <select 
                            className="shrink-0 h-11 px-6 bg-white border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 outline-none shadow-sm appearance-none"
                            value={filtroAmbiente}
                            onChange={e => setFiltroAmbiente(e.target.value as any)}
                        >
                            <option value="Todos">Cômodo</option>
                            {AMBIENTES.map(a => <option key={a} value={a}>{a.split('. ')[1]}</option>)}
                        </select>
                        <select 
                            className="shrink-0 h-11 px-6 bg-white border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 outline-none shadow-sm appearance-none"
                            value={filtroCategoria}
                            onChange={e => setFiltroCategoria(e.target.value as any)}
                        >
                            <option value="Todas">Categoria</option>
                            {CATEGORIAS.map(c => <option key={c} value={c}>{c.split('. ')[1]}</option>)}
                        </select>
                    </div>
                </header>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-56 bg-white rounded-[40px] animate-pulse" />)}
                    </div>
                ) : items.length === 0 ? (
                    /* ESTADO VAZIO: LISTA TOTALMENTE VAZIA */
                    <div className="text-center py-32 bg-white rounded-[48px] border-2 border-dashed border-slate-100 flex flex-col items-center animate-pop shadow-sm">
                        <div className="w-24 h-24 bg-brand-pink-light rounded-[32px] flex items-center justify-center mb-6 shadow-sm border border-brand-pink/20">
                            <ShoppingCart className="w-10 h-10 text-brand-pink-dark" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-2">Sua lista está vazia</h2>
                        <p className="text-slate-400 font-medium mb-8 max-w-xs mx-auto italic text-center px-6">Nenhum item cadastrado ainda. Vamos planejar algo novo?</p>
                        <button 
                            onClick={() => setIsFormOpen(true)}
                            className="btn-pop bg-slate-900 text-white shadow-xl shadow-slate-900/10 hover:scale-105 active:scale-95 px-12"
                        >
                            <Plus className="w-5 h-5" strokeWidth={3} /> Adicionar Primeiro Item
                        </button>
                    </div>
                ) : filteredItems.length === 0 ? (
                    /* ESTADO VAZIO: FILTROS SEM RESULTADO */
                    <div className="text-center py-32 bg-white rounded-[48px] border border-slate-100 flex flex-col items-center animate-pop shadow-sm">
                        <FilterX className="w-16 h-16 text-slate-100 mb-4" />
                        <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.3em]">Nenhum item encontrado nos filtros</p>
                        <button onClick={() => {setSearch(''); setFiltroAmbiente('Todos'); setFiltroCategoria('Todas'); setVerComprados(true);}} className="mt-4 text-brand-blue-dark font-bold text-xs underline underline-offset-4">Limpar Filtros</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 pb-32">
                        {filteredItems.map(item => (
                            <div 
                                key={item.id}
                                onClick={() => { setItemToEdit(item); setIsFormOpen(true); }}
                                className={`card-pop group flex flex-col p-10 gap-10 cursor-pointer relative overflow-hidden animate-pop border-slate-100/60 ${
                                    item.adquirido ? 'bg-slate-50/50 opacity-60 grayscale-[0.5]' : 'bg-white'
                                }`}
                            >
                                {item.adquirido && (
                                    <div className="absolute top-0 right-0 bg-brand-green text-brand-green-dark px-6 py-2.5 rounded-bl-[24px] text-[10px] font-black uppercase tracking-widest shadow-sm z-10">
                                        Adquirido
                                    </div>
                                )}
                                
                                <div className="space-y-8 flex-1">
                                    <div className="flex items-start justify-between">
                                        <div className="flex flex-wrap gap-2">
                                            <span className="text-[10px] font-black uppercase bg-brand-blue-light text-brand-blue-dark px-4 py-1.5 rounded-xl tracking-tighter border border-brand-blue/10">
                                                {item.ambiente.split('. ')[1]}
                                            </span>
                                            <span className="text-[10px] font-black uppercase bg-slate-50 text-slate-400 px-4 py-1.5 rounded-xl tracking-tighter border border-slate-100">
                                                {item.prioridade}
                                            </span>
                                        </div>
                                        {!item.adquirido && <ShoppingCart className="w-5 h-5 text-slate-100 group-hover:text-brand-pink-dark transition-colors" />}
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
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            comprasService.toggleAdquirido(item.id, item.adquirido);
                                        }}
                                        className={`w-16 h-16 rounded-[24px] flex items-center justify-center transition-all shadow-sm active:scale-90 ${
                                            item.adquirido 
                                            ? 'bg-brand-green text-white shadow-brand-green/20' 
                                            : 'bg-slate-50 text-slate-200 hover:bg-brand-green-light hover:text-brand-green-dark hover:scale-110'
                                        }`}
                                    >
                                        <CheckCircle2 className={`w-8 h-8 ${item.adquirido ? 'stroke-[3px]' : 'stroke-[2px]'}`} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* FAB MOBILE CONSISTENTE */}
                <button 
                    onClick={() => { setItemToEdit(undefined); setIsFormOpen(true); }}
                    className="md:hidden fixed bottom-32 right-8 w-20 h-20 bg-slate-900 text-white rounded-[32px] shadow-2xl flex items-center justify-center active:scale-75 transition-all z-[110] border-4 border-white shadow-slate-900/30"
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
