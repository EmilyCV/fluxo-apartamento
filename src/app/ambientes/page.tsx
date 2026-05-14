'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/shared/components/AppLayout';
import { comprasService } from '@/modules/compras/services/comprasService';
import { CompraItem } from '@/modules/compras/types';
import { 
    ChevronRight,
    Sparkles,
    CheckCircle2,
    LayoutGrid,
    SortAsc,
    PieChart
} from 'lucide-react';
import { cn } from '@/shared/utils/cn';

import { MASTER_AMBIENTES } from '@/modules/ambientes/types/masterData';

type SortOrder = 'original' | 'alfabetico' | 'progresso';

export default function AmbientesPage() {
    const router = useRouter();
    const [items, setItems] = useState<CompraItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [ordenacao, setOrdenacao] = useState<SortOrder>('original');
    const [alfabeticoAsc, setAlfabeticoAsc] = useState(true);

    useEffect(() => {
        const unsubscribe = comprasService.subscribeToItems((data) => {
            setItems(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const sortedAmbientes = useMemo(() => {
        const list = [...MASTER_AMBIENTES];

        if (ordenacao === 'alfabetico') {
            return list.sort((a, b) => 
                alfabeticoAsc 
                    ? a.label.localeCompare(b.label)
                    : b.label.localeCompare(a.label)
            );
        }

        if (ordenacao === 'progresso') {
            return list.sort((a, b) => {
                const getPerc = (ambId: string) => {
                    const ambItems = items.filter(i => i.ambiente === ambId);
                    if (ambItems.length === 0) return 0;
                    return ambItems.filter(i => i.adquirido).length / ambItems.length;
                };
                // Do maior progresso para o menor
                return getPerc(b.id) - getPerc(a.id);
            });
        }

        return list; // 'original'
    }, [ordenacao, alfabeticoAsc, items]);

    const handleAlfabetico = () => {
        if (ordenacao === 'alfabetico') {
            setAlfabeticoAsc(prev => !prev);
        } else {
            setOrdenacao('alfabetico');
            setAlfabeticoAsc(true);
        }
    };

    return (
        <AppLayout>
            <div className="max-w-7xl mx-auto px-6 py-10 md:px-12 space-y-12">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 animate-pop">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 bg-brand-blue rounded-xl flex items-center justify-center text-brand-blue-dark shadow-sm">
                                <Sparkles className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Tour pelo Apê</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">
                            Cômodos
                        </h1>
                        <p className="text-slate-400 font-medium italic mt-1">Organize nossos sonhos por ambiente.</p>
                    </div>

                    {/* Controle de Ordenação Premium */}
                    <div className="flex bg-slate-100 p-1 rounded-2xl w-fit self-start md:self-auto shadow-sm border border-slate-200/50">
                        <button
                            onClick={() => setOrdenacao('original')}
                            className={cn(
                                "flex items-center gap-2 h-10 px-4 rounded-[14px] text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                                ordenacao === 'original' 
                                    ? 'bg-white text-slate-900 shadow-sm' 
                                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50/50'
                            )}
                            title="Ordem Original"
                        >
                            <LayoutGrid className="w-3.5 h-3.5" />
                            <span className={cn("hidden sm:inline", ordenacao === 'original' ? "inline" : "hidden")}>Original</span>
                        </button>

                        <button
                            onClick={handleAlfabetico}
                            className={cn(
                                "flex items-center gap-2 h-10 px-4 rounded-[14px] text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                                ordenacao === 'alfabetico' 
                                    ? 'bg-white text-slate-900 shadow-sm' 
                                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50/50'
                            )}
                            title={alfabeticoAsc ? 'Ordenar Z-A' : 'Ordenar A-Z'}
                        >
                            <SortAsc 
                                className={cn(
                                    "w-3.5 h-3.5 transition-transform duration-300",
                                    ordenacao === 'alfabetico' && !alfabeticoAsc && "rotate-180"
                                )} 
                            />
                            <span className={cn("hidden sm:inline", ordenacao === 'alfabetico' ? "inline" : "hidden")}>A-Z</span>
                        </button>

                        <button
                            onClick={() => setOrdenacao('progresso')}
                            className={cn(
                                "flex items-center gap-2 h-10 px-4 rounded-[14px] text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                                ordenacao === 'progresso' 
                                    ? 'bg-white text-slate-900 shadow-sm' 
                                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50/50'
                            )}
                            title="Ordenar por Progresso"
                        >
                            <PieChart className="w-3.5 h-3.5" />
                            <span className={cn("hidden sm:inline", ordenacao === 'progresso' ? "inline" : "hidden")}>Progresso</span>
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {sortedAmbientes.map((amb, i) => {
                        const ambItems = items.filter(item => item.ambiente === amb.id);
                        const total = ambItems.length;
                        const comp = ambItems.filter(item => item.adquirido).length;

                        return (
                            <button
                                key={amb.id}
                                onClick={() => router.push(`/ambientes/${encodeURIComponent(amb.id)}`)}
                                className={cn(
                                    "card-pop bg-gradient-to-br p-10 flex flex-col items-start gap-8 text-left group relative overflow-hidden transition-all duration-500",
                                    amb.colors.gradient,
                                    amb.colors.border
                                )}
                                // Animação de entrada suave
                                style={{ 
                                    animation: 'fadeInScale 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                                    animationDelay: `${i * 30}ms`
                                }}
                            >
                                {/* Indicador de Progresso Discreto */}
                                <div className="absolute top-6 right-8 flex items-center gap-2 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border border-white/50 shadow-sm">
                                    <CheckCircle2 className={`w-3 h-3 ${comp === total && total > 0 ? 'text-emerald-500' : 'text-slate-400'}`} />
                                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                                        {comp}/{total}
                                    </span>
                                </div>

                                <div className="w-20 h-20 bg-white rounded-[32px] flex items-center justify-center shadow-sm border border-white transition-transform group-hover:scale-110 duration-500">
                                    <amb.icon className={`w-10 h-10 ${amb.colors.iconText}`} strokeWidth={1.5} />
                                </div>
                                <div className="flex-1 w-full space-y-2">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-2xl font-black text-slate-800 tracking-tight">{amb.label}</h3>
                                        <ChevronRight className="w-6 h-6 text-slate-300 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
                                    </div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-relaxed">{amb.desc}</p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </AppLayout>
    );
}
