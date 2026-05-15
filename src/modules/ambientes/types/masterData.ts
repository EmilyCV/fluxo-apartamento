import { ChefHat, Tv, Sun, Bath, Monitor, Bed, Package, LucideIcon } from 'lucide-react';

export interface MasterAmbienteColors {
  gradient: string; // ex: "from-orange-50 to-white"
  border: string; // ex: "border-orange-100"
  iconText: string; // ex: "text-orange-600"
}

export interface MasterAmbiente {
  id: string; // O ID usado no enum/firestore (ex: "1. Cozinha")
  label: string;
  icon: LucideIcon;
  colors: MasterAmbienteColors;
  desc: string;
}

export const MASTER_AMBIENTES: MasterAmbiente[] = [
  {
    id: '1. Cozinha',
    label: 'Cozinha',
    icon: ChefHat,
    colors: {
      gradient: 'from-orange-50 to-white',
      border: 'border-orange-100',
      iconText: 'text-orange-600',
    },
    desc: 'Coração da casa e eletros',
  },
  {
    id: '2. Sala',
    label: 'Sala',
    icon: Tv,
    colors: {
      gradient: 'from-blue-50 to-white',
      border: 'border-blue-100',
      iconText: 'text-blue-600',
    },
    desc: 'Conforto e eletrônicos',
  },
  {
    id: '3. Varanda',
    label: 'Varanda',
    icon: Sun,
    colors: {
      gradient: 'from-green-50 to-white',
      border: 'border-green-100',
      iconText: 'text-green-600',
    },
    desc: 'Lazer e plantas',
  },
  {
    id: '4. Banheiro',
    label: 'Banheiro',
    icon: Bath,
    colors: {
      gradient: 'from-cyan-50 to-white',
      border: 'border-cyan-100',
      iconText: 'text-cyan-600',
    },
    desc: 'Higiene e metais',
  },
  {
    id: '5. Escritório',
    label: 'Escritório',
    icon: Monitor,
    colors: {
      gradient: 'from-indigo-50 to-white',
      border: 'border-indigo-100',
      iconText: 'text-indigo-600',
    },
    desc: 'Trabalho e organização',
  },
  {
    id: '6. Quarto',
    icon: Bed,
    label: 'Quarto',
    colors: {
      gradient: 'from-purple-50 to-white',
      border: 'border-purple-100',
      iconText: 'text-purple-600',
    },
    desc: 'Descanso e enxoval',
  },
  {
    id: '7. Gerais',
    icon: Package,
    label: 'Gerais',
    colors: {
      gradient: 'from-slate-50 to-white',
      border: 'border-slate-200',
      iconText: 'text-slate-600',
    },
    desc: 'Itens de uso comum',
  },
];
