'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppLayout } from '@/shared/components/AppLayout';
import { comprasService } from '@/modules/compras/services/comprasService';
import { CompraItem, Ambiente } from '@/modules/compras/types';
import { ItemForm } from '@/modules/compras/components/ItemForm';
import { 
    ChevronLeft, 
    CheckCircle2, 
    ExternalLink, 
    Trash2,
    Plus,
    LayoutGrid
} from 'lucide-react';

export default function AmbienteDetailPage() {
    const params = useParams();
    const router = useRouter();
    const ambienteRaw = decodeURIComponent(params.id as string) as Ambiente;
    
    const [items, setItems] = useState<CompraItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState<CompraItem | undefined>(undefined);

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

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (confirm('Deseja excluir este item?')) {
            await comprasService.deleteItem(id);
        }
    };

    const totalAmbiente = items.reduce((acc, curr) => acc + (curr.valorTotalAproximado || 0), 0);
    const totalComprado = items.filter(i => i.adquirido).reduce((acc, curr) => acc + (curr.valorTotalAproximado || 0), 0);

    return (
        <AppLayout>
            <div className="max-w-6xl mx-auto px-6 py-10 md:px-12">
                
                <header className="mb-12 space-y-8">
                    <button 
                        onClick={() => router.push('/ambientes')}
                        className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all shadow-sm border border-slate-100 active:scale-90"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-brand-blue rounded-full animate-pulse"></div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Ambiente</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter italic">
                                {ambienteRaw.split('. ')[1]}
                            </h1>
                        </div>
                        
                        <div className="bg-slate-900 p-8 rounded-[40px] text-white flex gap-12 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                            <div className="relative z-10">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Total</p>
                                <p className="text-2xl font-black tracking-tight">{formatCurrency(totalAmbiente)}</p>
                            </div>
                            <div className="relative z-10">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Comprado</p>
                                <p className="text-2xl font-black tracking-tight text-brand-green">{formatCurrency(totalComprado)}</p>
                            </div>
                        </div>
                    </div>
                </header>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[1, 2, 3, 4].map(i => <div key={i} className="h-48 bg-white rounded-[40px] animate-pulse" />)}
                    </div>
                ) : items.length === 0 ? (
                    <div className="text-center py-32 bg-white rounded-[48px] border-2 border-dashed border-slate-100 flex flex-col items-center">
                        <LayoutGrid className="w-16 h-16 text-slate-100 mb-4" />
                        <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.3em]">Nenhum item cadastrado</p>
                        <button 
                            onClick={() => setIsFormOpen(true)}
                            className="mt-6 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
                        >
                            Adicionar Item
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {items.map(item => (
                            <div 
                                key={item.id}
                                onClick={() => { setItemToEdit(item); setIsFormOpen(true); }}
                                className={`bento-card flex flex-col gap-6 active:scale-[0.98] transition-all relative overflow-hidden cursor-pointer group ${item.adquirido ? 'bg-slate-50/50 opacity-60' : 'bg-white border-slate-100 shadow-xl shadow-slate-200/20'}`}
                            >
                                {item.adquirido && <div className="absolute top-0 right-0 bg-brand-green text-brand-green-dark px-4 py-1.5 rounded-bl-[20px] text-[10px] font-black uppercase tracking-widest">OK</div>}
                                
                                <div className="space-y-4 flex-1 min-w-0">
                                    <div className="flex flex-wrap gap-2">
                                        <span className="text-[10px] font-black uppercase bg-slate-100 text-slate-400 px-2.5 py-1 rounded-lg tracking-tighter">
                                            {item.prioridade}
                                        </span>
                                    </div>
                                    <h3 className={`text-xl font-bold leading-tight group-hover:text-blue-600 transition-colors ${item.adquirido ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                                        {item.nome}
                                    </h3>
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest truncate">{item.subCategoria}</p>
                                </div>

                                <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                                    <div className="flex flex-col">
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Preço</p>
                                        <p className={`text-xl font-black ${item.adquirido ? 'text-slate-400' : 'text-slate-800'}`}>
                                            {formatCurrency(item.valorTotalAproximado)}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                comprasService.toggleAdquirido(item.id, item.adquirido);
                                            }}
                                            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${item.adquirido ? 'bg-brand-green text-white' : 'bg-slate-50 text-slate-200 hover:bg-brand-green-light hover:text-brand-green-dark'}`}
                                        >
                                            <CheckCircle2 className="w-8 h-8" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* FAB MOBILE CONSISTENTE */}
                <button 
                    onClick={() => { setItemToEdit(undefined); setIsFormOpen(true); }}
                    className="md:hidden fixed bottom-32 right-8 w-20 h-20 bg-slate-900 text-white rounded-[32px] shadow-2xl flex items-center justify-center active:scale-75 transition-all z-[110] border-4 border-white"
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
