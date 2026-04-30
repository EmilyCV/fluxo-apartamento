'use client';

import { useState } from 'react';
import { useAuth } from '@/modules/auth/contexts/AuthContext';
import { Home, KeyRound, Sparkles, LayoutDashboard } from 'lucide-react';

export default function LoginPage() {
    const { signInWithGoogle } = useAuth();
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        try {
            setIsLoading(true);
            setError('');
            await signInWithGoogle();
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Ocorreu um erro ao tentar iniciar sessão.';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden bg-[#FAF9F6]">
            {/* Elementos Decorativos de Fundo - Tons mais suaves e "Homey" */}
            <div className="absolute top-[-15%] right-[-5%] w-[50%] h-[50%] rounded-full bg-brand-pink/20 blur-[120px]" />
            <div className="absolute bottom-[-10%] left-[-5%] w-[45%] h-[45%] rounded-full bg-brand-blue/20 blur-[120px]" />
            
            <div className="relative w-full max-w-[440px] z-10">
                {/* Cartão Principal */}
                <div className="bg-white/80 backdrop-blur-2xl rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] border border-white p-10 md:p-12 flex flex-col items-center">
                    
                    {/* Icone Temático - Casa/Início */}
                    <div className="relative mb-8">
                        <div className="absolute inset-0 bg-brand-pink/20 blur-2xl rounded-full scale-150" />
                        <div className="relative w-20 h-20 bg-white rounded-3xl shadow-sm border border-brand-pink/30 flex items-center justify-center transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                            <Home className="w-10 h-10 text-brand-pink" strokeWidth={1.5} />
                        </div>
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-brand-blue rounded-full flex items-center justify-center shadow-lg animate-bounce" style={{ animationDuration: '3s' }}>
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                    </div>

                    {/* Header Text */}
                    <div className="text-center space-y-2 mb-12">
                        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
                            Apê 2026
                        </h1>
                        <p className="text-gray-500 font-medium text-sm max-w-[240px] mx-auto leading-relaxed">
                            Organizando cada detalhe do nosso novo capítulo.
                        </p>
                    </div>

                    {/* Botão de Login - Estilo "Soft Luxury" */}
                    <div className="w-full space-y-6">
                        <button
                            onClick={handleLogin}
                            disabled={isLoading}
                            className="group relative w-full h-16 bg-white border-2 border-gray-900 hover:bg-gray-900 hover:text-white disabled:opacity-50 text-gray-900 font-bold rounded-2xl transition-all duration-300 flex items-center justify-center overflow-hidden active:scale-[0.98]"
                        >
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin group-hover:border-white group-hover:border-t-transparent" />
                                    <span>Verificando acesso...</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                                        <path
                                            fill="currentColor"
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        />
                                        <path
                                            fill="currentColor"
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        />
                                        <path
                                            fill="currentColor"
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                                        />
                                        <path
                                            fill="currentColor"
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        />
                                    </svg>
                                    <span>Entrar com Google</span>
                                </div>
                            )}
                        </button>

                        {error && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-center text-xs font-semibold border border-red-100 flex items-center justify-center gap-2">
                                <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-ping" />
                                {error}
                            </div>
                        )}
                    </div>

                    {/* Features/Highlights - Ajuda a preencher a tela com propósito */}
                    <div className="grid grid-cols-2 gap-4 w-full mt-12 pt-12 border-t border-gray-100">
                        <div className="flex flex-col items-center text-center space-y-2">
                            <div className="w-10 h-10 rounded-xl bg-brand-green/20 flex items-center justify-center text-emerald-600">
                                <KeyRound className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Acesso Restrito</span>
                        </div>
                        <div className="flex flex-col items-center text-center space-y-2">
                            <div className="w-10 h-10 rounded-xl bg-brand-blue/20 flex items-center justify-center text-blue-600">
                                <LayoutDashboard className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Controle Total</span>
                        </div>
                    </div>
                </div>

                {/* Footer Copy */}
                <div className="mt-10 flex flex-col items-center space-y-2 opacity-40 hover:opacity-100 transition-opacity duration-500">
                    <p className="text-[10px] font-black text-gray-900 tracking-[0.3em] uppercase">
                        Versão 2026.1
                    </p>
                    <div className="w-12 h-1 bg-gradient-to-r from-brand-pink via-brand-blue to-brand-green rounded-full" />
                </div>
            </div>
        </main>
    );
}