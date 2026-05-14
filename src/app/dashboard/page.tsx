import { DashboardView } from '@/modules/dashboard/ui/DashboardView';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Acompanhe o progresso geral e investimentos do seu novo apartamento.',
};

export default function DashboardPage() {
  return <DashboardView />;
}
