// frontend/src/app/dashboard/page.js
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import ListCard from '@/components/ListCard'; // Componente para exibir cada lista
import { FaPlusCircle } from 'react-icons/fa'; // Ícone de adicionar
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false); // Estado para o modal de criação

  // Redireciona se não estiver autenticado após carregar o estado de autenticação
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Carrega as listas do usuário
  useEffect(() => {
    const fetchLists = async () => {
      if (!isAuthenticated) return; // Garante que só busca se estiver autenticado
      setLoading(true);
      try {
        const response = await api.get('/lists');
        setLists(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Erro ao carregar listas.');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchLists();
    }
  }, [isAuthenticated]); // Dependência do isAuthenticated para recarregar após login

  // Lidar com a criação de uma nova lista
  const handleCreateList = async (e) => {
    e.preventDefault();
    if (!newListName.trim()) {
      setError('O nome da lista não pode ser vazio.');
      return;
    }
    setLoading(true);
    try {
      const response = await api.post('/lists', {
        name: newListName,
        description: newListDescription.trim() === '' ? null : newListDescription,
      });
      setLists([response.data, ...lists]); // Adiciona a nova lista no topo
      setNewListName('');
      setNewListDescription('');
      setShowCreateModal(false); // Fecha o modal
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao criar lista.');
    } finally {
      setLoading(false);
    }
  };

  // Se ainda estiver carregando autenticação ou não autenticado, mostra um loader ou redireciona
  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex justify-center items-center h-full min-h-[calc(100vh-80px)]">
        <p className="text-xl text-gray-700">Carregando dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)]">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Minhas Listas de Compras</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg flex items-center shadow-md transition-colors duration-200"
        >
          <FaPlusCircle className="mr-2" /> Criar Nova Lista
        </button>
      </div>

      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      {loading ? (
        <p className="text-center text-lg text-gray-600">Carregando listas...</p>
      ) : lists.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-gray-600 text-lg">Você ainda não tem nenhuma lista. Crie uma para começar!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lists.map((list) => (
            <ListCard key={list.id} list={list} />
          ))}
        </div>
      )}

      {/* Modal de Criação de Lista */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Criar Nova Lista</h2>
            <form onSubmit={handleCreateList}>
              <div className="mb-4">
                <label htmlFor="newListName" className="block text-gray-700 text-sm font-bold mb-2">
                  Nome da Lista:
                </label>
                <input
                  type="text"
                  id="newListName"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  required
                  placeholder="Ex: Compras da Semana"
                />
              </div>
              <div className="mb-6">
                <label htmlFor="newListDescription" className="block text-gray-700 text-sm font-bold mb-2">
                  Descrição (Opcional):
                </label>
                <textarea
                  id="newListDescription"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline resize-none"
                  rows="3"
                  value={newListDescription}
                  onChange={(e) => setNewListDescription(e.target.value)}
                  placeholder="Ex: Itens para o churrasco de domingo."
                ></textarea>
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg flex items-center shadow-md transition-colors duration-200"
                >
                  {loading ? 'Criando...' : 'Criar Lista'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}