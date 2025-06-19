// frontend/src/components/HistoryModal.jsx
import { FaTimes, FaShoppingCart, FaTrash } from 'react-icons/fa';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function HistoryModal({ history, onClose }) {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Histórico da Lista</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes size={24} />
          </button>
        </div>

        {history.length === 0 ? (
          <p className="text-gray-600 text-center">Nenhum evento no histórico ainda.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {history.map((event, index) => (
              <li key={index} className="py-4">
                <div className="flex items-start">
                  {event.type === 'ITEM_COMPRADO' && <FaShoppingCart className="text-green-500 mr-3 mt-1" size={20} />}
                  {event.type === 'ITEM_REMOVIDO' && <FaTrash className="text-red-500 mr-3 mt-1" size={20} />}
                  <div className="flex-grow">
                    <p className="font-semibold text-gray-800">
                      {event.type === 'ITEM_COMPRADO' && `"${event.itemName}" (${event.quantity}) comprado por ${event.purchasedBy}.`}
                      {event.type === 'ITEM_REMOVIDO' && `"${event.itemName}" removido.`}
                    </p>
                    {event.actualPrice && event.type === 'ITEM_COMPRADO' && (
                      <p className="text-sm text-gray-600">
                        Preço pago: R${event.actualPrice.toFixed(2)}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {format(new Date(event.timestamp), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}
                    </p>
                  </div>
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