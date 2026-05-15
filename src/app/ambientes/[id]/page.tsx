import { AmbienteDetailView } from '@/modules/ambientes/ui/AmbienteDetailView';
import { Ambiente } from '@/modules/compras/types';
import { Metadata } from 'next';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const ambienteRaw = decodeURIComponent(id) as Ambiente;
  const label = ambienteRaw.split('. ')[1] || ambienteRaw;

  return {
    title: label,
    description: `Detalhes e itens do ambiente ${label}.`,
  };
}

export default async function AmbienteDetailPage({ params }: PageProps) {
  const { id } = await params;
  const ambienteRaw = decodeURIComponent(id) as Ambiente;

  return <AmbienteDetailView ambienteId={ambienteRaw} />;
}
