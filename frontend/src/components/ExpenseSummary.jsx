// frontend/src/components/ExpenseSummary.jsx
import { FaMoneyBillWave, FaDollarSign, FaHandHoldingUsd } from 'react-icons/fa'; // Ícones para gastos

export default function ExpenseSummary({ report }) {
  if (!report) {
    return <p className="text-center text-gray-500">Nenhum relatório de gastos disponível.</p>;
  }

  return (
    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold mb-4 text-center">Resumo de Gastos</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        {/* Caixa Total Gasto */}
        <div className="bg-white bg-opacity-20 backdrop-filter backdrop-blur-sm rounded-lg p-4 flex flex-col items-center justify-center">
          <FaMoneyBillWave size={30} className="mb-2 text-gray-800" /> {/* Ícone pode ser escuro */}
          {/* <-- ADICIONE text-gray-800 aqui */}
          <p className="text-sm font-semibold text-gray-800">Total Gasto</p>
          {/* <-- ADICIONE text-gray-800 aqui */}
          <p className="text-2xl font-bold text-gray-800">R${report.totalSpent.toFixed(2)}</p>
        </div>

        {/* Caixa Estimativa Original */}
        <div className="bg-white bg-opacity-20 backdrop-filter backdrop-blur-sm rounded-lg p-4 flex flex-col items-center justify-center">
          <FaDollarSign size={30} className="mb-2 text-gray-800" /> {/* Ícone pode ser escuro */}
          {/* <-- ADICIONE text-gray-800 aqui */}
          <p className="text-sm font-semibold text-gray-800">Estimativa Original</p>
          {/* <-- ADICIONE text-gray-800 aqui */}
          <p className="text-2xl font-bold text-gray-800">R${report.totalEstimated.toFixed(2)}</p>
        </div>

        {/* Caixa Economia */}
        <div className="bg-white bg-opacity-20 backdrop-filter backdrop-blur-sm rounded-lg p-4 flex flex-col items-center justify-center">
          <FaHandHoldingUsd size={30} className="mb-2 text-gray-800" /> {/* Ícone pode ser escuro */}
          {/* <-- ADICIONE text-gray-800 aqui */}
          <p className="text-sm font-semibold text-gray-800">Economia</p>
          {/* <-- ADICIONE text-gray-800 aqui */}
          <p className="text-2xl font-bold text-gray-800">R${report.savings.toFixed(2)}</p>
        </div>
      </div>

      {report.purchasedItems && report.purchasedItems.length > 0 && (
        <div className="mt-8">
          {/* O título 'Itens Comprados' fica bem na cor branca do container principal */}
          <h3 className="text-xl font-semibold mb-4 text-center">Itens Comprados</h3>
          <div className="max-h-60 overflow-y-auto custom-scrollbar">
            <ul className="space-y-3">
              {report.purchasedItems.map((item, index) => (
                // Os itens comprados estão dentro de caixas semi-transparentes brancas
                <li key={index} className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-sm p-3 rounded-md flex justify-between items-center">
                  <div>
                    {/* <-- ADICIONE text-gray-800 ou similar aqui e nos parágrafos abaixo */}
                    <p className="font-semibold text-gray-800">{item.name} ({item.quantity})</p>
                    <p className="text-sm opacity-80 text-gray-800">
                      Preço Real: R${item.actualPrice ? item.actualPrice.toFixed(2) : 'N/A'} |{' '}
                      Comprado por: {item.purchasedBy?.name || 'Desconhecido'}
                    </p>
                  </div>
                  {/* <-- ADICIONE text-gray-800 aqui */}
                  <span className="text-lg font-bold text-gray-800">R${(item.actualPrice * item.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}