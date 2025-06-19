// frontend/src/app/page.js
'use client'; // Indica que este componente é para ser executado no cliente

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth'; // Importa o hook de autenticação

export default function HomePage() {
  const { isAuthenticated, loading } = useAuth(); // Obtém o estado de autenticação
  const router = useRouter(); // Hook para navegação programática

  useEffect(() => {
    // Se ainda estiver carregando o estado de autenticação, não faz nada
    if (loading) {
      return;
    }

    // Redireciona com base no estado de autenticação
    if (isAuthenticated) {
      router.push('/dashboard'); // Se autenticado, vai para o dashboard
    } else {
      router.push('/login'); // Se não autenticado, vai para a página de login
    }
  }, [isAuthenticated, loading, router]); // Dependências do useEffect

  // Renderiza algo enquanto redireciona
  return (
    <div className="flex justify-center items-center h-screen">
      <p className="text-xl text-gray-700">Carregando...</p>
    </div>
  );
}