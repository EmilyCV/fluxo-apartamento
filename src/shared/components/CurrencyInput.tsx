'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '../utils/cn';

interface CurrencyInputProps {
    value: number;
    onChange: (value: number) => void;
    label?: string;
    placeholder?: string;
    className?: string;
}

export function CurrencyInput({ 
    value, 
    onChange, 
    label, 
    className 
}: CurrencyInputProps) {
    // Format number to BRL string
    const formatToBRL = useCallback((val: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(val);
    }, []);

    const [displayValue, setDisplayValue] = useState(() => formatToBRL(value));

    // Update display when value changes externally
    useEffect(() => {
        const numericFromDisplay = Number(displayValue.replace(/\D/g, '')) / 100;
        if (numericFromDisplay !== value) {
            setDisplayValue(formatToBRL(value));
        }
    }, [value, formatToBRL, displayValue]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/\D/g, '');
        
        // Handle empty or zero
        if (!rawValue || rawValue === '000') {
            setDisplayValue(formatToBRL(0));
            onChange(0);
            return;
        }

        const numericValue = Number(rawValue) / 100;
        
        // Limit to reasonable value (10 million)
        if (numericValue > 9999999.99) return;

        setDisplayValue(formatToBRL(numericValue));
        onChange(numericValue);
    };

    // Prevent cursor from being placed before R$ or in weird positions
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        // Optional: Move cursor to end on focus
        const length = e.target.value.length;
        setTimeout(() => {
            e.target.setSelectionRange(length, length);
        }, 0);
    };

    return (
        <div className={cn("space-y-3", className)}>
            {label && (
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    {label}
                </label>
            )}
            <div className="relative">
                <input
                    type="text"
                    inputMode="numeric"
                    className={cn(
                        "w-full h-16 bg-slate-50 border-2 border-transparent rounded-[24px] px-6 text-lg font-bold text-slate-900 outline-none shadow-sm transition-all",
                        "focus:border-brand-green focus:bg-white focus:shadow-xl focus:shadow-brand-green/10"
                    )}
                    value={displayValue}
                    onChange={handleChange}
                    onFocus={handleFocus}
                />
            </div>
        </div>
    );
}
