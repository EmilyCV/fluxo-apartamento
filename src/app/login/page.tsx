'use client';

import { useAuth } from '@/modules/auth/contexts/AuthContext';
import { LogIn, ShieldAlert, Home } from 'lucide-react';

export default function LoginPage() {
    const { signInWithGoogle, loading, error } = useAuth();

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-950 sm:py-8 flex items-center justify-center">
            <main className="w-full max-w-[440px] flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-900 sm:rounded-[48px] shadow-2xl dark:shadow-none min-h-screen sm:min-h-0 border border-transparent dark:border-slate-800">
                
                {/* Logo / Header */}
                <div className="mb-12 text-center space-y-4">
                    <div className="w-20 h-20 bg-slate-900 dark:bg-white rounded-[28px] shadow-premium flex items-center justify-center mx-auto text-white dark:text-slate-900">
                        <Home className="w-10 h-10" strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight italic">
                            Apê <span className="text-brand-pink-dark dark:text-brand-pink underline decoration-brand-pink decoration-8 underline-offset-4">2026</span>
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em] mt-4">
                            Nosso sonho, item por item.
                        </p>
                    </div>
                </div>

                {/* Login Card Inner */}
                <div className="w-full space-y-8">
                    {error && (
                        <div className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 p-5 rounded-[24px] flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                            <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                            <p className="text-sm text-red-700 dark:text-red-400 font-bold leading-tight">
                                {error}
                            </p>
                        </div>
                    )}

                    <button
                        onClick={signInWithGoogle}
                        disabled={loading}
                        className="w-full h-16 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-slate-900/10 dark:shadow-white/5 disabled:opacity-50"
                    >
                        {loading ? (
                            <div className="w-6 h-6 border-3 border-white/30 dark:border-slate-900/30 border-t-white dark:border-t-slate-900 rounded-full animate-spin" />
                        ) : (
                            <>
                                <LogIn className="w-5 h-5" />
                                Entrar com Google
                            </>
                        )}
                    </button>
                    
                    <p className="text-center text-slate-400 dark:text-slate-600 text-[10px] font-black uppercase tracking-widest">Acesso Restrito</p>
                </div>

                {/* Footer */}
                <footer className="mt-16 text-center">
                    <p className="text-slate-300 dark:text-slate-800 text-[8px] font-black uppercase tracking-[0.5em]">
                        Design System Apê 2026
                    </p>
                </footer>
            </main>
        </div>
    );
}
