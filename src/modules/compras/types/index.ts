export type Ambiente = 
    | "1. Cozinha" 
    | "2. Sala" 
    | "3. Varanda" 
    | "4. Banheiro" 
    | "5. Escritório" 
    | "6. Quarto" 
    | "7. Gerais";

export type Categoria = 
    | "1. Reforma" 
    | "2. Eletros" 
    | "3. Utensílios" 
    | "4. Enxoval";

export type SubCategoria = 
    // Reforma
    | "1.1 Móveis planejados" 
    | "1.2 Móveis convencionais" 
    | "1.3 Materiais"
    // Eletros
    | "2.1 Eletrodomésticos" 
    | "2.2 Eletroportáteis"
    // Utensílios
    | "3.1 Utensílios cozinha" 
    | "3.2 Utensílios limpeza" 
    | "3.3 Utensílios gerais" 
    | "3.4 Utensílios higiene"
    // Enxoval
    | "4.1 Casa e banho" 
    | "4.2 Cama";

export type Prioridade = 
    | "Comprar agora" 
    | "Quando der" 
    | "Pode esperar" 
    | "Aguardando projeto"
    | "Adquirido";

export interface CompraItem {
    id: string;
    ambiente: Ambiente;
    nome: string;
    modelo?: string;
    fabricante?: string;
    quantidade: number;
    valorUnitario: number;
    valorTotalAproximado: number;
    categoria: Categoria;
    subCategoria: SubCategoria;
    adquirido: boolean;
    prioridade: Prioridade;
    link?: string;
    observacoes?: string;
    createdAt?: any; // Timestamp do Firestore
    updatedAt?: any;
}
