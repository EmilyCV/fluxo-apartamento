'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';
import { cn } from '../utils/cn';

export interface SelectOption {
    value: string;
    label: string;
    description?: string;
    icon?: React.ReactNode;
}

interface CustomSelectProps {
    options: SelectOption[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    label?: string;
    searchable?: boolean;
    color?: 'pink' | 'blue' | 'green' | 'slate';
    className?: string;
}

export function CustomSelect({ 
    options, 
    value, 
    onChange, 
    placeholder = "Selecione...", 
    label,
    searchable = false,
    color = 'slate',
    className
}: CustomSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.value === value);

    const filteredOptions = options.filter(opt => 
        opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (opt.description && opt.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const colorClasses = {
        pink: 'focus-within:border-brand-pink',
        blue: 'focus-within:border-brand-blue',
        green: 'focus-within:border-brand-green',
        slate: 'focus-within:border-slate-400'
    };

    const activeColorClasses = {
        pink: 'border-brand-pink shadow-brand-pink/10',
        blue: 'border-brand-blue shadow-brand-blue/10',
        green: 'border-brand-green shadow-brand-green/10',
        slate: 'border-slate-400 shadow-slate-400/10'
    };

    return (
        <div className={cn("space-y-3 relative", className)} ref={containerRef}>
            {label && (
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    {label}
                </label>
            )}
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-full h-16 bg-slate-50 border-2 border-transparent rounded-[24px] px-6 flex items-center justify-between cursor-pointer transition-all shadow-sm",
                    isOpen && cn("bg-white shadow-xl scale-[1.01]", activeColorClasses[color]),
                    !isOpen && "hover:bg-slate-100 active:scale-98",
                    colorClasses[color]
                )}
            >
                <div className="flex items-center gap-3 overflow-hidden">
                    {selectedOption?.icon && (
                        <div className={cn(
                            "p-2 rounded-xl shrink-0",
                            isOpen ? "bg-slate-100" : "bg-white"
                        )}>
                            {selectedOption.icon}
                        </div>
                    )}
                    <span className={cn(
                        "font-bold truncate",
                        selectedOption ? "text-slate-900" : "text-slate-400"
                    )}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                </div>
                <ChevronDown className={cn("w-5 h-5 text-slate-400 transition-transform duration-300 shrink-0", isOpen && "rotate-180 text-slate-900")} />
            </div>

            {isOpen && (
                <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white rounded-[32px] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.1)] z-[300] overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top">
                    {searchable && (
                        <div className="p-4 border-b border-slate-50">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input 
                                    autoFocus
                                    type="text"
                                    className="w-full h-12 bg-slate-50 rounded-2xl pl-11 pr-4 text-sm font-bold text-slate-900 outline-none focus:bg-white border-2 border-transparent focus:border-brand-pink transition-all"
                                    placeholder="Procurar..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    onClick={e => e.stopPropagation()}
                                />
                            </div>
                        </div>
                    )}
                    <div className="max-h-64 overflow-y-auto p-2 space-y-1 no-scrollbar">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map(opt => (
                                <div 
                                    key={opt.value}
                                    onClick={() => {
                                        onChange(opt.value);
                                        setIsOpen(false);
                                        setSearchTerm('');
                                    }}
                                    className={cn(
                                        "w-full px-4 py-3 rounded-[20px] flex items-center justify-between cursor-pointer transition-all group",
                                        value === opt.value 
                                            ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20" 
                                            : "hover:bg-slate-50 text-slate-600"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        {opt.icon && (
                                            <div className={cn(
                                                "p-2 rounded-xl transition-colors",
                                                value === opt.value ? "bg-white/10" : "bg-slate-100 group-hover:bg-white"
                                            )}>
                                                {opt.icon}
                                            </div>
                                        )}
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm">{opt.label}</span>
                                            {opt.description && (
                                                <span className={cn(
                                                    "text-[10px] font-medium",
                                                    value === opt.value ? "text-slate-400" : "text-slate-400"
                                                )}>
                                                    {opt.description}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {value === opt.value && <Check className="w-4 h-4 text-white" />}
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center space-y-2">
                                <div className="text-slate-300 font-black text-[10px] uppercase tracking-widest">Nenhum resultado</div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
