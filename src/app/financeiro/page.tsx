import { FinanceiroView } from '@/modules/financeiro/ui/FinanceiroView';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Financeiro',
  description: 'Acompanhe o fluxo de pagamentos do apartamento: entrada, INCC e evolução de obra.',
};

export default function FinanceiroPage() {
  return <FinanceiroView />;
}
