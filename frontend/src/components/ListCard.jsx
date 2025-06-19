// frontend/src/components/ListCard.jsx
import Link from 'next/link';
import { FaShoppingCart, FaUsers } from 'react-icons/fa'; // Ícones de carrinho e usuários

export default function ListCard({ list }) {
  // Exemplo de como usar a informação do papel do usuário na lista
  const userRoleText = list.userRole === 'admin' ? 'Administrador' : 'Colaborador';

  return (
    <Link href={`/list/${list.id}`} className="block">
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300 cursor-pointer h-full flex flex-col justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{list.name}</h2>
          {list.description && (
            <p className="text-gray-600 mb-4 line-clamp-2">{list.description}</p>
          )}
        </div>
        <div className="flex items-center justify-between text-sm text-gray-500 mt-4">
          <div className="flex items-center">
            <FaShoppingCart className="mr-1 text-indigo-500" />
            <span>{list.pendingItemsCount} itens pendentes</span>
          </div>
          <div className="flex items-center">
            <FaUsers className="mr-1 text-green-500" />
            <span>{list._count.collaborations} colaboradores</span>
          </div>
        </div>
        <div className="mt-4 text-xs text-gray-400">
          Criado em: {new Date(list.createdAt).toLocaleDateString()}
        </div>
        {list.userRole && (
          <div className="mt-2 text-sm text-right font-semibold text-indigo-700">
            Seu papel: {userRoleText}
          </div>
        )}
      </div>
    </Link>
  );
}