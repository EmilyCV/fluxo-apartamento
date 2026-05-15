import { ComprasView } from '@/modules/compras/ui/ComprasView';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lista de Compras',
  description: 'Gerencie todos os itens necessários para o seu novo apartamento.',
};

export default function ComprasPage() {
  return <ComprasView />;
}
