'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/modules/auth/contexts/AuthContext';
import { comprasService } from '@/modules/compras/services/comprasService';
import { CompraItem } from '@/modules/compras/types';
import { ItemForm } from '@/modules/compras/components/ItemForm';
import { 
    ShoppingCart, 
    CheckCircle2, 
    Plus,
    TrendingUp,
    LogOut,
    ChevronRight,
    Sparkles
} from 'lucide-react';

export default function DashboardPage() {
    const { userName, logout } = useAuth();
    const router = useRouter();
    const [items, setItems] = useState<CompraItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState<CompraItem | undefined>(undefined);

    useEffect(() => {
        const unsubscribe = comprasService.subscribeToItems((data) => {
            setItems(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const valorGasto = items
        .filter(i => i.adquirido)
        .reduce((acc, curr) => acc + (curr.valorTotalAproximado || 0), 0);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const handleSaveItem = async (data: Omit<CompraItem, "id" | "createdAt" | "updatedAt">, id?: string) => {
        if (id) await comprasService.updateItem(id, data);
        else await comprasService.addItem(data);
        setIsFormOpen(false);
        setItemToEdit(undefined);
    };

    return (
        <div className="min-h-screen bg-slate-100 sm:py-8">
            <main className="mobile-container flex flex-col bg-slate-50 overflow-hidden">
                
                {/* Header Premium */}
                <header className="bg-white px-8 pt-12 pb-8 rounded-b-[48px] shadow-premium relative z-10">
                    <div className="flex justify-between items-center mb-8">
                        <div className="flex items-center gap-2 bg-brand-pink-light px-4 py-2 rounded-2xl">
                            <Sparkles className="w-4 h-4 text-brand-pink-dark" />
                            <span className="text-[10px] font-black text-brand-pink-dark uppercase tracking-widest">Apê 2026</span>
                        </div>
                        <button onClick={logout} className="btn-icon bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all">
                            <LogOut className="w-6 h-6" />
                        </button>
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-none">Olá, {userName.split(' ')[0]}!</h1>
                        <p className="text-slate-400 font-medium mt-2">Acompanhe nossa jornada.</p>
                    </div>
                </header>

                <div className="p-8 space-y-8 flex-1 overflow-y-auto no-scrollbar pb-32">
                    {/* Finance Card Principal */}
                    <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-brand-pink opacity-10 rounded-full -mr-20 -mt-20 blur-3xl transition-all group-hover:scale-110"></div>
                        <div className="relative z-10 space-y-1">
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Total Investido</p>
                            <p className="text-4xl font-black tracking-tighter">{formatCurrency(valorGasto)}</p>
                        </div>
                        <div className="mt-8 flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-2 text-slate-400">
                                <ShoppingCart className="w-5 h-5 opacity-50" />
                                <span className="text-sm font-bold">{items.filter(i => i.adquirido).length} itens adquiridos</span>
                            </div>
                        </div>
                    </div>

                    {/* Stats Secundários */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="card-premium flex flex-col gap-3">
                            <div className="w-12 h-12 bg-brand-blue-light rounded-2xl flex items-center justify-center text-brand-blue-dark shadow-sm">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-slate-800">{items.filter(i => !i.adquirido).length}</p>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Faltam comprar</p>
                            </div>
                        </div>
                        <div className="card-premium flex flex-col gap-3">
                            <div className="w-12 h-12 bg-brand-green-light rounded-2xl flex items-center justify-center text-brand-green-dark shadow-sm">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-slate-800">{items.length}</p>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Itens na lista</p>
                            </div>
                        </div>
                    </div>

                    {/* Próximas Compras */}
                    <section className="space-y-6">
                        <div className="flex justify-between items-end px-2">
                            <h2 className="text-xl font-black text-slate-800">Próximas Compras</h2>
                            <button 
                                onClick={() => router.push('/compras')}
                                className="text-blue-600 font-bold text-sm flex items-center gap-1 active:translate-x-1 transition-all"
                            >
                                Ver tudo <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>

                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2].map(i => <div key={i} className="h-[100px] bg-white rounded-3xl animate-pulse" />)}
                            </div>
                        ) : items.filter(i => !i.adquirido).length === 0 ? (
                            <div className="card-premium text-center py-12 border-dashed border-2 bg-transparent">
                                <ShoppingCart className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                                <p className="text-slate-400 font-medium">Tudo comprado por enquanto! ✨</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {items.filter(i => !i.adquirido).slice(0, 3).map(item => (
                                    <div 
                                        key={item.id} 
                                        onClick={() => { setItemToEdit(item); setIsFormOpen(true); }}
                                        className="card-premium flex items-center justify-between active:scale-[0.98] transition-all cursor-pointer group"
                                    >
                                        <div className="flex flex-col gap-1 flex-1 min-w-0 pr-4">
                                            <span className="text-[10px] font-black text-brand-pink-dark bg-brand-pink/20 px-2 py-0.5 rounded-md w-fit uppercase tracking-tighter">
                                                {item.ambiente.split('. ')[1]}
                                            </span>
                                            <h3 className="font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors">{item.nome}</h3>
                                            <p className="text-sm font-black text-slate-400">{formatCurrency(item.valorTotalAproximado)}</p>
                                        </div>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); comprasService.toggleAdquirido(item.id, item.adquirido); }}
                                            className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 hover:text-brand-green-dark hover:bg-brand-green-light transition-all shadow-sm"
                                        >
                                            <CheckCircle2 className="w-8 h-8" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>

                {/* FAB Premium */}
                <button 
                    onClick={() => { setItemToEdit(undefined); setIsFormOpen(true); }}
                    className="fixed bottom-10 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:right-10 sm:left-auto w-20 h-20 bg-slate-900 text-white rounded-[32px] shadow-2xl flex items-center justify-center active:scale-90 transition-all z-40 border-[6px] border-slate-50 hover:bg-slate-800"
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
            </main>
        </div>
    );
}
