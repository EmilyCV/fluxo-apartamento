'use client';

import { useAuth } from '@/modules/auth/contexts/AuthContext';
import { LogIn, ShieldAlert, Home } from 'lucide-react';

export default function LoginPage() {
    const { signInWithGoogle, loading, error } = useAuth();

    return (
        <div className="min-h-screen bg-slate-100 sm:py-8">
            <main className="mobile-container flex flex-col items-center justify-center p-8 bg-brand-pink-light">
                
                {/* Logo / Header */}
                <div className="mb-12 text-center space-y-4">
                    <div className="w-20 h-20 bg-white rounded-[28px] shadow-premium flex items-center justify-center mx-auto text-brand-pink">
                        <Home className="w-10 h-10" strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-slate-800 tracking-tight">
                            Apê <span className="text-brand-pink-dark underline decoration-brand-pink decoration-8 underline-offset-4">2026</span>
                        </h1>
                        <p className="text-slate-500 font-medium mt-2">
                            Nosso sonho, item por item.
                        </p>
                    </div>
                </div>

                {/* Login Card */}
                <div className="w-full bg-white rounded-5xl p-8 shadow-premium space-y-8">
                    <div className="text-center">
                        <h2 className="text-xl font-bold text-slate-800">Boas-vindas!</h2>
                        <p className="text-slate-400 text-sm">Acesso exclusivo para moradoras</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-100 p-4 rounded-3xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                            <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
                            <p className="text-sm text-red-700 font-medium leading-tight">
                                {error}
                            </p>
                        </div>
                    )}

                    <button
                        onClick={signInWithGoogle}
                        disabled={loading}
                        className="btn-primary shadow-lg shadow-slate-900/10"
                    >
                        {loading ? (
                            <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <div className="bg-white/10 p-2 rounded-xl">
                                    <LogIn className="w-6 h-6" />
                                </div>
                                Entrar com Google
                            </>
                        )}
                    </button>
                </div>

                {/* Footer */}
                <footer className="mt-12 text-center">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                        <span className="w-8 h-[1px] bg-slate-200"></span>
                        Design System Apê 2026
                        <span className="w-8 h-[1px] bg-slate-200"></span>
                    </p>
                </footer>
            </main>
        </div>
    );
}
