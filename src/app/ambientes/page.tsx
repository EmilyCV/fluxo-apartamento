'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/shared/components/AppLayout';
import { 
    ChevronRight,
    Sparkles
} from 'lucide-react';

import { MASTER_AMBIENTES } from '@/modules/ambientes/types/masterData';

export default function AmbientesPage() {
    const router = useRouter();

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
                    {MASTER_AMBIENTES.map((amb, i) => (
                        <button
                            key={amb.id}
                            onClick={() => router.push(`/ambientes/${encodeURIComponent(amb.id)}`)}
                            className={`card-pop bg-gradient-to-br ${amb.color.split(' ')[0]} ${amb.color.split(' ')[1]} ${amb.color.split(' ')[2]} p-10 flex flex-col items-start gap-8 text-left group animate-pop`}
                            style={{ animationDelay: `${i * 50}ms` }}
                        >
                            <div className="w-20 h-20 bg-white rounded-[32px] flex items-center justify-center shadow-sm border border-white transition-transform group-hover:scale-110 duration-500">
                                <amb.icon className={`w-10 h-10 ${amb.color.split(' ')[3]}`} strokeWidth={1.5} />
                            </div>
                            <div className="flex-1 w-full space-y-2">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">{amb.label}</h3>
                                    <ChevronRight className="w-6 h-6 text-slate-300 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
                                </div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-relaxed">{amb.desc}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
