// frontend/src/components/CollaboratorList.jsx
import { useState } from 'react';
import api from '@/lib/api';
import { FaUserPlus, FaTrash, FaTimes, FaUserEdit } from 'react-icons/fa';

export default function CollaboratorList({ listId, collaborations, ownerId, currentUserId, onClose, onUpdate, canRemoveCollaborators, canManageRoles }) {
  const [newCollaboratorEmail, setNewCollaboratorEmail] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [roleChangeLoading, setRoleChangeLoading] = useState({});

  // Verifica se o usuário atual é o proprietário da lista
  const isCurrentUserOwner = ownerId === currentUserId;

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviteError('');
    setInviteLoading(true);
    try {
      await api.post(`/collaborations/${listId}/invite`, { invitedEmail: newCollaboratorEmail });
      setNewCollaboratorEmail('');
      onUpdate(); // Recarrega os dados da lista para mostrar o novo colaborador
    } catch (err) {
      setInviteError(err.response?.data?.message || 'Erro ao convidar usuário.');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleRemoveCollaborator = async (collaborationId) => {
    if (!confirm('Tem certeza que deseja remover este colaborador?')) return;
    try {
      await api.delete(`/collaborations/${listId}/collaborators/${collaborationId}`);
      onUpdate(); // Recarrega os dados da lista
    } catch (err) {
      setInviteError(err.response?.data?.message || 'Erro ao remover colaborador.');
    }
  };

  const handleChangeRole = async (collaborationId, newRole) => {
    if (!confirm(`Tem certeza que deseja alterar o papel para ${newRole}?`)) return;
    setRoleChangeLoading(prev => ({ ...prev, [collaborationId]: true }));
    try {
      await api.put(`/collaborations/${listId}/collaborators/${collaborationId}/role`, { role: newRole });
      onUpdate(); // Recarrega os dados da lista
    } catch (err) {
      setInviteError(err.response?.data?.message || 'Erro ao atualizar papel.');
    } finally {
      setRoleChangeLoading(prev => ({ ...prev, [collaborationId]: false }));
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Gerenciar Colaboradores</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes size={24} />
          </button>
        </div>

        {inviteError && <p className="text-red-500 text-sm mb-4 text-center">{inviteError}</p>}

        {/* Formulário de convite (apenas admins/owner podem convidar) */}
        {canRemoveCollaborators && ( // Usando a mesma permissão de remover, que implica isAdmin
          <form onSubmit={handleInvite} className="mb-6 border-b pb-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Convidar Novo Colaborador</h3>
            <div className="flex">
              <input
                type="email"
                className="flex-grow border border-gray-300 rounded-l-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={newCollaboratorEmail}
                onChange={(e) => setNewCollaboratorEmail(e.target.value)}
                required
                placeholder="E-mail do novo colaborador"
              />
              <button
                type="submit"
                disabled={inviteLoading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-r-md flex items-center shadow-md transition-colors duration-200"
              >
                {inviteLoading ? 'Convidando...' : <FaUserPlus className="mr-2" />}
                Convidar
              </button>
            </div>
          </form>
        )}

        {/* Lista de colaboradores atuais */}
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Colaboradores Atuais</h3>
        {collaborations.length === 0 ? (
          <p className="text-gray-600 text-center">Nenhum colaborador ainda.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {/* O proprietário da lista sempre é exibido primeiro e não tem um botão de remover aqui */}
            <li className="flex justify-between items-center py-3">
              <div className="flex-grow">
                <span className="font-medium text-gray-800">
                  {collaborations.find(c => c.userId === ownerId)?.user?.name || "Proprietário"}
                  <span className="text-sm text-gray-500 ml-2">({collaborations.find(c => c.userId === ownerId)?.user?.email || "E-mail do Proprietário"})</span>
                </span>
                <p className="text-sm text-indigo-700 font-semibold">Proprietário</p>
              </div>
            </li>
            {collaborations
              .filter(col => col.userId !== ownerId) // Filtra o proprietário (já exibido)
              .map((col) => (
                <li key={col.id} className="flex justify-between items-center py-3">
                  <div className="flex-grow">
                    <span className="font-medium text-gray-800">{col.user.name}</span>
                    <p className="text-sm text-gray-500">{col.user.email}</p>
                    <p className="text-sm text-gray-600 capitalize">Papel: {col.role}</p>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    {canManageRoles && col.userId !== currentUserId && ( // Apenas o owner pode mudar papel e não pode mudar o próprio papel
                      <button
                        onClick={() => handleChangeRole(col.id, col.role === 'admin' ? 'collaborator' : 'admin')}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded-full transition-colors duration-200"
                        title={col.role === 'admin' ? 'Rebaixar para Colaborador' : 'Promover para Administrador'}
                        disabled={roleChangeLoading[col.id]}
                      >
                        {roleChangeLoading[col.id] ? '...' : <FaUserEdit size={16} />}
                      </button>
                    )}
                    {canRemoveCollaborators && (
                      <button
                        onClick={() => handleRemoveCollaborator(col.id)}
                        className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors duration-200"
                        title="Remover Colaborador"
                      >
                        <FaTrash size={16} />
                      </button>
                    )}
                  </div>
                </li>
              ))}
          </ul>
        )}

        <div className="mt-8 text-center">
          <button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}