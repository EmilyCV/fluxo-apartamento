'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/modules/auth/contexts/AuthContext';
import { comprasService } from '@/modules/compras/services/comprasService';
import { CompraItem, Ambiente, Categoria } from '@/modules/compras/types';
import { ItemForm } from '@/modules/compras/components/ItemForm';
import { 
    ChevronLeft, 
    Search, 
    CheckCircle2, 
    Trash2, 
    ExternalLink,
    FilterX
} from 'lucide-react';

const AMBIENTES: Ambiente[] = ["1. Cozinha", "2. Sala", "3. Varanda", "4. Banheiro", "5. Escritório", "6. Quarto", "7. Gerais"];
const CATEGORIAS: Categoria[] = ["1. Reforma", "2. Eletros", "3. Utensílios", "4. Enxoval"];

export default function ComprasPage() {
    const router = useRouter();
    const [items, setItems] = useState<CompraItem[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [search, setSearch] = useState('');
    const [filtroAmbiente, setFiltroAmbiente] = useState<Ambiente | 'Todos'>('Todos');
    const [filtroCategoria, setFiltroCategoria] = useState<Categoria | 'Todas'>('Todas');
    const [verComprados, setVerComprados] = useState(true);

    const [itemToEdit, setItemToEdit] = useState<CompraItem | undefined>(undefined);
    const [isFormOpen, setIsFormOpen] = useState(false);

    useEffect(() => {
        const unsubscribe = comprasService.subscribeToItems((data) => {
            setItems(data);
            setLoading(false);
        });
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
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (confirm('Tem certeza que deseja excluir este item?')) {
            await comprasService.deleteItem(id);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    return (
        <div className="min-h-screen bg-slate-100 sm:py-8">
            <main className="mobile-container flex flex-col bg-slate-50 overflow-hidden">
                {/* Header Fixo Premium */}
                <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-2xl border-b border-slate-100 shadow-premium">
                    <div className="px-8 py-6 flex items-center gap-4">
                        <button 
                            onClick={() => router.push('/dashboard')}
                            className="btn-icon bg-slate-50 text-slate-400 active:scale-90 transition-all shadow-sm"
                        >
                            <ChevronLeft className="w-8 h-8" />
                        </button>
                        <div className="flex-1 relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
                            <input 
                                type="text"
                                placeholder="O que você procura?"
                                className="w-full h-[55px] bg-slate-50 rounded-2xl pl-12 pr-4 outline-none border-2 border-transparent focus:border-slate-900 focus:bg-white transition-all text-sm font-bold"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Horizontal Scroller Filtros */}
                    <div className="px-8 pb-6 flex gap-3 overflow-x-auto no-scrollbar">
                        <button 
                            onClick={() => setVerComprados(!verComprados)}
                            className={`shrink-0 h-11 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${
                                verComprados ? 'bg-slate-900 text-white' : 'bg-white text-slate-400 border border-slate-100'
                            }`}
                        >
                            {verComprados ? 'Todos' : 'Faltam'}
                        </button>
                        <select 
                            className="shrink-0 h-11 px-6 bg-white border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 outline-none shadow-sm appearance-none"
                            value={filtroAmbiente}
                            onChange={e => setFiltroAmbiente(e.target.value as any)}
                        >
                            <option value="Todos">Ambientes</option>
                            {AMBIENTES.map(a => <option key={a} value={a}>{a.split('. ')[1]}</option>)}
                        </select>
                        <select 
                            className="shrink-0 h-11 px-6 bg-white border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 outline-none shadow-sm appearance-none"
                            value={filtroCategoria}
                            onChange={e => setFiltroCategoria(e.target.value as any)}
                        >
                            <option value="Todas">Categorias</option>
                            {CATEGORIAS.map(c => <option key={c} value={c}>{c.split('. ')[1]}</option>)}
                        </select>
                    </div>
                </header>

                {/* Listagem Premium */}
                <div className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar pb-24">
                    <div className="flex justify-between items-center px-2">
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
                            {filteredItems.length} Itens na lista
                        </span>
                    </div>

                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-white rounded-[32px] animate-pulse" />)}
                        </div>
                    ) : filteredItems.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-[40px] border-2 border-dashed border-slate-100">
                            <FilterX className="w-16 h-16 text-slate-100 mx-auto mb-4" />
                            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">Nada encontrado</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredItems.map(item => (
                                <div 
                                    key={item.id}
                                    onClick={() => { setItemToEdit(item); setIsFormOpen(true); }}
                                    className={`card-premium flex flex-col gap-6 active:scale-[0.98] transition-all relative overflow-hidden cursor-pointer group ${item.adquirido ? 'bg-slate-50/50' : 'bg-white'}`}
                                >
                                    {item.adquirido && <div className="absolute top-0 right-0 bg-brand-green text-brand-green-dark px-4 py-1 rounded-bl-2xl text-[10px] font-black uppercase tracking-tighter">Adquirido</div>}
                                    
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="space-y-3 flex-1 min-w-0">
                                            <div className="flex flex-wrap gap-2">
                                                <span className="text-[10px] font-black uppercase bg-brand-blue/20 text-brand-blue-dark px-2 py-0.5 rounded-md tracking-tighter">
                                                    {item.ambiente.split('. ')[1]}
                                                </span>
                                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md tracking-tighter ${
                                                    item.prioridade === 'Comprar agora' ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-500'
                                                }`}>
                                                    {item.prioridade}
                                                </span>
                                            </div>
                                            <h3 className={`text-xl font-bold leading-tight group-hover:text-blue-600 transition-colors ${item.adquirido ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                                                {item.nome}
                                            </h3>
                                        </div>
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                comprasService.toggleAdquirido(item.id, item.adquirido);
                                            }}
                                            className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all shadow-sm ${item.adquirido ? 'bg-brand-green text-white' : 'bg-slate-50 text-slate-200 hover:bg-brand-green-light hover:text-brand-green-dark'}`}
                                        >
                                            <CheckCircle2 className="w-10 h-10" />
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between pt-5 border-t border-slate-50">
                                        <div className="flex flex-col">
                                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Preço Estimado</p>
                                            <p className={`text-xl font-black ${item.adquirido ? 'text-slate-400' : 'text-slate-800'}`}>
                                                {formatCurrency(item.valorTotalAproximado)}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            {item.link && (
                                                <a 
                                                    href={item.link} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="btn-icon bg-brand-blue-light text-brand-blue-dark hover:bg-brand-blue hover:text-white"
                                                >
                                                    <ExternalLink className="w-6 h-6" />
                                                </a>
                                            )}
                                            <button 
                                                onClick={(e) => handleDelete(e, item.id)}
                                                className="btn-icon bg-red-50 text-red-400 hover:bg-red-500 hover:text-white"
                                            >
                                                <Trash2 className="w-6 h-6" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {isFormOpen && (
                    <ItemForm 
                        initialData={itemToEdit}
                        onClose={() => { setIsFormOpen(false); setItemToEdit(undefined); }}
                        onSave={handleSaveItem}
                    />
                )}
            </main>
        </div>
    );
}
