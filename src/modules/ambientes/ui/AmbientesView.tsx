'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import { ChevronRight, CheckCircle2, LayoutGrid, Search, FilterX, RotateCcw, Clock, SortAsc, Zap } from 'lucide-react';
import { useAmbientesData } from '@/modules/ambientes/hooks/useAmbientesData';
import { cn } from '@/utils/cn';

export function AmbientesView() {
  const router = useRouter();
  const {
    ambientes,
    loading,
    searchTerm,
    setSearchTerm,
    ordenacao,
    setOrdenacao,
    alfabeticoAsc,
    handleAlfabeticoClick
  } = useAmbientesData();

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-6 py-10 md:px-12 space-y-12">
        <header className="space-y-6 sm:space-y-12 animate-pop">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-brand-blue-light rounded-xl flex items-center justify-center text-brand-blue-dark shadow-sm">
                  <LayoutGrid className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                  Explorar
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">
                Nossos Cômodos
              </h1>
              <p className="text-slate-400 font-medium italic">
                Organização por ambiente da nossa futura casa.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-96 group">
                <Search
                  className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-200 group-focus-within:text-slate-400 transition-colors"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  aria-label="Procurar cômodos"
                  placeholder="Qual cômodo você procura?"
                  className="w-full h-12 sm:h-16 bg-white border border-slate-100 rounded-[28px] pl-14 sm:pl-16 pr-6 outline-none focus:border-slate-300 focus:shadow-2xl focus:shadow-slate-200/50 transition-all text-sm font-bold shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0 pb-1 no-scrollbar">
            <div
              className="flex bg-slate-100 p-1 rounded-2xl w-fit shadow-sm border border-slate-200/50 ml-auto"
              role="group"
              aria-label="Ordenação de cômodos"
            >
              <button
                onClick={() => setOrdenacao('original')}
                className={cn(
                  'flex items-center gap-2 h-10 px-6 rounded-[14px] text-[10px] font-black uppercase tracking-widest transition-all duration-300',
                  ordenacao === 'original'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-400 hover:text-slate-600',
                )}
              >
                <Clock className="w-3.5 h-3.5" />
                Original
              </button>

              <button
                onClick={handleAlfabeticoClick}
                className={cn(
                  'flex items-center gap-2 h-10 px-6 rounded-[14px] text-[10px] font-black uppercase tracking-widest transition-all duration-300',
                  ordenacao === 'alfabetico'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-400 hover:text-slate-600',
                )}
                title={ordenacao === 'alfabetico' ? (alfabeticoAsc ? 'Ordenar Z-A' : 'Ordenar A-Z') : 'Ordenar A-Z'}
              >
                <SortAsc className={cn(
                  "w-3.5 h-3.5 transition-transform duration-300",
                  ordenacao === 'alfabetico' && !alfabeticoAsc && "rotate-180"
                )} />
                {ordenacao === 'alfabetico' ? (alfabeticoAsc ? 'A-Z' : 'Z-A') : 'A-Z'}
              </button>

              <button
                onClick={() => setOrdenacao('progresso')}
                className={cn(
                  'flex items-center gap-2 h-10 px-6 rounded-[14px] text-[10px] font-black uppercase tracking-widest transition-all duration-300',
                  ordenacao === 'progresso'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-400 hover:text-slate-600',
                )}
              >
                <Zap className="w-3.5 h-3.5" />
                Progresso
              </button>
            </div>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-nav-safe md:pb-12">
            {[1, 2, 3, 4, 5, 6].map((skeletonIndex) => (
              <div
                key={skeletonIndex}
                className="h-44 sm:h-64 bg-slate-100 rounded-[40px] animate-pulse border border-slate-50"
              />
            ))}
          </div>
        ) : ambientes.length === 0 ? (
          <div className="text-center py-20 sm:py-40 bg-white rounded-[48px] border border-slate-100 flex flex-col items-center animate-pop shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <FilterX className="w-8 h-8 text-slate-200" aria-hidden="true" />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2">Nenhum cômodo encontrado</h3>
            <p className="text-slate-400 font-bold uppercase text-[9px] tracking-[0.3em] mb-5 sm:mb-8">
              Tente ajustar sua busca ou filtros
            </p>
            <button
              onClick={() => { setSearchTerm(''); setOrdenacao('original'); }}
              className="flex items-center gap-3 px-8 h-14 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all active:scale-95 touch-manipulation"
            >
              <RotateCcw className="w-4 h-4" />
              Limpar Busca
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-nav-safe md:pb-12">
            {ambientes.map((ambiente, index) => {
              return (
                <button
                  key={ambiente.id}
                  onClick={() => router.push(`/ambientes/${encodeURIComponent(ambiente.id)}`)}
                  className={cn(
                    'group card-pop p-5 sm:p-10 flex flex-col justify-between hover:scale-[1.02] active:scale-95 text-left min-h-[180px] sm:min-h-[300px] animate-pop relative overflow-hidden bg-gradient-to-br border',
                    ambiente.colors.gradient,
                    ambiente.colors.border,
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-0 group-hover:opacity-20 rounded-full -mr-16 -mt-16 transition-all duration-500 blur-3xl"></div>

                  <div className="flex justify-between items-start relative z-10">
                    <div
                      className={cn(
                        'w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm border transition-all duration-500 group-hover:scale-110 bg-white/80 backdrop-blur-sm',
                        ambiente.colors.border,
                        ambiente.colors.iconText,
                      )}
                    >
                      <ambiente.icon className="w-7 h-7" />
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
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
        )}
      </div>
    </AppLayout>
  );
}
