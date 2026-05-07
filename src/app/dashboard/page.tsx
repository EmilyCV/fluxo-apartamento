'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/modules/auth/contexts/AuthContext';
import { AppLayout } from '@/shared/components/AppLayout';
import { comprasService } from '@/modules/compras/services/comprasService';
import { CompraItem } from '@/modules/compras/types';
import { 
    Wallet, 
    Plus, 
    ArrowUpRight,
    Home as HomeIcon,
    ShoppingCart,
    CheckCircle2,
    Sparkles,
    TrendingUp
} from 'lucide-react';
import { ItemForm } from '@/modules/compras/components/ItemForm';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
    const { userName } = useAuth();
    const router = useRouter();
    const [items, setItems] = useState<CompraItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);

    useEffect(() => {
        const unsubscribe = comprasService.subscribeToItems((data) => {
            setItems(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const totalInvestido = items.filter(i => i.adquirido).reduce((acc, curr) => acc + (curr.valorTotalAproximado || 0), 0);
    const totalOrcado = items.reduce((acc, curr) => acc + (curr.valorTotalAproximado || 0), 0);
    const percProgresso = totalOrcado > 0 ? Math.round((totalInvestido / totalOrcado) * 100) : 0;

    const formatCurrency = (val: number) => 
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    const handleSaveItem = async (data: Omit<CompraItem, "id" | "createdAt" | "updatedAt">) => {
        await comprasService.addItem(data);
        setIsFormOpen(false);
    };

    return (
        <AppLayout>
            <div className="max-w-6xl mx-auto px-6 py-10 md:px-12 space-y-12">
                
                {/* --- HEADER --- */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 animate-pop">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 bg-brand-pink rounded-xl flex items-center justify-center text-brand-pink-dark rotate-6 shadow-sm">
                                <Sparkles className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Apê 2026 Home</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">
                            Olá, {userName?.split(' ')[0]}! ✨
                        </h1>
                        <p className="text-slate-400 font-medium italic">O progresso do nosso novo lar.</p>
                    </div>
                    <button 
                        onClick={() => setIsFormOpen(true)}
                        className="btn-pop bg-slate-900 text-white shadow-xl shadow-slate-900/10 hover:bg-black md:w-auto px-10"
                    >
                        <Plus className="w-5 h-5" strokeWidth={3} />
                        Novo Item
                    </button>
                </header>

                {/* --- BENTO GRID --- */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
                    
                    {/* Card Financeiro Principal (Gradiente Suave) */}
                    <div className="md:col-span-8 card-pop bg-gradient-to-br from-brand-blue-light to-white p-8 md:p-12 relative overflow-hidden flex flex-col justify-between min-h-[340px] animate-pop [animation-delay:100ms]">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue opacity-20 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                        
                        <div className="relative z-10 flex justify-between items-start">
                            <div className="space-y-1">
                                <p className="text-brand-blue-dark font-black text-[10px] uppercase tracking-widest">Total Investido</p>
                                <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter">{formatCurrency(totalInvestido)}</h2>
                            </div>
                            <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-sm border border-brand-blue/20">
                                <Wallet className="w-8 h-8 text-brand-blue-dark" />
                            </div>
                        </div>

                        <div className="relative z-10 mt-12 space-y-8">
                            <div className="flex justify-between items-end">
                                <div className="space-y-1">
                                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Orçamento Total</p>
                                    <p className="text-xl font-bold text-slate-600">{formatCurrency(totalOrcado)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-brand-blue-dark font-black text-4xl leading-none">{percProgresso}%</p>
                                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Concluído</p>
                                </div>
                            </div>
                            <div className="h-4 bg-slate-100 rounded-full overflow-hidden p-1 border border-white">
                                <div 
                                    className="h-full bg-gradient-to-r from-brand-blue to-brand-green rounded-full transition-all duration-1000 ease-out shadow-sm" 
                                    style={{ width: `${percProgresso}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Compacto (Rosa Vibrante) */}
                    <div className="md:col-span-4 card-pop bg-brand-pink-light border-brand-pink/20 p-8 flex flex-col justify-between min-h-[340px] animate-pop [animation-delay:200ms]">
                        <div className="flex justify-between items-start">
                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-brand-pink-dark shadow-sm border border-brand-pink/20">
                                <ShoppingCart className="w-6 h-6" />
                            </div>
                            <span className="text-[10px] font-black text-brand-pink-dark uppercase tracking-widest">Checklist</span>
                        </div>
                        <div className="space-y-2">
                            <p className="text-7xl font-black text-slate-900 tracking-tighter">
                                {items.filter(i => !i.adquirido).length}
                            </p>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">Pendentes hoje</p>
                        </div>
                        <button 
                            onClick={() => router.push('/compras')}
                            className="w-full h-16 bg-white border border-brand-pink/30 rounded-2xl flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-widest hover:bg-brand-pink hover:text-brand-pink-dark transition-all shadow-sm active:scale-95"
                        >
                            Ver toda lista
                            <ArrowUpRight className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Ambientes Horizontal (Mais divertido) */}
                    <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6 animate-pop [animation-delay:300ms]">
                        {["1. Cozinha", "2. Sala", "4. Banheiro"].map((amb, i) => {
                            const total = items.filter(i => i.ambiente === amb).length;
                            const comp = items.filter(i => i.ambiente === amb && i.adquirido).length;
                            const perc = total > 0 ? Math.round((comp / total) * 100) : 0;
                            const colors = [
                                "from-orange-50 to-white border-orange-100",
                                "from-blue-50 to-white border-blue-100",
                                "from-cyan-50 to-white border-cyan-100"
                            ][i];
                            
                            return (
                                <div key={amb} className={`card-pop bg-gradient-to-br ${colors} p-8 hover:scale-[1.03] cursor-pointer group`} onClick={() => router.push(`/ambientes/${encodeURIComponent(amb)}`)}>
                                    <div className="flex justify-between items-center mb-10">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                            <HomeIcon className="w-5 h-5 text-slate-400 group-hover:text-slate-900 transition-colors" />
                                        </div>
                                        <h3 className="font-black text-slate-900 uppercase text-[10px] tracking-widest">{amb.split('. ')[1]}</h3>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-end justify-between">
                                            <p className="text-4xl font-black text-slate-800 tracking-tighter">{perc}%</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{comp}/{total} itens</p>
                                        </div>
                                        <div className="h-2 bg-white rounded-full overflow-hidden border border-slate-50">
                                            <div 
                                                className="h-full bg-slate-900 rounded-full transition-all duration-700"
                                                style={{ width: `${perc}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* --- FAB MOBILE --- */}
                <button 
                    onClick={() => setIsFormOpen(true)}
                    className="md:hidden fixed bottom-32 right-8 w-20 h-20 bg-slate-900 text-white rounded-[32px] shadow-2xl flex items-center justify-center active:scale-75 transition-all z-[110] border-4 border-white shadow-slate-900/30"
                >
                    <Plus className="w-10 h-10" strokeWidth={3} />
                </button>

                {isFormOpen && (
                    <ItemForm 
                        onClose={() => setIsFormOpen(false)} 
                        onSave={handleSaveItem} 
                    />
                )}
            </div>
        </AppLayout>
    );
}
