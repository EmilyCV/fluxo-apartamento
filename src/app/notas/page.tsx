import { Suspense } from 'react';
import { NotasView } from '@/modules/notas/ui/NotasView';

export const metadata = {
  title: 'Notas',
  description: 'Suas notas, ideias e listas de tarefas para o novo lar.',
};

export default function NotasPage() {
  return (
    <Suspense>
      <NotasView />
    </Suspense>
  );
}
