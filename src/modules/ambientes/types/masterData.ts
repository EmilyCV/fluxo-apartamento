import { 
    ChefHat, 
    Tv, 
    Sun, 
    Bath, 
    Monitor, 
    Bed, 
    Package,
    LucideIcon
} from 'lucide-react';

export interface MasterAmbiente {
    id: string; // O ID usado no enum/firestore (ex: "1. Cozinha")
    label: string;
    icon: LucideIcon;
    color: string;
    desc: string;
}

export const MASTER_AMBIENTES: MasterAmbiente[] = [
    { id: "1. Cozinha", label: "Cozinha", icon: ChefHat, color: "from-orange-50 to-white border-orange-100 text-orange-600", desc: "Coração da casa e eletros" },
    { id: "2. Sala", label: "Sala", icon: Tv, color: "from-blue-50 to-white border-blue-100 text-blue-600", desc: "Conforto e eletrônicos" },
    { id: "3. Varanda", label: "Varanda", icon: Sun, color: "from-green-50 to-white border-green-100 text-green-600", desc: "Lazer e plantas" },
    { id: "4. Banheiro", label: "Banheiro", icon: Bath, color: "from-cyan-50 to-white border-cyan-100 text-cyan-600", desc: "Higiene e metais" },
    { id: "5. Escritório", label: "Escritório", icon: Monitor, color: "from-indigo-50 to-white border-indigo-100 text-indigo-600", desc: "Trabalho e organização" },
    { id: "6. Quarto", icon: Bed, label: "Quarto", color: "from-purple-50 to-white border-purple-100 text-purple-600", desc: "Descanso e enxoval" },
    { id: "7. Gerais", icon: Package, label: "Gerais", color: "from-slate-50 to-white border-slate-200 text-slate-600", desc: "Itens de uso comum" },
];
