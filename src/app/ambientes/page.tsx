import { AmbientesView } from '@/modules/ambientes/ui/AmbientesView';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cômodos',
  description: 'Explore os ambientes do novo apartamento e veja o progresso de cada um.',
};

export default function AmbientesPage() {
  return <AmbientesView />;
}
