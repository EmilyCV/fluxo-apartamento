'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/shared/components/AppLayout';
import { Ambiente } from '@/modules/compras/types';
import { 
    ChefHat, 
    Tv, 
    Palmtree, 
    Bath, 
    Briefcase, 
    BedDouble, 
    Boxes,
    ChevronRight,
    Sparkles
} from 'lucide-react';

const AMBIENTES_CONFIG: { name: Ambiente; icon: React.ElementType; color: string; desc: string }[] = [
    { name: "1. Cozinha", icon: ChefHat, color: "from-orange-50 to-white border-orange-100 text-orange-600", desc: "Coração da casa e eletros" },
    { name: "2. Sala", icon: Tv, color: "from-blue-50 to-white border-blue-100 text-blue-600", desc: "Conforto e eletrônicos" },
    { name: "3. Varanda", icon: Palmtree, color: "from-green-50 to-white border-green-100 text-green-600", desc: "Lazer e plantas" },
    { name: "4. Banheiro", icon: Bath, color: "from-cyan-50 to-white border-cyan-100 text-cyan-600", desc: "Higiene e metais" },
    { name: "5. Escritório", icon: Briefcase, color: "from-indigo-50 to-white border-indigo-100 text-indigo-600", desc: "Trabalho e organização" },
    { name: "6. Quarto", icon: BedDouble, color: "from-purple-50 to-white border-purple-100 text-purple-600", desc: "Descanso e enxoval" },
    { name: "7. Gerais", icon: Boxes, color: "from-slate-50 to-white border-slate-200 text-slate-600", desc: "Itens de uso comum" },
];

export default function AmbientesPage() {
    const router = useRouter();

    return (
        <AppLayout>
            <div className="max-w-7xl mx-auto px-6 py-10 md:px-12 space-y-12">
                <header className="animate-pop">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-brand-blue rounded-xl flex items-center justify-center text-brand-blue-dark rotate-6 shadow-sm">
                            <Sparkles className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Tour pelo Apê</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">
                        Cômodos
                    </h1>
                    <p className="text-slate-400 font-medium italic mt-1">Organize seus sonhos por ambiente.</p>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {AMBIENTES_CONFIG.map((amb, i) => (
                        <button
                            key={amb.name}
                            onClick={() => router.push(`/ambientes/${encodeURIComponent(amb.name)}`)}
                            className={`card-pop bg-gradient-to-br ${amb.color.split(' ')[0]} ${amb.color.split(' ')[1]} p-10 flex flex-col items-start gap-8 text-left group animate-pop`}
                            style={{ animationDelay: `${i * 50}ms` }}
                        >
                            <div className="w-20 h-20 bg-white rounded-[32px] flex items-center justify-center shadow-sm border border-white transition-transform group-hover:scale-110 duration-500">
                                <amb.icon className={`w-10 h-10 ${amb.color.split(' ')[3]}`} strokeWidth={1.5} />
                            </div>
                            <div className="flex-1 w-full space-y-2">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">{amb.name.split('. ')[1]}</h3>
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
