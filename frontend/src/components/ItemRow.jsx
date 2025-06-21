// frontend/src/components/ItemRow.jsx
import { useState } from 'react';
import { FaCheckCircle, FaRegCircle, FaTrash, FaEdit, FaTimes, FaSave } from 'react-icons/fa';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// 1. Remova 'canEditItemDetails' da desestruturação das props.
// 2. Use 'canEditAdminFields' para desabilitar/habilitar campos que só admins podem editar.
// 3. Use 'canEditCollaboratorFields' para desabilitar/habilitar campos que admins E colaboradores podem editar.
export default function ItemRow({
  item,
  listId,
  onUpdate,
  onDelete,
  canMarkAsPurchased,
  canEditAdminFields,
  canEditCollaboratorFields,
  currentUserId // Mantém, embora não seja usado para `disabled` aqui, pode ser útil para outras lógicas.
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(item.name);
  const [editedQuantity, setEditedQuantity] = useState(item.quantity);
  const [editedPriceLimit, setEditedPriceLimit] = useState(item.priceLimit !== null && item.priceLimit !== undefined ? item.priceLimit.toString() : '');
  const [editedActualPrice, setEditedActualPrice] = useState(item.actualPrice !== null && item.actualPrice !== undefined ? item.actualPrice.toString() : '');
  const [editedNotes, setEditedNotes] = useState(item.notes || '');
  const [editedCategory, setEditedCategory] = useState(item.category || '');
  const [editedPriority, setEditedPriority] = useState(item.priority || 'MEDIUM');

  const parseNumberInput = (value) => {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? null : parsed;
  };

  const handleTogglePurchased = () => {
    if (!canMarkAsPurchased) return;

    const itemId = item.id;
    const currentStatus = item.purchased;

    // Quando o status de comprado é alternado, é importante enviar todos os campos editáveis
    // para garantir que qualquer mudança pendente na UI seja salva junto com a alteração de status.
    const updates = {
      name: editedName,
      quantity: parseInt(editedQuantity) || 1,
      priceLimit: parseNumberInput(editedPriceLimit),
      actualPrice: parseNumberInput(editedActualPrice),
      notes: editedNotes,
      category: editedCategory,
      priority: editedPriority,
      purchased: !currentStatus, // Alterna o status
    };

    // A lógica de `purchasedAt` e `purchasedById` é tratada no backend,
    // então não precisamos nos preocupar com isso aqui.

    onUpdate(itemId, updates);
  };

  const handleSaveEdit = () => {
    // Ao salvar as edições, enviamos todos os campos editados.
    // O backend já tem a lógica de permissão para aceitar ou rejeitar a atualização de cada campo.
    onUpdate(item.id, {
      name: editedName,
      quantity: parseInt(editedQuantity),
      priceLimit: parseNumberInput(editedPriceLimit),
      actualPrice: parseNumberInput(editedActualPrice),
      notes: editedNotes,
      category: editedCategory,
      priority: editedPriority,
      purchased: item.purchased // Mantém o status de compra atual.
    });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    // Ao cancelar, resetamos os estados para os valores originais do item.
    setEditedName(item.name);
    setEditedQuantity(item.quantity);
    setEditedPriceLimit(item.priceLimit !== null && item.priceLimit !== undefined ? item.priceLimit.toString() : '');
    setEditedActualPrice(item.actualPrice !== null && item.actualPrice !== undefined ? item.actualPrice.toString() : '');
    setEditedNotes(item.notes || '');
    setEditedCategory(item.category || '');
    setEditedPriority(item.priority || 'MEDIUM');
    setIsEditing(false);
  };

  return (
    <div className={`flex items-center p-4 border-b last:border-b-0 ${item.purchased ? 'bg-green-50' : 'bg-white'}`}>
      <div className="flex-grow">
        {isEditing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {/* Campos editáveis apenas por admins */}
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              className="border p-1 rounded w-full"
              placeholder="Nome"
              disabled={!canEditAdminFields} 
            />
            <input
              type="number"
              value={editedQuantity}
              onChange={(e) => setEditedQuantity(e.target.value)}
              className="border p-1 rounded w-full"
              min="1"
              placeholder="Quantidade"
              disabled={!canEditAdminFields} 
            />
            <input
              type="number"
              value={editedPriceLimit}
              onChange={(e) => setEditedPriceLimit(e.target.value)}
              className="border p-1 rounded w-full"
              step="0.01"
              min="0"
              placeholder="Preço Sugerido"
              disabled={!canEditAdminFields} 
            />

           
            <input
              type="number"
              value={editedActualPrice}
              onChange={(e) => setEditedActualPrice(e.target.value)}
              className="border p-1 rounded w-full"
              step="0.01"
              min="0"
              placeholder="Preço Real"
              disabled={!canEditCollaboratorFields} 
            />
            <textarea
              value={editedNotes}
              onChange={(e) => setEditedNotes(e.target.value)}
              className="border p-1 rounded w-full md:col-span-2"
              placeholder="Notas"
              rows="2"
              disabled={!canEditCollaboratorFields} 
            />
             <input
              type="text"
              value={editedCategory}
              onChange={(e) => setEditedCategory(e.target.value)}
              className="border p-1 rounded w-full"
              placeholder="Categoria"
              disabled={!canEditCollaboratorFields} 
            />
            <select
              value={editedPriority}
              onChange={(e) => setEditedPriority(e.target.value)}
              className="border p-1 rounded w-full"
              disabled={!canEditCollaboratorFields}
            >
              <option value="LOW">Baixa</option>
              <option value="MEDIUM">Média</option>
              <option value="HIGH">Alta</option>
              <option value="URGENT">Urgente</option>
            </select>
          </div>
        ) : (
          <div>
            <h3 className={`text-lg font-semibold ${item.purchased ? 'line-through text-gray-500' : 'text-gray-800'}`}>
              {item.name} ({item.quantity})
            </h3>
            <p className="text-sm text-gray-600">
              {item.priceLimit !== null && item.priceLimit !== undefined ? `Sugestão: R${item.priceLimit.toFixed(2)}` : ''}
              {item.actualPrice !== null && item.actualPrice !== undefined ? ` | Real: R${item.actualPrice.toFixed(2)}` : ''}
            </p>
            {item.notes && <p className="text-xs text-gray-500 italic mt-1">Notas: {item.notes}</p>}
            {item.category && <p className="text-xs text-gray-500 mt-1">Categoria: {item.category}</p>}
            {item.priority && <p className="text-xs text-gray-500 mt-1">Prioridade: {item.priority}</p>}
            {item.purchased && item.purchasedBy && item.purchasedAt && (
              <p className="text-xs text-gray-500 mt-1">
                Comprado por {item.purchasedBy.name} em {format(new Date(item.purchasedAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
              </p>
            )}
          </div>
        )}
      </div>
      <div className="flex space-x-2 ml-4">
        {isEditing ? (
          <>
            {/* O botão de salvar edições só deve aparecer se o usuário tiver permissão para editar algo */}
            {(canEditAdminFields || canEditCollaboratorFields) && (
                <button onClick={handleSaveEdit} className="text-green-500 hover:text-green-700 p-2" title="Salvar">
                <FaSave size={20} />
                </button>
            )}
            <button onClick={handleCancelEdit} className="text-red-500 hover:text-red-700 p-2" title="Cancelar">
              <FaTimes size={20} />
            </button>
          </>
        ) : (
          <>
            {canMarkAsPurchased && (
              <button
                onClick={handleTogglePurchased}
                className={`p-2 rounded-full ${item.purchased ? 'text-green-600 hover:text-green-800' : 'text-gray-400 hover:text-green-600'}`}
                title={item.purchased ? "Marcar como Não Comprado" : "Marcar como Comprado"}
              >
                {item.purchased ? <FaCheckCircle size={20} /> : <FaRegCircle size={20} />}
              </button>
            )}
             {/* O botão de edição (caneta) só deve aparecer se o usuário tiver permissão para editar algum campo */}
             {(canEditAdminFields || canEditCollaboratorFields) && (
              <button onClick={() => setIsEditing(true)} className="text-blue-500 hover:text-blue-700 p-2" title="Editar Item">
                <FaEdit size={20} />
              </button>
            )}
             {/* O botão de lixeira (deletar) só deve aparecer se o usuário tiver permissão de admin */}
             {canEditAdminFields && (
              <button onClick={() => onDelete(item.id)} className="text-red-500 hover:text-red-700 p-2" title="Remover Item">
                <FaTrash size={20} />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}