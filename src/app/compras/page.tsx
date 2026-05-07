'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/modules/auth/contexts/AuthContext';
import { AppLayout } from '@/shared/components/AppLayout';
import { comprasService } from '@/modules/compras/services/comprasService';
import { CompraItem, Ambiente, Categoria, Prioridade } from '@/modules/compras/types';
import { ItemForm } from '@/modules/compras/components/ItemForm';
import { 
    Search, 
    CheckCircle2, 
    FilterX,
    Plus,
    ShoppingCart,
    ChevronDown,
    Home as HomeIcon,
    Tags,
    AlertCircle,
    RotateCcw
} from 'lucide-react';
import { cn } from '@/shared/utils/cn';

const AMBIENTES: Ambiente[] = ["1. Cozinha", "2. Sala", "3. Varanda", "4. Banheiro", "5. Escritório", "6. Quarto", "7. Gerais"];
const CATEGORIAS: Categoria[] = ["1. Reforma", "2. Eletros", "3. Utensílios", "4. Enxoval"];
const PRIORIDADES: Prioridade[] = ["Comprar agora", "Quando der", "Pode esperar", "Aguardando projeto", "Adquirido"];

interface FilterDropdownProps {
    label: string;
    value: string;
    options: string[];
    icon: React.ElementType;
    isOpen: boolean;
    onToggle: (label: string | null) => void;
    onChange: (value: any) => void;
    placeholder: string;
}

function FilterDropdown({ label, value, options, icon: Icon, isOpen, onToggle, onChange, placeholder }: FilterDropdownProps) {
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) return;
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                onToggle(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onToggle]);

    const isSelected = value !== placeholder && value !== 'Todos' && value !== 'Todas';
    const displayValue = isSelected ? value.split('. ').pop() : label;

    return (
        <div className="relative shrink-0" ref={dropdownRef}>
            <button 
                onClick={() => onToggle(isOpen ? null : label)}
                className={cn(
                    "flex items-center gap-2.5 h-12 px-5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 shadow-sm border",
                    isOpen ? "border-slate-900 bg-white text-slate-900 shadow-xl -translate-y-0.5" : 
                    isSelected ? "border-slate-900 bg-slate-900 text-white" : "border-slate-100 bg-white text-slate-500 hover:border-slate-200"
                )}
            >
                <Icon className={cn("w-3.5 h-3.5", isSelected ? "text-white" : "text-slate-400")} />
                <span>{displayValue}</span>
                <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-500", isOpen && "rotate-180", isSelected ? "text-white" : "text-slate-300")} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-3 w-64 bg-white/95 backdrop-blur-xl border border-slate-100 rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] p-2 z-[200] animate-fade-in-up">
                    <div className="max-h-72 overflow-y-auto no-scrollbar py-1">
                        <button
                            onClick={() => { onChange(placeholder); onToggle(null); }}
                            className={cn(
                                "w-full flex items-center justify-between px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all mb-1",
                                !isSelected ? "bg-slate-50 text-slate-900" : "text-slate-500 hover:bg-slate-50"
                            )}
                        >
                            <span>Ver Todos</span>
                            {!isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-slate-900" />}
                        </button>
                        <div className="h-px bg-slate-100 my-2 mx-2" />
                        {options.map((opt) => (
                            <button
                                key={opt}
                                onClick={() => { onChange(opt); onToggle(null); }}
                                className={cn(
                                    "w-full flex items-center justify-between px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all mb-0.5",
                                    value === opt ? "bg-slate-900 text-white shadow-lg" : "text-slate-600 hover:bg-slate-50 hover:pl-5"
                                )}
                            >
                                <span className="truncate pr-4">{opt.split('. ').pop()}</span>
                                {value === opt && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function ComprasPage() {
    const [items, setItems] = useState<CompraItem[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [search, setSearch] = useState('');
    const [filtroAmbiente, setFiltroAmbiente] = useState<Ambiente | 'Todos'>('Todos');
    const [filtroCategoria, setFiltroCategoria] = useState<Categoria | 'Todas'>('Todas');
    const [filtroPrioridade, setFiltroPrioridade] = useState<Prioridade | 'Todas'>('Todas');
    const [verComprados, setVerComprados] = useState(true);

    const [activeFilter, setActiveFilter] = useState<string | null>(null);

    const [itemToEdit, setItemToEdit] = useState<CompraItem | undefined>(undefined);
    const [isFormOpen, setIsFormOpen] = useState(false);

    useEffect(() => {
        const unsubscribe = comprasService.subscribeToItems(
            (data) => {
                setItems(data);
                setLoading(false);
            },
            (error) => {
                setLoading(false);
            }
        );
        return () => unsubscribe();
    }, []);

    const filteredItems = items.filter(item => {
        const matchSearch = item.nome.toLowerCase().includes(search.toLowerCase()) || 
                            item.fabricante?.toLowerCase().includes(search.toLowerCase());
        const matchAmbiente = filtroAmbiente === 'Todos' || item.ambiente === filtroAmbiente;
        const matchCategoria = filtroCategoria === 'Todas' || item.categoria === filtroCategoria;
        const matchPrioridade = filtroPrioridade === 'Todas' || item.prioridade === filtroPrioridade;
        const matchStatus = verComprados ? true : !item.adquirido;
        return matchSearch && matchAmbiente && matchCategoria && matchPrioridade && matchStatus;
    });

    const handleSaveItem = async (data: Omit<CompraItem, "id" | "createdAt" | "updatedAt">, id?: string) => {
        if (id) await comprasService.updateItem(id, data);
        else await comprasService.addItem(data);
        setIsFormOpen(false);
        setItemToEdit(undefined);
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const hasActiveFilters = search !== '' || 
                             filtroAmbiente !== 'Todos' || 
                             filtroCategoria !== 'Todas' || 
                             filtroPrioridade !== 'Todas' || 
                             !verComprados;

    const clearFilters = () => {
        setSearch('');
        setFiltroAmbiente('Todos');
        setFiltroCategoria('Todas');
        setFiltroPrioridade('Todas');
        setVerComprados(true);
        setActiveFilter(null);
    };

    return (
        <AppLayout>
            <div className="max-w-6xl mx-auto px-6 py-10 md:px-12 space-y-12">
                <header className="space-y-12 animate-pop relative z-[60]">
                    {/* Título e Pesquisa */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                        <div className="space-y-2">
                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">Lista de Compras</h1>
                            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">Gestão inteligente do seu lar</p>
                        </div>
                        
                        <div className="flex items-center gap-3 w-full lg:w-auto">
                            <div className="relative flex-1 lg:w-96 group">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
                                <input 
                                    type="text"
                                    placeholder="O que você está procurando?"
                                    className="w-full h-16 bg-white border border-slate-100 rounded-[28px] pl-16 pr-6 outline-none focus:border-slate-900 focus:shadow-2xl focus:shadow-slate-200/50 transition-all text-sm font-bold shadow-sm"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                            </div>
                            {items.length > 0 && (
                                <button 
                                    onClick={() => { setItemToEdit(undefined); setIsFormOpen(true); }}
                                    className="hidden md:flex btn-pop bg-slate-900 text-white shadow-xl shadow-slate-900/10 hover:bg-black px-8 h-16 shrink-0"
                                >
                                    <Plus className="w-5 h-5" strokeWidth={3} />
                                    Novo
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Barra de Filtros Premium */}
                    <div className="space-y-6 relative z-50">
                        <div className="flex items-center gap-2 text-slate-400">
                            <FilterX className="w-4 h-4" />
                            <span className="text-[9px] font-black uppercase tracking-[0.3em]">Filtros & Organização</span>
                        </div>

                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                            {/* Toggle de Visualização */}
                            <div className="flex bg-slate-100 p-1 rounded-2xl w-fit">
                                <button 
                                    onClick={() => setVerComprados(true)}
                                    className={cn(
                                        "h-10 px-6 rounded-[14px] text-[10px] font-black uppercase tracking-widest transition-all",
                                        verComprados ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-500'
                                    )}
                                >
                                    Tudo
                                </button>
                                <button 
                                    onClick={() => setVerComprados(false)}
                                    className={cn(
                                        "h-10 px-6 rounded-[14px] text-[10px] font-black uppercase tracking-widest transition-all",
                                        !verComprados ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-500'
                                    )}
                                >
                                    Pendentes
                                </button>
                            </div>

                            <div className="h-6 w-px bg-slate-200 hidden md:block mx-2"></div>

                            {/* Grupo de Selects Customizados */}
                            <div className="flex flex-wrap items-center gap-3">
                                <FilterDropdown 
                                    label="Cômodo"
                                    placeholder="Todos"
                                    value={filtroAmbiente}
                                    options={AMBIENTES}
                                    icon={HomeIcon}
                                    isOpen={activeFilter === 'Cômodo'}
                                    onToggle={setActiveFilter}
                                    onChange={setFiltroAmbiente}
                                />
                                <FilterDropdown 
                                    label="Categoria"
                                    placeholder="Todas"
                                    value={filtroCategoria}
                                    options={CATEGORIAS}
                                    icon={Tags}
                                    isOpen={activeFilter === 'Categoria'}
                                    onToggle={setActiveFilter}
                                    onChange={setFiltroCategoria}
                                />
                                <FilterDropdown 
                                    label="Prioridade"
                                    placeholder="Todas"
                                    value={filtroPrioridade}
                                    options={PRIORIDADES}
                                    icon={AlertCircle}
                                    isOpen={activeFilter === 'Prioridade'}
                                    onToggle={setActiveFilter}
                                    onChange={setFiltroPrioridade}
                                />

                                {hasActiveFilters && (
                                    <button 
                                        onClick={clearFilters}
                                        className="flex items-center gap-2 h-12 px-5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all shrink-0 group animate-slide-in"
                                    >
                                        <RotateCcw className="w-3.5 h-3.5 group-hover:rotate-[-45deg] transition-transform" />
                                        <span>Resetar</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-72 bg-white rounded-[40px] animate-pulse border border-slate-50" />)}
                    </div>
                ) : items.length === 0 ? (
                    /* ESTADO VAZIO: LISTA TOTALMENTE VAZIA */
                    <div className="text-center py-32 bg-white rounded-[48px] border-2 border-dashed border-slate-100 flex flex-col items-center animate-pop shadow-sm">
                        <div className="w-24 h-24 bg-brand-pink-light rounded-[32px] flex items-center justify-center mb-6 shadow-sm border border-brand-pink/20">
                            <ShoppingCart className="w-10 h-10 text-brand-pink-dark" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-2">Sua lista está vazia</h2>
                        <p className="text-slate-400 font-medium mb-8 max-w-xs mx-auto italic text-center px-6">Nenhum item cadastrado ainda. Vamos planejar algo novo?</p>
                        <button 
                            onClick={() => setIsFormOpen(true)}
                            className="btn-pop bg-slate-900 text-white shadow-xl shadow-slate-900/10 hover:scale-105 active:scale-95 px-12 h-16"
                        >
                            <Plus className="w-5 h-5" strokeWidth={3} /> Adicionar Primeiro Item
                        </button>
                    </div>
                ) : filteredItems.length === 0 ? (
                    /* ESTADO VAZIO: FILTROS SEM RESULTADO */
                    <div className="text-center py-40 bg-white rounded-[48px] border border-slate-100 flex flex-col items-center animate-pop shadow-sm">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                            <FilterX className="w-8 h-8 text-slate-200" />
                        </div>
                        <h3 className="text-xl font-black text-slate-800 mb-2">Nenhum resultado</h3>
                        <p className="text-slate-400 font-bold uppercase text-[9px] tracking-[0.3em] mb-8">Tente ajustar seus filtros para encontrar o que procura</p>
                        <button 
                            onClick={clearFilters} 
                            className="flex items-center gap-3 px-8 h-14 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all"
                        >
                            <RotateCcw className="w-4 h-4" />
                            Limpar Filtros
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 pb-32">
                        {filteredItems.map(item => (
                            <div 
                                key={item.id}
                                onClick={() => { setItemToEdit(item); setIsFormOpen(true); }}
                                className={cn(
                                    "card-pop group flex flex-col p-10 gap-10 cursor-pointer relative overflow-hidden animate-pop border-slate-100/60",
                                    item.adquirido ? 'bg-slate-50/50 opacity-60 grayscale-[0.5]' : 'bg-white'
                                )}
                            >
                                {item.adquirido && (
                                    <div className="absolute top-0 right-0 bg-brand-green text-brand-green-dark px-6 py-2.5 rounded-bl-[24px] text-[10px] font-black uppercase tracking-widest shadow-sm z-10">
                                        Adquirido
                                    </div>
                                )}
                                
                                <div className="space-y-8 flex-1">
                                    <div className="flex items-start justify-between">
                                        <div className="flex flex-wrap gap-2">
                                            <span className="text-[10px] font-black uppercase bg-brand-blue-light text-brand-blue-dark px-4 py-1.5 rounded-xl tracking-tighter border border-brand-blue/10">
                                                {item.ambiente.split('. ')[1]}
                                            </span>
                                            <span className="text-[10px] font-black uppercase bg-slate-50 text-slate-400 px-4 py-1.5 rounded-xl tracking-tighter border border-slate-100">
                                                {item.prioridade}
                                            </span>
                                        </div>
                                        {!item.adquirido && <ShoppingCart className="w-5 h-5 text-slate-100 group-hover:text-brand-pink-dark transition-colors" />}
                                    </div>

                                    <div className="space-y-2">
                                        <h3 className={cn(
                                            "text-3xl font-black leading-[1.15] tracking-tight group-hover:text-brand-pink-dark transition-colors break-words",
                                            item.adquirido ? 'text-slate-300 line-through' : 'text-slate-900'
                                        )}>
                                            {item.nome}
                                        </h3>
                                        {item.fabricante && (
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">{item.fabricante}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-10 border-t border-slate-50/80 mt-auto">
                                    <div className="flex flex-col gap-1.5">
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Investimento</p>
                                        <p className={cn(
                                            "text-3xl font-black tracking-tighter",
                                            item.adquirido ? 'text-slate-300' : 'text-slate-900'
                                        )}>
                                            {formatCurrency(item.valorTotalAproximado)}
                                        </p>
                                    </div>
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            comprasService.toggleAdquirido(item.id, item.adquirido);
                                        }}
                                        className={cn(
                                            "w-16 h-16 rounded-[24px] flex items-center justify-center transition-all shadow-sm active:scale-90",
                                            item.adquirido 
                                            ? 'bg-brand-green text-white shadow-brand-green/20' 
                                            : 'bg-slate-50 text-slate-200 hover:bg-brand-green-light hover:text-brand-green-dark hover:scale-110'
                                        )}
                                    >
                                        <CheckCircle2 className={cn("w-8 h-8", item.adquirido ? 'stroke-[3px]' : 'stroke-[2px]')} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* FAB MOBILE CONSISTENTE */}
                <button 
                    onClick={() => { setItemToEdit(undefined); setIsFormOpen(true); }}
                    className="md:hidden fixed bottom-32 right-8 w-20 h-20 bg-slate-900 text-white rounded-[32px] shadow-2xl flex items-center justify-center active:scale-75 transition-all z-[110] border-4 border-white shadow-slate-900/30"
                >
                    <Plus className="w-10 h-10" strokeWidth={3} />
                </button>

                {isFormOpen && (
                    <ItemForm 
                        initialData={itemToEdit}
                        onClose={() => { setIsFormOpen(false); setItemToEdit(undefined); }}
                        onSave={handleSaveItem}
                    />
                )}
            </div>
        </AppLayout>
    );
}
