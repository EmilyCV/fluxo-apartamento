import { LoginView } from '@/modules/auth/ui/LoginView';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Acesso',
  description: 'Faça login para gerenciar os preparativos do Apê 2026.',
};

export default function LoginPage() {
  return <LoginView />;
}
