import { NotaCor } from '../types';

export const NOTAS_CORES: Record<
  NotaCor,
  { bg: string; border: string; text: string; dot: string; swatch: string }
> = {
  pink: {
    bg: 'bg-brand-pink-light',
    border: 'border-brand-pink',
    text: 'text-brand-pink-dark',
    dot: 'bg-brand-pink',
    swatch: 'bg-brand-pink',
  },
  blue: {
    bg: 'bg-brand-blue-light',
    border: 'border-brand-blue',
    text: 'text-brand-blue-dark',
    dot: 'bg-brand-blue',
    swatch: 'bg-brand-blue',
  },
  green: {
    bg: 'bg-brand-green-light',
    border: 'border-brand-green',
    text: 'text-brand-green-dark',
    dot: 'bg-brand-green',
    swatch: 'bg-brand-green',
  },
  yellow: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-700',
    dot: 'bg-yellow-200',
    swatch: 'bg-yellow-200',
  },
  purple: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-700',
    dot: 'bg-purple-200',
    swatch: 'bg-purple-200',
  },
  slate: {
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    text: 'text-slate-500',
    dot: 'bg-slate-300',
    swatch: 'bg-slate-300',
  },
};

export const NOTAS_CORES_OPTIONS: { value: NotaCor; label: string }[] = [
  { value: 'pink', label: 'Rosa' },
  { value: 'blue', label: 'Azul' },
  { value: 'green', label: 'Verde' },
  { value: 'yellow', label: 'Amarelo' },
  { value: 'purple', label: 'Roxo' },
  { value: 'slate', label: 'Cinza' },
];
