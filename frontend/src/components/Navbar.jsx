// frontend/src/components/Navbar.jsx
'use client'; // Componente de cliente para usar hooks

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { FaSignOutAlt, FaUserCircle, FaListAlt } from 'react-icons/fa'; // Ícones

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth(); // Obtém o estado de autenticação e funções

  return (
    <nav className="bg-indigo-700 p-4 text-white shadow-lg sticky top-0 z-40">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo/Nome da Aplicação */}
        <Link href="/" className="text-2xl font-bold hover:text-indigo-200 transition-colors duration-200">
          Listado
        </Link>

        {/* Links de Navegação */}
        <div className="flex items-center space-x-6">
          {isAuthenticated ? (
            <>
              <Link href="/dashboard" className="flex items-center hover:text-indigo-200 transition-colors duration-200">
                <FaListAlt className="mr-2" /> Minhas Listas
              </Link>
              <Link href="/settings" className="flex items-center hover:text-indigo-200 transition-colors duration-200">
                <FaUserCircle className="mr-2" /> {user?.name || 'Perfil'}
              </Link>
              <button
                onClick={logout}
                className="bg-indigo-800 hover:bg-indigo-900 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-colors duration-200"
              >
                <FaSignOutAlt className="mr-2" /> Sair
              </button>
            </>
          ) : (
            <>
              {/* Você pode adicionar links para login/cadastro aqui se quiser,
                  mas a página inicial já redireciona */}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}