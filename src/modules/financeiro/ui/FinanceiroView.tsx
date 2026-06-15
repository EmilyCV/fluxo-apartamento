'use client';

import { AppLayout } from '@/components/AppLayout';
import { Sparkles, Construction } from 'lucide-react';

export function FinanceiroView() {
  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-6 py-10 md:px-12 space-y-12">
        <header className="space-y-0.5 animate-pop">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-brand-pink rounded-xl flex items-center justify-center text-brand-pink-dark shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
              Apê 2026 · Financeiro
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">
            Financeiro
          </h1>
          <p className="text-slate-400 font-medium italic">O fluxo de pagamentos do nosso apê.</p>
        </header>

        <div className="card-pop bg-gradient-to-br from-brand-blue-light to-white p-12 flex flex-col items-center justify-center text-center gap-4 min-h-[280px] animate-pop">
          <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-sm border border-brand-blue/20">
            <Construction className="w-8 h-8 text-brand-blue-dark" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Em construção</h2>
          <p className="text-slate-400 font-medium max-w-md">
            Em breve: entrada, INCC e evolução de obra — tudo editável e calculado automaticamente.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
