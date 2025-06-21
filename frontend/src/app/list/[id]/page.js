// frontend/src/app/list/[id]/page.js
'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import ItemRow from '@/components/ItemRow';
import CollaboratorList from '@/components/CollaboratorList';
import ExpenseSummary from '@/components/ExpenseSummary';
import HistoryModal from '@/components/HistoryModal';
import { FaPlus, FaUsers, FaHistory, FaEdit, FaSave, FaTimes } from 'react-icons/fa'; // Ícones adicionais

export default function ListPage({ params }) {
 
  const resolvedParams = use(params); // <-- USE React.use() AQUI
  const listId = resolvedParams.id; 
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const router = useRouter();
  const [list, setList] = useState(null);
  const [items, setItems] = useState([]);
  const [collaborations, setCollaborations] = useState([]);
  const [expenseReport, setExpenseReport] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState(1);
  const [newItemPriceLimit, setNewItemPriceLimit] = useState('');
  const [isEditingListName, setIsEditingListName] = useState(false);
  const [editedListName, setEditedListName] = useState('');
  const [editedListDescription, setEditedListDescription] = useState('');
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showCollaboratorModal, setShowCollaboratorModal] = useState(false);

  // Polling: Intervalo de atualização (a cada 60 segundos)
  const POLLING_INTERVAL = 60000;

  // Função para buscar os dados da lista
  const fetchListData = useCallback(async () => {
    if (!isAuthenticated || !listId) return;

    setLoading(true); // Pode ser mais granular, mas para MVP, carrega tudo
    try {
      const listResponse = await api.get(`/lists/${listId}`);
      setList(listResponse.data);
      setItems(listResponse.data.items || []);
      setCollaborations(listResponse.data.collaborations || []);
      setEditedListName(listResponse.data.name); // Inicializa o campo de edição
      setEditedListDescription(listResponse.data.description || ''); // Inicializa o campo de edição

      const expenseResponse = await api.get(`/reports/expenses/${listId}`);
      setExpenseReport(expenseResponse.data);

      const historyResponse = await api.get(`/reports/history/${listId}`);
      setHistory(historyResponse.data);

    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao carregar os dados da lista.');
      setList(null); // Limpa a lista se houver erro
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, listId]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    fetchListData(); // Carrega os dados da lista na montagem
    const interval = setInterval(fetchListData, POLLING_INTERVAL); // Inicia o polling

    return () => clearInterval(interval); // Limpa o intervalo na desmontagem
  }, [fetchListData]);

  // Lógica para adicionar um novo item
  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItemName.trim() || newItemQuantity <= 0) {
      setError('Nome do item e quantidade são obrigatórios e válidos.');
      return;
    }
    try {
      const response = await api.post(`/items/${listId}`, {
        name: newItemName,
        quantity: parseInt(newItemQuantity),
        priceLimit: newItemPriceLimit ? parseFloat(newItemPriceLimit) : null,
      });
      setItems((prevItems) => [...prevItems, response.data]);
      setNewItemName('');
      setNewItemQuantity(1);
      setNewItemPriceLimit('');
      setError(''); // Limpa erro
      fetchListData(); // Recarrega todos os dados para atualizar relatórios e histórico
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao adicionar item.');
    }
  };

  // Lógica para atualizar um item
  const handleUpdateItem = async (itemId, updates) => {
    try {
      await api.put(`/items/${listId}/${itemId}`, updates);
      // O polling irá atualizar o estado, mas podemos otimizar o feedback imediato
      setItems((prevItems) =>
        prevItems.map((item) => (item.id === itemId ? { ...item, ...updates } : item))
      );
      fetchListData(); // Força recarregamento para relatórios
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao atualizar item.');
    }
  };

  // Lógica para deletar um item
  const handleDeleteItem = async (itemId) => {
    try {
      await api.delete(`/items/${listId}/${itemId}`);
      setItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
      setError(''); // Limpa erro
      fetchListData(); // Força recarregamento para relatórios e histórico
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao deletar item.');
    }
  };

  // Lógica para atualizar nome/descrição da lista
  const handleUpdateListDetails = async () => {
    if (!editedListName.trim()) {
      setError('O nome da lista não pode ser vazio.');
      return;
    }
    try {
      const response = await api.put(`/lists/${listId}`, {
        name: editedListName,
        description: editedListDescription.trim() === '' ? null : editedListDescription,
      });
      setList(prev => ({ ...prev, name: response.data.name, description: response.data.description }));
      setIsEditingListName(false);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao atualizar detalhes da lista.');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[calc(100vh-80px)]">
        <p className="text-xl text-gray-700">Carregando lista...</p>
      </div>
    );
  }

  if (error && !list) { // Exibe erro se a lista não pôde ser carregada
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] text-red-600">
        <p className="text-2xl font-bold mb-4">Erro:</p>
        <p className="text-lg text-center">{error}</p>
        <button onClick={() => router.push('/dashboard')} className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          Voltar para o Dashboard
        </button>
      </div>
    );
  }

  if (!list) { // Caso a lista não exista ou não seja acessível e não haja erro específico
    return (
      <div className="flex justify-center items-center h-full min-h-[calc(100vh-80px)]">
        <p className="text-xl text-gray-700">Lista não encontrada ou sem acesso.</p>
      </div>
    );
  }
    // Verifica as permissões do usuário logado na lista
  const isOwner = list.ownerId === user.id;
  const userCollaboration = collaborations.find(col => col.userId === user.id);
  const isAdmin = isOwner || (userCollaboration && userCollaboration.role === 'admin');
  const isCollaborator = userCollaboration && userCollaboration.role === 'collaborator'; // Definir explicitamente

  // CORREÇÃO: Novas props de permissão mais granulares para ItemRow
  const canEditAdminFields = isAdmin; // Para nome, quantidade, preço sugerido
  const canEditCollaboratorFields = isAdmin || isCollaborator; // Para preço real, notas, categoria, prioridade
  const canMarkAsPurchased = isAdmin || isCollaborator; // Para marcar/desmarcar

  // As outras permissões (canEditListDetails, canAddItems, canRemoveCollaborators, canManageRoles) permanecem como estão
  const canEditListDetails = isAdmin;
  const canAddItems = isAdmin;
  const canRemoveCollaborators = isAdmin;
  const canManageRoles = isOwner;
  return (
    <div className="p-6 bg-white rounded-lg shadow-xl min-h-[calc(100vh-80px)]">
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      {/* Título e Botões de Ação da Lista */}
      <div className="flex justify-between items-center mb-8">
        {isEditingListName ? (
          <div className="flex flex-col w-full max-w-xl">
            <input
              type="text"
              className="text-4xl font-extrabold text-gray-900 border-b-2 border-indigo-500 focus:outline-none bg-transparent"
              value={editedListName}
              onChange={(e) => setEditedListName(e.target.value)}
            />
            <textarea
              className="mt-2 text-gray-600 text-lg border-b-2 border-indigo-500 focus:outline-none bg-transparent resize-none"
              rows="2"
              value={editedListDescription}
              onChange={(e) => setEditedListDescription(e.target.value)}
              placeholder="Descrição da lista (opcional)"
            />
          </div>
        ) : (
          <div className="flex-grow">
            <h1 className="text-4xl font-extrabold text-gray-900">{list.name}</h1>
            {list.description && <p className="mt-2 text-gray-600 text-lg">{list.description}</p>}
          </div>
        )}

        <div className="flex space-x-3 ml-4">
          {canEditListDetails && ( // Botão de editar/salvar detalhes da lista
            isEditingListName ? (
              <>
                <button
                  onClick={handleUpdateListDetails}
                  className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-full shadow-md transition-colors duration-200"
                  title="Salvar"
                >
                  <FaSave size={20} />
                </button>
                <button
                  onClick={() => {
                    setIsEditingListName(false);
                    setEditedListName(list.name);
                    setEditedListDescription(list.description || '');
                    setError('');
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-md transition-colors duration-200"
                  title="Cancelar"
                >
                  <FaTimes size={20} />
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditingListName(true)}
                className="bg-yellow-500 hover:bg-yellow-600 text-white p-3 rounded-full shadow-md transition-colors duration-200"
                title="Editar Detalhes da Lista"
              >
                <FaEdit size={20} />
              </button>
            )
          )}
          <button
            onClick={() => setShowCollaboratorModal(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-md transition-colors duration-200"
            title="Gerenciar Colaboradores"
          >
            <FaUsers size={20} />
          </button>
          <button
            onClick={() => setShowHistoryModal(true)}
            className="bg-purple-500 hover:bg-purple-600 text-white p-3 rounded-full shadow-md transition-colors duration-200"
            title="Ver Histórico"
          >
            <FaHistory size={20} />
          </button>
        </div>
      </div>

      {/* Resumo de Gastos */}
      {expenseReport && (
        <div className="mb-8">
          <ExpenseSummary report={expenseReport} />
        </div>
      )}

      {/* Formulário para Adicionar Novo Item */}
      {canAddItems && (
        <div className="mb-8 p-6 bg-gray-50 rounded-lg shadow-inner">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Adicionar Novo Item</h2>
          <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label htmlFor="itemName" className="block text-sm font-medium text-gray-700">Nome do Item</label>
              <input
                type="text"
                id="itemName"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                required
                placeholder="Ex: Arroz, Leite"
              />
            </div>
            <div>
              <label htmlFor="itemQuantity" className="block text-sm font-medium text-gray-700">Quantidade</label>
              <input
                type="number"
                id="itemQuantity"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={newItemQuantity}
                onChange={(e) => setNewItemQuantity(parseInt(e.target.value) || 1)}
                min="1"
                required
              />
            </div>
            <div>
              <label htmlFor="itemPriceLimit" className="block text-sm font-medium text-gray-700">Preço Sugerido (Opcional)</label>
              <input
                type="number"
                id="itemPriceLimit"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={newItemPriceLimit}
                onChange={(e) => setNewItemPriceLimit(e.target.value)}
                step="0.01"
                min="0"
                placeholder="Ex: 5.99"
              />
            </div>
            <div className="md:col-span-3">
              <button
                type="submit"
                className="w-full flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors duration-200"
              >
                <FaPlus className="mr-2" /> Adicionar Item
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Itens */}
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">Itens da Lista</h2>
      {items.length === 0 ? (
        <p className="text-gray-600 text-center py-4">Nenhum item nesta lista ainda.</p>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          {items.map((item) => (
            <ItemRow
                key={item.id}
              item={item}
              listId={listId}
              onUpdate={handleUpdateItem}
              onDelete={handleDeleteItem}
              canMarkAsPurchased={canMarkAsPurchased}
              // CORREÇÃO: Passando as novas props de permissão granulares
              canEditAdminFields={canEditAdminFields}
              canEditCollaboratorFields={canEditCollaboratorFields}
              // Passando o ID do usuário atual, útil se o frontend precisar dele para lógicas futuras
              currentUserId={user.id}
            />
          ))}
        </div>
      )}

      {/* Modal de Histórico */}
      {showHistoryModal && (
        <HistoryModal
          history={history}
          onClose={() => setShowHistoryModal(false)}
        />
      )}

      {/* Modal de Colaboradores */}
      {showCollaboratorModal && (
        <CollaboratorList
          listId={listId}
          collaborations={collaborations}
          ownerId={list.ownerId}
          currentUserId={user.id}
          onClose={() => setShowCollaboratorModal(false)}
          onUpdate={fetchListData} // Recarrega dados da lista após alterações de colaboração
          canRemoveCollaborators={canRemoveCollaborators}
          canManageRoles={canManageRoles}
        />
      )}
    </div>
  );
}