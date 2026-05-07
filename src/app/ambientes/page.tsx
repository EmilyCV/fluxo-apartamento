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
    ChevronRight
} from 'lucide-react';

const AMBIENTES_CONFIG: { name: Ambiente; icon: React.ElementType; color: string; desc: string }[] = [
    { name: "1. Cozinha", icon: ChefHat, color: "bg-orange-100 text-orange-600", desc: "Coração da casa e eletros" },
    { name: "2. Sala", icon: Tv, color: "bg-blue-100 text-blue-600", desc: "Conforto e eletrônicos" },
    { name: "3. Varanda", icon: Palmtree, color: "bg-green-100 text-green-600", desc: "Lazer e plantas" },
    { name: "4. Banheiro", icon: Bath, color: "bg-cyan-100 text-cyan-600", desc: "Higiene e metais" },
    { name: "5. Escritório", icon: Briefcase, color: "bg-indigo-100 text-indigo-600", desc: "Trabalho e organização" },
    { name: "6. Quarto", icon: BedDouble, color: "bg-purple-100 text-purple-600", desc: "Descanso e enxoval" },
    { name: "7. Gerais", icon: Boxes, color: "bg-slate-100 text-slate-600", desc: "Itens de uso comum" },
];

export default function AmbientesPage() {
    const router = useRouter();

    return (
        <AppLayout>
            <div className="max-w-7xl mx-auto px-6 py-10 md:px-12">
                <header className="mb-12">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter">
                        Ambientes
                    </h1>
                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em] mt-2">Explore por cômodo</p>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {AMBIENTES_CONFIG.map((amb) => (
                        <button
                            key={amb.name}
                            onClick={() => router.push(`/ambientes/${encodeURIComponent(amb.name)}`)}
                            className="bento-card bg-white border-slate-100 flex flex-col items-start gap-8 text-left group shadow-xl shadow-slate-200/20 transition-all hover:scale-[1.02]"
                        >
                            <div className={`w-20 h-20 rounded-[32px] flex items-center justify-center transition-transform group-hover:scale-110 duration-500 shadow-sm ${amb.color}`}>
                                <amb.icon className="w-10 h-10" strokeWidth={1.5} />
                            </div>
                            <div className="flex-1 w-full space-y-2">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">{amb.name.split('. ')[1]}</h3>
                                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-900 transition-colors" />
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
