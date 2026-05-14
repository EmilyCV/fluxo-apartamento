'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/shared/components/AppLayout';
import { comprasService } from '@/modules/compras/services/comprasService';
import { CompraItem } from '@/modules/compras/types';
import { 
    ChevronRight,
    Sparkles,
    CheckCircle2
} from 'lucide-react';

import { MASTER_AMBIENTES } from '@/modules/ambientes/types/masterData';

export default function AmbientesPage() {
    const router = useRouter();
    const [items, setItems] = useState<CompraItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = comprasService.subscribeToItems((data) => {
            setItems(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    return (
        <AppLayout>
            <div className="max-w-7xl mx-auto px-6 py-10 md:px-12 space-y-12">
                <header className="animate-pop">
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
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {MASTER_AMBIENTES.map((amb, i) => {
                        const ambItems = items.filter(item => item.ambiente === amb.id);
                        const total = ambItems.length;
                        const comp = ambItems.filter(item => item.adquirido).length;

                        return (
                            <button
                                key={amb.id}
                                onClick={() => router.push(`/ambientes/${encodeURIComponent(amb.id)}`)}
                                className={`card-pop bg-gradient-to-br ${amb.colors.gradient} ${amb.colors.border} p-10 flex flex-col items-start gap-8 text-left group animate-pop relative overflow-hidden`}
                                style={{ animationDelay: `${i * 50}ms` }}
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
