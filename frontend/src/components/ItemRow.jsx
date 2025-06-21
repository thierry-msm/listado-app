// frontend/src/components/ItemRow.jsx
import { useState } from 'react';
import { FaCheckCircle, FaRegCircle, FaTrash, FaEdit, FaTimes, FaSave } from 'react-icons/fa';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ItemRow({
  item,
  listId,
  onUpdate,
  onDelete,
  canMarkAsPurchased,
  canEditAdminFields,
  canEditCollaboratorFields,
  currentUserId // Mantido, caso precise para futuras lógicas que não alteram o item
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(item.name);
  const [editedQuantity, setEditedQuantity] = useState(item.quantity);
  const [editedPriceLimit, setEditedPriceLimit] = useState(item.priceLimit !== null && item.priceLimit !== undefined ? item.priceLimit.toString() : '');
  const [editedActualPrice, setEditedActualPrice] = useState(item.actualPrice !== null && item.actualPrice !== undefined ? item.actualPrice.toString() : '');
  const [editedNotes, setEditedNotes] = useState(item.notes || '');
  const [editedCategory, setEditedCategory] = useState(item.category || '');
  const [editedPriority, setEditedPriority] = useState(item.priority || 'MEDIUM');

  // Converte a string para Float, ou null se vazia
  const parseNumberInput = (value) => {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? null : parsed;
  };

  const handleTogglePurchased = () => {
    if (!canMarkAsPurchased) {
      console.warn("Usuário não tem permissão para marcar/desmarcar itens.");
      return;
    }

    const itemId = item.id;
    const currentStatus = item.purchased;

    // A payload para 'toggle purchased' deve ser minimalista e focada.
    // Incluímos 'purchased' e 'actualPrice' (este último apenas se o usuário tiver permissão para modificá-lo)
    const updates = {
      purchased: !currentStatus, // Alterna o status de comprado
    };

    // Lógica para o `actualPrice` ao marcar/desmarcar:
    // Só incluímos `actualPrice` na payload se o usuário tiver permissão para editar campos de colaborador.
    if (canEditCollaboratorFields) {
      if (!currentStatus) { // Se o item está sendo marcado como comprado (de false para true)
        // Prioriza o valor do `editedActualPrice` (se o usuário preencheu o campo de preço real na UI, mesmo fora do modo edição)
        if (editedActualPrice !== '') {
          updates.actualPrice = parseNumberInput(editedActualPrice);
        } else if (item.actualPrice !== null && item.actualPrice !== undefined) {
          // Mantém o preço real já existente se não houver um novo valor inserido
          updates.actualPrice = item.actualPrice;
        } else {
          // Como último recurso, usa o priceLimit se o actualPrice não estiver definido
          updates.actualPrice = item.priceLimit;
        }
      } else { // Se o item está sendo desmarcado como comprado (de true para false)
        updates.actualPrice = null; // Limpa o preço real
      }
    }
    
    // IMPORTANTE: Não incluímos aqui name, quantity, priceLimit etc.
    // O backend irá usar os valores que já estão no banco de dados para esses campos,
    // e validará que o usuário não está tentando modificá-los sem permissão.
    onUpdate(itemId, updates);
  };

  const handleSaveEdit = () => {
    const updatesToSend = {};

    // 1. Campos que SÓ ADMINISTRADORES podem editar (name, quantity, priceLimit)
    // Esses campos só são adicionados à payload se o usuário tiver canEditAdminFields
    // E se o valor foi realmente alterado.
    if (canEditAdminFields) {
      if (editedName !== item.name) {
        updatesToSend.name = editedName;
      }
      const currentEditedQuantity = parseInt(editedQuantity);
      if (currentEditedQuantity !== item.quantity) {
        updatesToSend.quantity = currentEditedQuantity;
      }
      const currentEditedPriceLimit = parseNumberInput(editedPriceLimit);
      if (currentEditedPriceLimit !== item.priceLimit) {
        updatesToSend.priceLimit = currentEditedPriceLimit;
      }
    }

    // 2. Campos que ADMINISTRADORES E COLABORADORES podem editar (actualPrice, notes, category, priority)
    // Esses campos são adicionados à payload se o usuário tiver canEditCollaboratorFields
    // E se o valor foi realmente alterado.
    if (canEditCollaboratorFields) {
      const currentEditedActualPrice = parseNumberInput(editedActualPrice);
      if (currentEditedActualPrice !== item.actualPrice) {
        updatesToSend.actualPrice = currentEditedActualPrice;
      }
      if (editedNotes !== item.notes) {
        updatesToSend.notes = editedNotes;
      }
      if (editedCategory !== item.category) {
        updatesToSend.category = editedCategory;
      }
      if (editedPriority !== item.priority) {
        updatesToSend.priority = editedPriority;
      }
    }

    // Se nenhuma alteração foi detectada nos campos permitidos, não faz nada e sai do modo de edição
    if (Object.keys(updatesToSend).length === 0) {
      setIsEditing(false);
      return;
    }

    // IMPORTANTE: O status 'purchased' não é enviado aqui em handleSaveEdit.
    // Ele é tratado exclusivamente por handleTogglePurchased, para evitar conflitos
    // e manter a responsabilidade clara.

    onUpdate(item.id, updatesToSend);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    // Restaura os valores originais do item ao cancelar a edição
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
            {/* Campos Nome, Quantidade, Preço Sugerido - Apenas Editáveis por Admins */}
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

            {/* Campos Preço Real, Notas, Categoria, Prioridade - Editáveis por Admins OU Colaboradores */}
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
            {/* O botão de salvar edições só aparece se o usuário tiver permissão para editar algo */}
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
             {/* O botão de edição (lápis) só aparece se o usuário tiver permissão para editar algum campo */}
             {(canEditAdminFields || canEditCollaboratorFields) && (
              <button onClick={() => setIsEditing(true)} className="text-blue-500 hover:text-blue-700 p-2" title="Editar Item">
                <FaEdit size={20} />
              </button>
            )}
             {/* O botão de lixeira (deletar) só aparece se o usuário tiver permissão de admin */}
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