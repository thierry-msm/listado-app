// frontend/src/components/ItemRow.jsx
import { useState } from 'react';
import { FaCheckCircle, FaRegCircle, FaTrash, FaEdit, FaTimes, FaSave } from 'react-icons/fa';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ItemRow({ item, listId, onUpdate, onDelete, canMarkAsPurchased, canEditItemDetails }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(item.name);
  const [editedQuantity, setEditedQuantity] = useState(item.quantity);
  const [editedPriceLimit, setEditedPriceLimit] = useState(item.priceLimit || '');
  const [editedActualPrice, setEditedActualPrice] = useState(item.actualPrice || '');
  const [editedNotes, setEditedNotes] = useState(item.notes || '');
  const [editedCategory, setEditedCategory] = useState(item.category || '');
  const [editedPriority, setEditedPriority] = useState(item.priority || 'MEDIUM');


const handleTogglePurchased = () => {
  if (!canMarkAsPurchased) return; // Verifica permissão

  const itemId = item.id;
  const currentStatus = item.purchased;
  const updates = {};

  if (currentStatus) { // Se o item está atualmente comprado, vamos DESMARCAR
    updates.purchased = false;
    updates.purchasedBy = null; // Limpa quem comprou
    updates.purchasedAt = null; // Limpa quando comprou
    updates.actualPrice = null; // Limpa o preço real
  } else { // Se o item NÃO está comprado, vamos MARCAR
    updates.purchased = true;
    updates.actualPrice = item.actualPrice || item.priceLimit; // Mantém lógica anterior para marcar
  }

  onUpdate(itemId, updates); // Chama a função de atualização do pai
};

  const handleSaveEdit = () => {
    onUpdate(item.id, {
      name: editedName,
      quantity: parseInt(editedQuantity),
      priceLimit: editedPriceLimit ? parseFloat(editedPriceLimit) : null,
      actualPrice: editedActualPrice ? parseFloat(editedActualPrice) : null,
      notes: editedNotes,
      category: editedCategory,
      priority: editedPriority
    });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedName(item.name);
    setEditedQuantity(item.quantity);
    setEditedPriceLimit(item.priceLimit || '');
    setEditedActualPrice(item.actualPrice || '');
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
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              className="border p-1 rounded w-full"
              placeholder="Nome"
            />
            <input
              type="number"
              value={editedQuantity}
              onChange={(e) => setEditedQuantity(e.target.value)}
              className="border p-1 rounded w-full"
              min="1"
              placeholder="Quantidade"
            />
            <input
              type="number"
              value={editedPriceLimit}
              onChange={(e) => setEditedPriceLimit(e.target.value)}
              className="border p-1 rounded w-full"
              step="0.01"
              min="0"
              placeholder="Preço Sugerido"
            />
            <input
              type="number"
              value={editedActualPrice}
              onChange={(e) => setEditedActualPrice(e.target.value)}
              className="border p-1 rounded w-full"
              step="0.01"
              min="0"
              placeholder="Preço Real"
            />
            <textarea
              value={editedNotes}
              onChange={(e) => setEditedNotes(e.target.value)}
              className="border p-1 rounded w-full md:col-span-2"
              placeholder="Notas"
              rows="2"
            />
             <input
              type="text"
              value={editedCategory}
              onChange={(e) => setEditedCategory(e.target.value)}
              className="border p-1 rounded w-full"
              placeholder="Categoria"
            />
            <select
              value={editedPriority}
              onChange={(e) => setEditedPriority(e.target.value)}
              className="border p-1 rounded w-full"
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
              {item.priceLimit ? `Sugestão: R$${item.priceLimit.toFixed(2)}` : ''}
              {item.actualPrice ? ` | Real: R$${item.actualPrice.toFixed(2)}` : ''}
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
            <button onClick={handleSaveEdit} className="text-green-500 hover:text-green-700 p-2" title="Salvar">
              <FaSave size={20} />
            </button>
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
            {canEditItemDetails && (
              <button onClick={() => setIsEditing(true)} className="text-blue-500 hover:text-blue-700 p-2" title="Editar Item">
                <FaEdit size={20} />
              </button>
            )}
            {canEditItemDetails && ( // Apenas admins podem deletar (soft delete)
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