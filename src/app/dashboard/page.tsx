'use client';

import { useAuth } from '@/modules/auth/contexts/AuthContext';

export default function DashboardPage() {
    const { userName, logout } = useAuth();

    return (
        <main className="min-h-screen bg-zinc-50 p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <header className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-800">
                            Olá, {userName}!
                        </h1>
                        <p className="text-zinc-500">
                            Bem-vindo ao controle do Apê 2026.
                        </p>
                    </div>
                    <button
                        onClick={logout}
                        className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        Sair
                    </button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 h-32 flex items-center justify-center text-zinc-400 italic">
                        Ambientes (em breve)
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 h-32 flex items-center justify-center text-zinc-400 italic">
                        Compras (em breve)
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 h-32 flex items-center justify-center text-zinc-400 italic">
                        Finanças (em breve)
                    </div>
                </div>
            </div>
        </main>
    );
}