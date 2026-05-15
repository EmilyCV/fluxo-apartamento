import { CompraItem, Ambiente, Categoria, SubCategoria, Prioridade } from '../types';

const ambientes: Ambiente[] = [
  '1. Cozinha',
  '2. Sala',
  '3. Varanda',
  '4. Banheiro',
  '5. Escritório',
  '6. Quarto',
  '7. Gerais',
];

const categorias: Categoria[] = ['1. Reforma', '2. Eletros', '3. Utensílios', '4. Enxoval'];

const subCategorias: Record<Categoria, SubCategoria[]> = {
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

const prioridades: Prioridade[] = [
  'Comprar agora',
  'Quando der',
  'Pode esperar',
  'Aguardando projeto',
  'Adquirido',
];

const nomesItens: Record<SubCategoria, string[]> = {
  'Móveis planejados': ['Armário Cozinha', 'Guarda-roupa Casal', 'Painel TV', 'Gabinete Banheiro'],
  'Móveis convencionais': ['Mesa de Jantar', 'Sofá 3 Lugares', 'Cama Queen', 'Escrivaninha'],
  Materiais: ['Piso Porcelanato', 'Tinta Branca', 'Argamassa', 'Interruptores'],
  Eletrodomésticos: ['Geladeira Frost Free', 'Fogão 4 Bocas', 'Máquina de Lavar', 'Micro-ondas'],
  Eletroportáteis: ['Air Fryer', 'Liquidificador', 'Batedeira', 'Cafeteira'],
  'Utensílios cozinha': ['Jogo de Panelas', 'Conjunto de Talheres', 'Pratos', 'Copos de Cristal'],
  'Utensílios limpeza': ['Vassoura', 'Rodo', 'MOP', 'Aspirador de Pó'],
  'Utensílios gerais': ['Lixeira', 'Organizador', 'Cabides', 'Escada'],
  'Utensílios higiene': ['Porta Escova', 'Saboneteira', 'Suporte Toalha'],
  'Casa e banho': ['Toalha de Banho', 'Tapete Banheiro', 'Cortina Sala'],
  Cama: ['Jogo de Lençol', 'Edredom', 'Travesseiros', 'Protetor de Colchão'],
};

export const generateMockItems = (count: number = 20): CompraItem[] => {
  const items: CompraItem[] = [];

  for (let i = 0; i < count; i++) {
    const categoria = categorias[Math.floor(Math.random() * categorias.length)];
    const subCategoriasPossiveis = subCategorias[categoria];
    const subCategoria =
      subCategoriasPossiveis[Math.floor(Math.random() * subCategoriasPossiveis.length)];
    const possiveisNomes = nomesItens[subCategoria];
    const nome = possiveisNomes[Math.floor(Math.random() * possiveisNomes.length)] + ` ${i + 1}`;

    const quantidade = Math.floor(Math.random() * 3) + 1;
    const valorUnitario = Math.floor(Math.random() * 2000) + 50;

    const prioridade = prioridades[Math.floor(Math.random() * prioridades.length)];

    items.push({
      id: `mock-${i}`,
      ambiente: ambientes[Math.floor(Math.random() * ambientes.length)],
      nome,
      modelo: 'Modelo Fake ' + (i + 1),
      fabricante: 'Marca Genérica',
      quantidade,
      valorUnitario,
      valorTotalAproximado: valorUnitario * quantidade,
      categoria,
      subCategoria,
      adquirido: prioridade === 'Adquirido',
      prioridade,
      link: 'https://example.com',
      observacoes: 'Item gerado automaticamente para testes.',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  return items;
};
