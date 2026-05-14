'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import { ChevronRight, CheckCircle2, LayoutGrid } from 'lucide-react';
import { useAmbientesData } from '@/modules/ambientes/hooks/useAmbientesData';
import { cn } from '@/utils/cn';

export function AmbientesView() {
  const router = useRouter();
  const { ambientes, loading } = useAmbientesData();

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-6 py-10 md:px-12 space-y-12">
        <header className="space-y-4 animate-pop">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-blue-light rounded-xl flex items-center justify-center text-brand-blue-dark shadow-sm">
              <LayoutGrid className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
              Explorar
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">
            Nossos Cômodos
          </h1>
          <p className="text-slate-400 font-medium italic">
            Organização por ambiente da nossa futura casa.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-32">
          {loading
            ? [1, 2, 3, 4, 5, 6].map((skeletonIndex) => (
                <div
                  key={skeletonIndex}
                  className="h-64 bg-white rounded-[40px] animate-pulse border border-slate-50"
                />
              ))
            : ambientes.map((ambiente, index) => {
                return (
                  <button
                    key={ambiente.id}
                    onClick={() => router.push(`/ambientes/${encodeURIComponent(ambiente.id)}`)}
                    className="group card-pop bg-white p-10 flex flex-col justify-between hover:scale-[1.02] active:scale-95 text-left min-h-[260px] animate-pop relative overflow-hidden"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 opacity-0 group-hover:opacity-100 rounded-full -mr-16 -mt-16 transition-all duration-500 blur-3xl"></div>

                    <div className="flex justify-between items-start relative z-10">
                      <div
                        className={cn(
                          'w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm border transition-all duration-500 group-hover:rotate-12',
                          ambiente.colors.border,
                          ambiente.colors.bg,
                          ambiente.colors.iconText,
                        )}
                      >
                        <ambiente.icon className="w-7 h-7" />
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-200 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
                    </div>

                    <div className="space-y-1 relative z-10">
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight group-hover:text-brand-pink-dark transition-colors">
                        {ambiente.label}
                      </h2>
                      <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest leading-relaxed">
                        {ambiente.desc}
                      </p>
                    </div>

                    <div className="space-y-4 relative z-10">
                      <div className="flex items-end justify-between">
                        <p className="text-4xl font-black text-slate-900 tracking-tighter">
                          {ambiente.percentage}%
                        </p>
                        <div className="flex items-center gap-1.5">
                          {ambiente.percentage === 100 && ambiente.totalItems > 0 && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          )}
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {ambiente.completedItems}/{ambiente.totalItems} itens
                          </p>
                        </div>
                      </div>
                      <div className="h-2.5 bg-slate-50 rounded-full overflow-hidden p-0.5 border border-slate-100">
                        <div
                          className="h-full bg-slate-900 rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${ambiente.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </button>
                );
              })}
        </div>
      </div>
    </AppLayout>
  );
}
