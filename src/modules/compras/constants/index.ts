import { Ambiente, Categoria, Prioridade, SubCategoria } from '../types';

export const ALL_AMBIENTES: Ambiente[] = [
  '1. Cozinha',
  '2. Sala',
  '3. Varanda',
  '4. Banheiro',
  '5. Escritório',
  '6. Quarto',
  '7. Gerais',
];

export const ALL_CATEGORIAS: Categoria[] = [
  '1. Reforma',
  '2. Eletros',
  '3. Utensílios',
  '4. Enxoval',
];

export const PRIORIDADE_ORDER: Prioridade[] = [
  'Comprar agora',
  'Quando der',
  'Pode esperar',
  'Aguardando projeto',
  'Adquirido',
];

export const SUB_CATEGORIAS_BY_CATEGORIA: Record<Categoria, SubCategoria[]> = {
  '1. Reforma': ['Móveis planejados', 'Móveis convencionais', 'Materiais'],
  '2. Eletros': ['Eletrodomésticos', 'Eletroportáteis'],
  '3. Utensílios': [
    'Utensílios cozinha',
    'Utensílios limpeza',
    'Utensílios gerais',
    'Utensílios higiene',
  ],
  '4. Enxoval': ['Casa e banho', 'Cama'],
};
