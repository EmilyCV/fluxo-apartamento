'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Home, ShoppingCart, LogOut, Sparkles } from 'lucide-react';
import { useFirebaseAuth } from '@/modules/auth/contexts/AuthContext';
import { cn } from '@/utils/cn';

interface NavItemProps {
  href: string;
  icon: React.ElementType;
  label: string;
}

const NAV_ITEMS: NavItemProps[] = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { href: '/ambientes', icon: Home, label: 'Cômodos' },
  { href: '/compras', icon: ShoppingCart, label: 'Lista' },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { logout, userName } = useFirebaseAuth();

  return (
    <div className="flex min-h-screen bg-white md:bg-slate-50">
      {/* --- SIDEBAR (Desktop: md+) --- */}
      <aside className="hidden md:flex w-72 bg-white border-r border-slate-100 flex-col sticky top-0 h-screen z-50">
        <div className="p-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
              <Sparkles className="w-6 h-6" />
            </div>
            <span className="font-black text-slate-800 uppercase tracking-tighter text-xl italic">
              Apê 2026
            </span>
          </div>
        </div>

        <nav className="flex-1 px-6 space-y-1 mt-4" aria-label="Navegação principal">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all duration-300',
                  isActive
                    ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/10 scale-[1.02]'
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50',
                )}
              >
                <item.icon className={cn('w-5 h-5', isActive && 'text-white')} />
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-8 mt-auto border-t border-slate-50">
          <div className="flex items-center justify-between gap-3 mb-2 px-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 bg-brand-pink-light rounded-full flex items-center justify-center text-brand-pink-dark font-black text-xs border border-brand-pink/20">
                {userName ? userName[0].toUpperCase() : 'A'}
              </div>
              <p className="text-xs font-black text-slate-800 truncate uppercase tracking-widest">
                {userName?.split(' ')[0]}
              </p>
            </div>
            <button
              onClick={logout}
              className="p-2 text-slate-400 hover:text-red-500 transition-colors"
              title="Sair"
              aria-label="Sair da conta"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 flex flex-col min-w-0 bg-white md:bg-slate-50">
        <main className="flex-1 relative z-0">
          <div className="pb-40 md:pb-12">{children}</div>
        </main>
      </div>

      {/* --- BOTTOM NAV (Mobile: <md) --- */}
      <nav
        className="md:hidden fixed bottom-8 left-8 right-8 h-20 bg-slate-900/95 backdrop-blur-xl rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] z-[100] flex items-center justify-around px-4 border border-white/10"
        aria-label="Navegação principal"
      >
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex flex-col items-center justify-center gap-1 w-14 h-14 rounded-2xl transition-all duration-300 active:scale-75',
                isActive ? 'text-white' : 'text-slate-500',
              )}
            >
              <item.icon className={cn('w-6 h-6', isActive && 'stroke-[2.5px]')} />
              {isActive && <div className="w-1 h-1 bg-brand-pink rounded-full absolute bottom-3"></div>}
            </Link>
          );
        })}

        <div className="w-px h-8 bg-white/10 mx-2" />

        {/* Botão de Logout no Mobile direto na barra */}
        <button
          onClick={logout}
          className="flex flex-col items-center justify-center w-14 h-14 rounded-2xl text-red-400 active:scale-75 transition-all"
          aria-label="Sair da conta"
        >
          <LogOut className="w-6 h-6" />
        </button>
      </nav>
    </div>
  );
}
